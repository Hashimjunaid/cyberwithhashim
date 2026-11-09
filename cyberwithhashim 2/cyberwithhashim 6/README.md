# CyberWithHashim — Cloudflare Worker deployment

This project is configured to deploy the React/Vite site and the `/api/*` endpoints together as one Cloudflare Worker with static assets.

## Cloudflare settings

For the existing Worker project connected to GitHub, set the repository root directory to the folder that contains this README, `package.json`, `worker.js`, and `wrangler.jsonc`. In the current GitHub upload, that folder appears to be `cyberwithhashim 2`.

- Build command: `npm install && npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/cyberwithhashim 2` (only if that exact folder is visible at the top level of the GitHub repository)

The build creates `client/dist`; Wrangler publishes it as Worker static assets.

## Instagram secret

In Cloudflare Worker Settings → Variables and Secrets, add `INSTAGRAM_ACCESS_TOKEN` as a **Secret**. Never put the token in GitHub or frontend code. The Instagram account must be eligible for Meta's Instagram API and authorized with the required permissions. Until the secret is configured, the site displays its demo feed.

`INSTAGRAM_USERNAME` and `INSTAGRAM_API_VERSION` are non-secret values already configured in `wrangler.jsonc`.
