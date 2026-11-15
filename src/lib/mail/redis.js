/**
 * Zero-dependency Upstash Redis client using native fetch over HTTPS REST.
 * Provides environment key prefixing and in-memory mock fallback for local testing.
 */

/**
 * Key prefix helper for environment isolation.
 * Prefixes keys with 'preview:' in non-production environments to protect live production data.
 *
 * @param {string} keyName Raw Redis key name
 * @returns {string} Environment-isolated key name
 */
export function k(keyName) {
  if (!keyName || typeof keyName !== 'string') {
    return keyName;
  }
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
  if (env !== 'production') {
    if (keyName.startsWith('preview:')) {
      return keyName;
    }
    return `preview:${keyName}`;
  }
  return keyName;
}

// In-memory datastore fallback for offline testing and local development
const mockStore = new Map();
const mockExpiry = new Map();

/**
 * Clears the in-memory mock store. Useful during test suites.
 */
export function clearMockStore() {
  mockStore.clear();
  mockExpiry.clear();
}

/**
 * Normalises HGETALL responses from Upstash REST into a plain JavaScript object.
 *
 * @param {Array|Object|null} result Raw result from Redis
 * @returns {Object} Normalised key-value dictionary
 */
function normaliseHash(result) {
  if (!result) return {};
  if (Array.isArray(result)) {
    const hash = {};
    for (let i = 0; i < result.length; i += 2) {
      if (i + 1 < result.length) {
        hash[result[i]] = result[i + 1];
      }
    }
    return hash;
  }
  if (typeof result === 'object') {
    return result;
  }
  return {};
}

/**
 * Executes a single command against the in-memory mock store.
 *
 * @param {string} command Redis command name
 * @param {Array} args Command arguments
 * @returns {any} Mock command result
 */
