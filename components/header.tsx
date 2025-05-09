"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { Music, User, Settings, LogOut } from "lucide-react";
import { useUserStore } from "@/store/user-store";

export function Header() {
  const { username, profilePicture } = useUserStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Music className="h-6 w-6 text-ocean-dark" />
            <span className="font-bold hidden md:inline-block text-ocean-darkest">
              MusicStream
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="transition-colors hover:text-ocean-dark text-ocean-darkest font-medium"
            >
              Home
            </Link>
            <Link
              href="/search"
              className="transition-colors hover:text-ocean-dark text-ocean-darkest/80"
            >
              Browse
            </Link>
            <Link
              href="/library"
              className="transition-colors hover:text-ocean-dark text-ocean-darkest/80"
            >
              Library
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <SearchBar />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8 border-2 border-ocean-medium">
                  <AvatarImage
                    src={profilePicture || undefined}
                    alt={username}
                  />
                  <AvatarFallback className="bg-ocean-dark text-white">
                    {getInitials(username)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
