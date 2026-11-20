# Prüfungstrainer Fachkunde Güterkraftverkehr

Installierbare Web-App (PWA) zum Lernen für die IHK-Fachkundeprüfung Güterkraftverkehr.
Nutzer: Jaschar und Teilnehmende seines Seminars. Sprache der App: Deutsch.

## Ziel
Eine statische Web-App, die ohne Claude, ohne Konto und offline funktioniert und auf dem
iPhone über „Zum Home-Bildschirm“ wie eine App läuft. Hosting: Netlify Drop
(Ordner `dist/` per Drag & Drop auf netlify.com/drop).

## Inhalt
- `data/questions.json`: 310 Fragen, ein gemeinsamer Pool (keine Trennung mündlich/schriftlich in der UI).
- Felder: `id`, `source` (schriftlich|muendlich, nur intern), `part`, `section`, `topic`,
  `type` (`mc` | `open` | `calc` | `case`), `question`, `options` + `correct` (Indizes, nur bei `mc`,
  teils mehrere richtige), `explanation`, optional `followup` (Prüfer-Nachfrage / Hinweis).
- Texte enthalten einfaches Inline-HTML (`<b>`, `<i>`, `<br/>`, `<font>`). Beim Rendern auf diese Tags
  beschränken (Whitelist), `<font>` in `<span>` umwandeln.
- Themen sind per Stichwort vorsortiert (12 Themen + 1× „Sonstiges“) – bitte prüfen und nachschärfen.
- Überschneidungen zwischen den Sammlungen (z. B. GmbH, Abmahnung, Mahnbescheid, Abschreibung):
  beide Fragen behalten, nur echte Doppel zusammenlegen. Bei abweichenden Zahlen gilt der korrigierte
  Wert (z. B. dreiachsiger Anhänger: 24 t, nicht 25 t). Hinweise auf veraltete Folien bleiben erhalten.

## Lernmodi
1. **Karteikarten**: Frage → „Antwort zeigen“ → „Konnte ich“ / „Nochmal“.
2. **Quiz**: MC antippen → sofort richtig/falsch + Erklärung. Bei mehreren richtigen Antworten
   Hinweis anzeigen und „Prüfen“-Button. `open`/`calc`/`case`: aufdecken und selbst bewerten.
3. **Prüfungssimulation**: einstellbar (Anzahl Fragen, Zeitlimit, Bestehensgrenze).
   Voreinstellung 30 zufällige Fragen aus allen Themen, 60 Minuten, bestanden ab 50 %.
   Timer sichtbar, am Ende Punktzahl, bestanden/nicht bestanden, Liste der Fehler mit Lösungen.
4. **Fehler-Training (Spaced Repetition)**: falsch beantwortete und „Nochmal“-Fragen kommen in
   wachsenden Abständen wieder (z. B. 1, 3, 7, 14 Tage; richtige Antwort → nächste Stufe, falsch → zurück auf 1).

Filter für alle Modi: Thema (Mehrfachauswahl), Zufallsreihenfolge.

## Statistik
Fortschritt gesamt und pro Thema (sicher / wackelig / offen), schwächste Themen hervorheben,
Lernserie (Tage in Folge), Verlauf der Simulationsergebnisse.

## Speicherung & Geräte
- Lernstand nur lokal (IndexedDB oder localStorage, alle Zugriffe mit try/catch).
- **Export/Import**: „Lernstand exportieren“ erzeugt einen kopierbaren Code (komprimiertes JSON,
  Base64) und alternativ eine Datei; „Importieren“ liest beides ein (mit Vorschau und Bestätigung).
- Kein Konto, kein Server, kein Tracking. Architektur so halten, dass echter Sync später ergänzt werden kann.

## Technik
- Statisch, ohne Backend. Gern Vite + Vanilla TS oder ein kleines Framework (z. B. Preact) –
  Ergebnis muss als Ordner `dist/` ohne Build-Schritt auf Netlify laufen.
- PWA: `manifest.webmanifest`, App-Icons (inkl. `apple-touch-icon` 180×180), Service Worker für
  vollständige Offline-Nutzung, iOS-Meta-Tags (`apple-mobile-web-app-capable`, Statusbar), Safe-Area-Insets.
- Mobile first (iPhone), funktioniert auch am Desktop. Hell- und Dunkelmodus nach Systemeinstellung.
- Barrierearm: gut lesbare Schriftgrößen, Fokus-Stile, Tastatur (Leertaste = aufdecken, 1/2 = bewerten).

## Design
Freie Wahl: eigener Name und eigener Look, passend zum Thema Güterverkehr (Referenz für Stil und
Bedienung: `referenz/lernkarten-prototyp.html`, Orange wie die Gefahrgut-Warntafel).
Keine generischen KI-Looks; klare Typografie, große Buttons unten in Daumenreichweite.

## Lieferumfang
1. Lauffähige App im Ordner `dist/`.
2. `ANLEITUNG.md` auf Deutsch: Netlify-Drop-Upload, Link ans iPhone, „Zum Home-Bildschirm“,
   Updates einspielen, Lernstand übertragen.
3. Kurzer Test: alle 310 Fragen rendern, MC-Auswertung inkl. Mehrfachantworten, Export → Import ergibt
   denselben Lernstand, App startet offline.
