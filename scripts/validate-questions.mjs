// Prüft data/questions.json auf Struktur- und Inhaltsfehler.
// Aufruf: npm run validate   (Exit-Code 1 bei Fehlern)
import { readFileSync } from 'node:fs';

const file = new URL('../data/questions.json', import.meta.url);
const qs = JSON.parse(readFileSync(file, 'utf8'));
const errors = [];
const warn = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);

const TYPES = new Set(['mc', 'open', 'calc', 'case']);
const SOURCES = new Set(['schriftlich', 'muendlich']);
const ALLOWED_TAGS = new Set(['b', 'i', 'br', 'font']);
const ids = new Set();

if (!Array.isArray(qs)) {
  console.error('questions.json ist kein Array');
  process.exit(1);
}

for (const q of qs) {
  const id = q.id ?? '(ohne id)';
  if (typeof q.id !== 'string' || !q.id) err(id, 'id fehlt');
  else if (ids.has(q.id)) err(id, 'doppelte id');
  ids.add(q.id);
  if (!SOURCES.has(q.source)) err(id, `source ungültig: ${q.source}`);
  if (!Number.isInteger(q.part)) err(id, 'part ist keine Zahl');
  for (const f of ['section', 'topic', 'question', 'explanation']) {
    if (typeof q[f] !== 'string' || !q[f].trim()) err(id, `${f} fehlt/leer`);
  }
  if (!TYPES.has(q.type)) err(id, `type ungültig: ${q.type}`);

  if (q.type === 'mc') {
    if (!Array.isArray(q.options) || q.options.length < 2) err(id, 'mc braucht mind. 2 options');
    if (!Array.isArray(q.correct) || q.correct.length === 0) err(id, 'mc braucht correct');
    else {
      const n = q.options?.length ?? 0;
      for (const c of q.correct) if (!Number.isInteger(c) || c < 0 || c >= n) err(id, `correct-Index ${c} außerhalb 0..${n - 1}`);
      if (new Set(q.correct).size !== q.correct.length) err(id, 'correct enthält Doppel');
      if (q.correct.length === n) warn.push(`${id}: alle Optionen richtig`);
    }
    if (q.options && new Set(q.options.map((o) => o.trim())).size !== q.options.length) err(id, 'doppelte Option');
  } else {
    if (q.options !== undefined) err(id, `options bei type ${q.type}`);
    if (q.correct !== undefined) err(id, `correct bei type ${q.type}`);
  }
  if (q.followup !== undefined && (typeof q.followup !== 'string' || !q.followup.trim())) err(id, 'followup leer');

  const texts = [q.question, q.explanation, q.followup, ...(q.options ?? [])].filter(Boolean);
  for (const t of texts) {
    for (const m of t.matchAll(/<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)/g)) {
      if (!ALLOWED_TAGS.has(m[1].toLowerCase())) err(id, `nicht erlaubtes Tag <${m[1]}>`);
    }
    const open = (t.match(/<b>/gi) || []).length, close = (t.match(/<\/b>/gi) || []).length;
    if (open !== close) warn.push(`${id}: <b> nicht ausgeglichen (${open}/${close})`);
  }
}

const by = (k) => qs.reduce((m, q) => ((m[q[k]] = (m[q[k]] || 0) + 1), m), {});
console.log(`Fragen: ${qs.length}`);
console.log('Typen:', by('type'));
console.log('Themen:', by('topic'));
console.log(`MC mit mehreren richtigen: ${qs.filter((q) => q.type === 'mc' && q.correct?.length > 1).length}`);
if (warn.length) console.log(`\nHinweise (${warn.length}):\n  ` + warn.join('\n  '));
if (errors.length) {
  console.error(`\nFEHLER (${errors.length}):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log('\nOK – keine Fehler.');
