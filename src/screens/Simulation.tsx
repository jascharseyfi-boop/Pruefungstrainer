import { useEffect, useMemo, useState } from 'preact/hooks';
import { Dock } from '../components/Dock';
import { Header } from '../components/Header';
import { Html } from '../components/Html';
import { McOptions } from '../components/McOptions';
import { AnswerView, LETTERS, QuestionMeta, QuestionText } from '../components/QuestionView';
import { Stepper } from '../components/Stepper';
import { QUESTIONS, QUESTION_BY_ID, TOPICS } from '../data/questions';
import type { Question } from '../data/types';
import { evaluateMc, isMulti, toggleOption } from '../lib/mc';
import { filterByTopics, shuffle } from '../lib/select';
import {
  formatClock, isAnswered, loadRunning, remainingSec, saveRunning, scoreSim,
  type RunningSim, type SimAnswer, type SimScore,
} from '../lib/sim';
import { useKeys } from '../lib/useKeys';
import { useNow } from '../lib/useNow';
import { go } from '../router';
import { addSim, recordAnswer, type SimResult } from '../store/model';
import { store, useLearnState } from '../store/store';

type Phase =
  | { kind: 'setup' }
  | { kind: 'running'; sim: RunningSim }
  | { kind: 'result'; sim: RunningSim; score: SimScore; seconds: number };

export function Simulation() {
  const [phase, setPhase] = useState<Phase>(() => {
    const r = loadRunning((id) => QUESTION_BY_ID.has(id));
    return r ? { kind: 'running', sim: r } : { kind: 'setup' };
  });

  const finish = (sim: RunningSim) => {
    const qs = sim.ids.map((id) => QUESTION_BY_ID.get(id)!);
    const score = scoreSim(qs, sim.answers, sim.passMark);
    const now = Date.now();
    const limit = sim.limitMin * 60;
    const seconds = Math.min(Math.round((now - sim.startedAt) / 1000), limit || Infinity);
    const result: SimResult = {
      at: now, total: score.total, correct: score.correct, passMark: sim.passMark, passed: score.passed,
      seconds, limitMin: sim.limitMin, wrongIds: score.wrongIds,
    };
    store.update((s) => {
      let next = s;
      for (const q of qs) {
        const a = sim.answers[q.id];
        if (isAnswered(q, a)) next = recordAnswer(next, q.id, score.wrongIds.indexOf(q.id) === -1);
      }
      return addSim(next, result);
    });
    saveRunning(null);
    setPhase({ kind: 'result', sim, score, seconds });
    window.scrollTo(0, 0);
  };

  if (phase.kind === 'setup') return <Setup onStart={(sim) => { saveRunning(sim); setPhase({ kind: 'running', sim }); }} />;
  if (phase.kind === 'running') return <Running initial={phase.sim} onFinish={finish} />;
  return <Result sim={phase.sim} score={phase.score} seconds={phase.seconds} onNew={() => setPhase({ kind: 'setup' })} />;
}

// ---------------- Einstellungen ----------------

function Setup({ onStart }: { onStart: (sim: RunningSim) => void }) {
  const state = useLearnState();
  const { topics, simCount, simMinutes, simPassMark } = state.settings;
  const pool = filterByTopics(QUESTIONS, topics);
  const count = Math.min(simCount, pool.length);
  const set = (patch: Partial<typeof state.settings>) => store.update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  const last = state.sims[state.sims.length - 1];
  const topicLabel = topics.length === 0 ? `Alle ${TOPICS.length} Themen` : topics.length === 1 ? topics[0] : `${topics.length} Themen`;

  const start = () => {
    if (!pool.length) return;
    onStart({
      ids: shuffle(pool).slice(0, count).map((q) => q.id),
      answers: {},
      pos: 0,
      startedAt: Date.now(),
      limitMin: simMinutes,
      passMark: simPassMark,
    });
  };

  return (
    <div class="screen has-dock">
      <Header title="Prüfungssimulation" back={() => go('start')} />
      <section class="card setup">
        <p class="muted setup-intro">Zufällige Fragen ohne Rückmeldung zwischendurch. Offene Fragen deckst du auf und bewertest sie selbst ehrlich.</p>
        <Stepper id="sim-n" label="Fragen" value={count} min={Math.min(5, pool.length)} max={pool.length} step={5}
          onChange={(v) => set({ simCount: v })} />
        <Stepper id="sim-t" label="Zeitlimit" value={simMinutes} min={0} max={180} step={5}
          format={(v) => (v ? `${v} min` : 'ohne')} onChange={(v) => set({ simMinutes: v })} />
        <Stepper id="sim-p" label="Bestanden ab" value={simPassMark} min={10} max={100} step={5}
          format={(v) => `${v} %`} onChange={(v) => set({ simPassMark: v })} />
        <p class="setup-pool">
          <b>{topicLabel}</b> <span class="muted">· {pool.length} Fragen im Pool</span>
          <br />
          <button type="button" class="link-inline" onClick={() => go('themen')}>Themen ändern</button>
        </p>
        {(simCount !== 30 || simMinutes !== 60 || simPassMark !== 50) && (
          <button type="button" class="link-inline" onClick={() => set({ simCount: 30, simMinutes: 60, simPassMark: 50 })}>
            Auf Standard zurücksetzen (30 Fragen, 60 min, 50 %)
          </button>
        )}
      </section>
      {last && (
        <p class="muted center">
          Letzte Simulation: {Math.round((last.correct / Math.max(1, last.total)) * 100)} % · {last.passed ? 'bestanden' : 'nicht bestanden'}
        </p>
      )}
      <Dock>
        <button key="start" type="button" class="btn btn-primary" disabled={!pool.length} onClick={start}>Prüfung starten</button>
      </Dock>
    </div>
  );
}

