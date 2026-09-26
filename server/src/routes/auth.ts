import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signToken, JwtPayload } from '../middleware/userAuth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

router.post('/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ message: 'Invalid input', errors: parse.error.errors });
  const { name, email, password } = parse.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  const token = signToken({ userId: user.id, email: user.email } as JwtPayload);
  return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

router.post('/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ message: 'Invalid input', errors: parse.error.errors });
  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken({ userId: user.id, email: user.email } as JwtPayload);
  return res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

router.get('/me', async (req, res) => {
  // auth middleware will set req.user
  // Assume this route is protected by userAuth in app.ts
  // We'll just read from req.user
  // The middleware is applied in index.ts
  // If not present, respond 401
  // @ts-ignore
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  return res.json({ user });
});

export default router;
