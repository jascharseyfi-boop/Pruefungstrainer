import { useState } from 'preact/hooks';
import type { SimResult } from '../store/model';

const fmtDate = (ms: number) => new Date(ms).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
const pct = (r: SimResult) => (r.total ? Math.round((r.correct / r.total) * 100) : 0);

/** Verlauf der Simulationsergebnisse: Linie + Punkte, Antippen zeigt den Wert. */
export function SimChart({ sims }: { sims: SimResult[] }) {
  const list = sims.slice(-20);
  const offset = sims.length - list.length;
  const [sel, setSel] = useState(list.length - 1);
  const W = 320, H = 170, L = 34, R = 12, T = 12, B = 22;
  const iw = W - L - R, ih = H - T - B;
  const x = (i: number) => L + (list.length === 1 ? iw / 2 : (i / (list.length - 1)) * iw);
  const y = (v: number) => T + ih - (v / 100) * ih;
  const pass = list[list.length - 1]?.passMark ?? 50;
  const cur = list[Math.min(sel, list.length - 1)];
  const path = list.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(pct(r)).toFixed(1)}`).join(' ');

  return (
    <figure class="simchart">
      <figcaption class="readout" aria-live="polite">
        <b>Simulation {offset + sel + 1}</b> · {fmtDate(cur.at)} · <b>{pct(cur)} %</b> ({cur.correct}/{cur.total}) ·{' '}
        <span class={cur.passed ? 'txt-ok' : 'txt-bad'}>{cur.passed ? '✓ bestanden' : '✗ nicht bestanden'}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Verlauf von ${list.length} Simulationen in Prozent`}>
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} class="grid" />
            <text x={L - 6} y={y(v) + 4} class="tick" text-anchor="end">{v}</text>
          </g>
        ))}
        {pass !== 50 && <line x1={L} x2={W - R} y1={y(pass)} y2={y(pass)} class="grid" />}
        <line x1={L} x2={W - R} y1={y(pass)} y2={y(pass)} class="passline" />
        <text x={W - R} y={y(pass) - 5} class="tick" text-anchor="end">Grenze {pass} %</text>
        {list.length > 1 && <path d={path} class="line" />}
        {list.map((r, i) => (
          <g key={r.at} class={`pt${i === sel ? ' is-sel' : ''}`}>
            <circle cx={x(i)} cy={y(pct(r))} r={i === sel ? 6 : 4.5} class="dot" />
            <circle
              cx={x(i)} cy={y(pct(r))} r={14} class="hit" tabIndex={0} role="button"
              aria-label={`Simulation ${offset + i + 1}: ${pct(r)} %, ${r.passed ? 'bestanden' : 'nicht bestanden'}`}
              onClick={() => setSel(i)} onFocus={() => setSel(i)} onMouseEnter={() => setSel(i)}
            />
          </g>
        ))}
        <text x={L} y={H - 4} class="tick">{fmtDate(list[0].at)}</text>
        {list.length > 1 && <text x={W - R} y={H - 4} class="tick" text-anchor="end">{fmtDate(list[list.length - 1].at)}</text>}
      </svg>
      <details class="table-toggle">
        <summary>Als Tabelle</summary>
        <table class="data-table">
          <thead><tr><th>#</th><th>Datum</th><th>Ergebnis</th><th>%</th><th></th></tr></thead>
          <tbody>
            {sims.map((r, i) => ({ r, i })).reverse().map(({ r, i }) => (
              <tr key={r.at}>
                <td>{i + 1}</td>
                <td>{fmtDate(r.at)}</td>
                <td>{r.correct}/{r.total}</td>
                <td>{pct(r)}</td>
                <td class={r.passed ? 'txt-ok' : 'txt-bad'}>{r.passed ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
