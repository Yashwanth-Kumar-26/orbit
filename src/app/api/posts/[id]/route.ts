import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, comments } from "@/db/schema";
import { apiOk, apiError, requireAuth, handleApiError, ApiError } from "@/lib/api-helpers";
import { updatePostSchema } from "@/lib/validations/post";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return apiError(404, "Post not found");
    }

    const postComments = await db
      .select()
      .from(comments)
      .where(eq(comments.post_id, id))
      .orderBy(comments.created_at)
      .limit(50);

    return apiOk({ post, comments: postComments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { user } = await requireAuth(request);
    const currentUserId = user.id;
    if (!currentUserId) {
      return apiError(401, "Authentication required");
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return apiError(404, "Post not found");
    }
    if (post.user_id !== currentUserId) {
      throw new ApiError(403, "You can only edit your own posts");
    }

    const body = await request.json();
    const parsed = updatePostSchema.parse(body);

    const [updated] = await db
      .update(posts)
      .set({ ...parsed, updated_at: new Date() })
      .where(eq(posts.id, id))
      .returning();

    return apiOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { user } = await requireAuth(request);
    const currentUserId = user.id;
    if (!currentUserId) {
      return apiError(401, "Authentication required");
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return apiError(404, "Post not found");
    }
    if (post.user_id !== currentUserId) {
      throw new ApiError(403, "You can only delete your own posts");
    }

    await db.delete(posts).where(eq(posts.id, id));
    return apiOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
