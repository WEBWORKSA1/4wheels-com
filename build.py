#!/usr/bin/env python3
"""4Wheels.com static site builder.

Pages are written as body fragments in _src/ (each starts with a <!--META {...} --> line)
and wrapped in _src/layout.html. Output is plain HTML at the repo root, with relative
links, so the site works on GitHub Pages under a project URL or on the custom domain.

    python3 build.py
"""
import html
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "_src"
SITE = "https://4wheels.com/"
TODAY = date(2026, 10, 28)
VERSION = "20261028"
LAYOUT = (SRC / "layout.html").read_text(encoding="utf-8")

META_RE = re.compile(r"^\s*<!--META\s*(\{.*?\})\s*-->\s*", re.S)


def read_src(path):
    text = Path(path).read_text(encoding="utf-8")
    m = META_RE.match(text)
    if not m:
        raise SystemExit(f"Missing META header in {path}")
    return json.loads(m.group(1)), text[m.end():]


def esc(s):
    return html.escape(str(s), quote=True)


# ---------------------------------------------------------------- registries
ICONS = {
    "calc": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h4"/>',
    "wallet": '<path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1z"/><path d="M4 7l11-3v3"/><circle cx="16" cy="13.5" r="1.2"/>',
    "scale": '<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z"/>',
    "refresh": '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8"/><path d="M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16"/><path d="M20 20v-4h-4"/>',
    "pie": '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    "fuel": '<path d="M4 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M3 20h12M6 8h6"/><path d="M14 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3"/>',
    "plug": '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    "wrench": '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>',
    "vin": '<path d="M4 6v12M7 6v12M10 6v12M14 6v12M16 6v12M20 6v12"/>',
    "alert": '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/>',
    "trend": '<path d="M3 6l7 7 4-4 7 7"/><path d="M21 11v5h-5"/>',
    "tire": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v5M12 16v5M3 12h5M16 12h5"/>',
    "car": '<path d="M5 16h14M3 16v-3l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v3"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
    "shield": '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    "tag": '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8" r="1.4"/>',
    "truck": '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    "lock": '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    "briefcase": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
}


def icon(name):
    return f'<svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>'


TOOLS = [
    # slug, short name, description, icon, js tool key
    ("car-payment-calculator", "Car payment calculator", "Monthly payment, total interest and a year-by-year schedule.", "calc", "payment"),
    ("affordability-calculator", "How much car can I afford?", "A price ceiling from your income using the 20/4/10 rule.", "wallet", "afford"),
    ("lease-vs-buy", "Lease vs buy", "Compare the true cost of leasing and buying over the same months.", "scale", "lease"),
    ("refinance-calculator", "Refinance savings", "See if a lower rate actually saves you money overall.", "refresh", "refi"),
    ("total-cost-of-ownership", "Total cost of ownership", "Depreciation, fuel, insurance, upkeep and interest in one number.", "pie", "tco"),
    ("fuel-cost-calculator", "Fuel & trip cost", "What a drive costs in miles or km, split between passengers.", "fuel", "fuel"),
    ("ev-vs-gas", "EV vs gas savings", "Yearly energy savings and payback time for going electric.", "plug", "ev"),
    ("maintenance-planner", "Maintenance planner", "Services due in the next 12 months for your mileage.", "wrench", "maint"),
    ("vin-decoder", "VIN decoder", "Decode year, make, model, engine and plant from any VIN.", "vin", "vin"),
    ("recall-check", "Recall check", "Search open safety recall campaigns by year, make and model.", "alert", "recall"),
    ("depreciation-calculator", "Depreciation estimator", "Estimate what your car will be worth year by year.", "trend", "depr"),
    ("tire-size-calculator", "Tire size calculator", "Compare two tire sizes and see the speedometer error.", "tire", "tire"),
]
TOOL_BY_SLUG = {t[0]: t for t in TOOLS}

NEED_CTA = {
    "loan": ("Compare auto loan offers", "Tell us about the car and your budget. We'll match you with lenders that fit."),
    "refinance": ("See if you can refinance for less", "Share your current loan details and we'll look for a lower rate."),
    "insurance": ("Compare car insurance quotes", "One short request, several quotes. You choose — no obligation."),
    "sell": ("Get offers for your car", "Describe your car once and let buyers compete for it."),
    "ship": ("Get car shipping quotes", "Route, dates and vehicle — we'll match you with vetted carriers."),
    "warranty": ("Price an extended warranty", "Get coverage quotes for your car's age and mileage."),
    "dealer": ("Get a better price on your next car", "Tell us what you want and we'll connect you with dealers who compete on price."),
    "fleet": ("Fleet and business vehicles", "Financing, insurance and buying help for business vehicles."),
}

