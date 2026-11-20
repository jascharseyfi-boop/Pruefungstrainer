/**
 * Netlify blendet im kostenlosen Tarif unten rechts ein festes Feld „Powered by Netlify“ ein
 * (iframe#nl-badge-frame, ca. 64 px hoch). Damit es keine Buttons verdeckt, messen wir es und
 * setzen --badge-space; die unteren Leisten enden dann oberhalb des Feldes.
 * Ohne Feld (lokal, offline, nach „Close“) bleibt --badge-space = 0.
 */
const ID = 'nl-badge-frame';
const MAX = 120; // aufgeklapptes Menü des Feldes nicht als Dauerplatz übernehmen
const GAP = 8; // Luft zwischen Feld und Buttons

export function measureBadgeSpace(el: HTMLElement | null, viewportHeight: number): number | null {
  if (!el || !el.isConnected) return 0;
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position !== 'fixed') return 0;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return 0;
  const space = Math.ceil(viewportHeight - r.top);
  if (space <= 0) return 0;
  return space > MAX ? null : space + GAP; // null = vorübergehend größer (Menü offen) → alten Wert behalten
}

export function watchBadge(): void {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;
  const root = document.documentElement;
  let current = -1;
  let ro: ResizeObserver | null = null;
  let observed: HTMLElement | null = null;

  const update = () => {
    const el = document.getElementById(ID);
    if (el !== observed) {
      ro?.disconnect();
      observed = el;
      if (el && typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(update);
        ro.observe(el);
      }
    }
    const v = measureBadgeSpace(el, window.innerHeight);
    if (v === null || v === current) return;
    current = v;
    root.style.setProperty('--badge-space', `${v}px`);
    root.classList.toggle('has-badge', v > 0);
  };

  // Feld wird von Netlify nachträglich eingefügt bzw. beim Schließen entfernt/verändert
  new MutationObserver(update).observe(document.body, { childList: true, subtree: false, attributes: true, attributeFilter: ['style', 'class'] });
  const mo = new MutationObserver(update);
  const attach = () => {
    const el = document.getElementById(ID);
    if (el) mo.observe(el, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
  };
  new MutationObserver(attach).observe(document.body, { childList: true });
  window.addEventListener('resize', update);
  attach();
  update();
}
