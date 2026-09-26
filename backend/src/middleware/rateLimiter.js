// rateLimiter.js
//
// Middleware = code that runs BETWEEN the incoming request and the
// controller (same pattern as authMiddleware.js). This one limits how
// many times a user can hit an expensive route (one that triggers an
// LLM call) within a time window, using Redis as a shared counter.

const { redisClient } = require("../config/redis");

const RATE_LIMIT = 20;
const WINDOW_SECONDS = 60;

const rateLimiter = async (req, res, next) => {
  try {
    // authMiddleware.js sets req.user = decoded JWT payload, which is
    // { id: userId } — NOT { _id: userId }. req.ip is only a fallback
    // for the (currently nonexistent) case of an unauthenticated route.
    const userId = req.user?.id || req.ip;

    const key = `rate-limit:${userId}`;

    const currentCount = await redisClient.incr(key);

    if (currentCount === 1) {
      await redisClient.expire(key, WINDOW_SECONDS);
    }

    if (currentCount > RATE_LIMIT) {
      return res.status(429).json({
        message: "Too many requests. Please try again later."
      });
    }

    next();
  } catch (error) {
    // Fail-open: if Redis itself is down, don't block real users over
    // an infrastructure problem in a dev/small-scale project.
    console.error("Rate limiter error:", error);
    next();
  }
};

module.exports = rateLimiter;