CAT_ORDER = ["Buy", "Finance", "Insure", "Maintain", "EV", "Off-road", "Safety", "Sell", "Ship"]
STAGES = [
    ("Buying", ["Buy"], "car"),
    ("Paying", ["Finance", "Insure"], "wallet"),
    ("Owning", ["Maintain", "EV", "Off-road", "Safety"], "wrench"),
    ("Selling & moving", ["Sell", "Ship"], "tag"),
]


def fmt_date(d):
    return d.strftime("%B %-d, %Y")


# ---------------------------------------------------------------- page assembly
PAGES = []  # (out_path, html)
SITEMAP = []  # (path, priority)


def rel_root(out_path):
    depth = out_path.count("/")
    return "../" * depth


def canonical(out_path):
    if out_path == "index.html":
        return SITE
    if out_path.endswith("/index.html"):
        return SITE + out_path[: -len("index.html")]
    return SITE + out_path


def jsonld(*objs):
    return "\n".join(
        '<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False, separators=(",", ":")) + "</script>"
        for o in objs if o
    )


def breadcrumb_ld(items):
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": name, "item": url} for i, (name, url) in enumerate(items)
        ],
    }


def faq_ld(faq):
    if not faq:
        return None
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q["q"], "acceptedAnswer": {"@type": "Answer", "text": q["a"]}} for q in faq
        ],
    }


def faq_html(faq, heading="Frequently asked questions"):
    if not faq:
        return ""
    items = "".join(f"<details><summary>{esc(q['q'])}</summary><p>{esc(q['a'])}</p></details>" for q in faq)
    return f'<section class="faq" id="faq"><h2>{esc(heading)}</h2>{items}</section>'


def render(out_path, *, title, description, content, nav="", body_class="", ld="", extra_js="", og_type="website",
           robots="index,follow", priority="0.6", full_title=None):
    root = rel_root(out_path)
    navs = {k: "" for k in ("nav_tools", "nav_guides", "nav_videos", "nav_contests", "nav_more")}
    if nav:
        navs["nav_" + nav] = " is-active"
    full = full_title or (f"{title} | 4Wheels" if "4Wheels" not in title else title)
    page = LAYOUT
    repl = {
        "full_title": esc(full),
        "title": esc(title),
        "description": esc(description),
        "canonical": canonical(out_path),
        "robots": robots,
        "og_type": og_type,
        "jsonld": ld,
        "body_class": body_class,
        "extra_js": extra_js,
        "version": VERSION,
        **navs,
    }
    for k, v in repl.items():
        page = page.replace("{{" + k + "}}", v)
    page = page.replace("{{content}}", content)
    page = page.replace("{{root}}", root)
    if out_path == "404.html":
        # GitHub Pages serves 404.html at any depth: pin relative URLs to the site root.
        base = ('<script>(function(){var p=location.pathname,b=p.indexOf("/4wheels-com/")===0?"/4wheels-com/":"/";'
                'document.write(\'<base href="\'+b+\'">\')})()</script>')
        page = page.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + base, 1)
    leftover = re.findall(r"\{\{[a-z_:0-9]+\}\}", page)
    if leftover:
        raise SystemExit(f"Unresolved placeholders in {out_path}: {set(leftover)}")
    PAGES.append((out_path, page))
    if robots.startswith("index"):
        SITEMAP.append((out_path, priority))


def sign_header(h1, lead, crumbs=None):
    c = ""
    if crumbs:
        lis = "".join(
            f'<li><a href="{href}">{esc(name)}</a></li>' if href else f"<li>{esc(name)}</li>" for name, href in crumbs
        )
        c = f'<ol class="crumbs">{lis}</ol>'
    lead_html = f'<p class="lead">{lead}</p>' if lead else ""
    return (
        '<section class="page-sign"><div class="wrap"><div class="sign"><div class="sign-inner">'
        f"{c}<h1>{h1}</h1>{lead_html}</div></div></div></section>"
    )


