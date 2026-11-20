import { describe, expect, it } from 'vitest';
import { QUESTIONS, TOPICS } from '../src/data/questions';
import { buildDeck, filterByTopics, shuffle } from '../src/lib/select';

describe('Auswahl', () => {
  it('12 Themen, kein „Sonstiges“ mehr', () => {
    expect(TOPICS).toHaveLength(12);
    expect(TOPICS).not.toContain('Sonstiges');
  });
  it('leere Themenliste = alle Fragen', () => {
    expect(filterByTopics(QUESTIONS, [])).toHaveLength(310);
  });
  it('Mehrfachauswahl filtert korrekt', () => {
    const r = filterByTopics(QUESTIONS, ['Gefahrgut', 'Marketing']);
    expect(r.every((q) => q.topic === 'Gefahrgut' || q.topic === 'Marketing')).toBe(true);
    expect(r).toHaveLength(39);
  });
  it('shuffle behält alle Elemente', () => {
    const a = [1, 2, 3, 4, 5, 6];
    expect(shuffle(a).sort()).toEqual(a);
    expect(a).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('ohne Zufall bleibt die Reihenfolge', () => {
    const d = buildDeck(QUESTIONS, { topics: ['Gefahrgut'], shuffle: false });
    expect(d.map((q) => q.id)).toEqual(QUESTIONS.filter((q) => q.topic === 'Gefahrgut').map((q) => q.id));
  });
});
