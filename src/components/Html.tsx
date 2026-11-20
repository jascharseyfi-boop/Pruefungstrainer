import { sanitizeHtml } from '../lib/html';

/** Rendert Fragetexte mit Tag-Whitelist (b, i, br, font→span). */
export function Html({ html, class: cls, tag = 'div' }: { html?: string; class?: string; tag?: 'div' | 'span' | 'p' }) {
  const Tag = tag;
  return <Tag class={cls} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
