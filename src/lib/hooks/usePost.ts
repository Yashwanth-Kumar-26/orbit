"use client";

import { useQuery } from "@tanstack/react-query";
import type { Post } from "./useFeed";

type PostDetail = {
  post: Post;
  comments: Comment[];
};

async function fetchPost(id: string): Promise<PostDetail> {
  const res = await fetch(`/api/posts/${id}`);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json().then((r) => r.data);
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
    enabled: !!id,
  });
}
