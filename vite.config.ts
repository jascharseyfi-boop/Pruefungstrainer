import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  // relative Pfade: dist/ läuft in jedem Ordner und auf Netlify Drop
  base: './',
  plugins: [preact()],
  build: { outDir: 'dist', emptyOutDir: true, assetsInlineLimit: 0 },
  test: { environment: 'node' },
});
