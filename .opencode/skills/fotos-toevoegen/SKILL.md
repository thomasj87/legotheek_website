---
name: fotos-toevoegen
description: Foto's van een bestaande of nieuwe Lego-set toevoegen vanuit add_in/ aan de website, zonder lokaal Ollama-model. Verkleint foto's met set_fotos.py verklein, genereert onderschriften direct via het AI-model van de agent, past data/sets.json aan en voert de smoke-test uit.
---

# Skill: fotos-toevoegen

Snelle en directe workflow om foto's vanuit `add_in/` toe te voegen aan een set op de website, waarbij de foto's al handmatig zijn geselecteerd en de AI-agent zelf de onderschriften genereert met zijn eigen vision-mogelijkheden (geen lokaal Ollama-model vereist).

## Wanneer te gebruiken
- Er staan nieuwe foto's in `add_in/` voor een set (bijvoorbeeld een set met `"fotos": []` of een update van foto's).
- De gebruiker heeft de foto's al met de hand geselecteerd en gecontroleerd.
- De agent verkleint de foto's, bekijkt ze direct en verzorgt de Nederlandse onderschriften in `data/sets.json`.

## Stappen

1. **Foto's verkleinen en hernoemen**
   Draai het verklein-commando voor het betreffende setnummer:
   ```bash
   python3 .opencode/skills/set-fotos/scripts/set_fotos.py verklein --set <SETNUMMER>
   ```
   Dit plaatst geoptimaliseerde afbeeldingen in `img/sets/SetNN_Foto01.jpg`, `SetNN_Foto02.jpg`, enz. (max 1920px breed, JPEG kwaliteit 80).

2. **Foto's bekijken met het AI vision-model**
   Gebruik de `read`-tool om de afbeeldingen in `img/sets/` te bekijken en genereer per foto een kort, kindvriendelijk en enthousiast Nederlands onderschrift passend bij de Lego-set.

3. **`data/sets.json` bijwerken**
   Werk het `fotos`-array van de betreffende set bij in `data/sets.json`:
   ```json
   "fotos": [
     {
       "pad": "img/sets/SetNN_Foto01.jpg",
       "onderschrift": "De complete set!"
     },
     {
       "pad": "img/sets/SetNN_Foto02.jpg",
       "onderschrift": "..."
     }
   ]
   ```

4. **Smoke-test uitvoeren**
   Controleer of alle fotopaden bestaan en de JSON valide is:
   ```bash
   python3 smoke_test.py
   ```
   (Exit 0 = alles ok).

5. **Commit & communicatie**
   Toon de samenvatting aan de gebruiker en commit de wijzigingen wanneer gevraagd.
