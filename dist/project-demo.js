/* Inline, silent project previews; each dialog owns its playback lifecycle. */
window.ProjectDemo = class ProjectDemo {
  constructor(dialog, title) {
    this.dialog = dialog;
    this.figure = document.createElement('figure');
    this.figure.className = 'project-demo';
    this.figure.hidden = true;
    this.figure.innerHTML = `
      <video width="1280" height="960" controls muted playsinline loop preload="none" aria-label="Sifter simulated walkthrough: enter a pattern, search, find a match, and save an encrypted wallet.">
        Your browser cannot play this preview. <a href="media/sifter-demo.mp4">Download the Sifter demo</a>.
      </video>
      <figcaption>14-second mock demo: pattern → search → match → encrypted export. No wallet is created.</figcaption>`;
    title.after(this.figure);
    this.video = this.figure.querySelector('video');
    this.video.muted = true;
    dialog.addEventListener('close', () => this.stop());
  }

  show(project) {
    this.stop();
    const enabled = Boolean(project.demo);
    this.figure.hidden = !enabled;
    this.dialog.classList.toggle('has-project-demo', enabled);
    if (!enabled) {
      this.video.removeAttribute('src');
      this.video.load();
      return;
    }
    this.video.poster = project.demoPoster;
    if (this.video.getAttribute('src') !== project.demo) {
      this.video.src = project.demo;
      this.video.load();
    }
    // Start after showModal makes the preview visible. Controls remain usable
    // when autoplay is blocked or the visitor prefers reduced motion.
    requestAnimationFrame(() => {
      if (this.dialog.open && !this.figure.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.video.play().catch(() => {});
      }
    });
  }

  stop() {
    this.video.pause();
    if (this.video.readyState > 0) this.video.currentTime = 0;
  }
};
