import sharp from 'sharp';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15 MB

export async function processImage(
  buffer: Buffer,
  mimeType: string,
): Promise<{ buffer: Buffer; width: number; height: number; mimeType: string; size: number }> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  const result = await sharp(buffer)
    .rotate() // auto-rotate based on EXIF
    .resize({
      width: 2048,
      height: 2048,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    mimeType: 'image/webp',
    size: result.info.size,
  };
}
