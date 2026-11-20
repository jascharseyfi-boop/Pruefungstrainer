import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-600.css';
import '@fontsource/source-sans-3/latin-700.css';
import './styles.css';
import { render } from 'preact';
import { App } from './app';
import { watchBadge } from './lib/badgeSpace';
import { registerSW } from './pwa';

render(<App />, document.getElementById('app')!);

registerSW();
watchBadge();
