import { useEffect, useState } from 'preact/hooks';

export type Route = 'start' | 'karten' | 'quiz' | 'simulation' | 'training' | 'statistik' | 'sichern';
const ROUTES: Route[] = ['start', 'karten', 'quiz', 'simulation', 'training', 'statistik', 'sichern'];

function parse(): Route {
  const r = location.hash.replace(/^#\/?/, '') as Route;
  return ROUTES.includes(r) ? r : 'start';
}

export function go(r: Route): void {
  location.hash = r === 'start' ? '#/' : `#/${r}`;
}

/** Einfaches Hash-Routing: funktioniert offline, mit Zurück-Taste und ohne Server-Konfiguration. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse);
  useEffect(() => {
    const on = () => {
      setRoute(parse());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    // Falls sich die Adresse geändert hat, bevor der Listener stand
    setRoute(parse());
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
