import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { requireAuth, apiOk, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const userId = user.id;
    if (!userId) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get GitHub access token
    const ghAccount = await db
      .select({ access_token: accounts.access_token })
      .from(accounts)
      .where(
        and(eq(accounts.userId, userId), eq(accounts.provider, "github")),
      )
      .limit(1);

    const ghHeaders: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (ghAccount[0]?.access_token) {
      ghHeaders["Authorization"] = `Bearer ${ghAccount[0].access_token}`;
    }

    const ghRes = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=50&visibility=all",
      { headers: ghHeaders },
    );

    if (!ghRes.ok) {
      return Response.json(
        {
          success: false,
          error: "Failed to fetch repos from GitHub. Make sure you signed in with GitHub.",
        },
        { status: 502 },
      );
    }

    const rawRepos = await ghRes.json();
    const repos = rawRepos
      .filter((r: any) => !r.private)
      .map((r: any) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description,
        stars_count: r.stargazers_count,
        forks_count: r.forks_count,
        language: r.language,
        topics: r.topics,
      }));

    return apiOk(repos);
  } catch (error) {
    return handleApiError(error);
  }
}
