import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { comments, posts } from "@/db/schema";
import { apiOk, apiError, requireAuth, handleApiError, ApiError } from "@/lib/api-helpers";
import { createCommentSchema } from "@/lib/validations/comment";
import { sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;

    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return apiError(404, "Post not found");
    }

    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.post_id, postId))
      .orderBy(desc(comments.created_at))
      .limit(50);

    return apiOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;
    const session = await requireAuth();
    const userId = session.user?.id;
    if (!userId) {
      return apiError(401, "Authentication required");
    }

    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return apiError(404, "Post not found");
    }

    const body = await request.json();
    const parsed = createCommentSchema.parse(body);

    const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const [comment] = await db
      .insert(comments)
      .values({
        id: commentId,
        user_id: userId,
        post_id: postId,
        content: parsed.content,
      })
      .returning();

    // Increment comment count and recalculate trending score
    await db
      .update(posts)
      .set({
        comments_count: sql`${posts.comments_count} + 1`,
        trending_score: sql`${posts.likes_count} + (${posts.comments_count} + 1) * 2`,
      })
      .where(eq(posts.id, postId));

    return apiOk(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
