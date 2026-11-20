import raw from '../../data/questions.json';
import type { Question } from './types';

export const QUESTIONS: Question[] = raw as Question[];

export const QUESTION_BY_ID: Map<string, Question> = new Map(QUESTIONS.map((q) => [q.id, q]));

/** Themen in fester Reihenfolge (nach Anzahl Fragen absteigend, „Sonstiges“ zuletzt). */
export const TOPICS: string[] = (() => {
  const count = new Map<string, number>();
  for (const q of QUESTIONS) count.set(q.topic, (count.get(q.topic) ?? 0) + 1);
  return [...count.keys()].sort((a, b) => {
    if (a === 'Sonstiges') return 1;
    if (b === 'Sonstiges') return -1;
    return (count.get(b)! - count.get(a)!) || a.localeCompare(b, 'de');
  });
})();

export function countByTopic(): Map<string, number> {
  const m = new Map<string, number>();
  for (const q of QUESTIONS) m.set(q.topic, (m.get(q.topic) ?? 0) + 1);
  return m;
}
