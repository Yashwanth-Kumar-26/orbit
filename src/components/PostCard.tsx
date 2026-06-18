import Link from "next/link";
import { Heart, MessageCircle, GitFork, ExternalLink } from "lucide-react";
import { TrendingBadge } from "./TrendingBadge";

type Post = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  github_repo?: string | null;
  demo_url?: string | null;
};

export function PostCard({ post }: { post: Post }) {
  const timeAgo = getTimeAgo(new Date(post.created_at));

  return (
    <Link href={`/post/${post.id}`}>
      <article className="group glass rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
        {/* Cover image */}
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ExternalLink className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <TrendingBadge category={post.category} />
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo}
            </span>
          </div>

          <h3 className="mb-1 font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>

          {post.description && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {post.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> {post.likes_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> {post.comments_count}
            </span>
            {post.github_repo && (
              <span className="flex items-center gap-1">
                <GitFork className="h-3.5 w-3.5" /> Repo
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
