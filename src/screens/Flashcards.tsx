import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Dock } from '../components/Dock';
import { Header } from '../components/Header';
import { OptionList } from '../components/OptionList';
import { AnswerView, QuestionMeta, QuestionText } from '../components/QuestionView';
import { QUESTIONS, QUESTION_BY_ID } from '../data/questions';
import { current, isDone, missedIds, rate, startSession, type FcSession } from '../lib/flashcards';
import { buildDeck } from '../lib/select';
import { useKeys } from '../lib/useKeys';
import { go } from '../router';
import { recordAnswer } from '../store/model';
import { store } from '../store/store';

export function Flashcards() {
  const initial = useMemo(() => buildDeck(QUESTIONS, store.get().settings).map((q) => q.id), []);
  const [session, setSession] = useState<FcSession>(() => startSession(initial));
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  // in Wiederholungsrunden zählen richtige Antworten nicht (sonst Stufenaufstieg am selben Tag)
  const [recordRight, setRecordRight] = useState(true);

  const id = current(session);
  const q = id ? QUESTION_BY_ID.get(id) : undefined;
  const done = finished || isDone(session);
  const answerRef = useRef<HTMLDivElement>(null);

  // Nach dem Aufdecken die Lösung in den sichtbaren Bereich holen
  useEffect(() => {
    if (revealed) answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [revealed]);

  const reveal = () => !done && setRevealed(true);
  const answer = (ok: boolean) => {
    if (done || !revealed || !id) return;
    const r = rate(session, ok);
    if (r.record && (!ok || recordRight)) store.update((s) => recordAnswer(s, id, ok));
    setSession(r.session);
    setRevealed(false);
    window.scrollTo(0, 0);
  };
  const restart = (ids: string[], record: boolean) => {
    setSession(startSession(ids));
    setRecordRight(record);
    setRevealed(false);
    setFinished(false);
  };

  useKeys({
    Space: () => (revealed ? undefined : reveal()),
    Enter: () => (revealed ? undefined : reveal()),
    '1': () => answer(true),
    '2': () => answer(false),
  });

  if (initial.length === 0) {
    return (
      <div class="screen">
        <Header title="Karteikarten" back={() => go('start')} />
        <div class="card"><p>Keine Fragen in der aktuellen Auswahl. Bitte unter „Themen“ eine Auswahl treffen.</p></div>
      </div>
    );
  }

  if (done) {
    const missed = missedIds(session);
    const rated = Object.keys(session.first).length;
    return (
      <div class="screen">
        <Header title="Karteikarten" back={() => go('start')} />
        <section class="card done">
          <h2 class="h2">Runde beendet</h2>
          <div class="done-stats">
            <div><div class="big-num ok">{rated - missed.length}</div><div class="label">gekonnt</div></div>
            <div><div class="big-num bad">{missed.length}</div><div class="label">nochmal</div></div>
          </div>
          {missed.length > 0 && <p class="muted">„Nochmal“-Karten sind ins Fehler-Training übernommen und kommen morgen wieder.</p>}
        </section>
        <Dock>
          {missed.length > 0 && (
            <button type="button" class="btn btn-primary" onClick={() => restart(missed, false)}>
              {missed.length} wiederholen
            </button>
          )}
          <button type="button" class={`btn ${missed.length ? 'btn-ghost' : 'btn-primary'}`} onClick={() => restart(buildDeck(QUESTIONS, store.get().settings).map((x) => x.id), true)}>
            Neue Runde
          </button>
        </Dock>
      </div>
    );
  }

  const total = session.queue.length;
  return (
    <div class="screen has-dock">
      <Header title="Karteikarten" back={() => go('start')} />
      <div class="progress-line" aria-hidden="true"><span style={{ width: `${(session.pos / total) * 100}%` }} /></div>
      <article class="card qcard" key={`${id}-${session.pos}`}>
        <QuestionMeta q={q!} extra={<span class="qcount">{session.pos + 1} / {total}</span>} />
        <QuestionText q={q!} />
        <OptionList q={q!} reveal={revealed} />
        {revealed && <div ref={answerRef} class="answer-anchor"><AnswerView q={q!} /></div>}
      </article>
      <button type="button" class="link-btn" onClick={() => setFinished(true)}>Runde beenden</button>
      {revealed ? (
        <Dock hint="Tastatur: 1 = Konnte ich · 2 = Nochmal">
          <button key="again" type="button" class="btn btn-again" onClick={() => answer(false)}>Nochmal</button>
          <button key="good" type="button" class="btn btn-good" onClick={() => answer(true)}>Konnte ich</button>
        </Dock>
      ) : (
        <Dock hint="Tastatur: Leertaste = Antwort zeigen">
          <button key="reveal" type="button" class="btn btn-primary" onClick={reveal}>Antwort zeigen</button>
        </Dock>
      )}
    </div>
  );
}
