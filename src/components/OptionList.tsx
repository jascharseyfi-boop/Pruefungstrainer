import type { Question } from '../data/types';
import { Html } from './Html';
import { LETTERS } from './QuestionView';

/** Statische Optionsliste (Karteikarten): nach dem Aufdecken werden richtige Optionen markiert. */
export function OptionList({ q, reveal }: { q: Question; reveal: boolean }) {
  if (q.type !== 'mc' || !q.options) return null;
  const correct = new Set(q.correct ?? []);
  return (
    <ol class="opts opts-static">
      {q.options.map((o, i) => {
        const ok = reveal && correct.has(i);
        return (
          <li key={i} class={`opt${ok ? ' is-correct' : ''}${reveal && !ok ? ' is-dim' : ''}`}>
            <b class="letter">{LETTERS[i]}</b>
            <Html tag="span" html={o} />
            {ok && <span class="sr-only"> (richtig)</span>}
          </li>
        );
      })}
    </ol>
  );
}
