import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const TRACK_URL = 'https://assets.mixkit.co/music/130/130.mp3';
const TRACK_PATH = join(ROOT, '.tmp-tech-house-vibes.mp3');
const SOURCE_BPM = 130;
const TARGET_BPM = 126;
const TEMPO_RATIO = TARGET_BPM / SOURCE_BPM;
const VIDEO_FILES = [
  'assets/videos/gameplan-demo-ptbr.mp4',
  'assets/videos/gameplan-demo-en.mp4',
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

function renderVideo(relativePath) {
  const input = join(ROOT, relativePath);
  const output = join(DIST, relativePath);
  if (!existsSync(input)) throw new Error(`Missing source video: ${relativePath}`);
  mkdirSync(join(output, '..'), { recursive: true });

  const filter = [
    `[1:a]atrim=start=0:end=64,asetpts=PTS-STARTPTS,atempo=${TEMPO_RATIO.toFixed(6)}`,
    "volume='if(lt(t,1),0.045,if(lt(t,7.5),0.045+(t-1)*(0.275/6.5),0.32))':eval=frame",
    'afade=t=in:st=0:d=7.5',
    'afade=t=out:st=57.5:d=2.5',
    'loudnorm=I=-20:TP=-1.5:LRA=7[aout]'
  ].join(',');

  execFileSync(ffmpegPath, [
    '-y',
    '-i', input,
    '-stream_loop', '-1', '-i', TRACK_PATH,
    '-filter_complex', filter,
    '-map', '0:v:0', '-map', '[aout]',
    '-t', '60',
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
    '-movflags', '+faststart',
    output,
  ], { stdio: 'inherit' });
}

copyProject();
await downloadTrack();
for (const video of VIDEO_FILES) renderVideo(video);
rmSync(TRACK_PATH, { force: true });
console.log('[gameplan-landing] Preview built with the approved horizontal connected-flow layout and a restrained 126 BPM Tech House vibes soundtrack.');
