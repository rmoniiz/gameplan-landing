# GamePlan demo media

The PT-BR and EN walkthroughs are pre-rendered at normal browser playback speed. Slow-motion moments are baked into the video frames, and the soundtrack is an AAC stream inside each MP4.

## Soundtrack

- Track: `Deep Urban`
- Creator: Eugenio Mininni
- Source: https://mixkit.co/free-stock-music/tech-house/
- Direct source asset: https://assets.mixkit.co/music/623/623.mp3
- License: Mixkit Stock Music Free License
- License page: https://mixkit.co/license/#musicFree
- Attribution: not required by the Mixkit Free License
- Intended use: commercial and non-commercial web video is allowed
- Caveat recorded by Mixkit: claims should be forwarded to `team@mixkit.co`; the track must not be registered with a rights-management service

The committed MP4s use a 60-second excerpt beginning 15 seconds into the source track, normalized to approximately -18 LUFS with a true-peak ceiling of -1.5 dBTP and a short fade-out.

## Rendering

The pacing schedules are stored in `scripts/demo-pacing-ptbr.json` and `scripts/demo-pacing-en.json`. Rendering used the GamePlan demo-music renderer with H.264 video, AAC stereo audio at 48 kHz, and MP4 fast-start enabled.
