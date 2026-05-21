import { useEffect } from "react";

const SOUND_FILES = ["/card.mp3", "/iphone.mp3", "/open.mp3", "/fingerprint-sound.mp3"];

export function preloadCriticalAssets() {
  const preload = () => {
    SOUND_FILES.forEach(src => {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = src;
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(preload, { timeout: 5000 });
    return;
  }

  globalThis.setTimeout(preload, 3000);
}

export function usePreloadAssets() {
  useEffect(() => {
    preloadCriticalAssets();
  }, []);
}
