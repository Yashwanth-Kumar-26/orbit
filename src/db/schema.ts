import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Auth.js Tables ──────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  name: text("name"),                    // Auth.js standard
  display_name: text("display_name"),    // App custom
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { withTimezone: true }), // Auth.js standard
  image: text("image"),                  // Auth.js standard
  avatar_url: text("avatar_url"),        // App custom
  bio: text("bio"),
  github_username: text("github_username"),
  created_at: timestamp("created_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    uniqueIndex("accounts_provider_provider_account_id")
      .on(table.provider, table.providerAccountId),
  ],
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("sessionToken").notNull().unique(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
});

// ─── App Tables ───────────────────────────────────────────────────

export const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").default(""),
    image_url: text("image_url").default(""),
    category: text("category").notNull(),
    github_repo: text("github_repo").default(""),
    demo_url: text("demo_url").default(""),
    likes_count: integer("likes_count").default(0).notNull(),
    comments_count: integer("comments_count").default(0).notNull(),
    trending_score: real("trending_score").default(0).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`NOW()`)
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .default(sql`NOW()`)
      .notNull(),
  },
  (table) => [
    index("posts_user_id_idx").on(table.user_id),
    index("posts_created_at_idx").on(table.created_at),
    index("posts_trending_score_idx").on(table.trending_score),
  ],
);

export const likes = pgTable(
  "likes",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    post_id: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`NOW()`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("likes_user_post_unique").on(table.user_id, table.post_id),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    post_id: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`NOW()`)
      .notNull(),
  },
  (table) => [
    index("comments_post_id_idx").on(table.post_id),
  ],
);

export const follows = pgTable(
  "follows",
  {
    follower_id: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    following_id: text("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`NOW()`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.follower_id, table.following_id] }),
  ],
);

export const verified_repos = pgTable(
  "verified_repos",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    repo_url: text("repo_url").notNull(),
    repo_name: text("repo_name"),
    repo_owner: text("repo_owner"),
    stars_count: integer("stars_count").default(0),
    forks_count: integer("forks_count").default(0),
    verified: boolean("verified").default(false).notNull(),
    verified_at: timestamp("verified_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`NOW()`)
      .notNull(),
  },
  (table) => [
    index("verified_repos_user_id_idx").on(table.user_id),
  ],
);

export const post_views = pgTable(
  "post_views",
  {
    id: text("id").primaryKey(),
    post_id: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    user_id: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .default(sql`NOW()`)
      .notNull(),
  },
  (table) => [
    index("post_views_post_id_created_at_idx").on(
      table.post_id,
      table.created_at,
    ),
  ],
);
