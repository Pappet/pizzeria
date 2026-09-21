# Pizzeria

Pizza-Spiel als Progressive Web App für Kinder ab ca. 4 Jahren. Läuft nach der
Installation offline, Spielstand liegt lokal im Browser (localStorage). Nichts
zum Lesen, alles wird angesagt; es gibt kein Verlieren.

## Ablauf einer Pizza
1. **Teig** mit dem Finger ausrollen (Nudelholz folgt dem Finger)
2. **Soße** mit dem Finger aufmalen
3. **Käse** durch Reiben aufstreuen
4. **Belegen** nach der Bestellung in der Sprechblase (der nächste fehlende Belag leuchtet)
5. **Backen**: Zeiger läuft über die Backleiste, im grünen Bereich tippen → Bonus-Münze
6. **Servieren**: richtig = 3 Münzen + 1 Stern, sonst 1 Münze und die Sprechblase
   zeigt, was gefehlt hat (blass) oder zu viel war (durchgestrichen)

## Stufen
Alle 3 richtigen Pizzen (Sterne) eine Stufe höher.

| Stufe | Sterne | Beläge | Sorten pro Bestellung | max. Stück |
|---|---|---|---|---|
| 0 | 0–2 | Salami, Pilze, Oliven | 1 | 3 |
| 1 | 3–5 | + Paprika | 1–2 | 3 |
| 2 | 6–8 | + Ananas | 2 | 4 |
| 3 | 9–11 | + Mais | 2–3 | 5 |
| 4 | 12–14 | alle | 3 | 5 |
| 5 | ab 15 | alle | 3–4 | 4 |

## Besonderheiten
- Sprachausgabe als Warteschlange (nichts wird abgebrochen), Watchdog gegen hängende Android-TTS
- Nach 12 s ohne Aktion wiederholt sich der Hinweis (Ansage, Toast, Knopf wackelt)
- Kunde oder 🔊 antippen: Bestellung nochmal anhören
- 🔊/🔇 oben rechts: Ton und Sprache aus (wird gespeichert)
- Schrift Fredoka liegt lokal (`fonts/`, SIL OFL), keine Anfragen an Google

## Lokal testen
    python3 -m http.server 8000
Dann http://localhost:8000 öffnen.

## Veröffentlichen (GitHub Pages)
Repo anlegen (public), pushen, Settings → Pages → Branch `main`, Ordner `/`.
URL: https://BENUTZERNAME.github.io/REPONAME/

## Auf dem Tablet installieren
URL in Chrome öffnen → Menü ⋮ → „App installieren“ / „Zum Startbildschirm hinzufügen“.

## Änderungen
Nach jeder Änderung `VERSION` in `sw.js` hochzählen. Liegt das Spiel beim
Update noch auf dem Startbildschirm, lädt es sich selbst neu.

## Für Eltern
Das Spiel schweigt komplett, solange es nicht sichtbar ist (Sichtbarkeits-Wechsel):
keine Ansagen, keine Töne, keine Tipp-Timer und kein Vibrieren — so können auf dem
Tablet mehrere Spiel-Apps nebeneinander laufen, ohne dass ein Spiel in das andere
hineinquatscht.

## Spielstand zurücksetzen
Stern-Anzeige oben rechts 3 Sekunden gedrückt halten.
