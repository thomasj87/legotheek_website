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
- Pagina's in de root: index.html, sets.html, set.html (detail, ?id= of ?nummer=),
  reserveren.html, over-ons.html, huisregels.html, blog.html, post.html
- sw.js — service worker: cache voor foto's, pagina's en data
  (js/register-sw.js registreert op alle pagina's)
- smoke_test.py — smoke-test (python3 smoke_test.py)
- css/style.css — enige stylesheet (Lego-kleurenpalet, Fredoka-font)
- js/config.js — instellingen (e-mail-endpoint, FB-pagina); moet vóór de andere js laden
- js/sets.js, js/set.js (incl. lightbox), js/form.js, js/over-ons.js, js/huisregels.js,
  js/blog.js, js/facebook.js, js/register-sw.js — plain JS, geen framework
- data/sets.json, data/posts.json, data/over-ons.json, data/huisregels.json — content;
  hier sets/posts/over-ons/huisregels toevoegen
- img/ — foto's; sets: img/sets/SetNN_FotoNN.jpg
- add_in/ — inkomende foto's (niet committen; zie .gitignore)

## Conventies
- Site blijft statisch: geen servercode, geen build-stap, geen dependencies.
- Sets hebben een uniek `nummer`; nieuwe sets krijgen het volgende nummer
  (hoogste bestaande nummer + 1). Foto's: img/sets/SetNN_FotoNN.jpg, elk met een
  `onderschrift` in data/sets.json (veld `fotos`, eerste foto = hoofdfoto).
- Set-detailpagina: op foto's klikken opent de lightbox (in het groot,
  erdoorheen klikken, pijltjes/Esc).
- Caching: service worker (sw.js) houdt foto's en pagina's in de browser-cache.
- Content staat in data/*.json, niet in de HTML; pagina's renderen het met plain JS.
- E-mail via EmailJS (CONFIG.emailJs in js/config.js; public key in de
  frontend is by design, gratis 200 mails/mnd) of mailto:-fallback
  (CONFIG.reserverenEmail) bij fout/leeg; nooit server-side.
- Honeypot: het reserveringsformulier heeft een onzichtbaar veld `website`;
  gevuld = spam, niet versturen.
- Facebook auto-posten is een bewuste placeholder (js/facebook.js) — niet implementeren
  zonder Facebook-app/token.
- Kaart: OpenStreetMap-embed, benaderde locatie (zoom 13–14); nooit het exacte
  huisnummer publiceren.
- Alle UI-tekst en content in het Nederlands.
