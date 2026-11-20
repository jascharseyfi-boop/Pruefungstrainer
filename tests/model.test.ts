import { describe, expect, it } from 'vitest';
import {
  addDays, applyAnswer, dayKey, emptyState, isDue, mastery, normalizeState, recordAnswer, streak,
} from '../src/store/model';
import { Store } from '../src/store/store';
import { memoryBackend } from '../src/store/storage';

const D = (s: string) => new Date(`${s}T10:00:00`);

describe('Datum', () => {
  it('addDays über Monats- und Jahresgrenzen', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(dayKey(D('2026-11-20'))).toBe('2026-11-20');
  });
});

describe('Spaced Repetition', () => {
  it('falsch → Stufe 1, morgen fällig', () => {
    const c = applyAnswer(undefined, false, D('2026-11-20'));
    expect(c).toMatchObject({ level: 1, due: '2026-11-21', wrong: 1, last: 'wrong' });
    expect(mastery(c)).toBe('wackelig');
    expect(isDue(c, '2026-11-20')).toBe(false);
    expect(isDue(c, '2026-11-21')).toBe(true);
  });
  it('richtig → Stufen 1, 3, 7, 14 Tage, danach aus dem Training', () => {
    let c = applyAnswer(undefined, false, D('2026-11-01')); // L1, +1
    c = applyAnswer(c, true, D('2026-11-02'));
    expect(c).toMatchObject({ level: 2, due: '2026-11-05' }); // +3
    c = applyAnswer(c, true, D('2026-11-05'));
    expect(c).toMatchObject({ level: 3, due: '2026-11-12' }); // +7
    c = applyAnswer(c, true, D('2026-11-12'));
    expect(c).toMatchObject({ level: 4, due: '2026-11-26' }); // +14
    c = applyAnswer(c, true, D('2026-11-26'));
    expect(c.level).toBe(0);
    expect(c.due).toBeUndefined();
    expect(mastery(c)).toBe('sicher');
  });
  it('falsch in hoher Stufe → zurück auf 1', () => {
    let c = applyAnswer(undefined, false, D('2026-11-01'));
    c = applyAnswer(c, true, D('2026-11-02'));
    c = applyAnswer(c, true, D('2026-11-05'));
    c = applyAnswer(c, false, D('2026-11-12'));
    expect(c).toMatchObject({ level: 1, due: '2026-11-13' });
  });
  it('richtig ohne Training → sicher, kein Fälligkeitsdatum', () => {
    const c = applyAnswer(undefined, true, D('2026-11-20'));
    expect(c).toMatchObject({ level: 0, right: 1 });
    expect(mastery(c)).toBe('sicher');
    expect(mastery(undefined)).toBe('offen');
  });
});

describe('Lernserie', () => {
  it('zählt Tage in Folge bis heute bzw. gestern', () => {
    expect(streak(['2026-11-18', '2026-11-19', '2026-11-20'], '2026-11-20')).toBe(3);
    expect(streak(['2026-11-18', '2026-11-19'], '2026-11-20')).toBe(2);
    expect(streak(['2026-11-17', '2026-11-19', '2026-11-20'], '2026-11-20')).toBe(2);
    expect(streak(['2026-11-10'], '2026-11-20')).toBe(0);
  });
  it('recordAnswer trägt den Lerntag ein', () => {
    const s = recordAnswer(emptyState(), 'S001', true, D('2026-11-20'));
    expect(s.days).toEqual(['2026-11-20']);
    expect(recordAnswer(s, 'S002', false, D('2026-11-20')).days).toEqual(['2026-11-20']);
  });
});

describe('normalizeState', () => {
  it('Roundtrip ergibt denselben Stand', () => {
    let s = emptyState();
    s = recordAnswer(s, 'S001', false, D('2026-11-19'));
    s = recordAnswer(s, 'M010', true, D('2026-11-20'));
    expect(normalizeState(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
  it('verwirft Unsinn und neuere Versionen', () => {
    expect(() => normalizeState('x')).toThrow();
    expect(() => normalizeState({ v: 99 })).toThrow();
    const s = normalizeState({ v: 1, cards: { A: { level: 9, right: -3 } }, days: ['x', '2026-01-01'], settings: { simCount: 9999 } });
    expect(s.cards.A.level).toBe(4);
    expect(s.cards.A.right).toBe(0);
    expect(s.days).toEqual(['2026-01-01']);
    expect(s.settings.simCount).toBe(310);
  });
});

describe('Store', () => {
  it('speichert, benachrichtigt und lädt wieder', () => {
    const backend = memoryBackend();
    const st = new Store(backend);
    let calls = 0;
    st.subscribe(() => calls++);
    st.update((s) => recordAnswer(s, 'S001', true));
    expect(calls).toBe(1);
    expect(new Store(backend).get().cards.S001.right).toBe(1);
  });
});
