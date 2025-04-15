"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePlayerStore } from "@/store/player-store"
import { Plus } from "lucide-react"

export function PlaylistModal() {
  const [open, setOpen] = useState(false)
  const [playlistName, setPlaylistName] = useState("")
  const { createPlaylist } = usePlayerStore()

  const handleCreatePlaylist = () => {
    if (playlistName.trim()) {
      createPlaylist(playlistName)
      setPlaylistName("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="justify-start w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
          <DialogDescription>Give your playlist a name to get started.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="My Awesome Playlist"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreatePlaylist}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
