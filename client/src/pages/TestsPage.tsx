import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, HelpCircle, Menu, Home, Dumbbell, BarChart3, MoreHorizontal, Stethoscope } from "lucide-react";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";
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

const testIcons = {
  lectura: BookOpen,
  razonamiento: Brain,
  cerebral: HelpCircle,
};

const testGradients = {
  lectura: "linear-gradient(135deg, #4DD0E1 0%, #26C6DA 50%, #00ACC1 100%)",
  razonamiento: "linear-gradient(135deg, #F48FB1 0%, #CE93D8 50%, #7E57C2 100%)",
  cerebral: "linear-gradient(135deg, #E1BEE7 0%, #CE93D8 50%, #BA68C8 100%)",
};

interface TestCardProps {
  testId: string;
  title: string;
  description: string;
  index: number;
  onClick: () => void;
  editorMode: boolean;
  styles: PageStyles;
  onElementClick: (elementId: string, e: React.MouseEvent) => void;
  getEditableClass: (elementId: string) => string;
}

function TestCard({ 
  testId,
  title,
  description,
  index, 
  onClick,
  editorMode,
  styles,
  onElementClick,
  getEditableClass
}: TestCardProps) {
  const Icon = testIcons[testId as keyof typeof testIcons] || Brain;
  const gradient = testGradients[testId as keyof typeof testGradients] || testGradients.razonamiento;
  const cardId = `card-${testId}`;
  const labelId = `label-${testId}`;
  const titleId = `title-${testId}`;
  const descId = `desc-${testId}`;
  const iconId = `icon-${testId}`;
  
  const cardStyle = styles[cardId];
  const hasBackgroundImage = cardStyle?.imageUrl;
  const iconSize = styles[iconId]?.iconSize || 50;
  const cardHeight = cardStyle?.cardHeight || 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
      onClick={(e) => editorMode ? onElementClick(cardId, e) : onClick()}
      className={`cursor-pointer ${getEditableClass(cardId)}`}
      data-testid={`card-test-${testId}`}
    >
      <motion.div
        className="relative overflow-hidden rounded-3xl p-4 flex items-center gap-4"
        style={{ 
          background: hasBackgroundImage ? `url(${cardStyle.imageUrl}) center/cover no-repeat` : (cardStyle?.background || gradient),
          borderRadius: cardStyle?.borderRadius || 24,
          boxShadow: cardStyle?.shadowBlur ? `0 ${cardStyle.shadowBlur / 2}px ${cardStyle.shadowBlur}px ${cardStyle.shadowColor || "rgba(0,0,0,0.3)"}` : "0 4px 15px rgba(0,0,0,0.15)",
          minHeight: cardHeight
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <div 
          className={`flex-shrink-0 flex items-center justify-center ${getEditableClass(iconId)}`}
          onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(iconId, e); }}}
          style={{ width: iconSize + 20, height: iconSize + 20 }}
        >
          {styles[iconId]?.imageUrl ? (
            <img 
              src={styles[iconId].imageUrl} 
              alt="" 
              className="drop-shadow-lg"
              style={{ width: iconSize, height: iconSize, objectFit: "contain" }} 
            />
          ) : (
            <Icon 
              className="text-white drop-shadow-lg" 
              style={{ width: iconSize, height: iconSize }} 
            />
          )}
        </div>
        
        <div className="flex-1 text-white py-2">
          <p 
            className={`text-sm font-medium opacity-90 mb-0.5 ${getEditableClass(labelId)}`}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(labelId, e); }}}
            style={{ 
              fontSize: styles[labelId]?.fontSize || 14,
              color: styles[labelId]?.textColor || "white"
            }}
          >
            {styles[labelId]?.buttonText || "Test"}
          </p>
          <h3 
            className={`text-2xl font-black mb-1 ${getEditableClass(titleId)}`}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(titleId, e); }}}
            style={{ 
              fontSize: styles[titleId]?.fontSize || 24,
              color: styles[titleId]?.textColor || "white"
            }}
          >
            {styles[titleId]?.buttonText || title}
          </h3>
          <p 
            className={`text-sm opacity-90 leading-snug ${getEditableClass(descId)}`}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(descId, e); }}}
            style={{ 
              fontSize: styles[descId]?.fontSize || 14,
              color: styles[descId]?.textColor || "white"
            }}
          >
            {styles[descId]?.buttonText || description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TestsPage() {
  const [, setLocation] = useLocation();
  const { updateUserData } = useUserData();
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [stylesLoaded, setStylesLoaded] = useState(false);

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
    
    fetch("/api/page-styles/tests-page")
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
          pageName: "tests-page",
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

  const getElementStyle = useCallback((elementId: string, defaultBg?: string): React.CSSProperties => {
    const style = styles[elementId];
    if (!style) return defaultBg ? { backgroundColor: defaultBg } : {};
    
    const result: React.CSSProperties = {};
    
    if (style.backgroundType === "image" && style.imageUrl) {
      result.backgroundImage = `url(${style.imageUrl})`;
      result.backgroundSize = style.imageSize ? `${style.imageSize}%` : "cover";
      result.backgroundPosition = "center";
      result.backgroundRepeat = "no-repeat";
      result.backgroundColor = "transparent";
    } else if (style.background) {
      result.backgroundColor = style.background;
    } else if (defaultBg) {
      result.backgroundColor = defaultBg;
    }
    
    if (style.boxShadow) result.boxShadow = style.boxShadow;
    if (style.marginTop) result.marginTop = style.marginTop;
    if (style.marginBottom) result.marginBottom = style.marginBottom;
    if (style.marginLeft) result.marginLeft = style.marginLeft;
    if (style.marginRight) result.marginRight = style.marginRight;
    if (style.textColor) result.color = style.textColor;
    if (style.fontSize) result.fontSize = style.fontSize;
    if (style.textAlign) result.textAlign = style.textAlign;
    if (style.fontWeight) result.fontWeight = style.fontWeight;
    if (style.borderRadius) result.borderRadius = style.borderRadius;
    
    return result;
  }, [styles]);

  const handleTestClick = useCallback((testId: string) => {
    playCardSound();
    updateUserData({ selectedTest: testId });
    setLocation(`/age-selection/${testId}`);
  }, [updateUserData, setLocation]);

  const handleNavHome = useCallback(() => {
    playButtonSound();
    setLocation("/");
  }, [setLocation]);

  const genericTestCategories = [
    { id: "lectura", title: "Lectura", description: "Evalúa tu velocidad y comprensión lectora" },
    { id: "razonamiento", title: "Razonamiento", description: "Pon a prueba tu lógica y pensamiento analítico" },
    { id: "cerebral", title: "Test Cerebral", description: "Ejercicios para evaluar tus capacidades cognitivas" },
  ];

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
          onClick={handleNavHome}
          className="absolute left-5 p-2 text-purple-600"
          data-testid="button-back"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div 
          className={`flex items-center justify-center ${getEditableClass("header-logo")}`}
          onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("header-logo", e); }}}
          data-testid="header-logo"
        >
          {styles["header-logo"]?.imageUrl ? (
            <img 
              src={styles["header-logo"].imageUrl} 
              alt="Logo" 
              style={{ 
                height: styles["header-logo"]?.imageSize ? `${styles["header-logo"].imageSize}px` : "36px",
                width: "auto"
              }}
            />
          ) : (
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
          )}
        </div>
        
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute right-5 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="button-menu"
        >
          <Menu className="w-6 h-6" strokeWidth={1.5} />
        </button>
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
                  {styles["hero-title"]?.buttonText?.split('\n')[0] || "Diagnóstico"}
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
                {styles["hero-subtitle"]?.buttonText || "Un método científico de"}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className={`text-sm font-semibold mb-2 ${getEditableClass("hero-subtitle2")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle2", e); }}
                style={{ color: styles["hero-subtitle2"]?.textColor || "#1f2937", ...getElementStyle("hero-subtitle2") }}
              >
                {styles["hero-subtitle2"]?.buttonText || "evaluación cognitiva"}
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`text-xs leading-relaxed ${getEditableClass("hero-desc")}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick("hero-desc", e); }}
                style={{ color: styles["hero-desc"]?.textColor || "#6b7280", ...getElementStyle("hero-desc") }}
              >
                {styles["hero-desc"]?.buttonText || "Selecciona un test para comenzar tu diagnóstico y descubre cómo potenciar tu mente con ejercicios personalizados."}
              </motion.p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-4 -mt-2">
          {genericTestCategories.map((category, index) => (
            <TestCard
              key={category.id}
              testId={category.id}
              title={category.title}
              description={category.description}
              index={index}
              onClick={() => handleTestClick(category.id)}
              editorMode={editorMode}
              styles={styles}
              onElementClick={handleElementClick}
              getEditableClass={getEditableClass}
            />
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button 
            onClick={(e) => { if (editorMode) handleElementClick("nav-inicio", e); else handleNavHome(); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-inicio")}`}
            style={getElementStyle("nav-inicio")}
            data-testid="nav-inicio"
          >
            <Home className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] text-gray-400">Inicio</span>
          </button>
          <button 
            onClick={(e) => { if (editorMode) handleElementClick("nav-diagnostico", e); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-diagnostico")}`}
            style={getElementStyle("nav-diagnostico")}
            data-testid="nav-diagnostico"
          >
            <Stethoscope className="w-5 h-5 text-purple-600" />
            <span className="text-[10px] text-purple-600 font-medium">Diagnóstico</span>
          </button>
          <button 
            onClick={(e) => { if (editorMode) handleElementClick("nav-entrenar", e); else setLocation("/entrenamiento/ninos"); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-entrenar")}`}
            style={getElementStyle("nav-entrenar")}
            data-testid="nav-entrenar"
          >
            <Dumbbell className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] text-gray-400">Entrenar</span>
          </button>
          <button 
            onClick={(e) => { if (editorMode) handleElementClick("nav-progreso", e); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-progreso")}`}
            style={getElementStyle("nav-progreso")}
            data-testid="nav-progreso"
          >
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] text-gray-400">Progreso</span>
          </button>
          <button 
            onClick={(e) => { if (editorMode) handleElementClick("nav-mas", e); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-mas")}`}
            style={getElementStyle("nav-mas")}
            data-testid="nav-mas"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] text-gray-400">Más</span>
          </button>
        </div>
      </nav>

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
