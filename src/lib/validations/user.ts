import { z } from "zod";

export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be under 50 characters")
    .optional(),
  bio: z
    .string()
    .max(160, "Bio must be under 160 characters")
    .optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
