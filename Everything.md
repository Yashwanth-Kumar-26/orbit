# Project X — Everything Document

> **Builder Social Platform** — *Session: 2026-06-16, 6:33 AM–7:00 AM GMT+5:30*
>
> Comprehensive summary of all discussions, decisions, and design artifacts.

---

## Table of Contents

1. [Project Identity & Vision](#1-project-identity--vision)
2. [Product Requirements Document (PRD)](#2-product-requirements-document-prd)
3. [Tech Stack (Finalized)](#3-tech-stack-finalized)
4. [Architecture Decisions](#4-architecture-decisions)
5. [Database Schema](#5-database-schema)
6. [API Routes](#6-api-routes)
7. [Trending / Feed Algorithm](#7-trending--feed-algorithm)
8. [GitHub Verification Flow](#8-github-verification-flow)
9. [Schema Check-In — Open Questions](#9-schema-check-in--open-questions)
10. [UI / Design Direction](#10-ui--design-direction)
11. [MVP Categories](#11-mvp-categories)
12. [Success Metrics](#12-success-metrics)
13. [MVP Timeline (Original PRD)](#13-mvp-timeline-original-prd)
14. [What Is NOT in MVP](#14-what-is-not-in-mvp)
15. [RuFlo V3 Infrastructure](#15-ruflo-v3-infrastructure)
16. [Project Structure](#16-project-structure)
17. [Next Steps](#17-next-steps)

---

## 1. Project Identity & Vision

| Attribute | Value |
|-----------|-------|
| **Project Name** | X |
| **Product** | A social platform where builders showcase creations, gain recognition, build audience, and establish credibility |
| **Tagline** | "What did you build?" — not "what did you commit" |
| **Differentiator vs GitHub** | Focus on presentation of achievements, not commits. People want to share outcomes (launched a SaaS, reached 1000 stars, won a hackathon). |
| **Design Vibe** | Instagram × Product Hunt × GitHub — dark mode first, glassmorphism |
| **Target Users** | Student developers, AI builders, indie hackers, startup founders, open-source creators |
| **Secondary Audience** | Recruiters, investors, tech enthusiasts |
| **Success Metric** | 100 active builders posting at least once per week |

---

## 2. Product Requirements Document (PRD)

### Core Insight

The fundamental premise: **people want to share what they built, not their git log.** Builders on existing platforms (GitHub, Twitter, LinkedIn) lack a dedicated space to showcase outcomes — the launched SaaS, the OSS project that hit 1000 stars, the hackathon win, the AI tool they shipped. Project X fills that gap.

### MVP Features

| Feature | Priority | Description |
|---------|----------|-------------|
| Authentication | P0 | GitHub OAuth + Google OAuth — sign in with existing accounts, zero friction |
| Builder Profiles | P0 | Display name, avatar, bio, GitHub link, follower count, projects grid |
| Project Posts | P0 | Title, description, cover image, category, GitHub repo link, demo URL |
| Image Upload | P0 | Cover images via Cloudflare R2 |
| Feed | P0 | Two-tab: **Latest** (chronological) and **Trending** (algorithmic) |
| Likes | P1 | Social validation — simple like/unlike |
| Comments | P1 | Discussion on posts |
| Follow System | P1 | Directed follow relationships (follower → following) |
| GitHub Verification | P1 | Verified builder + verified project badges |
| Search | P2 | Search by builder name or project title |

---

## 3. Tech Stack (Finalized)

Approved by user after trade-off discussion.

### Frontend

| Technology | Purpose | Decision Rationale |
|------------|---------|-------------------|
| Next.js (App Router) | Full-stack framework | Unified frontend + API routes, one codebase to deploy |
| TypeScript | Language | Type safety, developer experience |
| Tailwind CSS | Styling | Rapid UI development, utility-first |
| shadcn/ui | Component library | Accessible, customizable, dark mode support |
| **TanStack Query** | Client state / data fetching | Feed caching, profile/comments/likes/follow status management |
| **Zod** | Validation everywhere | Schema validation for ALL API inputs (posts, profiles, comments) |

### Backend & Data

| Technology | Purpose | Decision Rationale |
|------------|---------|-------------------|
| Next.js API Routes | Backend API | Co-located with frontend, no separate backend server |
| **Neon (PostgreSQL)** | Database | Serverless Postgres, scales to zero, generous free tier |
| **Drizzle ORM** | Database access | Type-safe, lightweight, good migration support |
| Cloudflare R2 | Image/file storage | S3-compatible, no egress fees, free tier |

### Auth

| Technology | Purpose |
|------------|---------|
| **NextAuth.js (v5)** | Authentication — GitHub OAuth + Google OAuth |
| Database session strategy | Session persistence |

### Deployment

| Technology | Role |
|------------|------|
| **Vercel** | Everything — frontend, API routes, edge functions |

> **Chosen over**: Cloudflare Pages (good but Vercel better for Next.js), Hybrid Vercel+Workers (unnecessary complexity for MVP)

### Explicitly Excluded from MVP

The following were **explicitly rejected** for MVP scope to keep iteration speed high:

| Technology | Rationale |
|------------|-----------|
| Kafka / Event Bus | Not needed at <few thousand users |
| Redis | Can add later for caching if needed |
| Cloudflare Workers | Not needed — Next.js API routes suffice |
| Microservices | Monolith MVP, split later if needed |
| GraphQL | REST is simpler for 13 endpoints |
| Kubernetes | Absolute overkill |
| Separate backend repo | All in Next.js |
| Docker | Vercel handles containers |

---

## 4. Architecture Decisions

### 4.1 Deployment Strategy (ADR-001)

- **Chosen**: All-in Vercel
- Next.js frontend + API routes on Vercel
- Neon PostgreSQL (serverless, scales to zero)
- Cloudflare R2 for image uploads (S3-compatible)
- **Why**: Simplest deployment model, one platform to manage, best Next.js support, generous free tier

### 4.2 Monolith First (ADR-002)

- Everything in a single Next.js app
- API routes co-located with pages
- Shared Zod schemas between client and server
- **Why**: Fast iteration speed, no inter-service coordination, easy to split later if traffic demands

### 4.3 Database Session Auth (ADR-003)

- NextAuth.js with database session strategy (not JWT)
- **Why**: Can invalidate sessions server-side, better for social platform security

### 4.4 Drizzle ORM over Prisma (ADR-004)

- Drizzle ORM chosen for database access
- **Why**: Lighter weight than Prisma, better TypeScript inference, simpler migration workflow

### 4.5 KISS Validation (ADR-005)

- Zod schemas at every API boundary
- Shared types between frontend forms and backend validation
- **Why**: Single source of truth for data shapes, no duplication

---

## 5. Database Schema

6 tables designed for MVP.

### 5.1 `users`

```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,          -- next-auth compatible
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  email         TEXT UNIQUE,
  avatar_url    TEXT,
  bio           TEXT,
  github_username TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 `posts`

```sql
CREATE TABLE posts (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,                     -- single cover image (MVP)
  category        TEXT NOT NULL,
  github_repo     TEXT,
  demo_url        TEXT,
  likes_count     INTEGER DEFAULT 0,        -- denormalized
  comments_count  INTEGER DEFAULT 0,        -- denormalized
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 `likes`

```sql
CREATE TABLE likes (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id),
  post_id   TEXT NOT NULL REFERENCES posts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

### 5.4 `comments`

```sql
CREATE TABLE comments (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id),
  post_id   TEXT NOT NULL REFERENCES posts(id),
  content   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.5 `follows`

```sql
CREATE TABLE follows (
  follower_id  TEXT NOT NULL REFERENCES users(id),
  following_id TEXT NOT NULL REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);
```

### 5.6 `verified_repos`

```sql
CREATE TABLE verified_repos (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id),
  repo_url  TEXT NOT NULL,
  verified  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Schema Design Decisions

| Decision | Detail |
|----------|--------|
| **posts.category as TEXT** | Not a DB enum — avoids migration pain when adding categories |
| **Denormalized counts** | `likes_count` and `comments_count` on posts — avoids COUNT(*) joins on every feed render, updated via triggers or application logic |
| **Cursor pagination** | Feed queries use `WHERE created_at < :cursor` with `ORDER BY created_at DESC LIMIT 20` — scales better than `OFFSET` |
| **Single image** | One `image_url` per post for MVP — gallery support later |

---

## 6. API Routes

13 endpoints organized by resource.

### Auth

| Method | Route | Description |
|--------|-------|-------------|
| `*` | `/api/auth/[...nextauth]` | NextAuth.js handler — GitHub + Google OAuth |

### Users / Profiles

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/users/[username]` | Get public profile with recent posts |
| `PATCH` | `/api/users/[username]` | Update own profile (authenticated) |

### Posts

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/posts` | Feed — query param `?sort=latest\|trending` |
| `POST` | `/api/posts` | Create a new project post |
| `GET` | `/api/posts/[id]` | Get single post with comments |
| `PATCH` | `/api/posts/[id]` | Edit own post |
| `DELETE` | `/api/posts/[id]` | Delete own post |

### Likes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/posts/[id]/like` | Like a post (toggle) |
| `DELETE` | `/api/posts/[id]/like` | Unlike a post |

### Comments

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/posts/[id]/comments` | List comments on a post |
| `POST` | `/api/posts/[id]/comments` | Add a comment |

### Social

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/users/[username]/follow` | Follow a user (toggle) |
| `DELETE` | `/api/users/[username]/follow` | Unfollow a user |

### GitHub Verification

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/verify/repo` | Initiate repo ownership verification |

---

## 7. Trending / Feed Algorithm

### MVP Formula

```
trending_score = likes_count + (comments_count × 2)
```

- Scope: posts from the **last 7 days** only
- SQL: `WHERE created_at > NOW() - INTERVAL '7 days' ORDER BY (likes_count + comments_count * 2) DESC`
- Feed has **two tabs**: `?sort=latest` (chronological) and `?sort=trending` (by score within 7 days)

### Full Formula (Post-MVP)

When the platform grows and needs deeper engagement signals:

```
score = likes               × 1
      + comments            × 4
      + profile_visits      × 0.2
      + repo_clicks         × 3
      + demo_url_clicks     × 5
      + follows_generated   × 10
```

With time decay:

```
final_score = score / (hours_since_post + 2)^1.5
```

### Weighting Rationale

| Signal | Weight | Why |
|--------|--------|-----|
| Likes | 1× | Baseline — passive validation, easy to give |
| Comments | 4× | 3× stronger than likes — someone cared enough to write |
| Repo clicks | 3× | Actually looked at the code |
| Demo clicks | 5× | Tried the product — strongest engagement signal |
| Follows generated | 10× | "I want to see more from this builder" |

### Why This Approach

- **Solves cold-start**: A new builder with 20 followers can trend if their project gets genuine engagement
- **Avoids popularity bias**: Not just "most likes wins" — established users don't dominate automatically
- **Time decay**: Older posts naturally fall off without manual curation

---

## 8. GitHub Verification Flow

### MVP: OAuth + Ownership Check

```
1. User logs in with GitHub OAuth (NextAuth.js)
2. User adds repo URL to their project post
3. Backend calls GitHub API to verify ownership:
   - GET /repos/{owner}/{repo}
   - Check if authenticated user has admin/push access
4. If verified → "Verified Builder" badge on profile
   + "Verified Project" badge on the post
```

### Badge System

| Badge | Condition |
|-------|-----------|
| ✅ Verified Builder | Has at least one verified repo linked to profile |
| ✅ Verified Project | Repo ownership confirmed via GitHub API |

### Why

- Prevents fake claims ("I built this" → no you didn't)
- Builds trust in the community
- Leverages existing GitHub OAuth token — no additional auth flow needed

---

## 9. Schema Check-In — Open Questions

Three schema decisions awaiting user confirmation before proceeding to spec document:

### Q1: `posts.category` — TEXT or Enum?

- **Proposed**: `TEXT` (not a DB enum)
- **Why**: Adding/removing categories requires zero migrations. Application-level validation via Zod ensures data quality.
- **Awaiting**: User confirmation

### Q2: Denormalized `likes_count` / `comments_count` on Posts?

- **Proposed**: Yes — store counts directly on the `posts` table
- **Why**: Feed queries that show like/comment counts are the hottest path. A `COUNT(*)` join on every feed render is expensive. Updated via application logic on like/comment create & delete.
- **Trade-off**: Requires keeping counts in sync. Stale data acceptable in practice (<1s delay).
- **Awaiting**: User confirmation

### Q3: Cursor or Offset Pagination for Feed?

- **Proposed**: **Cursor-based** (`WHERE created_at < :cursor ORDER BY created_at DESC LIMIT 20`)
- **Why**: Scales better than `OFFSET` — no "skip and scan" problem on large datasets. Consistent feed experience (no items disappearing between pages).
- **Trade-off**: Slightly more complex client logic. Can't "jump to page N" without consuming all previous pages.
- **Awaiting**: User confirmation

---

## 10. UI / Design Direction

| Attribute | Direction |
|-----------|-----------|
| **Theme** | Dark mode first |
| **Design System** | shadcn/ui (dark mode variant) |
| **Glassmorphism** | Frosted glass cards for project posts, subtle backdrop blur |
| **Layout** | Instagram-style grid/masonry for project posts, profile pages with project grid |
| **Feed** | Card-based layout, cover image dominant, overlay with title + stats |
| **Typography** | Clean, modern — shadcn/ui defaults |

---

## 11. MVP Categories

Ten categories for project posts:

| # | Category | Example |
|---|----------|---------|
| 1 | AI | LLM wrapper, fine-tuned model, AI agent |
| 2 | SaaS | Subscription product, B2B tool |
| 3 | Open Source | Library, framework, CLI tool |
| 4 | Web App | Dashboard, social tool, utility |
| 5 | Mobile App | iOS/Android app, React Native |
| 6 | DApp | Smart contract, DeFi, NFT |
| 7 | Automation | Bot, workflow, scraper |
| 8 | Design | UI kit, design system, icon set |
| 9 | Hackathon | 24–48hr build, jam entry |
| 10 | Startup | Company launch, funding milestone |

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| Active weekly posters | 100 builders posting ≥1×/week |
| Time to first post | < 2 minutes from signup |
| Feed engagement | > 50% of sessions include a like or comment |
| GitHub verification rate | > 30% of builders verify their repos |

---

## 13. MVP Timeline (Original PRD)

| Week | Milestone |
|------|-----------|
| **W1** | Auth (GitHub + Google OAuth), builder profiles |
| **W2** | Project posting, image upload (R2) |
| **W3** | Feed (latest + trending), likes, comments |
| **W4** | Follow system, GitHub verification |
| **W5** | Testing, polish, launch |

> **Note**: This timeline preceded the RuFlo V3 infra setup and may be adjusted now that the dev framework is in place.

---

## 14. What Is NOT in MVP

Explicitly deferred:

| Feature | Future? |
|---------|---------|
| In-app messaging / DMs | Post-MVP |
| Reels / short-form video | Post-MVP |
| AI content generation | Post-MVP |
| Monetization / tipping | Post-MVP |
| Marketplace | Post-MVP |
| Job board | Post-MVP |
| Teams / organizations | Post-MVP |
| Push notifications | Post-MVP |
| Leaderboards / gamification | Post-MVP |
| Gallery / multiple images per post | Post-MVP |

---

## 15. RuFlo V3 Infrastructure

### Initialization

- **Command**: `npx @claude-flow/cli@latest init --preset standard`
- **Result**: 11 directories, 105 files scaffolded

### What Was Added

| Component | Details |
|-----------|---------|
| **Skills** | 30 skills in `.claude/skills/` — brainstorming, frontend-design, test-driven-development, writing-plans, etc. |
| **Agents** | 17 agents in `.claude/agents/` — coder, reviewer, tester, planner, researcher, architect, security-auditor, etc. |
| **Commands** | 16 commands in `.claude/commands/` — slash commands for various workflows |
| **Helpers** | `.claude/helpers/` — supporting tooling |
| **CLAUDE.md** | 6.9K project configuration file with rules, agent comms patterns, swarm routing, build/test instructions |
| **.mcp.json** | 485B — MCP server configuration |
| **V3 Runtime** | `.claude-flow/config.yaml`, data/, logs/, sessions/ |
| **Vector DB** | `ruvector.db` (1.5M) — for semantic search |
| **ONNX Embedder** | all-MiniLM-L6-v2 (384 dimensions) — loaded from disk cache with SIMD acceleration |
| **Hooks** | 7 hook types enabled in `.claude/settings.json` |

### Agent Comms Pattern

```
Lead (you) ←→ architect ←→ developer ←→ tester ←→ reviewer
              (named agents message each other directly)
```

| Pattern | Flow | Use When |
|---------|------|----------|
| Pipeline | A → B → C → D | Sequential dependencies (feature dev) |
| Fan-out | Lead → A, B, C → Lead | Independent parallel work (research) |
| Supervisor | Lead ↔ workers | Ongoing coordination (complex refactor) |

### Model Routing (3-Tier)

| Tier | Handler | Use Cases |
|------|---------|-----------|
| 1 | Agent Booster (WASM) | Simple transforms |
| 2 | Haiku | Simple tasks, low complexity |
| 3 | Sonnet/Opus | Architecture, security, complex reasoning |

---

## 16. Project Structure

```
/home/siddu/MyProJects/X/
├── .claude/
│   ├── agents/          # 17 specialized agents
│   ├── commands/        # 16 slash commands
│   ├── helpers/         # Supporting tooling
│   ├── skills/          # 30 development skills
│   └── settings.json    # Claude Code configuration
├── .claude-flow/
│   ├── config.yaml      # V3 runtime configuration
│   ├── data/            # Runtime data
│   ├── logs/            # Activity logs
│   └── sessions/        # Session management
├── CLAUDE.md            # Project instructions (6.9K)
├── .mcp.json            # MCP server config (485B)
├── ruvector.db          # Vector database (1.5M)
├── Everything.md        # This document
└── docs/                # Not yet created — spec document target
```

> **Note**: No `docs/`, `src/`, `tests/`, `config/`, or `scripts/` directories yet. No source code, no git history. The project is in pre-implementation design phase.

---

## 17. Next Steps

### Immediate

1. ✅ **User responds to 3 schema check-in questions** (Q1–Q3 in section 9)
2. ⏳ **Write design spec document** at `docs/superpowers/specs/YYYY-MM-DD-builder-platform-design.md`
3. ⏳ **Spec self-review** — checklist against requirements
4. ⏳ **User review of spec**
5. ⏳ **Transition to implementation planning** via `writing-plans` skill

### Implementation Phase

1. Initialize Next.js project with TypeScript + Tailwind + shadcn/ui
2. Set up Drizzle ORM + Neon database
3. Implement NextAuth.js with GitHub + Google OAuth
4. Build database schema + migrations
5. Implement API routes
6. Build frontend components (feed, profiles, posts, etc.)
7. Integrate Cloudflare R2 for image uploads
8. Add GitHub verification flow
9. Test + deploy to Vercel
10. Launch MVP

---

*Generated: 2026-06-16, ~7:00 AM GMT+5:30*
*Session ID: session-1781573096160*
*Model: Claude Opus 4.8 (1M context)*
