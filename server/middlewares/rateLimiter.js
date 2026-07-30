const buckets = new Map();

const rateLimiter = ({ windowMs = 60 * 1000, limit = 120 } = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > limit) {
      return res.status(429).json({ message: "Too many requests. Please wait and try again." });
    }

    next();
  };
};

module.exports = rateLimiter;
