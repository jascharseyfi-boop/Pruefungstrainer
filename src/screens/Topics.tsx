import { Header } from '../components/Header';
import { QUESTIONS, TOPICS } from '../data/questions';
import { filterByTopics } from '../lib/select';
import { topicStats, weakestTopics } from '../lib/stats';
import { store, useLearnState } from '../store/store';

/** Themen: Fortschritt pro Thema und Auswahl für alle Lernmodi. */
export function Topics() {
  const state = useLearnState();
  const { topics, shuffle } = state.settings;
  const effective = topics.length ? topics : TOPICS;
  const stats = topicStats(QUESTIONS, TOPICS, state);
  const weak = new Set(weakestTopics(stats, 3).map((w) => w.topic));
  const count = filterByTopics(QUESTIONS, topics).length;

  const setTopics = (next: string[]) =>
    store.update((s) => ({ ...s, settings: { ...s.settings, topics: next.length === TOPICS.length ? [] : next } }));
  const toggle = (t: string) => {
    const on = effective.includes(t);
    if (on && effective.length === 1) return; // mindestens ein Thema
    setTopics(on ? effective.filter((x) => x !== t) : TOPICS.filter((x) => x === t || effective.includes(x)));
  };

  return (
    <div class="screen">
      <Header title="Themen" sub="Auswahl gilt für alle Lernmodi" />
      <div class="topic-tools">
        <span><b>{effective.length}</b> von {TOPICS.length} ausgewählt · {count} Fragen</span>
        {topics.length > 0 && <button type="button" class="link-inline" onClick={() => setTopics([])}>Alle auswählen</button>}
      </div>
      <ul class="tlist">
        {stats.map((t) => {
          const on = effective.includes(t.topic);
          return (
            <li key={t.topic}>
              <button type="button" class="trow" role="checkbox" aria-checked={on} onClick={() => toggle(t.topic)}>
                <span class="check" aria-hidden="true">{on ? '✓' : ''}</span>
                <span class="trow-name">{t.topic}{weak.has(t.topic) && <span class="tag-weak">schwach</span>}</span>
                <span class="trow-pct">{Math.round(t.share * 100)} %</span>
                <span class="trow-sub">
                  <span class="stack" aria-hidden="true">
                    {t.sicher > 0 && <span class="seg seg-sicher" style={{ width: `${(t.sicher / t.total) * 100}%` }} />}
                    {t.wackelig > 0 && <span class="seg seg-wackelig" style={{ width: `${(t.wackelig / t.total) * 100}%` }} />}
                  </span>
                  <span class="trow-meta">{t.sicher} sicher · {t.wackelig} wackelig · {t.offen} offen</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div class="legend">
        <span><i class="sw sw-sicher" />sicher</span>
        <span><i class="sw sw-wackelig" />wackelig</span>
        <span><i class="sw sw-offen" />offen</span>
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
  );
}
