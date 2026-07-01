import { NextRequest } from "next/server";
import { desc, gte, sql, lt, and } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { apiOk, apiError, requireAuth, handleApiError, applyRateLimit } from "@/lib/api-helpers";
import { createPostSchema } from "@/lib/validations/post";
import { RATE_LIMITS } from "@/lib/rate-limit";

const SEVEN_DAYS = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "latest";
    const cursor = searchParams.get("cursor");

    const baseQuery = db.select().from(posts);

    if (sort === "trending") {
      const conditions = [gte(posts.created_at, SEVEN_DAYS())];
      if (cursor) {
        // Compound cursor: (trending_score, created_at) to avoid duplicates
        const [score, lastCreatedAt] = cursor.split("_");
        conditions.push(
          sql`(${posts.trending_score} < ${Number(score)} OR (${posts.trending_score} = ${Number(score)} AND ${posts.created_at} < ${new Date(lastCreatedAt)}::timestamptz))`,
        );
      }
      const results = await baseQuery
        .where(and(...conditions))
        .orderBy(desc(posts.trending_score), desc(posts.created_at))
        .limit(PAGE_SIZE);

      return apiOk({
        posts: results,
        nextCursor:
          results.length === PAGE_SIZE
            ? `${results[results.length - 1].trending_score}_${results[results.length - 1].created_at.toISOString()}`
            : null,
        sort: "trending",
      });
    }

    // Latest: chronological
    const conditions = [];
    if (cursor) {
      conditions.push(lt(posts.created_at, new Date(cursor)));
    }
    const results = await baseQuery
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(posts.created_at))
      .limit(PAGE_SIZE);

    return apiOk({
      posts: results,
      nextCursor:
        results.length === PAGE_SIZE
          ? results[results.length - 1].created_at.toISOString()
          : null,
      sort: "latest",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user?.id;
    if (!userId) return apiError(401, "Authentication required");

    const rateCheck = applyRateLimit(`post:${userId}`, RATE_LIMITS.write);
    if (rateCheck) return rateCheck;
    if (!userId) {
      return apiError(401, "Authentication required");
    }

    const body = await request.json();
    const parsed = createPostSchema.parse(body);

    const postId = `post_${crypto.randomUUID().substring(0, 8)}`;

    const [post] = await db
      .insert(posts)
      .values({
        id: postId,
        user_id: userId,
        title: parsed.title,
        description: parsed.description || "",
        image_url: parsed.image_url || "",
        category: parsed.category,
        github_repo: parsed.github_repo || "",
        demo_url: parsed.demo_url || "",
      })
      .returning();

    return apiOk(post, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
