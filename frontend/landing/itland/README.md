# IT Land Iraq — company page

A single-page company site for **IT Land Iraq**, served at `/itland/` alongside the
main Wazzifni landing page (`/`) and the course portal (`/course/`).

It uses the same stack and the same file layout as `landing/web`: hand-written
semantic HTML, ES modules with no build step, and one CSS file per section
imported from `css/main.css`. There is no bundler, no framework and no install
step — the directory is deployed exactly as it sits in the repo.

> **Why no TypeScript?** The whole `frontend/landing` tree ships as static files
> straight from the repo to nginx; adding TS would mean adding a build step and a
> CI stage for one page. Types are expressed as JSDoc `@typedef`s instead
> (`js/data/projects.js`, `js/data/transform.js`), which editors type-check the
> same way without changing how the page is deployed.

## Layout

```
itland/
├── index.html                     all page copy (hero, about, services, contact)
├── css/
│   ├── main.css                   design tokens, base, buttons, toasts, @imports
│   ├── components/*.css           one file per section
│   └── responsive.css             motion/small-screen/forced-colors/print only
├── js/
│   ├── main.js                    entry point; wires the components together
│   ├── components/                behaviour
│   ├── data/                      content + transformation
│   └── utils/                     shared helpers
└── assets/images/projects/*.png   project logos copied from the portfolio
```

## Components

| File | Responsibility |
| --- | --- |
| `js/main.js` | Instantiates the chrome, starts the reveal observers, lazily loads the inquiry form, handles `Escape` and online/offline. |
| `js/components/navigation.js` | Mobile drawer (open/close, scroll lock, focus-safe) **and** the scroll-spy that marks the nav link of the section being read (`aria-current` + `.is-active`). |
| `js/components/scroll-effects.js` | Navbar shadow, reading-progress bar and back-to-top, all from one passive scroll listener batched into a single rAF. |
| `js/components/projects.js` | `ProjectsGallery` — owns the whole projects section: skeletons → cards, filter chips, sort select, empty state, error state with retry, broken-image fallback, and a polite live region announcing result counts. |
| `js/components/contact-form.js` | `ContactForm` — Arabic validation messages, `aria-invalid` wiring, and handing the composed message to WhatsApp or the mail client. |
| `js/utils/observers.js` | Reveal-on-scroll (`.rv` → `.rv.show`), with `[data-rv-group]` containers revealed as a unit. |
| `js/utils/dom.js` | `escapeHtml`, `safeUrl`, `prefersReducedMotion`. |
| `js/utils/toast.js`, `js/utils/scroll-lock.js` | Transient messages and iOS-safe body scroll lock. |

`observers.js`, `toast.js` and `scroll-lock.js` are deliberate copies of their
counterparts in `landing/web/js/utils/`. Each landing sub-site is served from its
own URL prefix and must resolve its own modules, so they are not shared across
directories.

## Project data

The gallery renders `js/data/projects.js`, which is a **mirror of the portfolio's
source of truth**:

```
SamerAlHamwi-Portfolio-main/src/app/core/data/portfolio-data.ts → projects[]
```

`name`, `image`, `type`, `tags`, `publishUrl`, `playStoreUrl` and `appStoreUrl`
are copied verbatim. To pick up a portfolio change, re-copy the record and drop
its logo into `assets/images/projects/`. Two fields are additions for this Arabic
page — `descriptionAr` and `typeAr` — and both are optional.

`js/data/transform.js` turns those raw records into what the cards need, and is
where all the fallback behaviour lives:

- missing `descriptionAr` → the English `description` → a generic sentence;
- `publishUrl` of `'#'` (the portfolio's "not public yet" marker) → the first
  store link instead, or the "قيد النشر" badge when there is none;
- missing/broken `image` → an inline SVG placeholder (no extra request);
- a record with no `name` is dropped rather than rendered blank.

Filter categories are matched against the tag list in `CATEGORIES`, and
`buildFilters()` only emits a chip for a category that actually has projects, so
a chip can never lead to an empty grid. Sorting options live in `SORTS`.

The data module is pulled in with a dynamic `import()` so the section has a real
loading life cycle and a real failure path — see `ProjectsGallery.load()`.

## Contact form

There is **no inquiry endpoint** for IT Land Iraq, so the form does not post
anywhere: it validates, composes a plain-text message, and opens WhatsApp
(`wa.me`) or a `mailto:` draft in a new tab. The submit button ships `disabled`
in the markup and is enabled by `ContactForm.init()`, so a visitor without JS is
never offered a button that cannot work — they get the `<noscript>` note and the
WhatsApp channel card beside it.

The phone number, email, address and social links are the **Wazzifni** channels,
inherited from the main landing page because IT Land Iraq has no separate inbox
yet. They live in `js/data/company.js` and in the markup of the contact/footer
sections; swapping them is a small, contained edit.

## Routing

`nginx.conf` serves the directory on both hosts that carry the landing page:

```nginx
location /itland/ {
    root /usr/share/nginx/html/landing;
    index index.html;
    try_files $uri $uri/ /itland/index.html;
}
```

Unlike `/course/`, every asset reference in `index.html` is **relative**
(`css/main.css`, `js/main.js`, `assets/…`), so the page keeps working if it is
ever mounted under a different prefix.

Entry points added to the main landing page (`landing/web/index.html`):
the first nav link, the first card in the `.path-grid` row, and a footer link.
`.path-grid` moved from a two-up to a three-up desktop layout to fit the new card
(`landing/web/css/components/path.css`).

## Accessibility notes

- Single `<h1>`, one `<section>` per landmark, headings in order; the
  differentiator, values and social groups carry `sr-only` headings so they are
  not unlabelled lists.
- Filter chips are toggle buttons (`aria-pressed`) with an `aria-label` carrying
  the count, and arrow keys move between them (RTL-aware).
- Result counts are announced through a polite live region, not a toast.
- Form errors are text in `[data-error-for]`, referenced by `aria-describedby`,
  with `aria-invalid` on the field; validation fires on blur, then live only
  after the field has already been flagged.
- Latin names inside the RTL document (`IT Land Iraq`, tags, phone numbers) are
  wrapped in `unicode-bidi: isolate` so the bidi algorithm cannot reorder them.
- `prefers-reduced-motion` disables the reveal, the skeleton sweep and the
  floating badges; `forced-colors` restores borders that are otherwise built from
  translucent colours.
- Targets are at least 38–44px; `:focus-visible` is a 3px gold ring everywhere.

## Local preview

Any static server rooted at `frontend/landing` works, as long as `/itland/`
resolves to this directory:

```bash
cd frontend/landing && python -m http.server 4173
# then open http://localhost:4173/itland/
```