function executeMockCommand(command, args) {
  const cmd = command.toUpperCase();
  const [key, ...rest] = args;

  // Check TTL expiration
  if (mockExpiry.has(key) && Date.now() > mockExpiry.get(key)) {
    mockStore.delete(key);
    mockExpiry.delete(key);
  }

  switch (cmd) {
    case 'GET': {
      return mockStore.get(key) ?? null;
    }
    case 'SET': {
      const [val, opt1, opt2] = rest;
      mockStore.set(key, String(val));
      if (opt1 && opt1.toUpperCase() === 'EX' && opt2) {
        mockExpiry.set(key, Date.now() + Number(opt2) * 1000);
      }
      return 'OK';
    }
    case 'DEL': {
      let count = 0;
      for (const k of [key, ...rest]) {
        if (mockStore.delete(k)) count++;
        mockExpiry.delete(k);
      }
      return count;
    }
    case 'EXISTS': {
      return mockStore.has(key) ? 1 : 0;
    }
    case 'EXPIRE': {
      const seconds = Number(rest[0]);
      if (mockStore.has(key)) {
        mockExpiry.set(key, Date.now() + seconds * 1000);
        return 1;
      }
      return 0;
    }
    case 'INCR': {
      const current = Number(mockStore.get(key) || 0);
      const next = current + 1;
      mockStore.set(key, String(next));
      return next;
    }
    case 'HGET': {
      const hash = mockStore.get(key);
      if (!(hash instanceof Map)) return null;
      return hash.get(rest[0]) ?? null;
    }
    case 'HSET': {
      let hash = mockStore.get(key);
      if (!(hash instanceof Map)) {
        hash = new Map();
        mockStore.set(key, hash);
      }
      let fieldsAdded = 0;
      if (typeof rest[0] === 'object' && !Array.isArray(rest[0])) {
        for (const [f, v] of Object.entries(rest[0])) {
          if (!hash.has(f)) fieldsAdded++;
          hash.set(f, String(v));
        }
      } else {
        for (let i = 0; i < rest.length; i += 2) {
          if (i + 1 < rest.length) {
            if (!hash.has(rest[i])) fieldsAdded++;
            hash.set(rest[i], String(rest[i + 1]));
          }
        }
      }
      return fieldsAdded;
    }
    case 'HGETALL': {
      const hash = mockStore.get(key);
      if (!(hash instanceof Map)) return {};
      const obj = {};
      for (const [f, v] of hash.entries()) {
        obj[f] = v;
      }
      return obj;
    }
    case 'HINCRBY': {
      let hash = mockStore.get(key);
      if (!(hash instanceof Map)) {
        hash = new Map();
        mockStore.set(key, hash);
      }
      const field = rest[0];
      const amount = Number(rest[1] || 1);
      const curr = Number(hash.get(field) || 0);
      const updated = curr + amount;
      hash.set(field, String(updated));
      return updated;
    }
    case 'LPUSH': {
      let list = mockStore.get(key);
      if (!Array.isArray(list)) {
        list = [];
        mockStore.set(key, list);
      }
      for (const item of rest) {
        list.unshift(String(item));
      }
      return list.length;
    }
    case 'LRANGE': {
      const list = mockStore.get(key);
      if (!Array.isArray(list)) return [];
      const start = Number(rest[0]);
      const stop = Number(rest[1]);
      const end = stop === -1 ? undefined : stop + 1;
      return list.slice(start, end);
    }
    case 'SADD': {
      let set = mockStore.get(key);
      if (!(set instanceof Set)) {
        set = new Set();
        mockStore.set(key, set);
      }
      let added = 0;
      for (const member of rest) {
        if (!set.has(String(member))) {
          set.add(String(member));
          added++;
        }
      }
      return added;
    }
    case 'SREM': {
      const set = mockStore.get(key);
      if (!(set instanceof Set)) return 0;
      let removed = 0;
      for (const member of rest) {
        if (set.delete(String(member))) removed++;
      }
      return removed;
    }
    case 'SMEMBERS': {
      const set = mockStore.get(key);
      if (!(set instanceof Set)) return [];
      return Array.from(set);
    }
    case 'ZADD': {
      let zset = mockStore.get(key);
      if (!(zset instanceof Map)) {
        zset = new Map();
        mockStore.set(key, zset);
      }
      const score = Number(rest[0]);
      const member = String(rest[1]);
      const isNew = !zset.has(member);
      zset.set(member, score);
      return isNew ? 1 : 0;
    }
    case 'ZINCRBY': {
      let zset = mockStore.get(key);
      if (!(zset instanceof Map)) {
        zset = new Map();
        mockStore.set(key, zset);
      }
      const inc = Number(rest[0]);
      const member = String(rest[1]);
      const current = Number(zset.get(member) || 0);
      const next = current + inc;
      zset.set(member, next);
      return next;
    }
    case 'ZREVRANGE': {
      const zset = mockStore.get(key);
      if (!(zset instanceof Map)) return [];
      const entries = Array.from(zset.entries()).sort((a, b) => b[1] - a[1]);
      const start = Number(rest[0]);
      const stop = Number(rest[1]);
      const withScores = rest[2]?.toUpperCase() === 'WITHSCORES';
      const sliced = stop === -1 ? entries.slice(start) : entries.slice(start, stop + 1);

      if (withScores) {
        const flat = [];
        for (const [m, s] of sliced) {
          flat.push(m, String(s));
        }
        return flat;
      }
      return sliced.map(([m]) => m);
    }
    default: {
      return null;
    }
  }
}

/**
 * Checks whether live Upstash Redis credentials are configured.
 *
 * @returns {boolean} True if live REST connection is possible
 */
function hasLiveConfig() {
  if (process.env.USE_MOCK_REDIS === 'true') {
    return false;
  }
  return Boolean(
    process.env.UPSTASH_REDIS_KV_REST_API_URL &&
    process.env.UPSTASH_REDIS_KV_REST_API_TOKEN
  );
}

/**
 * Sends a single raw command array to Upstash Redis REST.
 *
 * @param {string} command Redis command
 * @param {...any} args Command parameters
 * @returns {Promise<any>} Response result or null on failure
 */
