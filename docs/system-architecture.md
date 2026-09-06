# System Architecture

## Purpose

Da'portfolio is a small, content-first portfolio. The repository intentionally avoids a CMS, database, global state library, and custom backend. Portfolio content should remain reviewable in Git and deploy with the application.

## Boundaries

| Area | Owner |
|---|---|
| Routes and metadata | `src/app/` |
| Homepage UI | `src/components/story/`, `src/components/sections/`, `src/components/layout/` |
| Finder and Explorer UI | `src/components/finder/`, `src/components/projects-explorer/`, `src/components/certificates-explorer/` |
| Profile and contact content | `src/content/site/` |
| Project and certificate documents | `src/content/projects/`, `src/content/certificates/` |
| Markdown loading and validation | `src/lib/projects-markdown.ts`, `src/lib/certificates-markdown.ts` |
| GitHub calendar integration | `src/app/api/github-contribution-calendar/`, `src/lib/github-contributions.ts` |
| Brand tokens and global effects | `src/app/globals.css` |

## Decisions

### Repository-owned content

TypeScript owns short structured homepage data. Markdown owns long-form project and certificate material. This keeps routine updates local and avoids operating a CMS for a single-author site.

### Server-side content loading

Project and certificate files are read only by server modules. Their frontmatter is parsed through `src/lib/markdown-frontmatter.ts`, then validated by the owning loader before being passed to client Explorer components.

### GitHub activity boundary

The browser calls the internal contribution-calendar route. GitHub credentials stay in server environment variables and the upstream response is cached. The About section must degrade gracefully when the token or upstream API is unavailable.

### Visual effects

The homepage uses OGL effects selectively. Mobile layouts and reduced-motion preferences take priority over visual density. Do not add another graphics stack unless an implemented effect requires it.

## Public contracts

- Keep the four public routes listed in the root README stable.
- Keep project categories synchronized with `src/content/projects/config.ts`.
- Keep certificate categories synchronized with `src/content/certificates/config.ts`.
- Keep the GitHub calendar API response compatible with its About-section consumer and tests.
- Keep `public/llms.txt` aligned with public profile and portfolio content.

## Verification

`npm run check` is the release gate. The executable definition in `package.json` and the CI workflow are authoritative.
