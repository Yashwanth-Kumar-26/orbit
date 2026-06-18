import { SignInButtons } from "@/components/SignInButtons";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();

  // Already signed in — go to feed
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col items-center justify-center px-4">
      <div className="glass w-full rounded-xl p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">Welcome to X</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Sign in to share what you built and discover projects from other
          builders
        </p>
        <SignInButtons />
      </div>
    </div>
  );
}
