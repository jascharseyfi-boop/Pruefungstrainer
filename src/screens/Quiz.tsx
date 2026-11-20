import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Dock } from '../components/Dock';
import { Header } from '../components/Header';
import { McOptions } from '../components/McOptions';
import { AnswerView, QuestionMeta, QuestionText } from '../components/QuestionView';
import { QUESTIONS, QUESTION_BY_ID } from '../data/questions';
import { evaluateMc, isMulti, toggleOption, type OptionMark } from '../lib/mc';
import { buildDeck } from '../lib/select';
import { useKeys } from '../lib/useKeys';
import { go } from '../router';
import { recordAnswer } from '../store/model';
import { store } from '../store/store';

interface Result { id: string; ok: boolean }

export interface QuizSessionProps {
  title: string;
  /** liefert die Fragen-IDs für eine neue Runde */
  buildIds: () => string[];
  /** false: richtige Antworten ändern den Lernstand nicht (nur falsche setzen zurück) */
  recordRight?: boolean;
  emptyText?: string;
  onBack?: () => void;
}

export function Quiz() {
  return <QuizSession title="Quiz" buildIds={() => buildDeck(QUESTIONS, store.get().settings).map((q) => q.id)} />;
}

/**
 * Quiz-Sitzung: MC sofort auswerten, offene Fragen aufdecken und selbst bewerten.
 * Wird von Quiz und Fehler-Training genutzt.
 */
