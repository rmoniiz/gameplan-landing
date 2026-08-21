import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { inflateRawSync } from 'node:zlib';

const AUDIO_PATH = 'assets/audio/gameplan-demo-tech-house.wav';
const SAMPLE_RATE = 24000;
const MUSIC_DURATION_SEC = 60;

const demos = [
  {
    html: 'index.html',
    zip: 'assets/images/GamePlan_PT-BR_60s_download.zip',
    output: 'assets/videos/gameplan-demo-ptbr.mp4',
    lang: 'ptbr',
    eyebrow: 'Demonstração',
    title: 'Por dentro do app',
    fallback: 'Seu navegador não conseguiu carregar o vídeo de demonstração.',
  },
  {
    html: 'en.html',
    zip: 'assets/images/GamePlan_EN_60s_download.zip',
    output: 'assets/videos/gameplan-demo-en.mp4',
    lang: 'en',
    eyebrow: 'Demo',
    title: 'Inside the app',
    fallback: 'Your browser could not load the demo video.',
  },
];

function extractSingleFileZip(zipPath, outputPath) {
  const zip = readFileSync(zipPath);
  if (zip.readUInt32LE(0) !== 0x04034b50) throw new Error(`Invalid ZIP local header: ${zipPath}`);
  const flags = zip.readUInt16LE(6);
  const method = zip.readUInt16LE(8);
  const compressedSize = zip.readUInt32LE(18);
  const filenameLength = zip.readUInt16LE(26);
  const extraLength = zip.readUInt16LE(28);
  if (flags & 0x08) throw new Error(`ZIP data descriptor is not supported for ${zipPath}`);

  const dataStart = 30 + filenameLength + extraLength;
  const compressed = zip.subarray(dataStart, dataStart + compressedSize);
  let file;

  if (method === 0) file = compressed;
  else if (method === 8) file = inflateRawSync(compressed);
  else throw new Error(`Unsupported ZIP compression method ${method} in ${zipPath}`);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, file);
}

function writeWavStereo16(path, left, right, sampleRate) {
  if (left.length !== right.length) throw new Error('Stereo channels must have the same length.');

  const channels = 2;
  const bytesPerSample = 2;
  const dataSize = left.length * channels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
  buffer.writeUInt16LE(channels * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < left.length; i += 1) {
    const offset = 44 + i * 4;
    const leftSample = Math.max(-1, Math.min(1, left[i]));
    const rightSample = Math.max(-1, Math.min(1, right[i]));
    buffer.writeInt16LE(Math.round(leftSample * 32767), offset);
    buffer.writeInt16LE(Math.round(rightSample * 32767), offset + 2);
  }

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buffer);
}

