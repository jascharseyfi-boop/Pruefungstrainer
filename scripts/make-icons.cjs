// Erzeugt die App-Icons (PNG) aus einer SVG-Vorlage im Warntafel-Look.
// Aufruf: node scripts/make-icons.cjs   (nutzt das vorinstallierte Playwright/Chromium)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'public', 'icons');
const font = fs.readFileSync(path.join(root, 'node_modules/@fontsource/barlow/files/barlow-latin-800-normal.woff2')).toString('base64');

/** Schild in Weinrot: weißer Innenrahmen, Querbalken, „FK / GV“. pad = Sicherheitsrand (maskable). */
function svg(size, { pad = 0.14, bg = '#7b1e3a' } = {}) {
  const s = size;
  const w = s * (1 - 2 * pad);
  const h = w * 0.78;
  const x = (s - w) / 2;
  const y = (s - h) / 2;
  const b = w * 0.055; // Rahmenstärke
  const fs1 = h * 0.33;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <style>@font-face{font-family:B;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:800}
  text{font-family:B;font-weight:800;fill:#fff;text-anchor:middle;dominant-baseline:central;letter-spacing:${w * 0.012}px}</style>
  <rect width="${s}" height="${s}" fill="${bg}"/>
  <rect x="${x + b / 2}" y="${y + b / 2}" width="${w - b}" height="${h - b}" rx="${w * 0.035}" fill="none" stroke="#fff" stroke-width="${b}"/>
  <line x1="${x}" y1="${s / 2}" x2="${x + w}" y2="${s / 2}" stroke="#fff" stroke-width="${b}"/>
  <text x="${s / 2}" y="${y + h / 4 + b / 4}" font-size="${fs1}">FK</text>
  <text x="${s / 2}" y="${y + (3 * h) / 4 - b / 4}" font-size="${fs1}">GV</text>
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
    ['favicon-32.png', 32, { pad: 0.04 }],
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
