(() => {
  'use strict';

  const projects = [
    { name: 'Bridge75 battery', type: 'FIRMWARE / EMBEDDED SYSTEMS', x: .23, y: .29, art: 'keyboard', description: 'Hold Fn and the F1–F12 lights become a battery gauge. Six keys mean 50%; all twelve mean full. Release Fn and the keyboard goes dark. Built with QMK, with packet validation and tests for every battery level. Software-validated candidate; hardware validation is pending.', tags: ['QMK / C', 'Battery telemetry', 'Fn lighting'], repo: 'https://github.com/typesecond/bridge75-firmware' },
    { name: 'Sifter', type: 'CRYPTOGRAPHY / DESKTOP TOOLS', x: .77, y: .31, art: 'sifter', description: 'Find an Ethereum address with a prefix, suffix, or both. Sifter pairs a pixel-art desktop interface with CPU and OpenCL search, live progress, and password-encrypted wallet export. Every result is checked against its private key. An experimental open-source project with a CLI and regression tests.', tags: ['Python', 'CPU / OpenCL', 'Pixel UI'], repo: 'https://github.com/typesecond/sifter', linkLabel: 'View Sifter on GitHub ↗' },
    { name: 'Ground station', type: 'SYSTEMS / TELEMETRY', x: .23, y: .63, art: 'dish', description: 'A sample operations interface concept. Bring satellite telemetry, communication windows, and ground-station status into a single view.', tags: ['Telemetry', 'Mission control'] },
    { name: 'Terrain explorer', type: 'GRAPHICS / MAPPING', x: .77, y: .65, art: 'terrain', description: 'A sample mapping concept. Turn elevation data into an explorable landscape with contours, surface shading, and changing light.', tags: ['Computer graphics', 'Terrain rendering'] },
  ];

  const normalSite = document.querySelector('#field');
  const normalDetail = document.querySelector('#detail');
  normalSite.inert = true;
  normalDetail.inert = true;

  const field = document.createElement('main');
  field.id = 'reflect-field';
  field.setAttribute('aria-label', 'After Dark interactive project field');
  field.innerHTML = `
    <div id="reflect-map">
      <div id="reflect-land"><canvas id="reflect-terrain" aria-hidden="true"></canvas><div id="reflect-projects"></div><div id="reflect-light" aria-hidden="true"></div></div>
    </div>
    <header class="rf-hud rf-top"><span class="rf-brand"><span>REFLECT</span></span></header>
    <footer class="rf-hud rf-bottom"><div class="rf-discovery"><div class="rf-exposures" aria-hidden="true"><i></i><i></i><i></i><i></i></div><p id="rf-count" role="status" aria-live="polite">00 / 04 DISCOVERED</p></div></footer>
    <aside id="sayo-controller" aria-label="Interactive Sayo controller"><div class="sayo-shell"><div class="sayo-screen"><strong id="sayo-message">hire me, reflect :)</strong></div><div class="sayo-controls"><div class="sayo-knob"><button id="sayo-knob-turn" class="sayo-knob-turn" type="button" aria-label="Turn the knob to scan the next project"></button><button id="sayo-knob-press" class="sayo-knob-press" type="button" aria-label="Press the knob to reset the spotlight"></button></div></div></div></aside>
    <button id="rf-continue" type="button">Play film ↗</button>
    <dialog id="rf-detail" aria-labelledby="rf-detail-title"><button class="rf-modal-close" type="button" aria-label="Close project">×</button><p class="rf-modal-kicker"></p><h2 id="rf-detail-title"></h2><p class="rf-modal-description"></p><div class="rf-tags"></div><a class="project-repo" hidden target="_blank" rel="noopener noreferrer">View firmware on GitHub ↗</a></dialog>`;
  document.body.prepend(field);
  document.body.style.overflow = 'hidden';

  const player = new ShowcasePlayer(revealNormalSite);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const land = document.querySelector('#reflect-land');
  const canvas = document.querySelector('#reflect-terrain');
  const beams = [...document.querySelectorAll('.rf-exposures i')];
  const projectLayer = document.querySelector('#reflect-projects');
  const dialog = document.querySelector('#rf-detail');
  const countLabel = document.querySelector('#rf-count');
  const continueButton = document.querySelector('#rf-continue');
  const knobTurn = document.querySelector('#sayo-knob-turn');
  const knobPress = document.querySelector('#sayo-knob-press');
  const found = new Set();
  const projectButtons = [];
  let width = 0, height = 0, radius = 260;
  let x = -1000, y = -1000, targetX = x, targetY = y;
  let strength = 0, pointerOn = false, sayoOn = false;
  let animationFrame = 0, lastFrame = 0, knobIndex = -1, currentProject = -1;
  let transitioning = false;


  function drawTerrain() {
    width = field.clientWidth; height = field.clientHeight;
    projectLayer.replaceChildren(); projectButtons.length = 0;
    radius = width < 650 ? 195 : 270;
    land.style.setProperty('--radius', `${radius}px`);
    PixelWorld.drawTerrain(canvas, width, height, projects);
    projects.forEach((project, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'rf-project'; button.style.left = `${project.x * 100}%`; button.style.top = `${project.y * 100}%`;
      button.setAttribute('aria-label', `Open project ${index + 1}: ${project.name}`);
      if (found.has(index)) button.classList.add('found');
      const parts = project.name.split(' ');
      button.innerHTML = `<strong>${parts[0]} <em>${parts.slice(1).join(' ')}</em></strong><span class="rf-arrow" aria-hidden="true">↗</span>`;
      button.addEventListener('click', () => {
        const distance = Math.hypot(project.x * width - x, project.y * height - y);
        if (strength > .3 && distance < radius * .7) openProject(index);
      });
      projectLayer.append(button); projectButtons.push(button);
    });
  }

  function schedule() { if (!animationFrame) animationFrame = requestAnimationFrame(animate); }
  function pointAt(px, py, source) {
    targetX = px; targetY = py;
    if (!pointerOn && !sayoOn || source === 'snap' || reducedMotion.matches) { x = px; y = py; }
    if (source === 'pointer') pointerOn = true;
    if (source === 'sayo') sayoOn = true;
    field.classList.add('is-lit'); schedule();
  }
  function illuminateProject(index) {
    knobIndex = index; currentProject = index;
    knobTurn.style.rotate = `${index * 90}deg`;
    pointAt(projects[index].x * width, projects[index].y * height, 'sayo');
  }
  function animate(time) {
    animationFrame = 0;
    const elapsed = Math.min(50, lastFrame ? time - lastFrame : 16); lastFrame = time;
    const ease = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 65);
    x += (targetX - x) * ease; y += (targetY - y) * ease;
    const targetStrength = (pointerOn || sayoOn) ? 1 : 0;
    strength += (targetStrength - strength) * (reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 160));
    land.style.setProperty('--x', `${x.toFixed(2)}px`); land.style.setProperty('--y', `${y.toFixed(2)}px`); land.style.opacity = strength.toFixed(3);
    projectButtons.forEach((button, index) => {
      const distance = Math.hypot(projects[index].x * width - x, projects[index].y * height - y);
      button.style.setProperty('--proximity', Math.max(0, 1 - distance / radius).toFixed(2));
    });
    if (strength > .5) projects.forEach((project, index) => {
      if (!found.has(index) && Math.hypot(project.x * width - x, project.y * height - y) < radius * .46) {
        found.add(index); projectButtons[index].classList.add('found'); beams[index].classList.add('found'); countLabel.textContent = `0${found.size} / 04 DISCOVERED`;
        if (found.size === projects.length) {
          countLabel.textContent = '04 / 04 DISCOVERED';
          continueButton.classList.add('visible');
        }
      }
    });
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > .1 || Math.abs(targetStrength - strength) > .001) schedule();
  }

  function openProject(index) {
    currentProject = index;
    const project = projects[index];
    dialog.querySelector('.rf-modal-kicker').textContent = `FIELD NOTE 0${index + 1} / ${project.type}`;
    dialog.querySelector('#rf-detail-title').textContent = project.name;
    dialog.querySelector('.rf-modal-description').textContent = project.description;
    const tags = dialog.querySelector('.rf-tags'); tags.replaceChildren(...project.tags.map(tag => { const el = document.createElement('span'); el.textContent = tag; return el; }));
    const repoLink = dialog.querySelector('.project-repo');
    repoLink.hidden = !project.repo;
    repoLink.textContent = project.linkLabel || 'View firmware on GitHub ↗';
    if (project.repo) repoLink.href = project.repo;
    else repoLink.removeAttribute('href');
    if (!dialog.open) dialog.showModal();
  }
  dialog.querySelector('.rf-modal-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { if (currentProject >= 0) { const project = projects[currentProject]; if (sayoOn) pointAt(project.x * width, project.y * height, 'snap'); } });

  field.addEventListener('pointermove', event => {
    if (dialog.open || event.target.closest('#sayo-controller, #rf-continue')) return;
    const rect = field.getBoundingClientRect(); pointAt(event.clientX - rect.left, event.clientY - rect.top, 'pointer');
  });
  field.addEventListener('pointerleave', event => {
    if (event.pointerType === 'touch' || dialog.open) return;
    pointerOn = false; sayoOn = false;
    field.classList.remove('is-lit');
    schedule();
  });
  field.addEventListener('pointerdown', event => {
    if (event.target.closest('#sayo-controller, #rf-continue') || dialog.open) return;
    const rect = field.getBoundingClientRect(); pointAt(event.clientX - rect.left, event.clientY - rect.top, 'pointer');
  });

  knobTurn.addEventListener('click', () => {
    playKnobClick(.55);
    illuminateProject((knobIndex + 1) % projects.length);
  });
  knobTurn.addEventListener('wheel', event => {
    event.preventDefault();
    illuminateProject((knobIndex + (event.deltaY >= 0 ? 1 : 3) + projects.length) % projects.length);
  }, { passive: false });
  knobPress.addEventListener('click', () => {
    playKnobClick();
    sayoOn = false; pointerOn = false; knobIndex = -1;
    knobTurn.style.rotate = '0deg';
    field.classList.remove('is-lit'); schedule();
  });
  window.addEventListener('blur', () => { sayoOn = false; pointerOn = false; schedule(); });
  continueButton.addEventListener('click', () => { if (found.size === projects.length) player.open(); });

  function revealNormalSite() {
    if (transitioning) return;
    transitioning = true;
    normalSite.inert = false;
    normalDetail.inert = false;
    window.dispatchEvent(new Event('reflect:show-site'));
    player.element.classList.add('fading');
    window.setTimeout(() => {
      field.classList.add('leaving');
      window.setTimeout(() => {
        field.remove(); player.destroy(); document.body.style.overflow = '';
        window.scrollTo(0, 0);
        normalSite.setAttribute('tabindex', '-1');
        normalSite.focus({ preventScroll: true });
      }, 950);
    }, 160);
  }
  document.addEventListener('keydown', event => {
    if (event.target === knobTurn && ['ArrowRight', 'ArrowDown'].includes(event.key)) { event.preventDefault(); illuminateProject((knobIndex + 1) % projects.length); }
    if (event.target === knobTurn && ['ArrowLeft', 'ArrowUp'].includes(event.key)) { event.preventDefault(); illuminateProject((knobIndex + 3 + projects.length) % projects.length); }
  });

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawTerrain, 120); });
  drawTerrain();
})();
