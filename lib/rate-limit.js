const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 8;
const buckets = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const bucket = buckets.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };

  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + RATE_WINDOW_MS;
  }

  bucket.count += 1;
  buckets.set(ip, bucket);

  if (buckets.size > 5000) {
    for (const [key, val] of buckets) {
      if (now > val.reset) buckets.delete(key);
    }
  }

  return bucket.count > RATE_MAX;
}

module.exports = { isRateLimited, getClientIp };
