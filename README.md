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
| `set.html?id=...` | Set-detail: foto's, thema, aantal steentjes, tabel met de originele Lego-set(s), omschrijving, video |
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
  "thema": "City",
  "prijs": 10,
  "delen": 300,
  "publicatieDatum": "2026-09-18",
  "beschrijving": "Korte omschrijving voor de catalogus-kaart.",
  "omschrijving": "Langere omschrijving voor de detailpagina.",
  "origineleSets": [
    { "nummer": "60215", "naam": "Brandweerkazerne", "stukken": 300 }
  ],
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
- `thema`: het Lego-thema (City, Creator, Friends, Technic, Architecture);
  wordt als badge getoond op de catalogus-kaart en de detailpagina.
- `prijs`: één prijs voor de hele kist (ook als uit meerdere Lego-setjes samengesteld).
- `delen`: het **totaal** aantal steentjes = som van `stukken` in `origineleSets`
  (de smoke-test checkt dit).
- `publicatieDatum`: datum (YYYY-MM-DD) waarop de set online komt.
  De site (catalogus, detail en reserveringsformulier) toont alleen sets waarvan
  deze datum voor of op de datum van vandaag (in de browser) is.
- `origineleSets`: de originele Lego-set(s) waaruit de kist bestaat, elk met
  officieel Lego-setnummer (`nummer` als string), naam en aantal `stukken`.
  Op de detailpagina als tabel getoond.
- `fotos`: lijst met foto's, elk met een `pad` en een `onderschrift`.
  Mag leeg zijn totdat foto's erbij komen: de site toont dan
  `img/sets/placeholder.svg` ("Foto's volgen"). De eerste foto is de hoofdfoto;
  op de detailpagina kun je op elke foto klikken om die in het groot te bekijken
  en erdoorheen te bladeren (lightbox).
- `video` is optioneel — laat het weg als het niet van toepassing is
- `video`: een YouTube-link (watch of embed) of een pad naar een `.mp4`
  (bijv. `img/sets/Set02_video.mp4`). Houd mp4's klein (H.264, max. ±720p);
  portrait-video's (mobiel) worden netjes getoond.

Foto's kunnen worden geëvalueerd (scherpte, inhoud, orientatie) via de
set-fotos-workflow: foto's die niet geschikt zijn (vage foto's, duplicaten,
te klein) worden afgekeurd en verplaatst naar `img/sets/afgekeurd/`, met een
log in `img/sets/afgekeurd/afgekeurd.json` (foto, datum, reden). Foute
orientatie wordt direct rechtgedraaid. Afgekeurde foto's niet opnemen in
`data/sets.json`; de smoke-test checkt dat.

> Bron voor de set-overzicht (nummers, thema's, originele Lego-setjes,
> aantal stukjes, prijzen) is `DB_csv.csv` in de repo-root. Dat bestand is
> lokaal (niet in git): pas het bij als je sets toevoegt of verandert, en
> draai `python3 .opencode/skills/set-fotos/scripts/set_fotos.py csv --set N`
> om de info eruit te halen.

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

Zet de afbeelding in `img/blog/`. In `inhoud` kun je tussen de alinea's
ook afbeeldingen inbedden: een object met `pad` (en optioneel `alt` en
`onderschrift`) wordt als afbeelding met ondertekst getoond:

```json
"inhoud": [
  "Eerste alinea.",
  { "pad": "img/campagne/qr-facebook.png", "alt": "QR-code", "onderschrift": "Scan ons!" },
  "Tweede alinea."
]
```

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

Het formulier op `reserveren.html` stuurt de reservering rechtstreeks door via
[EmailJS](https://www.emailjs.com) — zonder eigen server, dus de site blijft
volledig statisch. De e-mail belandt in jullie eigen inbox. De instellingen
staan in `js/config.js`:

- `emailJs.serviceId`, `emailJs.templateId`, `emailJs.publicKey`: de
  EmailJS-credentials (zie hieronder)
- `reserverenEmail`: e-mailadres voor de mailto:-fallback

Is `emailJs.publicKey` leeg, of slaagt de verzending niet, dan toont het
formulier een melding met een mailto:-link naar `reserverenEmail`.

### Eénmalige opbouw van EmailJS

1. Maak een gratis account aan op [emailjs.com](https://www.emailjs.com).
2. **E-mailadres verbinden:** *Emails* → *Connect an Email Service* → kies
   bijv. Gmail/Outlook en volg de aanmeldstappen. Je krijgt een
   **service id** (ook "email service").
3. **Template maken:** *Email Templates* → *Create New Template* → "EmailJS"
   (of een eigen template). Vul in:
   - To: het eigen e-mailadres (bijv. `jullie@voorbeeld.nl`)
   - From Name: `Legotheek`
   - Subject: `Reservering: {{set}}`
   - Body (plain text):
     ```
     Naam: {{naam}}
     E-mail: {{email}}
     Set: {{set}}
     Gewenste datum: {{datum}}
     Bericht: {{bericht}}
     ```
   De velden moeten exact de namen `naam`, `email`, `set`, `datum`, `bericht`
   hebben (dat stuurt de website). Bewaar het template → **template id**.
4. **Public key:** *Account* → *General* (of *Public Key*) → kopieer de
   **public key**.
5. Plak de drie waarden in `js/config.js` onder `emailJs` en vul
   `reserverenEmail` in met het echte adres. Test met een echte
   reservering.

> De public key mag in de website staan: EmailJS is zo ontworpen dat
> "mail vanuit de browser" ermee kan. Er zit een gratis limiet van
> 200 mails per maand; er staat ook een onzichtbaar honeypot-veld in het
> formulier dat spam afkeurt.

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
│   ├── datum.js         # publicatieDatum/release-helpers (vóór sets.js/set.js/form.js laden)
│   ├── sets.js          # catalogus (toont alleen gereleased sets)
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
└── img/                 # foto's (sets: img/sets/, afgekeurde: img/sets/afgekeurd/,
                         #   blog: img/blog/, campagne: img/campagne/)
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
