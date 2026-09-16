---
name: set-fotos
description: Nieuwe Lego-set invoeren in de legotheek-website (thomasj87/legotheek) of een bestaande set bijwerken. Use when the user asks to add a new set (nieuwe set toevoegen, fotos staan in add_in/) of de informatie van een set aanpassen (prijs, datum, foto's) — set-info uit DB_csv.csv halen, foto's verkleinen en hernoemen, foto's evalueren (scherpte/inhoud/orientatie; slechte foto's afkeuren), optionele video transcoderen, per foto een onderschrift via het lokale vision-model, en een entry in data/sets.json schrijven.
---

# Set-fotos — nieuwe set invoeren

Workflow voor een Lego-set: de set-informatie staat in `DB_csv.csv` (lokaal,
blijft buiten de git-repo), de foto's in `add_in/` (eventueel met een mp4-video).
Alles via `scripts/set_fotos.py` (stdlib + PIL voor foto's, ffmpeg voor video,
Ollama voor de onderschriften). Draai het script vanuit de repo-root.

Let op: `data/sets.json` bevat nu ook sets die nog **geen foto's hebben**
(`"fotos": []`); die tonen `img/sets/placeholder.svg` totdat foto's erbij komen.
Een set staat pas op de site als zijn `publicatieDatum` <= de datum van vandaag
in de browser (zie `js/datum.js`).

## Schema (data/sets.json)

```json
{
  "id": "mijn-set",
  "nummer": 14,
  "naam": "De Speelse Naam",
  "thema": "City",
  "prijs": 10,
  "delen": 923,
  "publicatieDatum": "2026-09-18",
  "beschrijving": "Korte omschrijving voor de catalogus-kaart.",
  "omschrijving": "Langere omschrijving voor de detailpagina.",
  "origineleSets": [
    { "nummer": "60215", "naam": "Brandweerkazerne", "stukken": 923 }
  ],
  "fotos": [
    { "pad": "img/sets/Set14_Foto01.jpg", "onderschrift": "..." }
  ]
}
```

- `id`: uniek, zonder spaties (letters/cijfers/keeltekens); wordt gebruikt in de links
- `nummer`: het setnummer uit DB_csv.csv (of max+1 voor een set die er nog niet staat)
- `thema`: uit DB_csv.csv (City, Creator, Friends, Technic, Architecture);
  op de catalogus-kaart en detailpagina als badge
- `prijs`: uit DB_csv.csv (één prijs voor de hele, eventueel samengestelde set)
- `delen`: **totaal** aantal steentjes = som van `stukken` in `origineleSets`
- `publicatieDatum`: YYYY-MM-DD; de site toont de set pas vanaf deze datum
  (standaard: de release-datum van de huidige batch, die de gebruiker aanpast)
- `origineleSets`: de originele Lego-set(s) waaruit de set bestaat, met officieel
  Lego-setnummer (`nummer` als string), naam en aantal `stukken` — voor samengestelde
  sets meerdere rijen; op de detailpagina getoond als tabel
- `beschrijving` / `omschrijving`: zelf schrijven op basis van de originele sets
  (noem de Lego-setnummers en het totaal aantal steentjes)
- `fotos`: lijst met foto's (mag leeg zijn totdat foto's erbij komen);
  elk met een `pad` en een `onderschrift`; de eerste foto is de hoofdfoto
- `video` (optioneel): weglaten als de set geen video heeft

## Voorbereiding (eenmalig controleren)

- `DB_csv.csv` aanwezig in de repo-root (lokaal bestand, niet in git)
- Foto's aanwezig in `add_in/` (jpg/jpeg) alleen als foto's erbij komen;
  eventueel een mp4-video ernaast
- `python3 -c "import PIL"` → PIL aanwezig (python3-imaging)
- `which ffmpeg` → alleen nodig voor de video-stap
- Ollama draaiend met een vision-model (standaard `gemma3:12b`):
  `curl -s http://localhost:11434/api/tags`

## Stappen

1. **Set-info uit de CSV** — thema, prijs, originele set(s) met nummers en stukken:

   ```bash
   python3 .opencode/skills/set-fotos/scripts/set_fotos.py csv --set 14
   # of --json voor een net JSON-fragment van origineleSets
   ```

   - Staat het setnummer er niet in? Dan is het een nieuwe set: vraag de gebruiker
     naar de originele Lego-set(s) (nummer, naam, aantal stukjes) en voeg de rij
     toe aan DB_csv.csv.
   - `delen` = som van de stukken; controleer dat tegen de output aan.
   - Ontbreken er per set foto's in `add_in/`? Vraag aan de gebruiker of de set
     voor nu zonder foto's komt (`"fotos": []`, placeholder op de site).

2. **Setnummer** — het volgende nummer (hoogste bestaande + 1) als de set nog
   geen nummer heeft:

   ```bash
   python3 .opencode/skills/set-fotos/scripts/set_fotos.py volgend-nummer
   ```

