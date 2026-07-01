import type { MetadataRoute } from "next";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orbit-beta-indol.vercel.app";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];

  // Dynamic post pages
  try {
    const allPosts = await db
      .select({ id: posts.id, updated_at: posts.updated_at })
      .from(posts)
      .orderBy(desc(posts.created_at))
      .limit(1000);

    const postRoutes: MetadataRoute.Sitemap = allPosts.map((post) => ({
      url: `${baseUrl}/post/${post.id}`,
      lastModified: post.updated_at ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...postRoutes];
  } catch {
    // DB might not be available during build
    return staticRoutes;
  }
}
