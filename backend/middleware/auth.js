/**
 * JWT Authentication Middleware
 * Provides both strict and optional authentication guards.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medpal_default_secret_change_in_production';

/**
 * Strict auth — blocks request if no valid token.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth — attaches user if token present, continues regardless.
 * Used on existing endpoints so report saving can identify the user
 * without blocking unauthenticated requests.
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (_) {
      // Token invalid — that's fine, continue as anonymous
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
