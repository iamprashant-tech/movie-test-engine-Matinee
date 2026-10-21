// Quick logic checks (no network): scoring + both API adapters against mocked responses.
import assert from 'node:assert/strict';
import { buildGenreScores, explainMovie, rankForYou, favouriteGenreNames } from '../src/lib/taste.js';

// --- scoring: like +2, dislike -1, then sort ---
const m = (key, genres, rating = 7) => ({ key, genres, rating });
const ratings = [
  { movie: m('a', ['Action', 'Drama']), value: 1 },
  { movie: m('b', ['Action', 'Comedy']), value: 1 },
  { movie: m('c', ['Horror', 'Drama']), value: -1 },
];
const scores = buildGenreScores(ratings);
assert.deepEqual(scores, { Action: 4, Drama: 1, Comedy: 2, Horror: -1 });
assert.deepEqual(favouriteGenreNames(scores), ['Action', 'Comedy', 'Drama']);
assert.equal(explainMovie(['Action', 'Horror'], scores).total, 3);

const ranked = rankForYou(
  [m('a', ['Action']), m('x', ['Horror']), m('y', ['Action', 'Comedy']), m('z', ['Drama'], 9)],
  new Set(['a']),
  scores
);
assert.deepEqual(ranked.map((r) => r.movie.key), ['y', 'z', 'x']);
assert.equal(ranked[0].total, 6);
console.log('scoring ok');

// --- adapters with mocked fetch ---
const calls = [];
globalThis.fetch = async (url) => {
  calls.push(String(url));
  const u = new URL(url);
  const json = (body) => ({ ok: true, status: 200, json: async () => body });
  if (u.hostname === 'api.themoviedb.org') {
    if (u.pathname === '/3/genre/movie/list') return json({ genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }] });
    if (u.pathname === '/3/movie/popular' || u.pathname === '/3/search/movie' || u.pathname === '/3/discover/movie')
      return json({
        page: 1,
        total_pages: 3,
        results: [
          { id: 1, title: 'One', release_date: '2019-05-01', poster_path: '/p.jpg', backdrop_path: '/b.jpg', vote_average: 7.84, overview: 'x', genre_ids: [28, 18] },
          { id: 2, title: 'Two', release_date: '', poster_path: null, vote_average: 0, overview: '', genre_ids: [18] },
        ],
      });
    if (u.pathname === '/3/movie/1') return json({ id: 1, title: 'One', release_date: '2019-05-01', runtime: 112, genres: [{ id: 28, name: 'Action' }], tagline: 't', vote_average: 7.8 });
  }
  if (u.hostname === 'api.jikan.moe') {
    if (u.pathname === '/v4/genres/anime') return json({ data: [{ mal_id: 1, name: 'Action' }, { mal_id: 9, name: 'Hentai' }, { mal_id: 8, name: 'Drama' }] });
    if (u.pathname === '/v4/anime')
      return json({
        pagination: { has_next_page: true },
        data: [
          { mal_id: 5, title: 'Kimi', title_english: 'Your Name', year: 2016, score: 8.8, synopsis: 's', duration: '1 hr 46 min per ep', images: { jpg: { large_image_url: 'http://i/x.jpg' } }, genres: [{ name: 'Drama' }], themes: [] },
          { mal_id: 5, title: 'dup', genres: [] },
          { mal_id: 6, title: 'NoGenre', genres: [], themes: [{ name: 'Mecha' }], aired: { prop: { from: { year: 1995 } } } },
        ],
      });
    if (u.pathname === '/v4/anime/5') return json({ data: { mal_id: 5, title: 'Kimi', title_english: 'Your Name', genres: [{ name: 'Drama' }], duration: '1 hr 46 min' } });
  }
  return { ok: false, status: 404, json: async () => ({}) };
};
globalThis.localStorage = { getItem: () => 'x'.repeat(32), setItem() {}, removeItem() {} };

const tmdb = await import('../src/api/tmdb.js');
const jikan = await import('../src/api/jikan.js');
const { buildPool, surpriseMovie } = await import('../src/api/index.js');

