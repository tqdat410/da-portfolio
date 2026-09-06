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

Create or edit a `.md` file in `src/content/projects/`. The required frontmatter fields are:

- `title`: display name.
- `slug`: unique stable identifier.
- `category`: a value from `src/content/projects/config.ts`.
- `order`: position inside the category.
- `images`: optional `{ name, url }` entries.

Files with another extension, including `.md.archived`, are intentionally not published. Preview changes at `/tqdat410/projects`.

## Certificates

Edit `src/content/certificates/certificates.md`. Category names must match `src/content/certificates/config.ts`. Every item needs `name`, `title`, `provider`, and `url`; entries with an empty URL stay documented but are hidden from the Explorer list.

Preview changes at `/tqdat410/certificates`.

## AI-readable profile

Update `public/llms.txt` whenever profile, project, certificate, CV, or public contact facts change. Include only public information; exclude credentials, private plans, local paths, and private contact data.

## Update checklist

1. Edit the owning source.
2. Preview the affected route at mobile and desktop widths.
3. Update `public/llms.txt` when public facts changed.
4. Run `npm run check`.
5. Review the Git diff before committing.
