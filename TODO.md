# TODO — Legotheek-website

Bouwstatus: in uitvoering. **Begin hier bij een nieuwe sessie:**
werk de eerste onafgemaakte stap af en vink af wat klaar is.

## Vaste beslissingen
- Statische website: geen server, geen build-stap, geen dependencies.
- E-mail: het formulier post naar `CONFIG.reserverenEndpoint` (eigen e-mailoplossing);
  leeg = mailto:-fallback naar `CONFIG.reserverenEmail` (js/config.js).
- Facebook: "Deel op Facebook"-knop per post (direct); auto-posten = placeholder
  (js/facebook.js), pas later.
- Over ons: OpenStreetMap-iframe (geen API-key), benaderde locatie (straat/wijk-niveau,
  zoom 13–14) — geen exact huisnummer.
- Huisregels: aparte pagina (huisregels.html) met eigen nav-link.
- Hosting: lokaal voor nu.
- Alle tekst in het Nederlands; design: kinderlijk en kleurrijk (Lego-palet, Fredoka-font).

## Stappen
- [x] Stap 1: data + placeholder-afbeeldingen
  - data/sets.json (4 sets), data/posts.json (2 posts)
  - img/sets/*.svg (4), img/blog/*.svg (2)
- [x] Stap 2: design — css/style.css
- [x] Stap 3: homepagina — index.html
- [x] Stap 4: set-catalogus — sets.html + js/sets.js
- [x] Stap 4a: set-detailpagina — set.html + js/set.js
  - Extra velden in data/sets.json: omschrijving (gedetailleerd), extraFotos, video
  - Video: YouTube-embed-URL (https://www.youtube.com/embed/...) of pad naar .mp4;
    veld weglaten = geen video-sectie
- [x] Stap 5: reserveringsformulier — reserveren.html + js/config.js + js/form.js
  - Set-keuze wordt gevuld uit data/sets.json; ?set=<id> preselecteert
  - Versturen: POST naar CONFIG.reserverenEndpoint, anders mailto:-fallback
- [x] Stap 6: over ons — over-ons.html + js/over-ons.js + data/over-ons.json
  - Adres, verhaal + foto, ophaaltijden, OpenStreetMap-embed (benaderde locatie, zoom 13–14)
  - Inhoud nu placeholders; later invullen in data/over-ons.json
  - Navigatie op alle pagina's uitgebreid met "Over ons" en "Huisregels"
- [x] Stap 7: huisregels — huisregels.html + js/huisregels.js + data/huisregels.json
  - Regels als kleurrijke kaarten (genummerd, Lego-palet); inhoud nu placeholders
- [x] Stap 8: blog — blog.html, post.html, js/blog.js, js/facebook.js
  - js/blog.js rendert: blog-lijst (#blog-lijst), laatste post op home (#laatste-post),
    en de volledige post op post.html (?id=)
  - "Deel op Facebook" = Facebook-sharer-link; auto-posten = placeholder (js/facebook.js)
- [x] Stap 9: documentatie — README.md + AGENTS.md bijwerken
- [x] Stap 10: smoke-test — `python3 -m http.server 8000`, alle pagina's controleren
  - Alle 8 pagina's + 4 JSON + 8 JS + 12 afbeeldingen gecontroleerd (200's, geldige JSON,
    links/assets bestaan, JS-syntaxis, OSM-kaart-URL)
- [x] Stap 11: set 1 (De Donuttram) + setnummers + lightbox + caching
  - Foto's uit add_in/ verkleind (max 1920px) naar img/sets/Set01_Foto01..19.jpg;
    placeholder-sets (kasteel, ruimtevaartbasis, dierentuin, piratenschip) verwijderd
  - data/sets.json: nieuw schema `fotos` (pad + onderschrift) + veld `nummer`;
    set 1 = "De Donuttram" (Lego City donutshop + trambaan, €15, 1500 steentjes)
  - Setnummers: uniek veld `nummer`; nieuwe sets krijgen max+1;
    set.html ondersteunt ?id= én ?nummer=; nummer op catalogus-kaart, detailpagina
    en in het reserveringsformulier
  - Lightbox op set.html: foto klikken → in het groot, erdoorheen klikken,
    vorige/volgende, teller, pijltjes/Esc (js/set.js + css/style.css)
  - Caching: sw.js (service worker) + js/register-sw.js op alle 8 pagina's;
    foto's cache-first, pagina's/data network-first
- [x] Stap 13: set 2 (De PiratenAchtbaan) + video
  - 16 foto's uit add_in/ verkleind (max 1920px) naar img/sets/Set02_Foto01..16.jpg
  - Video: 20260830_184450.mp4 (48 MB, HEVC) getranscodeerd naar H.264/AAC 720p
    (img/sets/Set02_video.mp4, ~7 MB); video-veld wordt ingebed door js/set.js
  - data/sets.json: set 2 = "De PiratenAchtbaan" (piratenpretpark met achtbaan,
    schip en kanonnen; €10, 800 steentjes); nummer 2 (max+1-conventie)
  - css/style.css: .set-video video zonder vaste 16:9 (video is portrait 720x1280)
  - smoke_test.py: pad van optioneel video-veld gevalideerd
- Branch set-2 (vanaf main); cache-ttl-branch (TTL + data/cache.json) loopt
  apart en is nog niet gemerged
- [x] Stap 14: setoverzicht uit DB_csv.csv + release-datum + originele Lego-set(s)
  - Nieuw schema in data/sets.json: `thema`, `origineleSets` (lijst met Lego-nummer,
    naam, stukken) en `publicatieDatum` (YYYY-MM-DD); `delen` = som van stukken
  - Alle 13 sets uit DB_csv.csv (lokaal, buiten git) overgenomen; nummers 1–13;
    `publicatieDatum` = 2026-09-18 (vrijdag; door gebruiker bij te stellen)
  - Oude foto's Set01/Set02 (Donuttram, PiratenAchtbaan) verwijderd — in de CSV
    horen ze er niet bij; nummers 1–13 volgen de CSV
  - Release-filter: js/datum.js (LEGOOTHEEK.gereleased, op basis van de
    browser-datum) — catalogus, set-detail en reserveringsformulier tonen alleen
    sets met publicatieDatum <= vandaag
  - Sets zonder foto's tonen img/sets/placeholder.svg ("Foto's volgen")
  - js/sets.js: thema-badge op de catalogus-kaart; js/set.js: thema-badge + tabel
    "Bestaat uit N originele Lego-set(s)" (naam, setnummer, stenen + totaal);
    css/style.css: badges per thema + setjes-tabel
  - smoke_test.py: valideert thema/publicatieDatum/origineleSets, dat `delen`
    = som van stukken, en geeft een waarschuwing voor onbruikte bestanden in img/sets/
  - Skill set-fotos: subcommando `csv` (leest DB_csv.csv, print per set thema/prijs/
    originele sets, ook --json) + schema en workflow in SKILL.md bijgewerkt
  - sw.js: cache-nommer v2 → v3 (nieuw js/datum.js in core-cache)

## Openstaande punten (niet blokkerend)
- Foto's: sets 1–13 hebben (nog) geen foto's in data/sets.json; tot de foto's er
  zijn toont de site `img/sets/placeholder.svg`. Foto's toevoegen via de
  set-fotos-skill (add_in/ → verklein → beschrijf → entry in data/sets.json).
- Set 1: de CSV-rij (Pirate Roller Coaster, 31084) is overgenomen; de oude
  "Donuttram"-foto's (19 stuks) zijn verwijderd omdat ze niet bij de CSV horen.
- E-mail: `reserverenEndpoint` en `reserverenEmail` invullen in js/config.js
  (nu placeholder `legotheek@example.com`).
- Facebook auto-posten: vereist Facebook-app + paginatokken (FB_PAGE_ID, FB_ACCESS_TOKEN).
- Over ons: kaart-coördinaten (lat/lon in data/over-ons.json) bijsturen naar de
  benaderde locatie bij het Veneslagen in Rijssen. Verhaal, foto, adres en
  ophaaltijden staan er al.
- Huisregels: de echte regels invullen in data/huisregels.json.

## Lokaal draaien
```bash
python3 -m http.server 8000   # of: npx serve .
# Open http://localhost:8000
```
