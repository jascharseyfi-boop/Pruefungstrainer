import { QUESTIONS } from '../data/questions';
import { learnIds, learnPlan } from '../lib/session';
import { store } from '../store/store';
import { QuizSession } from './Quiz';

/** „Weiterlernen“: fällige Wiederholungen, dann neue Fragen – im Quiz-Ablauf. */
export function Learn() {
  return (
    <QuizSession
      title="Weiterlernen"
      emptyText="Gerade ist nichts zu tun – keine fälligen Wiederholungen und keine neuen Fragen in deiner Themenauswahl."
      buildIds={() => {
        const s = store.get();
        return learnIds(learnPlan(QUESTIONS, s), s.settings.shuffle);
      }}
    />
  );
}
