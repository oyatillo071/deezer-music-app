"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaylistModal } from "@/components/playlist-modal";
import { usePlayerStore } from "@/store/player-store";
import {
  Home,
  Search,
  Library,
  Heart,
  Music,
  Disc,
  Mic2,
  Plus,
} from "lucide-react";

export function Sidebar() {
  const { playlists } = usePlayerStore();

  return (
    <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 z-30 border-r bg-gradient-to-b from-ocean-lightest to-white dark:from-ocean-darkest dark:to-ocean-darkest/95 dark:border-ocean-dark/20">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-ocean-dark to-ocean-medium flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-ocean-darkest dark:text-white">
            MusicStream
          </span>
        </Link>

        <nav className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start w-full text-ocean-darkest dark:text-white hover:bg-ocean-lightest dark:hover:bg-ocean-dark/20"
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
            className="justify-start w-full text-ocean-darkest dark:text-white hover:bg-ocean-lightest dark:hover:bg-ocean-dark/20"
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
            className="justify-start w-full text-ocean-darkest dark:text-white hover:bg-ocean-lightest dark:hover:bg-ocean-dark/20"
            asChild
          >
            <Link href="/library">
              <Library className="mr-2 h-4 w-4" />
              Your Library
            </Link>
          </Button>
        </nav>
      </div>

      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ocean-darkest dark:text-white">
            Your Music
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs bg-transparent border-ocean-medium text-ocean-dark hover:bg-ocean-lightest dark:border-ocean-medium dark:text-ocean-light dark:hover:bg-ocean-dark/20"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New
          </Button>
        </div>

        <div className="space-y-1 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start w-full text-ocean-darkest dark:text-white hover:bg-ocean-lightest dark:hover:bg-ocean-dark/20"
            asChild
          >
            <Link href="/playlist/favorites">
              <Heart className="mr-2 h-4 w-4 text-red-500" />
              Liked Songs
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start w-full text-ocean-darkest dark:text-white hover:bg-ocean-lightest dark:hover:bg-ocean-dark/20"
            asChild
          >
            <Link href="/albums">
              <Disc className="mr-2 h-4 w-4 text-ocean-medium" />
              Albums
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start w-full text-ocean-darkest dark:text-white hover:bg-ocean-lightest dark:hover:bg-ocean-dark/20"
            asChild
          >
            <Link href="/artists">
              <Mic2 className="mr-2 h-4 w-4 text-ocean-dark" />
              Artists
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-ocean-darkest dark:text-white">
            Playlists
          </h2>
          <PlaylistModal />
        </div>

        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="space-y-1 pr-4">
            {playlists
              .filter((playlist) => playlist.id !== "favorites")
              .map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full text-ocean-darkest dark:text-white hover:bg-ocean-lightest dark:hover:bg-ocean-dark/20"
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
