"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserStore } from "@/store/user-store";
import { usePlayerStore } from "@/store/player-store";
import {
  AlertCircle,
  Check,
  Info,
  User,
  Volume2,
  Shield,
  Bell,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { username, theme, setTheme, setUsername } = useUserStore();
  const { volume, setVolume, apiKey, setApiKey } = usePlayerStore();

  const [newUsername, setNewUsername] = useState(username);
  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [highQuality, setHighQuality] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);

  // Get masked API key
  useEffect(() => {
    if (apiKey) {
      const masked =
        apiKey.substring(0, 4) +
        "•".repeat(apiKey.length - 8) +
        apiKey.substring(apiKey.length - 4);
      setNewApiKey(masked);
    }
  }, [apiKey]);

  const handleSaveUsername = () => {
    if (newUsername.trim()) {
      setUsername(newUsername);
      toast({
        title: "Username updated",
        description: "Your username has been successfully updated.",
      });
    }
  };

  const handleSaveApiKey = () => {
    // Only save if it's not the masked version
    if (newApiKey && !newApiKey.includes("•")) {
      setApiKey(newApiKey);
      localStorage.setItem("music_api_key", newApiKey);
      toast({
        title: "API Key updated",
        description: "Your API key has been successfully updated.",
      });
    }
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all local data? This will remove your playlists, favorites, and settings."
      )
    ) {
      localStorage.clear();
      toast({
        title: "Data cleared",
        description:
          "All local data has been cleared. Please refresh the page.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Volume2 className="h-4 w-4 mr-2" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                  <Button onClick={handleSaveUsername}>Save</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <div className="flex gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Manage your API key for music services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </Button>
                  <Button onClick={handleSaveApiKey}>Save</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your API key is stored locally and used to access the music
                  service
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Clearing your data will remove all your playlists, favorites,
                  and settings.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={handleClearData}>
                Clear All Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audio Settings</CardTitle>
              <CardDescription>Customize your audio experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="volume">Default Volume</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="volume"
                    value={[volume]}
                    max={1}
                    step={0.01}
                    className="w-full"
                    onValueChange={(value) => setVolume(value[0])}
                  />
                  <span className="w-12 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoplay">Autoplay</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically play music when you open the app
                  </p>
                </div>
                <Switch
                  id="autoplay"
                  checked={autoplay}
                  onCheckedChange={setAutoplay}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-quality">High Quality Streaming</Label>
                  <p className="text-sm text-muted-foreground">
                    Stream music in higher quality (uses more data)
                  </p>
                </div>
                <Switch
                  id="high-quality"
                  checked={highQuality}
                  onCheckedChange={setHighQuality}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about new releases and updates
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Browser Permissions</AlertTitle>
                <AlertDescription>
                  You may need to allow browser notifications for this feature
                  to work.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-collection">Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous usage data collection to improve the app
                  </p>
                </div>
                <Switch
                  id="data-collection"
                  checked={dataCollection}
                  onCheckedChange={setDataCollection}
                />
              </div>

              <Alert variant="success">
                <Check className="h-4 w-4" />
                <AlertTitle>Local Storage Only</AlertTitle>
                <AlertDescription>
                  All your data is stored locally on your device. We don't store
                  any personal information on our servers.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
