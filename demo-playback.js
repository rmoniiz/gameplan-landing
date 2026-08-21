(() => {
  'use strict';

  const FAST_RATE = 1.1818181818;
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

  document.querySelectorAll('.gameplan-demo-video').forEach((video) => {
    const audio = video.parentElement?.querySelector('.gameplan-demo-audio');
    if (!audio) return;

    const language = video.dataset.demoLanguage === 'en' ? 'en' : 'ptbr';
    const schedule = schedules[language];

    const syncVolume = () => {
      audio.muted = video.muted;
      audio.volume = Math.max(0, Math.min(1, video.volume * 0.22));
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
      return Math.max(0, Math.min(60, presentationTime));
    };

    const applyRate = () => {
      const nextRate = rateAt(video.currentTime);
      if (Math.abs(video.playbackRate - nextRate) > 0.01) video.playbackRate = nextRate;
    };

    const syncMusic = (force = false) => {
      const target = presentationTimeAt(video.currentTime);
      if (force || Math.abs(audio.currentTime - target) > 0.35) audio.currentTime = target;
    };

    let frameId = 0;
    const tick = () => {
      applyRate();
      syncMusic(false);
      if (!video.paused && !video.ended) frameId = requestAnimationFrame(tick);
    };

    syncVolume();

    video.addEventListener('loadedmetadata', () => {
      applyRate();
      syncMusic(true);
    });

    video.addEventListener('volumechange', syncVolume);

    video.addEventListener('play', async () => {
      cancelAnimationFrame(frameId);
      applyRate();
      syncMusic(true);
      syncVolume();
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
