import { useEffect, useState } from 'preact/hooks';

/** Aktuelle Zeit, aktualisiert im angegebenen Takt (und beim Zurückkehren in die App). */
export function useNow(ms = 1000, active = true): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    const t = setInterval(tick, ms);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ms, active]);
  return now;
}
