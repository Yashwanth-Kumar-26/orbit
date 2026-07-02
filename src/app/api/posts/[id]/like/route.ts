import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { likes, posts } from "@/db/schema";
import { apiOk, apiError, requireAuth, handleApiError, ApiError, applyRateLimit } from "@/lib/api-helpers";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { sql } from "drizzle-orm";

function recalculateTrendingScore(postId: string) {
  return db
    .update(posts)
    .set({
      trending_score: sql`${posts.likes_count} + ${posts.comments_count} * 2`,
    })
    .where(eq(posts.id, postId));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;
    const { user } = await requireAuth(request);
    const userId = user.id;
    if (!userId) return apiError(401, "Authentication required");

    const rateCheck = applyRateLimit(`like:${userId}`, RATE_LIMITS.write);
    if (rateCheck) return rateCheck;

    // Check post exists
    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    // Check if already liked
    const [existing] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.user_id, userId), eq(likes.post_id, postId)))
      .limit(1);

    if (existing) {
      return apiOk({ liked: true });
    }

    const likeId = `like_${crypto.randomUUID().substring(0, 8)}`;

    await db.insert(likes).values({ id: likeId, user_id: userId, post_id: postId });
    await db
      .update(posts)
      .set({ likes_count: sql`${posts.likes_count} + 1` })
      .where(eq(posts.id, postId));

    await recalculateTrendingScore(postId);

    return apiOk({ liked: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;
    const { user } = await requireAuth(request);
    const userId = user.id;
    if (!userId) return apiError(401, "Authentication required");

    const rateCheck = applyRateLimit(`unlike:${userId}`, RATE_LIMITS.write);
    if (rateCheck) return rateCheck;

    // Check post exists
    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const [existing] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.user_id, userId), eq(likes.post_id, postId)))
      .limit(1);

    if (!existing) {
      return apiOk({ liked: false });
    }

    await db
      .delete(likes)
      .where(and(eq(likes.user_id, userId), eq(likes.post_id, postId)));
    await db
      .update(posts)
      .set({ likes_count: sql`GREATEST(${posts.likes_count} - 1, 0)` })
      .where(eq(posts.id, postId));

    await recalculateTrendingScore(postId);

    return apiOk({ liked: false });
  } catch (error) {
    return handleApiError(error);
  }
}
