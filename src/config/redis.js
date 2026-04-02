const Redis = require('ioredis');

let redis = null;

function getRedisClient() {
  if (redis) return redis;

  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redis.on('error', (err) => {
    console.error('⚠️  Redis error:', err.message);
  });

  return redis;
}

// Cache helper: get from cache or fetch from source
async function cacheGet(key) {
  try {
    const client = getRedisClient();
    const cached = await client.get(key);
    if (cached) return JSON.parse(cached);
    return null;
  } catch (err) {
    console.error('Redis cacheGet error:', err.message);
    return null;
  }
}

async function cacheSet(key, data, ttlSeconds = 300) {
  try {
    const client = getRedisClient();
    await client.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Redis cacheSet error:', err.message);
  }
}

async function cacheDel(pattern) {
  try {
    const client = getRedisClient();
    if (pattern.includes('*')) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      await client.del(pattern);
    }
  } catch (err) {
    console.error('Redis cacheDel error:', err.message);
  }
}

async function connectRedis() {
  try {
    const client = getRedisClient();
    await client.connect();
  } catch (err) {
    console.warn('⚠️  Redis not available, running without cache:', err.message);
  }
}

module.exports = { getRedisClient, cacheGet, cacheSet, cacheDel, connectRedis };
