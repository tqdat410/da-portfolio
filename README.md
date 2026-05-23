# Da'portfolio

Portfolio website built with Next.js App Router.

## Active Routes

- `/` - main portfolio page
- `/tqdat410` - desktop-style launcher
- `/tqdat410/projects` - markdown project explorer
- `/tqdat410/certificates` - certificates explorer

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Jest + Testing Library

## Content Model

- `src/content/site/*` stores homepage content (hero/about/showcase/contact/social)
- `src/content/projects/*.md` stores project documentation and image mappings
- `src/content/certificates/certificates.md` stores certificate index and category files
- `src/content/projects/config.ts` stores project category order
- `src/content/certificates/config.ts` stores certificate category order
- `public/llms.txt` stores the public AI-readable portfolio summary served at `/llms.txt`

When updating profile, project, certificate, or public contact content, keep
`public/llms.txt` aligned and exclude sensitive details such as phone numbers,
secret values, local paths, private plans, and access credentials.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run format:check
```

## Project Structure

```text
src/
  app/
  components/
  content/
    site/
    projects/
    certificates/
  hooks/
  lib/
```

## Environment

The GitHub contribution calendar under the About terminal uses the official GitHub GraphQL API.

- Copy `.env.example` to `.env.local` for local development
- Preferred token: `GITHUB_GRAPHQL_TOKEN`
- Fallback token: `GITHUB_TOKEN`
- Keep the token server-side only
- If the token is missing or the GitHub profile URL is invalid, the section renders a safe fallback instead of failing the page
