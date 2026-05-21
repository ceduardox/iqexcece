import { useCallback, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Dumbbell, ChevronRight, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BottomNavBar } from "@/components/BottomNavBar";
import { EditorToolbar, type PageStyles, type ElementStyle, type DeviceMode, resolveStyle } from "@/components/EditorToolbar";
import { LanguageButton } from "@/components/LanguageButton";
import { VideoBackground, useMediaKind } from "@/components/VideoBackground";
import { useIsMobile } from "@/hooks/use-mobile";
import { Minus } from "lucide-react";
import menuCurveImg from "@assets/menu_1769957804819.png";
import { useToast } from "@/hooks/use-toast";

const TRAINING_SELECTION_STYLE_CACHE_KEY = "page-style:entrenamiento-selection-page:";
const TRAINING_SELECTION_ITEMS_CACHE_KEY = "items-cache:entrenamiento-selection-page:";

function readCachedTrainingSelectionStyles(lang: string): PageStyles {
  try {
    const raw = localStorage.getItem(`${TRAINING_SELECTION_STYLE_CACHE_KEY}${lang}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readCachedTrainingItems(lang: string): { items: EntrenamientoItem[] } | undefined {
  try {
    const raw = localStorage.getItem(`${TRAINING_SELECTION_ITEMS_CACHE_KEY}${lang}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed && Array.isArray(parsed.items) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function SpacerEl({ id, styles, isMobile, editorMode, getEditableClass, handleElementClick }: {
  id: string; styles: PageStyles; isMobile: boolean; editorMode: boolean;
  getEditableClass: (id: string) => string; handleElementClick: (id: string, e: React.MouseEvent) => void;
}) {
  const resolved = resolveStyle(styles, id, isMobile);
  const height = resolved.sectionHeight ?? resolved.spacerHeight ?? 20;
  const visible = resolved.visible !== false;
  if (!visible && !editorMode) return null;
  return (
    <div className={`w-full ${getEditableClass(id)} ${!visible && editorMode ? "opacity-40" : ""}`}
      onClick={(e) => handleElementClick(id, e)}
      style={{ height: visible ? height : 4, background: editorMode ? "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,217,255,0.08) 5px, rgba(0,217,255,0.08) 10px)" : "transparent", transition: "height 0.2s ease" }}
      data-testid={`spacer-${id}`}>
      {editorMode && <div className="flex items-center justify-center h-full"><span className="text-[9px] text-gray-400 bg-gray-900/60 px-2 py-0.5 rounded"><Minus className="w-3 h-3 inline mr-1" />{id} ({height}px) {!visible ? "[oculto]" : ""}</span></div>}
    </div>
  );
}

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

interface EntrenamientoItem {
  id: string;
  categoria: string;
  imageUrl: string | null;
  title: string;
  description: string | null;
  linkUrl: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
  tipoEjercicio?: string;
}

const normalizeExerciseType = (tipoEjercicio?: string | null): string => {
  const normalized = (tipoEjercicio || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  const aliasMap: Record<string, string> = {
    velocidad_lectura: "velocidad",
    progressive_visual_tracking: "velocidad",
    rastreo_visual_progresivo: "velocidad",
    vision_periferica: "reconocimiento_visual",
    visión_periférica: "reconocimiento_visual",
    atencion_selectiva: "numeros",
    atención_selectiva: "numeros",
    taquistoscopia: "aceleracion_lectura",
    taquistoscopia_flash: "aceleracion_lectura",
    flash: "aceleracion_lectura",
    numeros_letras: "numeros",
  };

  return aliasMap[normalized] || normalized || "velocidad";
};


const defaultCardStyles = [
  { bg: "linear-gradient(145deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)", textDark: false },
  { bg: "linear-gradient(145deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)", textDark: false },
  { bg: "linear-gradient(145deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)", textDark: false },
  { bg: "linear-gradient(145deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)", textDark: false },
  { bg: "linear-gradient(145deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)", textDark: false },
];

const defaultIcons = [
  "https://cdn-icons-png.flaticon.com/512/3588/3588658.png",
  "https://cdn-icons-png.flaticon.com/512/2103/2103633.png",
  "https://cdn-icons-png.flaticon.com/512/3588/3588614.png",
  "https://cdn-icons-png.flaticon.com/512/2693/2693507.png",
  "https://cdn-icons-png.flaticon.com/512/3176/3176267.png",
];
const TRAINING_SELECTION_ASSET_WARM_KEY = "assets-warm:entrenamiento-selection-page:";
const TRAINING_SELECTION_HEADER_LOGO = "/api/images/e038af72-17b2-4944-a203-afa1f753b33a";

function isKnownVideoAsset(url: string) {
  const lower = url.toLowerCase();
  return lower.endsWith(".webm") || lower.endsWith(".mp4") || lower.includes("video/webm") || lower.includes("video/mp4");
}

function extractImageUrlsFromStyles(styles: PageStyles): string[] {
  return Object.entries(styles)
    .filter(([key]) => !key.includes("icon") && !key.includes("btn"))
    .map(([, style]) => style?.imageUrl)
    .filter((url): url is string => typeof url === "string" && url.trim().length > 0 && !isKnownVideoAsset(url));
}

function preloadImages(urls: string[], timeoutMs = 5000): Promise<void> {
  const unique = Array.from(new Set(urls.filter((url) => url && !isKnownVideoAsset(url))));
  if (!unique.length) return Promise.resolve();

  return new Promise((resolve) => {
    let done = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      resolve();
    };

    const timer = window.setTimeout(finish, timeoutMs);
    const markDone = () => {
      done += 1;
      if (done >= unique.length) {
        window.clearTimeout(timer);
        finish();
      }
    };

    unique.forEach((url) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = markDone;
      img.onerror = markDone;
      img.src = url;
    });
  });
}

function getAssetWarmSignature(urls: string[]) {
  return Array.from(new Set(urls.filter(Boolean))).sort().join("|");
}

function getTrainingCriticalAssetUrls(styles: PageStyles) {
  return [
    ...extractImageUrlsFromStyles(styles),
    TRAINING_SELECTION_HEADER_LOGO,
  ];
}

function getTrainingWarmSignature(styles: PageStyles) {
  return getAssetWarmSignature(getTrainingCriticalAssetUrls(styles));
}

function DeferredVideoBackground({ src, imageSize, active }: { src?: string; imageSize?: number; active: boolean }) {
  const mediaKind = useMediaKind(src, !!src);
  if (!src || mediaKind !== "video") return null;
  if (active) return <VideoBackground src={src} imageSize={imageSize} />;
  return <VideoPosterImage src={src} className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none" />;
}

function EditorCardBackgroundMedia({ src, imageSize, active }: { src?: string; imageSize?: number; active: boolean }) {
  const mediaKind = useMediaKind(src, !!src);
  if (!src) return null;

  if (mediaKind === "video") {
    return <DeferredVideoBackground src={src} imageSize={imageSize} active={active} />;
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none"
      style={imageSize ? { transform: `scale(${imageSize / 100})` } : undefined}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

function getVideoPosterCacheKey(src: string) {
  return `video-poster-webp:v2:${src}`;
}

function VideoPosterImage({
  src,
  className = "",
  style,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRequestedRef = useRef(false);
  const [poster, setPoster] = useState<string>(() => {
    try {
      return localStorage.getItem(getVideoPosterCacheKey(src)) || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    captureRequestedRef.current = false;
    try {
      setPoster(localStorage.getItem(getVideoPosterCacheKey(src)) || "");
    } catch {
      setPoster("");
    }
  }, [src]);

  const capturePoster = useCallback(() => {
    if (poster) return;
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    try {
      const canvas = document.createElement("canvas");
      const maxWidth = 360;
      const scale = Math.min(1, maxWidth / video.videoWidth);
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/webp", 0.72);
      setPoster(dataUrl);
      try {
        localStorage.setItem(getVideoPosterCacheKey(src), dataUrl);
      } catch {
        // The poster is an optimization. If storage is full, keep the runtime preview only.
      }
    } catch {
      // Keep the paused video frame as fallback.
    }
  }, [poster, src]);

  const seekToPreviewFrame = useCallback(() => {
    if (poster || captureRequestedRef.current) return;
    const video = videoRef.current;
    if (!video) return;

    captureRequestedRef.current = true;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const target = duration > 0 ? Math.min(Math.max(duration * 0.22, 0.18), 0.8) : 0.25;

    try {
      video.currentTime = target;
    } catch {
      window.setTimeout(capturePoster, 80);
    }
  }, [capturePoster, poster]);

  if (poster) {
    return <img src={poster} alt="" className={className} style={style} loading="lazy" decoding="async" />;
  }

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      preload="metadata"
      className={`${className} opacity-0`}
      style={style}
      onLoadedMetadata={seekToPreviewFrame}
      onLoadedData={seekToPreviewFrame}
      onSeeked={capturePoster}
      aria-hidden="true"
    />
  );
}

function TrainingMediaIcon({ src, size, active }: { src: string; size: number; active: boolean }) {
  const mediaKind = useMediaKind(src, !!src);
  const style = { width: size, height: size, objectFit: "contain" as const };

  if (mediaKind === "video") {
    if (!active) return <VideoPosterImage src={src} className="drop-shadow-md rounded-2xl" style={style} />;
    return <video src={src} autoPlay loop muted playsInline preload="metadata" className="drop-shadow-md" style={style} />;
  }

  return <img src={src} alt="" loading="lazy" decoding="async" className="drop-shadow-md" style={style} />;
}

function TrainingSelectionCard({
  item,
  index,
  editorMode,
  isMobile,
  t,
  getResolvedStyle,
  getEditableClass,
  handleElementClick,
  handleSelect,
}: {
  item: EntrenamientoItem;
  index: number;
  editorMode: boolean;
  isMobile: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
  getResolvedStyle: (elementId: string) => ElementStyle;
  getEditableClass: (elementId: string) => string;
  handleElementClick: (elementId: string, e: React.MouseEvent) => void;
  handleSelect: (item: EntrenamientoItem) => void;
}) {
  const [mediaActive, setMediaActive] = useState(false);
  const cardId = `ent-card-${index}`;
  const titleId = `ent-title-${index}`;
  const descId = `ent-desc-${index}`;
  const iconId = `ent-icon-${index}`;
  const btnId = `ent-btn-${index}`;

  const defaultStyle = defaultCardStyles[index % defaultCardStyles.length];
  const cardStyle = getResolvedStyle(cardId);
  const backgroundUrl = cardStyle?.imageUrl?.trim();
  const rIcon = getResolvedStyle(iconId);
  const iconUrl = rIcon?.imageUrl || item.imageUrl || defaultIcons[index % defaultIcons.length];
  const isMd = !isMobile;
  const iconSize = rIcon?.iconSize || rIcon?.imageSize || (isMd ? 96 : 64);
  const exerciseType = normalizeExerciseType(item.tipoEjercicio);
  const armMedia = () => setMediaActive(true);

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.4, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      onMouseEnter={() => { if (!isMobile) armMedia(); }}
      onMouseLeave={() => { if (!isMobile) setMediaActive(false); }}
      onFocus={armMedia}
      onPointerDown={armMedia}
      onClick={(e) => editorMode ? handleElementClick(cardId, e) : handleSelect(item)}
      className={`cursor-pointer ${getEditableClass(cardId)}`}
      data-testid={`card-entrenamiento-${item.id}`}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl p-4 md:p-8 flex flex-col items-center text-center"
        style={{
          background: cardStyle?.background || defaultStyle.bg,
          border: "1px solid rgba(0,180,255,0.25)",
          boxShadow: cardStyle?.shadowBlur
            ? `0 ${cardStyle.shadowBlur / 2}px ${cardStyle.shadowBlur}px ${cardStyle.shadowColor || "rgba(0,180,255,0.1)"}`
            : "0 0 20px rgba(0,180,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
          borderRadius: cardStyle?.borderRadius || 16
        }}
        whileTap={{ scale: editorMode ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <EditorCardBackgroundMedia src={backgroundUrl} imageSize={cardStyle?.imageSize} active={mediaActive} />

        <div
          className={`relative z-10 flex items-center justify-center mb-3 ${getEditableClass(iconId)}`}
          onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(iconId, e); }}}
          style={{ width: iconSize, height: iconSize }}
        >
          <TrainingMediaIcon src={iconUrl} size={iconSize} active={mediaActive} />
        </div>

        <h3
          className={`relative z-10 text-sm md:text-lg font-bold mb-1 md:mb-2 leading-tight ${getEditableClass(titleId)}`}
          onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(titleId, e); }}}
          style={{
            fontSize: getResolvedStyle(titleId)?.fontSize || (isMd ? 18 : 14),
            color: getResolvedStyle(titleId)?.textColor || "#ffffff"
          }}
        >
          {t(`entrenamiento.cardTitle_${exerciseType}`, { defaultValue: item.title })}
        </h3>
        {item.description && (
          <p
            className={`relative z-10 text-xs leading-snug mb-3 ${getEditableClass(descId)}`}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(descId, e); }}}
            style={{
              fontSize: getResolvedStyle(descId)?.fontSize || 11,
              color: getResolvedStyle(descId)?.textColor || "rgba(255,255,255,0.55)"
            }}
          >
            {t(`entrenamiento.cardDesc_${exerciseType}`, { defaultValue: item.description || "" })}
          </p>
        )}
        <motion.button
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className={`relative z-10 w-full px-3 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 ${getEditableClass(btnId)}`}
          onClick={(e) => {
            e.stopPropagation();
            if (editorMode) {
              handleElementClick(btnId, e);
            } else {
              playButtonSound();
              handleSelect(item);
            }
          }}
          style={(() => { const bs = getResolvedStyle(btnId); return {
            background: (bs?.imageUrl && bs?.backgroundType === "image")
              ? `url(${bs.imageUrl}) center/cover no-repeat`
              : (bs?.background || "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)"),
            backgroundSize: bs?.imageSize ? `${bs.imageSize}%` : "cover",
            color: bs?.textColor || "white",
            border: "none",
            boxShadow: bs?.shadowBlur
              ? `0 ${bs.shadowBlur / 2}px ${bs.shadowBlur}px ${bs?.shadowColor || "rgba(139,92,246,0.3)"}`
              : "0 4px 15px rgba(139,92,246,0.3)"
          };})()}
          whileTap={{ scale: editorMode ? 1 : 0.95 }}
        >
          {t("entrenamiento.startBtn")}
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function EntrenamientoSelectionPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "es").startsWith("en")
    ? "en"
    : (i18n.language || "es").startsWith("pt")
      ? "pt"
      : "es";
  const [, setLocation] = useLocation();
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>(() => readCachedTrainingSelectionStyles(lang));
  const [stylesReady, setStylesReady] = useState<boolean>(() => Object.keys(readCachedTrainingSelectionStyles(lang)).length > 0);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const warnedAuthRef = useRef(false);

  const { data: itemsData, isLoading } = useQuery<{ items: EntrenamientoItem[] }>({
    queryKey: ["/api/entrenamiento", "ninos", "items", lang],
    queryFn: async () => {
      const res = await fetch(`/api/entrenamiento/ninos/items?lang=${lang}`);
      const data = await res.json();
      if (Array.isArray(data?.items)) {
        localStorage.setItem(`${TRAINING_SELECTION_ITEMS_CACHE_KEY}${lang}`, JSON.stringify({ items: data.items }));
      }
      return data;
    },
    initialData: () => readCachedTrainingItems(lang),
  });

  const items = itemsData?.items?.filter(i => i.isActive !== false) || [];

  useEffect(() => {
    const handleStorageChange = () => {
      setEditorMode(localStorage.getItem("editorMode") === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 500);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const cachedStyles = readCachedTrainingSelectionStyles(lang);
    const hasCachedStyles = Object.keys(cachedStyles).length > 0;
    setStyles(cachedStyles);
    setStylesReady(hasCachedStyles);

    fetch(`/api/page-styles/entrenamiento-selection-page?lang=${lang}`, { signal: controller.signal })
      .then(res => res.json())
      .then(async (data) => {
        if (data.style?.styles) {
          try {
            const nextStyles = JSON.parse(data.style.styles);
            const nextSignature = getTrainingWarmSignature(nextStyles);
            const warmKey = `${TRAINING_SELECTION_ASSET_WARM_KEY}${lang}`;

            setStyles(nextStyles);
            localStorage.setItem(`${TRAINING_SELECTION_STYLE_CACHE_KEY}${lang}`, JSON.stringify(nextStyles));

            if (localStorage.getItem(warmKey) !== nextSignature) {
              preloadImages(getTrainingCriticalAssetUrls(nextStyles), 1800).then(() => {
                localStorage.setItem(warmKey, nextSignature);
              });
            }
            return;
          } catch (e) {
            console.log("No saved styles");
          }
        }
        const fallbackRes = await fetch(`/api/page-styles/entrenamiento-page?lang=${lang}`, { signal: controller.signal });
        const fallback = await fallbackRes.json();
        if (fallback.style?.styles) {
          try {
            const nextStyles = JSON.parse(fallback.style.styles);
            const nextSignature = getTrainingWarmSignature(nextStyles);
            const warmKey = `${TRAINING_SELECTION_ASSET_WARM_KEY}${lang}`;

            setStyles(nextStyles);
            localStorage.setItem(`${TRAINING_SELECTION_STYLE_CACHE_KEY}${lang}`, JSON.stringify(nextStyles));

            if (localStorage.getItem(warmKey) !== nextSignature) {
              preloadImages(getTrainingCriticalAssetUrls(nextStyles), 1800).then(() => {
                localStorage.setItem(warmKey, nextSignature);
              });
            }
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {
        setStylesReady(true);
      });

    return () => {
      controller.abort();
    };
  }, [lang]);

  useEffect(() => {
    if (!stylesReady || isLoading) return;
    const warmKey = `${TRAINING_SELECTION_ASSET_WARM_KEY}${lang}`;

    let cancelled = false;
    const assetUrls = getTrainingCriticalAssetUrls(styles);
    const assetSignature = getAssetWarmSignature(assetUrls);

    if (localStorage.getItem(warmKey) === assetSignature) {
      return;
    }

    preloadImages(assetUrls, 1800).then(() => {
      if (cancelled) return;
      localStorage.setItem(warmKey, assetSignature);
    });

    const nonBlockingItemImages = items
      .map((item) => (item.imageUrl || "").trim())
      .filter((url): url is string => !!url && !isKnownVideoAsset(url));
    preloadImages(nonBlockingItemImages, 2500).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [stylesReady, styles, lang, isLoading, items]);

  const saveStyles = useCallback(async (newStyles: PageStyles) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      if (!warnedAuthRef.current) {
        warnedAuthRef.current = true;
        toast({ title: "No guardado", description: "Inicia sesion en admin para guardar estilos.", variant: "destructive" });
      }
      return;
    }
    
    try {
      const res = await fetch("/api/admin/page-styles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          pageName: "entrenamiento-selection-page",
          styles: JSON.stringify(newStyles),
          lang
        })
      });
      if (!res.ok) {
        if (res.status === 401 && !warnedAuthRef.current) {
          warnedAuthRef.current = true;
          toast({ title: "Sesion expirada", description: "Vuelve a iniciar sesion en admin para guardar.", variant: "destructive" });
        }
        return;
      }
      warnedAuthRef.current = false;
      localStorage.setItem(`${TRAINING_SELECTION_STYLE_CACHE_KEY}${lang}`, JSON.stringify(newStyles));
    } catch (error) {
      console.error("Error saving styles:", error);
    }
  }, [toast, lang]);

  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    if (!editorMode) return;
    e.stopPropagation();
    setSelectedElement(elementId);
  }, [editorMode]);

  const handleStyleChange = useCallback((elementId: string, newStyle: ElementStyle) => {
    const updated = { ...styles, [elementId]: { ...styles[elementId], ...newStyle } };
    setStyles(updated);
    saveStyles(updated);
  }, [styles, saveStyles]);

  const handleEditorClose = useCallback(() => {
    setSelectedElement(null);
    localStorage.setItem("editorMode", "false");
    setEditorMode(false);
  }, []);

  const getEditableClass = useCallback((elementId: string) => {
    if (!editorMode) return "";
    const base = "transition-all duration-200";
    return selectedElement === elementId
      ? `${base} ring-2 ring-purple-500 ring-offset-2`
      : `${base} hover:ring-2 hover:ring-purple-400 hover:ring-offset-1`;
  }, [editorMode, selectedElement]);

  const getResolvedStyle = useCallback((elementId: string): ElementStyle => {
    return resolveStyle(styles, elementId, isMobile);
  }, [styles, isMobile]);

  const getElementStyle = useCallback((elementId: string, defaultBg?: string) => {
    const s = getResolvedStyle(elementId);
    const result: React.CSSProperties = {};
    if (s?.imageUrl && s?.backgroundType === "image") {
      result.background = `url(${s.imageUrl}) center/cover no-repeat`;
      if (s?.imageSize) {
        result.backgroundSize = `${s.imageSize}%`;
      }
    } else if (s?.background) {
      result.background = s.background;
    } else if (defaultBg) {
      result.background = defaultBg;
    }
    if (s?.marginTop) result.marginTop = s.marginTop;
    if (s?.marginBottom) result.marginBottom = s.marginBottom;
    if (s?.marginLeft) result.marginLeft = s.marginLeft;
    if (s?.marginRight) result.marginRight = s.marginRight;
    if (s?.sectionHeight) result.minHeight = s.sectionHeight;
    return result;
  }, [getResolvedStyle]);

  const handleSelect = useCallback((item: EntrenamientoItem) => {
    if (editorMode) return;
    playCardSound();
    sessionStorage.setItem("selectedEntrenamientoItem", JSON.stringify(item));
    setLocation(`/entrenamiento-edad/${item.id}`);
  }, [editorMode, setLocation]);

  if (isLoading || !stylesReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header 
        className="flex md:hidden items-center justify-center px-5 bg-white sticky top-0 z-50"
        style={{ paddingTop: 10, paddingBottom: 10 }}
      >
        <button 
          onClick={() => { playButtonSound(); setLocation("/"); }}
          className="absolute left-5 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 2px 8px rgba(138,63,252,0.15)" }}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#8a3ffc" }} />
        </button>
        <img 
          src={TRAINING_SELECTION_HEADER_LOGO}
          alt="iQx" 
          className="h-10 w-auto object-contain"
          data-testid="header-logo-image"
        />
        <div className="absolute right-5">
          <LanguageButton />
        </div>
      </header>

      <div className="w-full sticky z-40 md:hidden" style={{ top: 56, marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <SpacerEl id="spacer-top" styles={styles} isMobile={isMobile} editorMode={editorMode} getEditableClass={getEditableClass} handleElementClick={handleElementClick} />
        <div 
          className={`w-full ${getEditableClass("hero-section")}`}
          onClick={(e) => handleElementClick("hero-section", e)}
          style={{
            paddingTop: "16px",
            position: "relative",
            backgroundSize: getResolvedStyle("hero-section")?.imageSize ? `${getResolvedStyle("hero-section").imageSize}%` : "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            ...getElementStyle("hero-section", "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)")
          }}
          data-testid="hero-section"
        >
          <div className="relative z-10 px-5 pb-8">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-[26px] md:text-4xl font-medium leading-[1.15] mb-4 ${getEditableClass("hero-title")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-title", e); }}
                style={getElementStyle("hero-title")}
              >
                <span style={{ color: getResolvedStyle("hero-title")?.textColor || "#8a3ffc" }}>
                  {getResolvedStyle("hero-title")?.buttonText?.split('\n')[0] || t("training.heroTitle1")}
                </span>
                <br />
                <span style={{ color: getResolvedStyle("hero-title")?.textColor || "#8a3ffc" }}>
                  {getResolvedStyle("hero-title")?.buttonText?.split('\n')[1] || t("training.heroTitle2")}
                </span>
                <br />
                <span style={{ 
                  background: "linear-gradient(90deg, #00d9ff, #8a3ffc)", 
                  WebkitBackgroundClip: "text", 
                  WebkitTextFillColor: "transparent" 
                }}>
                  {getResolvedStyle("hero-title")?.buttonText?.split('\n')[2] || t("training.heroTitle3")}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`text-sm font-semibold mb-0 ${getEditableClass("hero-subtitle")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle", e); }}
                style={{ color: getResolvedStyle("hero-subtitle")?.textColor || "#1f2937", ...getElementStyle("hero-subtitle") }}
              >
                {getResolvedStyle("hero-subtitle")?.buttonText || t("training.heroSubtitle1")}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className={`text-sm font-semibold mb-2 ${getEditableClass("hero-subtitle2")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle2", e); }}
                style={{ color: getResolvedStyle("hero-subtitle2")?.textColor || "#1f2937", ...getElementStyle("hero-subtitle2") }}
              >
                {getResolvedStyle("hero-subtitle2")?.buttonText || t("training.heroSubtitle2")}
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`text-xs leading-relaxed ${getEditableClass("hero-desc")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-desc", e); }}
                style={{ color: getResolvedStyle("hero-desc")?.textColor || "#6b7280", ...getElementStyle("hero-desc") }}
              >
                {getResolvedStyle("hero-desc")?.buttonText || t("training.heroDesc")}
              </motion.p>
            </div>
          </div>
        </div>

        <SpacerEl id="spacer-mid" styles={styles} isMobile={isMobile} editorMode={editorMode} getEditableClass={getEditableClass} handleElementClick={handleElementClick} />

        <div 
          className={`px-4 pb-8 -mt-2 relative ${getEditableClass("cards-section")}`}
          onClick={(e) => handleElementClick("cards-section", e)}
          style={{
            ...(() => { const cs = getResolvedStyle("cards-section"); return (cs?.imageUrl && cs?.backgroundType === "image")
              ? { background: `url(${cs.imageUrl}) center/cover no-repeat`, backgroundSize: cs?.imageSize ? `${cs.imageSize}%` : "cover" }
              : cs?.background ? { background: cs.background } : {}; })(),
            borderRadius: getResolvedStyle("cards-section")?.borderRadius || 0,
            padding: (getResolvedStyle("cards-section")?.imageUrl && getResolvedStyle("cards-section")?.backgroundType === "image") ? "16px" : undefined,
            paddingBottom: getResolvedStyle("cards-section")?.sectionHeight || 32
          }}
        >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 md:max-w-6xl md:mx-auto md:justify-items-center">
          {items.length === 0 ? (
            <div className="text-center py-8 col-span-full">
              <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{t("training.noItems")}</p>
            </div>
          ) : (
            items.map((item, index) => (
              <TrainingSelectionCard
                key={item.id}
                item={item}
                index={index}
                editorMode={editorMode}
                isMobile={isMobile}
                t={t}
                getResolvedStyle={getResolvedStyle}
                getEditableClass={getEditableClass}
                handleElementClick={handleElementClick}
                handleSelect={handleSelect}
              />
            ))
          )}
        </div>
        </div>
      </main>

      <BottomNavBar />

      {editorMode && (
        <EditorToolbar
          selectedElement={selectedElement}
          styles={styles}
          onStyleChange={handleStyleChange}
          onSave={() => saveStyles(styles)}
          onClose={handleEditorClose}
          onClearSelection={() => setSelectedElement(null)}
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
        />
      )}
    </div>
  );
}
