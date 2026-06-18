"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import { Github, Mail } from "lucide-react";

export function SignInButtons() {
  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="outline"
        size="lg"
        onClick={() => signIn("github", { redirectTo: "/" })}
        className="gap-2"
      >
        <Github className="h-5 w-5" />
        Continue with GitHub
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => signIn("google", { redirectTo: "/" })}
        className="gap-2"
      >
        <Mail className="h-5 w-5" />
        Continue with Google
      </Button>
    </div>
  );
}
