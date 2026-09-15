/**
 * Lightweight in-flight request deduplication and in-memory TTL caching.
 * Prevents identical concurrent HTTP requests and redundant refetches within TTL.
 */

const cacheMap = new Map();
const inFlightMap = new Map();

/**
 * Execute a cached/deduplicated query.
 * @param {string} key - Unique cache key for this query
 * @param {Function} fetchFn - Async function returning data
 * @param {Object} options - Options
 * @param {number} [options.ttl=120000] - Cache validity time in ms (default 2 minutes)
 * @param {boolean} [options.force=false] - Force bypass cache and refetch
 * @returns {Promise<any>}
 */
export async function dedupeQuery(key, fetchFn, { ttl = 120000, force = false } = {}) {
  const now = Date.now();

  // 1. Return valid cached data if not forced
  if (!force && cacheMap.has(key)) {
    const cached = cacheMap.get(key);
    if (now - cached.timestamp < ttl) {
      return cached.data;
    }
  }

  // 2. If an identical request is currently in-flight, return the existing promise
  if (inFlightMap.has(key)) {
    return inFlightMap.get(key);
  }

  // 3. Initiate request and register in-flight promise
  const promise = (async () => {
    try {
      const data = await fetchFn();
      cacheMap.set(key, { data, timestamp: Date.now() });
      return data;
    } finally {
      inFlightMap.delete(key);
    }
  })();

  inFlightMap.set(key, promise);
  return promise;
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 * @param {string} keyOrPrefix 
 */
export function invalidateQuery(keyOrPrefix) {
  for (const key of cacheMap.keys()) {
    if (key === keyOrPrefix || key.startsWith(`${keyOrPrefix}:`)) {
      cacheMap.delete(key);
    }
  }
}
