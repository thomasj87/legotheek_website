#!/usr/bin/env python3
"""Smoke-test voor de legotheek-website.

Controleert (zonder browser):
  - alle HTML-pagina's bestaan
  - alle data/*.json geldig zijn
  - lokale referenties (href/src) in de HTML bestaan
  - afbeeldingspaden in de JSON bestaan
  - sets de verwachte velden hebben
  - het afgekeurde-manifest (img/sets/afgekeurd/afgekeurd.json) geldig is
  - elke pagina naar de andere pagina's linkt (nav)
  - JS-bestanden niet leeg zijn

Geen dependencies; alleen de stdlib. Exit code 0 = alles ok, 1 = fouten.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
errors = []
warnings = []

# 1) Alle HTML-pagina's bestaan
html_files = sorted(ROOT.glob("*.html"))
if not html_files:
    errors.append("Geen HTML-pagina's gevonden")

# 2) JSON-bestanden geldig
json_files = sorted(ROOT.glob("data/*.json"))
data = {}
for jf in json_files:
    try:
        data[jf.name] = json.loads(jf.read_text())
    except Exception as e:
        errors.append(f"Ongeldige JSON {jf.name}: {e}")

# 3) Lokale referenties in HTML bestaan (href/src, geen http/mailto/#/data:)
ref_re = re.compile(r'(?:href|src)\s*=\s*["\']([^"\']+)["\']')
for hf in html_files:
    text = hf.read_text()
    for ref in ref_re.findall(text):
        if ref.startswith(("http://", "https://", "mailto:", "#", "data:")):
            continue
        path = ref.split("?")[0].split("#")[0]
        if not path:
            continue
        if not (ROOT / path).exists():
            errors.append(f"{hf.name}: ontbrekende referentie '{ref}'")

# 4) Afbeeldingspaden in JSON bestaan
def check_img(path, ctx):
    if path and not (ROOT / path).exists():
        errors.append(f"{ctx}: ontbrekende afbeelding '{path}'")

check_img("img/sets/placeholder.svg", "img/sets")
referenced = set()
for s in data.get("sets.json", []):
    fotos = s.get("fotos")
    if not isinstance(fotos, list):
        errors.append(f"sets.json/{s.get('id','?')}: 'fotos' ontbreekt of is geen lijst")
    else:
        for i, f in enumerate(fotos):
            check_img(f.get("pad"), f"sets.json/{s.get('id')}/fotos[{i}]")
            referenced.add(f.get("pad"))
            if f.get("onderschrift") is None:
                errors.append(f"sets.json/{s.get('id')}/fotos[{i}]: ontbreekt 'onderschrift'")
    video = s.get("video")
    if video and not video.startswith(("http://", "https://")):
        check_img(video, f"sets.json/{s.get('id')}/video")
        referenced.add(video)
for p in data.get("posts.json", []):
    check_img(p.get("afbeelding"), f"posts.json/{p.get('id')}")
check_img(data.get("over-ons.json", {}).get("foto"), "over-ons.json")

# 5) Verwachte velden in sets (incl. uniek setnummer, thema, originele sets, datum)
DATUM_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
nummers = []
for s in data.get("sets.json", []):
    ctx = f"sets.json/{s.get('id','?')}"
    for v in ("id", "nummer", "naam", "prijs", "thema", "delen",
              "publicatieDatum", "origineleSets", "beschrijving",
              "omschrijving", "fotos"):
        if v not in s:
            errors.append(f"{ctx}: ontbreekt veld '{v}'")
    if "nummer" in s:
        nummers.append(s["nummer"])
    datum = s.get("publicatieDatum")
    if not (isinstance(datum, str) and DATUM_RE.match(datum)):
        errors.append(f"{ctx}: 'publicatieDatum' ontbreekt of is geen geldige datum (YYYY-MM-DD)")
    origineel = s.get("origineleSets")
    if not isinstance(origineel, list) or not origineel:
        errors.append(f"{ctx}: 'origineleSets' ontbreekt of is leeg")
    else:
        totaal = 0
        for i, o in enumerate(origineel):
            for v in ("naam", "nummer", "stukken"):
                if v not in o:
                    errors.append(f"{ctx}/origineleSets[{i}]: ontbreekt veld '{v}'")
            if not (isinstance(o.get("stukken"), int) and o["stukken"] > 0):
                errors.append(f"{ctx}/origineleSets[{i}]: 'stukken' moet een positief getal zijn")
            else:
                totaal += o["stukken"]
        if "delen" in s and s["delen"] != totaal:
            errors.append(f"{ctx}: 'delen' ({s['delen']}) komt niet overeen met het "
                         f"totaal van origineleSets ({totaal})")
if len(nummers) != len(set(nummers)):
    errors.append("sets.json: setnummers zijn niet uniek")

# 5a) Foto's in img/sets/ die niet door sets.json worden gebruikt (verouderd?)
referenced.add("img/sets/placeholder.svg")
for pad in sorted((ROOT / "img" / "sets").glob("*")):
    rel = f"img/sets/{pad.name}"
    if pad.is_file() and pad.suffix.lower() in (".jpg", ".jpeg", ".png", ".mp4", ".svg") \
            and rel not in referenced:
        warnings.append(f"img/sets/{pad.name}: niet gebruikt door data/sets.json (verouderd?)")

# 5b) Afgekeurde foto's (img/sets/afgekeurd/afgekeurd.json): geldig manifest,
#     afgekeurde bestanden bestaan, en ze worden nergens gebruikt
afgekeurd_pad = ROOT / "img" / "sets" / "afgekeurd" / "afgekeurd.json"
if afgekeurd_pad.exists():
    try:
        afgekeurd = json.loads(afgekeurd_pad.read_text())
        if not isinstance(afgekeurd, list):
            raise ValueError("geen lijst")
    except Exception as e:
        errors.append(f"afgekeurd.json: ongeldig manifest ({e})")
        afgekeurd = []
    for i, e in enumerate(afgekeurd):
        if not isinstance(e, dict) or not e.get("foto"):
            errors.append(f"afgekeurd.json[{i}]: ontbreekt 'foto'")
            continue
        if not (ROOT / "img" / "sets" / "afgekeurd" / e["foto"]).exists():
            errors.append(f"afgekeurd.json[{i}]: afgekeurd bestand "
                          f"'img/sets/afgekeurd/{e['foto']}' ontbreekt")
        if f"img/sets/{e['foto']}" in referenced:
            errors.append(f"afgekeurd.json[{i}]: '{e['foto']}' is afgekeurd maar "
                          f"wordt gebruikt in data/sets.json")

# 6) Navigatie: elke pagina linkt naar alle andere pagina's
#    (detailpagina's set.html/post.html en 404.html worden via JS / server gerouteerd -> geen standaard nav-link ernaartoe)
pages = {hf.name for hf in html_files}
nav_pages = pages - {"set.html", "post.html", "404.html"}
for hf in html_files:
    text = hf.read_text()
    for p in nav_pages:
        if p == hf.name:
            continue
        if f'href="{p}"' not in text:
            warnings.append(f"{hf.name}: geen nav-link naar {p}")

# 7) JS-bestanden bestaan en zijn niet leeg
for js in sorted((ROOT / "js").glob("*.js")):
    if js.stat().st_size == 0:
        errors.append(f"Leeg JS-bestand: {js.name}")
sw = ROOT / "sw.js"
if not sw.exists() or sw.stat().st_size == 0:
    errors.append("sw.js (service worker) ontbreekt of is leeg")

print("=== SMOKE-TEST RESULTAAT ===")
print(f"HTML-pagina's: {len(html_files)}")
print(f"JSON-bestanden: {len(json_files)}")
print(f"JS-bestanden: {len(list((ROOT/'js').glob('*.js')))}")
print()
if errors:
    print(f"FEEL ({len(errors)}):")
    for e in errors:
        print("  - " + e)
else:
    print("FEEL: geen")
print()
if warnings:
    print(f"WAARSCHUWINGEN ({len(warnings)}):")
    for w in warnings:
        print("  - " + w)
else:
    print("WAARSCHUWINGEN: geen")

sys.exit(1 if errors else 0)
