import re, sys, urllib.request, urllib.parse, concurrent.futures as cf, html as H
B = sys.argv[1].rstrip("/")
UA = {"User-Agent": "Mozilla/5.0 (link-audit)"}
def fetch(u, timeout=60):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=timeout)
        return r.status, r.geturl(), r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, u, ""
    except Exception as e:
        return 0, u, str(e)[:60]
sm = fetch(B + "/sitemap.xml")[2]
pages = sorted({re.sub(r"^https?://[^/]+", "", u) or "/" for u in re.findall(r"<loc>([^<]+)</loc>", sm)} | {"/login", "/pay", "/book", "/404-test-page"})
docs = {p: fetch(B + p) for p in pages}
ids = {p: set(re.findall(r'\sid="([^"]+)"', d[2])) for p, d in docs.items()}
links = {}  # (href) -> set(pages)
for p, (st, _, body) in docs.items():
    for m in re.finditer(r'<a\s[^>]*?href="([^"]*)"', body):
        h = H.unescape(m.group(1))
        links.setdefault(h, set()).add(p)
internal, hashes, mail, ext, other = [], [], [], [], []
for h in links:
    if h.startswith("mailto:") or h.startswith("tel:"): mail.append(h)
    elif h.startswith("#"): hashes.append(h)
    elif h.startswith("http") and not h.startswith(B) and "jennings-media.com" not in h: ext.append(h)
    elif h.startswith("/") or h.startswith(B) or "jennings-media.com" in h: internal.append(h)
    else: other.append(h)
problems = []
def norm(h):
    h = re.sub(r"^https?://(www\.)?jennings-media\.com", "", h); h = re.sub(r"^https?://localhost:\d+", "", h); return h or "/"
def chk(h):
    path = norm(h); base, _, frag = path.partition("#")
    st, final, body = fetch(B + (base or "/"))
    ok = st == 200
    fragok = True
    if ok and frag:
        fragok = frag in set(re.findall(r'\sid="([^"]+)"', body))
    return h, st, final, fragok
with cf.ThreadPoolExecutor(8) as ex:
    res = list(ex.map(chk, internal))
for h, st, final, fragok in res:
    if st != 200 or not fragok:
        problems.append(("INTERNAL", h, st, "missing #anchor" if not fragok else "", sorted(links[h])[:3]))
for h in hashes:
    frag = h[1:]
    if not frag: continue
    for p in links[h]:
        if frag not in ids.get(p, set()): problems.append(("ANCHOR", h, p, "id not on page", []))
ext_ok = []
for h in sorted(ext):
    st, _, _ = fetch(h, 20)
    (ext_ok if st in (200, 301, 302, 303, 307, 308, 403, 999) else problems.append(("EXTERNAL", h, st, "", sorted(links[h])[:2]))) if False else None
    if st not in (200, 301, 302, 303, 307, 308, 403, 429, 999): problems.append(("EXTERNAL", h, st, "", sorted(links[h])[:2]))
print(f"pages crawled: {len(pages)} | unique links: {len(links)} (internal {len(internal)}, #anchors {len(hashes)}, mailto/tel {len(mail)}, external {len(ext)})")
print("mailto/tel:", sorted(mail))
print("external:", sorted(ext))
print(f"PROBLEMS: {len(problems)}")
for pr in problems: print("  ", pr)
for p, (st, _, _) in docs.items():
    if st != 200 and p != "/404-test-page": print("  PAGE", p, st)
print("404 page status:", docs["/404-test-page"][0])
