import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({}),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Find user by ID or email
      const conditions = [];
      if (user.id) conditions.push(eq(users.id, user.id));
      if (user.email) conditions.push(eq(users.email, user.email));

      if (conditions.length === 0) return true;

      const existing = await db
        .select()
        .from(users)
        .where(or(...conditions))
        .limit(1);

      if (existing.length === 0) return true;

      const updates: Record<string, any> = {};

      // Generate username if not set
      if (!existing[0].username) {
        const nameSource =
          user.name ||
          (profile as any)?.login ||
          user.email?.split("@")[0] ||
          "user";
        const base = nameSource.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (base.length > 0) {
          updates.username = await generateUniqueUsername(base);
        }
      }

      // Sync avatar
      if (!existing[0].avatar_url && user.image) {
        updates.avatar_url = user.image;
      }

      // GitHub username from profile
      if (account?.provider === "github") {
        const ghLogin = (profile as any)?.login;
        if (ghLogin) {
          updates.github_username = ghLogin;
        }
      }

      if (Object.keys(updates).length > 0) {
        await db
          .update(users)
          .set(updates)
          .where(eq(users.id, existing[0].id));
      }
      return true;
    },
  },
});

async function generateUniqueUsername(base: string): Promise<string> {
  const existing = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.username, base))
    .limit(1);

  if (existing.length === 0) return base;

  // Append random suffix
  const suffix = crypto.randomUUID().substring(0, 4);
  return `${base}${suffix}`;
}
