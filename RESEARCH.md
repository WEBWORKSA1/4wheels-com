# 4Wheels.com — idea selection, revenue model and competitor benchmark

Research date: October 28, 2026.

## 1. The verdict

**Build 4Wheels.com as the car-ownership command center: free calculators and plain-English guides as the traffic engine, and a multi-vertical "Get matched" request engine as the profit engine.**

AdSense is the floor. Lead generation is the business. The domain's meaning ("four wheels" = any car) fits a whole-lifecycle hub far better than any single niche, and every stage of ownership — buy, finance, insure, maintain, sell, ship — carries a monetizable request.

## 2. Ideas considered

| Idea | Traffic ceiling | Ad value (CPC) | Lead value | Build cost | Moat | Trademark risk | Verdict |
|---|---|---|---|---|---|---|---|
| **Car-ownership hub: tools + guides + lead engine** | Very high (evergreen money questions) | High (auto ~$5; insurance $30–80) | High (insurance, refinance, loans) | Low (static site) | Tools + content depth + partner network | Low (descriptive use, no parts retail) | **Chosen** |
| Off-road / 4x4 parts & accessories store | Medium | Low–medium | Low (affiliate 3–8%) | High (catalog, fulfilment) | Weak | **High** — 4WHEEL PARTS is a live U.S. registration (Reg. 2,937,233, class 35, auto parts retail) | Rejected |
| Used-car listings marketplace | High | Medium | Medium | Very high (two-sided cold start, dealer feeds) | Strong once built, but CarGurus/Autotrader own it | Low | Rejected |
| Car news and reviews | High | Medium | None built in | High (press fleet, speed) | Weak, commoditized | Low | Rejected |
| ATV / quad ("4-wheeler") niche | Low–medium | Low | Low | Low | Weak | Medium ("4 WHEELERS" marks exist) | Rejected |

Off-road stays in as a content vertical (4x4 guide, tire-size tool, videos) — it builds audience without selling parts under the name.

## 3. Revenue model (assumptions are labelled; replace with real data after launch)

**Market data (sourced):**
- Advertiser CPCs: "car insurance quotes"-type terms run about $30–80 per click (groas.com, 2026 Google Ads benchmarks); big car-insurer CPCs $50–90; automotive average around $5 (newormedia.com).
- Finance & insurance cost per lead on Google Ads: $74.44 vs $66.69 all-industry average (WordStream via webtonic.io, 2026).
- What buyers pay per lead: auto insurance shared $2–12 (Phonexa) to $15–25, exclusive $55–75 (LeadGen Economy), live transfers $20–150 (Elevarus); dealer finance $75–150+ and special finance $150–300+ (Autocorp, vendor estimate); warranty pay-per-call $20–55 (CallScaler); auto transport $1–5 shared (Super Dispatch).
- What affiliate networks pay publishers: $5.60/lead (Car Loan Pal), $9.60/lead (myAutoloan), $7.80/lead (Endurance), $12/lead (ForeverCar) — all via FlexOffers.

**Month-12 scenario (assumptions):** 50,000 sessions/month, 2 pages per session, 1.5% of sessions submit a request.

| Stream | Maths | Monthly |
|---|---|---|
| AdSense | 100,000 pageviews × $8–20 page RPM (assumption for US auto/finance content) | $800–2,000 |
| Leads via affiliate networks | 750 requests × $5–12 | $3,750–9,000 |
| Leads sold direct (insurance exclusive, refinance) | 750 × blended $25–40 | $18,750–30,000 |
| Sponsorships + support | 1–3 sponsors, reader pledges | $500–3,000 |

Lead gen is 4–15× AdSense on the same traffic. Priorities: insurance (deepest buyer market, highest volume), refinance (highest value per qualified lead), sell-my-car (high intent), warranty (phone-closed, pay-per-call), loans/dealer. Transport is lowest value — keep it for completeness, don't optimize for it.

## 4. Competitor benchmark — 41 sites

