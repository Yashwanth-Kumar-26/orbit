"use client";

import { useState } from "react";
import { FeedTabs } from "@/components/FeedTabs";
import { PostGrid } from "@/components/PostGrid";
import { useFeed } from "@/lib/hooks/useFeed";

type SortMode = "latest" | "trending";

export default function FeedPage() {
  const [sort, setSort] = useState<SortMode>("latest");
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed(sort);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero section */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          What did you build?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Share your projects, get discovered, inspire others
        </p>
      </div>

      {/* Feed controls */}
      <div className="mb-6 flex items-center justify-between">
        <FeedTabs active={sort} onChange={setSort} />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      )}

      {/* Posts grid */}
      {!isLoading && <PostGrid posts={posts} />}

      {/* Load more */}
      {hasNextPage && (
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