export function QuizSession({ title, buildIds, recordRight: recordRightInitial = true, emptyText, onBack = () => go('start') }: QuizSessionProps) {
  const initial = useMemo(buildIds, []);
  const [ids, setIds] = useState(initial);
  const [recordRight, setRecordRight] = useState(recordRightInitial);
  const [pos, setPos] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [marks, setMarks] = useState<OptionMark[] | undefined>();
  const [revealed, setRevealed] = useState(false); // Lösung sichtbar
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  const q = QUESTION_BY_ID.get(ids[pos] ?? '');
  const done = finished || pos >= ids.length;
  const isMc = q?.type === 'mc';
  const multi = q ? isMulti(q) : false;
  const answered = lastOk !== null;

  useEffect(() => {
    if (revealed) answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [revealed, pos]);

  const commit = (ok: boolean) => {
    if (!q || answered) return;
    // Wiederholungsrunden: richtige Antworten nicht verbuchen, sonst steigt die Stufe am selben Tag
    if (!ok || recordRight) store.update((s) => recordAnswer(s, q.id, ok));
    setResults((r) => [...r, { id: q.id, ok }]);
    setLastOk(ok);
  };

  const checkMc = (sel: number[]) => {
    if (!q || answered || sel.length === 0) return;
    const r = evaluateMc(q, sel);
    setMarks(r.marks);
    setRevealed(true);
    commit(r.correct);
  };

  const pick = (i: number) => {
    if (!q || answered || !q.options || i >= q.options.length) return;
    const next = toggleOption(q, selected, i);
    setSelected(next);
    if (!multi) checkMc(next); // Einfachauswahl: sofort auswerten
  };

  const selfRate = (ok: boolean) => {
    if (!q || isMc || !revealed || answered) return;
    commit(ok);
    next();
  };

  const next = () => {
    setPos((p) => p + 1);
    setSelected([]);
    setMarks(undefined);
    setRevealed(false);
    setLastOk(null);
    window.scrollTo(0, 0);
  };

  const restart = (list: string[], record: boolean) => {
    setIds(list);
    setRecordRight(record);
    setPos(0);
    setResults([]);
    setSelected([]);
    setMarks(undefined);
    setRevealed(false);
    setLastOk(null);
    setFinished(false);
  };

  const keys: Record<string, () => void> = {};
  if (q && !done) {
    if (isMc) {
      if (!answered) {
        q.options!.forEach((_, i) => {
          keys[String(i + 1)] = () => pick(i);
          keys['abcdefgh'[i]] = () => pick(i);
        });
        if (multi) keys.Enter = () => checkMc(selected);
      } else {
        keys.Enter = next;
        keys.Space = next;
      }
    } else if (!revealed) {
      keys.Space = () => setRevealed(true);
      keys.Enter = () => setRevealed(true);
    } else {
      keys['1'] = () => selfRate(true);
      keys['2'] = () => selfRate(false);
    }
  }
  useKeys(keys);

  if (initial.length === 0) {
    return (
      <div class="screen">
        <Header title={title} back={onBack} />
        <div class="card"><p>{emptyText ?? 'Keine Fragen in der aktuellen Auswahl. Bitte unter „Themen“ eine Auswahl treffen.'}</p></div>
      </div>
    );
  }

  if (done) {
    const right = results.filter((r) => r.ok).length;
    const wrong = results.filter((r) => !r.ok).map((r) => r.id);
    const pct = results.length ? Math.round((right / results.length) * 100) : 0;
    return (
      <div class="screen">
        <Header title={title} back={onBack} />
        <section class="card done">
          <h2 class="h2">Runde beendet</h2>
          <div class="big-num">{pct} %</div>
          <p class="muted">{right} von {results.length} richtig</p>
          {wrong.length > 0 && <p class="muted">Falsche Fragen sind im Fehler-Training und kommen morgen wieder.</p>}
          {!recordRight && <p class="muted small">Wiederholungsrunde: Richtige Antworten verschieben den Termin im Fehler-Training nicht.</p>}
        </section>
        <Dock>
          {wrong.length > 0 && (
            <button key="rep" type="button" class="btn btn-primary" onClick={() => restart(wrong, false)}>{wrong.length} Falsche üben</button>
          )}
          <button key="new" type="button" class={`btn ${wrong.length ? 'btn-ghost' : 'btn-primary'}`} onClick={() => restart(buildIds(), recordRightInitial)}>
            Neue Runde
          </button>
        </Dock>
      </div>
    );
  }

  const correctSoFar = results.filter((r) => r.ok).length;
  const correctCount = q!.correct?.length ?? 0;

  return (
    <div class="screen has-dock">
      <Header title={title} back={onBack} />
      <div class="progress-line" aria-hidden="true"><span style={{ width: `${(pos / ids.length) * 100}%` }} /></div>
      <article class="card qcard" key={`${q!.id}-${pos}`}>
        <QuestionMeta q={q!} extra={<span class="qcount">{pos + 1} / {ids.length} · {correctSoFar} ✓</span>} />
        <QuestionText q={q!} />
        {multi && !answered && (
          <div class="hint-multi" role="note">Mehrere Antworten richtig ({correctCount}). Alle auswählen, dann „Prüfen“.</div>
        )}
        {isMc && <McOptions q={q!} selected={selected} onToggle={pick} marks={marks} />}
        {answered && (
          <div class={`verdict ${lastOk ? 'is-ok' : 'is-bad'}`} role="status">
            {lastOk ? 'Richtig!' : multi && marks?.includes('hit') ? 'Leider nicht ganz richtig' : 'Leider falsch'}
          </div>
        )}
        {revealed && (
          <div ref={answerRef} class="answer-anchor">
            <AnswerView q={q!} showCorrectOptions={isMc && !lastOk} />
          </div>
        )}
      </article>
      <button type="button" class="link-btn" onClick={() => setFinished(true)}>Runde beenden</button>

      {isMc && !answered && multi && (
        <Dock hint="Tastatur: 1–5 bzw. A–E wählen · Enter = Prüfen">
          <button key="check" type="button" class="btn btn-primary" disabled={selected.length === 0} onClick={() => checkMc(selected)}>Prüfen</button>
        </Dock>
      )}
      {isMc && answered && (
        <Dock hint="Tastatur: Enter = Weiter">
          <button key="next" type="button" class="btn btn-primary" onClick={next}>Weiter</button>
        </Dock>
      )}
      {!isMc && !revealed && (
        <Dock hint="Tastatur: Leertaste = Lösung zeigen">
          <button key="reveal" type="button" class="btn btn-primary" onClick={() => setRevealed(true)}>Lösung zeigen</button>
        </Dock>
      )}
      {!isMc && revealed && (
        <Dock hint="Selbst bewerten · Tastatur: 1 = Gewusst · 2 = Nicht gewusst">
          <button key="bad" type="button" class="btn btn-again" onClick={() => selfRate(false)}>Nicht gewusst</button>
          <button key="ok" type="button" class="btn btn-good" onClick={() => selfRate(true)}>Gewusst</button>
        </Dock>
      )}
    </div>
  );
}
