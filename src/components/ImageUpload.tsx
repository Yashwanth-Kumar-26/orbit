"use client";

import { useRef } from "react";
import { Button } from "./ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { cn } from "@/lib/utils";

type Props = {
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
};

export function ImageUpload({ onUploadComplete, currentUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, url, error, upload, reset } = useImageUpload();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file);
    if (result) {
      onUploadComplete(result);
    }
  };

  const displayUrl = url || currentUrl;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      {displayUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
          <img
            src={displayUrl}
            alt="Upload preview"
            className="h-full w-full object-cover"
          />
          <button
            onClick={() => {
              reset();
              onUploadComplete("");
            }}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors",
            "hover:border-primary/50 hover:bg-muted/50",
            uploading && "opacity-50 cursor-not-allowed",
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">
                Uploading...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to upload cover image
              </span>
              <span className="text-xs text-muted-foreground/60">
                PNG, JPEG, WebP — max 10MB
              </span>
            </div>
          )}
        </button>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
