"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SongCard } from "@/components/song-card";
import { AlbumCard } from "@/components/album-card";
import { ArtistCard } from "@/components/artist-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon } from "lucide-react";
import { searchMusic } from "@/lib/music-api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(query);
  const [activeTab, setActiveTab] = useState("songs");

  const [songs, setSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;

      setLoading(true);
      setError(null);

      try {
        // Search for tracks
        const tracksData = await searchMusic(query, "track");
        const formattedSongs = Array.isArray(tracksData)
          ? tracksData.slice(0, 12).map((track: any) => ({
              id: track.id || `song-${Math.random()}`,
              title: track.title || "Unknown Song",
              artist: track.artist?.name || "Unknown Artist",
              artistId: track.artist?.id || "unknown",
              album: track.album?.title || "Unknown Album",
              albumId: track.album?.id || "unknown",
              duration: track.duration || 30,
              cover:
                track.album?.cover_medium ||
                "/placeholder.svg?height=300&width=300",
              audioUrl:
                track.preview ||
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            }))
          : [];
        setSongs(formattedSongs);

        // Search for albums
        const albumsData = await searchMusic(query, "album");
        const uniqueAlbums = new Map();
        if (Array.isArray(albumsData)) {
          albumsData.forEach((item: any) => {
            if (item.album && !uniqueAlbums.has(item.album.id)) {
              uniqueAlbums.set(item.album.id, {
                id: item.album.id,
                title: item.album.title,
                artist: item.artist.name,
                artistId: item.artist.id,
                cover: item.album.cover_medium,
              });
            }
          });
        }
        setAlbums(Array.from(uniqueAlbums.values()).slice(0, 12));

        // Search for artists
        const artistsData = await searchMusic(query, "artist");
        const uniqueArtists = new Map();
        if (Array.isArray(artistsData)) {
          artistsData.forEach((item: any) => {
            if (item.artist && !uniqueArtists.has(item.artist.id)) {
              uniqueArtists.set(item.artist.id, {
                id: item.artist.id,
                name: item.artist.name,
                image:
                  item.artist.picture_medium ||
                  "/placeholder.svg?height=300&width=300",
              });
            }
          });
        }
        setArtists(Array.from(uniqueArtists.values()).slice(0, 12));
      } catch (error) {
        toast.error("Error searching:", error);
        setError("There was an error with your search. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for songs, artists, or albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md bg-ocean-lightest/50 dark:bg-ocean-dark/30 border-ocean-light dark:border-ocean-dark focus-visible:ring-ocean-medium"
        />
        <Button
          type="submit"
          className="bg-ocean-dark hover:bg-ocean-darkest text-white"
        >
          <SearchIcon className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {query && (
        <>
          <h1 className="text-2xl font-bold">Search results for "{query}"</h1>

          {error && (
            <div className="bg-ocean-light/10 border border-ocean-light/20 p-4 rounded-md text-ocean-dark dark:text-ocean-light mb-4">
              {error}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="songs">Songs</TabsTrigger>
              <TabsTrigger value="albums">Albums</TabsTrigger>
              <TabsTrigger value="artists">Artists</TabsTrigger>
            </TabsList>

            <TabsContent value="songs" className="mt-4">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square rounded-md" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                </div>
              ) : songs.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {songs.map((song) => (
                    <SongCard key={song.id} song={song} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No songs found matching "{query}"
                </p>
              )}
            </TabsContent>

            <TabsContent value="albums" className="mt-4">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square rounded-md" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                </div>
              ) : albums.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {albums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No albums found matching "{query}"
                </p>
              )}
            </TabsContent>

            <TabsContent value="artists" className="mt-4">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square rounded-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))}
                </div>
              ) : artists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No artists found matching "{query}"
                </p>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {!query && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Search for music</h2>
          <p className="text-muted-foreground">
            Find your favorite songs, artists, and albums
          </p>
        </div>
      )}
    </div>
  );
}
