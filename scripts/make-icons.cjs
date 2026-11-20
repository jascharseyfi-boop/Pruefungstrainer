// Erzeugt die App-Icons (PNG) aus einer SVG-Vorlage im Warntafel-Look.
// Aufruf: node scripts/make-icons.cjs   (nutzt das vorinstallierte Playwright/Chromium)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'public', 'icons');
const font = fs.readFileSync(path.join(root, 'node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2')).toString('base64');

/** Warntafel: orange, schwarzer Rahmen, Querbalken. pad = Sicherheitsrand für maskable Icons. */
function svg(size, { pad = 0.14, bg = '#323b44', rounded = false } = {}) {
  const s = size;
  const w = s * (1 - 2 * pad);
  const h = w * 0.78;
  const x = (s - w) / 2;
  const y = (s - h) / 2;
  const b = w * 0.07; // Rahmenstärke
  const r = rounded ? s * 0.18 : 0;
  const fs1 = h * 0.36;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <style>@font-face{font-family:B;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:700}
  text{font-family:B;font-weight:700;fill:#111;text-anchor:middle;dominant-baseline:central;letter-spacing:${w * 0.01}px}</style>
  <rect width="${s}" height="${s}" rx="${r}" fill="${bg}"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.04}" fill="#111"/>
  <rect x="${x + b}" y="${y + b}" width="${w - 2 * b}" height="${(h - 3 * b) / 2}" rx="${w * 0.015}" fill="#e8700a"/>
  <rect x="${x + b}" y="${y + 2 * b + (h - 3 * b) / 2}" width="${w - 2 * b}" height="${(h - 3 * b) / 2}" rx="${w * 0.015}" fill="#e8700a"/>
  <text x="${s / 2}" y="${y + b + (h - 3 * b) / 4}" font-size="${fs1}">FK</text>
  <text x="${s / 2}" y="${y + 2 * b + (3 * (h - 3 * b)) / 4}" font-size="${fs1}">GV</text>
</svg>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const jobs = [
    ['apple-touch-icon.png', 180, { pad: 0.1 }],
    ['icon-192.png', 192, { pad: 0.1 }],
    ['icon-512.png', 512, { pad: 0.1 }],
    ['icon-maskable-512.png', 512, { pad: 0.2 }],
    ['favicon-32.png', 32, { pad: 0.02, bg: 'transparent' }],
  ];
  for (const [name, size, opt] of jobs) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg(size, opt)}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('svg').screenshot({ path: path.join(out, name), omitBackground: true });
    console.log('✓', name);
  }
  await browser.close();
})();
