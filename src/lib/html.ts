/**
 * Sicheres Rendern der Fragetexte.
 * Erlaubt sind nur <b>, <i>, <br>; <font> wird zu <span>.
 * Alle anderen Tags werden entfernt (ihr Text bleibt erhalten), alle Attribute verworfen,
 * Text wird HTML-escaped und offene Tags werden am Ende geschlossen.
 */

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESC[c]);
}

const MAP: Record<string, string> = { b: 'b', strong: 'b', i: 'i', em: 'i', font: 'span' };

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';
  // bereits vorhandene Entities (&amp; usw.) nicht doppelt escapen
  const text = (s: string) => escapeHtml(s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) =>
    ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' } as Record<string, string>)[e]));

  const re = /<\s*(\/)?\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/)?\s*>/g;
  let out = '';
  let last = 0;
  const stack: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) {
    out += text(input.slice(last, m.index));
    last = re.lastIndex;
    const closing = !!m[1];
    const name = m[2].toLowerCase();
    if (name === 'br') {
      out += '<br>';
      continue;
    }
    const tag = MAP[name];
    if (!tag) continue; // unbekanntes Tag: weglassen
    if (!closing) {
      stack.push(tag);
      out += `<${tag}>`;
    } else {
      const idx = stack.lastIndexOf(tag);
      if (idx === -1) continue; // verwaistes schließendes Tag
      while (stack.length > idx) out += `</${stack.pop()}>`;
    }
  }
  out += text(input.slice(last));
  while (stack.length) out += `</${stack.pop()}>`;
  return out;
}

/** Reiner Text ohne Tags, z. B. für Listen, Suche, aria-labels. */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/<\s*br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
