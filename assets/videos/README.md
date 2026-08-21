# GamePlan demo media

The PT-BR and EN walkthroughs are pre-rendered at normal browser playback speed. Slow-motion moments are baked into the video frames, and the soundtrack is an AAC stream inside each MP4.

## Soundtrack

- Track: `Tech House vibes`
- Creator: Alejandro Magaña (A. M.)
- Source: https://mixkit.co/free-stock-music/
- Source category reference: https://mixkit.co/free-stock-music/electronica/
- Direct source asset used by the Preview build: https://assets.mixkit.co/music/130/130.mp3
- License: Mixkit Free License / Mixkit Stock Music Free License
- License page: https://mixkit.co/license/#musicFree
- Attribution: not required by the Mixkit Free License
- Intended use: background music for web video and online advertising is allowed under the Mixkit license

The source track is described by Mixkit as Electronica with a relaxed, bass-and-drums background feel. For the GamePlan demo it is tempo-adjusted from the source 130 BPM reference to approximately 126 BPM, mixed at a restrained background level, faded in gradually over the first 7.5 seconds, normalized to approximately -20 LUFS with a -1.5 dBTP ceiling, and faded out over the final 2.5 seconds.

Named commercial songs supplied as creative references are used only to describe broad energy, groove and movement. No melody, hook, lyrics, composition or arrangement is copied.

## Rendering

The pacing schedules are stored in `scripts/demo-pacing-ptbr.json` and `scripts/demo-pacing-en.json`. Rendering uses H.264 video copied without re-encoding, AAC stereo audio at 48 kHz, and MP4 fast-start enabled. The final page uses one localized MP4 per language and no separate `<audio>` element.
