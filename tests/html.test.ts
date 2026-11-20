import { describe, expect, it } from 'vitest';
import { sanitizeHtml, stripHtml } from '../src/lib/html';
import { QUESTIONS } from '../src/data/questions';

describe('sanitizeHtml', () => {
  it('lässt erlaubte Tags durch', () => {
    expect(sanitizeHtml('a <b>fett</b> <i>kursiv</i><br/>neu')).toBe('a <b>fett</b> <i>kursiv</i><br>neu');
  });
  it('wandelt <font> in <span> um und verwirft Attribute', () => {
    expect(sanitizeHtml('<font color="red" onclick="x()">rot</font>')).toBe('<span>rot</span>');
  });
  it('entfernt gefährliche Tags und escaped Text', () => {
    expect(sanitizeHtml('<script>alert(1)</script><img src=x onerror=alert(1)>')).toBe('alert(1)');
    expect(sanitizeHtml('<b onmouseover="x">a</b> < 5 & > 3')).toBe('<b>a</b> &lt; 5 &amp; &gt; 3');
  });
  it('schließt offene Tags und ignoriert verwaiste', () => {
    expect(sanitizeHtml('<b>offen')).toBe('<b>offen</b>');
    expect(sanitizeHtml('zu</b>')).toBe('zu');
  });
  it('escaped Entities nicht doppelt', () => {
    expect(sanitizeHtml('A &amp; B')).toBe('A &amp; B');
  });
  it('stripHtml liefert reinen Text', () => {
    expect(stripHtml('<b>a</b><br/>b')).toBe('a b');
  });
});

describe('Fragen-Daten', () => {
  it('alle 310 Fragen lassen sich sicher rendern', () => {
    expect(QUESTIONS).toHaveLength(310);
    for (const q of QUESTIONS) {
      for (const t of [q.question, q.explanation, q.followup, ...(q.options ?? [])]) {
        if (!t) continue;
        const out = sanitizeHtml(t);
        expect(out).not.toMatch(/<(?!\/?(b|i|span)>|br>)/);
        expect(stripHtml(out).length).toBeGreaterThan(0);
      }
    }
  });
});
