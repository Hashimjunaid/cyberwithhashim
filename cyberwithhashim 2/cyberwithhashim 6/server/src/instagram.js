import axios from 'axios';

const GRAPH_BASE = 'https://graph.instagram.com';
const API_VERSION = process.env.INSTAGRAM_API_VERSION || 'v25.0';
let cache = { data: null, expiresAt: 0 };
let tokenRefreshedAt = 0;

function token() {
  const value = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!value) throw new Error('Instagram is not connected yet. Add INSTAGRAM_ACCESS_TOKEN to server/.env.');
  return value;
}

export async function refreshLongLivedTokenIfDue() {
  const current = token();
  // Refresh at most once every 50 days. Meta long-lived tokens are generally valid for 60 days.
  if (Date.now() - tokenRefreshedAt < 50 * 24 * 60 * 60 * 1000) return;
  try {
    const { data } = await axios.get(`${GRAPH_BASE}/refresh_access_token`, {
      params: { grant_type: 'ig_refresh_token', access_token: current }, timeout: 15000
    });
    if (data?.access_token) process.env.INSTAGRAM_ACCESS_TOKEN = data.access_token;
    tokenRefreshedAt = Date.now();
    console.log('Instagram long-lived token refresh checked successfully. Update your deployment secret with the returned token if your platform does not persist runtime environment changes.');
  } catch (error) {
    // Don't hide a token failure; the feed endpoint will return a useful error to the server log.
    console.error('Instagram token refresh failed:', error.response?.data || error.message);
    throw new Error('Instagram token refresh failed. Re-authorize the account or refresh the token in Meta.');
  }
}

export async function getInstagramProfile() {
  await refreshLongLivedTokenIfDue();
  const { data } = await axios.get(`${GRAPH_BASE}/${API_VERSION}/me`, {
    params: { fields: 'user_id,username,account_type,media_count', access_token: token() }, timeout: 15000
  });
  return data;
}

export async function getInstagramPosts({ force = false } = {}) {
  if (!force && cache.data && cache.expiresAt > Date.now()) return cache.data;
  await refreshLongLivedTokenIfDue();
  const { data } = await axios.get(`${GRAPH_BASE}/${API_VERSION}/me/media`, {
    params: {
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,children{media_type,media_url,thumbnail_url,permalink}',
      limit: 12,
      access_token: token()
    }, timeout: 20000
  });
  const posts = (data.data || []).map(item => ({
    id: item.id,
    caption: item.caption || '',
    media_type: item.media_type,
    media_url: item.media_url || item.thumbnail_url || null,
    thumbnail_url: item.thumbnail_url || null,
    permalink: item.permalink,
    timestamp: item.timestamp,
    username: item.username || null,
    children: item.children?.data || []
  }));
  cache = { data: posts, expiresAt: Date.now() + 10 * 60 * 1000 };
  return posts;
}
