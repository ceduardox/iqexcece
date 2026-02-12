import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Dumbbell, ChevronRight, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BottomNavBar } from "@/components/BottomNavBar";
import { EditorToolbar, type PageStyles, type ElementStyle, type DeviceMode, resolveStyle } from "@/components/EditorToolbar";
import { LanguageButton } from "@/components/LanguageButton";
import { VideoBackground, MediaIcon } from "@/components/VideoBackground";
import { useIsMobile } from "@/hooks/use-mobile";
import { Minus } from "lucide-react";
import menuCurveImg from "@assets/menu_1769957804819.png";

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
}


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

export default function EntrenamientoSelectionPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'es';
  const [, setLocation] = useLocation();
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
  const isMobile = useIsMobile();

  const { data: itemsData, isLoading } = useQuery<{ items: EntrenamientoItem[] }>({
    queryKey: ["/api/entrenamiento", "ninos", "items", lang],
    queryFn: async () => {
      const res = await fetch(`/api/entrenamiento/ninos/items?lang=${lang}`);
      return res.json();
    },
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
    const timeout = setTimeout(() => setStylesLoaded(true), 2000);
    
    fetch(`/api/page-styles/entrenamiento-page?lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        if (data.style?.styles) {
          try {
            setStyles(JSON.parse(data.style.styles));
          } catch (e) {
            console.log("No saved styles");
          }
        }
        clearTimeout(timeout);
        setStylesLoaded(true);
      })
      .catch(() => {
        clearTimeout(timeout);
        setStylesLoaded(true);
      });
    
    return () => clearTimeout(timeout);
  }, [lang]);

  const saveStyles = useCallback(async (newStyles: PageStyles) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) return;
    
    try {
      await fetch("/api/admin/page-styles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          pageName: "entrenamiento-page",
          styles: JSON.stringify(newStyles),
          lang
        })
      });
    } catch (error) {
      console.error("Error saving styles:", error);
    }
  }, [lang]);

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
    if (s?.imageUrl) {
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

  if (!stylesLoaded || isLoading) {
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
          src="https://iqexponencial.app/api/images/e038af72-17b2-4944-a203-afa1f753b33a" 
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
            ...(() => { const cs = getResolvedStyle("cards-section"); return cs?.imageUrl 
              ? { background: `url(${cs.imageUrl}) center/cover no-repeat`, backgroundSize: cs?.imageSize ? `${cs.imageSize}%` : "cover" }
              : cs?.background ? { background: cs.background } : {}; })(),
            borderRadius: getResolvedStyle("cards-section")?.borderRadius || 0,
            padding: getResolvedStyle("cards-section")?.imageUrl ? "16px" : undefined,
            minHeight: getResolvedStyle("cards-section")?.sectionHeight
          }}
        >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 md:max-w-6xl md:mx-auto md:justify-items-center">
          {items.length === 0 ? (
            <div className="text-center py-8 col-span-full">
              <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{t("training.noItems")}</p>
            </div>
          ) : (
            items.map((item, index) => {
              const cardId = `ent-card-${index}`;
              const titleId = `ent-title-${index}`;
              const descId = `ent-desc-${index}`;
              const iconId = `ent-icon-${index}`;
              const btnId = `ent-btn-${index}`;
              
              const defaultStyle = defaultCardStyles[index % defaultCardStyles.length];
              const cardStyle = getResolvedStyle(cardId);
              const hasBackgroundImage = cardStyle?.imageUrl;
              const textDark = cardStyle?.textColor ? true : defaultStyle.textDark;
              const rIcon = getResolvedStyle(iconId);
              const iconUrl = rIcon?.imageUrl || item.imageUrl || defaultIcons[index % defaultIcons.length];
              const isMd = !isMobile;
              const iconSize = rIcon?.iconSize || rIcon?.imageSize || (isMd ? 96 : 64);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.4, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  onClick={(e) => editorMode ? handleElementClick(cardId, e) : handleSelect(item)}
                  className={`cursor-pointer ${getEditableClass(cardId)}`}
                  data-testid={`card-entrenamiento-${item.id}`}
                >
                  <motion.div
                    className="relative overflow-hidden rounded-2xl p-4 md:p-8 flex flex-col items-center text-center"
                    style={{ 
                      background: hasBackgroundImage 
                        ? `url(${cardStyle.imageUrl}) center/cover no-repeat`
                        : (cardStyle?.background || defaultStyle.bg),
                      border: "1px solid rgba(0,180,255,0.25)",
                      boxShadow: cardStyle?.shadowBlur 
                        ? `0 ${cardStyle.shadowBlur / 2}px ${cardStyle.shadowBlur}px ${cardStyle.shadowColor || "rgba(0,180,255,0.1)"}` 
                        : "0 0 20px rgba(0,180,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                      borderRadius: cardStyle?.borderRadius || 16
                    }}
                    whileTap={{ scale: editorMode ? 1 : 0.98 }}
                    transition={{ duration: 0.1 }}
                  >
                    {hasBackgroundImage && (
                      <VideoBackground src={cardStyle.imageUrl!} imageSize={cardStyle?.imageSize} />
                    )}
                    
                    <div 
                      className={`relative flex items-center justify-center mb-3 ${getEditableClass(iconId)}`}
                      onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(iconId, e); }}}
                      style={{ width: iconSize, height: iconSize }}
                    >
                      <MediaIcon src={iconUrl} size={iconSize} />
                    </div>
                    
                    <h3 
                      className={`text-sm md:text-lg font-bold mb-1 md:mb-2 leading-tight ${getEditableClass(titleId)}`}
                      onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(titleId, e); }}}
                      style={{ 
                        fontSize: getResolvedStyle(titleId)?.fontSize || (isMd ? 18 : 14),
                        color: getResolvedStyle(titleId)?.textColor || "#ffffff"
                      }}
                    >
                      {getResolvedStyle(titleId)?.buttonText || item.title}
                    </h3>
                    {item.description && (
                      <p 
                        className={`text-xs leading-snug mb-3 ${getEditableClass(descId)}`}
                        onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(descId, e); }}}
                        style={{ 
                          fontSize: getResolvedStyle(descId)?.fontSize || 11,
                          color: getResolvedStyle(descId)?.textColor || "rgba(255,255,255,0.55)"
                        }}
                      >
                        {getResolvedStyle(descId)?.buttonText || item.description}
                      </p>
                    )}
                    <motion.button
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className={`w-full px-3 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 ${getEditableClass(btnId)}`}
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
                        background: bs?.imageUrl 
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
                      {getResolvedStyle(btnId)?.buttonText || "Iniciar"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </motion.div>
                </motion.div>
              );
            })
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
