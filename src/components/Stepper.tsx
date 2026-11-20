/** Zahlenwahl mit großen −/+ Knöpfen (gut am Handy bedienbar). */
export function Stepper({ id, label, value, min, max, step, format, onChange }: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const text = format ? format(value) : String(value);
  return (
    <div class="stepper">
      <span class="stepper-label" id={`${id}-l`}>{label}</span>
      <div class="stepper-ctl" role="group" aria-labelledby={`${id}-l`}>
        <button type="button" class="stepper-btn" aria-label={`${label} verringern`} disabled={value <= min}
          onClick={() => onChange(clamp(value - step))}>−</button>
        <output class="stepper-val" aria-live="polite">{text}</output>
        <button type="button" class="stepper-btn" aria-label={`${label} erhöhen`} disabled={value >= max}
          onClick={() => onChange(clamp(value + step))}>+</button>
      </div>
    </div>
  );
}
