"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/user-store";
import { Music } from "lucide-react";

export function WelcomeLoader() {
  const { username } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [typedText, setTypedText] = useState("");
  const [startTyping, setStartTyping] = useState(false);
  const welcomeText = `Hello, ${username}!`;

  useEffect(() => {
    // Start typing immediately
    setStartTyping(true);

    // Show loader for at least 2 seconds
    const hideTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(hideTimer);
    };
  }, []);

  // Typing effect
  useEffect(() => {
    if (startTyping) {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < welcomeText.length) {
          setTypedText(welcomeText.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 80);

      return () => clearInterval(typeInterval);
    }
  }, [startTyping, welcomeText]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-ocean-dark to-ocean-medium flex items-center justify-center mb-4 animate-pulse">
          <Music className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-ocean-darkest dark:text-white h-8">
          {typedText}
          <span className="animate-blink">|</span>
        </h1>
      </div>
    </div>
  );
}
