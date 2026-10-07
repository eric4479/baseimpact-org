#!/usr/bin/env python3
"""
Repeatable WCAG 2.1 AA audit for baseimpact.org.

Self-validating by design: run it against a deliberately broken page first. A clean
report from a broken harness is worse than no report, because it looks like proof.

    python3 scripts/wcag-audit.py --self-test        # prove the harness works
    python3 scripts/wcag-audit.py --base https://baseimpact.org
    python3 scripts/wcag-audit.py --base http://127.0.0.1:8899 --flat   # local build

Why a standalone headless Chrome instead of the browser tool: axe-core is ~650 KB and
piping it through a browser bridge truncates. It also means the audit can never disturb
Eric's real browser profile.

Rules covered: axe tags wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice.
Manual checks cover what axe cannot: landmarks, heading order, skip link, focus
visibility, tap-target size, and text contrast measured through the browser's own
colour engine (Tailwind v4 emits oklch(), which naive RGB regex parsing gets wrong).

NOTE: this is an automated + programmatic-assistive review, not a substitute for a
screen-reader walkthrough with a real user and expert accessibility review before
claiming conformance.
"""
import argparse
import json
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path

try:
    import websocket  # websocket-client
except ImportError:
    raise SystemExit("pip install websocket-client")

PAGES = ["/", "/directory", "/guide", "/partners", "/volunteer", "/how-to-help",
         "/impact", "/purpose", "/about", "/join", "/contact", "/feedback",
         "/privacy", "/connect", "/log", "/socials", "/terms"]
TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]

# innerHTML below is a hardcoded literal with no untrusted input -- it exists
# to manufacture known WCAG failures so this harness can prove it detects them.
CONTROL_JS = """
(function(){
  var d = document.createElement('div');
  d.id = 'wcag-self-test';
  d.innerHTML =
    '<p style="color:#b0b0b0;background:#fff;font-size:14px">control</p>' +
    '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">' +
    '<input type="text" name="c">';
  document.body.appendChild(d);
})();
"""

CHECK_JS = r"""
(() => {
  const q = s => Array.from(document.querySelectorAll(s));
  const cv = document.createElement('canvas').getContext('2d');
  const toRGB = (css) => {
    cv.fillStyle = '#000'; cv.fillStyle = css;
    const a = cv.fillStyle;
    if (a.startsWith('#')) {
      const h = a.slice(1);
      const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
      return [parseInt(f.slice(0,2),16), parseInt(f.slice(2,4),16), parseInt(f.slice(4,6),16), 1];
    }
    const m = a.match(/[\d.]+/g) || [];
    return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]];
  };
  const lum = ([r,g,b]) => { const f = v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const over = (fg,bg) => fg[3] >= 1 ? fg : [fg[0]*fg[3]+bg[0]*(1-fg[3]), fg[1]*fg[3]+bg[1]*(1-fg[3]), fg[2]*fg[3]+bg[2]*(1-fg[3]), 1];
  const ratio = (fg,bg) => { const a=lum(fg), b=lum(bg); return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05); };
  const bgOf = (el) => { let acc=null, n=el;
    while (n && n !== document.documentElement) {
      const c = toRGB(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) { acc = acc === null ? c : over(acc,c); if (acc[3] >= 1) return acc; }
      n = n.parentElement; }
    const b = toRGB(getComputedStyle(document.body).backgroundColor);
    return acc === null ? b : over(acc,b); };

  const contrast = [];
  const els = q('p,a,span,li,h1,h2,h3,h4,button,label,dd,dt,td,th,legend,input,select,textarea')
    .filter(e => (e.offsetParent !== null || getComputedStyle(e).position === 'fixed')
      && !e.classList.contains('sr-only') && !e.closest('.sr-only')
      && ((e.textContent||'').trim().length > 2 || ['INPUT','SELECT','TEXTAREA'].includes(e.tagName)))
    .slice(0, 300);
  for (const el of els) {
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    const bg = bgOf(el);
    const r = ratio(over(toRGB(cs.color), bg), bg);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight,10) >= 700;
    const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    if (r < need - 0.01) contrast.push({
      text: (el.textContent||'').trim().slice(0,60),
      cls: (el.className||'').toString().slice(0,60),
      ratio: +r.toFixed(2), need, color: cs.color,
      bg: `rgb(${bg.slice(0,3).map(Math.round).join(',')})` });
  }

  const small = [];
  for (const el of q('a[href],button,input,select,textarea,[role=button]')) {
    if (el.offsetParent === null) continue;
    if (el.classList.contains('sr-only') || el.closest('.sr-only')) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.width < 44 || r.height < 44) small.push({
      tag: el.tagName, text: (el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,34),
      w: Math.round(r.width), h: Math.round(r.height), cls: (el.className||'').toString().slice(0,46) });
  }

  const controls = q('input:not([type=hidden]),select,textarea')
    .filter(e => e.offsetParent !== null && e.getAttribute('aria-hidden') !== 'true');
  const unlabelled = [];
  for (const el of controls) {
    const ok = (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`))
      || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
      || el.closest('label') || el.getAttribute('title');
    if (!ok) unlabelled.push(el.outerHTML.slice(0,100));
  }

  const levels = q('h1,h2,h3,h4,h5,h6').map(h => +h.tagName[1]);
  const jumps = [];
  for (let i = 1; i < levels.length; i++)
    if (levels[i] - levels[i-1] > 1) jumps.push(`${levels[i-1]}->${levels[i]}`);

  let noRing = 0, checked = 0;
  for (const el of q('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')
      .filter(e => e.offsetParent !== null).slice(0, 40)) {
    const before = getComputedStyle(el);
    const o = before.outlineStyle, w = before.outlineWidth, sh = before.boxShadow;
    el.focus();
    const after = getComputedStyle(el);
    checked++;
    if (after.outlineStyle === o && after.outlineWidth === w && after.boxShadow === sh
        && (o === 'none' || w === '0px') && sh === 'none') noRing++;
    el.blur();
  }

  return {
    lang: document.documentElement.lang || null,
    h1Count: q('h1').length, headingJumps: jumps,
    skipLink: q('a[href^="#"]').some(a => /skip|jump/i.test(a.textContent||'')),
    hasMain: !!document.querySelector('main'), hasFooter: !!document.querySelector('footer'),
    imgsMissingAlt: q('img').filter(i => !i.hasAttribute('alt')).length,
    unlabelledControls: unlabelled, smallTargets: small, contrastIssues: contrast.slice(0,20),
    focusablesChecked: checked, focusablesWithoutVisibleFocus: noRing,
    emptyLinks: q('a[href]').filter(a => !(a.textContent||'').trim() && !a.getAttribute('aria-label')).length,
    has211Link: !!document.querySelector('a[href*="tel:211"]'),
    has988Link: !!document.querySelector('a[href*="tel:988"]'),
    has911Link: !!document.querySelector('a[href*="tel:911"]'),
  };
})()
"""


