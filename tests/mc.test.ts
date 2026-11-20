import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../src/data/questions';
import { evaluateMc, isMulti, toggleOption } from '../src/lib/mc';

const mc = QUESTIONS.filter((q) => q.type === 'mc');
const multi = mc.filter(isMulti);

describe('MC-Auswertung', () => {
  it('107 MC-Fragen, davon 10 mit mehreren richtigen', () => {
    expect(mc).toHaveLength(107);
    expect(multi).toHaveLength(10);
  });
  it('jede MC-Frage: genau die richtigen Optionen → richtig', () => {
    for (const q of mc) expect(evaluateMc(q, q.correct!).correct, q.id).toBe(true);
  });
  it('jede MC-Frage: eine falsche Option → falsch', () => {
    for (const q of mc) {
      const wrong = q.options!.findIndex((_, i) => !q.correct!.includes(i));
      if (wrong < 0) continue;
      const r = evaluateMc(q, [wrong]);
      expect(r.correct, q.id).toBe(false);
      expect(r.marks[wrong]).toBe('wrong');
    }
  });
  it('Mehrfachantwort: nur teilweise richtig → falsch, fehlende als „missed“', () => {
    for (const q of multi) {
      const [first, ...rest] = q.correct!;
      const r = evaluateMc(q, [first]);
      expect(r.correct, q.id).toBe(false);
      expect(r.marks[first]).toBe('hit');
      for (const i of rest) expect(r.marks[i]).toBe('missed');
    }
  });
  it('Mehrfachantwort: alle richtigen plus eine falsche → falsch', () => {
    for (const q of multi) {
      const wrong = q.options!.findIndex((_, i) => !q.correct!.includes(i));
      if (wrong < 0) continue;
      expect(evaluateMc(q, [...q.correct!, wrong]).correct, q.id).toBe(false);
    }
  });
  it('leere Auswahl → falsch', () => {
    expect(evaluateMc(mc[0], []).correct).toBe(false);
  });
  it('toggleOption: Einfach ersetzt, Mehrfach schaltet um', () => {
    const single = mc.find((q) => !isMulti(q))!;
    expect(toggleOption(single, [0], 2)).toEqual([2]);
    const m = multi[0];
    expect(toggleOption(m, [0], 2)).toEqual([0, 2]);
    expect(toggleOption(m, [0, 2], 0)).toEqual([2]);
  });
});
