(() => {
  'use strict';

  const FAST_RATE = 1.1818181818;
  const DEFAULT_NATIVE_VOLUME = 0.5;
  const VOLUME_STORAGE_KEY = 'gameplan:landing-demo-music-volume:v1';
  const MUTED_STORAGE_KEY = 'gameplan:landing-demo-music-muted:v1';

  const schedules = {
    ptbr: [
      [0, 2, 0.5], [2, 49, FAST_RATE], [49, 51, 0.5], [51, 53, FAST_RATE],
      [53, 55, 0.5], [55, 58, FAST_RATE], [58, 60, 0.5],
    ],
    en: [
      [0, 7, FAST_RATE], [7, 9, 0.5], [9, 13, FAST_RATE], [13, 15, 0.5],
      [15, 32, FAST_RATE], [32, 34, 0.5], [34, 52, FAST_RATE], [52, 54, 0.5],
      [54, 60, FAST_RATE],
    ],
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const safeReadNumber = (key, fallback) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  const safeReadBoolean = (key, fallback) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return raw === 'true';
    } catch {
      return fallback;
    }
  };

  const safeWrite = (key, value) => {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {
      // Playback remains functional when storage is unavailable.
    }
  };

  document.querySelectorAll('.gameplan-demo-video').forEach((video) => {
    const frame = video.closest('.video-frame');
    const audio = frame?.querySelector('.gameplan-demo-audio');
    if (!frame || !audio) return;

    const language = video.dataset.demoLanguage === 'en' ? 'en' : 'ptbr';
    const schedule = schedules[language];
    const storedVolume = clamp(safeReadNumber(VOLUME_STORAGE_KEY, DEFAULT_NATIVE_VOLUME), 0, 1);
    const storedMuted = safeReadBoolean(MUTED_STORAGE_KEY, false);

    try {
      video.volume = storedVolume;
    } catch {
      // Some mobile browsers reserve media volume for the device controls.
    }
    video.muted = storedMuted;
    audio.volume = clamp(video.volume, 0, 1);
    audio.muted = video.muted;

    const rateAt = (time) => schedule.find(([start, end]) => time >= start && time < end)?.[2] ?? 1;

    const presentationTimeAt = (videoTime) => {
      let presentationTime = 0;
      for (const [start, end, rate] of schedule) {
        if (videoTime <= start) break;
        const segmentEnd = Math.min(videoTime, end);
        presentationTime += Math.max(0, segmentEnd - start) / rate;
        if (videoTime < end) break;
      }
      return clamp(presentationTime, 0, 60);
    };

    const applyRate = () => {
      const nextRate = rateAt(video.currentTime);
      if (Math.abs(video.playbackRate - nextRate) > 0.01) video.playbackRate = nextRate;
    };

    const syncMusicPosition = (force = false) => {
      const target = presentationTimeAt(video.currentTime);
      if (force || Math.abs(audio.currentTime - target) > 0.35) audio.currentTime = target;
    };

    const syncMusicVolumeToNativePlayer = (persist = true) => {
      audio.volume = clamp(video.volume, 0, 1);
      audio.muted = video.muted;
      if (persist) {
        safeWrite(VOLUME_STORAGE_KEY, video.volume);
        safeWrite(MUTED_STORAGE_KEY, video.muted);
      }
    };

    let frameId = 0;
    const tick = () => {
      applyRate();
      syncMusicPosition(false);
      if (!video.paused && !video.ended) frameId = requestAnimationFrame(tick);
    };

    video.addEventListener('loadedmetadata', () => {
      applyRate();
      syncMusicPosition(true);
      syncMusicVolumeToNativePlayer(false);
    });

    video.addEventListener('volumechange', () => syncMusicVolumeToNativePlayer(true));

    video.addEventListener('play', async () => {
      cancelAnimationFrame(frameId);
      applyRate();
      syncMusicPosition(true);
      syncMusicVolumeToNativePlayer(false);
      try {
        await audio.play();
      } catch {
        // The walkthrough remains usable if a browser blocks synchronized audio.
      }
      frameId = requestAnimationFrame(tick);
    });

    video.addEventListener('pause', () => {
      cancelAnimationFrame(frameId);
      audio.pause();
    });

    video.addEventListener('seeking', () => {
      applyRate();
      syncMusicPosition(true);
    });

    video.addEventListener('ended', () => {
      cancelAnimationFrame(frameId);
      audio.pause();
      audio.currentTime = 0;
    });
  });
})();
