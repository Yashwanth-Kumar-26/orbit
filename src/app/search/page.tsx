"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import Link from "next/link";

type SearchResults = {
  users: Array<{
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  }>;
  posts: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    image_url: string | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
  }>;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Search</h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search builders and projects..."
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <SearchIcon className="h-4 w-4" />
          )}
        </Button>
      </form>

      {!searched && (
        <div className="py-16 text-center">
          <SearchIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            Search for builders by name or projects by title
          </p>
        </div>
      )}

      {searched && !loading && results && (
        <div className="space-y-8">
          {/* Users */}
          {results.users.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Builders ({results.users.length})
              </h2>
              <div className="space-y-2">
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="glass flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {user.display_name?.charAt(0) ?? user.username.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.display_name || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {results.posts.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Projects ({results.posts.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {results.users.length === 0 && results.posts.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
