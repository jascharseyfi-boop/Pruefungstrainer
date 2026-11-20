import type { Question } from '../data/types';
import { Html } from './Html';

export const TYPE_LABEL: Record<Question['type'], string> = {
  mc: 'Multiple Choice',
  open: 'Offene Frage',
  calc: 'Rechenaufgabe',
  case: 'Fallfrage',
};

export const LETTERS = 'ABCDEFGH';

export function QuestionMeta({ q, extra }: { q: Question; extra?: preact.ComponentChildren }) {
  return (
    <div class="qmeta">
      <span class="qtopic">{q.topic}</span>
      <span class="qkind">{TYPE_LABEL[q.type]}</span>
      {extra}
    </div>
  );
}

export function QuestionText({ q }: { q: Question }) {
  return <Html class="qtext" html={q.question} />;
}

/** Lösungsteil: richtige Optionen (bei MC), Erklärung, Prüfer-Nachfrage. */
export function AnswerView({ q, showCorrectOptions = false }: { q: Question; showCorrectOptions?: boolean }) {
  return (
    <div class="answer" aria-live="polite">
      {showCorrectOptions && q.type === 'mc' && q.options && q.correct && (
        <div class="answer-correct">
          <div class="answer-label">{q.correct.length > 1 ? 'Richtige Antworten' : 'Richtige Antwort'}</div>
          <ul>
            {q.correct.map((i) => (
              <li key={i}>
                <b class="letter">{LETTERS[i]}</b> <Html tag="span" html={q.options![i]} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <div class="answer-label">{q.type === 'mc' ? 'Erklärung' : 'Lösung'}</div>
        <Html class="answer-text" html={q.explanation} />
      </div>
      {q.followup && (
        <div class="followup">
          <div class="answer-label">Prüfer fragt nach</div>
          <Html html={q.followup} />
        </div>
      )}
    </div>
  );
}
