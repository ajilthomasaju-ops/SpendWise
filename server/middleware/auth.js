import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { findUserById, isOwnerAdminEmail } from '../db/store.js';

// A random per-process secret is acceptable only for local development.
// Production must always provide a stable, high-entropy JWT_SECRET.
const DEVELOPMENT_SECRET = randomBytes(48).toString('hex');

function getJwtSecret() {
  const configuredSecret = process.env.JWT_SECRET?.trim();
  if (configuredSecret) return configuredSecret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }

  return DEVELOPMENT_SECRET;
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '7d' });
}

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication token is required.' });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Invalid authorization header.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded || typeof decoded === 'string' || !decoded.sub) {
      res.status(401).json({ error: 'Invalid authentication token.' });
      return;
    }

    const user = await findUserById(decoded.sub);
    if (!user) {
      res.status(401).json({ error: 'Account no longer exists.' });
      return;
    }

    if (user.status === 'suspended' && !isOwnerAdminEmail(user.email)) {
      res.status(403).json({
        error: 'This account has been suspended by the administrator.',
      });
      return;
    }

    req.userId = user._id;
    req.currentUser = user;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired or invalid token.' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.currentUser || !isOwnerAdminEmail(req.currentUser.email)) {
    res.status(403).json({
      error: 'Access denied. Restricted to the SpendWise owner administrator.',
    });
    return;
  }
  next();
}
