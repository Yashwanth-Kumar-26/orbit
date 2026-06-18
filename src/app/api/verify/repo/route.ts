import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { verified_repos } from "@/db/schema";
import { requireAuth, apiOk, apiError, handleApiError, ApiError } from "@/lib/api-helpers";
import { verifyRepo, parseRepoUrl } from "@/lib/github";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user?.id;
    if (!userId) {
      return apiError(401, "Authentication required");
    }

    const body = await request.json();
    const { repo_url } = body;

    if (!repo_url || typeof repo_url !== "string") {
      return apiError(400, "repo_url is required");
    }

    const parsed = parseRepoUrl(repo_url);
    if (!parsed) {
      return apiError(400, "Invalid GitHub repo URL");
    }

    // Check if already verified
    const [existing] = await db
      .select()
      .from(verified_repos)
      .where(eq(verified_repos.repo_url, repo_url))
      .limit(1);

    if (existing?.verified) {
      return apiOk(existing);
    }

    // Get access token from accounts table
    const account = await db.query.accounts.findFirst({
      where: (accounts: any, { eq }: any) =>
        eq(accounts.user_id, userId) && eq(accounts.provider, "github"),
    });

    if (!account?.access_token) {
      throw new ApiError(400, "GitHub account not linked. Sign in with GitHub first.");
    }

    const repoInfo = await verifyRepo(repo_url, account.access_token);

    // Upsert
    if (existing) {
      const [updated] = await db
        .update(verified_repos)
        .set({
          ...repoInfo,
          verified_at: new Date(),
        })
        .where(eq(verified_repos.id, existing.id))
        .returning();
      return apiOk(updated);
    }

    const id = `vr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const [inserted] = await db
      .insert(verified_repos)
      .values({
        id,
        user_id: userId,
        ...repoInfo,
        verified_at: new Date(),
      })
      .returning();

    return apiOk(inserted, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
