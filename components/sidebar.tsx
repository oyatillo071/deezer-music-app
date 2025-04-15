"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaylistModal } from "@/components/playlist-modal";
import { usePlayerStore } from "@/store/player-store";
import { Home, Search, Library, Heart, Music } from "lucide-react";

export function Sidebar() {
  const { playlists } = usePlayerStore();

  return (
    <div className="hidden md:flex h-screen w-60 flex-col fixed left-0 top-0 z-30 border-r bg-background">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <Music className="h-6 w-6" />
          <span className="font-bold">MusicStream</span>
        </Link>

        <nav className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start w-full"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start w-full"
            asChild
          >
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start w-full"
            asChild
          >
            <Link href="/library">
              <Library className="mr-2 h-4 w-4" />
              Your Library
            </Link>
          </Button>
        </nav>
      </div>

      <div className="mt-4 px-4">
        <div className="flex items-center justify-between mb-2 flex-col text-center">
          <h2 className="text-sm font-semibold">Playlists</h2>
          <PlaylistModal />
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-1 pr-4">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full"
              asChild
            >
              <Link href="/playlist/favorites">
                <Heart className="mr-2 h-4 w-4" />
                Liked Songs
              </Link>
            </Button>

            {playlists
              .filter((playlist) => playlist.id !== "favorites")
              .map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full"
                  asChild
                >
                  <Link href={`/playlist/${playlist.id}`}>{playlist.name}</Link>
                </Button>
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
