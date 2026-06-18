"use client";

import { useQuery } from "@tanstack/react-query";

type Profile = {
  user: {
    id: string;
    username: string;
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
    bio: string | null;
    github_username: string | null;
    created_at: string;
  };
  posts: any[];
  postCount: number;
};

async function fetchProfile(id: string): Promise<Profile> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json().then((r) => r.data);
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchProfile(id),
    enabled: !!id,
  });
}
