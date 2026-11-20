import type { ComponentChildren } from 'preact';

/** Feste Button-Leiste unten (Daumenreichweite, Safe Area). */
export function Dock({ children, hint }: { children: ComponentChildren; hint?: string }) {
  return (
    <div class="dock">
      <div class="dock-in">{children}</div>
      {hint && <div class="dock-hint">{hint}</div>}
    </div>
  );
}
