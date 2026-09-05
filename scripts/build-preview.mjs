import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const TRACK_URL = 'https://assets.mixkit.co/music/1077/1077.mp3';
const TRACK_PATH = join(ROOT, '.tmp-sounds-good.mp3');
const VIDEO_FILES = [
  { video: 'assets/videos/gameplan-demo-ptbr.mp4', pacing: 'scripts/demo-pacing-ptbr.json' },
  { video: 'assets/videos/gameplan-demo-en.mp4', pacing: 'scripts/demo-pacing-en.json' },
];

const excludedTopLevel = new Set(['.git', '.vercel', 'dist', 'node_modules']);

function copyProject() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
  for (const entry of readdirSync(ROOT)) {
    if (excludedTopLevel.has(entry)) continue;
    if (entry === 'package.json' || entry === 'package-lock.json' || entry === 'vercel.json') continue;
    cpSync(join(ROOT, entry), join(DIST, entry), { recursive: true });
  }
}

async function downloadTrack() {
  const response = await fetch(TRACK_URL, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0 GamePlan Preview Builder' },
  });
  if (!response.ok) throw new Error(`Could not download soundtrack: ${response.status} ${response.statusText}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 100_000) throw new Error(`Downloaded soundtrack is unexpectedly small: ${bytes.length} bytes`);
  writeFileSync(TRACK_PATH, bytes);
}

function buildReadablePacingFilter(pacingPath) {
  const originalSchedule = JSON.parse(readFileSync(join(ROOT, pacingPath), 'utf8'));
  let currentTime = 0;
  const segments = originalSchedule.map((segment, index) => {
    const rawDuration = segment.end - segment.start;
    const currentDuration = rawDuration / segment.rate;
    const inputStart = currentTime;
    const inputEnd = currentTime + currentDuration;
    currentTime = inputEnd;
    // The source MP4 already contains the original pacing. Undo only the >1x speed-ups;
    // intentional 0.5x pauses stay untouched so the coach has time to read key screens.
    const setPtsFactor = segment.rate > 1 ? segment.rate : 1;
    return { index, inputStart, inputEnd, setPtsFactor, outputDuration: currentDuration * setPtsFactor };
  });

  const videoFilters = segments.map(({ index, inputStart, inputEnd, setPtsFactor }) =>
    `[0:v]trim=start=${inputStart.toFixed(6)}:end=${inputEnd.toFixed(6)},setpts=(PTS-STARTPTS)*${setPtsFactor.toFixed(10)}[v${index}]`
  );
  const concatInputs = segments.map(({ index }) => `[v${index}]`).join('');
  const finalDuration = segments.reduce((sum, segment) => sum + segment.outputDuration, 0);
  videoFilters.push(`${concatInputs}concat=n=${segments.length}:v=1:a=0[vout]`);
  return { videoFilters, finalDuration };
}

function renderVideo({ video: relativePath, pacing }) {
  const input = join(ROOT, relativePath);
  const output = join(DIST, relativePath);
  if (!existsSync(input)) throw new Error(`Missing source video: ${relativePath}`);
  mkdirSync(join(output, '..'), { recursive: true });

  const { videoFilters, finalDuration } = buildReadablePacingFilter(pacing);
  const fadeOutStart = Math.max(0, finalDuration - 2.8);
  const energyCurve = [
    'if(lt(t,1.5),0.02,',
    'if(lt(t,10),0.02+(t-1.5)*(0.73/8.5),',
    'if(lt(t,44),0.75,',
    'if(lt(t,50),0.75-(t-44)*(0.12/6),',
    `if(lt(t,${Math.max(51, finalDuration - 3).toFixed(2)}),0.72,0.82)))))`,
  ].join('');

  const audioFilter = [
    `[1:a]atrim=start=0:end=${finalDuration.toFixed(6)},asetpts=PTS-STARTPTS`,
    'highpass=f=35',
    'lowpass=f=16500',
    'loudnorm=I=-16.8:TP=-1.5:LRA=7',
    `volume='${energyCurve}':eval=frame`,
    'afade=t=in:st=0:d=10',
    `afade=t=out:st=${fadeOutStart.toFixed(3)}:d=2.8[aout]`,
  ].join(',');

  const filter = [...videoFilters, audioFilter].join(';');
  execFileSync(ffmpegPath, [
    '-y',
    '-i', input,
    '-stream_loop', '-1', '-i', TRACK_PATH,
    '-filter_complex', filter,
    '-map', '[vout]', '-map', '[aout]',
    '-t', finalDuration.toFixed(6),
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
    '-movflags', '+faststart',
    output,
  ], { stdio: 'inherit' });

  console.log(`[gameplan-landing] ${relativePath}: readable pacing rendered at ${finalDuration.toFixed(2)}s with soundtrack kept at normal tempo.`);
}

copyProject();
await downloadTrack();
for (const video of VIDEO_FILES) renderVideo(video);
rmSync(TRACK_PATH, { force: true });
console.log('[gameplan-landing] Preview built with stable landing motion and readable demo pacing; native video volume remains available.');