let r = await tmdb.list({ page: 1 });
assert.equal(r.items[0].key, 'tmdb:1');
assert.deepEqual(r.items[0].genres, ['Action', 'Drama']);
assert.equal(r.items[0].year, 2019);
assert.equal(r.items[0].rating, 7.8);
assert.equal(r.items[1].year, null);
assert.equal(r.items[1].poster, null);
assert.equal(r.hasNext, true);
r = await tmdb.list({ query: 'one', genreId: 28 });
assert.equal(r.items.length, 1, 'search + genre filter is applied client-side');
assert.ok(calls.some((c) => c.includes('api_key=')));
const d = await tmdb.detail('1');
assert.equal(d.runtime, 112);
console.log('tmdb ok');

r = await jikan.list({ page: 1 });
assert.equal(r.items.length, 2, 'duplicates removed');
assert.equal(r.items[0].title, 'Your Name');
assert.equal(r.items[0].runtime, 106);
assert.deepEqual(r.items[1].genres, ['Mecha']);
assert.equal(r.items[1].year, 1995);
const g = await jikan.genres();
assert.deepEqual(g.map((x) => x.name), ['Action', 'Drama']);
assert.equal((await jikan.detail('5')).key, 'jikan:5');
console.log('jikan ok');

const pool = await buildPool('tmdb', ['Action'], undefined);
assert.ok(pool.length >= 2);
const s = await surpriseMovie('jikan', new Set(['jikan:5']));
assert.equal(s.key, 'jikan:6');
console.log('pool + surprise ok');

// --- timeout: a request that never answers must fail with a clear error ---
const http = await import('../src/api/http.js');
http.config.timeoutMs = 60;
globalThis.fetch = (url, { signal }) =>
  new Promise((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('x', 'AbortError'))));
await assert.rejects(http.getJson('https://hang.test/a'), (e) => e.status === 0 && /too long/.test(e.message));
console.log('timeout ok');

// --- demo catalogue ---
const demo = await import('../src/api/demo.js');
const dl = await demo.list({ page: 1 });
assert.equal(dl.items.length, 12);
assert.equal(dl.hasNext, true);
assert.ok((await demo.list({ query: 'matrix' })).items[0].title === 'The Matrix');
assert.ok((await demo.list({ genreId: 'Horror' })).items.every((m) => m.genres.includes('Horror')));
console.log('demo ok');

// --- deployed mode: key stays on the server (api/tmdb.js) ---
const tmdb2 = await import('../src/api/tmdb.js');
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
tmdb2.proxy.enabled = true;
assert.equal(tmdb2.canUse(), true);
const seen = [];
globalThis.fetch = async (url) => {
  seen.push(String(url));
  const j = (b) => ({ ok: true, status: 200, json: async () => b });
  return String(url).includes('genre') ? j({ genres: [{ id: 28, name: 'Action' }] }) : j({ page: 1, total_pages: 1, results: [{ id: 9, title: 'P', genre_ids: [28] }] });
};
const viaProxy = await tmdb2.list({ page: 2, query: 'dune' });
assert.equal(viaProxy.items[0].genres[0], 'Action');
assert.ok(seen.every((u) => u.startsWith('/api/tmdb?path=')), 'all calls go through the proxy');
assert.ok(seen.every((u) => !u.includes('api_key')), 'no key in browser requests');

const handler = (await import('../api/tmdb.js')).default;
const mkRes = () => ({ headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, send(b) { this.body = b; return this; }, json(b) { this.body = JSON.stringify(b); return this; } });
let rs = mkRes(); await handler({ query: { path: '/movie/popular' } }, rs); assert.equal(rs.code, 500, 'missing key is reported');
process.env.TMDB_KEY = 'k'.repeat(32);
rs = mkRes(); await handler({ query: { path: '/account/123' } }, rs); assert.equal(rs.code, 400, 'other TMDB paths are blocked');
let upstreamUrl;
globalThis.fetch = async (u) => { upstreamUrl = String(u); return { ok: true, status: 200, text: async () => '{"ok":1}' }; };
rs = mkRes(); await handler({ query: { path: '/movie/popular', page: '2' } }, rs);
assert.equal(rs.code, 200);
assert.ok(upstreamUrl.startsWith('https://api.themoviedb.org/3/movie/popular?') && upstreamUrl.includes('api_key=') && upstreamUrl.includes('page=2'));
console.log('proxy + serverless function ok');
