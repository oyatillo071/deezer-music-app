"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SongCard } from "@/components/song-card";
import { AlbumCard } from "@/components/album-card";
import { ArtistCard } from "@/components/artist-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  searchMusic,
  getRandomTracks,
  getRandomAlbums,
  getRandomArtists,
} from "@/lib/music-api";
import type { Song } from "@/store/player-store";
import { SearchIcon } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(query);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("songs");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      setSearchError("");

      // Search songs
      try {
        const songsData = await searchMusic(searchTerm, "track");
        const formattedSongs = Array.isArray(songsData)
          ? songsData.slice(0, 12).map((song) => ({
              id: song.id || `song-${Math.random()}`,
              title: song.title || "Unknown Song",
              artist: song.artist?.name || "Unknown Artist",
              artistId: song.artist?.id || "unknown",
              album: song.album?.title || "Unknown Album",
              albumId: song.album?.id || "unknown",
              duration: song.duration || 30,
              cover:
                song.album?.cover_medium ||
                "/placeholder.svg?height=300&width=300",
              audioUrl:
                song.preview ||
                "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            }))
          : [];

        setSongs(formattedSongs);
      } catch (error) {
        console.error("Error searching songs:", error);
        const randomTracks = await getRandomTracks(6);
        const formattedRandomSongs = randomTracks.map((track) => ({
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
        }));
        setSongs(formattedRandomSongs);
        setSearchError(
          "Couldn't find songs matching your search. Showing random songs instead."
        );
      }

      // Search albums
      try {
        const albumsData = await searchMusic(searchTerm, "album");
        setAlbums(
          Array.isArray(albumsData)
            ? albumsData.slice(0, 12).map((album) => ({
                id: album.id || `album-${Math.random()}`,
                title: album.title || "Unknown Album",
                artist: album.artist?.name || "Unknown Artist",
                artistId: album.artist?.id || "unknown",
                cover:
                  album.cover_medium || "/placeholder.svg?height=300&width=300",
              }))
            : []
        );
      } catch (error) {
        console.error("Error searching albums:", error);
        const randomAlbums = await getRandomAlbums(6);
        const formattedRandomAlbums = randomAlbums.map((album) => ({
          id: album.id || `album-${Math.random()}`,
          title: album.title || "Unknown Album",
          artist: album.artist?.name || "Unknown Artist",
          artistId: album.artist?.id || "unknown",
          cover: album.cover_medium || "/placeholder.svg?height=300&width=300",
        }));
        setAlbums(formattedRandomAlbums);
      }

      // Search artists
      try {
        const artistsData = await searchMusic(searchTerm, "artist");
        setArtists(
          Array.isArray(artistsData)
            ? artistsData.slice(0, 12).map((artist) => ({
                id: artist.id || `artist-${Math.random()}`,
                name: artist.name || "Unknown Artist",
                image:
                  artist.picture_medium ||
                  "/placeholder.svg?height=300&width=300",
              }))
            : []
        );
      } catch (error) {
        console.error("Error searching artists:", error);
        const randomArtists = await getRandomArtists(6);
        const formattedRandomArtists = randomArtists.map((artist) => ({
          id: artist.id || `artist-${Math.random()}`,
          name: artist.name || "Unknown Artist",
          image:
            artist.picture_medium || "/placeholder.svg?height=300&width=300",
        }));
        setArtists(formattedRandomArtists);
      }
    } catch (error) {
      console.error("Error searching:", error);
      setSearchError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
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

          {searchError && (
            <div className="bg-ocean-light/10 border border-ocean-light/20 p-4 rounded-md text-ocean-dark dark:text-ocean-light mb-4">
              {searchError}
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
