import { PostCard } from "./PostCard";

type Post = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

export function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No projects yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Be the first to share what you built!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
