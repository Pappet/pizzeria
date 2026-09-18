# Pizzeria

Pizza-Spiel als Progressive Web App. Läuft nach der Installation offline,
Spielstand liegt lokal im Browser (localStorage).

## Lokal testen
    python3 -m http.server 8000
Dann http://localhost:8000 öffnen.

## Veröffentlichen (GitHub Pages)
Repo anlegen (public), pushen, Settings → Pages → Branch `main`, Ordner `/`.
URL: https://BENUTZERNAME.github.io/REPONAME/

## Auf dem Tablet installieren
URL in Chrome öffnen → Menü ⋮ → „App installieren“ / „Zum Startbildschirm hinzufügen“.

## Änderungen
Nach jeder Änderung `VERSION` in `sw.js` hochzählen.

## Spielstand zurücksetzen
Stern-Anzeige oben rechts 3 Sekunden gedrückt halten.
