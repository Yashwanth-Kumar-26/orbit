import { NextRequest } from "next/server";
import { requireAuth, apiOk, apiError, handleApiError, applyRateLimit } from "@/lib/api-helpers";
import { validateUpload, verifyMagicBytes, uploadToR2, getPublicUrl } from "@/lib/r2";
import { RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const userId = user.id;
    if (!userId) return apiError(401, "Authentication required");

    // Rate limit uploads: 3 per 30s per user
    const rateCheck = applyRateLimit(`upload:${userId}`, RATE_LIMITS.upload);
    if (rateCheck) return rateCheck;

    // Content-Length pre-check
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 11 * 1024 * 1024) {
      return apiError(413, "File too large. Maximum size is 10MB");
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiError(400, "No file uploaded");
    }

    const validation = validateUpload(file.type, file.size);
    if (!validation.valid) {
      return apiError(400, validation.error);
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Verify actual file content matches claimed type
    const magicCheck = verifyMagicBytes(fileBuffer, file.type);
    if (!magicCheck.valid) {
      return apiError(400, magicCheck.error);
    }

    await uploadToR2(validation.key, validation.contentType, fileBuffer);

    const publicUrl = getPublicUrl(validation.key);

    return apiOk({ url: publicUrl, key: validation.key });
  } catch (error) {
    return handleApiError(error);
  }
}
