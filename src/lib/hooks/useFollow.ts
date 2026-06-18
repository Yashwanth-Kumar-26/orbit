"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function followUser(userId: string) {
  const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to follow user");
  return res.json();
}

async function unfollowUser(userId: string) {
  const res = await fetch(`/api/users/${userId}/follow`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to unfollow user");
  return res.json();
}

export function useFollow(userId: string) {
  const queryClient = useQueryClient();

  const follow = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const unfollow = useMutation({
    mutationFn: () => unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  return { follow, unfollow };
}
