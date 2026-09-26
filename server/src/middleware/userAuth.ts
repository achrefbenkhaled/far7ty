import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-jwt-secret';

export interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string };
    }
  }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function extractToken(request: Request): string | undefined {
  const header = request.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return undefined;
}

export async function userAuth(request: Request, response: Response, next: NextFunction) {
  const token = extractToken(request);
  if (!token) return response.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return response.status(401).json({ message: 'User not found' });
    request.user = { id: user.id, email: user.email, name: user.name };
    return next();
  } catch {
    return response.status(401).json({ message: 'Invalid or expired token' });
  }
}

export async function optionalUserAuth(request: Request, _response: Response, next: NextFunction) {
  const token = extractToken(request);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (user) request.user = { id: user.id, email: user.email, name: user.name };
  } catch {
    // Ignore invalid tokens for optional auth
  }
  return next();
}
