import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Dumbbell, Home, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BottomNavBar } from "@/components/BottomNavBar";
import { EditorToolbar, type PageStyles, type ElementStyle } from "@/components/EditorToolbar";
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
  { bg: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)", textDark: true },
  { bg: "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6366f1 100%)", textDark: false },
  { bg: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)", textDark: true },
  { bg: "linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0891b2 100%)", textDark: false },
  { bg: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)", textDark: true },
];

const defaultIcons = [
  "https://cdn-icons-png.flaticon.com/512/3588/3588658.png",
  "https://cdn-icons-png.flaticon.com/512/2103/2103633.png",
  "https://cdn-icons-png.flaticon.com/512/3588/3588614.png",
  "https://cdn-icons-png.flaticon.com/512/2693/2693507.png",
  "https://cdn-icons-png.flaticon.com/512/3176/3176267.png",
];

export default function EntrenamientoSelectionPage() {
  const [, setLocation] = useLocation();
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [stylesLoaded, setStylesLoaded] = useState(false);

  const { data: itemsData, isLoading } = useQuery<{ items: EntrenamientoItem[] }>({
    queryKey: ["/api/entrenamiento", "ninos", "items"],
    queryFn: async () => {
      const res = await fetch(`/api/entrenamiento/ninos/items`);
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
    
    fetch("/api/page-styles/entrenamiento-page")
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
  }, []);

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
          styles: JSON.stringify(newStyles)
        })
      });
    } catch (error) {
      console.error("Error saving styles:", error);
    }
  }, []);

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
    if (s?.background) result.background = s.background;
    else if (s?.imageUrl) result.background = `url(${s.imageUrl}) center/cover no-repeat`;
    else if (defaultBg) result.background = defaultBg;
    return result;
  }, [styles]);

  const handleSelect = useCallback((item: EntrenamientoItem) => {
    if (editorMode) return;
    playCardSound();
    sessionStorage.setItem("selectedEntrenamientoItem", JSON.stringify(item));
    setLocation(`/entrenamiento-edad/${item.id}`);
  }, [editorMode, setLocation]);

  const handleNavHome = useCallback(() => {
    playButtonSound();
    setLocation("/");
  }, [setLocation]);

  if (!stylesLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-center px-5 py-3 bg-white sticky top-0 z-50">
        <button 
          onClick={handleNavHome}
          className="absolute left-5 p-2 text-purple-600"
          data-testid="button-home"
        >
          <Home className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center" data-testid="header-logo">
          <svg width="80" height="36" viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a3ffc" />
                <stop offset="100%" stopColor="#00d9ff" />
              </linearGradient>
            </defs>
            <text x="0" y="28" fontSize="32" fontWeight="900" fontFamily="Inter, sans-serif">
              <tspan fill="#8a3ffc">i</tspan>
              <tspan fill="#8a3ffc">Q</tspan>
              <tspan fill="url(#logoGradient)">x</tspan>
            </text>
          </svg>
        </div>
      </header>

      <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
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
            ...getElementStyle("hero-section", "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)")
          }}
          data-testid="hero-section"
        >
          <div className="relative z-10 px-5 pb-8">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-[26px] md:text-4xl font-black leading-[1.15] mb-4 ${getEditableClass("hero-title")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-title", e); }}
                style={getElementStyle("hero-title")}
              >
                <span style={{ color: styles["hero-title"]?.textColor || "#8a3ffc" }}>
                  {styles["hero-title"]?.buttonText?.split('\n')[0] || "Entrenamiento"}
                </span>
                <br />
                <span style={{ color: styles["hero-title"]?.textColor || "#8a3ffc" }}>
                  {styles["hero-title"]?.buttonText?.split('\n')[1] || "Cognitivo"}
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
                style={{ color: styles["hero-subtitle"]?.textColor || "#1f2937", ...getElementStyle("hero-subtitle") }}
              >
                {styles["hero-subtitle"]?.buttonText || "Ejercicios diseñados para"}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className={`text-sm font-semibold mb-2 ${getEditableClass("hero-subtitle2")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle2", e); }}
                style={{ color: styles["hero-subtitle2"]?.textColor || "#1f2937", ...getElementStyle("hero-subtitle2") }}
              >
                {styles["hero-subtitle2"]?.buttonText || "potenciar tu mente"}
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`text-xs leading-relaxed ${getEditableClass("hero-desc")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-desc", e); }}
                style={{ color: styles["hero-desc"]?.textColor || "#6b7280", ...getElementStyle("hero-desc") }}
              >
                {styles["hero-desc"]?.buttonText || "Selecciona un entrenamiento para comenzar y fortalece tus habilidades cognitivas con ejercicios personalizados."}
              </motion.p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-4 -mt-2">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay entrenamientos disponibles</p>
            </div>
          ) : (
            items.map((item, index) => {
              const cardId = `card-${item.id}`;
              const titleId = `title-${item.id}`;
              const descId = `desc-${item.id}`;
              const iconId = `icon-${item.id}`;
              const btnId = `btn-${item.id}`;
              
              const defaultStyle = defaultCardStyles[index % defaultCardStyles.length];
              const cardStyle = styles[cardId];
              const hasBackgroundImage = cardStyle?.imageUrl;
              const textDark = cardStyle?.textColor ? true : defaultStyle.textDark;
              const iconUrl = styles[iconId]?.imageUrl || item.imageUrl || defaultIcons[index % defaultIcons.length];
              const iconSize = styles[iconId]?.iconSize || 48;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08, duration: 0.3 }}
                  onClick={(e) => editorMode ? handleElementClick(cardId, e) : handleSelect(item)}
                  className={`cursor-pointer ${getEditableClass(cardId)}`}
                  data-testid={`card-entrenamiento-${item.id}`}
                >
                  <motion.div
                    className="relative overflow-hidden rounded-2xl p-4"
                    style={{ 
                      background: hasBackgroundImage 
                        ? `url(${cardStyle.imageUrl}) center/cover no-repeat` 
                        : (cardStyle?.background || defaultStyle.bg),
                      boxShadow: cardStyle?.shadowBlur 
                        ? `0 ${cardStyle.shadowBlur / 2}px ${cardStyle.shadowBlur}px ${cardStyle.shadowColor || "rgba(0,0,0,0.15)"}` 
                        : "0 4px 20px rgba(139, 92, 246, 0.15)",
                      border: textDark ? "1px solid rgba(139, 92, 246, 0.1)" : "none",
                      borderRadius: cardStyle?.borderRadius || 20
                    }}
                    whileTap={{ scale: editorMode ? 1 : 0.98 }}
                    transition={{ duration: 0.1 }}
                  >
                    <div 
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        background: textDark ? "rgba(139, 92, 246, 0.1)" : "rgba(255,255,255,0.2)",
                        color: textDark ? "#7c3aed" : "white"
                      }}
                    >
                      Entrenamiento
                    </div>
                    
                    <div className="pt-6">
                      <h3 
                        className={`text-base font-bold mb-3 uppercase tracking-wide ${getEditableClass(titleId)}`}
                        onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(titleId, e); }}}
                        style={{ 
                          fontSize: styles[titleId]?.fontSize || 15,
                          color: styles[titleId]?.textColor || (textDark ? "#1f2937" : "white")
                        }}
                      >
                        {styles[titleId]?.buttonText || item.title}
                      </h3>
                      
                      <div className="flex items-center gap-3">
                        <div 
                          className={`flex-shrink-0 flex items-center justify-center ${getEditableClass(iconId)}`}
                          onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(iconId, e); }}}
                          style={{ width: iconSize, height: iconSize }}
                        >
                          <img 
                            src={iconUrl} 
                            alt="" 
                            className="drop-shadow-md"
                            style={{ width: iconSize, height: iconSize, objectFit: "contain" }} 
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {item.description && (
                            <p 
                              className={`text-sm leading-snug ${getEditableClass(descId)}`}
                              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(descId, e); }}}
                              style={{ 
                                fontSize: styles[descId]?.fontSize || 13,
                                color: styles[descId]?.textColor || (textDark ? "#6b7280" : "rgba(255,255,255,0.9)")
                              }}
                            >
                              {styles[descId]?.buttonText || item.description}
                            </p>
                          )}
                        </div>
                        
                        <motion.button
                          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 ${getEditableClass(btnId)}`}
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
                            background: styles[btnId]?.background || (textDark ? "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)" : "rgba(255,255,255,0.2)"),
                            color: styles[btnId]?.textColor || "white",
                            border: textDark ? "none" : "1px solid rgba(255,255,255,0.3)"
                          }}
                          whileTap={{ scale: editorMode ? 1 : 0.95 }}
                        >
                          {styles[btnId]?.buttonText || "Iniciar"}
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
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
