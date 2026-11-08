# CyberWithHashim

Premium dark cybersecurity awareness, compliance and services website. Frontend: React + Vite. Backend: Node.js + Express. Instagram feed: Meta's official Instagram API with Instagram Login.

## Requirements
- Node.js 20 LTS or newer
- npm 10+
- Instagram Professional account (Creator or Business)
- Meta developer app and an authorized long-lived Instagram User access token with `instagram_business_basic`

## 1. Install
From this project root:

```bash
npm install
cp server/.env.example server/.env
```

Edit `server/.env` and add your own long-lived Instagram User access token. Never put the token in the React `client` folder or commit it to GitHub.

## 2. Run locally

```bash
npm run dev
```

- Website: http://localhost:5173
- API health: http://localhost:5000/api/health
- Instagram feed: http://localhost:5000/api/instagram/posts

Without a token, the site displays sample preview cards and a notice. With a valid token, it displays the latest media from the authorized Instagram professional account.

## 3. Instagram API setup (official route)
1. In the Instagram app, open the CyberWithHashim profile and switch it to a Professional account. Creator is suitable for a personal creator brand; Business is also supported.
2. Go to https://developers.facebook.com/ and create a Meta developer app.
3. Add/configure the Instagram API with Instagram Login (Business Login for Instagram) product/flow.
4. Configure the OAuth redirect URL and app settings as required by Meta.
5. Request the `instagram_business_basic` permission. A read-only feed does not need content publishing, comments or messaging permissions.
6. Add your own Instagram account as an app tester/developer where Meta requires it, then authorize the app as that Instagram account.
7. Complete Meta's token exchange flow and obtain a long-lived Instagram User access token. Copy it into `server/.env` as `INSTAGRAM_ACCESS_TOKEN`.
8. Check the token by opening `/api/instagram/profile`, then check `/api/instagram/posts`.
9. Before opening access to other people's accounts or distributing a public integration, complete any App Review / access-level requirements Meta applies. For a single account you own, begin in development mode with your own authorized tester account.

Official docs:
- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/
- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login
- https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api

The current Instagram Login permission name is `instagram_business_basic`. Older tutorials may show deprecated permission names or the retired Basic Display API; do not follow those instructions.

## 4. Token lifecycle
Long-lived Instagram tokens are time-limited (commonly 60 days) and can be refreshed before expiry while valid. This server includes a refresh helper, but a refreshed token must be persisted into your hosting provider's secret/environment settings. For production, schedule a token-refresh check at least every 40–50 days, store the returned token securely, and alert an administrator if refresh fails. Do not assume changing `process.env` at runtime updates your hosting dashboard's saved secret.

## 5. Production build and run

```bash
npm run build
NODE_ENV=production npm start
```

The Express server serves `client/dist` and `/api/*` from one Node process. Set `PORT` to the port assigned by your host. Add `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USERNAME`, `INSTAGRAM_API_VERSION` and `NODE_ENV=production` as server-side environment variables in your hosting dashboard. Never upload `.env` to the public web root.

## 6. Deploy to a Node.js-capable host
1. Push this project to a private GitHub repository.
2. Purchase a domain and a hosting plan that explicitly supports a persistent Node.js application/workspace deployment. A basic static-only hosting plan is not enough for this combined Express backend.
3. Connect the GitHub repository in the host's Node.js application deployment panel.
4. Set the application root to the repository root. Build command: `npm install && npm run build`. Start command: `npm start`.
5. Configure all environment variables in the host dashboard (do not commit secrets).
6. Attach `cyberwithhashim.com` and `www` to the application using the host's domain/DNS instructions, enable SSL, and choose one canonical hostname with a redirect from the other.
7. Test `https://your-domain/api/health`, `https://your-domain/api/instagram/profile`, and `https://your-domain/api/instagram/posts`.
8. Verify that the feed refreshes after a new post. The backend caches media for 10 minutes to reduce API requests.

Hostinger's Node.js support and available plans vary by region and product. Confirm Node.js app deployment is included in the exact plan before paying. If your selected Hostinger plan is static/shared hosting without a persistent Node.js app, deploy the React frontend to a static host and the Express API to a Node-capable host, then configure the frontend API URL and CORS.

## 7. Customization checklist before launch
- Replace the sample contact email `hello@cyberwithhashim.com` with an email address you own.
- Replace the WhatsApp placeholder link in `client/src/App.jsx` with your verified WhatsApp Business click-to-chat URL.
- Add Hashim's verified bio, qualifications and service scope; do not claim certifications or audit capabilities that are not held.
- Add Privacy Policy, Terms and a contact/consent notice if collecting visitor information.
- Add a real favicon/logo under `client/public` and update metadata in `client/index.html`.
- Test mobile layouts, keyboard navigation, links, Instagram media and token expiry before launch.

## API behavior
- `GET /api/health` — service health
- `GET /api/instagram/profile` — authorized profile summary
- `GET /api/instagram/posts` — latest 12 media items (10-minute server cache)
- `GET /api/instagram/posts?refresh=true` — bypass in-memory cache

This is a read-only feed. It does not publish content to Instagram, manage comments, or access Stories. The website links every media item back to the original Instagram post. Some media fields may be absent depending on media type and Meta API availability.
