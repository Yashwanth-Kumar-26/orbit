import { Github, Star, GitFork } from "lucide-react";
import { Verified } from "lucide-react";

type Repo = {
  id: string;
  repo_url: string;
  repo_name: string | null;
  repo_owner: string | null;
  stars_count: number | null;
  forks_count: number | null;
  verified: boolean;
  description?: string | null;
  language?: string | null;
};

export function VerifiedRepos({ repos }: { repos: Repo[] }) {
  if (repos.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">GitHub Repos</h2>
      <div className="space-y-2">
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
          >
            <Github className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium">
                  {repo.repo_owner}/{repo.repo_name}
                </p>
                {repo.verified && (
                  <Verified className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                )}
              </div>
              {repo.description && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                  {repo.description}
                </p>
              )}
              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                {repo.language && (
                  <span className="flex items-center gap-1 font-medium">
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" /> {repo.stars_count ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="h-3 w-3" /> {repo.forks_count ?? 0}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
