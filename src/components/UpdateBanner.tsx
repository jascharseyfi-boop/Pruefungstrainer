import { useEffect, useState } from 'preact/hooks';
import { applyUpdate, onUpdate } from '../pwa';

export function UpdateBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => onUpdate(setShow), []);
  if (!show) return null;
  return (
    <div class="update" role="status">
      <span>Neue Version verfügbar.</span>
      <button type="button" class="btn btn-primary btn-sm btn-auto" onClick={applyUpdate}>Aktualisieren</button>
    </div>
  );
}
