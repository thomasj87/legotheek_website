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

## Openstaande punten (niet blokkerend)
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
