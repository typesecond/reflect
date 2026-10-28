const canvas = document.querySelector('#netCanvas');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#status');
const readout = document.querySelector('#readout');
const goalButton = document.querySelector('#goalButton');

const inputs = {
  depth: document.querySelector('#depth'),
  grid: document.querySelector('#grid'),
  speed: document.querySelector('#speed'),
  impactX: document.querySelector('#impactX'),
  impactY: document.querySelector('#impactY')
};

const values = {
  depth: document.querySelector('#depthValue'),
  grid: document.querySelector('#gridValue'),
  speed: document.querySelector('#speedValue'),
  impactX: document.querySelector('#impactXValue'),
  impactY: document.querySelector('#impactYValue')
};

let animationStart = -Infinity;
let animationFrame;
let settleTimer;

function resize() {
  const ratio = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  draw(performance.now());
}

function updateLabels() {
  values.depth.textContent = `${Number(inputs.depth.value).toFixed(2)} m`;
  values.grid.textContent = `${Number(inputs.grid.value).toFixed(2)} m`;
  values.speed.textContent = `${inputs.speed.value}%`;
  values.impactX.textContent = `${inputs.impactX.value}%`;
  values.impactY.textContent = `${inputs.impactY.value}%`;
  readout.textContent = `Impact ${inputs.impactX.value}% / ${inputs.impactY.value}% · Speed ${inputs.speed.value}%`;
}

function netPoint(x, y, now) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const left = w * .16;
  const right = w * .84;
  const top = h * .16;
  const bottom = h * .79;
  const width = right - left;
  const height = bottom - top;
  const depth = Number(inputs.depth.value) / 2.4;
  const elapsed = Math.max(0, now - animationStart);
  const pulse = elapsed < 1300 ? Math.sin(Math.min(1, elapsed / 1300) * Math.PI) : 0;
  const ix = Number(inputs.impactX.value) / 100;
  const iy = Number(inputs.impactY.value) / 100;
  const distance = Math.hypot(x - ix, y - iy);
  const influence = Math.max(0, 1 - distance * 1.7);
  const wave = pulse * (0.55 + Number(inputs.speed.value) / 100) * influence;
  const z = depth * (0.35 + y * .65) + wave * .16;
  return { x: left + x * width - z * width * .22, y: top + y * height + z * height * .2 };
}

function draw(now) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * .52, h * .5, 10, w * .52, h * .5, w * .7);
  glow.addColorStop(0, 'rgba(74, 142, 111, .16)');
  glow.addColorStop(1, 'rgba(8, 15, 14, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const left = w * .16, right = w * .84, top = h * .16, bottom = h * .79;
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#d6ddd7';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(left, bottom); ctx.lineTo(left, top); ctx.lineTo(right, top); ctx.lineTo(right, bottom);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(214, 221, 215, .28)';
  ctx.beginPath(); ctx.moveTo(left, bottom); ctx.lineTo(right, bottom); ctx.stroke();

  const spacing = Number(inputs.grid.value);
  const columns = Math.max(5, Math.round(1 / spacing * 2.8));
  const rows = Math.max(5, Math.round(1 / spacing * 2.2));
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(186, 252, 109, .38)';
  for (let col = 0; col <= columns; col += 1) {
    const x = col / columns;
    ctx.beginPath();
    for (let row = 0; row <= rows; row += 1) {
      const p = netPoint(x, row / rows, now);
      if (row === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  for (let row = 0; row <= rows; row += 1) {
    const y = row / rows;
    ctx.beginPath();
    for (let col = 0; col <= columns; col += 1) {
      const p = netPoint(col / columns, y, now);
      if (col === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  const impact = netPoint(Number(inputs.impactX.value) / 100, Number(inputs.impactY.value) / 100, now);
  ctx.fillStyle = '#bafc6d';
  ctx.shadowColor = '#bafc6d';
  ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(impact.x, impact.y, 5, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  if (now - animationStart < 1500) animationFrame = requestAnimationFrame(draw);
}

function triggerGoal() {
  animationStart = performance.now();
  status.textContent = 'Net impact in progress';
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(draw);
  clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => { status.textContent = 'Net settled · ready for another shot'; }, 1450);
}

Object.values(inputs).forEach((input) => input.addEventListener('input', () => { updateLabels(); draw(performance.now()); }));
goalButton.addEventListener('click', triggerGoal);
window.addEventListener('resize', resize);
updateLabels();
resize();

