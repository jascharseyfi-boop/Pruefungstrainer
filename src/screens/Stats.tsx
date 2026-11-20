import { Header } from '../components/Header';
import { SimChart } from '../components/SimChart';
import { QUESTIONS, TOPICS } from '../data/questions';
import { dueQuestions, longestStreak, masteryCounts, topicStats, weakestTopics } from '../lib/stats';
import { go } from '../router';
import { addDays, dayKey, streak } from '../store/model';
import { store, useLearnState } from '../store/store';

function StackBar({ s, total, label }: { s: { sicher: number; wackelig: number }; total: number; label: string }) {
  const w = (n: number) => `${(n / Math.max(1, total)) * 100}%`;
  return (
    <div class="stack" role="img" aria-label={`${label}: ${s.sicher} sicher, ${s.wackelig} wackelig, ${total - s.sicher - s.wackelig} offen`}>
      {s.sicher > 0 && <span class="seg seg-sicher" style={{ width: w(s.sicher) }} />}
      {s.wackelig > 0 && <span class="seg seg-wackelig" style={{ width: w(s.wackelig) }} />}
    </div>
  );
}

function practice(topic: string) {
  store.update((s) => ({ ...s, settings: { ...s.settings, topics: [topic] } }));
  go('quiz');
}

export function Stats() {
  const state = useLearnState();
  const all = masteryCounts(QUESTIONS, state);
  const stats = topicStats(QUESTIONS, TOPICS, state);
  const weak = weakestTopics(stats, 3);
  const today = dayKey();
  const days = new Set(state.days);
  const last28 = Array.from({ length: 28 }, (_, i) => addDays(today, i - 27));
  const cur = streak(state.days, today);
  const due = dueQuestions(QUESTIONS, state, today).length;
  const pctAll = Math.round((all.sicher / QUESTIONS.length) * 100);

  return (
    <div class="screen">
      <Header title="Statistik" sub="Alle 310 Fragen" />

      <section class="tiles" aria-label="Kennzahlen">
        <div class="tile tile-hero"><div class="big-num">{pctAll} %</div><div class="label">sicher ({all.sicher} von {QUESTIONS.length})</div></div>
        <div class="tile"><div class="tile-num">{cur}</div><div class="label">{cur === 1 ? 'Tag' : 'Tage'} Serie</div></div>
        <div class="tile"><div class="tile-num">{longestStreak(state.days)}</div><div class="label">längste Serie</div></div>
        <div class="tile"><div class="tile-num">{due}</div><div class="label">fällig</div></div>
      </section>

      <section class="card" aria-labelledby="all-h">
        <h2 id="all-h" class="h2">Fortschritt gesamt</h2>
        <StackBar s={all} total={QUESTIONS.length} label="Gesamt" />
        <div class="legend">
          <span><i class="sw sw-sicher" />{all.sicher} sicher</span>
          <span><i class="sw sw-wackelig" />{all.wackelig} wackelig</span>
          <span><i class="sw sw-offen" />{all.offen} offen</span>
        </div>
        <div class="days" aria-label={`Lerntage der letzten 4 Wochen: ${last28.filter((d) => days.has(d)).length}`}>
          {last28.map((d) => (
            <span key={d} class={`day${days.has(d) ? ' is-on' : ''}${d === today ? ' is-today' : ''}`} title={d.split('-').reverse().join('.')} />
          ))}
        </div>
        <div class="days-cap muted small">Lerntage, letzte 4 Wochen</div>
      </section>

      {weak.length > 0 && (
        <section class="card weak" aria-labelledby="weak-h">
          <h2 id="weak-h" class="h2">Schwächste Themen</h2>
          <ol class="weak-list">
            {weak.map((w) => (
              <li key={w.topic}>
                <span><b>{w.topic}</b> <span class="muted">· {w.wackelig} von {w.answered} geübten wackelig</span></span>
                <button type="button" class="btn btn-primary btn-sm btn-auto" onClick={() => practice(w.topic)}>Üben</button>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section class="card" aria-labelledby="more-h">
        <h2 id="more-h" class="h2">Mehr</h2>
        <p class="muted small">Fortschritt pro Thema findest du unter <button type="button" class="link-inline" onClick={() => go('themen')}>Themen</button>, die Wiederholungs-Stufen im <button type="button" class="link-inline" onClick={() => go('training')}>Fehler-Training</button>.</p>
      </section>

      <section class="card" aria-labelledby="sim-h">
        <h2 id="sim-h" class="h2">Simulationen</h2>
        {state.sims.length ? (
          <SimChart sims={state.sims} />
        ) : (
          <p class="muted">Noch keine Prüfungssimulation. <button type="button" class="link-inline" onClick={() => go('simulation')}>Jetzt starten</button></p>
        )}
      </section>
    </div>
  );
}
