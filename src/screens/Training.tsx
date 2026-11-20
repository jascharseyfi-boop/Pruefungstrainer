import { useState } from 'preact/hooks';
import { Dock } from '../components/Dock';
import { Header } from '../components/Header';
import { QUESTIONS } from '../data/questions';
import { filterByTopics, shuffle } from '../lib/select';
import { dueQuestions, trainingQuestions } from '../lib/stats';
import { go } from '../router';
import { dayKey, INTERVALS, relativeDay } from '../store/model';
import { store, useLearnState } from '../store/store';
import { QuizSession } from './Quiz';

type Mode = 'overview' | 'due' | 'extra';

export function Training() {
  const state = useLearnState();
  const [mode, setMode] = useState<Mode>('overview');
  const today = dayKey();
  const pool = filterByTopics(QUESTIONS, state.settings.topics);
  const due = dueQuestions(pool, state, today);
  const inTraining = trainingQuestions(pool, state);
  const allTraining = trainingQuestions(QUESTIONS, state).length;

  const order = (ids: string[]) => (store.get().settings.shuffle ? shuffle(ids) : ids);

  if (mode !== 'overview') {
    return (
      <QuizSession
        key={mode}
        title="Fehler-Training"
        onBack={() => setMode('overview')}
        recordRight={mode === 'due'}
        emptyText="Gerade ist nichts fällig."
        buildIds={() => {
          const s = store.get();
          const p = filterByTopics(QUESTIONS, s.settings.topics);
          return order((mode === 'due' ? dueQuestions(p, s) : trainingQuestions(p, s)).map((q) => q.id));
        }}
      />
    );
  }

  const byLevel = INTERVALS.map((_, i) => inTraining.filter((q) => state.cards[q.id].level === i + 1).length);
  const upcoming = inTraining
    .map((q) => state.cards[q.id].due!)
    .filter((d) => d > today)
    .sort();
  const nextDue = upcoming[0];
  const nextCount = nextDue ? upcoming.filter((d) => d === nextDue).length : 0;
  const filtered = state.settings.topics.length > 0;

  return (
    <div class="screen has-dock">
      <Header title="Fehler-Training" back={() => go('start')} />

      <section class="card training-head">
        <div class="big-num">{due.length}</div>
        <div class="label">{due.length === 1 ? 'Frage heute fällig' : 'Fragen heute fällig'}</div>
        {due.length === 0 && nextDue && (
          <p class="muted">Nächste: {nextCount} {nextCount === 1 ? 'Frage' : 'Fragen'} {relativeDay(nextDue, today)}.</p>
        )}
        {filtered && allTraining !== inTraining.length && (
          <p class="muted small">Nur ausgewählte Themen – insgesamt {allTraining} Fragen im Training.</p>
        )}
      </section>

      {inTraining.length > 0 ? (
        <section class="card" aria-labelledby="lv-h">
          <h2 id="lv-h" class="h2">Stufen</h2>
          <ol class="levels">
            {byLevel.map((n, i) => (
              <li key={i}>
                <span class="lv-name">Stufe {i + 1}</span>
                <span class="lv-int muted">wieder nach {INTERVALS[i]} {INTERVALS[i] === 1 ? 'Tag' : 'Tagen'}</span>
                <span class="lv-bar" aria-hidden="true"><span style={{ width: `${(n / Math.max(1, inTraining.length)) * 100}%` }} /></span>
                <b class="lv-n">{n}</b>
              </li>
            ))}
          </ol>
          <p class="muted small">Richtig → nächste Stufe, falsch → zurück auf Stufe 1. Nach Stufe 4 richtig gilt die Frage als sicher.</p>
        </section>
      ) : (
        <section class="card">
          <p>Noch keine Fragen im Fehler-Training. Falsch beantwortete und „Nochmal“-Fragen aus Karteikarten, Quiz und Simulation landen automatisch hier.</p>
        </section>
      )}

      <Dock>
        {due.length > 0 ? (
          <button key="due" type="button" class="btn btn-primary" onClick={() => setMode('due')}>{due.length} fällige üben</button>
        ) : inTraining.length > 0 ? (
          <button key="extra" type="button" class="btn btn-ghost" onClick={() => setMode('extra')}>Trotzdem üben ({inTraining.length})</button>
        ) : (
          <button key="quiz" type="button" class="btn btn-primary" onClick={() => go('quiz')}>Zum Quiz</button>
        )}
      </Dock>
    </div>
  );
}