function generateTechHouseMusicBed(path) {
  const total = SAMPLE_RATE * MUSIC_DURATION_SEC;
  const left = new Float32Array(total);
  const right = new Float32Array(total);
  const bpm = 126;
  const beat = 60 / bpm;
  const eighth = beat / 2;
  const sixteenth = beat / 4;
  const bar = beat * 4;
  const roots = [87.31, 87.31, 98.0, 82.41];
  const bassPattern = [false, true, false, true, false, true, true, false];

  const frac = (value) => value - Math.floor(value);
  const noise = (index) => frac(Math.sin(index * 12.9898 + 78.233) * 43758.5453) * 2 - 1;
  const saw = (phase) => 2 * frac(phase) - 1;
  const triangle = (phase) => 1 - 4 * Math.abs(frac(phase) - 0.5);

  for (let i = 0; i < total; i += 1) {
    const t = i / SAMPLE_RATE;
    const barIndex = Math.floor(t / bar);
    const beatIndex = Math.floor(t / beat);
    const beatInBar = beatIndex % 4;
    const beatLocal = t % beat;
    const eighthIndex = Math.floor(t / eighth) % 8;
    const eighthLocal = t % eighth;
    const sixteenthIndex = Math.floor(t / sixteenth) % 16;
    const sixteenthLocal = t % sixteenth;
    const root = roots[barIndex % roots.length];

    const section = t < 4 ? 'intro' : t < 8 ? 'lift' : t < 28 ? 'drop1' : t < 34 ? 'break' : t < 54 ? 'drop2' : 'outro';
    const isDrop = section === 'drop1' || section === 'drop2';
    const kickLevel = section === 'intro' ? 0.58 : section === 'lift' ? 0.88 : section === 'break' ? 0.12 : section === 'outro' ? 0.72 : 1;
    const grooveLevel = section === 'intro' ? 0.32 : section === 'lift' ? 0.68 : section === 'break' ? 0.22 : section === 'outro' ? 0.62 : 1;

    const kickEnv = Math.exp(-18 * beatLocal);
    const kickFreq = 118 - 70 * Math.min(1, beatLocal / 0.145);
    const kickBody = Math.sin(2 * Math.PI * kickFreq * beatLocal) * kickEnv;
    const kickClick = beatLocal < 0.012 ? noise(i * 11 + 7) * Math.exp(-260 * beatLocal) * 0.16 : 0;
    const kick = (kickBody * 0.29 + kickClick) * kickLevel;

    const sidechain = 0.28 + 0.72 * Math.min(1, beatLocal / 0.17);

    let bass = 0;
    if (bassPattern[eighthIndex] && section !== 'break') {
      const bassEnv = Math.exp(-9.5 * eighthLocal);
      const noteFrequency = root * (eighthIndex === 6 ? 2 : 1);
      const phase = noteFrequency * eighthLocal;
      bass = (
        0.66 * Math.sin(2 * Math.PI * phase)
        + 0.24 * triangle(phase)
        + 0.10 * saw(phase * 0.5)
      ) * bassEnv * 0.135 * grooveLevel * sidechain;
    }

    let clap = 0;
    if ((beatInBar === 1 || beatInBar === 3) && beatLocal < 0.12 && section !== 'intro') {
      const clapEnv = Math.exp(-30 * beatLocal);
      const body = Math.sin(2 * Math.PI * 205 * beatLocal) * 0.24;
      clap = (noise(i * 5 + 19) * 0.76 + body) * clapEnv * 0.071 * (section === 'break' ? 0.34 : 1);
    }

    let closedHat = 0;
    if (sixteenthLocal < 0.038 && section !== 'break') {
      const hatEnv = Math.exp(-90 * sixteenthLocal);
      const accent = sixteenthIndex % 4 === 2 ? 1 : sixteenthIndex % 2 === 1 ? 0.72 : 0.42;
      closedHat = noise(i * 7 + 31) * hatEnv * 0.021 * accent * grooveLevel;
    }

    let openHat = 0;
    if (eighthIndex % 2 === 1 && eighthLocal < 0.105 && section !== 'intro' && section !== 'break') {
      const openEnv = Math.exp(-24 * eighthLocal);
      openHat = noise(i * 13 + 47) * openEnv * 0.024 * grooveLevel;
    }

    const stabHit = (eighthIndex === 3 || eighthIndex === 7) && eighthLocal < 0.13;
    let stabL = 0;
    let stabR = 0;
    if (stabHit && section !== 'intro') {
      const stabEnv = Math.exp(-18 * eighthLocal);
      const chordRoot = root * 2;
      const minorThird = chordRoot * Math.pow(2, 3 / 12);
      const fifth = chordRoot * Math.pow(2, 7 / 12);
      const frequencies = [chordRoot, minorThird, fifth];
      let toneL = 0;
      let toneR = 0;
      frequencies.forEach((frequency, noteIndex) => {
        const phase = frequency * eighthLocal;
        toneL += 0.55 * saw(phase + noteIndex * 0.11) + 0.45 * Math.sin(2 * Math.PI * phase);
        toneR += 0.55 * saw(phase + 0.05 + noteIndex * 0.09) + 0.45 * Math.sin(2 * Math.PI * phase + 0.2);
      });
      const level = section === 'break' ? 0.018 : section === 'lift' ? 0.028 : 0.047;
      stabL = toneL * stabEnv * level * sidechain;
      stabR = toneR * stabEnv * level * sidechain;
    }

    let hookL = 0;
    let hookR = 0;
    if (section === 'drop2' && sixteenthIndex % 8 === 5 && sixteenthLocal < 0.09) {
      const hookEnv = Math.exp(-20 * sixteenthLocal);
      const hookFrequency = root * (sixteenthIndex % 16 === 5 ? 4 : 3);
      const hookPhase = hookFrequency * sixteenthLocal;
      const hook = (0.62 * triangle(hookPhase) + 0.38 * Math.sin(2 * Math.PI * hookPhase)) * hookEnv * 0.025;
      hookL = hook * 0.76;
      hookR = hook;
    }

    let breakPadL = 0;
    let breakPadR = 0;
    if (section === 'break') {
      const padSidechain = 0.68 + 0.32 * Math.min(1, beatLocal / 0.23);
      const frequencies = [root * 2, root * 2 * Math.pow(2, 3 / 12), root * 2 * Math.pow(2, 7 / 12)];
      frequencies.forEach((frequency, noteIndex) => {
        breakPadL += Math.sin(2 * Math.PI * frequency * t + noteIndex * 0.28);
        breakPadR += Math.sin(2 * Math.PI * frequency * t + 0.23 + noteIndex * 0.24);
      });
      breakPadL *= 0.021 * padSidechain;
      breakPadR *= 0.021 * padSidechain;
    }

    const fourBarPhase = (t % (bar * 4)) / (bar * 4);
    const eightBarPhase = (t % (bar * 8)) / (bar * 8);
    let riser = 0;
    if ((section === 'lift' || (isDrop && eightBarPhase > 0.88)) && fourBarPhase > 0.68) {
      const rise = (fourBarPhase - 0.68) / 0.32;
      riser = noise(i * 17 + 61) * rise * rise * 0.016;
    }

    let impact = 0;
    const sectionBeat = t % (bar * 4);
    if ((Math.abs(t - 8) < beat || Math.abs(t - 34) < beat) && sectionBeat < 0.35) {
      impact = noise(i * 23 + 71) * Math.exp(-9 * sectionBeat) * 0.028;
    }

    let fade = 1;
    if (t < 1.2) fade *= t / 1.2;
    if (t > MUSIC_DURATION_SEC - 3.2) fade *= Math.max(0, (MUSIC_DURATION_SEC - t) / 3.2);

    const common = kick + bass + clap + closedHat + openHat + riser + impact;
    left[i] = Math.tanh((common + stabL + hookL + breakPadL) * 2.15) * 0.86 * fade;
    right[i] = Math.tanh((common + stabR + hookR + breakPadR) * 2.15) * 0.86 * fade;
  }

  writeWavStereo16(path, left, right, SAMPLE_RATE);
}

