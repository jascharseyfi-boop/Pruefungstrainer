import { useEffect, useRef, useState } from 'preact/hooks';
import { Header } from '../components/Header';
import { QUESTIONS } from '../data/questions';
import { masteryCounts } from '../lib/stats';
import { decodeInput, encodeCode, fileContent, fileName } from '../lib/transfer';
import { emptyState, type LearnState } from '../store/model';
import { store, useLearnState } from '../store/store';

const fmt = (ms: number) =>
  ms ? new Date(ms).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–';

function Summary({ s, title }: { s: LearnState; title: string }) {
  const c = masteryCounts(QUESTIONS, s);
  return (
    <div class="sumbox">
      <div class="answer-label">{title}</div>
      <ul>
        <li><b>{c.sicher}</b> sicher · <b>{c.wackelig}</b> wackelig · <b>{c.offen}</b> offen</li>
        <li><b>{s.sims.length}</b> {s.sims.length === 1 ? 'Simulation' : 'Simulationen'} · <b>{s.days.length}</b> {s.days.length === 1 ? 'Lerntag' : 'Lerntage'}</li>
        <li class="muted">Zuletzt geändert: {fmt(s.updatedAt)}</li>
      </ul>
    </div>
  );
}

export function Transfer() {
  const state = useLearnState();
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<{ state: LearnState; exportedAt: number } | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (preview) previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [preview]);

  // ---------- Export ----------
  const makeCode = async () => {
    const c = await encodeCode(store.get());
    setCode(c);
    setCopied(false);
    return c;
  };

  const copy = async () => {
    const c = code || (await makeCode());
    try {
      await navigator.clipboard.writeText(c);
      setCopied(true);
    } catch {
      // Rückfall: Text markieren, Nutzer kopiert selbst
      codeRef.current?.focus();
      codeRef.current?.select();
    }
  };

  const saveFile = async () => {
    const c = code || (await makeCode());
    const content = fileContent(c);
    const name = fileName();
    const file = new File([content], name, { type: 'application/json' });
    // iPhone: Teilen-Menü (Dateien sichern, AirDrop, Mail); sonst Download
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Elearning Lernstand' });
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ---------- Import ----------
  const check = async (text: string) => {
    setError('');
    setDone('');
    setPreview(null);
    try {
      setPreview(await decodeInput(text));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onFile = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    if (f.size > 2_000_000) {
      setError('Die Datei ist zu groß für einen Lernstand.');
      return;
    }
    const text = await f.text();
    setInput('');
    await check(text);
    (e.target as HTMLInputElement).value = '';
  };

  const apply = () => {
    if (!preview) return;
    store.replace(preview.state);
    setPreview(null);
    setInput('');
    setCode('');
    setDone('Lernstand übernommen.');
  };

  return (
    <div class="screen">
      <Header title="Lernstand sichern" sub="Export & Import zwischen Geräten" />

      <section class="card xfer" aria-labelledby="exp-h">
        <h2 id="exp-h" class="h2">Exportieren</h2>
        <p class="muted small">Dein Lernstand liegt nur auf diesem Gerät. Mit dem Code oder der Datei überträgst du ihn auf ein anderes Gerät oder sicherst ihn.</p>
        <Summary s={state} title="Aktueller Stand" />
        {code && (
          <>
            <label class="answer-label" for="code-out">Code ({code.length.toLocaleString('de-DE')} Zeichen)</label>
            <textarea id="code-out" ref={codeRef} class="code" readOnly rows={4} value={code} onFocus={(e) => (e.target as HTMLTextAreaElement).select()} />
          </>
        )}
        <div class="btnrow">
          <button type="button" class="btn btn-primary btn-sm" onClick={copy}>{copied ? 'Kopiert ✓' : 'Code kopieren'}</button>
          <button type="button" class="btn btn-ghost btn-sm" onClick={saveFile}>Als Datei</button>
        </div>
        {copied && <p class="ok-msg" role="status">Code in der Zwischenablage. Auf dem anderen Gerät unter „Importieren“ einfügen.</p>}
      </section>

      <section class="card xfer" aria-labelledby="imp-h">
        <h2 id="imp-h" class="h2">Importieren</h2>
        <label class="answer-label" for="code-in">Code einfügen</label>
        <textarea
          id="code-in" class="code" rows={4} placeholder="EL1.…" value={input}
          autocomplete="off" autocapitalize="off" spellcheck={false}
          onInput={(e) => { setInput((e.target as HTMLTextAreaElement).value); setPreview(null); setError(''); }}
        />
        <div class="btnrow">
          <button type="button" class="btn btn-primary btn-sm" disabled={!input.trim()} onClick={() => check(input)}>Code prüfen</button>
          <button type="button" class="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>Datei wählen</button>
          <input ref={fileRef} type="file" accept=".json,.txt,application/json,text/plain" class="sr-only" tabIndex={-1} onChange={onFile} />
        </div>
        {error && <p class="err-msg" role="alert">{error}</p>}
        {done && <p class="ok-msg" role="status">{done}</p>}
        {preview && (
          <div ref={previewRef} class="preview" role="region" aria-label="Vorschau des Imports">
            <Summary s={preview.state} title={`Import vom ${fmt(preview.exportedAt)}`} />
            <p class="warn">Der aktuelle Lernstand auf diesem Gerät wird <b>vollständig ersetzt</b>.</p>
            <div class="btnrow">
              <button type="button" class="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>Abbrechen</button>
              <button type="button" class="btn btn-primary btn-sm" onClick={apply}>Übernehmen</button>
            </div>
          </div>
        )}
      </section>

      <section class="card xfer" aria-labelledby="rst-h">
        <h2 id="rst-h" class="h2">Zurücksetzen</h2>
        {!confirmReset ? (
          <button type="button" class="link-inline danger" onClick={() => setConfirmReset(true)}>Gesamten Lernstand löschen …</button>
        ) : (
          <>
            <p class="warn">Alle Antworten, Serien und Simulationen auf diesem Gerät werden gelöscht. Tipp: vorher exportieren.</p>
            <div class="btnrow">
              <button type="button" class="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Abbrechen</button>
              <button type="button" class="btn btn-again btn-sm" onClick={() => { store.replace({ ...emptyState(), settings: store.get().settings, updatedAt: Date.now() }); setConfirmReset(false); setCode(''); setDone('Lernstand gelöscht.'); }}>Löschen</button>
            </div>
          </>
        )}
      </section>
      <p class="muted small center">Kein Konto, kein Server: Es werden keine Daten übertragen, außer du kopierst den Code selbst.<br />App-Stand: {__BUILD_DATE__}</p>
    </div>
  );
}
