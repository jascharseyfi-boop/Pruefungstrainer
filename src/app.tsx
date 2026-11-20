import { TabBar } from './components/TabBar';
import { useRoute } from './router';
import { Flashcards } from './screens/Flashcards';
import { Home } from './screens/Home';
import { Quiz } from './screens/Quiz';
import { Simulation } from './screens/Simulation';
import { Stats } from './screens/Stats';
import { Training } from './screens/Training';
import { Transfer } from './screens/Transfer';
import { Placeholder } from './screens/Placeholder';

const TITLES = {
  karten: 'Karteikarten',
  quiz: 'Quiz',
  simulation: 'Prüfungssimulation',
  training: 'Fehler-Training',
  statistik: 'Statistik',
  sichern: 'Lernstand sichern',
} as const;

export function App() {
  const route = useRoute();
  const showTabs = route === 'start' || route === 'statistik' || route === 'sichern';
  return (
    <div class={`shell${showTabs ? ' has-tabs' : ''}`}>
      {route === 'start' ? <Home /> : route === 'karten' ? <Flashcards /> : route === 'quiz' ? <Quiz /> : route === 'simulation' ? <Simulation /> : route === 'training' ? <Training /> : route === 'statistik' ? <Stats /> : route === 'sichern' ? <Transfer /> : <Placeholder title={TITLES[route]} />}
      {showTabs && <TabBar active={route} />}
    </div>
  );
}
