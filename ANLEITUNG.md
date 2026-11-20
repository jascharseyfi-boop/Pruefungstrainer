# Elearning – Anleitung

Elearning ist eine Web-App zum Lernen für die IHK-Fachkundeprüfung Güterkraftverkehr.
Sie läuft im Browser, lässt sich auf dem iPhone wie eine App installieren und funktioniert
danach **ohne Internet, ohne Konto und ohne Server**. Der Lernstand bleibt auf dem jeweiligen Gerät.

Die fertige App ist der Ordner **`dist/`**. Mehr braucht es für die Veröffentlichung nicht.

---

## 1. App online stellen (Netlify Drop)

1. Am Computer **https://app.netlify.com/drop** öffnen.
2. Kostenlos anmelden oder registrieren (z. B. mit E-Mail oder GitHub).
   Ohne Anmeldung ist die Seite nur vorübergehend online.
3. Den Ordner **`dist`** (den ganzen Ordner, nicht seinen Inhalt) in das Feld
   „Drag and drop your site output folder here“ ziehen.
4. Nach wenigen Sekunden erscheint ein Link wie `https://zufalls-name-123.netlify.app`.
5. Empfohlen: einen sprechenden Namen vergeben:
   **Site configuration → Change site name** → z. B. `elearning-gkv` →
   Link: `https://elearning-gkv.netlify.app`.

> Den Link einmal am Computer öffnen und prüfen, ob die Startseite mit den Lernmodi erscheint.

---

## 2. Link aufs iPhone bringen

Den Link per Nachricht, Mail oder AirDrop aufs iPhone schicken – oder im Seminar als QR-Code
zeigen (z. B. in der Kamera-App scannen lassen).

---

## 3. „Zum Home-Bildschirm“ – als App installieren

1. Den Link auf dem iPhone in **Safari** öffnen.
2. Unten auf **Teilen** tippen (Quadrat mit Pfeil nach oben).
3. Nach unten wischen → **„Zum Home-Bildschirm“** → **„Hinzufügen“**.
4. Auf dem Home-Bildschirm erscheint das Symbol mit der orangen Warntafel **„Elearning“**.
5. Die App **einmal mit Internet öffnen** und kurz warten. Danach funktioniert sie
   vollständig offline (Flugmodus, Funkloch, Lkw-Kabine …).

Die App zeigt in Safari selbst einen Hinweis „Als App installieren“, solange sie noch nicht
installiert ist. Am Android-Handy: im Chrome-Menü **„App installieren“** bzw.
**„Zum Startbildschirm hinzufügen“**. Am Computer läuft sie einfach im Browser.

---

## 4. Updates einspielen

Wenn es eine neue Version gibt (z. B. korrigierte Fragen):

1. Neuen Ordner **`dist/`** besorgen (aus dem Repository oder nach `npm run build`, siehe unten).
2. Bei Netlify anmelden → die Seite auswählen → Reiter **Deploys**.
3. Den neuen Ordner **`dist`** in das Feld
   „Need to update your site? Drag and drop your site output folder here“ ziehen.
   Der Link bleibt gleich.
4. Auf dem iPhone die App öffnen (mit Internet). Oben erscheint
   **„Neue Version verfügbar – Aktualisieren“** → antippen. Fertig.
   Falls der Hinweis nicht kommt: App ganz schließen (vom unteren Rand hochwischen und
   wegschieben) und neu öffnen.

**Der Lernstand bleibt bei Updates erhalten.**
Welche Version läuft, steht ganz unten im Bereich **Sichern** („App-Stand: TT.MM.JJJJ“).

---

## 5. Lernstand übertragen und sichern

Der Lernstand liegt nur auf dem Gerät. Für ein neues Handy, einen zweiten Rechner oder als
Sicherung:

**Exportieren** (altes Gerät): unten **Sichern** →
- **„Code kopieren“** → den Code (beginnt mit `EL1.`) in eine Nachricht, Mail oder Notiz einfügen, **oder**
- **„Als Datei“** → auf dem iPhone „In Dateien sichern“, AirDrop oder Mail.

