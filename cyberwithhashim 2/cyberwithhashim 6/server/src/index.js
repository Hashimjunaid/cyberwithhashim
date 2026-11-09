import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getInstagramPosts, getInstagramProfile } from './instagram.js';

const app = express();
const port = Number(process.env.PORT || 5000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');
const allowedOrigin = process.env.CLIENT_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'CyberWithHashim API' }));
app.get('/api/instagram/posts', async (req, res) => {
  try {
    const posts = await getInstagramPosts({ force: req.query.refresh === 'true' });
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.json({ connected: true, username: process.env.INSTAGRAM_USERNAME || 'cyberwithhashim', data: posts });
  } catch (error) {
    console.error('Instagram media request failed:', error.response?.data || error.message);
    const message = process.env.NODE_ENV === 'production'
      ? 'Instagram feed is temporarily unavailable. Please try again later.'
      : error.message;
    res.status(503).json({ connected: false, error: message, data: [] });
  }
});
app.get('/api/instagram/profile', async (_req, res) => {
  try { res.json({ connected: true, data: await getInstagramProfile() }); }
  catch (error) { res.status(503).json({ connected: false, error: error.message }); }
});

// Serve the Vite production build from the same Node app (convenient for one-host deployment).
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), error => error && next(error));
});
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(port, () => console.log(`CyberWithHashim server listening on port ${port}`));
