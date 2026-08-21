# GamePlan demo media

The PT-BR and EN walkthroughs are pre-rendered at normal browser playback speed. Slow-motion moments are baked into the video frames, and the soundtrack is an AAC stream inside each MP4.

## Soundtrack

- Track: `Sounds Good`
- Creator: Michael Ramir C.
- Source: Mixkit free stock music
- Direct source asset used by the Preview build: https://assets.mixkit.co/music/1077/1077.mp3
- License: Mixkit Free License / Mixkit Stock Music Free License
- License page: https://mixkit.co/license/#musicFree
- Attribution: not required by the Mixkit Free License
- Intended use: background music for the GamePlan web demo under the Mixkit license

For the GamePlan demo, the track is kept at its native musical tempo and mixed as a restrained background bed: very low at the opening, progressive fade-in over the first 7 seconds, stable groove through the middle, a small energy reduction around 38–44 seconds, a modest lift through 45–57 seconds, and a smooth fade-out over the final 2.8 seconds. The final mix targets approximately -16.8 LUFS with a -1.5 dBTP ceiling.

The creative direction uses named commercial songs only to describe broad energy, groove and movement. No melody, hook, lyrics, composition or arrangement is copied.

## Rendering

Rendering copies the H.264 video stream without re-encoding, replaces the source audio with the selected soundtrack, encodes AAC stereo audio at 48 kHz / 192 kbps, and enables MP4 fast-start. The final page uses one localized MP4 per language and no separate `<audio>` element.
