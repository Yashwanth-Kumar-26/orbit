"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState } from "react";
import { Search, Plus, LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Orbit
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/search">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          {session?.user ? (
            <>
              <Link href="/post/new">
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> New Post
                </Button>
              </Link>
              <Link href={`/profile/${session.user.id}`}>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={session.user.image ?? ""} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border/40 p-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/search" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </Link>
            {session?.user ? (
              <>
                <Link href="/post/new" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" /> New Post
                  </Button>
                </Link>
                <Link
                  href={`/profile/${session.user.id}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
