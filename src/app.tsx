import { QUESTIONS, TOPICS, countByTopic } from './data/questions';

/** Platzhalter-Startseite für Schritt 1 – die Lernmodi folgen in den nächsten Schritten. */
export function App() {
  const counts = countByTopic();
  return (
    <div class="shell">
      <header class="topbar">
        <div class="plate" aria-hidden="true">
          <span>FK</span>
          <span>GV</span>
        </div>
        <div>
          <h1 class="brand">Elearning</h1>
          <p class="sub">Fachkunde Güterkraftverkehr</p>
        </div>
      </header>
      <main class="content">
        <p class="lead">
          <strong>{QUESTIONS.length}</strong> Fragen in <strong>{TOPICS.length}</strong> Themen
        </p>
        <ul class="topic-list">
          {TOPICS.map((t) => (
            <li key={t}>
              <span>{t}</span>
              <span class="count">{counts.get(t)}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
