import { useRef, useEffect } from "react";

export function isVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.webm') || lower.endsWith('.mp4') || lower.includes('video/webm') || lower.includes('video/mp4');
}

interface VideoBackgroundProps {
  src: string;
  className?: string;
  imageSize?: number;
}

export function VideoBackground({ src, className = "", imageSize }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${className}`}
      style={imageSize ? { objectFit: "cover", transform: `scale(${imageSize / 100})` } : undefined}
      data-testid="video-background"
    />
  );
}
