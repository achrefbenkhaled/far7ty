import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ownerAuth } from '../middleware/ownerAuth.js';
import { deleteFromR2, getSignedMediaUrl } from '../lib/r2.js';

const router = Router();
router.use(ownerAuth);

// Enable memories for an invitation, generate token if needed
router.post('/:id/memories/enable', async (req, res) => {
  const { id } = req.params;
  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
  const updates: any = { memoriesEnabled: true };
  if (!invitation.memoriesToken) {
    updates.memoriesToken = crypto.randomBytes(24).toString('hex');
  }
  const updated = await prisma.invitation.update({ where: { id }, data: updates });
  return res.json({ invitation: {
    id: updated.id,
    memoriesEnabled: updated.memoriesEnabled,
    memoriesToken: updated.memoriesToken,
    guestUploadsEnabled: updated.guestUploadsEnabled,
    storageQuotaBytes: Number(updated.storageQuotaBytes),
  } });
});

// Disable memories
router.post('/:id/memories/disable', async (req, res) => {
  const { id } = req.params;
  const invitation = await prisma.invitation.update({
    where: { id },
    data: { memoriesEnabled: false },
  });
  return res.json({ invitation: { id: invitation.id, memoriesEnabled: invitation.memoriesEnabled } });
});

// Update settings (guest uploads toggle, storage quota)
router.patch('/:id/memories/settings', async (req, res) => {
  const { id } = req.params;
  const schema = z.object({
    guestUploadsEnabled: z.boolean().optional(),
    storageQuotaBytes: z.number().int().nonnegative().optional(),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ message: 'Invalid input', errors: parse.error.errors });
  const data: any = {};
  if (parse.data.guestUploadsEnabled !== undefined) data.guestUploadsEnabled = parse.data.guestUploadsEnabled;
  if (parse.data.storageQuotaBytes !== undefined) data.storageQuotaBytes = BigInt(parse.data.storageQuotaBytes);
  const updated = await prisma.invitation.update({ where: { id }, data });
  return res.json({ invitation: {
    id: updated.id,
    guestUploadsEnabled: updated.guestUploadsEnabled,
    storageQuotaBytes: Number(updated.storageQuotaBytes),
  } });
});

// Get QR URL for guests
router.get('/:id/memories/qr', async (req, res) => {
  const { id } = req.params;
  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
  if (!invitation.memoriesEnabled || !invitation.memoriesToken) {
    return res.status(400).json({ message: 'Memories not enabled' });
  }
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const url = `${clientUrl}/memories/${invitation.memoriesToken}`;
  return res.json({ url, memoriesToken: invitation.memoriesToken });
});

// Get storage usage for admin view
router.get('/:id/memories/storage', async (req, res) => {
  const { id } = req.params;
  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
  const sum = await prisma.eventMedia.aggregate({
    _sum: { fileSize: true },
    where: { invitationId: id },
  });
  const used = Number(sum._sum.fileSize ?? 0);
  const quota = Number(invitation.storageQuotaBytes);
  const remaining = Math.max(0, quota - used);
  const percentage = quota > 0 ? Math.round((used / quota) * 100) : 0;
  const mediaCount = await prisma.eventMedia.count({ where: { invitationId: id } });
  return res.json({ used, quota, remaining, percentage, mediaCount });
});

// List all media (optionally filter by status)
router.get('/:id/memories/media', async (req, res) => {
  const { id } = req.params;
  const status = req.query.status as string | undefined;
  const where: any = { invitationId: id };
  if (status) where.status = status;
  const media = await prisma.eventMedia.findMany({
    where,
    include: { uploader: true },
    orderBy: { uploadedAt: 'desc' },
  });
  const enriched = await Promise.all(
    media.map(async (m) => ({
      id: m.id,
      fileName: m.fileName,
      mimeType: m.mimeType,
      width: m.width,
      height: m.height,
      status: m.status,
      uploadedAt: m.uploadedAt,
      uploaderName: m.uploader.name,
      url: await getSignedMediaUrl(m.objectKey),
    })),
  );
  return res.json({ media: enriched, total: enriched.length });
});

// Approve / reject a media item
router.patch('/:id/memories/media/:mediaId', async (req, res) => {
  const { id, mediaId } = req.params;
  const schema = z.object({ status: z.enum(['APPROVED', 'REJECTED']) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ message: 'Invalid input', errors: parse.error.errors });
  const media = await prisma.eventMedia.findFirst({ where: { id: mediaId, invitationId: id } });
  if (!media) return res.status(404).json({ message: 'Media not found' });
  const updated = await prisma.eventMedia.update({
    where: { id: mediaId },
    data: { status: parse.data.status, moderatedAt: new Date() },
  });
  return res.json({ media: updated });
});

// Delete a media item (remove from R2 and DB)
router.delete('/:id/memories/media/:mediaId', async (req, res) => {
  const { id, mediaId } = req.params;
  const media = await prisma.eventMedia.findFirst({ where: { id: mediaId, invitationId: id } });
  if (!media) return res.status(404).json({ message: 'Media not found' });
  await deleteFromR2(media.objectKey);
  await prisma.eventMedia.delete({ where: { id: mediaId } });
  return res.status(204).send();
});

export default router;
