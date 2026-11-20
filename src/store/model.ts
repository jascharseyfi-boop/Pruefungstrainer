/**
 * Lernstand-Modell. Reine Funktionen ohne Speicherzugriff – dadurch testbar
 * und später für einen echten Sync wiederverwendbar.
 */

export const SCHEMA_VERSION = 1;

/** Wiederholungsabstände im Fehler-Training (Tage) je Stufe 1–4. */
export const INTERVALS = [1, 3, 7, 14] as const;
export const MAX_LEVEL = INTERVALS.length;

export interface CardState {
  /** wie oft richtig / falsch beantwortet */
  right: number;
  wrong: number;
  /** letzte Antwort */
  last: 'right' | 'wrong';
  /** Zeitpunkt der letzten Antwort (ms) */
  at: number;
  /** Stufe im Fehler-Training: 0 = nicht im Training, 1–4 = Stufe */
  level: number;
  /** fällig ab (YYYY-MM-DD), nur wenn level > 0 */
  due?: string;
}

export interface SimResult {
  /** Zeitpunkt (ms) */
  at: number;
  total: number;
  correct: number;
  /** Bestehensgrenze in Prozent */
  passMark: number;
  passed: boolean;
  /** benötigte Zeit in Sekunden */
  seconds: number;
  /** Zeitlimit in Minuten (0 = ohne) */
  limitMin: number;
  /** falsch beantwortete Fragen-IDs */
  wrongIds: string[];
}

export interface Settings {
  topics: string[]; // leer = alle
  shuffle: boolean;
  simCount: number;
  simMinutes: number;
  simPassMark: number;
}

export interface LearnState {
  v: number;
  /** pro Frage-ID */
  cards: Record<string, CardState>;
  /** Lerntage (YYYY-MM-DD), aufsteigend, ohne Doppel */
  days: string[];
  sims: SimResult[];
  settings: Settings;
  /** letzte Änderung (ms) – Grundlage für späteren Sync */
  updatedAt: number;
}

export const DEFAULT_SETTINGS: Settings = {
  topics: [],
  shuffle: true,
  simCount: 30,
  simMinutes: 60,
  simPassMark: 50,
};

export function emptyState(): LearnState {
  return { v: SCHEMA_VERSION, cards: {}, days: [], sims: [], settings: { ...DEFAULT_SETTINGS }, updatedAt: 0 };
}

// ---------- Datum (lokale Zeit) ----------

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

// ---------- Antworten verbuchen ----------

/**
 * Verbucht eine Antwort. Falsch → Stufe 1, morgen fällig.
 * Richtig im Training → nächste Stufe; nach Stufe 4 richtig → Training beendet.
 * Richtig außerhalb des Trainings → nur Zähler.
 */
export function applyAnswer(prev: CardState | undefined, correct: boolean, now: Date = new Date()): CardState {
  const today = dayKey(now);
  const base: CardState = prev ? { ...prev } : { right: 0, wrong: 0, last: 'right', at: 0, level: 0 };
  base.at = now.getTime();
  if (!correct) {
    base.wrong++;
    base.last = 'wrong';
    base.level = 1;
    base.due = addDays(today, INTERVALS[0]);
    return base;
  }
  base.right++;
  base.last = 'right';
  if (base.level > 0) {
    if (base.level >= MAX_LEVEL) {
      base.level = 0;
      delete base.due;
    } else {
      base.level++;
      base.due = addDays(today, INTERVALS[base.level - 1]);
    }
  }
  return base;
}

export function recordAnswer(state: LearnState, id: string, correct: boolean, now: Date = new Date()): LearnState {
  return touchDay(
    { ...state, cards: { ...state.cards, [id]: applyAnswer(state.cards[id], correct, now) }, updatedAt: now.getTime() },
    now,
  );
}

export function touchDay(state: LearnState, now: Date = new Date()): LearnState {
  const k = dayKey(now);
  if (state.days[state.days.length - 1] === k || state.days.includes(k)) return state;
  return { ...state, days: [...state.days, k].sort(), updatedAt: now.getTime() };
}

