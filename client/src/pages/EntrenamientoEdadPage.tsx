import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Menu, ChevronRight } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { EditorToolbar, type PageStyles, type ElementStyle } from "@/components/EditorToolbar";
import { BottomNavBar } from "@/components/BottomNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

interface EntrenamientoItem {
  id: string;
  title: string;
  linkUrl: string | null;
}

const categorias = [
  { 
    id: "preescolar", 
    label: "Pre-escolar", 
    ageRange: "3-5", 
    description: "Juegos cortos, visuales y guiados.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588294.png",
    iconBg: "linear-gradient(135deg, #FFE082 0%, #FFB300 100%)"
  },
  { 
    id: "ninos", 
    label: "Niños", 
    ageRange: "6-11", 
    description: "Atención, lectura y lógica básica.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    iconBg: "linear-gradient(135deg, #CE93D8 0%, #9C27B0 100%)"
  },
  { 
    id: "adolescentes", 
    label: "Adolescentes", 
    ageRange: "12-17", 
    description: "Velocidad, enfoque y memoria.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588658.png",
    iconBg: "linear-gradient(135deg, #B39DDB 0%, #7E57C2 100%)"
  },
  { 
    id: "adultos", 
    label: "Adultos", 
    ageRange: "18-59", 
    description: "Productividad, lectura y claridad mental.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4213/4213958.png",
    iconBg: "linear-gradient(135deg, #90CAF9 0%, #1976D2 100%)"
  },
  { 
    id: "adulto_mayor", 
    label: "Adulto mayor", 
    ageRange: "60+", 
    description: "Memoria, agilidad y prevención cognitiva.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588614.png",
    iconBg: "linear-gradient(135deg, #CE93D8 0%, #8E24AA 100%)"
  },
];

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

export default function EntrenamientoEdadPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ itemId: string }>();
  const itemId = params.itemId;
  
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [stylesLoaded, setStylesLoaded] = useState(false);

  const storedItem = sessionStorage.getItem("selectedEntrenamientoItem");
  const item: EntrenamientoItem | null = storedItem ? JSON.parse(storedItem) : null;

  useEffect(() => {
    const stored = localStorage.getItem("editorMode");
    if (stored === "true") setEditorMode(true);
    
    const timeout = setTimeout(() => setStylesLoaded(true), 2000);
    
    fetch("/api/page-styles/age-selection")
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
    const authToken = localStorage.getItem("adminToken");
    if (!authToken) {
      alert("Debes iniciar sesión como administrador");
      return;
    }
    
    try {
      await fetch("/api/page-styles/entrenamiento-edad", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ styles: JSON.stringify(newStyles) })
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
    setStyles(prev => ({
      ...prev,
      [elementId]: { ...prev[elementId], ...newStyle }
    }));
  }, []);

  const handleEditorClose = useCallback(() => {
    setEditorMode(false);
    localStorage.setItem("editorMode", "false");
    setSelectedElement(null);
  }, []);

  const getEditableClass = (elementId: string): string => {
    if (!editorMode) return "";
    return selectedElement === elementId 
      ? "ring-2 ring-purple-500 ring-offset-2" 
      : "hover:ring-2 hover:ring-purple-300 hover:ring-offset-1 cursor-pointer";
  };

  const getElementStyle = (elementId: string, defaultBg?: string): React.CSSProperties => {
    const s = styles[elementId];
    if (!s) return defaultBg ? { background: defaultBg } : {};
    
    const result: React.CSSProperties = {};
    
    if (s.imageUrl) {
      result.backgroundImage = `url(${s.imageUrl})`;
      result.backgroundSize = "cover";
      result.backgroundPosition = "center";
    } else if (s.background) {
      result.background = s.background;
    } else if (defaultBg) {
      result.background = defaultBg;
    }
    
    return result;
  };

  const handleSelect = (categoriaId: string) => {
    if (editorMode) return;
    playCardSound();
    
    if (item?.linkUrl === "velocidad") {
      setLocation(`/velocidad/${categoriaId}/${itemId}`);
    } else if (item?.linkUrl && item.linkUrl.startsWith("/")) {
      setLocation(item.linkUrl);
    } else {
      setLocation(`/entrenamiento/${categoriaId}/prep/${itemId}`);
    }
  };

  const handleBack = () => {
    setLocation("/entrenamiento");
  };

  if (!stylesLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header 
        className={`flex items-center justify-center px-5 bg-white sticky top-0 z-50 ${getEditableClass("header")}`}
        onClick={(e) => { if (editorMode) handleElementClick("header", e); }}
        style={{
          paddingTop: styles["header"]?.paddingTop || 10,
          paddingBottom: styles["header"]?.paddingBottom || 10,
          ...getElementStyle("header", "white")
        }}
      >
        <button 
          onClick={handleBack}
          className="absolute left-5 p-2 text-purple-600"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div 
          className={`flex items-center justify-center ${getEditableClass("header-logo")}`}
          onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("header-logo", e); }}}
          data-testid="header-logo"
        >
          <img 
            src={styles["header-logo"]?.imageUrl || LOGO_URL} 
            alt="Logo" 
            style={{ 
              height: styles["header-logo"]?.imageSize ? `${styles["header-logo"].imageSize}px` : "36px",
              width: "auto"
            }}
          />
        </div>
        
        <div className="absolute right-5 w-6" />
      </header>

      <div
        className={`w-full sticky z-40 ${getEditableClass("menu-curve")}`}
        onClick={(e) => handleElementClick("menu-curve", e)}
        style={{
          top: (styles["header"]?.paddingTop || 10) + (styles["header"]?.paddingBottom || 10) + 36,
          marginTop: styles["menu-curve"]?.marginTop || -4,
          marginBottom: styles["menu-curve"]?.marginBottom || -20,
        }}
      >
        <img 
          src={menuCurveImg} 
          alt="" 
          className="w-full h-auto"
        />
      </div>

      <main className="flex-1 overflow-y-auto pb-20">
        <div 
          className={`w-full ${getEditableClass("hero-section")}`}
          onClick={(e) => handleElementClick("hero-section", e)}
          style={{
            paddingTop: "16px",
            position: "relative",
            ...getElementStyle("hero-section", "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)")
          }}
        >
          <motion.div
            className="px-5 pt-2 pb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
          >
            <h1 
              className={`font-bold mb-1 ${getEditableClass("main-title")}`}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("main-title", e); }}}
              style={{ 
                fontSize: styles["main-title"]?.fontSize || 22, 
                color: styles["main-title"]?.textColor || "#5b21b6", 
                fontWeight: styles["main-title"]?.fontWeight || 700 
              }}
            >
              <span className="whitespace-pre-line">{styles["main-title"]?.buttonText || "SELECCIONA TU EDAD"}</span>
            </h1>
            <p 
              className={`leading-relaxed ${getEditableClass("main-subtitle")}`}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("main-subtitle", e); }}}
              style={{ 
                fontSize: styles["main-subtitle"]?.fontSize || 13, 
                color: styles["main-subtitle"]?.textColor || "#9ca3af" 
              }}
            >
              <span className="whitespace-pre-line">{styles["main-subtitle"]?.buttonText || "Así ajustamos ejercicios y dificultad."}</span>
            </p>
          </motion.div>

          <div className="px-4 pb-4 space-y-2">
            {categorias.map((cat, index) => {
              const cardId = `card-${cat.id}`;
              const iconId = `icon-${cat.id}`;
              const titleId = `title-${cat.id}`;
              const descId = `desc-${cat.id}`;
              const cardStyle = styles[cardId];
              const iconSize = styles[iconId]?.iconSize || 40;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.05, duration: 0.25 }}
                  onClick={(e) => editorMode ? handleElementClick(cardId, e) : handleSelect(cat.id)}
                  className={`cursor-pointer ${getEditableClass(cardId)}`}
                  data-testid={`card-edad-${cat.id}`}
                >
                  <motion.div
                    className="relative overflow-visible rounded-2xl px-3 py-2.5 flex items-center gap-3 transition-all bg-white hover:shadow-md"
                    style={{ 
                      background: cardStyle?.imageUrl 
                        ? `url(${cardStyle.imageUrl}) center/cover no-repeat` 
                        : cardStyle?.background || "white",
                      borderRadius: cardStyle?.borderRadius || 16,
                      boxShadow: cardStyle?.shadowBlur 
                        ? `0 ${cardStyle.shadowBlur / 2}px ${cardStyle.shadowBlur}px ${cardStyle.shadowColor || "rgba(0,0,0,0.08)"}` 
                        : "0 1px 4px rgba(0,0,0,0.06)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                  >
                    <div 
                      className={`flex-shrink-0 flex items-center justify-center rounded-xl ${getEditableClass(iconId)}`}
                      onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(iconId, e); }}}
                      style={{ 
                        width: iconSize + 8, 
                        height: iconSize + 8,
                        background: styles[iconId]?.background || cat.iconBg,
                        padding: 6
                      }}
                    >
                      <img 
                        src={styles[iconId]?.imageUrl || cat.iconUrl} 
                        alt="" 
                        className="drop-shadow-sm"
                        style={{ width: iconSize - 6, height: iconSize - 6, objectFit: "contain" }} 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 
                        className={`font-semibold leading-tight ${getEditableClass(titleId)}`}
                        onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(titleId, e); }}}
                        style={{
                          fontSize: styles[titleId]?.fontSize || 14,
                          color: styles[titleId]?.textColor || "#1f2937"
                        }}
                      >
                        {styles[titleId]?.buttonText || cat.label} <span style={{ color: "#7c3aed", fontWeight: 600 }}>({cat.ageRange})</span>
                      </h3>
                      <p 
                        className={`leading-tight mt-0.5 ${getEditableClass(descId)}`}
                        onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(descId, e); }}}
                        style={{
                          fontSize: styles[descId]?.fontSize || 12,
                          color: styles[descId]?.textColor || "#9ca3af"
                        }}
                      >
                        {styles[descId]?.buttonText || cat.description}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  </motion.div>
                </motion.div>
              );
            })}
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
        />
      )}
    </div>
  );
}
