import { useRef, useEffect, useState } from "react";

const videoUrlCache = new Map<string, boolean>();

export function isVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.endsWith('.webm') || lower.endsWith('.mp4') || lower.includes('video/webm') || lower.includes('video/mp4')) {
    return true;
  }
  if (videoUrlCache.has(url)) {
    return videoUrlCache.get(url)!;
  }
  return false;
}

export async function checkIfVideo(url: string): Promise<boolean> {
  if (!url) return false;
  if (isVideoUrl(url)) return true;
  if (videoUrlCache.has(url)) return videoUrlCache.get(url)!;
  
  try {
    const res = await fetch(url, { method: "HEAD" });
    const ct = res.headers.get("content-type") || "";
    const result = ct.startsWith("video/");
    videoUrlCache.set(url, result);
    return result;
  } catch {
    return false;
  }
}

export function useIsVideo(url: string | undefined): boolean {
  const [isVideo, setIsVideo] = useState(() => isVideoUrl(url));
  
  useEffect(() => {
    if (!url) { setIsVideo(false); return; }
    if (isVideoUrl(url)) { setIsVideo(true); return; }
    checkIfVideo(url).then(setIsVideo);
  }, [url]);
  
  return isVideo;
}

type MediaIconLoading = "eager" | "lazy";
type MediaIconFetchPriority = "high" | "low" | "auto";

export function MediaIcon({
  src,
  size,
  className = "",
  loading = "lazy",
  fetchPriority,
}: {
  src: string;
  size: number;
  className?: string;
  loading?: MediaIconLoading;
  fetchPriority?: MediaIconFetchPriority;
}) {
  const isVideo = useIsVideo(src);
  const style = { width: size, height: size, objectFit: "contain" as const };
  const roundedSize = Math.round(size);
  const priorityProps = fetchPriority ? ({ fetchPriority } as { fetchPriority: MediaIconFetchPriority }) : {};
  
  if (isVideo) {
    return (
      <video src={src} autoPlay loop muted playsInline preload="metadata" className={`drop-shadow-md ${className}`} style={style} />
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading={loading}
      decoding="async"
      width={roundedSize}
      height={roundedSize}
      className={`drop-shadow-md ${className}`}
      style={style}
      {...priorityProps}
    />
  );
}

interface VideoBackgroundProps {
  src: string;
  className?: string;
  imageSize?: number;
}

export function VideoBackground({ src, className = "", imageSize }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${className}`}
      style={imageSize ? { objectFit: "cover", transform: `scale(${imageSize / 100})` } : undefined}
      data-testid="video-background"
    />
  );
}
