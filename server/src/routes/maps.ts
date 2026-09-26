import { Router } from 'express';
import { z } from 'zod';
import { isAllowedMapsUrl, resolveMapsLocation } from '../lib/mapsLocation.js';

const router = Router();

const resolveSchema = z
  .object({
    url: z.string().trim().max(2000).optional(),
    query: z.string().trim().max(400).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  })
  .refine((value) => Boolean(value.url || value.query || (value.latitude !== undefined && value.longitude !== undefined)), {
    message: 'A Google Maps URL, search query, or coordinates are required',
  });

const resolveAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string) {
  if (process.env.NODE_ENV !== 'production' || key === '::1' || key === '127.0.0.1' || key.includes('localhost')) {
    return false;
  }
  const current = resolveAttempts.get(key);
  if (!current || current.resetAt <= Date.now()) {
    resolveAttempts.set(key, { count: 1, resetAt: Date.now() + 10 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 100;
}

router.post('/resolve', async (request, response) => {
  const clientKey = request.ip || request.headers['x-forwarded-for']?.toString() || 'unknown';
  if (isRateLimited(clientKey)) {
    return response.status(429).json({ message: 'Too many location lookups. Please try again later.' });
  }

  const parsed = resolveSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid location request', issues: parsed.error.flatten() });
  }

  if (parsed.data.url && !isAllowedMapsUrl(parsed.data.url)) {
    return response.status(400).json({ message: 'Only Google Maps URLs are allowed' });
  }

  try {
    const location = await resolveMapsLocation(parsed.data);
    if (!location) {
      return response.status(422).json({
        message: 'تعذر تحديد الموقع تلقائياً. يرجى اختيار موقع الحفل على الخريطة.',
        location: null,
      });
    }
    return response.json({ location });
  } catch {
    return response.status(502).json({ message: 'Google Maps lookup failed', location: null });
  }
});

export default router;
