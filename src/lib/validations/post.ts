import { z } from "zod";

const CATEGORIES = [
  "AI",
  "SaaS",
  "Open Source",
  "Web App",
  "Mobile App",
  "DApp",
  "Automation",
  "Design",
  "Hackathon",
  "Startup",
] as const;

export const CATEGORY_LIST = CATEGORIES;

export const categorySchema = z.enum(CATEGORIES);

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be under 120 characters"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional()
    .default(""),
  image_url: z.string().url("Invalid image URL").optional().default(""),
  category: categorySchema,
  github_repo: z
    .string()
    .regex(
      /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\/|\.git)?$/,
      "Must be a valid GitHub repo URL (e.g. https://github.com/owner/repo)",
    )
    .optional()
    .or(z.literal("")),
  demo_url: z.string().url("Invalid demo URL").optional().or(z.literal("")),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