### Marketplaces and pricing (12)
Edmunds, Kelley Blue Book, Cars.com, CarGurus, Autotrader, TrueCar, CarEdge, iSeeCars, Autolist, AutoTempest, Carfax, CarsDirect.
- Value lookup as the hero (VIN / plate / year-make-model tabs, live 17-character counter).
- Car-first, contact-last lead forms in 3–4 steps with a progress bar.
- Deep calculators with amortization; every result leads to a next step (budget → loan quote, value → offers).
- Mega-menu organized by ownership stage; FAQ with schema under every tool.
- Reassurance microcopy at the button: free, no obligation, no credit impact, about two minutes.
- "Not a lender" disclosure (CarsDirect); advertising disclosure beside tools (CarEdge); open partner fees (AutoTempest).

### Finance, insurance, selling, transport, warranty, repair (14)
NerdWallet, Bankrate, The Zebra, Insurify, Jerry, Carvana, Peddle, RepairPal, YourMechanic, Montway, Endurance, CarShield, Caribou, LendingTree.
- One field first (ZIP or VIN), one question per screen with tap tiles and auto-advance.
- Show value before asking for contact details; optional phone with an anti-spam pledge.
- TCPA-style consent under submit: automated calls/texts, not a condition of purchase, revocable.
- Same verb-first CTA repeated everywhere ("Check your rate").
- Risk reversal and specific, footnoted savings claims.

### Media, safety, EV, enthusiast, off-road (15)
MotorTrend, Car and Driver, Consumer Reports, IIHS, NHTSA Recalls, FuelEconomy.gov, InsideEVs, PlugShare, Hagerty, Bring a Trailer, Cars & Bids, Expedition Portal, onX Offroad, Autoblog, The Drive.
- Free tools on public data (NHTSA vPIC and recall APIs, EPA fuel data) wrapped in 800+ words of explanation.
- Trust layer: bylines, methodology, editorial policy, cited primary sources.
- Newsletter mid-article and in the footer; contests tied to newsletter sign-up with real rules.
- Video near the top of how-tos; clean ad layout with lead forms visually distinct from ads.
- Long-tail engines to add next: make/model/year hubs, "Best X for 2027" lists, owner reviews.

## 5. What was built from this

| Pattern | Where it lives |
|---|---|
| Intent "exits" hero for every ownership stage | Home page guide sign |
| Car-first 4-step lead funnel, tiles, progress road, conditional fields, TCPA consent, URL prefill | `get-matched.html` |
| 12 calculators and lookups, each with a next-step CTA, formula explainer and FAQ schema | `tools/` |
| VIN decoder and recall check on NHTSA public APIs | `tools/vin-decoder.html`, `tools/recall-check.html` |
| "Email me these results" capture with auto-reply | Every calculator |
| Original long-form guides with bylines, sources, Article + FAQ schema | `guides/` |
| Curated, verified YouTube library with click-to-load player | `videos.html` |
| Monthly skill contest with official rules and countdown | `contests.html` |
| Hiring, reader support and sponsorship / lead-partner pages | `careers.html`, `support.html`, `advertise.html` |
| Full disclosure set (not-a-lender, advertiser, privacy with AdSense language, cookies, terms, trademark) | Legal pages |

## 6. Trademark landscape
- **4WHEEL PARTS** — U.S. Reg. No. 2,937,233, live, class 35 (retail/online automotive parts and accessories). Avoid selling parts or accessories under the 4Wheels name.
- Several **4 WHEELERS** filings exist (markinton.com listings).
- "4Wheels" on this site is a domain identifier and descriptive term; the trademark page disclaims exclusive rights and affiliation.

## Sources
- groas.com/post/google-ads-cpc-cpa-benchmarks-by-industry-2026-7e112
- newormedia.com/blog/top-10-highest-paying-adsense-niches/
- webtonic.io/blog/insurance-google-ads-statistics
- phonexa.com/blog/insurances-leads-cost/
- leadgen-economy.com/blog/exclusive-vs-shared-leads-comparison/
- elevarus.com/auto-insurance-leads-buyer-guide/
- autocorp.ai/resources/articles/how-much-do-car-dealers-typically-pay-for-leads
- flexoffers.com affiliate program pages (Car Loan Pal, myAutoloan, Endurance, ForeverCar)
- callscaler.com/marketplace/auto-warranty
- superdispatch.com/blog/buying-auto-transport-leads-how-it-works-and-whether-its-right-for-you/
- trademarks.justia.com/764/88/4wheel-76488942.html
- markinton.com (4 WHEELERS filings)