def free_port():
    import socket
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


def launch(port, profile, size="390,844"):
    return subprocess.Popen(
        ["/usr/bin/google-chrome", "--headless=new", f"--remote-debugging-port={port}",
         f"--user-data-dir={profile}", "--no-sandbox", "--disable-gpu",
         "--disable-dev-shm-usage", "--hide-scrollbars", f"--window-size={size}",
         # Required: Chrome rejects the DevTools WS handshake from a mismatched origin.
         "--remote-allow-origins=*", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def connect(port, tries=60):
    for _ in range(tries):
        time.sleep(0.5)
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/json/version", timeout=2) as r:
                return websocket.create_connection(json.load(r)["webSocketDebuggerUrl"], timeout=180)
        except Exception:
            continue
    raise SystemExit("could not reach Chrome DevTools")


def session(ws, axe_src=None):
    mid = [0]
    def send(method, params=None, session=None):
        mid[0] += 1
        m = {"id": mid[0], "method": method, "params": params or {}}
        if session: m["sessionId"] = session
        ws.send(json.dumps(m))
        while True:
            r = json.loads(ws.recv())
            if r.get("id") == mid[0]: return r.get("result", {})
    t = send("Target.createTarget", {"url": "about:blank"})["targetId"]
    sess = send("Target.attachToTarget", {"targetId": t, "flatten": True})["sessionId"]
    send("Page.enable", session=sess); send("Runtime.enable", session=sess)
    if axe_src:
        # Before any page script, so axe sees the live DOM rather than racing it.
        send("Page.addScriptToEvaluateOnNewDocument", {"source": axe_src}, session=sess)
    return send, sess


def self_test(base):
    print("SELF-TEST: injecting 3 deliberate WCAG AA failures into " + base + "/guide")
    axe_src = Path("node_modules/axe-core/axe.min.js").read_text()
    profile = tempfile.mkdtemp(prefix="wcag-self-"); port = free_port()
    proc = launch(port, profile, "1280,900")
    ws = connect(port); send, sess = session(ws, axe_src)
    send("Page.navigate", {"url": base.rstrip("/") + "/guide"}, session=sess)
    time.sleep(3.5)
    send("Runtime.evaluate", {"expression": CONTROL_JS}, session=sess)
    expr = ("(async () => { const r = await window.axe.run(document, { runOnly: { type: 'tag', values: "
            + json.dumps(TAGS) + " } }); return r.violations.map(v => v.id); })()")
    got = send("Runtime.evaluate", {"expression": expr, "awaitPromise": True, "returnByValue": True}, session=sess)
    ids = set(got.get("result", {}).get("value") or [])
    expected = {"color-contrast", "image-alt", "label"}
    missed = expected - ids
    ws.close(); proc.kill(); subprocess.run(["rm", "-rf", profile])
    print("  caught:", sorted(expected & ids))
    print("  missed:", sorted(missed))
    if missed:
        print("\nFAIL: harness missed deliberate violations — treat any clean report as unreliable.")
        raise SystemExit(1)
    print("\nPASS: harness catches all 3. A clean report is meaningful.\n")


def audit(base, flat, out):
    axe_src = Path("node_modules/axe-core/axe.min.js").read_text()
    def url_for(p):
        if flat: return base + ("/index.html" if p == "/" else p.rstrip("/") + ".html")
        return base + p

    profile = tempfile.mkdtemp(prefix="wcag-audit-"); port = free_port()
    proc = launch(port, profile)
    ws = connect(port); send, sess = session(ws, axe_src)

    print(f"WCAG 2.1 AA audit — {base} — viewport 390x844")
    print("=" * 70)
    report = []
    for path in PAGES:
        send("Page.navigate", {"url": url_for(path)}, session=sess)
        time.sleep(3.2)
        expr = ("(async () => { const r = await window.axe.run(document, { runOnly: { type: 'tag', values: "
                + json.dumps(TAGS) + " } }); return { violations: r.violations.map(v => ({ id: v.id,"
                " impact: v.impact, help: v.help, n: v.nodes.length,"
                " sample: v.nodes.slice(0,3).map(x => x.target.join(' ')) })),"
                " incomplete: r.incomplete.length, passes: r.passes.length }; })()")
        axe = send("Runtime.evaluate", {"expression": expr, "awaitPromise": True,
                                       "returnByValue": True}, session=sess)
        a = axe.get("result", {}).get("value") or {}
        man = send("Runtime.evaluate", {"expression": CHECK_JS, "returnByValue": True}, session=sess)
        m = man.get("result", {}).get("value") or {}
        report.append({"path": path, "axe": a, "manual": m})

        bad = []
        if a.get("violations"): bad.append(f"{len(a['violations'])} axe violation(s)")
        if m.get("contrastIssues"): bad.append(f"{len(m['contrastIssues'])} contrast < AA")
        if m.get("smallTargets"): bad.append(f"{len(m['smallTargets'])} target(s) < 44px")
        if m.get("unlabelledControls"): bad.append(f"{len(m['unlabelledControls'])} unlabelled control(s)")
        if m.get("imgsMissingAlt"): bad.append(f"{m['imgsMissingAlt']} img w/o alt")
        if not m.get("lang"): bad.append("no lang on <html>")
        if m.get("h1Count") != 1: bad.append(f"h1 count={m.get('h1Count')}")
        if m.get("headingJumps"): bad.append("heading jumps " + ",".join(m["headingJumps"][:3]))
        if not m.get("skipLink"): bad.append("no skip link")
        if not m.get("hasMain"): bad.append("no <main>")
        if m.get("focusablesWithoutVisibleFocus"): bad.append(f"{m['focusablesWithoutVisibleFocus']} no focus ring")
        if not m.get("has211Link"): bad.append("no tel:211")
        if not m.get("has988Link"): bad.append("no tel:988")
        if not m.get("has911Link"): bad.append("no tel:911")

        print(f"{path:16} axe_violations={len(a.get('violations',[]))} passes={a.get('passes','?')}  "
              + ("PASS" if not bad else "FAIL -> " + "; ".join(bad)))

    Path(out).write_text(json.dumps(report, indent=1))
    total_axe = sum(len(r["axe"].get("violations", [])) for r in report)
    total_tap = sum(len(r["manual"].get("smallTargets", [])) for r in report)
    total_con = sum(len(r["manual"].get("contrastIssues", [])) for r in report)
    print("=" * 70)
    print(f"axe violations: {total_axe} | sub-44px targets: {total_tap} | contrast fails: {total_con}")
    print(f"saved {out}")
    ws.close(); proc.kill(); subprocess.run(["rm", "-rf", profile])


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://baseimpact.org")
    ap.add_argument("--flat", action="store_true")
    ap.add_argument("--out", default="wcag-report.json")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        self_test(a.base)
    else:
        audit(a.base, a.flat, a.out)