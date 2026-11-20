import { useEffect, useRef } from 'preact/hooks';

/**
 * Globale Tastenkürzel. Leertaste/Enter werden ignoriert, wenn ein Button oder Eingabefeld
 * den Fokus hat (dann übernimmt das Element selbst).
 */
export function useKeys(map: Record<string, () => void>): void {
  const ref = useRef(map);
  ref.current = map;
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const key = e.key === ' ' ? 'Space' : e.key;
      if ((key === 'Space' || key === 'Enter') && (tag === 'BUTTON' || tag === 'A')) return;
      const fn = ref.current[key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);
}
