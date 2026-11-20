import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../src/data/questions';
import { decodeInput, encodeCode, fileContent } from '../src/lib/transfer';
import { addSim, emptyState, recordAnswer, type LearnState } from '../src/store/model';

function sampleState(): LearnState {
  let s = emptyState();
  QUESTIONS.forEach((q, i) => {
    if (i % 3 === 0) s = recordAnswer(s, q.id, i % 2 === 0, new Date(2026, 10, 1 + (i % 20), 10));
  });
  s = addSim(s, { at: 1795000000000, total: 30, correct: 20, passMark: 50, passed: true, seconds: 2400, limitMin: 60, wrongIds: ['S001', 'M010'] });
  s = { ...s, settings: { ...s.settings, topics: ['Gefahrgut', 'Marketing'], shuffle: false, simCount: 40 } };
  return s;
}

describe('Export → Import', () => {
  it('Code-Roundtrip ergibt denselben Lernstand', async () => {
    const s = sampleState();
    const code = await encodeCode(s, 1795100000000);
    expect(code.startsWith('EL1.')).toBe(true);
    const r = await decodeInput(code);
    expect(r.state).toEqual(s);
    expect(r.exportedAt).toBe(1795100000000);
  });
  it('Code ist deutlich kleiner als das JSON', async () => {
    const s = sampleState();
    const code = await encodeCode(s);
    expect(code.length).toBeLessThan(JSON.stringify(s).length / 2);
  });
  it('verträgt Zeilenumbrüche und Leerzeichen (z. B. aus Mail)', async () => {
    const s = sampleState();
    const code = await encodeCode(s);
    const broken = '  ' + code.match(/.{1,60}/g)!.join('\n') + '\n';
    expect((await decodeInput(broken)).state).toEqual(s);
  });
  it('Datei-Roundtrip', async () => {
    const s = sampleState();
    const file = fileContent(await encodeCode(s));
    expect(JSON.parse(file).app).toBe('elearning');
    expect((await decodeInput(file)).state).toEqual(s);
  });
  it('leerer Stand', async () => {
    expect((await decodeInput(await encodeCode(emptyState()))).state).toEqual(emptyState());
  });
  it('klare Fehler bei kaputten Eingaben', async () => {
    const code = await encodeCode(sampleState());
    await expect(decodeInput('')).rejects.toThrow(/einfügen/);
    await expect(decodeInput('hallo')).rejects.toThrow(/ungültig/);
    await expect(decodeInput(code.slice(0, code.length - 40))).rejects.toThrow(/beschädigt/);
    await expect(decodeInput('{"foo":1}')).rejects.toThrow(/kein Elearning/);
  });
});
