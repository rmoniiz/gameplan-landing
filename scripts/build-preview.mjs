import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const TRACK_URL = 'https://assets.mixkit.co/music/1077/1077.mp3';
const TRACK_PATH = join(ROOT, '.tmp-sounds-good.mp3');
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

  const energyCurve = [
    'if(lt(t,0.5),0.10,',
    'if(lt(t,7),0.10+(t-0.5)*(0.65/6.5),',
    'if(lt(t,38),0.75,',
    'if(lt(t,44),0.75-(t-38)*(0.12/6),',
    'if(lt(t,45),0.63+(t-44)*0.14,',
    'if(lt(t,57),0.77+(t-45)*(0.10/12),0.87))))))',
  ].join('');

  const filter = [
    '[1:a]atrim=start=0:end=60,asetpts=PTS-STARTPTS',
    'highpass=f=35',
    'lowpass=f=16500',
    'loudnorm=I=-16.8:TP=-1.5:LRA=7',
    `volume='${energyCurve}':eval=frame`,
    'afade=t=in:st=0:d=7',
    'afade=t=out:st=57.2:d=2.8[aout]'
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
console.log('[gameplan-landing] Preview built with the approved landing layout unchanged and the lighter Mixkit Sounds Good soundtrack embedded in both localized MP4s.');
