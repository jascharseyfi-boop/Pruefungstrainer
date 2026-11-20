/** Registriert den Service Worker und meldet verfügbare Updates. */
type Listener = (available: boolean) => void;
const listeners = new Set<Listener>();
let waiting: ServiceWorker | null = null;

function announce(w: ServiceWorker) {
  waiting = w;
  for (const l of listeners) l(true);
}

export function onUpdate(l: Listener): () => void {
  listeners.add(l);
  if (waiting) l(true);
  return () => listeners.delete(l);
}

/** Neue Version aktivieren und neu laden. */
export function applyUpdate(): void {
  if (!waiting) return location.reload();
  waiting.postMessage('SKIP_WAITING');
}

export function registerSW(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      if (reg.waiting && navigator.serviceWorker.controller) announce(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w?.addEventListener('statechange', () => {
          // nur melden, wenn schon eine Version läuft (nicht bei der Erstinstallation)
          if (w.state === 'installed' && navigator.serviceWorker.controller) announce(w);
        });
      });
      // iOS prüft selten von selbst – beim Zurückkehren in die App nachsehen
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    } catch {
      /* ohne Service Worker läuft die App online weiter */
    }
  });
}