export async function executeCommand(command, ...args) {
  if (!hasLiveConfig()) {
    return executeMockCommand(command, args);
  }

  const url = process.env.UPSTASH_REDIS_KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_KV_REST_API_TOKEN;

  const timeoutMs = process.env.REDIS_TIMEOUT_MS
    ? Number(process.env.REDIS_TIMEOUT_MS)
    : (process.env.VERCEL_ENV === 'production' ? 1500 : 10000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([command, ...args]),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!res.ok) {
      console.warn(`[MailTracker:Redis] Upstash returned status ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (json.error) {
      console.warn(`[MailTracker:Redis] Upstash error: ${json.error}`);
      return null;
    }
    return json.result;
  } catch (err) {
    console.warn(`[MailTracker:Redis] Fail-open: command ${command} failed (${err.message})`);
    return null;
  }
}

/**
 * Sends a pipeline batch array of commands to Upstash Redis REST.
 *
 * @param {Array<Array>} commands Array of command arrays
 * @returns {Promise<Array>} Array of command results
 */
export async function pipeline(commands) {
  if (!Array.isArray(commands) || commands.length === 0) {
    return [];
  }

  if (!hasLiveConfig()) {
    return commands.map(([cmd, ...args]) => executeMockCommand(cmd, args));
  }

  const url = process.env.UPSTASH_REDIS_KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_KV_REST_API_TOKEN;

  const timeoutMs = process.env.REDIS_TIMEOUT_MS
    ? Number(process.env.REDIS_TIMEOUT_MS)
    : (process.env.VERCEL_ENV === 'production' ? 1500 : 10000);

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!res.ok) {
      console.warn(`[MailTracker:Redis] Pipeline returned status ${res.status}`);
      return commands.map(() => null);
    }

    const json = await res.json();
    return json.map(item => (item.error ? null : item.result));
  } catch (err) {
    console.warn(`[MailTracker:Redis] Fail-open: pipeline failed (${err.message})`);
    return commands.map(() => null);
  }
}

// High-level convenience methods

export async function get(key) {
  return executeCommand('GET', k(key));
}

export async function set(key, value, options = {}) {
  const args = [k(key), value];
  if (options.ex) {
    args.push('EX', options.ex);
  }
  return executeCommand('SET', ...args);
}

export async function del(key) {
  return executeCommand('DEL', k(key));
}

export async function exists(key) {
  return executeCommand('EXISTS', k(key));
}

export async function expire(key, seconds) {
  return executeCommand('EXPIRE', k(key), seconds);
}

export async function incr(key) {
  return executeCommand('INCR', k(key));
}

export async function hget(key, field) {
  return executeCommand('HGET', k(key), field);
}

export async function hset(key, fieldOrObj, val) {
  if (typeof fieldOrObj === 'object') {
    const pairs = [];
    for (const [f, v] of Object.entries(fieldOrObj)) {
      pairs.push(f, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
    return executeCommand('HSET', k(key), ...pairs);
  }
  return executeCommand('HSET', k(key), fieldOrObj, String(val));
}

export async function hgetall(key) {
  const res = await executeCommand('HGETALL', k(key));
  return normaliseHash(res);
}

export async function hincrby(key, field, amount = 1) {
  return executeCommand('HINCRBY', k(key), field, amount);
}

export async function lpush(key, ...elements) {
  return executeCommand('LPUSH', k(key), ...elements);
}

export async function lrange(key, start = 0, stop = -1) {
  const res = await executeCommand('LRANGE', k(key), start, stop);
  return Array.isArray(res) ? res : [];
}

export async function sadd(key, ...members) {
  return executeCommand('SADD', k(key), ...members);
}

export async function srem(key, ...members) {
  return executeCommand('SREM', k(key), ...members);
}

export async function smembers(key) {
  const res = await executeCommand('SMEMBERS', k(key));
  return Array.isArray(res) ? res : [];
}

export async function zadd(key, score, member) {
  return executeCommand('ZADD', k(key), score, member);
}

export async function zincrby(key, increment, member) {
  return executeCommand('ZINCRBY', k(key), increment, member);
}

export async function zrevrange(key, start = 0, stop = -1, withScores = false) {
  const args = [k(key), start, stop];
  if (withScores) {
    args.push('WITHSCORES');
  }
  const res = await executeCommand('ZREVRANGE', ...args);
  return Array.isArray(res) ? res : [];
}
