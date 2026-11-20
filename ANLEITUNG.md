# Elearning – Anleitung

Elearning ist eine Web-App zum Lernen für die IHK-Fachkundeprüfung Güterkraftverkehr.
Sie läuft im Browser, lässt sich auf dem iPhone wie eine App installieren und funktioniert
danach **ohne Internet, ohne Konto und ohne Server**. Der Lernstand bleibt auf dem jeweiligen Gerät.

Die fertige App ist der Ordner **`dist/`**. Mehr braucht es für die Veröffentlichung nicht.

---

## 1. App online stellen

**Aktuelle Adresse:** https://pruefungstrainer-3xii.netlify.app

### Weg A (empfohlen): Netlify mit GitHub verbinden – geht auch komplett am iPad

Netlify holt sich den Ordner `dist/` selbst aus dem GitHub-Repository. Jede neue Version,
die im Repository landet, geht **automatisch** online.

1. **https://app.netlify.com** öffnen, kostenlos registrieren („Sign up with GitHub“).
2. Auf der Startseite die Kachel **„Import from Git“** antippen
   (nicht das große Eingabefeld „Describe your idea…“ – das ist Netlifys KI-Assistent).
3. **GitHub** wählen, Netlify den Zugriff erlauben und das Repository **Pruefungstrainer** freigeben.
4. Einstellungen:
   - **Branch to deploy:** der Branch mit der fertigen App (aktuell
     `claude/app-planning-development-si3ys3`, nach dem Zusammenführen `main`)
   - **Build command:** leer lassen (oder `npm run build` – beides funktioniert)
   - **Publish directory:** `dist`
5. **Deploy** antippen. Nach etwa einer Minute steht oben ein Link wie `https://….netlify.app`.
6. **Öffentlich schalten** (siehe unten) und **„Powered by Netlify“ abschalten** (siehe unten).

### Weg B: Netlify Drop (am Computer)

1. Am Computer **https://app.netlify.com/drop** öffnen und anmelden
   (ohne Anmeldung ist die Seite nur vorübergehend online).
2. Den Ordner **`dist`** (den ganzen Ordner) in das Feld „Drop files to deploy“ ziehen.
   Alternativ nimmt Netlify auch eine **.zip** des Ordners an.
3. Danach öffentlich schalten und das Netlify-Feld abschalten (siehe unten).

### Wichtig nach dem ersten Deploy

**Öffentlich schalten:** Neue Netlify-Projekte sind zunächst **privat** – Besucher sehen
„This site is private“. Freischalten über **Share** bzw.
**Manage → Project configuration → General → Visitor access → Project visibility → Public**.
Prüfen: Link in einem **privaten Safari-Tab** öffnen – es muss die Elearning-Startseite erscheinen.

**„Powered by Netlify“ abschalten:** Netlify blendet bei neuen kostenlosen Projekten unten rechts
ein Feld „Powered by Netlify“ ein. Es liegt über der Leiste *Statistik / Sichern*. Abschalten über
**Manage → Project configuration → General → Powered by Netlify badge → aus**.

**Sprechender Name (optional):** **Manage → Project configuration → General → Change project name**,
z. B. `elearning-gkv` → `https://elearning-gkv.netlify.app`. Achtung: Danach ändert sich der Link –
bereits installierte Apps müssen mit dem neuen Link neu installiert werden (Lernstand vorher exportieren).

> Die Menünamen bei Netlify ändern sich gelegentlich. Wenn ein Punkt nicht genau so heißt,
> nach „Visitor access“, „Badge“ bzw. „Project configuration“ suchen (Suchfeld oben in Netlify).

---

## 2. Link aufs iPhone bringen

Den Link (aktuell **https://pruefungstrainer-3xii.netlify.app**) per Nachricht, Mail oder AirDrop aufs iPhone schicken – oder im Seminar als QR-Code
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

**Bei Weg A (GitHub):** nichts zu tun. Sobald eine neue Version im Repository auf dem eingestellten
Branch landet, baut Netlify sie automatisch und stellt sie unter demselben Link online
(Netlify → Projekt → *Versions*/*Deploys* zeigt den Stand).

**Bei Weg B (Drop):** Bei Netlify das Projekt öffnen → **Deploys** → den neuen Ordner **`dist`**
in das Upload-Feld ziehen. Der Link bleibt gleich.

**Auf iPhone/iPad:** die App öffnen (mit Internet). Oben erscheint
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

> 1. Link in **Safari** öffnen: `https://pruefungstrainer-3xii.netlify.app`
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
