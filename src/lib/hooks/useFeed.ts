"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

type SortMode = "latest" | "trending";

export type Post = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  github_repo: string | null;
  demo_url: string | null;
  likes_count: number;
  comments_count: number;
  trending_score: number;
  created_at: string;
};

type FeedResponse = {
  posts: Post[];
  nextCursor: string | null;
  sort: SortMode;
};

async function fetchFeed({
  sort,
  cursor,
}: {
  sort: SortMode;
  cursor?: string;
}): Promise<FeedResponse> {
  const params = new URLSearchParams({ sort });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`/api/posts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json().then((r) => r.data);
}

export function useFeed(sort: SortMode = "latest") {
  return useInfiniteQuery({
    queryKey: ["feed", sort],
    queryFn: ({ pageParam }) => fetchFeed({ sort, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}
