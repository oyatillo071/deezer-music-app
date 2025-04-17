"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  cover: string;
}

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/album/${album.id}`);
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/artist/${album.artistId}`);
  };

  return (
    <Card
      className="overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={album.cover || "/placeholder.svg?height=300&width=300"}
            alt={album.title}
            fill
            className="object-cover transition-all group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="default"
              size="icon"
              className="rounded-full h-12 w-12"
            >
              <Play className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <div className="font-medium hover:underline truncate block">
            {album.title}
          </div>
          <div
            className="text-sm text-muted-foreground hover:underline truncate block mt-1"
            onClick={handleArtistClick}
          >
            {album.artist}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
