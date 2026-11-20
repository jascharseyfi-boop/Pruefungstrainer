import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../src/data/questions';
import { learnIds, learnPlan, NEW_PER_SESSION, planLabel } from '../src/lib/session';
import { emptyState, recordAnswer } from '../src/store/model';

const D = (s: string) => new Date(`${s}T10:00:00`);

describe('Weiterlernen', () => {
  it('ohne Lernstand: 10 neue Fragen, keine Wiederholung', () => {
    const p = learnPlan(QUESTIONS, emptyState(), '2026-11-20');
    expect(p.due).toHaveLength(0);
    expect(p.fresh).toHaveLength(NEW_PER_SESSION);
    expect(planLabel(p)).toBe('10 neue Fragen');
  });
  it('fällige Wiederholungen zuerst, dann neue; Themenauswahl wird beachtet', () => {
    let s = emptyState();
    s = { ...s, settings: { ...s.settings, topics: ['Gefahrgut'], shuffle: false } };
    const g = QUESTIONS.filter((q) => q.topic === 'Gefahrgut');
    s = recordAnswer(s, g[0].id, false, D('2026-11-19')); // morgen = 20. fällig
    s = recordAnswer(s, g[1].id, false, D('2026-11-20')); // erst am 21. fällig
    s = recordAnswer(s, g[2].id, true, D('2026-11-19')); // sicher
    const p = learnPlan(QUESTIONS, s, '2026-11-20');
    expect(p.due.map((q) => q.id)).toEqual([g[0].id]);
    expect(p.waiting.map((q) => q.id)).toEqual([g[1].id]);
    expect(p.fresh.every((q) => q.topic === 'Gefahrgut' && !s.cards[q.id])).toBe(true);
    expect(p.fresh).toHaveLength(Math.min(NEW_PER_SESSION, g.length - 3));
    const ids = learnIds(p, false);
    expect(ids[0]).toBe(g[0].id);
    expect(planLabel(p)).toBe(`1 Wiederholung + ${p.fresh.length} neue Fragen`);
  });
});
