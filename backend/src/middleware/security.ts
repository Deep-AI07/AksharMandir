import { Request, Response, NextFunction } from 'express';

// 1. In-memory Rate Limiter for Authentication Endpoints
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const authAttempts = new Map<string, RateLimitRecord>();

export const authRateLimiter = (maxAttempts = 20, windowMs = 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only apply rate limiting to sensitive auth POST routes
    if (req.method !== 'POST') return next();

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = authAttempts.get(clientIp);

    if (record) {
      if (now > record.resetTime) {
        authAttempts.set(clientIp, { count: 1, resetTime: now + windowMs });
      } else {
        record.count++;
        if (record.count > maxAttempts) {
          const retryAfter = Math.ceil((record.resetTime - now) / 1000);
          res.setHeader('Retry-After', retryAfter);
          res.status(429).json({
            success: false,
            message: `Too many authentication attempts. Please try again after ${retryAfter} seconds.`
          });
          return;
        }
      }
    } else {
      authAttempts.set(clientIp, { count: 1, resetTime: now + windowMs });
    }

    next();
  };
};

// 2. Sensitive Path Traversal & File Protection Middleware
export const sensitiveFileGuard = (req: Request, res: Response, next: NextFunction): void => {
  const url = decodeURIComponent(req.originalUrl || req.url).toLowerCase();

  // Check for directory traversal sequences
  if (url.includes('..') || url.includes('/.') || url.includes('\\.') || url.includes('%2e%2e')) {
    res.status(403).json({
      success: false,
      message: 'Access Forbidden: Directory traversal is not permitted.'
    });
    return;
  }

  // Block requests for sensitive database, environment, or system configuration files
  const restrictedPatterns = [
    /\.env/i,
    /\.db($|\?)/i,
    /\.sqlite/i,
    /\.prisma/i,
    /prisma[\\\/]/i,
    /\.git/i,
    /\.svn/i,
    /credential/i,
    /package\.json/i,
    /tsconfig/i,
    /\.sql($|\?)/i
  ];

  for (const pattern of restrictedPatterns) {
    if (pattern.test(url)) {
      res.status(403).json({
        success: false,
        message: 'Access Forbidden: Target system resource is restricted.'
      });
      return;
    }
  }

  next();
};

// 3. Security Headers Middleware (Helmet-equivalent hardening)
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent browsers from MIME-sniffing the response
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking by restricting iframing
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Enable built-in XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Feature policy / Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  next();
};

// 4. Input & Query Parameter Sanitizer
// Strips prototype pollution, null bytes, and converts malicious objects to safe primitives
export const inputSanitizer = (req: Request, res: Response, next: NextFunction): void => {
  const sanitize = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key of Object.keys(obj)) {
      // Prevent Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        delete obj[key];
        continue;
      }

      if (typeof obj[key] === 'string') {
        // Strip null-byte characters that can confuse file systems or parsers
        obj[key] = obj[key].replace(/\0/g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};
