'use strict';

const samples = ReflectProjects.map(project => ({ ...project, x: project.position[0], y: project.position[1] }));
const field = document.querySelector('#field');
const lit = document.querySelector('#illuminated');
const canvas = document.querySelector('#terrain');
const dialog = document.querySelector('#detail');
const projectDemo = new ProjectDemo(dialog, document.querySelector('#detail-title'));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const found = new Set();
const exposureMarks = [...document.querySelectorAll('#exposures i')];
let width = 0, height = 0, radius = 280;
let x = -1000, y = -1000, targetX = x, targetY = y;
let strength = 0, active = false, frame = 0, previousTime = 0;
let keyboard = false, lastProject;

const buttons = samples.map((project, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'project';
  button.style.left = `${project.x * 100}%`;
  button.style.top = `${project.y * 100}%`;
  button.setAttribute('aria-label', `Open project: ${project.name}`);
  const words = project.name.split(' ');
  button.innerHTML = `<strong>${words[0]} <em>${words.slice(1).join(' ')}</em></strong><span class="arrow" aria-hidden="true">↗</span>`;
  button.addEventListener('focus', () => {
    if (keyboard) aim(project.x * width, project.y * height, true);
  });
  button.addEventListener('click', () => {
    aim(project.x * width, project.y * height, true);
    openProject(index);
  });
  document.querySelector('#projects').append(button);
  return button;
});

// Shared pixel scenery keeps the map consistent before and after the film.
function drawTerrain() {
  width = field.clientWidth;
  height = field.clientHeight;
  radius = width < 650 ? 195 : 280;
  lit.style.setProperty('--radius', `${radius}px`);
  PixelWorld.drawTerrain(canvas, width, height, samples);
}

function drawInstallation(c, kind, cx, cy, scale = 1) {
  PixelWorld.drawInstallation(c, kind, cx, cy, scale);
}

function schedule() { if (!frame) frame = requestAnimationFrame(animate); }
function aim(px, py, snap = false) {
  targetX = px; targetY = py;
  if (!active || snap || reducedMotion.matches) { x = px; y = py; }
  active = true;
  document.body.classList.add('exploring');
  schedule();
}
function animate(time) {
  frame = 0;
  const elapsed = Math.min(50, previousTime ? time - previousTime : 16);
  previousTime = time;
  const ease = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 65);
  x += (targetX - x) * ease; y += (targetY - y) * ease;
  strength += ((active ? 1 : 0) - strength) * (reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 160));
  lit.style.setProperty('--x', `${x.toFixed(2)}px`);
  lit.style.setProperty('--y', `${y.toFixed(2)}px`);
  lit.style.opacity = strength.toFixed(3);
  buttons.forEach((button, index) => {
    const distance = Math.hypot(samples[index].x * width - x, samples[index].y * height - y);
    button.style.setProperty('--proximity', Math.max(0, 1 - distance / radius).toFixed(2));
  });
  if (strength > .5) samples.forEach((project, index) => {
    if (!found.has(index) && Math.hypot(project.x * width - x, project.y * height - y) < radius * .46) {
      found.add(index);
      buttons[index].classList.add('found');
      exposureMarks[index].classList.add('found');
      document.querySelector('#discovered').textContent = `${String(found.size).padStart(2, '0')} / ${String(samples.length).padStart(2, '0')} DISCOVERED`;
    }
  });
  if (Math.abs(targetX - x) + Math.abs(targetY - y) > .1 || Math.abs((active ? 1 : 0) - strength) > .001) schedule();
}

field.addEventListener('pointermove', event => {
  if (dialog.open) return;
  keyboard = false;
  const rect = field.getBoundingClientRect();
  aim(event.clientX - rect.left, event.clientY - rect.top);
});
field.addEventListener('pointerdown', event => {
  if (dialog.open) return;
  keyboard = false;
  const rect = field.getBoundingClientRect();
  aim(event.clientX - rect.left, event.clientY - rect.top);
});
field.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch' && !dialog.open && !keyboard) { active = false; schedule(); } });
field.addEventListener('pointercancel', () => { active = false; schedule(); });
window.addEventListener('blur', () => { active = false; schedule(); });
document.addEventListener('keydown', event => { if (event.key === 'Tab') keyboard = true; });
field.addEventListener('focusout', () => queueMicrotask(() => {
  if (keyboard && !field.contains(document.activeElement) && !dialog.open) { active = false; schedule(); }
}));

function openProject(index) {
  const project = samples[index];
  lastProject = index;
  document.querySelector('#specimen-index').textContent = `0${index + 1}`;
  document.querySelector('#detail-kicker').textContent = `FIELD NOTE 0${index + 1} / ${project.type}`;
  document.querySelector('#detail-title').textContent = project.name;
  document.querySelector('#detail-description').textContent = project.description;
  document.querySelector('#detail-tags').replaceChildren(...project.tags.map(tag => {
    const span = document.createElement('span'); span.textContent = tag; return span;
  }));
  const repoLink = document.querySelector('#detail-repo');
  repoLink.hidden = !project.url;
  repoLink.textContent = project.linkLabel;
  if (project.url) repoLink.href = project.url;
  else repoLink.removeAttribute('href');
  document.querySelector('.sample-note').textContent = project.status;
  const art = document.createElement('canvas'); art.width = 640; art.height = 640;
  drawInstallation(art.getContext('2d'), project.kind, 320, 320, 2.8);
  document.querySelector('#detail-art').replaceChildren(art);
  projectDemo.show(project);
  dialog.showModal();
}
document.querySelector('#close').addEventListener('click', () => dialog.close());
document.querySelector('#return').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  if (lastProject !== undefined) {
    buttons[lastProject].focus({ preventScroll: true });
    if (keyboard) aim(samples[lastProject].x * width, samples[lastProject].y * height, true);
    else { active = false; schedule(); }
  }
});
let resizeTimer;
window.addEventListener('reflect:show-site', () => {
  samples.forEach((project, index) => {
    found.add(index);
    buttons[index].classList.add('found');
    exposureMarks[index].classList.add('found');
  });
  document.querySelector('#discovered').textContent = `${String(samples.length).padStart(2, '0')} / ${String(samples.length).padStart(2, '0')} DISCOVERED`;
  active = false;
  schedule();
});
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawTerrain, 120); });
drawTerrain();
