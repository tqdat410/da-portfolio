# AGENTS.md

## Project Context

Da'portfolio is a Next.js App Router portfolio site built with React, TypeScript, and Tailwind CSS.

## Key Commands

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Content Sources

- Homepage content: `src/content/site/*`
- Project markdown: `src/content/projects/*.md`
- Certificate markdown: `src/content/certificates/certificates.md`
- AI-readable public summary: `public/llms.txt`

## Guidelines

- Read `README.md` before making implementation changes.
- Keep changes scoped and follow existing project patterns.
- Do not commit `.env*`, credentials, tokens, or private local files.
- Keep `public/llms.txt` aligned when public profile, project, certificate, or contact content changes.
- Do not push `plans/`; it is local planning workspace.