# ---------------------------------------------------------------- shared fragments
def tool_rows(slugs=None):
    items = [t for t in TOOLS if not slugs or t[0] in slugs]
    lis = "".join(
        f'<li><a href="{{{{root}}}}tools/{s}.html"><span class="t-ico">{icon(ic)}</span>'
        f'<span class="t-name">{esc(name)}</span><span class="t-desc">{esc(desc)}</span></a></li>'
        for s, name, desc, ic, _ in items
    )
    return f'<ul class="tool-rows">{lis}</ul>'


GUIDES = []


def load_guides():
    for p in sorted((SRC / "guides").glob("*.html")):
        meta, body = read_src(p)
        meta["slug"] = p.stem
        meta["body"] = body
        GUIDES.append(meta)
    GUIDES.sort(key=lambda g: (CAT_ORDER.index(g["category"]) if g["category"] in CAT_ORDER else 99, g["title"]))


def guide_card(g):
    return (
        f'<a class="g-card" href="{{{{root}}}}guides/{g["slug"]}.html" data-cat="{esc(g["category"])}">'
        f'<span><span class="tag">{esc(g["category"])}</span></span><h3>{esc(g.get("h1") or g["title"])}</h3>'
        f'<p>{esc(g["description"])}</p><span class="g-meta">{g.get("read", 8)} min read</span></a>'
    )


def guide_cards(gs):
    return '<div class="guide-cards">' + "".join(guide_card(g) for g in gs) + "</div>"


def stage_cols():
    cols = []
    for label, cats, ic in STAGES:
        lis = "".join(
            f'<li><a href="{{{{root}}}}guides/{g["slug"]}.html">{esc(g.get("h1") or g["title"])}</a></li>'
            for g in GUIDES if g["category"] in cats
        )
        cols.append(f'<div class="stage"><h3>{esc(label)}</h3><ul>{lis}</ul></div>')
    return '<div class="stage-cols">' + "".join(cols) + "</div>"


VIDEOS = json.loads((SRC / "videos.json").read_text(encoding="utf-8"))


def video_cards(vs):
    out = []
    for v in vs:
        out.append(
            f'<div class="vid" data-cat="{esc(v["cat"])}"><div class="vid-frame">'
            f'<button class="vid-btn" type="button" data-id="{esc(v["id"])}" aria-label="Play: {esc(v["title"])}">'
            f'<img src="https://i.ytimg.com/vi/{esc(v["id"])}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"></button></div>'
            f'<h3>{esc(v["title"])}</h3><p>{esc(v["channel"])} on YouTube</p></div>'
        )
    return '<div class="video-grid">' + "".join(out) + "</div>"


def results_email_form(target):
    return (
        '<form class="js-form form-card" data-subject="Tool results request" data-results="' + target + '" '
        'data-keep data-ok="Sent. Check your inbox in a few minutes (and your spam folder, just in case)." novalidate style="margin-top:20px">'
        '<label for="res-email">Email me these results</label>'
        '<div class="inline-field"><input id="res-email" name="email" type="email" placeholder="you@example.com" required autocomplete="email">'
        '<button class="btn btn-sign" type="submit">Send</button></div>'
        '<input class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">'
        '<label class="check" style="margin-top:10px"><input type="checkbox" name="newsletter" value="Yes"> <span>Also send me the monthly 4Wheels brief</span></label>'
        '<p class="form-msg" role="status"></p></form>'
    )


CURRENCY_SELECT = (
    '<label class="cur"><span class="sr">Currency</span><select data-currency aria-label="Currency">'
    '<option value="USD">USD $</option><option value="CAD">CAD $</option><option value="GBP">GBP £</option>'
    '<option value="EUR">EUR €</option><option value="INR">INR ₹</option><option value="AUD">AUD $</option></select></label>'
)


def need_cta_box(need):
    head, text = NEED_CTA.get(need, NEED_CTA["loan"])
    return (
        f'<aside class="cta-box"><h3>{esc(head)}</h3><p>{esc(text)}</p>'
        f'<a class="btn btn-go" href="{{{{root}}}}get-matched.html?need={need}">Get matched — free</a></aside>'
    )


