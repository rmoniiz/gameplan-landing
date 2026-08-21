import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { inflateRawSync } from 'node:zlib';

const AUDIO_PATH = 'assets/audio/gameplan-demo-bed.wav';
const SAMPLE_RATE = 16000;
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
  if (zip.readUInt32LE(0) !== 0x04034b50) {
    throw new Error(`Invalid ZIP local header: ${zipPath}`);
  }

  const flags = zip.readUInt16LE(6);
  const method = zip.readUInt16LE(8);
  const compressedSize = zip.readUInt32LE(18);
  const filenameLength = zip.readUInt16LE(26);
  const extraLength = zip.readUInt16LE(28);

  if (flags & 0x08) {
    throw new Error(`ZIP data descriptor is not supported for ${zipPath}`);
  }

  const dataStart = 30 + filenameLength + extraLength;
  const compressed = zip.subarray(dataStart, dataStart + compressedSize);
  let file;

  if (method === 0) file = compressed;
  else if (method === 8) file = inflateRawSync(compressed);
  else throw new Error(`Unsupported ZIP compression method ${method} in ${zipPath}`);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, file);
}

function writeWavMono16(path, samples, sampleRate) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buffer);
}

function generateOriginalMusicBed(path) {
  const total = SAMPLE_RATE * MUSIC_DURATION_SEC;
  const samples = new Float32Array(total);
  const bpm = 96;
  const beat = 60 / bpm;
  const bar = beat * 4;
  const chords = [
    [220.0, 261.63, 329.63],
    [174.61, 220.0, 261.63],
    [261.63, 329.63, 392.0],
    [196.0, 246.94, 293.66],
  ];
  const arp = [0, 1, 2, 1, 0, 2, 1, 2];

  const frac = (value) => value - Math.floor(value);
  const noise = (index) => frac(Math.sin(index * 12.9898 + 78.233) * 43758.5453) * 2 - 1;

  for (let i = 0; i < total; i += 1) {
    const t = i / SAMPLE_RATE;
    const barIndex = Math.floor(t / bar);
    const chord = chords[barIndex % chords.length];
    const barPhase = (t % bar) / bar;

    let sample = 0;
    const padEnvelope = 0.72 + 0.28 * Math.sin(Math.PI * Math.min(1, barPhase * 1.15));
    for (const frequency of chord) {
      sample += 0.022 * padEnvelope * Math.sin(2 * Math.PI * (frequency / 2) * t);
      sample += 0.009 * padEnvelope * Math.sin(2 * Math.PI * frequency * t + 0.6);
    }

    const halfBeat = beat / 2;
    const stepIndex = Math.floor((t % bar) / halfBeat) % 8;
    const stepPhase = (t % halfBeat) / halfBeat;
    const arpFrequency = chord[arp[stepIndex]] * ([3, 7].includes(stepIndex) ? 2 : 1);
    const arpEnvelope = Math.exp(-4.2 * stepPhase);
    sample += 0.018 * arpEnvelope * Math.sin(2 * Math.PI * arpFrequency * t + 0.25);

    const beatPhase = (t % beat) / beat;
    const beatIndex = Math.floor(t / beat) % 4;
    const kickEnvelope = Math.exp(-18 * beatPhase * beat);
    const kickFrequency = 62 - 24 * Math.min(1, (beatPhase * beat) / 0.18);
    const kickAmp = beatIndex === 0 || beatIndex === 2 ? 0.06 : 0.032;
    sample += kickAmp * kickEnvelope * Math.sin(2 * Math.PI * kickFrequency * (beatPhase * beat));

    const halfPhaseSec = t % halfBeat;
    if (halfPhaseSec < 0.045 && stepIndex % 2 === 1) {
      const hatEnvelope = Math.exp(-70 * halfPhaseSec);
      sample += 0.006 * hatEnvelope * noise(i);
    }

    let fade = 1;
    if (t < 2) fade *= t / 2;
    if (t > MUSIC_DURATION_SEC - 4) fade *= Math.max(0, (MUSIC_DURATION_SEC - t) / 4);
    samples[i] = Math.tanh(sample * 2.2) * 0.42 * fade;
  }

  writeWavMono16(path, samples, SAMPLE_RATE);
}

function transformDemoSection(html, config) {
  const sectionPattern = /<section id="demo"[\s\S]*?<\/section>/;
  const sectionMatch = html.match(sectionPattern);
  if (!sectionMatch) throw new Error(`Demo section not found in ${config.html}`);

  let section = sectionMatch[0];
  section = section.replace(/<div class="eyebrow">[\s\S]*?<\/div>/, `<div class="eyebrow">${config.eyebrow}</div>`);
  section = section.replace(/<h2>[\s\S]*?<\/h2>/, `<h2>${config.title}</h2>`);
  section = section.replace(/\s*<div class="demo-duration">[\s\S]*?<\/div>/, '');
  section = section.replace(
    /<video\s+([^>]*)>/,
    (_match, attrs) => {
      const cleaned = attrs
        .replace(/\s*class="[^"]*"/g, '')
        .replace(/\s*data-playback-rate="[^"]*"/g, '')
        .replace(/\s*data-demo-language="[^"]*"/g, '')
        .trim();
      return `<video class="gameplan-demo-video" data-demo-language="${config.lang}" ${cleaned}>`;
    },
  );
  section = section.replace(
    /<source\s+src="[^"]*"\s+type="video\/mp4"\s*\/?>/,
    `<source src="${config.output}" type="video/mp4" />`,
  );
  section = section.replace(
    /(?:Seu navegador não conseguiu carregar o vídeo de demonstração\.|Your browser could not load the demo video\.)/,
    config.fallback,
  );

  section = section.replace(/\s*<audio class="gameplan-demo-audio"[\s\S]*?<\/audio>/, '');
  section = section.replace(
    /<\/video>/,
    `</video><audio class="gameplan-demo-audio" preload="metadata" aria-hidden="true" src="${AUDIO_PATH}"></audio>`,
  );

  let transformed = html.replace(sectionPattern, section);
  transformed = transformed.replace(/\s*<script id="gameplan-demo-speed">[\s\S]*?<\/script>/, '');
  transformed = transformed.replace(/\s*<script src="landing-latest-connection\.js"><\/script>/, '');
  transformed = transformed.replace(/\s*<script src="demo-playback\.js"><\/script>/, '');

  const mainScriptPattern = /\s*<script src="script\.js"><\/script>/;
  if (!mainScriptPattern.test(transformed)) {
    throw new Error(`Main script tag not found in ${config.html}`);
  }
  transformed = transformed.replace(
    mainScriptPattern,
    '\n  <script src="script.js"></script>\n  <script src="landing-latest-connection.js"></script>\n  <script src="demo-playback.js"></script>',
  );

  return transformed;
}

generateOriginalMusicBed(AUDIO_PATH);

for (const demo of demos) {
  extractSingleFileZip(demo.zip, demo.output);
  const html = readFileSync(demo.html, 'utf8');
  writeFileSync(demo.html, transformDemoSection(html, demo), 'utf8');
}

console.log('[landing-demo] Latest connected-flow presentation preserved; PT-BR/EN videos extracted; original background music generated; demo duration badge removed; paced playback enabled.');
