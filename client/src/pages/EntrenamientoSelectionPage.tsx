import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Dumbbell, ChevronRight, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BottomNavBar } from "@/components/BottomNavBar";
import { EditorToolbar, type PageStyles, type ElementStyle } from "@/components/EditorToolbar";
import { LanguageButton } from "@/components/LanguageButton";
import { VideoBackground, MediaIcon } from "@/components/VideoBackground";
import menuCurveImg from "@assets/menu_1769957804819.png";

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

  const getElementStyle = useCallback((elementId: string, defaultBg?: string) => {
    const s = styles[elementId];
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
    return result;
  }, [styles]);

  const handleSelect = useCallback((item: EntrenamientoItem) => {
    if (editorMode) return;
    playCardSound();
    sessionStorage.setItem("selectedEntrenamientoItem", JSON.stringify(item));
    setLocation(`/entrenamiento-edad/${item.id}`);
  }, [editorMode, setLocation]);

  if (!stylesLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050a18" }}>
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #050a18 0%, #0a1628 30%, #0d1f3c 100%)" }}>
      <header 
        className="flex md:hidden items-center justify-center px-5 sticky top-0 z-50"
        style={{ paddingTop: 10, paddingBottom: 10, background: "rgba(5,10,24,0.9)", backdropFilter: "blur(10px)" }}
      >
        <button 
          onClick={() => { playButtonSound(); setLocation("/"); }}
          className="absolute left-5 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,217,255,0.1)", border: "1px solid rgba(0,217,255,0.3)" }}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#00d9ff" }} />
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
        <img src={menuCurveImg} alt="" className="w-full h-auto" style={{ filter: "brightness(0.15) saturate(2) hue-rotate(200deg)" }} />
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <div 
          className={`w-full ${getEditableClass("hero-section")}`}
          onClick={(e) => handleElementClick("hero-section", e)}
          style={{
            paddingTop: "16px",
            position: "relative",
            backgroundSize: styles["hero-section"]?.imageSize ? `${styles["hero-section"].imageSize}%` : "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            ...getElementStyle("hero-section", "transparent")
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
                <span style={{ color: styles["hero-title"]?.textColor || "#ffffff" }}>
                  {styles["hero-title"]?.buttonText?.split('\n')[0] || "Activa la"}
                </span>
                <br />
                <span style={{ color: styles["hero-title"]?.textColor || "#ffffff" }}>
                  {styles["hero-title"]?.buttonText?.split('\n')[1] || "Inteligencia"}
                </span>
                <br />
                <span style={{ 
                  background: "linear-gradient(90deg, #00d9ff, #8a3ffc)", 
                  WebkitBackgroundClip: "text", 
                  WebkitTextFillColor: "transparent" 
                }}>
                  {styles["hero-title"]?.buttonText?.split('\n')[2] || "eXponencial"}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`text-sm font-semibold mb-0 ${getEditableClass("hero-subtitle")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle", e); }}
                style={{ color: styles["hero-subtitle"]?.textColor || "rgba(255,255,255,0.8)", ...getElementStyle("hero-subtitle") }}
              >
                {styles["hero-subtitle"]?.buttonText || t("training.heroSubtitle1")}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className={`text-sm font-semibold mb-2 ${getEditableClass("hero-subtitle2")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle2", e); }}
                style={{ color: styles["hero-subtitle2"]?.textColor || "rgba(255,255,255,0.8)", ...getElementStyle("hero-subtitle2") }}
              >
                {styles["hero-subtitle2"]?.buttonText || t("training.heroSubtitle2")}
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`text-xs leading-relaxed ${getEditableClass("hero-desc")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-desc", e); }}
                style={{ color: styles["hero-desc"]?.textColor || "rgba(255,255,255,0.5)", ...getElementStyle("hero-desc") }}
              >
                {styles["hero-desc"]?.buttonText || t("training.heroDesc")}
              </motion.p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 -mt-2 grid grid-cols-2 gap-4 md:max-w-4xl md:mx-auto">
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
              const cardStyle = styles[cardId];
              const hasBackgroundImage = cardStyle?.imageUrl;
              const textDark = cardStyle?.textColor ? true : defaultStyle.textDark;
              const iconUrl = styles[iconId]?.imageUrl || item.imageUrl || defaultIcons[index % defaultIcons.length];
              const iconSize = styles[iconId]?.iconSize || styles[iconId]?.imageSize || 64;
              
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
                    className="relative overflow-hidden rounded-2xl p-4 flex flex-col items-center text-center"
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
                      <div className="chroma-aura" />
                      <div className="chroma-icon relative z-[1]">
                        <MediaIcon src={iconUrl} size={iconSize} />
                      </div>
                    </div>
                    
                    <h3 
                      className={`text-sm font-bold mb-1 leading-tight ${getEditableClass(titleId)}`}
                      onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(titleId, e); }}}
                      style={{ 
                        fontSize: styles[titleId]?.fontSize || 14,
                        color: styles[titleId]?.textColor || "#ffffff"
                      }}
                    >
                      {styles[titleId]?.buttonText || item.title}
                    </h3>
                    {item.description && (
                      <p 
                        className={`text-xs leading-snug mb-3 ${getEditableClass(descId)}`}
                        onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(descId, e); }}}
                        style={{ 
                          fontSize: styles[descId]?.fontSize || 11,
                          color: styles[descId]?.textColor || "rgba(255,255,255,0.55)"
                        }}
                      >
                        {styles[descId]?.buttonText || item.description}
                      </p>
                    )}
                    <motion.button
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${getEditableClass(btnId)}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (editorMode) {
                          handleElementClick(btnId, e);
                        } else {
                          playButtonSound(); 
                          handleSelect(item);
                        }
                      }}
                      style={{
                        background: styles[btnId]?.background || "linear-gradient(135deg, #00b4ff 0%, #0066ff 50%, #8b5cf6 100%)",
                        color: styles[btnId]?.textColor || "white",
                        border: "none",
                        letterSpacing: "0.05em"
                      }}
                      whileTap={{ scale: editorMode ? 1 : 0.95 }}
                    >
                      {styles[btnId]?.buttonText || "START"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </motion.div>
                </motion.div>
              );
            })
          )}
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
        />
      )}
    </div>
  );
}
