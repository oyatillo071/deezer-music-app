"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePlayerStore } from "@/store/player-store"

export function ApiKeyModal() {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const { setApiKey: storeApiKey } = usePlayerStore()

  useEffect(() => {
    // Check if API key exists in localStorage or environment variables
    const storedApiKey = localStorage.getItem("music_api_key")
    const envApiKey = process.env.NEXT_PUBLIC_MUSIC_API_KEY

    if (storedApiKey) {
      storeApiKey(storedApiKey)
    } else if (envApiKey) {
      storeApiKey(envApiKey)
      localStorage.setItem("music_api_key", envApiKey)
    } else {
      setOpen(true)
    }
  }, [storeApiKey])

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("music_api_key", apiKey)
      storeApiKey(apiKey)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter API Key</DialogTitle>
          <DialogDescription>
            Please enter your Music API key to use the application. This will be stored locally on your device.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSaveApiKey}>
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
