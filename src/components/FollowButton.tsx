"use client";

import { Button } from "./ui/button";
import { useFollow } from "@/lib/hooks/useFollow";

type Props = {
  userId: string;
  isFollowing?: boolean;
};

export function FollowButton({ userId, isFollowing = false }: Props) {
  const { follow, unfollow } = useFollow(userId);

  const handleClick = () => {
    if (isFollowing) {
      unfollow.mutate();
    } else {
      follow.mutate();
    }
  };

  const isLoading = follow.isPending || unfollow.isPending;

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
