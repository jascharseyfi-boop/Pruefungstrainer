import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';

const OUT = 'dist';

/** Schreibt nach dem Build dist/sw.js mit vollständiger Precache-Liste und Inhalts-Hash als Version. */
function serviceWorker(): Plugin {
  let outDir = resolve(OUT);
  return {
    name: 'elearning-sw',
    apply: 'build',
    configResolved(c) {
      outDir = resolve(c.root, c.build.outDir);
    },
    closeBundle() {
      const files: string[] = [];
      const walk = (dir: string) => {
        for (const name of readdirSync(dir)) {
          const p = join(dir, name);
          if (statSync(p).isDirectory()) walk(p);
          else files.push(relative(outDir, p).split('\\').join('/'));
        }
      };
      walk(outDir);
      const precache = files.filter((f) => f !== 'sw.js' && f !== '_headers' && !f.endsWith('.map')).sort();
      const tpl = readFileSync(resolve('src/sw-template.js'), 'utf8');
      const hash = createHash('sha256').update(tpl);
      for (const f of precache) hash.update(f).update(readFileSync(join(outDir, f)));
      const version = hash.digest('hex').slice(0, 12);
      const list = ['./', ...precache.map((f) => `./${f}`)];
      writeFileSync(join(outDir, 'sw.js'), tpl.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(list, null, 2)));
      writeFileSync(join(outDir, 'version.txt'), `${version}\n`);
      console.log(`\n[sw] ${list.length} Dateien vorgeladen, Version ${version}`);
    },
  };
}

const buildDate = new Date();

export default defineConfig({
  // relative Pfade: dist/ läuft in jedem Ordner und auf Netlify Drop
  base: './',
  plugins: [preact(), serviceWorker()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })),
  },
  build: { outDir: OUT, emptyOutDir: true, assetsInlineLimit: 0 },
  test: { environment: 'node' },
});