def expand(body):
    """Replace content placeholders inside page bodies."""
    body = body.replace("{{tool_rows}}", tool_rows())
    body = body.replace("{{stage_cols}}", stage_cols())
    body = body.replace("{{guide_cards_all}}", guide_cards(GUIDES))
    body = body.replace("{{guide_cards_featured}}", guide_cards([g for g in GUIDES if g["slug"] in (
        "how-to-buy-a-new-car", "how-auto-loans-work", "car-insurance-coverage-explained",
        "sell-your-car-for-the-most-money", "ev-ownership-guide", "car-maintenance-schedule")]))
    body = body.replace("{{videos_all}}", video_cards(VIDEOS))
    body = body.replace("{{videos_home}}", video_cards([v for v in VIDEOS if v["id"] in (
        "EqCGH-LL-p8", "zFbivYT1F-k", "gK2k7gMjqmY")]))
    body = body.replace("{{guide_count}}", str(len(GUIDES)))
    body = body.replace("{{tool_count}}", str(len(TOOLS)))
    body = body.replace("{{video_count}}", str(len(VIDEOS)))
    for m in re.findall(r"\{\{cta:([a-z]+)\}\}", body):
        body = body.replace("{{cta:" + m + "}}", need_cta_box(m))
    return body


# ---------------------------------------------------------------- builders
ORG_LD = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "4Wheels",
    "url": SITE,
    "logo": SITE + "assets/img/icon-512.png",
    "sameAs": [],
}


def build_static_pages():
    for p in sorted((SRC / "pages").glob("*.html")):
        meta, body = read_src(p)
        out = meta.get("path", p.name)
        ld_objs = []
        if out == "index.html":
            ld_objs.append({"@context": "https://schema.org", "@type": "WebSite", "name": "4Wheels", "url": SITE})
            ld_objs.append(ORG_LD)
        else:
            ld_objs.append(breadcrumb_ld([("Home", SITE), (meta.get("crumb", meta["title"]), canonical(out))]))
        if meta.get("faq"):
            ld_objs.append(faq_ld(meta["faq"]))
            body = body.replace("{{faq}}", faq_html(meta["faq"]))
        extra_js = ""
        if meta.get("tools_js"):
            extra_js = '<script src="{{root}}assets/js/tools.js?v=' + VERSION + '" defer></script>'
        render(out, title=meta["title"], description=meta["description"], content=expand(body),
               nav=meta.get("nav", ""), body_class=meta.get("body_class", ""), ld=jsonld(*ld_objs),
               extra_js=extra_js, robots=meta.get("robots", "index,follow"), priority=meta.get("priority", "0.6"),
               full_title=meta.get("full_title"))


