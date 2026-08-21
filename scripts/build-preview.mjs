import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const TRACK_URL = 'https://assets.mixkit.co/music/124/124.mp3';
const TRACK_PATH = join(ROOT, '.tmp-techno-fest-vibes.mp3');
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
  const response = await fetch(TRACK_URL, { redirect: 'follow' });
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
    "[1:a]atrim=0:60,asetpts=PTS-STARTPTS",
    "volume='if(lt(t,1.5),0.08,if(lt(t,7),0.08+(t-1.5)*(0.42/5.5),0.50))':eval=frame",
    'afade=t=out:st=57.5:d=2.5',
    'loudnorm=I=-18:TP=-1.5:LRA=7[aout]'
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
console.log('[gameplan-landing] Preview built with exact approved connected-flow layout and Techno Fest Vibes soundtrack.');