// ---------------- Laufende Prüfung ----------------

function Running({ initial, onFinish }: { initial: RunningSim; onFinish: (s: RunningSim) => void }) {
  const [sim, setSim] = useState(initial);
  const [confirming, setConfirming] = useState(false);
  const [overview, setOverview] = useState(false);
  const now = useNow(1000);
  const qs = useMemo(() => sim.ids.map((id) => QUESTION_BY_ID.get(id)!), [sim.ids]);
  const q = qs[sim.pos];
  const a = sim.answers[q.id] ?? {};
  const left = remainingSec(sim, now);
  const answeredCount = qs.filter((x) => isAnswered(x, sim.answers[x.id])).length;
  const isLast = sim.pos === qs.length - 1;

  const update = (next: RunningSim) => {
    setSim(next);
    saveRunning(next);
  };
  const setAnswer = (patch: SimAnswer) => update({ ...sim, answers: { ...sim.answers, [q.id]: { ...a, ...patch } } });
  const goTo = (i: number) => {
    if (i < 0 || i >= qs.length) return;
    setConfirming(false);
    update({ ...sim, pos: i });
    window.scrollTo(0, 0);
  };

  // Zeit abgelaufen → automatisch abgeben
  useEffect(() => {
    if (left === 0) onFinish(sim);
  }, [left === 0]);

  const pick = (i: number) => {
    if (q.type !== 'mc' || !q.options || i >= q.options.length) return;
    setAnswer({ sel: toggleOption(q, a.sel ?? [], i) });
  };

  const keys: Record<string, () => void> = {
    ArrowLeft: () => goTo(sim.pos - 1),
    ArrowRight: () => goTo(sim.pos + 1),
  };
  if (q.type === 'mc') {
    q.options!.forEach((_, i) => {
      keys[String(i + 1)] = () => pick(i);
      keys['abcdefgh'[i]] = () => pick(i);
    });
  } else if (!a.shown) {
    keys.Space = () => setAnswer({ shown: true });
  } else {
    keys['1'] = () => setAnswer({ self: true });
    keys['2'] = () => setAnswer({ self: false });
  }
  useKeys(keys);

  const unanswered = qs.length - answeredCount;
  const warn = left !== Infinity && left <= 300;

  return (
    <div class="screen has-dock">
      <h1 class="sr-only">Prüfungssimulation</h1>
      <div class="simbar">
        <div class="simbar-in">
          <button type="button" class="simbar-count" aria-expanded={overview} onClick={() => setOverview(!overview)}>
            Frage <b>{sim.pos + 1}</b>/{qs.length} <span class="muted">· {answeredCount} beantwortet</span>
          </button>
          <span class={`timer${warn ? ' is-warn' : ''}`} role="timer" aria-label={left === Infinity ? 'ohne Zeitlimit' : `Restzeit ${formatClock(left)}`}>
            {left === Infinity ? formatClock((now - sim.startedAt) / 1000) : formatClock(left)}
          </span>
        </div>
        {overview && (
          <div class="grid-nav" role="group" aria-label="Zu Frage springen">
            {qs.map((x, i) => (
              <button key={x.id} type="button"
                class={`grid-btn${isAnswered(x, sim.answers[x.id]) ? ' is-done' : ''}${i === sim.pos ? ' is-cur' : ''}`}
                aria-label={`Frage ${i + 1}${isAnswered(x, sim.answers[x.id]) ? ', beantwortet' : ''}`}
                aria-current={i === sim.pos ? 'step' : undefined}
                onClick={() => { goTo(i); setOverview(false); }}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      <article class="card qcard" key={q.id}>
        <QuestionMeta q={q} />
        <QuestionText q={q} />
        {q.type === 'mc' ? (
          <>
            {isMulti(q) && <div class="hint-multi" role="note">Mehrere Antworten richtig ({q.correct!.length}).</div>}
            <McOptions q={q} selected={a.sel ?? []} onToggle={pick} />
          </>
        ) : !a.shown ? (
          <button type="button" class="btn btn-ghost btn-inline" onClick={() => setAnswer({ shown: true })}>
            Lösung zeigen &amp; selbst bewerten
          </button>
        ) : (
          <>
            <AnswerView q={q} />
            <div class="selfrate" role="radiogroup" aria-label="Selbstbewertung">
              <button type="button" role="radio" aria-checked={a.self === false} class={`btn btn-sm ${a.self === false ? 'btn-again' : 'btn-ghost'}`}
                onClick={() => setAnswer({ self: false })}>Nicht gewusst</button>
              <button type="button" role="radio" aria-checked={a.self === true} class={`btn btn-sm ${a.self === true ? 'btn-good' : 'btn-ghost'}`}
                onClick={() => setAnswer({ self: true })}>Gewusst</button>
            </div>
          </>
        )}
      </article>

      <button type="button" class="link-btn" onClick={() => setConfirming(true)}>Prüfung abgeben</button>

      {confirming ? (
        <Dock>
          <div class="confirm">
            <p>{unanswered > 0 ? `Noch ${unanswered} ${unanswered === 1 ? 'Frage' : 'Fragen'} unbeantwortet (zählen als falsch).` : 'Alle Fragen beantwortet.'} Jetzt abgeben?</p>
            <div class="dock-in">
              <button key="cancel" type="button" class="btn btn-ghost" onClick={() => setConfirming(false)}>Weiter prüfen</button>
              <button key="submit" type="button" class="btn btn-primary" onClick={() => onFinish(sim)}>Abgeben</button>
            </div>
          </div>
        </Dock>
      ) : (
        <Dock hint="Tastatur: ← → blättern · 1–5/A–E wählen · Leertaste aufdecken">
          <button key="prev" type="button" class="btn btn-ghost btn-narrow" disabled={sim.pos === 0} onClick={() => goTo(sim.pos - 1)} aria-label="Vorherige Frage">‹</button>
          {isLast ? (
            <button key="end" type="button" class="btn btn-primary" onClick={() => setConfirming(true)}>Abgeben</button>
          ) : (
            <button key="next" type="button" class="btn btn-primary" onClick={() => goTo(sim.pos + 1)}>Weiter</button>
          )}
        </Dock>
      )}
    </div>
  );
}

// ---------------- Ergebnis ----------------

function Result({ sim, score, seconds, onNew }: { sim: RunningSim; score: SimScore; seconds: number; onNew: () => void }) {
  const wrong = score.wrongIds.map((id) => QUESTION_BY_ID.get(id)!);
  return (
    <div class="screen has-dock">
      <Header title="Ergebnis" back={() => go('start')} />
      <section class={`card result ${score.passed ? 'is-pass' : 'is-fail'}`} aria-live="polite">
        <div class="result-badge">{score.passed ? 'Bestanden' : 'Nicht bestanden'}</div>
        <div class="big-num">{score.percent.toLocaleString('de-DE')} %</div>
        <p>
          <b>{score.correct}</b> von {score.total} richtig · Grenze {sim.passMark} %
          <br />
          <span class="muted">Zeit: {formatClock(seconds)}{sim.limitMin ? ` von ${formatClock(sim.limitMin * 60)}` : ''}</span>
        </p>
      </section>

      {wrong.length > 0 ? (
        <section aria-labelledby="err-h">
          <h2 id="err-h" class="h2 section-h">Fehler ({wrong.length})</h2>
          <p class="muted small">Diese Fragen sind im Fehler-Training und kommen morgen wieder (unbeantwortete nicht).</p>
          <div class="errlist">
            {wrong.map((q) => (
              <ErrorItem key={q.id} q={q} a={sim.answers[q.id]} n={sim.ids.indexOf(q.id) + 1} />
            ))}
          </div>
        </section>
      ) : (
        <p class="center">Keine Fehler – stark!</p>
      )}

      <Dock>
        <button key="home" type="button" class="btn btn-ghost" onClick={() => go('start')}>Startseite</button>
        <button key="new" type="button" class="btn btn-primary" onClick={onNew}>Neue Simulation</button>
      </Dock>
    </div>
  );
}

function ErrorItem({ q, a, n }: { q: Question; a?: SimAnswer; n: number }) {
  const answered = isAnswered(q, a);
  const marks = q.type === 'mc' && answered ? evaluateMc(q, a!.sel!).marks : undefined;
  return (
    <details class="card erritem">
      <summary>
        <span class="err-n">{n}</span>
        <Html tag="span" class="err-q" html={q.question} />
      </summary>
      <div class="err-body">
        <QuestionMeta q={q} />
        {q.type === 'mc' && (
          <ul class="err-opts">
            {q.options!.map((o, i) => {
              const m = marks?.[i] ?? (q.correct!.includes(i) ? 'missed' : 'none');
              return (
                <li key={i} class={`err-opt is-${m}`}>
                  <b class="letter">{LETTERS[i]}</b> <Html tag="span" html={o} />
                  <span class="err-tag">{m === 'hit' ? 'richtig gewählt' : m === 'missed' ? 'richtig' : m === 'wrong' ? 'deine Wahl – falsch' : ''}</span>
                </li>
              );
            })}
          </ul>
        )}
        <p class="err-status">{!answered ? 'Nicht beantwortet.' : q.type === 'mc' ? '' : 'Selbst bewertet: nicht gewusst.'}</p>
        <AnswerView q={q} />
      </div>
    </details>
  );
}
