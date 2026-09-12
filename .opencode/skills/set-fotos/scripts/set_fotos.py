#!/usr/bin/env python3
"""Helpers om een nieuwe Lego-set in de legotheek-website in te voeren.

Stappen (zie SKILL.md):
  1. volgend-nummer  -> welk setnummer krijgt de nieuwe set?
  2. verklein        -> foto's in add_in/ naar img/sets/SetNN_FotoNN.jpg
  3. video           -> optionele mp4 transcoderen naar H.264 (img/sets/SetNN_video.mp4)
  4. beschrijf       -> per foto een korte beschrijving via het lokale vision-model

Dependencies: PIL (python3-imaging) voor foto's, ffmpeg voor video.
`volgend-nummer` werkt met alleen de stdlib.
"""
import argparse
import base64
import glob
import io
import json
import os
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path


def resolve_root(args) -> Path:
    return (Path(args.root) if args.root else Path.cwd()).resolve()


def laad_sets(root: Path):
    pad = root / "data" / "sets.json"
    return json.loads(pad.read_text())


def cmd_volgend_nummer(args):
    root = resolve_root(args)
    sets = laad_sets(root)
    nummers = [s["nummer"] for s in sets if isinstance(s.get("nummer"), int)]
    volgende = max(nummers) + 1 if nummers else 1
    print(volgende)
    print(f"  (bestaande nummers: {sorted(nummers) or 'geen'})", file=sys.stderr)


def cmd_verklein(args):
    from PIL import Image, ImageOps

    root = resolve_root(args)
    bron = (root / args.bron)
    bestanden = sorted(set(glob.glob(str(bron / "*.jpg")) + glob.glob(str(bron / "*.JPG"))))
    bestanden.sort(key=lambda p: os.path.basename(p).lower())
    if not bestanden:
        sys.exit(f"Geen foto's gevonden in {bron} (staat er iets in add_in/?)")

    n = args.set
    doelmap = root / "img" / "sets"
    doelmap.mkdir(parents=True, exist_ok=True)
    mapping = []
    for i, src in enumerate(bestanden, 1):
        im = Image.open(src)
        im = ImageOps.exif_transpose(im) or im      # respecteer EXIF-rotatie (mobiel)
        im = im.convert("RGB")
        w, h = im.size
        if w > args.max_w:
            im = im.resize((args.max_w, round(h * args.max_w / w)), Image.LANCZOS)
        naam = f"Set{n:02d}_Foto{i:02d}.jpg"
        out = doelmap / naam
        im.save(out, "JPEG", quality=args.kwaliteit, optimize=True)
        mapping.append((os.path.basename(src), naam, im.size, out.stat().st_size // 1024))

    print(f"{len(mapping)} foto's verkleind naar Set{n:02d} (max {args.max_w}px, q{args.kwaliteit}):")
    for src, naam, size, kb in mapping:
        print(f"  {src}  ->  img/sets/{naam}   {size[0]}x{size[1]}   {kb} KB")
    print()
    print(f"Let op: overwrite bestaande Set{n:02d}_Foto*.jpg. add_in/ blijft intact.")


def cmd_video(args):
    root = resolve_root(args)
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg niet gevonden — installeer hem of slaap deze stap over.")
    src = root / args.inpad
    if not src.exists():
        sys.exit(f"Niet gevonden: {src}")
    n = args.set
    out = root / "img" / "sets" / f"Set{n:02d}_video.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-v", "error", "-i", str(src),
        "-c:v", "libx264", "-crf", "23", "-preset", "medium",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        "-vf", "scale=-2:720",
        str(out),
    ]
    subprocess.run(cmd, check=True)
    kb = out.stat().st_size // 1024
    print(f"Video getranscodeerd -> img/sets/{out.name} ({kb} KB, H.264/AAC, ~720px)")


def cmd_beschrijf(args):
    root = resolve_root(args)
    fotos = sorted(glob.glob(str(root / "img" / "sets" / f"Set{args.set:02d}_Foto*.jpg")))
    if not fotos:
        sys.exit(f"Geen Set{args.set:02d}_Foto*.jpg in img/sets/ — draai eerst 'verklein'.")

    # Ollama check
    try:
        urllib.request.urlopen("http://localhost:11434/api/tags", timeout=5)
    except Exception as e:
        sys.exit(f"Ollama niet bereikbaar op localhost:11434 ({e}). "
                 f"Start 'ollama serve', of beschrijf de foto's handmatig.")

    prompt = ("Beschrijf kort in 1 Nederlandse zin wat er op deze foto van een "
              "Lego-bouw staat (concreet: onderdelen, kleuren, minifiguren).")
    from PIL import Image

    for f in fotos:
        im = Image.open(f).convert("RGB")
        if im.width > 1024:
            im = im.resize((1024, round(im.height * 1024 / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=72)
        img_b64 = base64.b64encode(buf.getvalue()).decode()
        body = json.dumps({
            "model": args.model, "prompt": prompt, "images": [img_b64],
            "stream": False, "options": {"temperature": 0.2, "num_predict": 100},
        }).encode()
        req = urllib.request.Request(
            "http://localhost:11434/api/generate",
            data=body, headers={"Content-Type": "application/json"})
        try:
            r = urllib.request.urlopen(req, timeout=180)
            tekst = json.load(r)["response"].strip().replace("\n", " ")
        except Exception as e:
            tekst = f"(fout: {e})"
        print(f"{os.path.basename(f)}: {tekst}")


def main():
    ap = argparse.ArgumentParser(description="Nieuwe set invoeren in de legotheek-website.")
    ap.add_argument("--root", default=None, help="Root van de repo (standaard: huidige map).")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("volgend-nummer", help="Print het volgende setnummer (max + 1).")

    v = sub.add_parser("verklein", help="Foto's in add_in/ verkleinen en hernoemen.")
    v.add_argument("--set", type=int, required=True, help="Setnummer (NN).")
    v.add_argument("--bron", default="add_in", help="Bronmap (standaard: add_in).")
    v.add_argument("--max-w", type=int, default=1920, help="Max. breedte px (standaard 1920).")
    v.add_argument("--kwaliteit", type=int, default=80, help="JPEG-kwaliteit (standaard 80).")

    vi = sub.add_parser("video", help="Optionele mp4 transcoderen naar H.264 (web-vriendelijk).")
    vi.add_argument("--set", type=int, required=True, help="Setnummer (NN).")
    vi.add_argument("--inpad", required=True, help="Pad naar de bron-video (bijv. add_in/x.mp4).")

    b = sub.add_parser("beschrijf", help="Per foto een korte beschrijving via het vision-model.")
    b.add_argument("--set", type=int, required=True, help="Setnummer (NN).")
    b.add_argument("--model", default="gemma3:12b", help="Ollama-model (standaard gemma3:12b).")

    args = ap.parse_args()
    {"volgend-nummer": cmd_volgend_nummer,
     "verklein": cmd_verklein,
     "video": cmd_video,
     "beschrijf": cmd_beschrijf}[args.cmd](args)


if __name__ == "__main__":
    main()
