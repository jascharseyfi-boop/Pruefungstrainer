import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../src/data/questions';
import { formatClock, remainingSec, scoreSim } from '../src/lib/sim';

const mcSingle = QUESTIONS.find((q) => q.type === 'mc' && q.correct!.length === 1)!;
const mcMulti = QUESTIONS.find((q) => q.type === 'mc' && q.correct!.length > 1)!;
const open = QUESTIONS.find((q) => q.type === 'open')!;
const calc = QUESTIONS.find((q) => q.type === 'calc')!;

describe('Simulation – Auswertung', () => {
  const qs = [mcSingle, mcMulti, open, calc];
  it('zählt richtige, falsche und unbeantwortete', () => {
    const r = scoreSim(qs, {
      [mcSingle.id]: { sel: mcSingle.correct },
      [mcMulti.id]: { sel: [mcMulti.correct![0]] }, // nur teilweise → falsch
      [open.id]: { shown: true, self: true },
    }, 50);
    expect(r.correct).toBe(2);
    expect(r.percent).toBe(50);
    expect(r.passed).toBe(true); // 50 % bei Grenze 50 % = bestanden
    expect(r.wrongIds).toEqual([mcMulti.id, calc.id]);
    expect(r.unansweredIds).toEqual([calc.id]);
  });
  it('knapp unter der Grenze nicht bestanden', () => {
    const r = scoreSim(qs, { [mcSingle.id]: { sel: mcSingle.correct } }, 50);
    expect(r.percent).toBe(25);
    expect(r.passed).toBe(false);
  });
  it('Timer', () => {
    expect(remainingSec({ startedAt: 0, limitMin: 60 }, 59 * 60_000)).toBe(60);
    expect(remainingSec({ startedAt: 0, limitMin: 60 }, 61 * 60_000)).toBe(0);
    expect(remainingSec({ startedAt: 0, limitMin: 0 }, 0)).toBe(Infinity);
    expect(formatClock(3599)).toBe('59:59');
    expect(formatClock(3600)).toBe('1:00:00');
    expect(formatClock(65)).toBe('1:05');
  });
});
