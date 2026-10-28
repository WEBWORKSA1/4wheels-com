# 4Wheels.com — phase-wise build prompts

Copy each phase into an AI builder (or hand it to a developer) in order. Each phase is self-contained and ends with a definition of done. The live repo already implements Phases 1–7; Phase 8 is the expansion roadmap.

**Fixed inputs for every phase**
- Domain: 4Wheels.com. Concept: the car-ownership command center — free calculators and guides (traffic), multi-vertical "Get matched" requests (profit).
- AdSense publisher ID `ca-pub-6620975821265271`; this exact tag goes in the `<head>` of every page:
  `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>`
- One inbox receives every form. It must never appear as text anywhere — not in HTML, not in README, not in `mailto:` markup. Store it encoded in JavaScript and assemble it only at submit or click time.
- Top of every page: "Interested in this website, the domain name, sponsorship, advertising or a partnership? Contact us" linking to `https://web.works/contact`.
- Hosting: GitHub Pages, free plan, static files only. Use relative links so the site works at `user.github.io/repo/` and on the custom domain.

---

## Phase 1 — Brand, design system and shell

> Create a static site for 4Wheels.com, a car-ownership hub. Visual identity comes from road signage: guide-sign green `#0A6847` (deep `#07513A`), lane-line amber `#F5B700`, asphalt `#1F262A`, cool paper `#F3F5F4`, ink `#1B2327`, slate `#4A585E`, line `#D5DCD9`. Typefaces: Overpass (an open-source Highway Gothic interpretation) for UI and display; Source Serif 4 for long-form reading. Signature element: a green guide-sign panel with an inset white border, used for the home hero and every page header. Calculator results sit in an asphalt "instrument cluster" panel with amber tabular numerals. Buttons: amber primary with asphalt text, green secondary, outlined ghost.
> Build one shared layout: the sponsorship/contact strip, a sticky header (logo, Tools mega-menu in three groups, Guides, Videos, Contests, More menu, amber "Get matched" button), a footer with newsletter signup, four link columns, a referral-service disclaimer and a trademark line, and a cookie notice (Essential only / Accept all; "Essential only" requests non-personalised ads). Include the AdSense tag and `google-adsense-account` meta on every page.
> Write a small build script that wraps page fragments in the layout, computes relative paths, adds canonical, Open Graph and JSON-LD, and generates `sitemap.xml`.
> **Done when:** every page shares one layout, passes keyboard navigation with visible focus, has no horizontal scroll at 390px, and respects reduced motion.

## Phase 2 — Calculators and lookups

