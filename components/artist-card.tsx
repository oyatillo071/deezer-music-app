"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Artist {
  id: string;
  name: string;
  image: string;
}

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/artist/${artist.id}`);
  };

  return (
    <Card
      className="overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={artist.image || "/placeholder.svg?height=300&width=300"}
            alt={artist.name}
            fill
            className="object-cover transition-all group-hover:scale-105 rounded-full"
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
        <div className="p-3 text-center">
          <div className="font-medium hover:underline truncate block">
            {artist.name}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Artist</div>
        </div>
      </CardContent>
    </Card>
  );
}
