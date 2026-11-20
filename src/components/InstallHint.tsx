import { useState } from 'preact/hooks';

const KEY = 'elearning.installHint.dismissed';

function shouldShow(): boolean {
  try {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
    const standalone = (navigator as { standalone?: boolean }).standalone === true || matchMedia('(display-mode: standalone)').matches;
    return ios && !standalone && localStorage.getItem(KEY) !== '1';
  } catch {
    return false;
  }
}

/** Hinweis für iPhone/iPad in Safari: App zum Home-Bildschirm hinzufügen. */
export function InstallHint() {
  const [show, setShow] = useState(shouldShow);
  if (!show) return null;
  const close = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* egal */
    }
    setShow(false);
  };
  return (
    <section class="card install" aria-label="App installieren">
      <p>
        <b>Als App installieren:</b> unten auf <span class="share-ico" aria-label="Teilen">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M6 11v9h12v-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span> „Teilen“ tippen, dann <b>„Zum Home-Bildschirm“</b>. Danach läuft Elearning auch offline.
      </p>
      <button type="button" class="install-x" onClick={close} aria-label="Hinweis schließen">×</button>
    </section>
  );
}
