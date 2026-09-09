#!/usr/bin/env python3
"""Smoke-test voor de legotheek-website.

Controleert (zonder browser):
  - alle HTML-pagina's bestaan
  - alle data/*.json geldig zijn
  - lokale referenties (href/src) in de HTML bestaan
  - afbeeldingspaden in de JSON bestaan
  - sets de verwachte velden hebben
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

for s in data.get("sets.json", []):
    fotos = s.get("fotos")
    if not isinstance(fotos, list) or not fotos:
        errors.append(f"sets.json/{s.get('id','?')}: 'fotos' ontbreekt of is leeg")
    else:
        for i, f in enumerate(fotos):
            check_img(f.get("pad"), f"sets.json/{s.get('id')}/fotos[{i}]")
            if not f.get("onderschrift"):
                errors.append(f"sets.json/{s.get('id')}/fotos[{i}]: ontbreekt 'onderschrift'")
    video = s.get("video")
    if video and not video.startswith(("http://", "https://")):
        check_img(video, f"sets.json/{s.get('id')}/video")
for p in data.get("posts.json", []):
    check_img(p.get("afbeelding"), f"posts.json/{p.get('id')}")
check_img(data.get("over-ons.json", {}).get("foto"), "over-ons.json")

# 5) Verwachte velden in sets (incl. uniek setnummer)
nummers = []
for s in data.get("sets.json", []):
    for v in ("id", "nummer", "naam", "prijs", "beschrijving", "delen", "fotos"):
        if v not in s:
            errors.append(f"sets.json/{s.get('id','?')}: ontbreekt veld '{v}'")
    if "nummer" in s:
        nummers.append(s["nummer"])
if len(nummers) != len(set(nummers)):
    errors.append("sets.json: setnummers zijn niet uniek")

# 6) Navigatie: elke pagina linkt naar alle andere pagina's
#    (detailpagina's set.html/post.html worden via JS met ?id= gelinkt -> geen nav-link)
pages = {hf.name for hf in html_files}
nav_pages = pages - {"set.html", "post.html"}
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
