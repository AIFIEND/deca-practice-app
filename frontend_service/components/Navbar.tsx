// components/Navbar.tsx
// Full navbar: shows logged-in username + avatar dropdown; removes the non-functional “Settings”.

"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { data: session } = useSession();
  const userName =
    session?.user?.name ||
    (session?.user as any)?.username ||
    (session?.user as any)?.email ||
    "User";

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          DECA Practice
        </Link>

        <nav className="flex items-center gap-3">
          {!session ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-accent">
                  <span className="text-sm font-medium">{userName}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage alt={userName} />
                    <AvatarFallback>
                      {String(userName).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="truncate">
                  {userName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
<DropdownMenuItem asChild>
  <Link href="/dashboard">Dashboard</Link>
</DropdownMenuItem>
<DropdownMenuItem asChild>
  <Link href="/progress">My Progress</Link>
</DropdownMenuItem>

{/* Admin: if user is admin show Dashboard, otherwise show gate */}
{session?.user?.is_admin ? (
  <DropdownMenuItem asChild>
    <Link href="/admin/dashboard">Admin Dashboard</Link>
  </DropdownMenuItem>
) : (
  <DropdownMenuItem asChild>
    <Link href="/admin">Admin</Link>
  </DropdownMenuItem>
)}

<DropdownMenuSeparator />
                {/* Removed “Settings” (non-functional) */}
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-destructive"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
}
