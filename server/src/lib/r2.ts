import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as s3GetSignedUrl } from '@aws-sdk/s3-request-presigner';

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
      },
    });
  }
  return client;
}

const bucket = () => process.env.R2_BUCKET_NAME ?? 'invly-memories';

export async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<void> {
  await getClient().send(new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
}

export async function getSignedMediaUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket(), Key: key });
  return s3GetSignedUrl(getClient(), command, { expiresIn });
}

export async function deleteFromR2(key: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

export async function deleteMultipleFromR2(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await getClient().send(new DeleteObjectsCommand({
    Bucket: bucket(),
    Delete: { Objects: keys.map((Key) => ({ Key })) },
  }));
}
