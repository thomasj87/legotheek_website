# AGENTS.md

Statische, Nederlandstalige website voor een kinderlijke "legotheek": Lego-sets
aanbieden met foto + prijs, reserveringsformulier (e-mail), blog met Facebook-deelknop,
over-ons-pagina met kaart, en huisregels.

## Eerst lezen
- **TODO.md** — bouwstatus. De bouw staat af; de "openstaande punten" zijn content
  die nog ingevuld moet worden (e-mail-endpoint, echte foto's, FB-auto-posten).
- **README.md** — gebruikersdocumentatie (hoe je sets/posts/regels/over-ons toevoegt).

## Commando's
- Geen build-stap, geen lint, geen dependencies.
- Lokaal draaien: `python3 -m http.server 8000` (of `npx serve .`) → http://localhost:8000
- De site moet via een webserver draaien (fetch() van data-bestanden); file:// werkt niet.
- Smoke-test: `python3 smoke_test.py` (valideert pagina's, JSON, links, assets; exit 0 = ok)

## Structuur
- Pagina's in de root: index.html, sets.html, set.html (detail, ?id=), reserveren.html,
  over-ons.html, huisregels.html, blog.html, post.html
- smoke_test.py — smoke-test (python3 smoke_test.py)
- css/style.css — enige stylesheet (Lego-kleurenpalet, Fredoka-font)
- js/config.js — instellingen (e-mail-endpoint, FB-pagina); moet vóór de andere js laden
- js/sets.js, js/set.js, js/form.js, js/over-ons.js, js/huisregels.js,
  js/blog.js, js/facebook.js — plain JS, geen framework
- data/sets.json, data/posts.json, data/over-ons.json, data/huisregels.json — content;
  hier sets/posts/over-ons/huisregels toevoegen
- img/ — foto's (nu SVG-placeholders)

## Conventies
- Site blijft statisch: geen servercode, geen build-stap, geen dependencies.
- Content staat in data/*.json, niet in de HTML; pagina's renderen het met plain JS.
- E-mail via CONFIG.reserverenEndpoint (extern) of mailto:-fallback; nooit server-side.
- Facebook auto-posten is een bewuste placeholder (js/facebook.js) — niet implementeren
  zonder Facebook-app/token.
- Kaart: OpenStreetMap-embed, benaderde locatie (zoom 13–14); nooit het exacte
  huisnummer publiceren.
- Alle UI-tekst en content in het Nederlands.
