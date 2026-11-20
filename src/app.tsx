import type { JSX } from 'preact';
import { TabBar } from './components/TabBar';
import { UpdateBanner } from './components/UpdateBanner';
import { useRoute, type Route } from './router';
import { Flashcards } from './screens/Flashcards';
import { Home } from './screens/Home';
import { Learn } from './screens/Learn';
import { Quiz } from './screens/Quiz';
import { Simulation } from './screens/Simulation';
import { Stats } from './screens/Stats';
import { Topics } from './screens/Topics';
import { Training } from './screens/Training';
import { Transfer } from './screens/Transfer';

const SCREENS: Record<Route, () => JSX.Element> = {
  start: Home,
  lernen: Learn,
  karten: Flashcards,
  quiz: Quiz,
  simulation: Simulation,
  training: Training,
  themen: Topics,
  statistik: Stats,
  sichern: Transfer,
};
const WITH_TABS: Route[] = ['start', 'themen', 'statistik', 'sichern'];

export function App() {
  const route = useRoute();
  const Screen = SCREENS[route];
  const showTabs = WITH_TABS.includes(route);
  return (
    <div class={`shell${showTabs ? ' has-tabs' : ''}`}>
      <main>
        <Screen key={route} />
      </main>
      <UpdateBanner />
      {showTabs && <TabBar active={route} />}
    </div>
  );
}