def build_tools():
    for slug, name, desc, ic, key in TOOLS:
        ui_meta, ui = read_src(SRC / "pages" / "tools" / f"{slug}.html")
        ui = ui.replace("{{currency}}", CURRENCY_SELECT).replace("{{email_results}}", results_email_form("#results"))
        copy_path = SRC / "tools-copy" / f"{slug}.html"
        if copy_path.exists():
            cmeta, copy = read_src(copy_path)
        else:
            cmeta, copy = {"title": name, "h1": name, "description": desc, "intro": desc, "faq": []}, ""
        out = f"tools/{slug}.html"
        need = ui_meta.get("need", "loan")
        related = [g for g in GUIDES if slug in g.get("tools", [])][:3]
        related_html = ""
        if related:
            related_html = ('<section class="band band-alt"><div class="wrap"><div class="sec-row"><h2>Related guides</h2>'
                            '<a href="{{root}}guides/index.html">All guides</a></div>' + guide_cards(related) + "</div></section>")
        others = [t[0] for t in TOOLS if t[0] != slug and t[0] in ui_meta.get("see_also", [])] or [t[0] for t in TOOLS if t[0] != slug][:3]
        content = (
            sign_header(esc(cmeta.get("h1") or name), esc(cmeta.get("intro") or desc),
                        [("Home", "{{root}}index.html"), ("Tools", "{{root}}tools/index.html"), (name, None)])
            + '<section class="band-tight"><div class="wrap">' + ui
            + '<p class="notice">Results are estimates for planning only and are not an offer of credit, insurance or a valuation. '
              'Choose your currency in the tool; figures use simple standard formulas explained below.</p></div></section>'
            + '<section class="tool-after"><div class="wrap article-layout"><article><div class="prose">' + copy + "</div>"
            + need_cta_box(need) + faq_html(cmeta.get("faq", []))
            + '</article><aside class="toc-aside"><div class="side-cta"><strong>More free tools</strong>'
            + "".join(f'<p><a href="{{{{root}}}}tools/{o}.html" style="color:var(--lane)">{esc(TOOL_BY_SLUG[o][1])}</a></p>' for o in others)
            + "</div></aside></div></section>" + related_html
        )
        ld = jsonld(
            {"@context": "https://schema.org", "@type": "WebApplication", "name": cmeta.get("h1") or name,
             "url": canonical(out), "applicationCategory": "FinanceApplication" if key in ("payment", "afford", "lease", "refi", "tco") else "UtilitiesApplication",
             "operatingSystem": "Any", "description": cmeta.get("description", desc),
             "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}},
            breadcrumb_ld([("Home", SITE), ("Tools", SITE + "tools/"), (name, canonical(out))]),
            faq_ld(cmeta.get("faq", [])),
        )
        render(out, title=cmeta.get("title", name), description=cmeta.get("description", desc), content=content,
               nav="tools", ld=ld, extra_js='<script src="{{root}}assets/js/tools.js?v=' + VERSION + '" defer></script>',
               priority="0.8")


def build_guides():
    for i, g in enumerate(GUIDES):
        out = f"guides/{g['slug']}.html"
        body = g["body"]
        h2s = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body)
        toc = "".join(f'<li><a href="#{hid}">{re.sub(r"<.*?>", "", txt)}</a></li>' for hid, txt in h2s)
        need = g.get("need", "loan")
        head, text = NEED_CTA.get(need, NEED_CTA["loan"])
        tools = [t for t in g.get("tools", []) if t in TOOL_BY_SLUG]
        tool_links = "".join(f'<p><a href="{{{{root}}}}tools/{t}.html" style="color:var(--lane)">{esc(TOOL_BY_SLUG[t][1])}</a></p>' for t in tools)
        same = [x for x in GUIDES if x["category"] == g["category"] and x["slug"] != g["slug"]]
        rest = [x for x in GUIDES if x not in same and x["slug"] != g["slug"]]
        related = (same + rest[i % max(1, len(rest)):] + rest)[:3]
        content = (
            sign_header(esc(g.get("h1") or g["title"]), esc(g["description"]),
                        [("Home", "{{root}}index.html"), ("Guides", "{{root}}guides/index.html"), (g["category"], None)])
            + '<section class="band-tight"><div class="wrap article-layout"><article>'
            + f'<div class="byline"><span>By <strong>4Wheels Editorial Team</strong></span><span>Updated <time datetime="{TODAY.isoformat()}">{fmt_date(TODAY)}</time></span>'
            + f'<span>{g.get("read", 8)} min read</span><span class="tag">{esc(g["category"])}</span></div>'
            + '<div class="prose">' + body + "</div>" + faq_html(g.get("faq", []))
            + '<div class="author-box"><span class="av">4W</span><p><strong>About this guide.</strong> Written and fact-checked by the 4Wheels editorial team against primary sources such as NHTSA, the EPA, the CFPB and state agencies, and reviewed whenever rules change. '
              'It is general information, not financial, legal or mechanical advice. <a href="{{root}}about.html#editorial">Our editorial standards</a>.</p></div>'
            + '</article><aside class="toc-aside"><nav class="toc" aria-label="On this page"><p>On this page</p><ol>' + toc + "</ol></nav>"
            + f'<div class="side-cta"><strong>{esc(head)}</strong><p>{esc(text)}</p><a class="btn btn-go btn-block btn-sm" href="{{{{root}}}}get-matched.html?need={need}">Get matched</a></div>'
            + (f'<div class="side-cta"><strong>Run the numbers</strong>{tool_links}</div>' if tool_links else "")
            + "</aside></div></section>"
            + '<section class="band band-alt"><div class="wrap"><div class="sec-row"><h2>Keep reading</h2><a href="{{root}}guides/index.html">All guides</a></div>'
            + guide_cards(related) + "</div></section>"
        )
        ld = jsonld(
            {"@context": "https://schema.org", "@type": "Article", "headline": g.get("h1") or g["title"],
             "description": g["description"], "datePublished": TODAY.isoformat(), "dateModified": TODAY.isoformat(),
             "mainEntityOfPage": canonical(out), "image": SITE + "assets/img/og-image.png",
             "author": {"@type": "Organization", "name": "4Wheels Editorial Team", "url": SITE + "about.html"},
             "publisher": {"@type": "Organization", "name": "4Wheels", "logo": {"@type": "ImageObject", "url": SITE + "assets/img/icon-512.png"}}},
            breadcrumb_ld([("Home", SITE), ("Guides", SITE + "guides/"), (g.get("h1") or g["title"], canonical(out))]),
            faq_ld(g.get("faq", [])),
        )
        render(out, title=g["title"], description=g["description"], content=content, nav="guides", ld=ld,
               og_type="article", priority="0.8", body_class="is-article")


