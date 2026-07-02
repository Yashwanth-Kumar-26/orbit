import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`DROP TABLE IF EXISTS post_views, verified_repos, follows, comments, likes, posts, "user", "account", "session", users, accounts, sessions, verification, verifications, verification_token CASCADE`;
  console.log("All tables dropped");
}

main().catch(console.error);
