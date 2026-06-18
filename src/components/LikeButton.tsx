"use client";

import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useLike } from "@/lib/hooks/useLike";
import { cn } from "@/lib/utils";

type Props = {
  postId: string;
  initialCount: number;
  isLiked?: boolean;
};

export function LikeButton({ postId, initialCount, isLiked = false }: Props) {
  const { like, unlike } = useLike(postId);

  const handleClick = () => {
    if (isLiked) {
      unlike.mutate();
    } else {
      like.mutate();
    }
  };

  const isLoading = like.isPending || unlike.isPending;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className={cn("gap-1", isLiked && "text-red-500 hover:text-red-600")}
    >
      <Heart
        className={cn("h-4 w-4", isLiked && "fill-current")}
      />
      {initialCount}
    </Button>
  );
}
