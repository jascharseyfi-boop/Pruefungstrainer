# Elearning – Prüfungstrainer Fachkunde Güterkraftverkehr

Installierbare, offline-fähige Web-App (PWA) mit 310 Fragen. Anforderungen: `CLAUDE.md`,
Bedienung & Veröffentlichung: **`ANLEITUNG.md`**.

**Fertige App:** Ordner `dist/` → per Drag & Drop auf https://app.netlify.com/drop.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `data/questions.json` | 310 Fragen (12 Themen) |
| `src/screens/` | Startseite, Karteikarten, Quiz, Prüfungssimulation, Fehler-Training, Statistik, Sichern |
| `src/store/` | Lernstand: Modell (Spaced Repetition 1/3/7/14 Tage), Speicher-Schnittstelle (localStorage, sync-fähig) |
| `src/lib/` | MC-Auswertung, Simulation, Export/Import, sicheres HTML-Rendern, Statistik |
| `src/sw-template.js` | Service Worker (Precache-Liste wird beim Build eingesetzt, siehe `vite.config.ts`) |
| `public/` | Manifest, Icons, Netlify-`_headers` |
| `scripts/` | Fragen prüfen, Themen-Umsortierung, Icons erzeugen |
| `tests/` | Unit-Tests (Vitest) und Browser-Tests (`tests/e2e/run.cjs`) |
| `referenz/` | früherer Prototyp (Stilvorlage) |

## Befehle

```
npm install
npm run dev        # Entwicklungsserver
npm run validate   # prüft data/questions.json
npm test           # Unit-Tests
npm run build      # erzeugt dist/
npm run e2e        # Build + Browser-Tests (Playwright/Chromium)
```

Technik: Vite + Preact + TypeScript, keine Laufzeit-Abhängigkeiten außer Preact,
selbst gehostete Schriften, kein Tracking, keine externen Anfragen.
