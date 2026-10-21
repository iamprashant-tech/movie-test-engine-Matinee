# Matinee – Movie Taste Engine

A React app where you like or dislike titles and it recommends more based on your taste.

## Run it

```bash
npm install
npm run dev        # open the URL it prints (usually http://localhost:5173)
```

Works immediately with **anime films from Jikan** (no key needed). If Jikan is slow or blocked on your network, choose **Offline demo** in the header (built-in sample titles) so you can always demo the app.
For **real movies from TMDB**: click "Movies" in the header and paste your free key
(get one at https://www.themoviedb.org/settings/api). It is stored only in your browser.
You can also put it in a `.env` file as `VITE_TMDB_KEY=...` (see `.env.example`).

```bash
npm run build      # production build in dist/
npm test           # scoring + API adapter checks
```

## What's in it (matches the brief)

| Requirement | Where |
| --- | --- |
| Home page with movie cards, search, genre filter | `src/pages/Home.jsx` |
| Detail page for each movie (React Router) | `src/pages/Detail.jsx`, route `/movie/:source/:id` |
| Like / dislike buttons | `src/components/Actions.jsx` |
| Taste profile page showing favourite genres | `src/pages/Taste.jsx` |
| "For You" list (liked genre +2, disliked -1, then sort) | `src/lib/taste.js`, `src/pages/ForYou.jsx` |
| Watchlist | `src/pages/Watchlist.jsx` |
| Compare two movies side by side | `src/pages/Compare.jsx` |
| Stretch: "Surprise me" button | `src/components/Header.jsx`, `surpriseMovie()` in `src/api/index.js` |
| Stretch: skeleton loaders | `src/components/Skeleton.jsx` |
| Extension: real data (TMDB / Jikan) | `src/api/tmdb.js`, `src/api/jikan.js` |
| Extension: search calls the API once typing pauses | `src/hooks/useDebounce.js` (500 ms) used in Home and Compare |
| Extension: taste scoring on real genres | scores are built from the genres the API returns |

## How the scoring works

Each like adds 2 to every genre of that title; each dislike subtracts 1.
A candidate title's score is the sum of its genres' scores. Titles you already rated
are left out and the rest are sorted by score (ties broken by rating).

## Deploying (so anyone can open it)

Host on **Vercel** (free). The key stays on the server in `api/tmdb.js`, never in the browser.

1. Push this folder to a GitHub repository (do not commit any `.env` file).
2. On vercel.com choose **Add New, Project**, import the repository (framework: Vite).
3. Before deploying, add two **Environment Variables**:
   - `TMDB_KEY` = your TMDB API key (or read access token)
   - `VITE_TMDB_PROXY` = `true`
4. Click **Deploy**, then share the `.vercel.app` link.

If you change the variables later, redeploy for them to take effect.
Do **not** add the key as `VITE_TMDB_KEY` on Vercel, because that would publish it in the site code.
