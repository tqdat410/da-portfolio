# Deployment

## Platform

The production site runs on Cloudflare Workers through the OpenNext adapter.

- Worker: `da-portfolio-v4`
- Production URL: `https://tranquocdat.com`
- Configuration: [`wrangler.jsonc`](../wrangler.jsonc)

## Deploy

Authenticate with Wrangler, then run:

```bash
npm run deploy
```

The command builds the OpenNext worker before publishing it.

## Environment

Configure `GITHUB_GRAPHQL_TOKEN` as a Worker secret when the GitHub contribution calendar needs authenticated API access. Local environment and `.dev.vars` files must remain uncommitted.

## Rollback

List recent versions and roll back to a known-good version:

```bash
npx wrangler versions list
npx wrangler rollback <version-id>
```
