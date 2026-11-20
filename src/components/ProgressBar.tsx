/** Dreiteiliger Balken sicher / wackelig / offen. */
export function ProgressBar({ sicher, wackelig, offen, label }: { sicher: number; wackelig: number; offen: number; label?: string }) {
  const total = Math.max(1, sicher + wackelig + offen);
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <div class="pbar" role="img" aria-label={`${label ? label + ': ' : ''}${sicher} sicher, ${wackelig} wackelig, ${offen} offen`}>
      <span class="pbar-sicher" style={{ width: pct(sicher) }} />
      <span class="pbar-wackelig" style={{ width: pct(wackelig) }} />
    </div>
  );
}
