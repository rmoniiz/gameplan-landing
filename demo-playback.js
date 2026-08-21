(() => {
  'use strict';

  if (!document.querySelector('link[href="demo-playback.css"]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'demo-playback.css';
    document.head.appendChild(stylesheet);
  }

  const FAST_RATE = 1.1818181818;
  const DEFAULT_MUSIC_VOLUME = 0.28;
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

  let sharedVolume = clamp(safeReadNumber(VOLUME_STORAGE_KEY, DEFAULT_MUSIC_VOLUME), 0, 1);
  let sharedMuted = safeReadBoolean(MUTED_STORAGE_KEY, false);
  let lastAudibleVolume = sharedVolume > 0 ? sharedVolume : DEFAULT_MUSIC_VOLUME;
  const instances = [];

  const updateAllInstances = () => {
    instances.forEach((instance) => instance.applyAudioPreference());
  };

  document.querySelectorAll('.gameplan-demo-video').forEach((video) => {
    const frame = video.closest('.video-frame');
    const audio = frame?.querySelector('.gameplan-demo-audio');
    const controls = frame?.querySelector('[data-demo-audio-control]');
    if (!frame || !audio || !controls) return;

    const muteButton = controls.querySelector('[data-demo-audio-mute]');
    const range = controls.querySelector('[data-demo-audio-volume]');
    const output = controls.querySelector('[data-demo-audio-value]');
    const icon = controls.querySelector('[data-demo-audio-icon]');
    if (!muteButton || !range || !output || !icon) return;

    const language = video.dataset.demoLanguage === 'en' ? 'en' : 'ptbr';
    const schedule = schedules[language];
    const labels = {
      mute: controls.dataset.muteLabel || 'Mute music',
      unmute: controls.dataset.unmuteLabel || 'Unmute music',
    };

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

    const syncMusic = (force = false) => {
      const target = presentationTimeAt(video.currentTime);
      if (force || Math.abs(audio.currentTime - target) > 0.35) audio.currentTime = target;
    };

    const applyAudioPreference = () => {
      const percentage = Math.round(sharedVolume * 100);
      audio.volume = sharedVolume;
      audio.muted = sharedMuted || video.muted;
      range.value = String(percentage);
      output.value = `${percentage}%`;
      output.textContent = `${percentage}%`;
      muteButton.setAttribute('aria-pressed', String(sharedMuted));
      muteButton.setAttribute('aria-label', sharedMuted ? labels.unmute : labels.mute);
      icon.textContent = sharedMuted || sharedVolume === 0 ? '🔇' : sharedVolume < 0.45 ? '🔉' : '🔊';
      controls.classList.toggle('is-muted', sharedMuted || sharedVolume === 0);
    };

    instances.push({ applyAudioPreference });
    applyAudioPreference();

    range.addEventListener('input', () => {
      const next = clamp(Number(range.value) / 100, 0, 1);
      sharedVolume = next;
      if (next > 0) {
        lastAudibleVolume = next;
        sharedMuted = false;
      } else {
        sharedMuted = true;
      }
      safeWrite(VOLUME_STORAGE_KEY, sharedVolume);
      safeWrite(MUTED_STORAGE_KEY, sharedMuted);
      updateAllInstances();
    });

    muteButton.addEventListener('click', () => {
      if (sharedMuted || sharedVolume === 0) {
        sharedMuted = false;
        sharedVolume = lastAudibleVolume > 0 ? lastAudibleVolume : DEFAULT_MUSIC_VOLUME;
      } else {
        lastAudibleVolume = sharedVolume;
        sharedMuted = true;
      }
      safeWrite(VOLUME_STORAGE_KEY, sharedVolume);
      safeWrite(MUTED_STORAGE_KEY, sharedMuted);
      updateAllInstances();
    });

    let frameId = 0;
    const tick = () => {
      applyRate();
      syncMusic(false);
      if (!video.paused && !video.ended) frameId = requestAnimationFrame(tick);
    };

    video.addEventListener('loadedmetadata', () => {
      applyRate();
      syncMusic(true);
      applyAudioPreference();
    });

    video.addEventListener('volumechange', applyAudioPreference);

    video.addEventListener('play', async () => {
      cancelAnimationFrame(frameId);
      applyRate();
      syncMusic(true);
      applyAudioPreference();
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
      syncMusic(true);
    });

    video.addEventListener('ended', () => {
      cancelAnimationFrame(frameId);
      audio.pause();
      audio.currentTime = 0;
    });
  });
})();
