/* Original pixel scenery shared by the discovery sequence and the Reflect map. */
window.PixelWorld = (() => {
  const colors = { ink: '#253246', grass: '#74bd85', light: '#b4d88a', moss: '#428c72',
    earth: '#8e6059', darkEarth: '#5a414f', gold: '#ffd58a', blue: '#8cbce0' };

  function rect(c, x, y, w, h, color) {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function sprite(c, rows, palette, x, y, size = 1) {
    rows.forEach((row, iy) => [...row].forEach((value, ix) => {
      if (palette[value]) rect(c, x + ix * size, y + iy * size, size, size, palette[value]);
    }));
  }
  const slime = [
    '    aaaa    ', '  aabbbbaa  ', ' abbbbbbbba ', 'abccbbbbbbba',
    'abccbbbbbbba', 'abbbdbbdbbba', 'abbbbbbbbbba', ' abbeeeebba ',
    '  aabbbbaa  ', '    aaaa    ',
  ];
  const slimePalette = { a: '#285969', b: '#87d5b0', c: '#c9efb3', d: '#253246', e: '#f9bb94' };

  function tree(c, x, y, autumn = false, scale = 1) {
    c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(scale, scale);
    rect(c, -3, -22, 7, 26, '#503c4c'); rect(c, -1, -21, 3, 24, '#aa7464');
    rect(c, 2, -15, 8, 3, '#503c4c'); rect(c, 7, -21, 3, 8, '#503c4c');
    const shades = autumn ? ['#b2696f', '#e99d7d', '#ffd099'] : ['#326b68', '#509579', '#83bd89'];
    rect(c, -13, -37, 26, 19, shades[0]); rect(c, -18, -31, 34, 10, shades[0]);
    rect(c, -9, -43, 19, 24, shades[1]); rect(c, -14, -35, 27, 11, shades[1]);
    rect(c, -5, -43, 11, 4, shades[2]); rect(c, -12, -34, 8, 4, shades[2]);
    rect(c, 5, -30, 8, 3, shades[2]); rect(c, -15, -25, 4, 3, shades[1]);
    c.restore();
  }
  function mushroom(c, x, y, color = '#df8b94') {
    rect(c, x + 3, y - 3, 4, 7, '#ffe3b1'); rect(c, x + 1, y - 6, 8, 4, '#704658');
    rect(c, x - 1, y - 5, 12, 3, color); rect(c, x + 2, y - 8, 6, 3, color);
    rect(c, x + 2, y - 5, 2, 2, '#fff1d2'); rect(c, x + 6, y - 7, 2, 2, '#fff1d2');
  }
  function lantern(c, x, y) {
    rect(c, x, y - 18, 2, 20, '#4b414b'); rect(c, x - 1, y - 20, 7, 2, '#4b414b');
    rect(c, x + 3, y - 18, 6, 8, '#624856'); rect(c, x + 4, y - 17, 4, 5, '#ffcb7d');
    rect(c, x + 5, y - 16, 2, 3, '#fff1ba'); rect(c, x + 4, y - 10, 4, 1, '#b97e64');
  }
  function island(c, x, y) {
    rect(c, x - 33, y - 2, 66, 10, colors.ink);
    rect(c, x - 28, y + 8, 56, 9, colors.ink); rect(c, x - 21, y + 17, 42, 7, colors.ink);
    rect(c, x - 12, y + 24, 26, 5, colors.ink); rect(c, x - 5, y + 29, 13, 4, colors.ink);
    rect(c, x - 31, y, 62, 7, colors.earth); rect(c, x - 26, y + 7, 52, 9, colors.earth);
    rect(c, x - 19, y + 16, 38, 6, colors.darkEarth); rect(c, x - 10, y + 22, 22, 5, colors.darkEarth);
    rect(c, x - 29, y - 4, 58, 8, colors.moss); rect(c, x - 24, y - 7, 48, 7, colors.grass);
    rect(c, x - 19, y - 8, 39, 3, colors.light);
    for (let i = 0; i < 9; i++) {
      const px = x - 25 + i * 6;
      rect(c, px, y + 3, 3, 3 + (i % 3) * 2, colors.moss);
      rect(c, px + 1, y + 11 + (i % 2) * 4, 3, 2, '#be8670');
    }
    rect(c, x + 16, y + 16, 2, 12, colors.moss); rect(c, x + 18, y + 22, 4, 2, colors.grass);
    rect(c, x - 20, y + 15, 2, 12, colors.moss); rect(c, x - 23, y + 20, 4, 2, colors.grass);
  }
  function site(c, kind, x, y) {
    island(c, x, y);
    tree(c, x - 22, y - 6, kind === 'terrain', .7);
    mushroom(c, x + 21, y - 5); mushroom(c, x - 32, y - 1, '#a59adb');
    lantern(c, x + 27, y - 4);
    if (kind === 'keyboard') {
      rect(c, x - 20, y - 24, 41, 20, '#26344c');
      rect(c, x - 18, y - 22, 37, 16, '#53627d');
      const gauge = ['#dc655e', '#e38a53', '#e4b75c', '#dbcc67', '#a8cb75', '#7fc49a'];
      for (let i = 0; i < 12; i++) rect(c, x - 17 + i * 3, y - 21, 2, 2, i < 6 ? gauge[i] : '#29354a');
      for (let row = 0; row < 3; row++) for (let col = 0; col < 11; col++)
        rect(c, x - 16 + col * 3, y - 17 + row * 3, 2, 2, '#b1bacb');
      rect(c, x - 7, y - 8, 14, 2, '#d7d8d4');
    } else if (kind === 'sifter') {
      // Ore falls through a little sieve to become a bright pixel gem.
      rect(c, x - 18, y - 28, 36, 4, '#8c91b2');
      rect(c, x - 16, y - 24, 4, 14, '#68738f');
      rect(c, x + 12, y - 24, 4, 14, '#68738f');
      rect(c, x - 12, y - 14, 24, 4, '#edc278');
      for (let i = 0; i < 3; i++) {
        rect(c, x - 9 + i * 8, y - 22, 3, 8, '#edc278');
        rect(c, x - 9 + i * 8, y - 39 + i * 3, 3, 3, i === 1 ? '#b9ec78' : '#edc278');
      }
      rect(c, x - 5, y - 8, 10, 3, '#b9ec78');
      rect(c, x - 8, y - 5, 16, 3, '#dcf1c0');
      rect(c, x - 5, y - 2, 10, 3, '#b9ec78');
      rect(c, x - 2, y + 1, 4, 3, '#83b765');
    } else if (kind === 'goal') {
      // A pixel goal frame, recessed net, and ball for the playable sandbox.
      rect(c, x - 23, y - 32, 43, 27, '#26344c');
      rect(c, x - 20, y - 29, 37, 23, '#426578');
      for (let col = 0; col < 7; col++) rect(c, x - 19 + col * 6, y - 28, 1, 23, '#a0c8c7');
      for (let row = 0; row < 5; row++) rect(c, x - 20, y - 28 + row * 5, 38, 1, '#a0c8c7');
      rect(c, x - 25, y - 34, 48, 4, '#ffe9be');
      rect(c, x - 25, y - 32, 4, 29, '#ffe9be');
      rect(c, x + 19, y - 32, 4, 29, '#ffe9be');
      rect(c, x - 21, y - 3, 40, 3, '#7acb9d');
      rect(c, x - 8, y - 10, 12, 9, '#fff0cf');
      rect(c, x - 11, y - 8, 18, 5, '#fff0cf');
      rect(c, x - 5, y - 8, 4, 4, '#39485f');
      rect(c, x + 3, y - 5, 3, 3, '#39485f');
    } else if (kind === 'orbit') {
      rect(c, x - 8, y - 17, 17, 11, '#526281'); rect(c, x - 10, y - 20, 21, 4, '#2c3457');
      rect(c, x - 6, y - 28, 13, 9, '#9aaed1'); rect(c, x - 3, y - 31, 7, 3, '#cad1dc');
      rect(c, x - 2, y - 13, 5, 7, '#ffe2a0');
      rect(c, x + 5, y - 28, 10, 4, '#577c9c'); rect(c, x + 12, y - 30, 5, 7, '#b1d8dd');
      rect(c, x + 14, y - 29, 2, 5, '#e0ebd9');
    } else if (kind === 'solar') {
      for (let i = 0; i < 3; i++) {
        const xx = x - 11 + i * 10;
        rect(c, xx, y - 15, 2, 11, '#4d6b69'); rect(c, xx - 2, y - 24, 10, 10, '#344d70');
        rect(c, xx - 1, y - 23, 8, 7, '#87b8cd');
        rect(c, xx + 2, y - 23, 1, 7, '#d5e5d3'); rect(c, xx - 1, y - 20, 8, 1, '#d5e5d3');
      }
      mushroom(c, x - 10, y - 5, '#f3c778');
    } else if (kind === 'dish') {
      rect(c, x - 8, y - 20, 20, 15, '#eed0a4'); rect(c, x - 10, y - 22, 24, 4, '#745065');
      rect(c, x - 14, y - 26, 32, 5, '#dd8d94'); rect(c, x - 10, y - 31, 24, 5, '#eea0a0');
      rect(c, x - 5, y - 34, 14, 4, '#ffbeb0'); rect(c, x - 7, y - 27, 4, 3, '#ffe6bd');
      rect(c, x + 8, y - 26, 4, 3, '#ffe6bd'); rect(c, x - 1, y - 14, 5, 9, '#785471');
      rect(c, x + 6, y - 17, 4, 4, '#99cfce'); rect(c, x + 1, y - 41, 2, 8, '#8bb7cc');
      rect(c, x - 2, y - 43, 8, 2, '#c6dfd7');
    } else {
      rect(c, x - 8, y - 32, 17, 26, '#30435b'); rect(c, x - 11, y - 28, 23, 21, '#30435b');
      rect(c, x - 7, y - 31, 15, 24, '#7d92bc'); rect(c, x - 10, y - 27, 21, 19, '#7d92bc');
      rect(c, x - 5, y - 28, 11, 21, '#8cdfbd'); rect(c, x - 7, y - 24, 15, 17, '#8cdfbd');
      rect(c, x - 2, y - 24, 5, 17, '#d0f1c3'); rect(c, x + 2, y - 19, 3, 8, '#eff8d1');
      rect(c, x - 12, y - 6, 25, 3, '#adb0c1');
    }
    sprite(c, slime, slimePalette, x + 10, y - 6, .7);
    for (let i = 0; i < 4; i++) {
      rect(c, x - 12 + i * 8, y - 2 + (i % 2) * 2, 1, 2, '#ffdea1');
    }
  }

  function drawTerrain(canvas, width, height, projects, ambient) {
    const pixel = width < 650 ? 3 : 4;
    canvas.width = Math.max(1, Math.ceil(width / pixel));
    canvas.height = Math.max(1, Math.ceil(height / pixel));
    const c = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    c.imageSmoothingEnabled = false;
    const sky = ['#1a2945', '#23354f', '#2b4359', '#305361', '#335e62'];
    sky.forEach((col, i) => rect(c, 0, i * h / 5, w, h / 5 + 1, col));
    for (let i = 0; i < 90; i++) {
      const x = (i * 71 + i * i * 11) % w, y = (i * 29 + 7) % Math.max(1, Math.round(h * .72));
      rect(c, x, y, 1, 1, i % 4 ? '#8caaa8' : '#ffe0aa');
      if (i % 12 === 0) { rect(c, x - 1, y, 3, 1, '#ffe0aa'); rect(c, x, y - 1, 1, 3, '#ffe0aa'); }
    }
    const moonX = Math.round(w * .52), moonY = Math.round(h * .12);
    rect(c, moonX - 6, moonY - 9, 12, 18, '#d4dfc0'); rect(c, moonX - 9, moonY - 6, 18, 12, '#d4dfc0');
    rect(c, moonX, moonY - 10, 10, 16, sky[0]); rect(c, moonX + 2, moonY - 8, 10, 16, sky[0]);
    for (let layer = 0; layer < 3; layer++) {
      const shade = ['#2a4559', '#264752', '#244647'][layer];
      for (let x = 0; x < w; x += 4) {
        const yy = h * (.52 + layer * .13) + Math.sin(x * .029 + layer * 2) * 9 + Math.sin(x * .071) * 4;
        rect(c, x, yy, 4, h - yy, shade);
      }
    }
    for (let i = 0; i < Math.ceil(w / 15); i++) {
      const x = i * 17, y = h * .91 + Math.sin(i * 7) * 5;
      tree(c, x, y, i % 8 === 0, .6 + (i % 3) * .12);
    }
    projects.forEach(project => site(c, project.kind || project.art,
      Math.round(project.x * w), Math.round(project.y * h - 68 / pixel)));
    for (let i = 0; i < 18; i++) {
      const x = (i * 43 + 19) % w, y = h * .3 + (i * 17 % Math.max(1, Math.round(h * .55)));
      rect(c, x, y, 1, 1, '#ffe7a4'); rect(c, x - 1, y, 1, 1, '#93ad86');
    }
    if (ambient) {
      ambient.width = canvas.width; ambient.height = canvas.height;
      ambient.getContext('2d').drawImage(canvas, 0, 0);
    }
  }
  function drawInstallation(c, kind, cx, cy, scale = 1) {
    c.save(); c.translate(Math.round(cx), Math.round(cy + 18 * scale));
    const size = Math.max(1, Math.round(2 * scale)); c.scale(size, size);
    c.imageSmoothingEnabled = false;
    site(c, kind, 0, 0);
    c.restore();
  }
  return { drawTerrain, drawInstallation };
})();
