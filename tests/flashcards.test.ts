import { describe, expect, it } from 'vitest';
import { current, isDone, missedIds, rate, REINSERT_GAP, startSession } from '../src/lib/flashcards';

describe('Karteikarten-Sitzung', () => {
  it('„Konnte ich“ geht weiter und wird verbucht', () => {
    const r = rate(startSession(['a', 'b']), true);
    expect(r.record).toBe(true);
    expect(current(r.session)).toBe('b');
  });
  it('„Nochmal“ legt die Karte später erneut vor, zählt aber nur einmal', () => {
    const ids = 'abcdefghij'.split('');
    let { session: s, record } = rate(startSession(ids), false);
    expect(record).toBe(true);
    expect(s.queue.indexOf('a', 1)).toBe(1 + REINSERT_GAP);
    while (current(s) !== 'a') s = rate(s, true).session;
    const again = rate(s, true);
    expect(again.record).toBe(false);
    expect(missedIds(again.session)).toEqual(['a']);
  });
  it('am Ende eingefügt, wenn wenig Karten übrig', () => {
    let s = rate(startSession(['a', 'b']), false).session;
    expect(s.queue).toEqual(['a', 'b', 'a']);
    s = rate(s, true).session;
    s = rate(s, true).session;
    expect(isDone(s)).toBe(true);
    expect(s.known).toBe(2);
    expect(s.again).toBe(1);
  });
});
