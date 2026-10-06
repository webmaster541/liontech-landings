#!/usr/bin/env python3
"""Build a complete landing release, or refuse.

Starts from the entry pages, follows every internal .html link, and collects
every local file those pages (and their CSS) reference. The release contains
exactly that closure. If any referenced file is missing, is an unfetched Git
LFS pointer, or lives in a forbidden path, the build fails and nothing is
published.

Published layout: pages/<name>.html -> <name>.html at the docroot root; every
other file keeps its repository path. From the root, "../images/x" and
"images/x" both resolve to "/images/x", so both spellings used in the HTML work.

Usage:
  build_release.py --src <checkout> --out <release_dir> [--csp "<header>"]
  build_release.py --src <repo> --check        # local pre-push check, no copy
"""
import argparse
import hashlib
import json
import posixpath
import re
import shutil
import subprocess
import sys
import urllib.parse
from html.parser import HTMLParser
from pathlib import Path

ENTRY_PAGES = ["index.html", "lion-tech-care.html"]
PAGES_DIR = "pages"
FORBIDDEN_DIRS = {"personal", "Ideas", "propuestas", "Frames", "docs", ".git"}
FORBIDDEN_SUFFIXES = {".heic", ".py", ".rar", ".zip"}
ASSET_EXT = r"png|jpe?g|webp|gif|svg|ico|avif|mp4|mov|webm|glb|gltf|woff2?|ttf|otf|css|js|json|pdf|html"
EXTERNAL = re.compile(r"^(?:[a-z][a-z0-9+.-]*:|//)", re.I)
QUOTED_PATH = re.compile(r"""["'`]([^"'`<>\n$]*?\.(?:%s))(?:[?#][^"'`<>\n]*)?["'`]""" % ASSET_EXT, re.I)
CSS_URL = re.compile(r"""(?<![\w$.])url\(\s*["']?([^"')]+?)["']?\s*\)""", re.I)
LFS_MAGIC = b"version https://git-lfs"


class RefParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs, self.external_exec = [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for key in ("src", "href", "poster", "data-src", "data-bg"):
            if a.get(key):
                self.refs.append(a[key])
        for key in ("srcset", "data-srcset"):
            if a.get(key):
                self.refs += [c.strip().split(" ")[0] for c in a[key].split(",") if c.strip()]
        if tag == "meta" and a.get("content") and re.search(r"\.(%s)$" % ASSET_EXT, a["content"], re.I):
            self.refs.append(a["content"])
        # origins that execute or style the page: these must be allowed by the CSP
        rel = (a.get("rel") or "").lower()
        if tag in ("script", "iframe") and a.get("src") and EXTERNAL.match(a["src"]):
            self.external_exec.append(a["src"])
        if tag == "link" and "stylesheet" in rel and a.get("href") and EXTERNAL.match(a["href"]):
            self.external_exec.append(a["href"])


def published(ref):
    """Map a reference found in a root-level page to its published path, or None."""
    ref = ref.strip()
    if not ref or EXTERNAL.match(ref) or ref.startswith("#") or "${" in ref:
        return None
    ref = urllib.parse.unquote(re.split(r"[?#]", ref, maxsplit=1)[0])
    if not ref:
        return None
    parts = [p for p in posixpath.normpath("/" + ref).split("/") if p and p != ".."]
    return "/".join(parts) or None


def repo_path(pub, src):
    if pub.lower().endswith(".html") and "/" not in pub and (src / PAGES_DIR / pub).is_file():
        return f"{PAGES_DIR}/{pub}"
    return pub


def refs_of(file, text):
    if file.endswith(".css"):
        return CSS_URL.findall(text), []
    p = RefParser()
    p.feed(text)
    refs = p.refs + CSS_URL.findall(text) + QUOTED_PATH.findall(text)
    return refs, p.external_exec


def tracked_in_head(src):
    out = subprocess.run(["git", "-C", str(src), "ls-tree", "-r", "-z", "--name-only", "HEAD"],
                         capture_output=True, check=True).stdout
    return set(out.decode("utf-8").split("\0")) - {""}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, type=Path)
    ap.add_argument("--out", type=Path)
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--csp", default="")
    args = ap.parse_args()
    src = args.src.resolve()
    head = tracked_in_head(src) if args.check else None

    errors, files, external = [], {}, set()
    queue = [(p, "entry") for p in ENTRY_PAGES]
    while queue:
        pub, origin = queue.pop()
        if pub in files:
            continue
        rp = repo_path(pub, src)
        disk = src / rp
        if Path(rp).parts[0] in FORBIDDEN_DIRS or disk.suffix.lower() in FORBIDDEN_SUFFIXES or ".backup" in disk.name:
            errors.append(f"FORBIDDEN  {rp}  (referenced by {origin})")
            continue
        if not disk.is_file():
            errors.append(f"MISSING    {rp}  (referenced by {origin})")
            continue
        if head is not None and rp not in head:
            errors.append(f"NOT-IN-HEAD {rp}  (referenced by {origin}; commit it or it will not be published)")
        data = disk.read_bytes()
        if data.startswith(LFS_MAGIC):
            errors.append(f"LFS-POINTER {rp}  (run: git lfs pull)")
            continue
        files[pub] = rp
        if disk.suffix.lower() in (".html", ".css"):
            refs, ext = refs_of(pub, data.decode("utf-8", errors="ignore"))
            external.update(urllib.parse.urlsplit(u if not u.startswith("//") else "https:" + u).netloc for u in ext)
            for r in refs:
                target = published(r)
                if target and target != pub:
                    queue.append((target, rp))

    if args.csp:
        for host in sorted(external):
            if host and host not in args.csp:
                errors.append(f"CSP-BLOCKED {host}  (loaded as script/style/iframe, not allowed by the production CSP)")

    pages = sorted(p for p in files if p.endswith(".html"))
    print(f"pages: {', '.join(pages)}")
    print(f"files: {len(files)}  external exec/style origins: {sorted(external) or 'none'}")
    errors = sorted(set(errors))
    if errors:
        print(f"\nBUILD REFUSED - {len(errors)} problem(s):", file=sys.stderr)
        for e in errors:
            print("  " + e, file=sys.stderr)
        return 1
    if args.check:
        print("OK - HEAD produces a complete release.")
        return 0

    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=False)
    manifest = {}
    for pub, rp in sorted(files.items()):
        dst = out / pub
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src / rp, dst)
        manifest[pub] = hashlib.sha256(dst.read_bytes()).hexdigest()
    (out.parent / f"{out.name}.manifest.json").write_text(json.dumps(manifest, indent=1))
    with open(out.parent / f"{out.name}.sha256", "w", newline="\n") as fh:
        for pub, digest in manifest.items():
            fh.write(f"{digest}  ./{pub}\n")
    print(f"OK - release written to {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
