import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Verified, Github } from "lucide-react";

type Props = {
  user: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    github_username: string | null;
    created_at: string;
  };
  postCount: number;
  isVerified?: boolean;
};

export function ProfileHeader({ user, postCount, isVerified }: Props) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-border">
          <AvatarImage src={user.avatar_url ?? ""} />
          <AvatarFallback className="text-lg">
            {user.display_name?.charAt(0) ?? user.username?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold truncate">
              {user.display_name || user.username}
            </h1>
            {isVerified && (
              <Verified className="h-5 w-5 shrink-0 text-blue-500" />
            )}
          </div>

          <p className="text-sm text-muted-foreground">@{user.username ?? "anonymous"}</p>

          {user.bio && (
            <p className="mt-2 text-sm">{user.bio}</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{postCount} projects</span>
            {user.github_username && (
              <a
                href={`https://github.com/${user.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                {user.github_username}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
