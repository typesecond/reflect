"""Check deployable static assets and project-subdirectory compatibility."""
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1] / "dist"
references = set()


def check_reference(value, parent):
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return
    assert not parsed.path.startswith("/"), f"Root-relative asset breaks project hosting: {value}"
    path = (parent / unquote(parsed.path)).resolve()
    assert path.is_relative_to(ROOT.resolve()), f"Asset outside published directory: {value}"
    assert path.is_file(), f"Missing asset: {value}"
    references.add(path)


class HTMLAssets(HTMLParser):
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for key in ("src", "poster"):
            if key in values:
                check_reference(values[key], ROOT)
        if tag == "link" and "href" in values:
            check_reference(values["href"], ROOT)


HTMLAssets().feed((ROOT / "index.html").read_text())
for source in ROOT.rglob("*"):
    if not source.is_file():
        continue
    assert not source.is_symlink(), f"Unexpected symlink: {source}"
    assert source.stat().st_size < 100 * 1024 * 1024, f"File too large for a normal Git push: {source}"
    if source.suffix in (".html", ".js", ".css"):
        content = source.read_text()
        assert not re.search(r"(?:localhost|127\.0\.0\.1|file:///|/Users/)", content), f"Local-only runtime reference: {source}"
        for media in re.findall(r'''["']((?:media|assets)/[^"'<>]+\.(?:mp4|png|svg|ttf))["']''', content):
            check_reference(media, source.parent)
        if source.suffix == ".css":
            for url in re.findall(r'''url\(\s*["']?([^"')]+)["']?\s*\)''', content):
                check_reference(url, source.parent)
print(f"PASS: {len(references)} asset references resolve beneath dist/; project-path hosting is supported.")
