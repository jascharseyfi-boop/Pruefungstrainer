import { useState } from 'preact/hooks';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { QUESTIONS, TOPICS, countByTopic } from '../data/questions';
import { filterByTopics } from '../lib/select';
import { dueQuestions, masteryCounts } from '../lib/stats';
import { go, type Route } from '../router';
import { streak } from '../store/model';
import { store, useLearnState } from '../store/store';

const COUNTS = countByTopic();

const MODES: { route: Route; title: string; text: string }[] = [
  { route: 'karten', title: 'Karteikarten', text: 'Frage lesen, Antwort aufdecken, selbst bewerten.' },
  { route: 'quiz', title: 'Quiz', text: 'Multiple Choice mit sofortiger Auswertung.' },
  { route: 'simulation', title: 'Prüfungssimulation', text: 'Zufällige Fragen mit Zeitlimit und Ergebnis.' },
  { route: 'training', title: 'Fehler-Training', text: 'Falsche Fragen kommen nach 1, 3, 7, 14 Tagen wieder.' },
];

export function Home() {
  const state = useLearnState();
  const { topics, shuffle } = state.settings;
  const selected = filterByTopics(QUESTIONS, topics);
  const counts = masteryCounts(selected, state);
  const due = dueQuestions(selected, state).length;
  const days = streak(state.days);
  const [open, setOpen] = useState(false);
  const topicLabel = topics.length === 0 ? 'Alle Themen' : topics.length === 1 ? topics[0] : `${topics.length} Themen`;

  const setTopics = (next: string[]) =>
    store.update((s) => ({ ...s, settings: { ...s.settings, topics: next.length === TOPICS.length ? [] : next } }));
  const toggle = (t: string) => {
    const cur = topics.length === 0 ? [] : topics;
    setTopics(cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]);
  };

  return (
    <div class="screen">
      <Header title="Elearning" sub="Fachkunde Güterkraftverkehr" />

      <section class="summary card" aria-label="Überblick">
        <div class="summary-row">
          <div>
            <div class="big-num">{counts.sicher}<span class="of"> / {selected.length}</span></div>
            <div class="label">sicher</div>
          </div>
          <div class="summary-side">
            <div><b>{days}</b> {days === 1 ? 'Tag' : 'Tage'} Serie</div>
            <div><b>{due}</b> fällig</div>
          </div>
        </div>
        <ProgressBar {...counts} label="Fortschritt Auswahl" />
        <div class="legend">
          <span><i class="dot dot-sicher" />{counts.sicher} sicher</span>
          <span><i class="dot dot-wackelig" />{counts.wackelig} wackelig</span>
          <span><i class="dot dot-offen" />{counts.offen} offen</span>
        </div>
      </section>

      <section class="card filter" aria-label="Auswahl">
        <button type="button" class="filter-toggle" aria-expanded={open} aria-controls="filter-body" onClick={() => setOpen(!open)}>
          <span class="filter-sum">
            <b>{topicLabel}</b>
            <span class="muted"> · {selected.length} Fragen · {shuffle ? 'zufällig' : 'der Reihe nach'}</span>
          </span>
          <span class="filter-act">{open ? 'Fertig' : 'Ändern'}</span>
        </button>
        {open && (
          <div id="filter-body" class="filter-body">
            <div class="chips" role="group" aria-label="Themen auswählen (Mehrfachauswahl)">
              <button type="button" class={`chip${topics.length === 0 ? ' is-on' : ''}`} aria-pressed={topics.length === 0} onClick={() => setTopics([])}>
                Alle
              </button>
              {TOPICS.map((t) => {
                const on = topics.includes(t);
                return (
                  <button key={t} type="button" class={`chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggle(t)}>
                    {t} <span class="chip-n">{COUNTS.get(t)}</span>
                  </button>
                );
              })}
            </div>
            <label class="switch">
              <input
                type="checkbox"
                checked={shuffle}
                onChange={(e) => store.update((s) => ({ ...s, settings: { ...s.settings, shuffle: (e.target as HTMLInputElement).checked } }))}
              />
              <span class="switch-track" aria-hidden="true" />
              <span>Zufallsreihenfolge</span>
            </label>
          </div>
        )}
      </section>

      <section aria-label="Lernmodi" class="modes">
        {MODES.map((m) => (
          <button key={m.route} type="button" class="mode" onClick={() => go(m.route)}>
            <span class="mode-title">
              {m.title}
              {m.route === 'training' && due > 0 && <span class="badge">{due}</span>}
            </span>
            <span class="mode-text">{m.text}</span>
            <svg class="mode-arrow" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        ))}
      </section>
    </div>
  );
}
