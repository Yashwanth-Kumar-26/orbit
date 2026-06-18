import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";

let _client: S3Client | null = null;

function ensureR2Config() {
  if (!env.R2_ENDPOINT || !env.R2_ACCESS_KEY || !env.R2_SECRET_KEY || !env.R2_BUCKET) {
    throw new Error(
      "Cloudflare R2 not configured. Set R2_BUCKET, R2_ENDPOINT, R2_ACCESS_KEY, and R2_SECRET_KEY in .env.local",
    );
  }
}

function getClient(): S3Client {
  ensureR2Config();
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY!,
        secretAccessKey: env.R2_SECRET_KEY!,
      },
      forcePathStyle: true,
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
  }
  return _client;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const MAX_SIZE = 10 * 1024 * 1024;

export type UploadValidation =
  | { valid: true; key: string; contentType: string }
  | { valid: false; error: string };

export function validateUpload(
  contentType: string,
  size: number,
): UploadValidation {
  if (!ALLOWED_TYPES.includes(contentType as typeof ALLOWED_TYPES[number])) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
    };
  }
  if (size > MAX_SIZE) {
    return { valid: false, error: "File too large. Maximum size is 10MB" };
  }
  const ext = contentType.split("/")[1] || "png";
  const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  return { valid: true, key, contentType };
}

/** Upload a file to R2 server-side (bypasses browser CORS). */
export async function uploadToR2(
  key: string,
  contentType: string,
  body: Buffer | Uint8Array,
): Promise<void> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      ContentType: contentType,
      Body: body,
    }),
  );
}

export function getPublicUrl(key: string): string {
  ensureR2Config();
  if (env.R2_PUBLIC_URL) return `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  return `${env.R2_ENDPOINT?.replace(/\/$/, "")}/${env.R2_BUCKET}/${key}`;
}
