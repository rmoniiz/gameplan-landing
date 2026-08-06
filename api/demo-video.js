import fs from 'node:fs';
import path from 'node:path';

export default function handler(request, response) {
  try {
    const encodedPath = path.join(process.cwd(), 'assets', 'videos', 'gameplan-demo.b64');
    const encodedVideo = fs.readFileSync(encodedPath, 'utf8').trim();
    const video = Buffer.from(encodedVideo, 'base64');

    response.setHeader('Content-Type', 'video/mp4');
    response.setHeader('Content-Length', String(video.length));
    response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, immutable');
    response.status(200).send(video);
  } catch (error) {
    console.error('Unable to serve GamePlan demo video:', error);
    response.status(500).json({ error: 'VIDEO_UNAVAILABLE' });
  }
}
