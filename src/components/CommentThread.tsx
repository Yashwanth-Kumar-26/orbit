"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

async function fetchComments(postId: string): Promise<Comment[]> {
  const res = await fetch(`/api/posts/${postId}/comments`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json().then((r) => r.data);
}

async function addComment(postId: string, content: string) {
  const res = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}

export function CommentThread({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
  });

  const mutation = useMutation({
    mutationFn: () => addComment(postId, content),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">
        Comments ({comments.length})
      </h3>

      {/* Add comment */}
      {session?.user && (
        <div className="flex gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={session.user.image ?? ""} />
            <AvatarFallback>
              {session.user.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
            />
            <Button
              size="sm"
              onClick={() => mutation.mutate()}
              disabled={!content.trim() || mutation.isPending}
            >
              {mutation.isPending ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground text-center">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>
                  {comment.user_id?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="glass rounded-lg px-3 py-2 text-sm flex-1">
                <p className="text-xs text-muted-foreground mb-1">
                  {comment.user_id.substring(0, 8)}...
                </p>
                <p>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
