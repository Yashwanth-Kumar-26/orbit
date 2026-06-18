"use client";

import { useParams } from "next/navigation";
import { usePost } from "@/lib/hooks/usePost";
import { PostGrid } from "@/components/PostGrid";
import { CommentThread } from "@/components/CommentThread";
import { LikeButton } from "@/components/LikeButton";
import { TrendingBadge } from "@/components/TrendingBadge";
import { Github, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error: loadError } = usePost(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 h-64 animate-pulse rounded-xl bg-muted" />
        <div className="mb-4 h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mb-8 h-20 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Post not found</h2>
        <p className="mt-2 text-muted-foreground">
          This post doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to feed
        </Link>
      </div>
    );
  }

  const { post, comments } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      {/* Cover image */}
      {post.image_url && (
        <div className="mb-6 overflow-hidden rounded-xl">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="mb-2">
          <TrendingBadge category={post.category} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
      </div>

      {/* Description */}
      {post.description && (
        <p className="mb-6 text-lg text-muted-foreground leading-relaxed">
          {post.description}
        </p>
      )}

      {/* Links */}
      <div className="mb-8 flex flex-wrap gap-2">
        {post.github_repo && (
          <a
            href={post.github_repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Github className="h-4 w-4" /> View on GitHub
          </a>
        )}
        {post.demo_url && (
          <a
            href={post.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> Live Demo
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="mb-8 flex items-center gap-4 border-b border-border pb-4">
        <LikeButton postId={post.id} initialCount={post.likes_count} />
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          {post.comments_count} comments
        </span>
      </div>

      {/* Comments */}
      <CommentThread postId={post.id} />
    </div>
  );
}
