import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { userAuth } from '../middleware/userAuth.js';
import { uploadToR2, getSignedMediaUrl } from '../lib/r2.js';
import { processImage, ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE } from '../lib/imageProcessor.js';

const router = Router();

// Multer memory storage, 15 MiB limit
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_SIZE } });

// Helper to fetch invitation by memoriesToken
async function findInvitation(token: string) {
  return prisma.invitation.findUnique({ where: { memoriesToken: token } });
}

// ==== Public GET event info ====
router.get('/:token', async (req, res) => {
  const { token } = req.params;
  const invitation = await findInvitation(token);
  if (!invitation || !invitation.memoriesEnabled) {
    return res.status(404).json({ message: 'Memories not available for this event' });
  }
  const { slug, eventType, clientName, guestUploadsEnabled, templateId, memoriesEnabled } = invitation;
  return res.json({ event: { slug, eventType, clientName, guestUploadsEnabled, templateId, memoriesEnabled } });
});

// ==== Public GET gallery (approved only) ====
router.get('/:token/gallery', async (req, res) => {
  const { token } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const invitation = await findInvitation(token);
  if (!invitation) return res.status(404).json({ message: 'Event not found' });

  const media = await prisma.eventMedia.findMany({
    where: { invitationId: invitation.id, status: 'APPROVED' },
    orderBy: { uploadedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    include: { uploader: true },
  });

  const total = await prisma.eventMedia.count({ where: { invitationId: invitation.id, status: 'APPROVED' } });
  const totalPages = Math.ceil(total / limit);

  const enriched = await Promise.all(
    media.map(async (m) => {
      const url = await getSignedMediaUrl(m.objectKey);
      return {
        id: m.id,
        fileName: m.fileName,
        mimeType: m.mimeType,
        width: m.width,
        height: m.height,
        url,
        uploaderName: m.uploader.name,
        uploadedAt: m.uploadedAt,
        status: m.status,
      };
    }),
  );

  return res.json({ media: enriched, page, totalPages, total });
});

// ==== POST upload (requires login) ====
router.post('/:token/upload', userAuth, upload.single('photo'), async (req, res) => {
  const { token } = req.params;
  const invitation = await findInvitation(token);
  if (!invitation) return res.status(404).json({ message: 'Event not found' });
  if (!invitation.memoriesEnabled) return res.status(400).json({ message: 'Memories disabled for this event' });
  if (!invitation.guestUploadsEnabled) return res.status(403).json({ message: 'Guest uploads are disabled' });

  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No file provided' });
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return res.status(400).json({ message: `Unsupported MIME type ${file.mimetype}` });
  }

  // Compute current storage usage
  const usageResult = await prisma.eventMedia.aggregate({
    _sum: { fileSize: true },
    where: { invitationId: invitation.id },
  });
  const currentUsage = Number(usageResult._sum.fileSize ?? 0);
  if (currentUsage + file.size > Number(invitation.storageQuotaBytes)) {
    return res.status(413).json({
      message: 'Event storage is full. Contact the event organizer to upgrade storage.',
      currentUsage,
      quota: Number(invitation.storageQuotaBytes),
      remaining: Number(invitation.storageQuotaBytes) - currentUsage,
    });
  }

  // Process image
  let processed;
  try {
    processed = await processImage(file.buffer, file.mimetype);
  } catch (e) {
    return res.status(400).json({ message: e instanceof Error ? e.message : 'Image processing failed' });
  }

  const objectKey = `events/${invitation.id}/${crypto.randomUUID()}.webp`;
  await uploadToR2(objectKey, processed.buffer, processed.mimeType);

  const media = await prisma.eventMedia.create({
    data: {
      invitationId: invitation.id,
      uploaderId: (req as any).user.id,
      objectKey,
      fileName: file.originalname,
      mimeType: processed.mimeType,
      fileSize: BigInt(processed.size),
      width: processed.width,
      height: processed.height,
      status: 'PENDING',
    },
  });

  return res.status(201).json({ media: { id: media.id, fileName: media.fileName, status: media.status, uploadedAt: media.uploadedAt } });
});

// ==== Public GET storage usage ====
router.get('/:token/storage', async (req, res) => {
  const { token } = req.params;
  const invitation = await findInvitation(token);
  if (!invitation) return res.status(404).json({ message: 'Event not found' });
  const sum = await prisma.eventMedia.aggregate({
    _sum: { fileSize: true },
    where: { invitationId: invitation.id },
  });
  const used = Number(sum._sum.fileSize ?? 0);
  const quota = Number(invitation.storageQuotaBytes);
  const remaining = Math.max(0, quota - used);
  const percentage = quota > 0 ? Math.round((used / quota) * 100) : 0;
  return res.json({ used, quota, remaining, percentage });
});

export default router;
