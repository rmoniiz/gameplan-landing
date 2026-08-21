import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { inflateRawSync } from 'node:zlib';

const AUDIO_PATH = 'assets/audio/gameplan-demo-electronic.wav';
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
    musicLabel: 'Música',
    muteLabel: 'Silenciar música',
    unmuteLabel: 'Ativar música',
    volumeLabel: 'Volume da música',
  },
  {
    html: 'en.html',
    zip: 'assets/images/GamePlan_EN_60s_download.zip',
    output: 'assets/videos/gameplan-demo-en.mp4',
    lang: 'en',
    eyebrow: 'Demo',
    title: 'Inside the app',
    fallback: 'Your browser could not load the demo video.',
    musicLabel: 'Music',
    muteLabel: 'Mute music',
    unmuteLabel: 'Unmute music',
    volumeLabel: 'Music volume',
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

function generateElectronicMusicBed(path) {
  const total = SAMPLE_RATE * MUSIC_DURATION_SEC;
  const left = new Float32Array(total);
  const right = new Float32Array(total);
  const bpm = 118;
  const beat = 60 / bpm;
  const halfBeat = beat / 2;
  const quarterBeat = beat / 4;
  const bar = beat * 4;
  const progression = [
    { root: 110.0, chord: [220.0, 261.63, 329.63] },
    { root: 87.31, chord: [174.61, 220.0, 261.63] },
    { root: 130.81, chord: [261.63, 329.63, 392.0] },
    { root: 98.0, chord: [196.0, 246.94, 293.66] },
  ];
  const arpPattern = [0, 1, 2, 1, 0, 2, 1, 2, 0, 1, 2, 1, 2, 1, 0, 1];
  const frac = (value) => value - Math.floor(value);
  const noise = (index) => frac(Math.sin(index * 12.9898 + 78.233) * 43758.5453) * 2 - 1;
  const saw = (phase) => 2 * frac(phase) - 1;
  const triangle = (phase) => 1 - 4 * Math.abs(frac(phase) - 0.5);

  for (let i = 0; i < total; i += 1) {
    const t = i / SAMPLE_RATE;
    const barIndex = Math.floor(t / bar);
    const beatIndex = Math.floor(t / beat);
    const localBeat = t % beat;
    const beatNumber = beatIndex % 4;
    const chordState = progression[barIndex % progression.length];
    const section = t < 4 ? 'intro' : t < 16 ? 'build' : t < 40 ? 'drive' : t < 48 ? 'break' : t < 56 ? 'drive' : 'outro';
    const groove = section === 'intro' ? 0.45 : section === 'build' ? 0.72 : section === 'drive' ? 1 : section === 'break' ? 0.5 : 0.74;
    const drums = section === 'intro' ? 0.25 : section === 'break' ? 0.38 : section === 'outro' ? 0.58 : 1;

    const kickEnv = Math.exp(-15 * localBeat);
    const kickFreq = 96 - 48 * Math.min(1, localBeat / 0.16);
    const kick = Math.sin(2 * Math.PI * kickFreq * localBeat) * kickEnv * 0.19 * drums;
    const sidechain = 0.48 + 0.52 * Math.min(1, localBeat / 0.22);

    const rootPhase = chordState.root * t;
    const bassEnvelope = 0.8 + 0.2 * Math.exp(-5 * localBeat);
    const bass = (0.72 * Math.sin(2 * Math.PI * rootPhase) + 0.22 * Math.sin(2 * Math.PI * rootPhase * 2) + 0.06 * triangle(rootPhase * 0.5)) * 0.085 * groove * bassEnvelope * sidechain;

    let padL = 0;
    let padR = 0;
    for (let note = 0; note < chordState.chord.length; note += 1) {
      const frequency = chordState.chord[note];
      const phase = frequency * t;
      const detune = 1 + (note - 1) * 0.0018;
      padL += Math.sin(2 * Math.PI * phase) + 0.18 * saw(phase * 0.5 + note * 0.17);
      padR += Math.sin(2 * Math.PI * phase * detune + 0.28) + 0.18 * saw(phase * 0.5 + 0.11 + note * 0.13);
    }
    const padLevel = section === 'break' ? 0.042 : 0.031;
    padL *= padLevel * groove * sidechain;
    padR *= padLevel * groove * sidechain;

    const arpStep = Math.floor((t % bar) / quarterBeat) % 16;
    const arpLocal = t % quarterBeat;
    const arpEnv = Math.exp(-10 * arpLocal);
    const arpFreq = chordState.chord[arpPattern[arpStep]] * (arpStep % 4 === 3 ? 2 : 1);
    const arpPhase = arpFreq * t;
    const arpTone = (0.7 * triangle(arpPhase) + 0.3 * Math.sin(2 * Math.PI * arpPhase)) * arpEnv;
    const pan = 0.5 + 0.38 * Math.sin((arpStep / 16) * Math.PI * 2);
    const arpLevel = section === 'intro' ? 0.012 : section === 'break' ? 0.018 : 0.032;
    const arpL = arpTone * arpLevel * groove * (1 - pan * 0.5);
    const arpR = arpTone * arpLevel * groove * (0.5 + pan * 0.5);

    let snare = 0;
    if ((beatNumber === 1 || beatNumber === 3) && localBeat < 0.16) {
      const env = Math.exp(-24 * localBeat);
      snare = (noise(i) * 0.72 + Math.sin(2 * Math.PI * 180 * localBeat) * 0.28) * env * 0.055 * drums;
    }

    const halfLocal = t % halfBeat;
    const halfIndex = Math.floor(t / halfBeat);
    let hat = 0;
    if (halfLocal < 0.065) {
      const env = Math.exp(-62 * halfLocal);
      const accent = halfIndex % 2 === 1 ? 1 : 0.58;
      hat = noise(i * 3 + 17) * env * 0.018 * drums * accent;
    }

    let tick = 0;
    const sixteenthLocal = t % quarterBeat;
    if (sixteenthLocal < 0.025 && section === 'drive') tick = noise(i * 5 + 23) * Math.exp(-95 * sixteenthLocal) * 0.007;

    const eightBarPhase = (t % (bar * 8)) / (bar * 8);
    const riser = section === 'drive' && eightBarPhase > 0.82 ? noise(i * 7 + 31) * Math.pow((eightBarPhase - 0.82) / 0.18, 2) * 0.012 : 0;

    let fade = 1;
    if (t < 1.5) fade *= t / 1.5;
    if (t > MUSIC_DURATION_SEC - 3.5) fade *= Math.max(0, (MUSIC_DURATION_SEC - t) / 3.5);

    const common = kick + bass + snare + hat + tick + riser;
    left[i] = Math.tanh((common + padL + arpL) * 1.8) * 0.72 * fade;
    right[i] = Math.tanh((common + padR + arpR) * 1.8) * 0.72 * fade;
  }

  writeWavStereo16(path, left, right, SAMPLE_RATE);
}

function buildAudioControl(config) {
  return `<div class="demo-audio-control" data-demo-audio-control data-mute-label="${config.muteLabel}" data-unmute-label="${config.unmuteLabel}">
    <button type="button" class="demo-audio-mute" data-demo-audio-mute aria-label="${config.muteLabel}" aria-pressed="false">
      <span class="demo-audio-icon" data-demo-audio-icon aria-hidden="true">🔉</span>
      <span class="demo-audio-label">${config.musicLabel}</span>
    </button>
    <input class="demo-audio-volume" data-demo-audio-volume type="range" min="0" max="100" step="1" value="28" aria-label="${config.volumeLabel}" />
    <output class="demo-audio-value" data-demo-audio-value>28%</output>
  </div>`;
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
    const cleaned = attrs.replace(/\s*class="[^"]*"/g, '').replace(/\s*data-playback-rate="[^"]*"/g, '').replace(/\s*data-demo-language="[^"]*"/g, '').trim();
    return `<video class="gameplan-demo-video" data-demo-language="${config.lang}" ${cleaned}>`;
  });
  section = section.replace(/<source\s+src="[^"]*"\s+type="video\/mp4"\s*\/?>/, `<source src="${config.output}" type="video/mp4" />`);
  section = section.replace(/(?:Seu navegador não conseguiu carregar o vídeo de demonstração\.|Your browser could not load the demo video\.)/, config.fallback);
  section = section.replace(/<\/video>/, `</video><audio class="gameplan-demo-audio" preload="metadata" aria-hidden="true" src="${AUDIO_PATH}"></audio>${buildAudioControl(config)}`);

  let transformed = html.replace(sectionPattern, section);
  transformed = transformed.replace(/\s*<script id="gameplan-demo-speed">[\s\S]*?<\/script>/, '');
  transformed = transformed.replace(/\s*<script src="landing-latest-connection\.js"><\/script>/, '');
  transformed = transformed.replace(/\s*<script src="demo-playback\.js"><\/script>/, '');
  const mainScriptPattern = /\s*<script src="script\.js"><\/script>/;
  if (!mainScriptPattern.test(transformed)) throw new Error(`Main script tag not found in ${config.html}`);
  transformed = transformed.replace(mainScriptPattern, '\n  <script src="script.js"></script>\n  <script src="landing-latest-connection.js"></script>\n  <script src="demo-playback.js"></script>');
  return transformed;
}

generateElectronicMusicBed(AUDIO_PATH);

for (const demo of demos) {
  extractSingleFileZip(demo.zip, demo.output);
  const html = readFileSync(demo.html, 'utf8');
  writeFileSync(demo.html, transformDemoSection(html, demo), 'utf8');
}

console.log('[landing-demo] PT-BR/EN videos preserved; electronic sports-tech music generated; music volume control added; paced playback and latest connected-flow presentation preserved.');
