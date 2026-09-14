import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { clearOwnerSession, clearOwnerSessionCookie, createOwnerSession, getOwnerSessionToken, isLoginRateLimited, ownerAuth, recordLoginAttempt, setOwnerSessionCookie } from '../middleware/ownerAuth.js';

const router = Router();
const loginSchema = z.object({ username: z.string().min(1).max(100), password: z.string().min(1).max(200) });

router.post('/login', async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: 'Username and password are required' });

  const key = `${request.ip}:${parsed.data.username}`;
  if (isLoginRateLimited(key)) return response.status(429).json({ message: 'Too many login attempts. Try again later.' });
  recordLoginAttempt(key);

  const usernameMatches = parsed.data.username === process.env.MANAGE_USERNAME;
  const passwordMatches = process.env.MANAGE_PASSWORD_HASH ? await bcrypt.compare(parsed.data.password, process.env.MANAGE_PASSWORD_HASH) : false;
  if (!usernameMatches || !passwordMatches) return response.status(401).json({ message: 'Invalid owner credentials' });

  setOwnerSessionCookie(response, createOwnerSession());
  return response.json({ authenticated: true });
});

router.post('/logout', (request, response) => {
  clearOwnerSession(getOwnerSessionToken(request));
  clearOwnerSessionCookie(response);
  return response.json({ authenticated: false });
});

router.get('/session', ownerAuth, (_request, response) => response.json({ authenticated: true }));

export default router;