**Importieren** (neues Gerät): unten **Sichern** →
- Code ins Feld **„Code einfügen“** → **„Code prüfen“**, **oder**
- **„Datei wählen“** → die Exportdatei auswählen.

Es erscheint eine **Vorschau** (sicher / wackelig / offen, Simulationen, Datum).
Erst mit **„Übernehmen“** wird der Lernstand auf dem neuen Gerät **ersetzt**.

**Wichtig:**
- Wer die App vom Home-Bildschirm löscht oder in den iPhone-Einstellungen die Safari-Daten
  löscht, löscht auch den Lernstand. Vorher exportieren!
- Wird die Seite nur in Safari genutzt (nicht installiert), kann iOS gespeicherte Daten nach
  einigen Tagen ohne Besuch entfernen. Deshalb: **als App installieren** und ab und zu exportieren.
- Unter **Sichern → Zurücksetzen** lässt sich der Lernstand löschen (z. B. wenn ein Gerät
  weitergegeben wird).

---

## 6. Kurzanleitung für Seminarteilnehmende

> 1. Link in **Safari** öffnen: `https://…netlify.app`
> 2. **Teilen → „Zum Home-Bildschirm“ → „Hinzufügen“**
> 3. App einmal mit Internet öffnen – danach läuft sie offline.
> 4. Lernen: **Karteikarten**, **Quiz**, **Prüfungssimulation** (30 Fragen, 60 Minuten,
>    bestanden ab 50 %), **Fehler-Training** (falsche Fragen kommen nach 1, 3, 7 und 14 Tagen wieder).
> 5. Fortschritt unter **Statistik**, Sicherung unter **Sichern**.
> Kein Konto, keine Daten an Dritte – alles bleibt auf dem eigenen Handy.

**Tastatur am Computer:** Leertaste = Antwort zeigen · 1 = Konnte ich / Gewusst ·
2 = Nochmal / Nicht gewusst · 1–5 bzw. A–E = Antwort wählen · Enter = Prüfen / Weiter ·
← → = blättern in der Simulation.

---

## 7. Häufige Fragen

**Die App zeigt nach dem Update noch die alte Version.**
App vollständig schließen und neu öffnen (mit Internet). Notfalls Safari-Link einmal im
Browser öffnen und neu laden.

**„Der Code ist beschädigt“ beim Import.**
Der Code wurde beim Kopieren abgeschnitten. Er muss vollständig sein (mehrere tausend Zeichen).
Alternativ die **Datei** verwenden.

**Funktioniert es auch ohne Netlify?**
Ja – der Ordner `dist/` läuft auf jedem Webserver mit HTTPS (Offline-Betrieb und Installation
setzen HTTPS voraus). Einfach per Doppelklick als Datei öffnen funktioniert dagegen nicht.

---

## 8. Für später: Fragen ändern und neu bauen (technisch)

Voraussetzung: [Node.js](https://nodejs.org) (Version 20 oder neuer).

```bash
npm install            # einmalig
# Fragen bearbeiten: data/questions.json
npm run validate       # prüft alle Fragen (Pflichtfelder, MC-Indizes, erlaubte HTML-Tags)
npm test               # Unit-Tests
npm run build          # erzeugt den Ordner dist/ → zu Netlify hochladen
npm run e2e            # Browser-Tests (alle Fragen, MC-Auswertung, Export/Import, offline)
```

Erlaubte Formatierung in den Texten: `<b>`, `<i>`, `<br/>`, `<font>` – alles andere wird
beim Anzeigen entfernt. Themen werden direkt im Feld `topic` vergeben; neue Themen erscheinen
automatisch im Filter. Für Mehrfachantworten bei Multiple Choice in `correct` mehrere Indizes
eintragen (z. B. `[0, 2]`, gezählt ab 0).

Jede neue Version bekommt beim Bauen automatisch eine neue Versionskennung, damit installierte
Apps das Update erkennen.
