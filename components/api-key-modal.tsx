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
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ApiKeyModal() {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")
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
      // Basic validation - RapidAPI keys are typically long
      if (apiKey.length < 20) {
        setError("This doesn't look like a valid RapidAPI key. Please check and try again.")
        return
      }

      localStorage.setItem("music_api_key", apiKey)
      storeApiKey(apiKey)
      setError("")
      setOpen(false)

      // Reload the page to apply the new API key
      window.location.reload()
    } else {
      setError("Please enter a valid API key")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter API Key</DialogTitle>
          <DialogDescription>
            Please enter your RapidAPI key for the Deezer API to use the application. You can get a key by signing up at{" "}
            <a
              href="https://rapidapi.com/deezerdevs/api/deezer-1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ocean-dark underline"
            >
              RapidAPI
            </a>
            .
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              type="password"
              placeholder="Enter your RapidAPI key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This will be stored locally on your device and used for API requests.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSaveApiKey} className="bg-ocean-dark hover:bg-ocean-darkest text-white">
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
