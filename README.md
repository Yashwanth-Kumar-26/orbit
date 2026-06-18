# Orbit — Builder Social Platform

A social platform where developers showcase their builds, gain recognition, build audience, and establish credibility. Share your launched SaaS, OSS projects, hackathon wins, AI tools, and everything you built.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Neon (PostgreSQL) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (GitHub OAuth) |
| Storage | Cloudflare R2 |
| State | TanStack Query |
| Validation | Zod |
| Deployment | Vercel |

## Features

- GitHub OAuth authentication
- Builder profiles with avatar, bio, GitHub link
- Project posts with cover images, description, category
- Feed with Latest and Trending sorting
- Likes and comments on posts
- Follow system
- GitHub repo verification with stars and forks display
- GitHub repos auto-loaded on profile page
- Image upload to Cloudflare R2 (PNG, JPEG, WebP, max 10MB)
- Search by builder name or project title
- Dark mode UI with glassmorphism design

## Getting Started

### Prerequisites

- Node.js 20+
- Neon PostgreSQL database
- GitHub OAuth app (for Auth.js)
- Cloudflare R2 bucket (for image uploads)

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Auth.js
AUTH_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...

# Cloudflare R2
R2_BUCKET=...
R2_ENDPOINT=...
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_PUBLIC_URL=...
```

### Install & Run

```bash
# Install dependencies
npm install

# Push DB schema
npx drizzle-kit push

# Start dev server
npm run dev
```

### Build for Production

```bash
npm run build
```

## Database Schema

10 tables:

| Table | Purpose |
|-------|---------|
| `user` | Users (Auth.js compatible) |
| `account` | OAuth accounts (Auth.js) |
| `session` | Sessions (Auth.js) |
| `verification_token` | Email verification (Auth.js) |
| `posts` | Project posts with denormalized counts and trending score |
| `likes` | Like/unlike with unique constraint per user+post |
| `comments` | Comments on posts |
| `follows` | Directed follow relationships |
| `verified_repos` | Verified GitHub repos with metadata |
| `post_views` | View analytics for future features |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `*` | `/api/auth/[...nextauth]` | Auth.js handler |
| `GET/PATCH` | `/api/users/[id]` | Profile read/update |
| `POST/DELETE` | `/api/users/[id]/follow` | Follow/unfollow |
| `GET/POST` | `/api/posts` | Feed / Create post |
| `GET/PATCH/DELETE` | `/api/posts/[id]` | Single post CRUD |
| `POST/DELETE` | `/api/posts/[id]/like` | Like/unlike |
| `GET/POST` | `/api/posts/[id]/comments` | Comments |
| `POST` | `/api/upload` | Server-side image upload |
| `GET` | `/api/search` | Search users and posts |
| `POST` | `/api/verify/repo` | GitHub repo verification |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Feed page
│   ├── sign-in/page.tsx
│   ├── profile/[username]/         # Profile + edit
│   ├── post/new/                   # Create post
│   ├── post/[id]/                  # Post detail
│   ├── search/page.tsx
│   └── api/                        # All API routes
├── components/
│   ├── PostCard.tsx, PostGrid.tsx
│   ├── ProfileHeader.tsx
│   ├── VerifiedRepos.tsx
│   ├── CommentThread.tsx
│   ├── LikeButton.tsx, FollowButton.tsx
│   ├── ImageUpload.tsx
│   ├── Navbar.tsx, FeedTabs.tsx
│   └── ui/                         # shadcn/ui primitives
├── db/
│   ├── schema.ts                   # 10 tables
│   └── index.ts                    # DB client
├── lib/
│   ├── auth.ts                     # Auth.js config
│   ├── api-helpers.ts              # Response helpers
│   ├── r2.ts                       # R2 uploads
│   ├── github.ts                   # GitHub API
│   ├── validations/                # Zod schemas
│   └── hooks/                      # TanStack Query hooks
├── types/                          # TypeScript declarations
└── env.ts                          # Zod env validation
```

## License

MIT
