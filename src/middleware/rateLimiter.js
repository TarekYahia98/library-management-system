const rateLimit = require('express-rate-limit');

// Rate limiter for search endpoints (15 minutes, max 50 requests)
const searchRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: 'Too many search requests',
    message: 'Please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests too
});

// Rate limiter for checkout endpoints (1 hour, max 20 requests)
const checkoutRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 checkouts per hour
  message: {
    success: false,
    error: 'Too many checkout requests',
    message: 'Please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter for all other authenticated endpoints
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  searchRateLimiter,
  checkoutRateLimiter,
  generalRateLimiter
};