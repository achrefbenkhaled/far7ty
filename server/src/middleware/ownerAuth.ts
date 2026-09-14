import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const COOKIE_NAME = 'invly_manage_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const sessions = new Map<string, number>();
const attempts = new Map<string, { count: number; resetAt: number }>();

const getCookie = (request: Request, name: string) => {
  const cookies = request.headers.cookie?.split(';') ?? [];
  const cookie = cookies.find((entry) => entry.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : undefined;
};

const sessionKey = (token: string) => crypto.createHmac('sha256', process.env.SESSION_SECRET ?? 'development-session-secret').update(token).digest('hex');

export function createOwnerSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionKey(token), Date.now() + SESSION_TTL_MS);
  return token;
}

export function clearOwnerSession(token?: string) {
  if (token) sessions.delete(sessionKey(token));
}

export function setOwnerSessionCookie(response: Response, token: string) {
  const secure = process.env.NODE_ENV === 'production';
  response.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; SameSite=Strict${secure ? '; Secure' : ''}`);
}

export function clearOwnerSessionCookie(response: Response) {
  response.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`);
}

export function isLoginRateLimited(key: string) {
  const current = attempts.get(key);
  if (!current || current.resetAt <= Date.now()) {
    attempts.set(key, { count: 0, resetAt: Date.now() + 15 * 60 * 1000 });
    return false;
  }
  return current.count >= 10;
}

export function recordLoginAttempt(key: string) {
  const current = attempts.get(key) ?? { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
  attempts.set(key, { ...current, count: current.count + 1 });
}

export function ownerAuth(request: Request, response: Response, next: NextFunction) {
  const token = getCookie(request, COOKIE_NAME);
  const expiresAt = token ? sessions.get(sessionKey(token)) : undefined;
  if (!token || !expiresAt || expiresAt <= Date.now()) {
    if (token) sessions.delete(sessionKey(token));
    return response.status(401).json({ message: 'Owner authentication required' });
  }
  return next();
}

export function getOwnerSessionToken(request: Request) {
  return getCookie(request, COOKIE_NAME);
}