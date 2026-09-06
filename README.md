# Da'portfolio

Personal portfolio for Tran Quoc Dat, built with Next.js, React, TypeScript, and Tailwind CSS.

[Live site](https://tranquocdat.com) · [AI-readable profile](public/llms.txt)

![Da'portfolio homepage](public/hero-section.png)

## Experiences

- `/` — portfolio homepage with profile, experience, and contact details.
- `/tqdat410` — Finder-style launcher.
- `/tqdat410/projects` — Markdown-backed project explorer.
- `/tqdat410/certificates` — certificate explorer.

## Local development

Requirements: Node.js 22 or newer and npm. The repository `.nvmrc` selects Node.js 24.

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` only when testing the GitHub contribution calendar. Never commit environment files.

## Quality checks

Run the same gate used by CI:

```bash
npm run check
```

Individual scripts are defined in [`package.json`](package.json). CI runs on pull requests and pushes to `main` through [`.github/workflows/quality.yml`](.github/workflows/quality.yml).

## Maintaining content

See [Content management](docs/content-management.md). Architecture decisions and visual constraints live in [System architecture](docs/system-architecture.md) and [Design guidelines](docs/design-guidelines.md).
