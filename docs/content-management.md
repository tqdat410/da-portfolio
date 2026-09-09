# Content Management

## Overview

All public portfolio content is stored in the repository. Update the smallest owning source, preview the affected route, synchronize `public/llms.txt` when public facts change, then run `npm run check`.

## Profile and contact

| Content | Owner |
|---|---|
| Name, description, CV links | `src/content/site/hero.ts` |
| Bio, education, experience, skills | `src/content/site/about.ts` |
| Contact and social links | `src/content/site/contact.ts` |

CV source files are `cv_en.html` and `cv_ats_en.html`; the public download URLs live in `src/content/site/hero.ts`. Keep those URLs synchronized when publishing new CV versions.

## Projects

Create or edit a `.md` file in `src/content/projects/`. Register each new file in `src/content/projects/project-markdown-content.ts` so its content is bundled for the production runtime. The required frontmatter fields are:

- `title`: display name.
- `slug`: unique stable identifier.
- `summary`: concise project-index description.
- `order`: position in the flat project index.

Files with another extension, including `.md.archived`, are intentionally not published. Preview changes at `/projects`.

## Certificates

Edit `src/content/certificates/certificates.md`. Category names must match `src/content/certificates/config.ts`. Every item needs `title`, `provider`, and `url`; entries with an empty URL stay visible with an unavailable state. Academic records from FPT University belong in profile/education content rather than this certificate index.

Preview changes at `/certificates`.

## AI-readable profile

Update `public/llms.txt` whenever profile, project, certificate, CV, or public contact facts change. Include only public information; exclude credentials, private plans, local paths, and private contact data.

## Update checklist

1. Edit the owning source.
2. Preview the affected route at mobile and desktop widths.
3. Update `public/llms.txt` when public facts changed.
4. Run `npm run check`.
5. Review the Git diff before committing.
