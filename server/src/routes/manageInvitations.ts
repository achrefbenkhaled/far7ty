import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ownerAuth } from '../middleware/ownerAuth.js';

const router = Router();
const statuses = ['DRAFT', 'PREVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED'] as const;
const invitationSchema = z.object({
  slug: z.string().trim().min(3).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  templateId: z.string().trim().min(1).max(100),
  status: z.enum(statuses).default('DRAFT'),
  clientName: z.string().trim().min(1).max(150),
  clientPhone: z.string().trim().min(3).max(40),
  clientEmail: z.string().email().optional().or(z.literal('')),
  eventType: z.string().trim().min(1).max(80),
  data: z.record(z.unknown()),
});

const slugify = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'invitation';
const toJsonInput = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

async function uniqueSlug(seed: string, currentId?: string) {
  const base = slugify(seed);
  let slug = base;
  let suffix = 2;
  while (true) {
    const existing = await prisma.invitation.findUnique({ where: { slug } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${suffix++}`;
  }
}

router.use(ownerAuth);

router.get('/', async (_request, response) => response.json({ invitations: await prisma.invitation.findMany({ orderBy: { updatedAt: 'desc' } }) }));

router.post('/', async (request, response) => {
  const parsed = invitationSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: 'Invalid invitation data', issues: parsed.error.flatten() });
  const slug = await uniqueSlug(parsed.data.slug ?? `${parsed.data.clientName}-${parsed.data.templateId}`);
  const invitation = await prisma.invitation.create({ data: { ...parsed.data, slug, previewToken: crypto.randomBytes(24).toString('hex'), clientEmail: parsed.data.clientEmail || null, data: toJsonInput(parsed.data.data) } });
  return response.status(201).json({ invitation });
});

router.get('/:id', async (request, response) => {
  const invitation = await prisma.invitation.findUnique({ where: { id: request.params.id } });
  return invitation ? response.json({ invitation }) : response.status(404).json({ message: 'Invitation not found' });
});

router.patch('/:id', async (request, response) => {
  const parsed = invitationSchema.partial().safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: 'Invalid invitation data', issues: parsed.error.flatten() });
  const current = await prisma.invitation.findUnique({ where: { id: request.params.id } });
  if (!current) return response.status(404).json({ message: 'Invitation not found' });
  const slug = parsed.data.slug ? await uniqueSlug(parsed.data.slug, current.id) : current.slug;
  const invitation = await prisma.invitation.update({ where: { id: current.id }, data: { ...parsed.data, slug, clientEmail: parsed.data.clientEmail === '' ? null : parsed.data.clientEmail, data: toJsonInput(parsed.data.data ?? current.data) } });
  return response.json({ invitation });
});

router.delete('/:id', async (request, response) => {
  await prisma.invitation.delete({ where: { id: request.params.id } }).catch(() => null);
  return response.status(204).send();
});

router.post('/:id/publish', async (request, response) => {
  const invitation = await prisma.invitation.update({ where: { id: request.params.id }, data: { status: 'PUBLISHED', publishedAt: new Date() } }).catch(() => null);
  return invitation ? response.json({ invitation }) : response.status(404).json({ message: 'Invitation not found' });
});

router.post('/:id/unpublish', async (request, response) => {
  const invitation = await prisma.invitation.update({ where: { id: request.params.id }, data: { status: 'APPROVED', publishedAt: null } }).catch(() => null);
  return invitation ? response.json({ invitation }) : response.status(404).json({ message: 'Invitation not found' });
});

export default router;