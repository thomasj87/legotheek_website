# Legotheek

Een simpele, kleurrijke website waar onze kinderen hun Lego sets aanbieden:
met foto en prijs. Bezoekers kunnen een set reserveren via een formulier,
lezen wat er nieuw is op de blog, en bekijken wie wij zijn en wat de huisregels zijn.

De site is volledig **statisch**: geen servercode, geen build-stap, geen dependencies.

## Lokaal draaien

```bash
python3 -m http.server 8000
# of: npx serve .
```

Open daarna http://localhost:8000

> De site laadt zijn data via `fetch()`, dus hij moet via een webserver gedraaid
> worden. Een bestand rechtstreeks openen (dubbelklikken) werkt niet.

## Smoke-test

Een script dat de site zonder browser valideert (pagina's, JSON, links, assets,
JS). Draai het met:

```bash
python3 smoke_test.py
```

Exit code 0 = alles ok; 1 = er staan fouten. Handig na het toevoegen van
sets/posts of het wijzigen van bestanden.

## Pagina's

| Pagina | Inhoud |
|---|---|
| `index.html` | Home: intro, "Zo werkt het", laatste blogpost |
| `sets.html` | Catalogus van alle sets (foto, prijs, "Reserveren"-knop) |
| `set.html?id=...` | Set-detail: foto's, aantal steentjes, gedetailleerde omschrijving, video |
| `reserveren.html` | Reserveringsformulier |
| `over-ons.html` | Over ons: adres, verhaal, ophaaltijden, kaart |
| `huisregels.html` | Huisregels |
| `blog.html` | Blog-lijst |
| `post.html?id=...` | Blogpost met "Deel op Facebook"-knop |

## Een set toevoegen

1. Zet de foto's in `img/sets/` en noem ze `SetNN_FotoNN.jpg`
   (bijv. `img/sets/Set02_Foto01.jpg`). Verklein grote foto's eerst
   (max. ±1920px breed is genoeg voor de website).
2. Voeg een entry toe aan `data/sets.json`:

```json
{
  "id": "mijn-set",
  "nummer": 2,
  "naam": "Lego Mijn Set",
  "prijs": 10,
  "delen": 300,
  "beschrijving": "Korte omschrijving voor de catalogus-kaart.",
  "omschrijving": "Langere omschrijving voor de detailpagina.",
  "fotos": [
    { "pad": "img/sets/Set02_Foto01.jpg", "onderschrift": "Onderschrift bij de eerste foto." },
    { "pad": "img/sets/Set02_Foto02.jpg", "onderschrift": "Onderschrift bij de tweede foto." }
  ],
  "video": "https://www.youtube.com/watch?v=..."
}
```

- `id`: uniek, zonder spaties (wordt gebruikt in de links)
- `nummer`: het setnummer. Nieuwe sets krijgen automatisch het volgende nummer
  (het hoogste bestaande nummer + 1). Het nummer staat op de catalogus-kaart en
  de detailpagina; ook `set.html?nummer=2` werkt.
- `fotos`: lijst met foto's, elk met een `pad` en een `onderschrift`.
  De eerste foto is de hoofdfoto. Op de detailpagina kun je op elke foto klikken
  om die in het groot te bekijken en erdoorheen te bladeren (lightbox).
- `video` is optioneel — laat het weg als het niet van toepassing is
- `video`: een YouTube-link (watch of embed) of een pad naar een `.mp4`
  (bijv. `img/sets/Set02_video.mp4`). Houd mp4's klein (H.264, max. ±720p);
  portrait-video's (mobiel) worden netjes getoond.

## Een blogpost toevoegen

Voeg een entry toe aan `data/posts.json` (nieuwste bovenaan):

```json
{
  "id": "mijn-post",
  "titel": "Titel van de post",
  "datum": "2026-08-30",
  "afbeelding": "img/blog/mijn-post.jpg",
  "inhoud": ["Eerste alinea.", "Tweede alinea."]
}
```

