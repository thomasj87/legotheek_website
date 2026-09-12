---
name: set-fotos
description: Nieuwe Lego-set invoeren in de legotheek-website (thomasj87/legotheek). Use when the user asks to add a new set (nieuwe set toevoegen, fotos staan in add_in/) — foto's verkleinen en hernoemen, optionele video transcoderen, per foto een onderschrift via het lokale vision-model, en een entry in data/sets.json schrijven. Niet voor bestaande sets wijzigen of verwijderen.
---

# Set-fotos — nieuwe set invoeren

Workflow voor een nieuwe Lego-set: de foto's staan in `add_in/` (eventueel met een
mp4-video). Alles via `scripts/set_fotos.py` (stdlib + PIL voor foto's, ffmpeg voor
video, Ollama voor de onderschriften). Draai het script vanuit de repo-root.

## Voorbereiding (eenmalig controleren)

- Foto's aanwezig in `add_in/` (jpg/jpeg); eventueel een mp4-video ernaast
- `python3 -c "import PIL"` → PIL aanwezig (python3-imaging)
- `which ffmpeg` → alleen nodig voor de video-stap
- Ollama draaiend met een vision-model (standaard `gemma3:12b`):
  `curl -s http://localhost:11434/api/tags`

## Stappen

1. **Setnummer** — het volgende nummer (hoogste bestaande + 1):

   ```bash
   python3 .opencode/skills/set-fotos/scripts/set_fotos.py volgend-nummer
   ```

2. **Foto's verkleinen** (max 1920px breed, JPEG q80) en hernoemen naar
   `img/sets/SetNN_FotoNN.jpg`:

   ```bash
   python3 .opencode/skills/set-fotos/scripts/set_fotos.py verklein --set 3
   ```

   - `--bron add_in` (standaard), `--max-w 1920`, `--kwaliteit 80`
   - Overwritten bestaande `SetNN_Foto*.jpg`; `add_in/` blijft intact

3. **Video (optioneel)** — mp4 (vaak HEVC) transcoderen naar H.264/AAC 720p;
   HEVC speelt browsers niet af. `video`-veld alleen zetten als de set een video heeft:

   ```bash
   python3 .opencode/skills/set-fotos/scripts/set_fotos.py video --set 3 --inpad add_in/20260910_120000.mp4
   ```

4. **Onderschriften** — per foto een korte beschrijving via het lokale vision-model
   (leesbare output; kopieer ze als `onderschrift` in stap 5):

   ```bash
   python3 .opencode/skills/set-fotos/scripts/set_fotos.py beschrijf --set 3
   ```

   - `--model gemma3:12b` (standaard); Ollama moet draaien, anders foutmelding

## Entry in data/sets.json (handmatig)

Nieuwste set erbij in `data/sets.json` (schema en conventies: zie README.md):

```json
{
  "id": "mijn-set",
  "nummer": 3,
  "naam": "De Speelse Naam",
  "prijs": 10,
  "delen": 800,
  "beschrijving": "Korte omschrijving voor de catalogus-kaart.",
  "omschrijving": "Langere omschrijving voor de detailpagina.",
  "video": "img/sets/Set03_video.mp4",
  "fotos": [
    { "pad": "img/sets/Set03_Foto01.jpg", "onderschrift": "..." },
    { "pad": "img/sets/Set03_Foto02.jpg", "onderschrift": "..." }
  ]
}
```

- `id`: uniek, zonder spaties (letters/cijfers/keeltekens)
- `nummer`: uit stap 1; ook `set.html?nummer=3` moet werken
- `prijs` en `delen`: **vragen aan de gebruiker** (staan er niet in de foto's)
- `naam`: zelf een speelse naam verzinnen op basis van de foto's
- Eerste foto = hoofdfoto; op de detailpagina opent klikken de lightbox (automatisch)
- `video` weglaten als de set geen video heeft

## Verifiëren

```bash
python3 smoke_test.py
```

Exit 0 = ok (valideert o.a. het bestaan van alle foto-paden en unieke setnummers).
Optioneel: lokaal draaien (`python3 -m http.server 8000`) en
`set.html?nummer=3` bekijken (catalogus, detail, lightbox, video).

## Conventies (zie ook AGENTS.md)

- Site blijft statisch: geen servercode, geen build-stap, geen dependencies
- Alle content in `data/sets.json`, alle foto's in `img/sets/` met bovenstaande naming
- `add_in/` staat in `.gitignore` — raw foto's niet committen
- Committen pas als de gebruiker om een commit vraagt
