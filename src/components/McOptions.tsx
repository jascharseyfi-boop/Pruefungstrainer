import type { Question } from '../data/types';
import { isMulti, type OptionMark } from '../lib/mc';
import { Html } from './Html';
import { LETTERS } from './QuestionView';

const MARK_TEXT: Record<OptionMark, string> = {
  hit: 'richtig gewählt',
  missed: 'richtig, nicht gewählt',
  wrong: 'falsch gewählt',
  none: '',
};

/**
 * Antippbare MC-Optionen. Ohne `marks` = Auswahlmodus, mit `marks` = Auswertung (gesperrt).
 */
export function McOptions({ q, selected, onToggle, marks }: {
  q: Question;
  selected: readonly number[];
  onToggle: (i: number) => void;
  marks?: OptionMark[];
}) {
  const multi = isMulti(q);
  return (
    <div class="opts" role="group" aria-label={multi ? 'Antworten (mehrere richtig)' : 'Antworten'}>
      {q.options!.map((o, i) => {
        const sel = selected.includes(i);
        const mark = marks?.[i];
        const cls = ['opt', 'opt-btn', sel && 'is-sel', mark && mark !== 'none' && `is-${mark}`, marks && mark === 'none' && 'is-dim', multi && 'is-multi']
          .filter(Boolean).join(' ');
        return (
          <button
            key={i}
            type="button"
            class={cls}
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={sel}
            aria-disabled={!!marks}
            onClick={() => !marks && onToggle(i)}
          >
            <b class="letter">{multi ? <span class="box" aria-hidden="true">{sel ? '✓' : ''}</span> : LETTERS[i]}</b>
            <Html tag="span" class="opt-text" html={o} />
            {mark && mark !== 'none' && (
              <span class={`mark mark-${mark}`}>
                <span aria-hidden="true">{mark === 'wrong' ? '✗' : mark === 'missed' ? '!' : '✓'}</span>
                <span class="sr-only">{MARK_TEXT[mark]}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
