/** Logo: Schild in Weinrot mit weißem Innenrahmen und Querbalken (Warntafel-Form). */
export function Plate() {
  return (
    <svg class="plate" viewBox="0 0 46 36" width="46" height="36" aria-hidden="true">
      <rect width="46" height="36" rx="5" fill="var(--wine)" />
      <rect x="4" y="4" width="38" height="28" rx="2.5" fill="none" stroke="#fff" stroke-width="2.5" />
      <line x1="4" y1="18" x2="42" y2="18" stroke="#fff" stroke-width="2.5" />
    </svg>
  );
}

export function Header({ title, sub, back }: { title: string; sub?: string; back?: () => void }) {
  return (
    <header class="topbar">
      {back ? (
        <button type="button" class="back" onClick={back} aria-label="Zurück">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      ) : (
        <Plate />
      )}
      <div class="topbar-text">
        <h1 class="brand">{title}</h1>
        {sub && <p class="sub">{sub}</p>}
      </div>
    </header>
  );
}
