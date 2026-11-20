export type QuestionType = 'mc' | 'open' | 'calc' | 'case';

export interface Question {
  id: string;
  /** nur intern, wird in der UI nicht angezeigt */
  source: 'schriftlich' | 'muendlich';
  part: number;
  section: string;
  topic: string;
  type: QuestionType;
  question: string;
  options?: string[];
  /** Indizes der richtigen Optionen (nur bei mc), teils mehrere */
  correct?: number[];
  explanation: string;
  /** Prüfer-Nachfrage / Hinweis */
  followup?: string;
}
