# Content Management Guide

## Add a new project

1. Create a markdown file in `src/content/projects/`.
2. Add frontmatter fields:
   - `title` (string)
   - `slug` (string, unique)
   - `category` (must match `src/content/projects/config.ts`)
   - `order` (number)
   - `images` (optional array of `{ name, url }`)
3. Write project body in markdown.
4. Open `/tqdat410/projects` and verify:
   - file appears in correct folder
   - markdown shows in raw + preview
   - image popup opens correctly

## Add or update certificates

1. Edit `src/content/certificates/certificates.md`.
2. Keep frontmatter structure:
   - `categories[].name` must match `src/content/certificates/config.ts`
   - `categories[].items[]` with `name`, `title`, `provider`, `url`
3. If `url` is empty, item remains documented but hidden in file list.
4. Open `/tqdat410/certificates` and verify tree + link opening.

## Update homepage content

- Hero: `src/content/site/hero.ts`
- About + skills + experience: `src/content/site/about.ts`
- Projects showcase cards: `src/content/site/projects.ts`
- Contact + social links: `src/content/site/contact.ts`

## Update AI-readable content

- Public LLM summary: `public/llms.txt`
- Keep it aligned when profile, project, certificate, or public contact content changes.
- Exclude sensitive details such as phone numbers, secret values, local paths, private plans, and access credentials.

## Notes

- Primary brand colors are centralized in `src/app/globals.css` via:
  - `--brand-bg: #0c0c0c`
  - `--brand-fg: #fafafa`
- Preserve category names to avoid parser rejection.
