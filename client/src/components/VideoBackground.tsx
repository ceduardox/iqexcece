import { useRef, useEffect, useState } from "react";

const videoUrlCache = new Map<string, boolean>();
const mediaKindCache = new Map<string, "image" | "video" | "unknown">();

function getKnownMediaKind(url: string | undefined): "image" | "video" | "unknown" {
  if (!url) return "unknown";
  const lower = url.toLowerCase();
  if (lower.endsWith(".webm") || lower.endsWith(".mp4") || lower.includes("video/webm") || lower.includes("video/mp4")) {
    return "video";
  }
  if (
    lower.endsWith(".webp") ||
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.includes("image/")
  ) {
    return "image";
  }
  return "unknown";
}

function getManagedImageMetaUrl(url: string): string | null {
  const match = url.match(/^(?:https?:\/\/[^/]+)?\/api\/images\/([^/?#]+)/i);
  if (!match) return null;
  return `/api/images/${match[1]}/meta`;
}

export function isVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  if (getKnownMediaKind(url) === "video") return true;
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

export async function checkMediaKind(url: string): Promise<"image" | "video" | "unknown"> {
  if (!url) return "unknown";
  const known = getKnownMediaKind(url);
  if (known !== "unknown") {
    mediaKindCache.set(url, known);
    return known;
  }
  if (mediaKindCache.has(url)) return mediaKindCache.get(url)!;

  try {
    const metaUrl = getManagedImageMetaUrl(url);
    let contentType = "";

    if (metaUrl) {
      const metaRes = await fetch(metaUrl);
      const metaContentType = metaRes.headers.get("content-type") || "";
      if (metaRes.ok && metaContentType.includes("application/json")) {
        contentType = String((await metaRes.json())?.mimeType || "");
      }
    }

    if (!contentType) {
      const res = await fetch(url, { method: "HEAD" });
      contentType = res.headers.get("content-type") || "";
    }

    const result = contentType.startsWith("video/")
      ? "video"
      : contentType.startsWith("image/")
        ? "image"
        : "unknown";
    mediaKindCache.set(url, result);
    videoUrlCache.set(url, result === "video");
    return result;
  } catch {
    mediaKindCache.set(url, "unknown");
    return "unknown";
  }
}

export function useMediaKind(url: string | undefined, enabled = true): "image" | "video" | "unknown" {
  const [kind, setKind] = useState<"image" | "video" | "unknown">(() => {
    if (!url) return "unknown";
    return mediaKindCache.get(url) || getKnownMediaKind(url);
  });

  useEffect(() => {
    if (!url) {
      setKind("unknown");
      return;
    }
    const known = mediaKindCache.get(url) || getKnownMediaKind(url);
    setKind(known);
    if (!enabled || known !== "unknown") return;

    let cancelled = false;
    checkMediaKind(url).then((nextKind) => {
      if (!cancelled) setKind(nextKind);
    });
    return () => {
      cancelled = true;
    };
  }, [url, enabled]);

  return kind;
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

export function MediaIcon({ src, size, className = "" }: { src: string; size: number; className?: string }) {
  const isVideo = useIsVideo(src);
  const style = { width: size, height: size, objectFit: "contain" as const };
  
  if (isVideo) {
    return (
      <video src={src} autoPlay loop muted playsInline preload="auto" className={`drop-shadow-md ${className}`} style={style} />
    );
  }
  return <img src={src} alt="" loading="eager" decoding="async" fetchPriority="high" className={`drop-shadow-md ${className}`} style={style} />;
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
