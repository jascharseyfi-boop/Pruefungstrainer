import { go, type Route } from '../router';

const TABS: { route: Route; label: string; icon: string }[] = [
  { route: 'start', label: 'Lernen', icon: 'M4 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z' },
  { route: 'themen', label: 'Themen', icon: 'M4 6h16M4 12h16M4 18h16M8 4v4M14 10v4M10 16v4' },
  { route: 'statistik', label: 'Statistik', icon: 'M5 20V11M12 20V4M19 20v-6' },
  { route: 'sichern', label: 'Sichern', icon: 'M12 4v11m0 0l-4-4m4 4l4-4M5 20h14' },
];

/** Untere Navigation in Daumenreichweite. */
export function TabBar({ active }: { active: Route }) {
  return (
    <nav class="tabbar" aria-label="Hauptnavigation">
      <div class="tabbar-in">
        {TABS.map((t) => (
          <button
            key={t.route}
            type="button"
            class={`tab${active === t.route ? ' is-active' : ''}`}
            aria-current={active === t.route ? 'page' : undefined}
            onClick={() => go(t.route)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d={t.icon} fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
