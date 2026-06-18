"use client";

import { useState } from "react";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

type UploadState = {
  uploading: boolean;
  url: string | null;
  error: string | null;
};

export function useImageUpload() {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    url: null,
    error: null,
  });

  const upload = async (file: File): Promise<string | null> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setState({ uploading: false, url: null, error: "Invalid type. Allowed: PNG, JPEG, WebP" });
      return null;
    }
    if (file.size > MAX_SIZE) {
      setState({ uploading: false, url: null, error: "File too large. Maximum 10MB" });
      return null;
    }

    setState({ uploading: true, url: null, error: null });

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await res.json().then((r) => r.data);
      setState({ uploading: false, url, error: null });
      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setState({ uploading: false, url: null, error: message });
      return null;
    }
  };

  const reset = () => setState({ uploading: false, url: null, error: null });

  return { ...state, upload, reset };
}
