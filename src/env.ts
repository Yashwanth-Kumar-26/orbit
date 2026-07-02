import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  // Auth.js
  AUTH_SECRET: z.string().min(32),
  AUTH_GITHUB_ID: z.string().min(1),
  AUTH_GITHUB_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url().optional(),
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
      const missing = error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      console.error(`[ERROR] Invalid environment variables: ${missing}`);
      if (process.env.NODE_ENV === "development") {
        console.warn("[WARN] Running with partial env -- some features will be unavailable");
        // Return a partial type so code that reads missing keys gets undefined
        const partial: Partial<z.infer<typeof envSchema>> = {};
        for (const key of Object.keys(envSchema.shape)) {
          partial[key as keyof typeof partial] =
            process.env[key] as any;
        }
        return partial as z.infer<typeof envSchema>;
      }
      process.exit(1);
    }
    throw error;
  }
}

export const env = parseEnv();
