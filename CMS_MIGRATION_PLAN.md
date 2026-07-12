# HKSI CMS Content Architecture — JSON + Decap CMS

## Status

The website content architecture is fully JSON-based. There is no Markdown
in the runtime content path. The current UI, CSS classes, layout structure,
responsive behavior, PWA files, and visual system are unchanged. Editable
content lives as JSON under `content/` and is rendered client-side by
`assets/js/main.js`, which fetches each JSON file and injects the markup
into the existing HTML shell (`index.html`, `project.html`, `404.html`,
`offline.html`).

Decap CMS is now configured (`admin/config.yml`, `admin/index.html`) to
edit those same JSON files directly. **It is not deployed** — no backend
auth (Netlify Identity / Git Gateway or GitHub OAuth) has been wired up,
and the site has not been pushed anywhere. The admin folder is present in
the file tree only, ready for the next deployment step.

## Folder Structure

```text
/
├── index.html                  # Homepage shell (data-page="home")
├── project.html                # Portfolio page shell (data-page="project")
├── 404.html                    # Error page shell (data-page="not_found")
├── offline.html                # PWA offline fallback shell (data-page="offline")
├── manifest.json                # PWA manifest (unchanged)
├── service-worker.js            # PWA cache — precaches all JSON content files
├── robots.txt
├── sitemap.xml
├── README.md
├── LICENSE
├── CMS_MIGRATION_PLAN.md        # This file
├── admin/
│   ├── index.html                # Decap CMS entry point
│   └── config.yml                # Decap CMS collections config (edits JSON)
├── content/                      # ALL editable content — JSON only
│   ├── settings.json             # Site identity, logos, nav, footer nav
│   ├── seo.json                  # Per-page metadata, OG/Twitter, JSON-LD schema
│   ├── hero.json
│   ├── about.json
│   ├── vision.json
│   ├── mission.json
│   ├── why.json
│   ├── statistics.json
│   ├── contact.json              # Includes the contact form field labels
│   ├── cta.json
│   ├── errors.json               # 404 + offline page copy
│   ├── services.json             # Services section heading
│   ├── projects.json             # Projects section heading, filters, related items
│   ├── gallery.json              # Gallery section heading
│   ├── services/                 # One JSON file per service card
│   │   ├── supply-material.json
│   │   ├── laboratory-testing.json
│   │   └── survey-measurement.json
│   ├── projects/                 # One JSON file per project/portfolio entry
│   │   ├── laboratory-material.json
│   │   ├── material-supply.json
│   │   ├── survey-measurement.json
│   │   └── field-documentation.json
│   ├── gallery/                  # One JSON file per gallery image
│   │   ├── field-laboratory.json
│   │   ├── material-support.json
│   │   ├── survey-work.json
│   │   └── engineering-documentation.json
│   ├── clients/section.json      # Client sector list
│   ├── testimonials/section.json # Trust / quote cards
│   └── legality/section.json     # Legality checklist
└── assets/
    ├── css/
    ├── js/
    │   └── main.js                # Content loader + all page rendering + interactions
    ├── img/
    ├── fonts/
    └── documents/
```

## Content Loader (`assets/js/main.js`)

- `contentPaths` maps every logical content key to its `content/*.json`
  path (single files and arrays of files for repeatable collections).
- `loadContentFile()` does a plain `fetch(path).then(r => r.json())` —
  no Markdown/frontmatter parser is present anywhere in the codebase.
- `loadContent()` fetches everything in parallel with `Promise.all`, then
  sorts `services`, `projects`, and `gallery` by their `order` field.
- `setSeo()` sets `document.title`, meta description, canonical link,
  Open Graph tags, Twitter Card tags, and the JSON-LD `<script data-schema>`
  block from `content/seo.json` — per page (`home` vs `project`).
- `renderBrand/renderNavigation/renderFooter/renderHero/renderHome/
  renderProject/renderError/renderCta` build the exact same HTML markup
  and CSS classes the site already used, just from JSON data instead of
  hardcoded strings.
- All interactive behavior (mobile menu, scroll reveal, animated counters,
  lightbox, project filter, WhatsApp contact form, back-to-top, service
  worker registration) is untouched.

## PWA

- `manifest.json` is unchanged.
- `service-worker.js` precaches `index.html`, `project.html`, `404.html`,
  `offline.html`, all CSS/JS/image assets, and **every `content/*.json`
  file**, so the site (including its content) still works offline.

## Decap CMS Configuration (`admin/config.yml`)

- **Backend**: `git-gateway` on the `main` branch (swap for GitHub OAuth
  if deploying to Cloudflare Pages instead of Netlify).
- **Media**: uploads go to `assets/img/uploads`.
- One `pages` collection with 17 **file** entries — one per singleton
  JSON file (`settings`, `seo`, `hero`, `about`, `vision`, `mission`,
  `why`, `statistics`, `contact`, `services_section`, `projects_section`,
  `gallery_section`, `clients`, `testimonials`, `legality`, `cta`,
  `errors`) — every field in each JSON file is mapped, including nested
  objects (hero buttons, contact form, SEO per-page blocks, error page
  buttons) and lists.
- Three **folder** collections — `services`, `projects`, `gallery` — each
  pointed at its `content/<name>/` folder with `extension: json`,
  `format: json`, so editors can add/remove/reorder cards without
  touching code. `projects.category` is a constrained `select` matching
  the filter values used by `content/projects.json`.
- `format: "json"` is set explicitly on every collection/file so Decap
  reads and writes plain JSON — never Markdown or YAML frontmatter.

## What Changed From the Prior State

- `content/decap-config.proposal.yml` (draft, partial field coverage) was
  replaced by the completed `admin/config.yml`, with previously-missing
  fields added (hero buttons, full `settings.json` nav arrays and logo
  variants, full `contact.json` including the form block, full `seo.json`
  per-page + schema objects, full `errors.json` button objects).
- `admin/index.html` was added as the standard Decap entry point.
- All 28 files under `content/**/*.json` were re-saved as clean UTF-8
  (no BOM), LF line endings, consistently indented JSON. No values were
  changed except one corrupted "©" byte sequence in `settings.json`
  (mis-encoded from a prior Windows save) which was restored correctly.
- No HTML, CSS, or JS outside of `assets/js/main.js`'s already-existing
  JSON-based loader was touched. No visual/layout change was made.

## Remaining Steps Before Going Live (not done here, per "do not deploy")

1. Wire up authentication: Netlify Identity + Git Gateway, or GitHub OAuth
   for a Cloudflare Pages workflow.
2. Run editorial QA in the Decap UI: confirm every collection saves valid
   JSON and the live site re-fetches it correctly.
3. Browser QA: homepage rendering, project filter, gallery lightbox,
   contact form WhatsApp flow, PWA offline behavior, mobile menu.
4. Deploy.
