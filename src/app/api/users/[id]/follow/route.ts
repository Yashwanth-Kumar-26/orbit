import { NextRequest } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { follows, users } from "@/db/schema";
import { apiOk, apiError, requireAuth, handleApiError, ApiError } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: followingId } = await params;
    const { user } = await requireAuth(request);
    const followerId = user.id;
    if (!followerId) {
      return apiError(401, "Authentication required");
    }

    if (followerId === followingId) {
      throw new ApiError(400, "You cannot follow yourself");
    }

    // Check target user exists
    const target = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, followingId))
      .limit(1);

    if (target.length === 0) {
      return apiError(404, "User not found");
    }

    // Check if already following
    const existing = await db
      .select()
      .from(follows)
      .where(
        and(eq(follows.follower_id, followerId), eq(follows.following_id, followingId)),
      )
      .limit(1);

    if (existing.length > 0) {
      return apiOk({ following: true });
    }

    await db.insert(follows).values({
      follower_id: followerId,
      following_id: followingId,
    });

    return apiOk({ following: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: followingId } = await params;
    const { user } = await requireAuth(request);
    const followerId = user.id;
    if (!followerId) {
      return apiError(401, "Authentication required");
    }

    await db
      .delete(follows)
      .where(
        and(eq(follows.follower_id, followerId), eq(follows.following_id, followingId)),
      );

    return apiOk({ following: false });
  } catch (error) {
    return handleApiError(error);
  }
}
