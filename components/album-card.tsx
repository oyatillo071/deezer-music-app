import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Album {
  id: string
  title: string
  artist: string
  artistId: string
  cover: string
}

interface AlbumCardProps {
  album: Album
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Card className="overflow-hidden group">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={album.cover || "/placeholder.svg?height=300&width=300"}
            alt={album.title}
            fill
            className="object-cover transition-all group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Link href={`/album/${album.id}`}>
              <Button variant="default" size="icon" className="rounded-full h-12 w-12">
                <Play className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-3">
          <Link href={`/album/${album.id}`} className="font-medium hover:underline truncate block">
            {album.title}
          </Link>
          <Link
            href={`/artist/${album.artistId}`}
            className="text-sm text-muted-foreground hover:underline truncate block mt-1"
          >
            {album.artist}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