Zet de afbeelding in `img/blog/`.

## Huisregels

Bewerk `data/huisregels.json`: een lijst met regels, elk met een `titel` en `tekst`.

## Over ons

Vul `data/over-ons.json` in: adres, verhaal (lijst van alinea's), foto,
ophaalTijden en de kaart-coördinaten. De kaart toont bewust een **benaderde
locatie** (straat/wijk-niveau, zoom 13–14), geen exact huisnummer.

> Tip: de kaart-coördinaten kom je het makkelijkst via
> [nominatim.openstreetmap.org](https://nominatim.openstreetmap.org) (zoek op
> plaatsnaam). Een wijknaam staat soms niet in OpenStreetMap; gebruik dan de
> coördinaten van de plaats en pas de zoom aan.

## Reserveringen (e-mail)

Het formulier op `reserveren.html` leest zijn instellingen uit `js/config.js`:

- `reserverenEndpoint`: URL van jullie eigen e-mailoplossing (POST, JSON).
  Het formulier stuurt: `{ "naam", "email", "set", "datum", "bericht" }`
- `reserverenEmail`: e-mailadres voor de mailto:-fallback

Is `reserverenEndpoint` leeg, dan opent het formulier het e-mailprogramma van de
bezoeker met een vooraf ingevulde e-mail (mailto:).

## Facebook

- Elke blogpost heeft een "Deel op Facebook"-knop (werkt direct, geen account nodig).
- Automatisch posten naar een Facebook-pagina is een placeholder: `js/facebook.js`
  + `facebookPagina` in `js/config.js`. Later activeren vereist een Facebook-app
  met paginatokken (FB_PAGE_ID, FB_ACCESS_TOKEN).

## Structuur

```
├── index.html, sets.html, set.html, reserveren.html,
│   over-ons.html, huisregels.html, blog.html, post.html   # pagina's
├── sw.js                # service worker: cache voor foto's, pagina's en data
├── smoke_test.py          # smoke-test (python3 smoke_test.py)
├── css/style.css        # enige stylesheet (Lego-palet, Fredoka-font)
├── js/
│   ├── config.js        # instellingen (e-mail-endpoint, FB-pagina) — vóór andere js laden
│   ├── sets.js          # catalogus
│   ├── set.js           # set-detailpagina (incl. lightbox)
│   ├── form.js          # reserveringsformulier
│   ├── over-ons.js      # over ons (incl. kaart)
│   ├── huisregels.js    # huisregels
│   ├── blog.js          # blog-lijst + blogpost
│   ├── facebook.js      # placeholder voor auto-posten
│   └── register-sw.js   # registreert de service worker
├── data/
│   ├── sets.json        # sets
│   ├── posts.json       # blogposts
│   ├── over-ons.json    # over ons
│   └── huisregels.json  # huisregels
└── img/                 # foto's (sets: img/sets/SetNN_FotoNN.jpg)
```

## Caching

De site registreert een service worker (`sw.js`, via `js/register-sw.js` op alle
pagina's). Die houdt foto's, pagina's en data in de browser-cache: foto's worden
na het eerste bezoek niet opnieuw gedownload, en de site werkt ook (deels)
offline. Nieuwe sets en blogposts verschijnen wel direct, want pagina's en data
worden eerst via het netwerk opgehaald.

## Conventies

- Alle UI-tekst en content in het Nederlands.
- De site blijft statisch: geen servercode, geen build-stap, geen dependencies.
- Content staat in `data/*.json`, niet in de HTML; de pagina's renderen het met plain JS.
- Sets hebben een uniek `nummer`; nieuwe sets krijgen het volgende nummer
  (hoogste bestaande nummer + 1).
- Design: kinderlijk en kleurrijk — Lego-palet, ronde kaarten, Fredoka-font
  (zie de CSS-variabelen bovenin `css/style.css`).
