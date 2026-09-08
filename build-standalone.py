#!/usr/bin/env python3
"""Wrap an artifact source file into a standalone HTML document.

Artifact sources are published as page *fragments* — the host supplies the
doctype, <head> and a small reset at publish time, so the source must not
carry them itself. This script adds that scaffolding so the same content
opens correctly as a plain file, over file:// or any static host.

Usage: python3 build-standalone.py clearing-competitors.html
Writes: <name>-standalone.html
"""
import re
import sys
from pathlib import Path

# Mirrors the reset the artifact host injects, so the standalone file renders
# identically rather than falling back to UA defaults.
HOST_RESET = """    <style>
      :root { color-scheme: light; }
      body { margin: 0; font: 14px system-ui, -apple-system, "Segoe UI", sans-serif; background: #fcfcfb; }
      img { max-width: 100%; }
      [hidden] { display: none !important; }
    </style>"""


def build(src: Path) -> Path:
    raw = src.read_text(encoding="utf-8")

    for tag in ("<!doctype", "<html", "<body"):
        if tag in raw.lower():
            sys.exit(f"{src} already looks like a full document ({tag!r} found).")

    title_match = re.search(r"<title>(.*?)</title>", raw, re.I | re.S)
    if not title_match:
        sys.exit(f"{src} has no <title>; add one before building.")
    title = title_match.group(1).strip()

    # The <title> and the font <link>s belong in <head>, not the body.
    head_bits, body = [], raw
    for pattern in (r"<title>.*?</title>\s*", r"<link\b[^>]*>\s*"):
        for m in re.findall(pattern, body, re.I | re.S):
            head_bits.append(m.strip())
        body = re.sub(pattern, "", body, flags=re.I | re.S)

    head = "\n".join("    " + b for b in head_bits)
    out = src.with_name(src.stem + "-standalone.html")
    out.write_text(
        "<!doctype html>\n"
        '<html lang="en">\n'
        "  <head>\n"
        '    <meta charset="utf-8">\n'
        '    <meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f"{head}\n"
        f"{HOST_RESET}\n"
        "  </head>\n"
        "  <body>\n"
        f"{body.strip()}\n"
        "  </body>\n"
        "</html>\n",
        encoding="utf-8",
    )
    print(f"{out.name}  ({out.stat().st_size:,} bytes)  title: {title}")
    return out


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    build(Path(sys.argv[1]))
