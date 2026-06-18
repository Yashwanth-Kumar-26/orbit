import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  // Auth.js
  AUTH_SECRET: z.string().min(32),
  AUTH_GITHUB_ID: z.string().min(1),
  AUTH_GITHUB_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  // Cloudflare R2 (optional — only needed for upload API at runtime)
  R2_BUCKET: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),
  R2_ACCESS_KEY: z.string().optional(),
  R2_SECRET_KEY: z.string().optional(),
  // Optional
  R2_PUBLIC_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors
        .map((e) => e.path.join("."))
        .join(", ");
      console.error(`[ERROR] Invalid environment variables: ${missing}`);
      // In dev, return partial to avoid crashing on first setup
      if (process.env.NODE_ENV === "development") {
        console.warn("[WARN] Running with partial env -- some features will be unavailable");
        return process.env as unknown as z.infer<typeof envSchema>;
      }
      process.exit(1);
    }
    throw error;
  }
}

export const env = parseEnv();
