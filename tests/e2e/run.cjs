/**
 * Browser-Tests gegen den fertigen Build (dist/), wie in CLAUDE.md gefordert:
 *  1. alle 310 Fragen rendern (Frage, Optionen, Lösung, Nachfrage)
 *  2. MC-Auswertung inkl. Mehrfachantworten
 *  3. Export → Import ergibt denselben Lernstand (Code und Datei)
 *  4. App startet offline
 * Aufruf: npm run e2e   (baut vorher; nutzt das vorinstallierte Playwright/Chromium)
 */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { isDeepStrictEqual } = require('util');

const ROOT = path.join(__dirname, '..', '..');
const PORT = 4179;
const URL = `http://localhost:${PORT}/`;
const QS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/questions.json'), 'utf8'));
const KEY = 'elearning.state.v1';
const results = [];
const openPages = [];

const strip = (s) => (s || '').replace(/<\s*br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const baseState = (settings = {}) => ({ v: 1, cards: {}, days: [], sims: [], updatedAt: 0,
  settings: { topics: [], shuffle: false, simCount: 30, simMinutes: 60, simPassMark: 50, ...settings } });

async function test(name, fn) {
  const t = Date.now();
  try {
    await fn();
    results.push([true, name, Date.now() - t]);
    console.log(`  ✓ ${name} (${Date.now() - t} ms)`);
  } catch (e) {
    for (const pg of openPages) await pg.screenshot({ path: path.join(os.tmpdir(), `e2e-fail-${results.length}-${openPages.indexOf(pg)}.png`) }).catch(() => {});
    results.push([false, name, Date.now() - t]);
    console.log(`  ✗ ${name}\n      ${e.message.split('\n')[0]}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
async function fresh(browser, state, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', ...opts });
  const page = await ctx.newPage();
  openPages.push(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL);
  if (state) await page.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [KEY, state]);
  return { ctx, page, errors };
}

(async () => {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(URL)).ok) break; } catch { /* warten */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await chromium.launch();
  console.log('\nElearning – Browser-Tests\n');

  await test('Alle 310 Fragen rendern (Frage, MC-Optionen, Lösung, Prüfer-Nachfrage)', async () => {
    const { ctx, page, errors } = await fresh(browser, baseState());
    await page.goto(URL + '#/karten');
    await page.reload();
    for (let i = 0; i < QS.length; i++) {
      const q = QS[i];
      await page.waitForFunction((n) => document.querySelector('.qcount')?.textContent.startsWith(`${n} /`), i + 1);
      const text = norm(await page.locator('.qtext').innerText());
      assert(text === strip(q.question), `${q.id}: Fragetext weicht ab`);
      assert(!/<\/?[a-z]+>/i.test(text), `${q.id}: rohes HTML sichtbar`);
      if (q.type === 'mc') assert((await page.locator('.opt').count()) === q.options.length, `${q.id}: Optionen fehlen`);
      await page.keyboard.press(' ');
      await page.locator('.answer').waitFor();
      const ans = norm(await page.locator('.answer').innerText());
      assert(ans.includes(strip(q.explanation).slice(0, 40)), `${q.id}: Lösung fehlt`);
      if (q.followup) assert(ans.includes('PRÜFER FRAGT NACH') || ans.toLowerCase().includes('prüfer fragt nach'), `${q.id}: Nachfrage fehlt`);
      if (q.type === 'mc') assert((await page.locator('.opt.is-correct').count()) === q.correct.length, `${q.id}: richtige Optionen nicht markiert`);
      await page.keyboard.press('1');
    }
    await page.locator('.done').waitFor();
    const saved = await page.evaluate((k) => Object.keys(JSON.parse(localStorage.getItem(k)).cards).length, KEY);
    assert(saved === 310, `nur ${saved} Fragen im Lernstand`);
    assert(errors.length === 0, 'JS-Fehler: ' + errors.join('; '));
    await ctx.close();
  });

  await test('MC-Auswertung: Einfachauswahl richtig/falsch, Mehrfachantworten teilweise/vollständig', async () => {
    const { ctx, page, errors } = await fresh(browser, baseState({ topics: ['Sozialversicherung & BG'] }));
    await page.goto(URL + '#/quiz');
    await page.reload();
    const verdict = () => page.locator('.verdict').innerText();
    // S104: 2 richtige (A, B) – nur A → nicht ganz richtig
    assert((await page.locator('.hint-multi').innerText()).includes('(2)'), 'Hinweis auf 2 richtige fehlt');
    assert(await page.getByRole('button', { name: 'Prüfen' }).isDisabled(), 'Prüfen ohne Auswahl nicht gesperrt');
    await page.locator('.opt-btn').nth(0).click();
    await page.getByRole('button', { name: 'Prüfen' }).click();
    assert(/nicht ganz richtig/i.test(await verdict()), 'Teilantwort nicht als falsch gewertet');
    assert((await page.locator('.opt.is-missed').count()) === 1, 'fehlende richtige Antwort nicht markiert');
    await page.getByRole('button', { name: 'Weiter' }).click();
    // S105: A, B, D richtig – vollständig
    for (const i of [0, 1, 3]) await page.locator('.opt-btn').nth(i).click();
    await page.getByRole('button', { name: 'Prüfen' }).click();
    assert(/richtig!/i.test(await verdict()), 'vollständige Mehrfachantwort nicht richtig');
    await page.getByRole('button', { name: 'Weiter' }).click();
    // S108 (Einfachauswahl) überspringen
    await page.waitForFunction(() => document.querySelector('.qcount')?.textContent.startsWith('3 /'));
    await page.locator('.opt-btn').nth(0).click();
    await page.getByRole('button', { name: 'Weiter' }).click();
    await page.waitForFunction(() => document.querySelector('.qcount')?.textContent.startsWith('4 /'));
    // S109: A, C richtig – A, B, C (eine zu viel) → falsch
    for (const i of [0, 1, 2]) await page.locator('.opt-btn').nth(i).click();
    await page.getByRole('button', { name: 'Prüfen' }).click();
    assert(!/^richtig/i.test(await verdict()), 'zusätzliche falsche Option nicht bestraft');
    const cards = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).cards, KEY);
    assert(cards.S104.last === 'wrong' && cards.S105.last === 'right' && cards.S109.last === 'wrong', 'Lernstand falsch verbucht');
    // Einfachauswahl: S001 (B richtig)
    await ctx.close();
    const b = await fresh(browser, baseState({ topics: ['Rechnungswesen & Bilanz'] }));
    await b.page.goto(URL + '#/quiz');
    await b.page.reload();
    await b.page.locator('.opt-btn').nth(0).click();
    assert(/falsch/i.test(await b.page.locator('.verdict').innerText()), 'falsche Einfachauswahl nicht erkannt');
    assert((await b.page.locator('.opt.is-missed').count()) === 1, 'richtige Option nicht gezeigt');
    await b.page.getByRole('button', { name: 'Weiter' }).click();
    await b.page.waitForFunction(() => document.querySelector('.qcount')?.textContent.startsWith('2 /'));
    await b.page.locator('.opt-btn').nth(1).click(); // S002: B richtig
    assert(/richtig!/i.test(await b.page.locator('.verdict').innerText()), 'richtige Einfachauswahl nicht erkannt');
    assert(errors.length + b.errors.length === 0, 'JS-Fehler');
    await b.ctx.close();
  });

  await test('Export → Import ergibt denselben Lernstand (Code und Datei)', async () => {
    const cards = {};
    QS.forEach((q, i) => {
      if (i % 2) cards[q.id] = i % 5 ? { right: 2, wrong: 0, last: 'right', at: 1795000000000 + i, level: 0 }
        : { right: 0, wrong: 1, last: 'wrong', at: 1795000000000 + i, level: 2, due: '2026-11-23' };
    });
    const st = { ...baseState({ topics: ['Gefahrgut'], simCount: 40, simMinutes: 45, simPassMark: 60 }), cards,
      days: ['2026-11-18', '2026-11-19', '2026-11-20'], updatedAt: 1795000009999,
      sims: [{ at: 1795000000000, total: 30, correct: 21, passMark: 50, passed: true, seconds: 2400, limitMin: 60, wrongIds: ['S001'] }] };
    const A = await fresh(browser, st, { permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true });
    await A.page.goto(URL + '#/sichern');
    await A.page.reload();
    await A.page.getByRole('button', { name: 'Code kopieren' }).click();
    await A.page.locator('.ok-msg').waitFor();
    const code = await A.page.evaluate(() => navigator.clipboard.readText());
    assert(code.startsWith('EL1.'), 'Code nicht komprimiert');
    const B = await fresh(browser, null);
    await B.page.goto(URL + '#/sichern');
    await B.page.locator('#code-in').fill(code.match(/.{1,70}/g).join('\n'));
    await B.page.getByRole('button', { name: 'Code prüfen' }).click();
    assert((await B.page.locator('.preview').innerText()).includes('155 offen'), 'Vorschau falsch');
    await B.page.getByRole('button', { name: 'Übernehmen' }).click();
    let got = await B.page.evaluate((k) => localStorage.getItem(k), KEY);
    assert(isDeepStrictEqual(JSON.parse(got), st), 'Lernstand nach Code-Import verschieden');
    const [dl] = await Promise.all([A.page.waitForEvent('download'), A.page.getByRole('button', { name: 'Als Datei' }).click()]);
    const file = path.join(os.tmpdir(), dl.suggestedFilename());
    await dl.saveAs(file);
    await B.page.evaluate(() => localStorage.clear());
    await B.page.reload();
    await B.page.locator('input[type=file]').setInputFiles(file);
    await B.page.getByRole('button', { name: 'Übernehmen' }).click();
    got = await B.page.evaluate((k) => localStorage.getItem(k), KEY);
    assert(isDeepStrictEqual(JSON.parse(got), st), 'Lernstand nach Datei-Import verschieden');
    fs.rmSync(file, { force: true });
    await A.ctx.close();
    await B.ctx.close();
  });

  await test('App startet offline (Service Worker, alle Modi)', async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(URL);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 });
    await ctx.setOffline(true);
    const p2 = await ctx.newPage();
    await p2.goto(URL);
    assert((await p2.locator('.brand').innerText()) === 'ELEARNING', 'Startseite offline nicht geladen');
    for (const [route, sel] of [['karten', '.qtext'], ['quiz', '.qtext'], ['simulation', '.setup'], ['training', '.training-head'], ['statistik', '.tiles'], ['sichern', '.xfer']]) {
      await p2.goto(URL + '#/' + route);
      await p2.locator(sel).first().waitFor({ timeout: 5000 });
    }
    assert(await p2.evaluate(() => document.fonts.check('700 20px "Barlow Condensed"')), 'Schrift offline nicht geladen');
    assert(errors.length === 0, 'JS-Fehler');
    await ctx.close();
  });

  await browser.close();
  server.kill();
  const failed = results.filter((r) => !r[0]).length;
  console.log(`\n${results.length - failed} von ${results.length} Tests bestanden.\n`);
  process.exit(failed ? 1 : 0);
})();
