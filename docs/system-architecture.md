# System Architecture

## Purpose

Da'portfolio is a small, content-first portfolio. The repository intentionally avoids a CMS, database, global state library, and custom backend. Portfolio content should remain reviewable in Git and deploy with the application.

## Boundaries

| Area | Owner |
|---|---|
| Routes and metadata | `src/app/` |
| Homepage UI | `src/components/story/`, `src/components/sections/`, `src/components/layout/` |
| Project and certificate UI | `src/components/projects/`, `src/components/certificates/`, `src/components/portfolio-pages/` |
| Profile and contact content | `src/content/site/` |
| Project and certificate documents | `src/content/projects/`, `src/content/certificates/` |
| Markdown loading and validation | `src/lib/projects-markdown.ts`, `src/lib/certificates-markdown.ts` |
| GitHub calendar integration | `src/app/api/github-contribution-calendar/`, `src/lib/github-contributions.ts` |
| Brand tokens and global effects | `src/app/globals.css` |
| Cloudflare Workers deployment | `wrangler.jsonc`, `open-next.config.ts` |

## Decisions

### Repository-owned content

TypeScript owns short structured homepage data. Markdown owns long-form project and certificate material. This keeps routine updates local and avoids operating a CMS for a single-author site.

### Server-side content loading

Project and certificate files are read only by server modules. Their frontmatter is parsed through `src/lib/markdown-frontmatter.ts`, validated by the owning loader, and rendered through server components. Projects use a flat ordered index plus static detail routes; certificates render as one grouped page.

### GitHub activity boundary

The browser calls the internal contribution-calendar route. GitHub credentials stay in server environment variables and the upstream response is cached. The About section must degrade gracefully when the token or upstream API is unavailable.

### Deployment runtime

OpenNext packages the Next.js application for Cloudflare Workers. The Worker serves static assets and the contribution-calendar route from one deployment; `wrangler.jsonc` is the deployment authority. Keep secrets in Cloudflare Worker secrets, never in repository configuration.

### Visual effects

The Hero uses a project-owned raw WebGL1 renderer rather than browser compositing: one opaque pass resolves its background, metaballs, and inverse text color. `src/components/animations/HeroVisual.tsx` owns capability checks and the responsive lifecycle around the renderer and text-mask helpers in the same directory. Semantic DOM content remains the static-first fallback for accessibility preferences, unavailable capabilities, and runtime failures; rendering pauses while the Hero or document is not visible and responsive geometry changes rebuild from current measurements. The Contact section continues to use OGL for particles. Mobile layouts and accessibility preferences take priority over visual density; do not add another graphics stack unless an implemented effect requires it.

## Public contracts

- Keep the canonical public routes listed in the root README stable.
- Keep project slugs unique and project order synchronized with the published index.
- Keep certificate categories synchronized with `src/content/certificates/config.ts`.
- Keep the GitHub calendar API response compatible with its About-section consumer and tests.
- Keep `public/llms.txt` aligned with public profile and portfolio content.

## Verification

`npm run check` is the release gate and includes the sanitized OpenNext Worker build. The executable definition in `package.json` and the CI workflow are authoritative.
