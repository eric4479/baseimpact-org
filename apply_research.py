"""Apply verified website research onto the resource data files.

Usage (from the repo root):
    python apply_research.py <results.json> [<results.json> ...]

Each results file is a JSON array of {id, name, website, serviceUrl, sourceUrl,
httpStatus, notes}. For every entry it replaces the `website:` value in place and
inserts `serviceUrl:` / `sourceUrl:` immediately after it, then stamps
`lastVerified` with today's date.

An empty string for website/serviceUrl deletes that field's value (it emits
`website: ""` for website and omits serviceUrl entirely), because a listing that
points at nothing is worse than one that plainly says there is nothing.

Writes only into src/lib/resources/data/{brevard,volusia,orange,statewide}.ts,
choosing the file whose current text contains the entry's id.
"""
import json
import pathlib
import re
import sys
import datetime

ROOT = pathlib.Path(__file__).resolve().parent
DATA = ROOT / "src/lib/resources/data"
FILES = ["brevard.ts", "volusia.ts", "orange.ts", "statewide.ts"]
TODAY = datetime.date.today().isoformat()


def field_line(text, fname, start, end):
    """Return (match, value) for `fname:` inside text[start:end], or (None, None)."""
    # `[ \t]*$` not `\s*$`: \s matches newlines, so the match would swallow the line
    # break and a replacement would fuse onto the following line.
    m = re.search(rf'^[ \t]*{fname}:[ \t]*"(.*?)",[ \t]*$', text[start:end], re.M | re.S)
    if not m:
        return None, None
    return (start + m.start(), start + m.end()), m.group(1)


def apply_one(text, entry):
    rid = entry["id"]
    anchor = text.find(f'id: "{rid}"')
    if anchor == -1:
        return text, f"{rid}: NOT FOUND"

    block_end = text.find("\n  },", anchor)
    if block_end == -1:
        return text, f"{rid}: malformed block"

    # Strip any existing serviceUrl/sourceUrl inside this block first, so rerunning the
    # applier cannot leave a stale or duplicated value behind.
    pattern = re.compile(r'^\s*(?:serviceUrl|sourceUrl):\s*".*?",\s*\n', re.M)
    head, block, tail = text[:anchor], text[anchor:block_end], text[block_end:]
    block = pattern.sub("", block)
    text = head + block + tail
    block_end = text.find("\n  },", anchor)

    insert_after = None
    found = field_line(text, "website", anchor, block_end)
    if found[0] is not None:
        (ws, we), old_website = found
    else:
        # Some entries omit `website:` entirely rather than setting it empty. Anchor on
        # the phone line instead, so those entries still get an explicit website value
        # and cannot silently drift back to "we forgot to record one".
        found = field_line(text, "phone", anchor, block_end)
        if found[0] is None:
            return text, f"{rid}: no website or phone field to anchor on"
        (ws, we), _ = found
        # Keep the phone line: insert AFTER it rather than overwriting it. Overwriting
        # silently deleted `phone: ""`, which the type then rejected.
        insert_after = we
        old_website = "(field absent)"

    website = (entry.get("website") or "").strip()
    service = (entry.get("serviceUrl") or "").strip()
    source = (entry.get("sourceUrl") or "").strip()

    lines = [f'    website: "{website}",']
    if service:
        lines.append(f'    serviceUrl: "{service}",')
    if source:
        lines.append(f'    sourceUrl: "{source}",')

    if insert_after is not None:
        text = text[:insert_after] + "\n" + "\n".join(lines) + text[insert_after:]
    else:
        text = text[:ws] + "\n".join(lines) + text[we:]

    # Stamp verification date.
    a = text.find(f'id: "{rid}"')
    b = text.find("\n  },", a)
    lv = re.search(r'lastVerified:\s*"[^"]*"', text[a:b])
    if lv:
        text = text[:a + lv.start()] + f'lastVerified: "{TODAY}"' + text[a + lv.end():]

    note = f"{rid}: {old_website or '(none)'} -> {website or '(none)'}"
    if service:
        note += "  +service"
    if source:
        note += "  +source"
    return text, note


def main(paths):
    entries = []
    for p in paths:
        entries += json.loads(pathlib.Path(p).read_text(encoding="utf-8"))

    blobs = {f: (DATA / f).read_bytes().decode("utf-8").replace("\r\n", "\n") for f in FILES}
    log = []

    for entry in entries:
        for f in FILES:
            if f'id: "{entry["id"]}"' in blobs[f]:
                blobs[f], note = apply_one(blobs[f], entry)
                log.append(f"  {f:14} {note}")
                break
        else:
            log.append(f"  {'?':14} {entry['id']}: not found in any data file")

    for f, text in blobs.items():
        (DATA / f).write_bytes(text.replace("\n", "\r\n").encode("utf-8"))

    print("\n".join(log))
    print(f"\napplied {len(entries)} entries; lastVerified stamped {TODAY}")


if __name__ == "__main__":
    main(sys.argv[1:] or [str(pathlib.Path.home() / "x")])