3. **Foto's verkleinen** (max 1920px breed, JPEG q80) en hernoemen naar
   `img/sets/SetNN_FotoNN.jpg`:

   ```bash
   python3 .opencode/skills/set-fotos/scripts/set_fotos.py verklein --set 14
   ```

    - `--bron add_in` (standaard), `--max-w 1920`, `--kwaliteit 80`
    - Overwritten bestaande `SetNN_Foto*.jpg`; `add_in/` blijft intact

4. **Foto's evalueren** — per foto controleren of ze geschikt is (scherpte,
   toont de set, geen duplicaten) en of de orientatie goed is:

    ```bash
    python3 .opencode/skills/set-fotos/scripts/set_fotos.py evalueer --set 14
    ```

    - Heuristiek (altijd): te kleine foto's (< `--min-res` 800px op de korte
      zijde) en duplicaten (perceptuele vergelijking) worden afgekeurd.
    - Vision-model (Ollama, `--model gemma3:12b` standaard): niet-scherpe foto's
      en foto's die de set niet tonen worden afgekeurd; staat een foto op zijn
      kop (of 90°/270° scheef) dan wordt die **direct gedraaid** en herbewaard.
    - Afgekeurde foto's verplaatst het script naar `img/sets/afgekeurd/` en
      logt ze in `img/sets/afgekeurd/afgekeurd.json` (set, foto, datum, reden).
      Afgekeurde foto's niet in `data/sets.json` opnemen.
    - Twijfel je aan een afkeuring? De originele foto's staan nog in `add_in/` —
      de foto terugplaatsen uit `img/sets/afgekeurd/` en de manifest-regel
      verwijderen, of gewoon `verklein` opnieuw draaien.
    - Ollama niet bereikbaar? De heuristiek draait gewoon; het model-deel
      geeft dan een waarschuwing.

5. **Video (optioneel)** — mp4 (vaak HEVC) transcoderen naar H.264/AAC 720p;
    HEVC speelt browsers niet af. `video`-veld alleen zetten als de set een video heeft:

    ```bash
    python3 .opencode/skills/set-fotos/scripts/set_fotos.py video --set 14 --inpad add_in/20260910_120000.mp4
    ```

6. **Onderschriften** — per foto een korte beschrijving via het lokale vision-model
    (leesbare output; kopieer ze als `onderschrift` in stap 7):

    ```bash
    python3 .opencode/skills/set-fotos/scripts/set_fotos.py beschrijf --set 14
    ```

    - `--model gemma3:12b` (standaard); Ollama moet draaien, anders foutmelding

## Entry in data/sets.json (handmatig)

Nieuwste set erbij in `data/sets.json` (schema hierboven; conventies: zie README.md):

- `prijs`, `thema` en `origineleSets` komen uit de CSV (stap 1);
  ontbreken ze? Vraag ze dan aan de gebruiker.
- `publicatieDatum`: standaard de batch-datum die de gebruiker noemt; anders vragen
- `naam`: een speelse, Nederlandse naam voor de kist (bij samengestelde sets:
  de onderdelen combineren, bijv. "Brandweerkazerne & Reddingsboot")
- Eerste foto = hoofdfoto; op de detailpagina opent klikken de lightbox (automatisch)
- `video` weglaten als de set geen video heeft

### Bestaande set bijwerken

Prijs, datum of foto's van een bestaande set veranderen: de entry in
`data/sets.json` wijzigen (en eventueel `DB_csv.csv`), de foto-stappen (3–6)
opnieuw draaien met hetzelfde setnummer, en daarna de `smoke_test.py` draaien.
Het `nummer` van een set nooit veranderen.

## Verifiëren

```bash
python3 smoke_test.py
```

Exit 0 = ok (valideert o.a. het bestaan van alle foto-paden, unieke setnummers,
`thema`, `publicatieDatum`, en dat `delen` = som van `origineleSets.stukken`;
gebruikt de datum van vandaag voor het release-beleid).
Waarschuwingen voor `img/sets/*`-bestanden die niet in sets.json staan = verouderd.
Optioneel: lokaal draaien (`python3 -m http.server 8000`) en
`set.html?nummer=14` bekijken (catalogus, detail, tabel originele sets).

## Conventies (zie ook AGENTS.md)

- Site blijft statisch: geen servercode, geen build-stap, geen dependencies
- Alle content in `data/sets.json`, alle foto's in `img/sets/` met bovenstaande naming
- Afgekeurde foto's komen in `img/sets/afgekeurd/` (zelfde naam), logboek in
  `img/sets/afgekeurd/afgekeurd.json`; die foto's nooit in `data/sets.json`
- `DB_csv.csv` is de bron van waarheid voor sets/thema's/prijzen en blijft **lokaal**
  (niet committen, maar ook niet in .gitignore)
- `add_in/` staat in `.gitignore` — raw foto's niet committen
- Committen pas als de gebruiker om een commit vraagt
