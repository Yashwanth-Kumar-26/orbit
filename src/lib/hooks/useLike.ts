"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function likePost(postId: string) {
  const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
}

async function unlikePost(postId: string) {
  const res = await fetch(`/api/posts/${postId}/like`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to unlike post");
  return res.json();
}

export function useLike(postId: string) {
  const queryClient = useQueryClient();

  const like = useMutation({
    mutationFn: () => likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const unlike = useMutation({
    mutationFn: () => unlikePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  return { like, unlike };
}
