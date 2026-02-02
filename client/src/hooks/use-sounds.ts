import { useCallback, useEffect, useRef } from "react";

const SOUNDS = {
  click: "/card.mp3",
  card: "/card.mp3",
  open: "/open.mp3",
  fingerprint: "/fingerprint-sound.mp3",
  iphone: "/iphone.mp3",
} as const;

type SoundType = keyof typeof SOUNDS;

const audioCache: Map<string, HTMLAudioElement> = new Map();

function preloadSound(src: string): HTMLAudioElement {
  if (audioCache.has(src)) {
    return audioCache.get(src)!;
  }
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = 0.5;
  audioCache.set(src, audio);
  return audio;
}

export function useSounds() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    Object.values(SOUNDS).forEach(src => {
      preloadSound(src);
    });
  }, []);

  const playSound = useCallback((type: SoundType) => {
    const src = SOUNDS[type];
    const audio = audioCache.get(src);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      const newAudio = new Audio(src);
      newAudio.volume = 0.5;
      newAudio.play().catch(() => {});
    }
  }, []);

  const playClick = useCallback(() => playSound("click"), [playSound]);
  const playCard = useCallback(() => playSound("card"), [playSound]);
  const playOpen = useCallback(() => playSound("open"), [playSound]);

  return { playSound, playClick, playCard, playOpen };
}