def build_indexes():
    cats = [c for c in CAT_ORDER if any(g["category"] == c for g in GUIDES)]
    chips = '<ul class="chips" data-filter="#guide-grid"><li><button class="chip" type="button" data-cat="all" aria-pressed="true">All</button></li>' + "".join(
        f'<li><button class="chip" type="button" data-cat="{c}" aria-pressed="false">{c}</button></li>' for c in cats) + "</ul>"
    content = (
        sign_header("Car guides, written plainly", f"{len(GUIDES)} in-depth guides for buying, financing, insuring, maintaining and selling a car. No fluff, real numbers.",
                    [("Home", "{{root}}index.html"), ("Guides", None)])
        + '<section class="band-tight"><div class="wrap">' + chips + '<div id="guide-grid">' + guide_cards(GUIDES) + "</div></div></section>"
        + '<section class="band band-alt"><div class="wrap">' + "<h2>Do the maths alongside</h2><p class=\"muted\">Every guide links to the calculator that answers its question.</p>" + tool_rows() + "</div></section>"
    )
    render("guides/index.html", title="Car buying, ownership and selling guides",
           description="Plain-English car guides: buying new and used, auto loans, leasing, insurance coverage, maintenance, EVs, off-roading, selling and shipping.",
           content=content, nav="guides", ld=jsonld(breadcrumb_ld([("Home", SITE), ("Guides", SITE + "guides/")])), priority="0.9")

    content = (
        sign_header("Free car calculators and lookups", f"{len(TOOLS)} tools for the money and maintenance decisions every driver faces. No sign-up, no credit check, results instantly.",
                    [("Home", "{{root}}index.html"), ("Tools", None)])
        + '<section class="band-tight"><div class="wrap">' + tool_rows() + "</div></section>"
        + '<section class="band band-alt"><div class="wrap feature-split"><div><h2>Ready for real numbers?</h2>'
          "<p class=\"muted\">Calculators give you a target. Real offers from lenders, insurers and buyers tell you what you'll actually pay — or get.</p>"
          '<a class="btn btn-go" href="{{root}}get-matched.html">Get matched — free</a></div>'
          '<div class="panel"><h3>Built on public data</h3><p>The VIN decoder and recall check query the U.S. National Highway Traffic Safety Administration\'s free public databases directly from your browser. '
          "Money calculators use the same standard amortization formulas lenders use, explained on each page.</p></div></div></section>"
    )
    render("tools/index.html", title="Free car calculators: payment, affordability, lease vs buy, VIN and more",
           description="Free car tools: payment and affordability calculators, lease vs buy, refinance, total cost of ownership, EV vs gas, VIN decoder, recall check, tire size and more.",
           content=content, nav="tools", ld=jsonld(breadcrumb_ld([("Home", SITE), ("Tools", SITE + "tools/")])), priority="0.9")


def write_all():
    for out, page in PAGES:
        dest = ROOT / out
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(page, encoding="utf-8")
    urls = "".join(
        f"<url><loc>{canonical(p)}</loc><lastmod>{TODAY.isoformat()}</lastmod><priority>{pr}</priority></url>\n"
        for p, pr in sorted(SITEMAP, key=lambda x: (-float(x[1]), x[0]))
    )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n",
        encoding="utf-8")
    print(f"Built {len(PAGES)} pages, {len(GUIDES)} guides, {len(TOOLS)} tools.")


if __name__ == "__main__":
    load_guides()
    build_static_pages()
    build_tools()
    build_guides()
    build_indexes()
    write_all()
