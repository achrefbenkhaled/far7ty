import { Router } from 'express';
import { InvitationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const router = Router();

const invitations = [
  {
    id: 'inv-001',
    title: 'Aisha & Omar Wedding',
    status: 'published',
    guests: 248,
    slug: 'aisha-omar-wedding'
  }
];

router.get('/', (_req, res) => {
  res.json({ invitations });
});

router.get('/:slug', async (req, res) => {
  const previewToken = typeof req.query.preview === 'string' ? req.query.preview : undefined;
  const invitation = await prisma.invitation.findFirst({
    where: {
      slug: req.params.slug,
      OR: [
        { status: 'PUBLISHED' },
        ...(previewToken ? [{ previewToken, status: { in: [InvitationStatus.DRAFT, InvitationStatus.PREVIEW, InvitationStatus.CHANGES_REQUESTED, InvitationStatus.APPROVED, InvitationStatus.PUBLISHED] } }] : []),
      ],
    },
  });
  if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
  return res.json({ invitation: { id: invitation.id, slug: invitation.slug, templateId: invitation.templateId, eventType: invitation.eventType, data: invitation.data, publishedAt: invitation.publishedAt } });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Invitation created', invitation: { ...req.body, id: crypto.randomUUID() } });
});

export default router;
