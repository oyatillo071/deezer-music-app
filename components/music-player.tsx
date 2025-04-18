"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/player-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const [volumeVisible, setVolumeVisible] = useState(false);

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    repeat,
    shuffle,
    favorites,
    currentTime,
    duration,
    togglePlay,
    setIsPlaying,
    nextSong,
    previousSong,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleFavorite,
    updateCurrentTime,
    updateDuration,
  } = usePlayerStore();

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        toast.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong, setIsPlaying]);

  // Handle volume change
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      updateCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      updateDuration(audio.duration);
    };

    const handleEnded = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        audio.play().catch(toast.error);
      } else {
        nextSong();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [nextSong, repeat, updateCurrentTime, updateDuration]);

  // Handle click outside to close volume control
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        volumeControlRef.current &&
        !volumeControlRef.current.contains(event.target as Node) &&
        volumeVisible
      ) {
        setVolumeVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [volumeVisible]);

  // Check if current song is in favorites
  const isFavorite = currentSong
    ? favorites.some((song) => song.id === currentSong.id)
    : false;

  // Handle seek
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;

    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    updateCurrentTime(newTime);
  };

  // Toggle volume control visibility
  const toggleVolumeControl = () => {
    setVolumeVisible(!volumeVisible);
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-ocean-darkest/95 to-ocean-dark/95 backdrop-blur-md border-t border-ocean-dark/20 z-50 p-2 md:p-4 text-white">
      <audio ref={audioRef} src={currentSong.audioUrl} preload="auto" />

      {/* Enhanced equalizer animation background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-darkest/95 to-ocean-dark/95 backdrop-blur-md z-10"></div>
        {isPlaying && (
          <div className="absolute inset-0 z-0">
            {/* Circular pulse animation */}
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
              <div className="w-[500px] h-[500px] rounded-full bg-ocean-medium/10 animate-pulse"></div>
              <div
                className="absolute w-[400px] h-[400px] rounded-full bg-ocean-medium/15 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute w-[300px] h-[300px] rounded-full bg-ocean-medium/20 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>

            {/* Enhanced equalizer bars */}
            <div className="absolute bottom-0 left-0 w-full flex justify-center space-x-1 pb-1">
              <div className="flex space-x-1">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-6 bg-ocean-light/40 rounded-full equalizer-bar"
                    style={{
                      animationDuration: `${0.6 + Math.random() * 0.8}s`,
                      animationDelay: `${i * 0.05}s`,
                      height: `${Math.floor(Math.random() * 15) + 5}px`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col max-w-7xl mx-auto relative z-20">
        {/* Song info and controls in a more responsive layout */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Song info - more compact on small screens */}
          <div className="flex items-center min-w-0 flex-1 max-w-full sm:max-w-[30%]">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 mr-2 flex-shrink-0 rounded-md overflow-hidden shadow-md">
              <Image
                src={currentSong.cover || "/placeholder.svg?height=48&width=48"}
                alt={currentSong.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 overflow-hidden">
              <Link
                href={`/song/${currentSong.id}`}
                className="text-xs sm:text-sm font-medium hover:underline truncate block text-white"
              >
                {currentSong.title}
              </Link>
              <Link
                href={`/artist/${currentSong.artistId}`}
                className="text-xs text-ocean-lightest hover:underline truncate block"
              >
                {currentSong.artist}
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 text-white hover:bg-ocean-dark/50 h-8 w-8 flex-shrink-0"
              onClick={() => currentSong && toggleFavorite(currentSong)}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>
          </div>

          {/* Player controls - centered and responsive */}
          <div className="flex flex-col items-center justify-center flex-1 min-w-[200px] order-first sm:order-none w-full sm:w-auto">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={`text-white hover:bg-ocean-dark/50 h-8 w-8 ${
                  shuffle ? "text-ocean-light" : ""
                }`}
              >
                <Shuffle className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={previousSong}
                className="text-white hover:bg-ocean-dark/50 h-8 w-8"
              >
                <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10 bg-ocean-light hover:bg-ocean-medium text-ocean-darkest"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSong}
                className="text-white hover:bg-ocean-dark/50 h-8 w-8"
              >
                <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRepeat}
                className={`text-white hover:bg-ocean-dark/50 h-8 w-8 ${
                  repeat !== "off" ? "text-ocean-light" : ""
                }`}
              >
                {repeat === "one" ? (
                  <Repeat1 className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Repeat className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center w-full gap-1 sm:gap-2">
              <span className="text-xs text-ocean-lightest w-8 text-right">
                {formatDuration(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1 [&>span:first-child]:h-1 [&>span:first-child]:bg-ocean-light/30 [&_[role=slider]]:bg-ocean-light [&_[role=slider]]:w-2 [&_[role=slider]]:h-2 sm:[&_[role=slider]]:w-3 sm:[&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-ocean-light"
              />
              <span className="text-xs text-ocean-lightest w-8">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Improved volume control */}
          <div className="flex items-center justify-end sm:w-[15%] min-w-[40px]">
            <div ref={volumeControlRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVolumeControl}
                className={`text-white hover:bg-ocean-dark/50 h-8 w-8 ${
                  volumeVisible ? "bg-ocean-dark/30" : ""
                }`}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              {/* Improved volume slider */}
              {volumeVisible && (
                <div className="absolute bottom-full right-0 p-2 sm:p-4 bg-ocean-darkest/95 backdrop-blur-md border border-ocean-dark/20 rounded-md shadow-lg">
                  <div className="flex flex-col items-center">
                    <span className="text-xs mb-1 text-ocean-lightest">
                      {Math.round(volume * 100)}%
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-ocean-lightest"
                        onClick={toggleMute}
                      >
                        {isMuted ? (
                          <VolumeX className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                      </Button>
                      <Slider
                        orientation="vertical"
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.01}
                        className="h-16 sm:h-24 [&>span:first-child]:w-1 [&>span:first-child]:bg-ocean-light/30 [&_[role=slider]]:bg-ocean-light [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-ocean-light"
                        onValueChange={(value) => setVolume(value[0])}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
