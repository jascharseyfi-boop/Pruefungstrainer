/**
 * Export/Import des Lernstands.
 * Code-Format:  "EL1." + base64url(deflate-raw(JSON kompakt))   (komprimiert)
 *               "EL0." + base64url(JSON kompakt)                 (Rückfall ohne CompressionStream)
 * Datei-Format: lesbares JSON { app: "elearning", format: 1, exportedAt, code }
 */
import { normalizeState, SCHEMA_VERSION, type CardState, type LearnState } from '../store/model';

type PackedCard = [number, number, 0 | 1, number, number, string?];
interface Packed {
  v: number;
  c: Record<string, PackedCard>;
  d: string[];
  s: LearnState['sims'];
  st: LearnState['settings'];
  u: number;
  x: number; // Exportzeitpunkt
}

export function pack(s: LearnState, now = Date.now()): Packed {
  const c: Record<string, PackedCard> = {};
  for (const [id, k] of Object.entries(s.cards)) {
    const p: PackedCard = [k.right, k.wrong, k.last === 'wrong' ? 1 : 0, k.at, k.level];
    if (k.due) p.push(k.due);
    c[id] = p;
  }
  return { v: s.v, c, d: s.days, s: s.sims, st: s.settings, u: s.updatedAt, x: now };
}

export function unpack(p: unknown): { state: LearnState; exportedAt: number } {
  if (!p || typeof p !== 'object') throw new Error('Kein Lernstand');
  const o = p as Partial<Packed>;
  if (typeof o.v !== 'number' || !o.c || typeof o.c !== 'object') throw new Error('Kein Lernstand');
  const cards: Record<string, CardState> = {};
  for (const [id, a] of Object.entries(o.c)) {
    if (!Array.isArray(a)) continue;
    cards[id] = { right: a[0], wrong: a[1], last: a[2] === 1 ? 'wrong' : 'right', at: a[3], level: a[4], ...(a[5] ? { due: a[5] } : {}) };
  }
  const state = normalizeState({ v: o.v, cards, days: o.d, sims: o.s, settings: o.st, updatedAt: o.u });
  return { state, exportedAt: Number(o.x) || state.updatedAt };
}

// ---------- Base64url ----------
function toB64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64(s: string): Uint8Array {
  const b = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b + '==='.slice((b.length + 3) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const res = new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

const hasCompression = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

export async function encodeCode(s: LearnState, now = Date.now()): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(pack(s, now)));
  if (hasCompression()) {
    try {
      return 'EL1.' + toB64(await pipe(json, new CompressionStream('deflate-raw')));
    } catch {
      /* Rückfall unten */
    }
  }
  return 'EL0.' + toB64(json);
}

/** Akzeptiert Code (auch mit Zeilenumbrüchen/Leerzeichen) oder den Inhalt einer Exportdatei. */
export async function decodeInput(input: string): Promise<{ state: LearnState; exportedAt: number }> {
  let text = input.trim();
  if (!text) throw new Error('Bitte einen Code einfügen oder eine Datei wählen.');
  if (text.startsWith('{')) {
    let obj: unknown;
    try {
      obj = JSON.parse(text);
    } catch {
      throw new Error('Die Datei ist kein gültiger Lernstand.');
    }
    const o = obj as { app?: string; code?: string };
    if (o && o.app === 'elearning' && typeof o.code === 'string') text = o.code.trim();
    else throw new Error('Die Datei ist kein Elearning-Lernstand.');
  }
  text = text.replace(/\s+/g, '');
  const m = /^EL([01])\.([A-Za-z0-9_-]+)$/.exec(text);
  if (!m) throw new Error('Der Code ist unvollständig oder ungültig. Er beginnt mit „EL1.“.');
  let bytes: Uint8Array;
  try {
    bytes = fromB64(m[2]);
    if (m[1] === '1') {
      if (!hasCompression()) throw new Error('Dieser Browser kann den komprimierten Code nicht lesen. Bitte Safari/Chrome aktualisieren.');
      bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Dieser Browser')) throw e;
    throw new Error('Der Code ist beschädigt (beim Kopieren abgeschnitten?).');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error('Der Code ist beschädigt (beim Kopieren abgeschnitten?).');
  }
  if ((parsed as { v?: number })?.v !== undefined && (parsed as { v: number }).v > SCHEMA_VERSION) {
    throw new Error('Der Lernstand stammt aus einer neueren App-Version. Bitte zuerst die App aktualisieren.');
  }
  return unpack(parsed);
}

export function fileContent(code: string, now = Date.now()): string {
  return JSON.stringify({ app: 'elearning', format: 1, exportedAt: new Date(now).toISOString(), code }, null, 2);
}

export function fileName(now = new Date()): string {
  const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return `elearning-lernstand-${d}.json`;
}
