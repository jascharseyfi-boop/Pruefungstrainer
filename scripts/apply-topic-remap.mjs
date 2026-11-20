// Wendet data/topic-remap.json auf data/questions.json an.
// Aufruf: npm run apply-remap            -> Vorschau (ändert nichts)
//         npm run apply-remap -- --write -> schreibt questions.json
import { readFileSync, writeFileSync } from 'node:fs';

const qFile = new URL('../data/questions.json', import.meta.url);
const rFile = new URL('../data/topic-remap.json', import.meta.url);
const qs = JSON.parse(readFileSync(qFile, 'utf8'));
const remap = JSON.parse(readFileSync(rFile, 'utf8'));
const byId = new Map(qs.map((q) => [q.id, q]));
const write = process.argv.includes('--write');

const changes = [];
for (const q of qs) {
  const to = remap.renameTopics?.[q.topic];
  if (to) changes.push([q, to]);
}
for (const mv of remap.moves) {
  for (const id of mv.ids) {
    const q = byId.get(id);
    if (!q) throw new Error(`Unbekannte id im Remap: ${id}`);
    const i = changes.findIndex(([c]) => c === q);
    if (i >= 0) changes.splice(i, 1);
    if (q.topic !== mv.to) changes.push([q, mv.to]);
  }
}
for (const [q, to] of changes) {
  console.log(`${q.id}  ${q.topic}  ->  ${to}`);
  q.topic = to;
}
const count = qs.reduce((m, q) => ((m[q.topic] = (m[q.topic] || 0) + 1), m), {});
console.log(`\n${changes.length} Änderungen. Neue Verteilung:`, count);
if (write) {
  writeFileSync(qFile, JSON.stringify(qs, null, 1) + '\n');
  console.log('questions.json geschrieben.');
} else console.log('(Vorschau – mit "-- --write" anwenden)');