function transformDemoSection(html, config) {
  const sectionPattern = /<section id="demo"[\s\S]*?<\/section>/;
  const sectionMatch = html.match(sectionPattern);
  if (!sectionMatch) throw new Error(`Demo section not found in ${config.html}`);

  let section = sectionMatch[0];
  section = section.replace(/<div class="eyebrow">[\s\S]*?<\/div>/, `<div class="eyebrow">${config.eyebrow}</div>`);
  section = section.replace(/<h2>[\s\S]*?<\/h2>/, `<h2>${config.title}</h2>`);
  section = section.replace(/\s*<div class="demo-duration">[\s\S]*?<\/div>/, '');
  section = section.replace(/\s*<div class="demo-audio-control"[\s\S]*?<\/div>/, '');
  section = section.replace(/\s*<audio class="gameplan-demo-audio"[^>]*><\/audio>/, '');
  section = section.replace(/<video\s+([^>]*)>/, (_match, attrs) => {
    const cleaned = attrs
      .replace(/\s*class="[^"]*"/g, '')
      .replace(/\s*data-playback-rate="[^"]*"/g, '')
      .replace(/\s*data-demo-language="[^"]*"/g, '')
      .trim();
    return `<video class="gameplan-demo-video" data-demo-language="${config.lang}" ${cleaned}>`;
  });
  section = section.replace(/<source\s+src="[^"]*"\s+type="video\/mp4"\s*\/?>/, `<source src="${config.output}" type="video/mp4" />`);
  section = section.replace(/(?:Seu navegador não conseguiu carregar o vídeo de demonstração\.|Your browser could not load the demo video\.)/, config.fallback);
  section = section.replace(/<\/video>/, `</video><audio class="gameplan-demo-audio" preload="metadata" aria-hidden="true" src="${AUDIO_PATH}"></audio>`);

  let transformed = html.replace(sectionPattern, section);
  transformed = transformed.replace(/\s*<script id="gameplan-demo-speed">[\s\S]*?<\/script>/, '');
  transformed = transformed.replace(/\s*<script src="landing-latest-connection\.js"><\/script>/, '');
  transformed = transformed.replace(/\s*<script src="demo-playback\.js"><\/script>/, '');
  const mainScriptPattern = /\s*<script src="script\.js"><\/script>/;
  if (!mainScriptPattern.test(transformed)) throw new Error(`Main script tag not found in ${config.html}`);
  transformed = transformed.replace(
    mainScriptPattern,
    '\n  <script src="script.js"></script>\n  <script src="landing-latest-connection.js"></script>\n  <script src="demo-playback.js"></script>',
  );
  return transformed;
}

generateTechHouseMusicBed(AUDIO_PATH);

for (const demo of demos) {
  extractSingleFileZip(demo.zip, demo.output);
  const html = readFileSync(demo.html, 'utf8');
  writeFileSync(demo.html, transformDemoSection(html, demo), 'utf8');
}

console.log('[landing-demo] PT-BR/EN videos preserved; original 126 BPM tech-house bed generated; native video volume controls the music; custom audio bar removed; paced playback and latest connected-flow presentation preserved.');
