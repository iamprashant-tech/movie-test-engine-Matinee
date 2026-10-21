// Vercel serverless function: forwards a few read-only TMDB requests and adds the
// secret key on the server, so the key never reaches the browser.
const ALLOWED = /^\/(movie\/(popular|\d+)|search\/movie|discover\/movie|genre\/movie\/list)$/;

export default async function handler(req, res) {
  const key = (process.env.TMDB_KEY || '').trim();
  if (!key) return res.status(500).json({ error: 'TMDB_KEY is not set on the server.' });

  const { path, ...rest } = req.query || {};
  if (typeof path !== 'string' || !ALLOWED.test(path)) {
    return res.status(400).json({ error: 'That TMDB path is not allowed.' });
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(rest)) params.set(k, Array.isArray(v) ? v[0] : String(v));
  const headers = {};
  if (key.length > 40) headers.Authorization = `Bearer ${key}`;
  else params.set('api_key', key);

  try {
    const upstream = await fetch(`https://api.themoviedb.org/3${path}?${params}`, { headers });
    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    if (upstream.ok) res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(upstream.status).send(body);
  } catch {
    return res.status(502).json({ error: 'Could not reach TMDB.' });
  }
}
