# The Matchbook Collective Agency website

Static Astro website with TypeScript, custom CSS, and Netlify Forms.

## Local development

Use Node 24.21.0 (also configured in netlify.toml).

```sh
npm ci
npm run dev
```

The local preview runs at http://127.0.0.1:4321. Local Astro does not process real form inquiries.

## Production build

```sh
npm run build && npm run verify
```

Publish directory: `dist`. Set `SITE_URL=https://thematchbookcollective.com` in the production build environment. Leave it unset for local and deploy previews. Netlify Forms needs no API key or contact endpoint variable.

See [Netlify Forms setup](docs/NETLIFY-FORMS.md) for detection, email notifications, and the live delivery test.

## Editable source

- `src/pages/`: public routes and the thank-you page.
- `src/data/`: site content, services, Method, founders, and approved work.
- `src/assets/`: photos and logo optimized during the build.
- `src/styles/global.css`: shared responsive design.
- `src/content/insights/`: future Markdown articles; only approved, non-draft entries publish. An empty collection is supported.

## Verification

The build runs Astro diagnostics. `npm run verify` checks generated links, assets, metadata, excluded content, and static form markup.

`node scripts/browser-check.mjs` checks seven pages at five screen widths, accessibility, navigation, validation, and mocked Netlify success/failure/native submissions. It expects local Chrome on macOS and a running preview; set `QA_URL` to override the default local URL. Reports, screenshots, browser profiles, dependencies, build output, and environment files are ignored.

No deployment runs as part of these commands.
