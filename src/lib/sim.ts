import type { Question } from '../data/types';
import { evaluateMc } from './mc';

/** Antwort in der Simulation: MC = gewählte Optionen, sonst Selbstbewertung. */
export interface SimAnswer {
  sel?: number[];
  self?: boolean;
  /** Lösung bei offener Frage aufgedeckt */
  shown?: boolean;
}

export interface RunningSim {
  ids: string[];
  answers: Record<string, SimAnswer>;
  pos: number;
  startedAt: number;
  limitMin: number; // 0 = ohne Zeitlimit
  passMark: number;
}

export function isAnswered(q: Question, a: SimAnswer | undefined): boolean {
  if (!a) return false;
  return q.type === 'mc' ? (a.sel?.length ?? 0) > 0 : typeof a.self === 'boolean';
}

export function isCorrect(q: Question, a: SimAnswer | undefined): boolean {
  if (!isAnswered(q, a)) return false;
  return q.type === 'mc' ? evaluateMc(q, a!.sel!).correct : a!.self === true;
}

export interface SimScore {
  total: number;
  correct: number;
  percent: number;
  passed: boolean;
  wrongIds: string[];
  unansweredIds: string[];
}

export function scoreSim(qs: Question[], answers: Record<string, SimAnswer>, passMark: number): SimScore {
  let correct = 0;
  const wrongIds: string[] = [];
  const unansweredIds: string[] = [];
  for (const q of qs) {
    const a = answers[q.id];
    if (isCorrect(q, a)) correct++;
    else {
      wrongIds.push(q.id);
      if (!isAnswered(q, a)) unansweredIds.push(q.id);
    }
  }
  const total = qs.length;
  const percent = total ? Math.round((correct / total) * 1000) / 10 : 0;
  return { total, correct, percent, passed: total > 0 && (correct / total) * 100 >= passMark, wrongIds, unansweredIds };
}

/** verbleibende Sekunden (Infinity ohne Limit) */
export function remainingSec(sim: Pick<RunningSim, 'startedAt' | 'limitMin'>, now: number): number {
  if (!sim.limitMin) return Infinity;
  return Math.max(0, Math.ceil((sim.startedAt + sim.limitMin * 60_000 - now) / 1000));
}

export function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}

// ---------- laufende Prüfung zwischenspeichern (iOS beendet PWAs im Hintergrund) ----------
const KEY = 'elearning.sim.running.v1';

export function saveRunning(sim: RunningSim | null): void {
  try {
    if (sim) localStorage.setItem(KEY, JSON.stringify(sim));
    else localStorage.removeItem(KEY);
  } catch {
    /* ohne Speicher läuft die Prüfung trotzdem, nur nicht über einen Neustart hinweg */
  }
}

export function loadRunning(valid: (id: string) => boolean): RunningSim | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as RunningSim;
    if (!Array.isArray(s.ids) || !s.ids.length || !s.ids.every(valid) || typeof s.startedAt !== 'number') return null;
    return { ...s, answers: s.answers ?? {}, pos: Math.min(Math.max(0, s.pos | 0), s.ids.length - 1) };
  } catch {
    return null;
  }
}
