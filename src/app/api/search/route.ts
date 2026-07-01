import { NextRequest } from "next/server";
import { or, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, posts } from "@/db/schema";
import { apiOk, handleApiError, applyRateLimit } from "@/lib/api-helpers";
import { RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Rate limit search by IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateCheck = applyRateLimit(`search:${ip}`, RATE_LIMITS.search);
    if (rateCheck) return rateCheck;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const type = searchParams.get("type") || "all";

    if (!q || q.length < 1) {
      return apiOk({ users: [], posts: [] });
    }

    const searchPattern = `%${q}%`;

    if (type === "users" || type === "all") {
      const userResults = await db
        .select({
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url,
          bio: users.bio,
        })
        .from(users)
        .where(
          or(
            ilike(users.username, searchPattern),
            ilike(users.display_name, searchPattern),
            ilike(users.bio ?? "", searchPattern),
          ),
        )
        .limit(20);

      if (type === "users") {
        return apiOk({ users: userResults });
      }

      const postResults = await db
        .select({
          id: posts.id,
          title: posts.title,
          description: posts.description,
          category: posts.category,
          image_url: posts.image_url,
          likes_count: posts.likes_count,
          comments_count: posts.comments_count,
          created_at: posts.created_at,
        })
        .from(posts)
        .where(
          or(
            ilike(posts.title, searchPattern),
            ilike(posts.description ?? "", searchPattern),
            ilike(posts.category, searchPattern),
          ),
        )
        .limit(20);

      return apiOk({ users: userResults, posts: postResults });
    }

    if (type === "posts") {
      const postResults = await db
        .select({
          id: posts.id,
          title: posts.title,
          description: posts.description,
          category: posts.category,
          image_url: posts.image_url,
          likes_count: posts.likes_count,
          comments_count: posts.comments_count,
          created_at: posts.created_at,
        })
        .from(posts)
        .where(
          or(
            ilike(posts.title, searchPattern),
            ilike(posts.description ?? "", searchPattern),
            ilike(posts.category, searchPattern),
          ),
        )
        .limit(20);

      return apiOk({ posts: postResults });
    }

    return apiOk({ users: [], posts: [] });
  } catch (error) {
    return handleApiError(error);
  }
}