export function addSim(state: LearnState, r: SimResult): LearnState {
  return { ...state, sims: [...state.sims, r], updatedAt: r.at };
}

// ---------- Auswertung ----------

export type Mastery = 'sicher' | 'wackelig' | 'offen';

/** offen = nie beantwortet; wackelig = im Fehler-Training oder zuletzt falsch; sicher = sonst. */
export function mastery(c: CardState | undefined): Mastery {
  if (!c) return 'offen';
  if (c.level > 0 || c.last === 'wrong') return 'wackelig';
  return 'sicher';
}

export function isDue(c: CardState | undefined, today: string = dayKey()): boolean {
  return !!c && c.level > 0 && !!c.due && c.due <= today;
}

/** Lernserie: aufeinanderfolgende Tage bis heute (oder bis gestern, falls heute noch nicht gelernt). */
export function streak(days: string[], today: string = dayKey()): number {
  const set = new Set(days);
  let cur = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(cur)) {
    n++;
    cur = addDays(cur, -1);
  }
  return n;
}

// ---------- Validierung / Migration (für Laden und Import) ----------

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

/** Prüft und normalisiert einen geladenen/importierten Stand. Wirft bei unbrauchbaren Daten. */
export function normalizeState(raw: unknown): LearnState {
  if (!isObj(raw)) throw new Error('Kein gültiger Lernstand');
  if (typeof raw.v !== 'number' || raw.v > SCHEMA_VERSION) throw new Error('Unbekannte Version des Lernstands');
  const s = emptyState();
  if (isObj(raw.cards)) {
    for (const [id, c] of Object.entries(raw.cards)) {
      if (!isObj(c)) continue;
      const level = Math.min(MAX_LEVEL, Math.max(0, Number(c.level) || 0));
      const card: CardState = {
        right: Math.max(0, Number(c.right) || 0),
        wrong: Math.max(0, Number(c.wrong) || 0),
        last: c.last === 'wrong' ? 'wrong' : 'right',
        at: Number(c.at) || 0,
        level,
      };
      if (level > 0 && typeof c.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.due)) card.due = c.due;
      else if (level > 0) card.due = dayKey();
      s.cards[id] = card;
    }
  }
  if (Array.isArray(raw.days)) {
    s.days = [...new Set(raw.days.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort();
  }
  if (Array.isArray(raw.sims)) {
    s.sims = raw.sims.filter(isObj).map((r) => ({
      at: Number(r.at) || 0,
      total: Number(r.total) || 0,
      correct: Number(r.correct) || 0,
      passMark: Number(r.passMark) || 50,
      passed: !!r.passed,
      seconds: Number(r.seconds) || 0,
      limitMin: Number(r.limitMin) || 0,
      wrongIds: Array.isArray(r.wrongIds) ? r.wrongIds.filter((x): x is string => typeof x === 'string') : [],
    }));
  }
  if (isObj(raw.settings)) {
    const st = raw.settings;
    s.settings = {
      topics: Array.isArray(st.topics) ? st.topics.filter((t): t is string => typeof t === 'string') : [],
      shuffle: st.shuffle !== false,
      simCount: clampInt(st.simCount, 5, 310, DEFAULT_SETTINGS.simCount),
      simMinutes: clampInt(st.simMinutes, 0, 300, DEFAULT_SETTINGS.simMinutes),
      simPassMark: clampInt(st.simPassMark, 1, 100, DEFAULT_SETTINGS.simPassMark),
    };
  }
  s.updatedAt = Number(raw.updatedAt) || 0;
  return s;
}

function clampInt(x: unknown, min: number, max: number, def: number): number {
  const n = Math.round(Number(x));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
}

/** „heute“, „morgen“, „in 3 Tagen“ oder Datum. */
export function relativeDay(key: string, today: string = dayKey()): string {
  const [y1, m1, d1] = today.split('-').map(Number);
  const [y2, m2, d2] = key.split('-').map(Number);
  const diff = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
  if (diff <= 0) return 'heute';
  if (diff === 1) return 'morgen';
  if (diff < 7) return `in ${diff} Tagen`;
  return `am ${String(d2).padStart(2, '0')}.${String(m2).padStart(2, '0')}.`;
}
