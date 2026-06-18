"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/ProfileHeader";
import { PostGrid } from "@/components/PostGrid";
import { VerifiedRepos } from "@/components/VerifiedRepos";

async function fetchProfile(username: string) {
  // Username-based URL, but we resolve by ID internally
  const res = await fetch(`/api/users/${username}`);
  if (!res.ok) throw new Error("Profile not found");
  return res.json().then((r) => r.data);
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => fetchProfile(username),
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 h-32 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="mt-2 text-muted-foreground">
          This profile doesn&apos;t exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <ProfileHeader
          user={data.user}
          postCount={data.postCount}
        />
      </div>

      {data.repos?.length > 0 && (
        <div className="mb-8">
          <VerifiedRepos repos={data.repos} />
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold">Projects</h2>
      <PostGrid posts={data.posts} />
    </div>
  );
}
