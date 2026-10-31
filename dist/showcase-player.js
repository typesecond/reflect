/* One accessible set of video controls; the visible timeline is the seek bar. */
window.ShowcasePlayer = class ShowcasePlayer {
  constructor(onFinish) {
    this.onFinish = onFinish;
    this.mode = 'video';
    this.finished = false;
    this.sampleTime = 0;
    this.sampleDuration = 14;
    this.samplePaused = false;
    this.scrubbing = false;
    this.element = document.createElement('section');
    this.element.id = 'reflect-reel';
    this.element.hidden = true;
    this.element.setAttribute('aria-label', 'Sayo showcase video');
    this.element.innerHTML = `
      <video id="rf-video" playsinline preload="metadata" src="media/sayo-showcase.mp4?v=img2732-start12" aria-label="Sayo showcase"></video>
      <p id="rf-video-loading" role="status" hidden>Loading the film...</p>
      <div id="rf-sample-reel" hidden aria-label="Sample animation" role="img"><div class="rf-film-stars"></div><div class="rf-film-mirror"></div><div class="rf-film-beam"></div><div class="rf-film-land"></div><div class="rf-film-device"></div></div>
      <button id="rf-skip" type="button" aria-label="Return to the site" title="Return to the site">×</button>
      <div class="rf-player-controls" role="group" aria-label="Video controls">
        <button id="rf-pause" type="button" aria-label="Pause video"></button>
        <span id="rf-time">00:00 / 00:00</span>
        <input id="rf-seek" type="range" min="0" max="1" value="0" step="0.01" aria-label="Seek video">
        <button id="rf-mute" type="button" aria-label="Mute video" aria-pressed="false"></button>
        <button id="rf-fullscreen" type="button" aria-label="Enter fullscreen"></button>
      </div>`;
    document.body.append(this.element);
    const find = id => this.element.querySelector(id);
    this.video = find('#rf-video'); this.loading = find('#rf-video-loading');
    this.sample = find('#rf-sample-reel'); this.playButton = find('#rf-pause');
    this.time = find('#rf-time'); this.seek = find('#rf-seek'); this.muteButton = find('#rf-mute');
    this.fullscreenButton = find('#rf-fullscreen');
    const icon = path => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${path}" fill="currentColor"/></svg>`;
    this.icons = {
      play: icon('M4 2v12l10-6z'), pause: icon('M3 2h4v12H3zM10 2h4v12h-4z'),
      sound: icon('M1 6h3l5-4v12l-5-4H1zM11 4h2v8h-2zM14 2h2v12h-2z'),
      muted: icon('M1 6h3l5-4v12l-5-4H1zM11 5l2 2 2-2 1 1-2 2 2 2-1 1-2-2-2 2-1-1 2-2-2-2z'),
      fullscreen: icon('M1 1h5v2H3v3H1zM10 1h5v5h-2V3h-3zM1 10h2v3h3v2H1zM13 10h2v5h-5v-2h3z'),
    };
    this.muteButton.innerHTML = this.icons.sound;
    this.fullscreenButton.innerHTML = this.icons.fullscreen;
    this.setPaused(false);
    this.playButton.addEventListener('click', () => this.toggle());
    find('#rf-skip').addEventListener('click', () => this.finish());
    this.video.addEventListener('loadedmetadata', () => { if (this.mode === 'video') this.timeline(); });
    this.video.addEventListener('timeupdate', () => { if (this.mode === 'video' && !this.scrubbing) this.timeline(); });
    this.video.addEventListener('playing', () => { this.loading.hidden = true; this.setPaused(false); });
    this.video.addEventListener('pause', () => this.setPaused(true));
    this.video.addEventListener('ended', () => { if (this.mode === 'video' && !this.element.hidden) this.finish(); });
    this.video.addEventListener('error', () => { if (!this.element.hidden) this.startSample(); });
    this.seek.addEventListener('pointerdown', () => {
      this.scrubbing = true;
      this.resumeAfterSeek = this.mode === 'video' ? !this.video.paused : !this.samplePaused;
      if (this.mode === 'video') this.video.pause(); else this.samplePaused = true;
    });
    this.seek.addEventListener('input', () => {
      if (this.mode === 'video') this.video.currentTime = this.seek.valueAsNumber;
      else this.sampleTime = this.seek.valueAsNumber;
      this.timeline(this.seek.valueAsNumber);
    });
    this.seek.addEventListener('change', () => this.finishScrub());
    this.onPointerUp = () => this.finishScrub();
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    this.muteButton.addEventListener('click', () => {
      this.video.muted = !this.video.muted;
      this.muteButton.innerHTML = this.video.muted ? this.icons.muted : this.icons.sound;
      this.muteButton.setAttribute('aria-pressed', String(this.video.muted));
      this.muteButton.setAttribute('aria-label', this.video.muted ? 'Unmute video' : 'Mute video');
    });
    this.fullscreenButton.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (this.element.requestFullscreen) await this.element.requestFullscreen();
        else this.video.webkitEnterFullscreen?.();
      } catch { /* Keep playback working if fullscreen is unavailable. */ }
    });
    this.onFullscreen = () => this.fullscreenButton.setAttribute('aria-label', document.fullscreenElement === this.element ? 'Exit fullscreen' : 'Enter fullscreen');
    document.addEventListener('fullscreenchange', this.onFullscreen);
    this.onKey = event => {
      if (!this.element.hidden && event.key === 'Escape' && !document.fullscreenElement) {
        event.preventDefault(); this.finish();
      }
    };
    document.addEventListener('keydown', this.onKey);
  }

  format(seconds) {
    const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  }
  setPaused(paused) {
    this.playButton.innerHTML = paused ? this.icons.play : this.icons.pause;
    this.playButton.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
  }
  timeline(current) {
    const duration = this.mode === 'video' ? this.video.duration : this.sampleDuration;
    current ??= this.mode === 'video' ? this.video.currentTime : this.sampleTime;
    this.time.textContent = `${this.format(current)} / ${this.format(duration)}`;
    this.seek.disabled = !Number.isFinite(duration) || duration <= 0;
    this.seek.max = Number.isFinite(duration) && duration > 0 ? duration : 1;
    if (!this.scrubbing) this.seek.value = current;
    this.seek.style.setProperty('--played', `${Number.isFinite(duration) && duration ? current / duration * 100 : 0}%`);
    this.seek.setAttribute('aria-valuetext', `${this.format(current)} of ${this.format(duration)}`);
  }
  play() {
    this.video.play().catch(error => {
      if (this.finished || error.name === 'AbortError') return;
      if (error.name === 'NotAllowedError') {
        this.loading.textContent = 'Press play to watch.'; this.loading.hidden = false; this.setPaused(true);
      } else this.startSample();
    });
  }
  toggle() {
    if (this.mode === 'video') {
      if (this.video.paused) this.play(); else this.video.pause();
    } else { this.samplePaused = !this.samplePaused; this.setPaused(this.samplePaused); }
  }
  finishScrub() {
    if (!this.scrubbing) return;
    this.scrubbing = false;
    if (this.resumeAfterSeek) {
      if (this.mode === 'video') this.play();
      else { this.samplePaused = false; this.setPaused(false); }
    }
    this.resumeAfterSeek = false;
  }
  open() {
    this.finished = false; this.mode = 'video'; this.scrubbing = false;
    this.element.hidden = false; this.element.classList.remove('fading');
    this.sample.hidden = true; this.video.hidden = false;
    this.loading.textContent = 'Loading the film...'; this.loading.hidden = this.video.readyState >= 3;
    if (this.video.error) this.video.load();
    this.video.currentTime = 0;
    this.timeline(); this.setPaused(false); this.play();
  }
  startSample() {
    if (this.finished || this.mode === 'sample') return;
    this.mode = 'sample'; this.sampleTime = 0; this.samplePaused = false;
    this.video.pause(); this.video.hidden = true; this.loading.hidden = true; this.sample.hidden = false;
    this.setPaused(false); this.timeline();
    let previous = performance.now();
    this.timer = setInterval(() => {
      const now = performance.now();
      if (!this.samplePaused && !this.scrubbing) this.sampleTime += (now - previous) / 1000;
      previous = now; this.timeline();
      if (this.sampleTime >= this.sampleDuration) this.finish();
    }, 60);
  }
  finish() {
    if (this.finished) return;
    this.finished = true; clearInterval(this.timer); this.video.pause();
    if (document.fullscreenElement === this.element) document.exitFullscreen().catch(() => {});
    this.onFinish();
  }
  destroy() {
    clearInterval(this.timer); this.video.pause();
    document.removeEventListener('keydown', this.onKey);
    document.removeEventListener('fullscreenchange', this.onFullscreen);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.element.remove();
  }
};
