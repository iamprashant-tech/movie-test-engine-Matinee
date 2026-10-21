const cache = new Map();
export const config = { timeoutMs: 12000 };

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const abortError = () => new DOMException('Aborted', 'AbortError');

export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(abortError());
      },
      { once: true }
    );
  });
}

/**
 * GET json with an in-memory cache, abort support and a retry on 429.
 * `gate` lets a provider queue its requests (Jikan has a rate limit).
 */
export async function getJson(url, { signal, headers, gate } = {}) {
  const key = url + (headers?.Authorization || '');
  if (cache.has(key)) return cache.get(key);

  const run = async () => {
    for (let attempt = 0; ; attempt++) {
      if (signal?.aborted) throw abortError();
      let res;
      const ctrl = new AbortController();
      const forward = () => ctrl.abort();
      signal?.addEventListener('abort', forward, { once: true });
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        ctrl.abort();
      }, config.timeoutMs);
      try {
        res = await fetch(url, { signal: ctrl.signal, headers });
      } catch (e) {
        if (signal?.aborted) throw abortError();
        throw new ApiError(
          0,
          timedOut
            ? 'The movie service took too long to answer. It may be busy or blocked on your network.'
            : 'Could not reach the movie service. Check your connection, VPN or ad-blocker and try again.'
        );
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', forward);
      }
      if (res.status === 429 && attempt < 3) {
        await sleep(1000 * (attempt + 1), signal);
        continue;
      }
      if (res.status >= 500 && attempt < 2) {
        await sleep(800 * (attempt + 1), signal);
        continue;
      }
      if (!res.ok) {
        const msg =
          res.status === 401
            ? 'The API key was rejected. Check that you pasted it correctly.'
            : res.status === 404
            ? 'That title could not be found.'
            : `The movie service returned an error (${res.status}).`;
        throw new ApiError(res.status, msg);
      }
      const data = await res.json();
      cache.set(key, data);
      return data;
    }
  };

  return gate ? gate(run) : run();
}
