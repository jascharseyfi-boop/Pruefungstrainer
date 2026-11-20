export function Plate({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <div class={`plate plate-${size}`} aria-hidden="true">
      <span>FK</span>
      <span>GV</span>
    </div>
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
