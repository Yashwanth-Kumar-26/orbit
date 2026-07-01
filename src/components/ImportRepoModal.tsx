"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Github, Star, GitFork, Import, Loader2, X, Search } from "lucide-react";

type Repo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stars_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (repo: {
    title: string;
    description: string;
    githubRepo: string;
  }) => void;
};

export function ImportRepoModal({ open, onClose, onSelect }: Props) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/user/repos")
      .then((r) => r.json())
      .then((d) => setRepos(d.data ?? []))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const filtered = search
    ? repos.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.description?.toLowerCase() ?? "").includes(search.toLowerCase()),
      )
    : repos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">Import from GitHub</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your repos..."
              className="w-full rounded-md border border-input bg-transparent py-2 pl-10 pr-3 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Repo list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {search ? "No repos match your search" : "No repos found"}
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => {
                    onSelect({
                      title: repo.name
                        .replace(/[-_]/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase()),
                      description: repo.description ?? "",
                      githubRepo: repo.html_url,
                    });
                    onClose();
                  }}
                  className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent"
                >
                  <Github className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">
                      {repo.full_name}
                    </p>
                    {repo.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {repo.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      {repo.language && (
                        <span className="font-medium">{repo.language}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" /> {repo.stars_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" /> {repo.forks_count}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
