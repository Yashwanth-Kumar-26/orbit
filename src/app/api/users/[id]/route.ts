import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, posts, verified_repos, accounts } from "@/db/schema";
import { apiOk, apiError, requireAuth, handleApiError, ApiError } from "@/lib/api-helpers";
import { updateProfileSchema } from "@/lib/validations/user";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Resolve by ID or username (explicit fields -- NEVER select * to avoid leaking PII)
    const user = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        display_name: users.display_name,
        image: users.image,
        avatar_url: users.avatar_url,
        bio: users.bio,
        github_username: users.github_username,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      // Try resolving by username
      const byUsername = await db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          display_name: users.display_name,
          image: users.image,
          avatar_url: users.avatar_url,
          bio: users.bio,
          github_username: users.github_username,
          created_at: users.created_at,
          updated_at: users.updated_at,
        })
        .from(users)
        .where(eq(users.username, id))
        .limit(1);
      if (byUsername.length === 0) {
        return apiError(404, "User not found");
      }
      user[0] = byUsername[0];
    }

    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.user_id, user[0].id))
      .orderBy(posts.created_at)
      .limit(20);

    const dbRepos = await db
      .select()
      .from(verified_repos)
      .where(eq(verified_repos.user_id, user[0].id))
      .limit(50);

    // Fetch GitHub repos -- only for own profile to avoid rate-limit theft
    let githubRepos: any[] = [];
    const viewerId = (await auth())?.user?.id;
    const isOwner = viewerId === user[0].id;
    if (isOwner && user[0].github_username) {
      try {
        // Get GitHub access token from accounts
        const ghAccount = await db
          .select({ access_token: accounts.access_token })
          .from(accounts)
          .where(
            and(eq(accounts.userId, user[0].id), eq(accounts.provider, "github")),
          )
          .limit(1);

        const ghToken = ghAccount[0]?.access_token;
        const ghHeaders: Record<string, string> = {
          Accept: "application/vnd.github+json",
        };
        if (ghToken) {
          ghHeaders["Authorization"] = `Bearer ${ghToken}`;
        }

        const ghRes = await fetch(
          `https://api.github.com/user/repos?sort=updated&per_page=50&visibility=all`,
          { headers: ghHeaders },
        );
        if (ghRes.ok) {
          const rawRepos = await ghRes.json();
          const verifiedUrls = new Set(dbRepos.map((r) => r.repo_url));
          githubRepos = rawRepos
            .filter((r: any) => !r.private)
            .map((r: any) => ({
              id: `gh_${r.id}`,
              repo_url: r.html_url,
              repo_name: r.name,
              repo_owner: r.owner.login,
              stars_count: r.stargazers_count,
              forks_count: r.forks_count,
              verified: verifiedUrls.has(r.html_url),
              description: r.description,
              language: r.language,
            }));
        }
      } catch {
        // GitHub API failed — just use DB repos
      }
    }

    return apiOk({
      user: user[0],
      posts: userPosts,
      postCount: userPosts.length,
      repos: githubRepos.length > 0 ? githubRepos : dbRepos,
    });
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
    const session = await requireAuth();
    const currentUserId = session.user?.id;
    if (!currentUserId) {
      return apiError(401, "Authentication required");
    }

    if (currentUserId !== id) {
      throw new ApiError(403, "You can only edit your own profile");
    }

    const body = await request.json();
    const parsed = updateProfileSchema.parse(body);

    const [updated] = await db
      .update(users)
      .set({ ...parsed, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();

    return apiOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
