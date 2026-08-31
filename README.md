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

1. Zet de foto's in `img/sets/` (bijv. `img/sets/mijn-set.jpg`)
2. Voeg een entry toe aan `data/sets.json`:

```json
{
  "id": "mijn-set",
  "naam": "Lego Mijn Set",
  "prijs": 10,
  "foto": "img/sets/mijn-set.jpg",
  "beschrijving": "Korte omschrijving voor de catalogus-kaart.",
  "delen": 300,
  "omschrijving": "Langere omschrijving voor de detailpagina.",
  "extraFotos": ["img/sets/mijn-set-2.jpg"],
  "video": "https://www.youtube.com/watch?v=..."
}
```

- `id`: uniek, zonder spaties (wordt gebruikt in de links)
- `extraFotos` en `video` zijn optioneel — laat ze weg als ze niet van toepassing zijn
- `video`: een YouTube-link (watch of embed) of een pad naar een `.mp4`

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
├── smoke_test.py          # smoke-test (python3 smoke_test.py)
├── css/style.css        # enige stylesheet (Lego-palet, Fredoka-font)
├── js/
│   ├── config.js        # instellingen (e-mail-endpoint, FB-pagina) — vóór andere js laden
│   ├── sets.js          # catalogus
│   ├── set.js           # set-detailpagina
│   ├── form.js          # reserveringsformulier
│   ├── over-ons.js      # over ons (incl. kaart)
│   ├── huisregels.js    # huisregels
│   ├── blog.js          # blog-lijst + blogpost
│   └── facebook.js      # placeholder voor auto-posten
├── data/
│   ├── sets.json        # sets
│   ├── posts.json       # blogposts
│   ├── over-ons.json    # over ons
│   └── huisregels.json  # huisregels
└── img/                 # foto's (nu SVG-placeholders)
```

## Conventies

- Alle UI-tekst en content in het Nederlands.
- De site blijft statisch: geen servercode, geen build-stap, geen dependencies.
- Content staat in `data/*.json`, niet in de HTML; de pagina's renderen het met plain JS.
- Design: kinderlijk en kleurrijk — Lego-palet, ronde kaarten, Fredoka-font
  (zie de CSS-variabelen bovenin `css/style.css`).
