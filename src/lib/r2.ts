import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";

// Magic bytes for image file types (first bytes of file content)
const IMAGE_MAGIC_BYTES: Record<string, Uint8Array[]> = {
  "image/png": [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
  "image/jpeg": [new Uint8Array([0xff, 0xd8, 0xff])],
  "image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
};

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
  const key = `uploads/${Date.now()}-${crypto.randomUUID().substring(0, 8)}.${ext}`;
  return { valid: true, key, contentType };
}

/** Verify file content matches its claimed MIME type using magic bytes. */
export function verifyMagicBytes(
  buffer: Uint8Array,
  contentType: string,
): { valid: true } | { valid: false; error: string } {
  const expectedSignatures = IMAGE_MAGIC_BYTES[contentType];
  if (!expectedSignatures) return { valid: true }; // unknown type, skip check

  for (const sig of expectedSignatures) {
    if (buffer.length >= sig.length) {
      const header = buffer.slice(0, sig.length);
      if (header.every((b, i) => b === sig[i])) {
        return { valid: true };
      }
    }
  }

  return {
    valid: false,
    error: `File content does not match ${contentType} format. Detected bytes do not match expected image header.`,
  };
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
