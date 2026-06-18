import { NextRequest } from "next/server";
import { requireAuth, apiOk, apiError, handleApiError } from "@/lib/api-helpers";
import { validateUpload, uploadToR2, getPublicUrl } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

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
    await uploadToR2(validation.key, validation.contentType, new Uint8Array(arrayBuffer));

    const publicUrl = getPublicUrl(validation.key);

    return apiOk({ url: publicUrl, key: validation.key });
  } catch (error) {
    return handleApiError(error);
  }
}
