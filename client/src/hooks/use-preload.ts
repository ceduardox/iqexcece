import { useEffect } from "react";

const SOUND_FILES = ["/card.mp3", "/iphone.mp3", "/open.mp3", "/fingerprint-sound.mp3"];

export function preloadCriticalAssets() {
  SOUND_FILES.forEach(src => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = src;
  });
}

export function usePreloadAssets() {
  useEffect(() => {
    preloadCriticalAssets();
  }, []);
}
