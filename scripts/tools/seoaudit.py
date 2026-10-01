import re, sys, json, html, urllib.request, collections
B = sys.argv[1].rstrip("/")
sm = urllib.request.urlopen(B + "/sitemap.xml", timeout=60).read().decode()
pages = sorted({re.sub(r"^https?://[^/]+", "", u) or "/" for u in re.findall(r"<loc>([^<]+)</loc>", sm)})
titles, descs = collections.defaultdict(list), collections.defaultdict(list)
issues = []
for p in pages:
    h = urllib.request.urlopen(urllib.request.Request(B + p, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read().decode("utf-8", "ignore")
    t = html.unescape((re.search(r"<title>([^<]*)</title>", h) or [None, ""])[1])
    d = re.search(r'<meta name="description" content="([^"]*)"', h); d = html.unescape(d.group(1)) if d else ""
    can = re.search(r'<link rel="canonical" href="([^"]*)"', h)
    og = re.search(r'<meta property="og:image" content="([^"]*)"', h)
    h1 = len(re.findall(r"<h1[\s>]", h))
    noindex = re.search(r'<meta name="robots" content="[^"]*noindex', h)
    imgs = re.findall(r"<img\b[^>]*>", h)
    noalt = [i for i in imgs if not re.search(r'\salt="[^"]+"', i) and 'aria-hidden' not in i and 'alt=""' not in i]
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        try: json.loads(b)
        except Exception as e: issues.append((p, "BAD JSON-LD"))
    titles[t].append(p); descs[d].append(p)
    if not (30 <= len(t) <= 65): issues.append((p, f"title {len(t)} chars: {t}"))
    if not (70 <= len(d) <= 165): issues.append((p, f"description {len(d)} chars"))
    if h1 != 1: issues.append((p, f"{h1} h1 tags"))
    if not can or not can.group(1).startswith("https://jennings-media.com"): issues.append((p, f"canonical {can.group(1) if can else 'missing'}"))
    if not og: issues.append((p, "no og:image"))
    if noindex: issues.append((p, "noindex"))
    if noalt: issues.append((p, f"{len(noalt)} images missing alt"))
dup_t = {t: ps for t, ps in titles.items() if len(ps) > 1}
dup_d = {d[:50]: ps for d, ps in descs.items() if len(ps) > 1 and d}
print(f"{len(pages)} pages audited | issues: {len(issues)} | duplicate titles: {len(dup_t)} | duplicate descriptions: {len(dup_d)}")
for i in issues[:40]: print("  ", i)
for t, ps in list(dup_t.items())[:5]: print("  DUP TITLE", t, ps)
for d, ps in list(dup_d.items())[:5]: print("  DUP DESC", d, ps)
