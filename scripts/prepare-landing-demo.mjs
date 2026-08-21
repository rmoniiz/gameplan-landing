import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { inflateRawSync } from 'node:zlib';

const demos = [
  {
    html: 'index.html',
    zip: 'assets/images/GamePlan_PT-BR_60s_download.zip',
    output: 'assets/videos/gameplan-demo-ptbr.mp4',
    eyebrow: 'Demonstração',
    title: 'Por dentro do app',
    fallback: 'Seu navegador não conseguiu carregar o vídeo de demonstração.',
  },
  {
    html: 'en.html',
    zip: 'assets/images/GamePlan_EN_60s_download.zip',
    output: 'assets/videos/gameplan-demo-en.mp4',
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

function transformDemoSection(html, config) {
  const sectionPattern = /<section id="demo"[\s\S]*?<\/section>/;
  const sectionMatch = html.match(sectionPattern);
  if (!sectionMatch) throw new Error(`Demo section not found in ${config.html}`);

  let section = sectionMatch[0];
  section = section.replace(/<div class="eyebrow">[\s\S]*?<\/div>/, `<div class="eyebrow">${config.eyebrow}</div>`);
  section = section.replace(/<h2>[\s\S]*?<\/h2>/, `<h2>${config.title}</h2>`);
  section = section.replace(
    /<video\s+([^>]*)>/,
    (_match, attrs) => {
      const cleaned = attrs
        .replace(/\s*class="[^"]*"/g, '')
        .replace(/\s*data-playback-rate="[^"]*"/g, '')
        .trim();
      return `<video class="gameplan-demo-video" data-playback-rate="0.5" ${cleaned}>`;
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

  let transformed = html.replace(sectionPattern, section);
  const speedScript = `  <script id="gameplan-demo-speed">\n    (() => {\n      const RATE = 0.5;\n      const applyRate = (video) => {\n        video.defaultPlaybackRate = RATE;\n        if (Math.abs(video.playbackRate - RATE) > 0.001) video.playbackRate = RATE;\n      };\n      document.querySelectorAll('.gameplan-demo-video').forEach((video) => {\n        applyRate(video);\n        video.addEventListener('loadedmetadata', () => applyRate(video));\n        video.addEventListener('ratechange', () => applyRate(video));\n      });\n    })();\n  <\/script>`;

  transformed = transformed.replace(/\s*<script id="gameplan-demo-speed">[\s\S]*?<\/script>/, '');
  const mainScriptPattern = /\s*<script src="script\.js"><\/script>/;
  if (!mainScriptPattern.test(transformed)) {
    throw new Error(`Main script tag not found in ${config.html}`);
  }
  transformed = transformed.replace(mainScriptPattern, `\n${speedScript}\n  <script src="script.js"></script>`);

  return transformed;
}

for (const demo of demos) {
  extractSingleFileZip(demo.zip, demo.output);
  const html = readFileSync(demo.html, 'utf8');
  writeFileSync(demo.html, transformDemoSection(html, demo), 'utf8');
}

console.log('[landing-demo] PT-BR and EN videos extracted; demo headings updated; playback locked at 0.5x.');
