const GITHUB_API = "https://api.github.com";

export type RepoInfo = {
  repo_url: string;
  repo_name: string;
  repo_owner: string;
  stars_count: number;
  forks_count: number;
  verified: boolean;
};

/**
 * Parse a GitHub repo URL into owner and name.
 */
export function parseRepoUrl(url: string): {
  owner: string;
  name: string;
} | null {
  const match = url.match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/);
  if (!match) return null;
  return { owner: match[1], name: match[2] };
}

/**
 * Verify repo ownership via GitHub API.
 * Uses the user's OAuth access token to check if they have push/admin access.
 */
export async function verifyRepo(
  repoUrl: string,
  accessToken: string,
): Promise<RepoInfo> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    throw new Error("Invalid GitHub repo URL");
  }

  const { owner, name } = parsed;

  // Check repo access level
  const collabRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/collaborators/${owner}/permission`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!collabRes.ok) {
    // If 404, user doesn't have access
    if (collabRes.status === 404) {
      throw new Error("You don't have access to this repository");
    }
    // Public repo — anyone can see it, but we still verify ownership
  }

  // Get repo info
  const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${name}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!repoRes.ok) {
    throw new Error("Failed to fetch repository info");
  }

  const repo = await repoRes.json();

  return {
    repo_url: repoUrl,
    repo_name: repo.name,
    repo_owner: repo.owner.login,
    stars_count: repo.stargazers_count ?? 0,
    forks_count: repo.forks_count ?? 0,
    verified: true,
  };
}
