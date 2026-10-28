# 4Wheels.com — car calculators, guides and quotes

The car-ownership command center: free calculators and plain-English guides bring the traffic (monetized with Google AdSense); a multi-vertical "Get matched" request form turns it into revenue (insurance, loans, refinancing, selling, shipping, warranties, dealer quotes, fleet). Plus a curated video library, monthly contests, careers, reader support and sponsorship pages.

- **Static site, GitHub Pages free plan.** Plain HTML/CSS/JS, `.nojekyll`, relative links — works at `webworksa1.github.io/4wheels-com/` and on 4wheels.com without changes.
- **Edit in `_src/`, then run `python3 build.py`.** Pages are fragments with a `<!--META {...} -->` header wrapped in `_src/layout.html`. The build writes the HTML at the repo root and regenerates `sitemap.xml`.
  - `_src/pages/` — home, funnel, contests, careers, support, advertise, about, contact, legal pages
  - `_src/pages/tools/` — calculator interfaces; `_src/tools-copy/` — the explainer text under each tool
  - `_src/guides/` — long-form guides; `_src/videos.json` — the video library
- **Styles** `assets/css/style.css` · **Site script** `assets/js/main.js` (navigation, consent, forms, videos, countdown, funnel) · **Calculators** `assets/js/tools.js`.
- **Forms** post by AJAX to FormSubmit. The destination inbox is encoded in `main.js` and never appears in the markup. The first submission sends a one-time activation email to the inbox; click it once and every form starts delivering.
- **AdSense:** the tag and `google-adsense-account` meta are on every page; `ads.txt` is at the root. Auto ads are the default; add manual units later between tool results and explainers.

## Publish
GitHub Pages serves the `gh-pages` branch. To publish a change: edit `_src/`, run `python3 build.py`, commit everything to `main`, then merge `main` into `gh-pages`. Images are SVG so the whole site stays plain text.

**Move to 4wheels.com** (needed for AdSense approval):
1. Add a file named `CNAME` containing `4wheels.com`.
2. DNS: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; CNAME `www` → `webworksa1.github.io`.
3. Settings → Pages → tick **Enforce HTTPS** once the certificate is issued.

See `BUILD-PROMPTS.md` for the phase-wise build prompts and `RESEARCH.md` for the idea selection, revenue model and the 41-site benchmark.

Trademark: "4Wheels" is used as a domain name and descriptive site identifier; no exclusive rights are claimed and there is no affiliation with similarly named businesses. See `trademark.html`.
