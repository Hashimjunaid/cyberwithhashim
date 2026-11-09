const GRAPH_BASE = "https://graph.instagram.com";

async function instagramRequest(path, env, params = {}) {
  if (!env.INSTAGRAM_ACCESS_TOKEN) {
    throw new Error("Instagram feed is not connected yet. Add INSTAGRAM_ACCESS_TOKEN in Cloudflare Worker Settings > Variables and Secrets.");
  }
  const url = new URL(`${GRAPH_BASE}/${env.INSTAGRAM_API_VERSION || "v25.0"}/${path}`);
  for (const [key, value] of Object.entries({ ...params, access_token: env.INSTAGRAM_ACCESS_TOKEN })) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || `Instagram API returned ${response.status}`);
  return data;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, service: "CyberWithHashim API" });
    }
    if (url.pathname === "/api/instagram/profile") {
      try {
        const data = await instagramRequest("me", env, {
          fields: "user_id,username,account_type,media_count"
        });
        return Response.json({ connected: true, data });
      } catch (error) {
        return Response.json({ connected: false, error: error.message }, { status: 503 });
      }
    }
    if (url.pathname === "/api/instagram/posts") {
      try {
        const data = await instagramRequest("me/media", env, {
          fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,children{media_type,media_url,thumbnail_url,permalink}",
          limit: "12"
        });
        const posts = (data.data || []).map(item => ({
          id: item.id,
          caption: item.caption || "",
          media_type: item.media_type,
          media_url: item.media_url || item.thumbnail_url || null,
          thumbnail_url: item.thumbnail_url || null,
          permalink: item.permalink,
          timestamp: item.timestamp,
          username: item.username || null,
          children: item.children?.data || []
        }));
        return Response.json(
          { connected: true, username: env.INSTAGRAM_USERNAME || "cyberwithhashim", data: posts },
          { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } }
        );
      } catch (error) {
        return Response.json(
          { connected: false, error: "Instagram feed is temporarily unavailable.", data: [] },
          { status: 503 }
        );
      }
    }
    return env.ASSETS.fetch(request);
  }
};
