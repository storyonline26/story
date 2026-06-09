import jwt from 'jsonwebtoken';
import { env, isProduction } from '../config/env.js';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

export const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: env.cookieDomain,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const setAdminAuthCookie = (res, token) => {
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: env.cookieDomain,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: env.cookieDomain
  });
};

export const clearAdminAuthCookie = (res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    domain: env.cookieDomain
  });
};

const getToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);
  return req.cookies?.token;
};

const getAdminToken = (req) => req.cookies?.admin_token;

const requireSession = (tokenGetter) => async (req, _res, next) => {
  try {
    const token = tokenGetter(req);
    if (!token) throw new ApiError(401, 'Not authenticated');

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.isActive) throw new ApiError(401, 'Account unavailable');

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, 'Invalid or expired session'));
  }
};

export const requireAuth = requireSession(getToken);

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') {
    next(new ApiError(403, 'Admin access required'));
    return;
  }
  next();
};

export const requireAdminAuth = [requireSession(getAdminToken), requireAdmin];