> Build 12 tools as `tools/<slug>.html`, each with an input deck, a live results panel, a currency selector (USD, CAD, GBP, EUR, INR, AUD), an "Email me these results" form that sends the results as an auto-reply, a next-step CTA into the lead funnel, a 350–500-word explainer (how to use, how it's calculated with a worked example, tips) and an FAQ with FAQPage schema:
> car payment (tax on price minus trade-in, fees, owed balance, amortization by year); affordability (20/4/10 and a flexible 15%/60-month mode); lease vs buy over the lease window; refinance (rolled-in fees, verdict that warns when a longer term raises total cost); total cost of ownership (depreciation, fuel, insurance, maintenance rising 10%/yr, fees, interest); fuel and trip cost (mi/km, mpg or L/100 km, split); EV vs gas (blended home/public charging, payback, CO₂ at 8.887 kg/gal); maintenance planner (powertrain, severe conditions, next 12 months); depreciation estimator; tire size comparison with speedometer error; VIN decoder (check-digit validation plus NHTSA vPIC decode); recall check (NHTSA recalls API with model suggestions).
> **Done when:** every tool computes on load with sensible defaults, never shows NaN, and degrades gracefully if a public API is unreachable.

## Phase 3 — Lead engine

> Build `get-matched.html`: a four-step form (Need → Vehicle → Details → Contact) with a road-style progress bar. Step 1 uses large tiles for insurance, auto loan, refinance, sell/trade, ship, extended warranty, best new-car price and fleet; picking one auto-advances. Steps 2–3 show only the fields for the chosen need (for example credit band and amount for loans; current APR and balance for refinance; insured status, drivers and incidents for insurance; condition and payoff for selling; route, date and open/enclosed for shipping). Contact comes last; phone is optional. Add a TCPA-style consent checkbox (share with matched partners; contact by email/phone/text including automated means; not a condition of purchase; revocable) and an optional newsletter opt-in. Prefill from URL parameters (`?need=sell&year=2019&make=Toyota&model=RAV4&zip=10001`). Submit by AJAX to a form backend that emails the hidden inbox with the subject "New lead: <need> (<ZIP>)" plus page URL and timestamp. Add a honeypot. Side panel: about two minutes, no credit check, shared only where it helps, free and no obligation, not-a-lender disclosure.
> Route every calculator, guide and home-page exit to this page with the right `need` value.
> **Done when:** each need path validates its own fields only, the success state explains next steps, and test submissions arrive with every field.

## Phase 4 — Content for traffic and AdSense approval

> Publish at least 16 original guides of 1,100–1,500 words in `guides/`, each with a byline ("4Wheels Editorial Team"), updated date, reading time, table of contents, one key-takeaway callout, one checklist, one CTA into the funnel, links to the matching tools, 1–3 links to primary sources (NHTSA, IIHS, EPA, CFPB, FTC, FMCSA, NAIC), four FAQs with schema, and a "bottom line". Topics: buying new, used-car checklist, auto loans, refinancing, lease vs buy, insurance coverage, lowering premiums, selling for the most money, car shipping, maintenance schedule, tires, extended warranties, after an accident, EV ownership, off-road basics, winter driving, dashboard warning lights, car batteries.
> Build a filterable guides index and a videos page of 20 verified, embeddable YouTube how-tos that load only on click via `youtube-nocookie.com`.
> **Done when:** no thin pages, every guide is reachable within two clicks of the home page, and all figures in worked examples are computed.

## Phase 5 — Community and monetization pages

> Contests: a monthly skill contest (four categories, $250/$100/$50 plus a readers' pick), live countdown to month-end, entry form with link to the entry, 18+ and rules checkboxes, and full official rules (no purchase necessary, eligibility, judging weights, winner notification, licence, void where prohibited).
> Careers: six remote roles (writer, video creator, certified technician reviewer, SEO strategist, partnerships/lead sales manager, community lead) and an application form.
> Support: where money goes (operations, contests and prizes, hiring, promotion), three monthly tiers, and a pledge form that promises a secure payment link by email (never collect card data in a form).
> Advertise: sponsored tool, guide hub, contest month, newsletter, lead partnerships by vertical and territory, and website/domain inquiries linking to web.works/contact; advertising standards; inquiry form.
> **Done when:** every form submits to the hidden inbox with a clear subject line.

## Phase 6 — Compliance and AdSense readiness

> Write: About (how we make money, editorial standards), Contact (form plus an "Email the team" link that assembles the address only on click), Privacy (Google's required third-party cookie language with links to Ads Settings, aboutads.info and Google's partner-sites page; partner sharing; GDPR, CCPA, PIPEDA, DPDP rights; retention; children), Terms, Cookie policy, Disclaimer and advertiser disclosure (not a lender, insurer, agency, dealer, broker or carrier), Trademark and copyright notice (descriptive use of "4Wheels", no claim to "four wheels", no affiliation with similarly named businesses such as the owner of the 4WHEEL PARTS registration, third-party marks belong to their owners, notice-and-takedown process).
> Add `ads.txt` (`google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0`), `robots.txt` with the sitemap, a web manifest, favicon, app icons and a 1200×630 share image, and a 404 page.
> **Done when:** a grep of the repository finds the inbox nowhere, and every page has a unique title, meta description, canonical URL and structured data.

## Phase 7 — Ship on GitHub Pages

> Push to `WEBWORKSA1/4wheels-com`, add `.nojekyll`, and publish with GitHub Pages from the root of the default branch. Verify the live URL, all forms (the first submission triggers a one-time activation email from the form service — click it), and the AdSense tag on every page. Then connect 4Wheels.com: add a `CNAME` file containing `4wheels.com`; set DNS A records to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153 and a `www` CNAME to `webworksa1.github.io`; enable "Enforce HTTPS"; apply to AdSense with the custom domain.

## Phase 8 — Expansion roadmap (after approval)

> 1. Programmatic make/model/year hubs (specs, fuel economy from EPA data, recalls, safety ratings, maintenance schedule, ownership cost) — the biggest long-tail traffic lever.
> 2. Lead routing: send the funnel to a webhook (Google Sheets, Airtable or a CRM) with consent timestamp and page; add partner-specific delivery and caps.
> 3. Monthly rate and price index pages and "Best X for 2027" lists with a published method, to earn links.
> 4. A car-finder quiz and side-by-side compare tool to raise pages per session.
> 5. Owner reviews and real-world MPG submissions (moderated) for fresh, unique content.
> 6. Google-certified consent management for EEA/UK traffic, privacy-friendly analytics, and manual AdSense units between tool results and explainers (never above forms).
> 7. Localized hubs for Canada, the UK and India (insurance and loan rules, units and currency).
