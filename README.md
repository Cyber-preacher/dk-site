# dk-site

Personal publishing site for short notes and long-form essays.

## Local setup

```bash
yarn install
cp .env.example .env.local
yarn dev
```

## Content model

- `type: "note"` (or `idea`, `short`) -> shows in `/notes` only.
- `type: "article"` or `type: "essay"` -> gets dedicated `/notes/[slug]` page.

Create new content:

```bash
yarn note:new "My New Essay" --type essay --tags systems,governance
```

Quality checks:

```bash
yarn validate:notes
yarn typecheck
yarn build
```

## Deployment target

- Primary domain: `https://dknotes.space`

Production env values:

- `SITE_URL=https://dknotes.space`
- `NEXT_PUBLIC_SITE_URL=https://dknotes.space` (optional compatibility fallback)

## Phase 2 deploy handoff

Before final deploy, complete:

1. DNS records on Namecheap pointing to your hosting provider.
2. HTTPS certificate active for `dknotes.space`.
3. Hosting project connected to this repo and default branch (`master` currently).
4. Production env variables set (`SITE_URL`, optionally `NEXT_PUBLIC_SITE_URL`).
5. Branch protection requiring `CI Build` and `Content Validation`.

After deployment, verify:

1. Home and `/notes` render correctly.
2. Long-form detail page opens correctly (`/notes/[slug]` for essay/article).
3. `/rss`, `/sitemap`, and `/robots.txt` return valid responses with `dknotes.space` URLs.
4. OG image routes render correctly.
