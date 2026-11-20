import { describe, expect, it } from 'vitest';
import { QUESTIONS, TOPICS } from '../src/data/questions';
import { longestStreak, topicStats, weakestTopics } from '../src/lib/stats';
import { emptyState, recordAnswer } from '../src/store/model';

describe('Statistik', () => {
  it('Themen-Statistik summiert auf 310', () => {
    const st = topicStats(QUESTIONS, TOPICS, emptyState());
    expect(st.reduce((n, s) => n + s.total, 0)).toBe(310);
    expect(st.every((s) => s.offen === s.total)).toBe(true);
    expect(weakestTopics(st)).toEqual([]); // ohne Übung keine Schwächen
  });
  it('schwächstes Thema = höchste Fehlerquote der geübten Fragen', () => {
    const g = QUESTIONS.filter((q) => q.topic === 'Gefahrgut');
    const m = QUESTIONS.filter((q) => q.topic === 'Marketing');
    let s = emptyState();
    s = recordAnswer(s, g[0].id, false);
    for (const q of m.slice(0, 5)) s = recordAnswer(s, q.id, true);
    s = recordAnswer(s, m[5].id, false); // Marketing: 1 von 6 wackelig
    const weak = weakestTopics(topicStats(QUESTIONS, TOPICS, s));
    expect(weak.map((w) => w.topic)).toEqual(['Gefahrgut', 'Marketing']);
    // nur richtig geübte Themen sind nicht schwach
    let t = emptyState();
    t = recordAnswer(t, m[0].id, true);
    expect(weakestTopics(topicStats(QUESTIONS, TOPICS, t))).toEqual([]);
  });
  it('längste Serie', () => {
    expect(longestStreak(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06'])).toBe(3);
    expect(longestStreak([])).toBe(0);
    expect(longestStreak(['2026-12-31', '2027-01-01'])).toBe(2);
  });
});
