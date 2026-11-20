/**
 * Karteikarten-Sitzung (rein, ohne UI).
 * „Nochmal“-Karten kommen in derselben Sitzung einige Karten später erneut.
 * In den Lernstand zählt nur die erste Bewertung je Karte und Sitzung –
 * sonst würde eine Wiederholung Minuten später das Fehler-Training zu schnell hochstufen.
 */
export const REINSERT_GAP = 6;

export interface FcSession {
  queue: string[];
  pos: number;
  /** erste Bewertung je Karte in dieser Sitzung */
  first: Record<string, boolean>;
  /** Anzahl Bewertungen insgesamt */
  known: number;
  again: number;
}

export function startSession(ids: string[]): FcSession {
  return { queue: ids.slice(), pos: 0, first: {}, known: 0, again: 0 };
}

export function current(s: FcSession): string | undefined {
  return s.queue[s.pos];
}

export function isDone(s: FcSession): boolean {
  return s.pos >= s.queue.length;
}

/** Liefert neue Sitzung und ob diese Bewertung in den Lernstand übernommen werden soll. */
export function rate(s: FcSession, ok: boolean): { session: FcSession; record: boolean } {
  const id = current(s);
  if (id === undefined) return { session: s, record: false };
  const record = !(id in s.first);
  const queue = s.queue.slice();
  if (!ok) queue.splice(Math.min(queue.length, s.pos + 1 + REINSERT_GAP), 0, id);
  return {
    session: {
      queue,
      pos: s.pos + 1,
      first: record ? { ...s.first, [id]: ok } : s.first,
      known: s.known + (ok ? 1 : 0),
      again: s.again + (ok ? 0 : 1),
    },
    record,
  };
}

/** Karten, die beim ersten Versuch nicht gewusst wurden. */
export function missedIds(s: FcSession): string[] {
  return Object.entries(s.first).filter(([, ok]) => !ok).map(([id]) => id);
}
