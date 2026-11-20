import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow/latin-700.css';
import '@fontsource/barlow/latin-800.css';
import './styles.css';
import { render } from 'preact';
import { App } from './app';
import { watchBadge } from './lib/badgeSpace';
import { registerSW } from './pwa';

render(<App />, document.getElementById('app')!);

registerSW();
watchBadge();
