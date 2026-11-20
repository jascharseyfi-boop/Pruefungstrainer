import { Header } from '../components/Header';
import { InstallHint } from '../components/InstallHint';
import { QUESTIONS, TOPICS } from '../data/questions';
import { filterByTopics } from '../lib/select';
import { learnPlan, planLabel } from '../lib/session';
import { masteryCounts } from '../lib/stats';
import { go } from '../router';
import { streak } from '../store/model';
import { useLearnState } from '../store/store';

const ICON = {
  cards: 'M4 7h12v12H4zM8 4h12v12',
  quiz: 'M9.1 9a3 3 0 1 1 4.2 2.7c-.8.4-1.3 1.1-1.3 2v.3M12 17.5v.01',
  sim: 'M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 1h4',
};

function Ico({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export function Home() {
  const state = useLearnState();
  const { topics } = state.settings;
  const selected = filterByTopics(QUESTIONS, topics);
  const counts = masteryCounts(selected, state);
  const plan = learnPlan(QUESTIONS, state);
  const days = streak(state.days);
  const last = state.sims[state.sims.length - 1];
  const lastPct = last ? Math.round((last.correct / Math.max(1, last.total)) * 100) : null;
  const topicLabel = topics.length === 0 ? 'Alle Themen' : topics.length === 1 ? topics[0] : `${topics.length} von ${TOPICS.length} Themen`;
  const label = planLabel(plan);
  const nothing = !plan.due.length && !plan.fresh.length;

  return (
    <div class="screen">
      <Header title="Elearning" sub="Fachkunde Güterkraftverkehr" />
      <InstallHint />

      <section class="sign" aria-labelledby="today-h">
        <div class="sign-in">
          <h2 id="today-h" class="kicker">Heute</h2>
          <div class="hero-num">
            <b>{plan.due.length}</b>
            <span>{plan.due.length === 1 ? 'Wiederholung fällig' : 'Wiederholungen fällig'}</span>
          </div>
          <div class="hero-stats">
            <span><b>{counts.sicher}</b> sicher</span>
            <span><b>{counts.offen}</b> offen</span>
            <span><b>{days}</b> {days === 1 ? 'Tag' : 'Tage'} Serie</span>
          </div>
          {nothing ? (
            <button type="button" class="go" onClick={() => go(plan.waiting.length ? 'training' : 'quiz')}>
              <span>Alles erledigt<small>{plan.waiting.length ? 'Wackelige Fragen trotzdem üben' : 'Zum Quiz'}</small></span>
              <span class="go-arrow" aria-hidden="true">→</span>
            </button>
          ) : (
            <button type="button" class="go" onClick={() => go('lernen')}>
              <span>Weiterlernen<small>{label}</small></span>
              <span class="go-arrow" aria-hidden="true">→</span>
            </button>
          )}
          <div class="hero-foot">
            <span>{topicLabel} · {selected.length} Fragen</span>
            <button type="button" onClick={() => go('themen')}>Themen wählen</button>
          </div>
        </div>
      </section>

      <section class="modes" aria-label="Weitere Lernmodi">
        <button type="button" class="mode" onClick={() => go('karten')}>
          <span class="mode-ico"><Ico d={ICON.cards} /></span>
          <span><span class="mode-title">Karteikarten</span><span class="mode-text">Aufdecken und selbst bewerten</span></span>
        </button>
        <button type="button" class="mode" onClick={() => go('quiz')}>
          <span class="mode-ico"><Ico d={ICON.quiz} /></span>
          <span><span class="mode-title">Quiz</span><span class="mode-text">Antippen, sofort Auflösung</span></span>
        </button>
        <button type="button" class="mode mode-wide" onClick={() => go('simulation')}>
          <span class="mode-ico"><Ico d={ICON.sim} /></span>
          <span>
            <span class="mode-title">Prüfungssimulation</span>
            <span class="mode-text">{state.settings.simCount} Fragen · {state.settings.simMinutes ? `${state.settings.simMinutes} Minuten` : 'ohne Zeitlimit'}</span>
          </span>
          {last && (
            <span class="mode-res">
              {lastPct} %<small class={last.passed ? 'ok' : 'bad'}>{last.passed ? 'bestanden' : 'nicht bestanden'}</small>
            </span>
          )}
        </button>
      </section>
    </div>
  );
}
