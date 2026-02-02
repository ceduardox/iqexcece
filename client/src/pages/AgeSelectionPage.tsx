import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Menu, Home, Dumbbell, BarChart3, MoreHorizontal, Check } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useUserData } from "@/lib/user-context";
import { EditorToolbar, type PageStyles, type ElementStyle } from "@/components/EditorToolbar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const ageCategories = [
  { 
    id: "preescolar", 
    label: "Pre-escolar", 
    ageRange: "3-5", 
    ageGroup: "preescolar",
    description: "Juegos cortos, visuales y guiados.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588294.png",
    iconBg: "linear-gradient(135deg, #FFE082 0%, #FFB300 100%)"
  },
  { 
    id: "ninos", 
    label: "Niños", 
    ageRange: "6-11", 
    ageGroup: "ninos",
    description: "Atención, lectura y lógica básica.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    iconBg: "linear-gradient(135deg, #CE93D8 0%, #9C27B0 100%)"
  },
  { 
    id: "universitarios", 
    label: "Adolescentes", 
    ageRange: "12-17", 
    ageGroup: "universitarios",
    description: "Velocidad, enfoque y memoria.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588658.png",
    iconBg: "linear-gradient(135deg, #B39DDB 0%, #7E57C2 100%)"
  },
  { 
    id: "profesionales", 
    label: "Adultos", 
    ageRange: "18-59", 
    ageGroup: "profesionales",
    description: "Productividad, lectura y claridad mental.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4213/4213958.png",
    iconBg: "linear-gradient(135deg, #90CAF9 0%, #1976D2 100%)"
  },
  { 
    id: "adulto_mayor", 
    label: "Adulto mayor", 
    ageRange: "60+", 
    ageGroup: "adulto_mayor",
    description: "Memoria, agilidad y prevención cognitiva.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588614.png",
    iconBg: "linear-gradient(135deg, #CE93D8 0%, #8E24AA 100%)"
  },
];

interface AgeCardProps {
  category: typeof ageCategories[0];
  index: number;
  isSelected: boolean;
  onClick: () => void;
  editorMode: boolean;
  styles: PageStyles;
  onElementClick: (id: string, e: React.MouseEvent) => void;
  getEditableClass: (id: string) => string;
}

function AgeCard({ category, index, isSelected, onClick, editorMode, styles, onElementClick, getEditableClass }: AgeCardProps) {
  const cardId = `card-${category.id}`;
  const iconId = `icon-${category.id}`;
  const titleId = `title-${category.id}`;
  const descId = `desc-${category.id}`;
  
  const cardStyle = styles[cardId];
  const iconSize = styles[iconId]?.iconSize || 48;
  const hasCardBg = cardStyle?.background || cardStyle?.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.3 }}
      onClick={(e) => editorMode ? onElementClick(cardId, e) : onClick()}
      className={`cursor-pointer ${getEditableClass(cardId)}`}
      data-testid={`card-age-${category.id}`}
    >
      <motion.div
        className={`relative overflow-hidden rounded-2xl p-4 flex flex-col items-center gap-3 border-2 transition-all ${
          isSelected 
            ? "border-purple-500 shadow-lg shadow-purple-100" 
            : "border-gray-100 hover:border-purple-200 hover:shadow-md"
        }`}
        style={{ 
          background: cardStyle?.imageUrl 
            ? `url(${cardStyle.imageUrl}) center/cover no-repeat` 
            : cardStyle?.background || (isSelected ? "rgba(139, 92, 246, 0.05)" : "white"),
          borderRadius: cardStyle?.borderRadius || 16,
          boxShadow: cardStyle?.shadowBlur 
            ? `0 ${cardStyle.shadowBlur / 2}px ${cardStyle.shadowBlur}px ${cardStyle.shadowColor || "rgba(0,0,0,0.1)"}` 
            : isSelected ? undefined : "0 2px 8px rgba(0,0,0,0.04)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <div className="absolute top-3 right-3">
          <div 
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${getEditableClass(`check-${category.id}`)} ${
              isSelected 
                ? "bg-purple-600 border-purple-600" 
                : "border-gray-300 bg-white"
            }`}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(`check-${category.id}`, e); }}}
            style={{
              backgroundColor: isSelected ? (styles[`check-${category.id}`]?.background || "#7c3aed") : "white",
              borderColor: isSelected ? (styles[`check-${category.id}`]?.background || "#7c3aed") : "#d1d5db"
            }}
          >
            {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
          </div>
        </div>

        <div 
          className={`flex-shrink-0 flex items-center justify-center rounded-xl ${getEditableClass(iconId)}`}
          onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(iconId, e); }}}
          style={{ 
            width: iconSize + 12, 
            height: iconSize + 12,
            background: styles[iconId]?.background || category.iconBg,
            padding: 8
          }}
        >
          {styles[iconId]?.imageUrl ? (
            <img 
              src={styles[iconId].imageUrl} 
              alt="" 
              className="drop-shadow-sm"
              style={{ width: iconSize - 8, height: iconSize - 8, objectFit: "contain" }} 
            />
          ) : (
            <img 
              src={category.iconUrl} 
              alt="" 
              className="drop-shadow-sm"
              style={{ width: iconSize - 8, height: iconSize - 8, objectFit: "contain" }} 
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0 text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 
              className={`text-base font-bold ${getEditableClass(titleId)}`}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(titleId, e); }}}
              style={{
                fontSize: styles[titleId]?.fontSize || 16,
                color: styles[titleId]?.textColor || "#1f2937",
                fontWeight: styles[titleId]?.fontWeight || 700
              }}
            >
              {styles[titleId]?.buttonText || category.label}
            </h3>
            <span 
              className="text-sm font-semibold"
              style={{ color: styles[titleId]?.textColor || "#7c3aed" }}
            >
              ({category.ageRange})
            </span>
          </div>
          <p 
            className={`text-sm mt-1 ${getEditableClass(descId)}`}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(descId, e); }}}
            style={{
              fontSize: styles[descId]?.fontSize || 13,
              color: styles[descId]?.textColor || "#6b7280",
              fontWeight: styles[descId]?.fontWeight || 400
            }}
          >
            {styles[descId]?.buttonText || category.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AgeSelectionPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ testId: string }>();
  const testId = params.testId || "lectura";
  const { updateUserData } = useUserData();
  
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof ageCategories[0] | null>(null);

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
      await fetch("/api/page-styles/age-selection", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ styles: JSON.stringify(newStyles) })
      });
    } catch (e) {
      console.error("Error saving styles:", e);
    }
  }, []);

  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    if (!editorMode) return;
    e.stopPropagation();
    setSelectedElement(elementId);
  }, [editorMode]);

  const handleStyleChange = useCallback((elementId: string, newStyle: ElementStyle) => {
    setStyles(prev => {
      const updated = { ...prev, [elementId]: newStyle };
      return updated;
    });
  }, []);

  const handleEditorClose = useCallback(() => {
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
    return {
      backgroundColor: style.background || defaultBg,
      boxShadow: style.shadowBlur ? `0 0 ${style.shadowBlur}px ${style.shadowColor || "rgba(0,0,0,0.3)"}` : undefined,
      borderRadius: style.borderRadius,
    };
  }, [styles]);

  const handleBack = useCallback(() => {
    playButtonSound();
    setLocation("/tests");
  }, [setLocation]);

  const handleCardSelect = useCallback((category: typeof ageCategories[0]) => {
    playCardSound();
    setSelectedCategory(category);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedCategory) return;
    playButtonSound();
    
    updateUserData({ 
      ageGroup: selectedCategory.ageGroup, 
      ageLabel: selectedCategory.label 
    });
    
    if (testId === "lectura") {
      setLocation(`/reading-selection/${selectedCategory.ageGroup}`);
    } else if (testId === "razonamiento") {
      setLocation(`/razonamiento-selection/${selectedCategory.ageGroup}`);
    } else if (testId === "cerebral") {
      setLocation(`/cerebral-selection/${selectedCategory.ageGroup}`);
    } else {
      setLocation(`/quiz/${selectedCategory.ageGroup}/${testId}`);
    }
  }, [selectedCategory, testId, setLocation, updateUserData]);

  const handleNavHome = useCallback(() => {
    playButtonSound();
    setLocation("/");
  }, [setLocation]);

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

      <main className="flex-1 overflow-y-auto pb-32">
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
            className="px-6 pt-4 pb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h1 
              className={`text-2xl font-black mb-2 ${getEditableClass("main-title")}`}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("main-title", e); }}}
              style={{
                fontSize: styles["main-title"]?.fontSize || 26,
                background: styles["main-title"]?.textColor ? styles["main-title"].textColor : "linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              <span className="whitespace-pre-line">{styles["main-title"]?.buttonText || "Selecciona tu edad"}</span>
            </h1>
            <p 
              className={`text-gray-500 text-sm leading-relaxed ${getEditableClass("main-subtitle")}`}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("main-subtitle", e); }}}
              style={{
                fontSize: styles["main-subtitle"]?.fontSize || 14,
                color: styles["main-subtitle"]?.textColor || "#6b7280"
              }}
            >
              <span className="whitespace-pre-line">{styles["main-subtitle"]?.buttonText || "Personaliza tu experiencia de aprendizaje"}</span>
            </p>
          </motion.div>

          <div className="px-4 pb-6 space-y-3">
            {ageCategories.map((category, index) => (
              <AgeCard
                key={category.id}
                category={category}
                index={index}
                isSelected={selectedCategory?.id === category.id}
                onClick={() => handleCardSelect(category)}
                editorMode={editorMode}
                styles={styles}
                onElementClick={handleElementClick}
                getEditableClass={getEditableClass}
              />
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-6 z-40">
        <motion.button
          onClick={(e) => {
            if (editorMode) {
              e.stopPropagation();
              handleElementClick("btn-continue", e);
            } else {
              handleContinue();
            }
          }}
          disabled={!selectedCategory && !editorMode}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${getEditableClass("btn-continue")} ${
            selectedCategory || editorMode
              ? "text-white shadow-lg"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          style={{
            background: styles["btn-continue"]?.background || (selectedCategory || editorMode
              ? "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" 
              : undefined),
            color: styles["btn-continue"]?.textColor || "white",
            fontSize: styles["btn-continue"]?.fontSize || 18,
            marginTop: styles["btn-continue"]?.marginTop || 0,
            marginBottom: styles["btn-continue"]?.marginBottom || 0,
            borderRadius: styles["btn-continue"]?.borderRadius || 16
          }}
          whileTap={selectedCategory ? { scale: 0.98 } : undefined}
          data-testid="button-continue"
        >
          {styles["btn-continue"]?.buttonText || "Continuar"}
        </motion.button>
      </div>

      <nav 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 ${getEditableClass("nav-bar")}`}
        onClick={(e) => { if (editorMode) handleElementClick("nav-bar", e); }}
        style={getElementStyle("nav-bar", "white")}
      >
        <div className="flex items-center justify-around py-2 safe-area-inset-bottom">
          <button 
            onClick={(e) => { if (editorMode) handleElementClick("nav-inicio", e); else handleNavHome(); }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-inicio")}`}
            style={getElementStyle("nav-inicio")}
            data-testid="nav-inicio"
          >
            <Home className="w-5 h-5 text-purple-600" />
            <span className="text-[10px] text-purple-600 font-medium">Inicio</span>
          </button>
          <button 
            onClick={(e) => { if (editorMode) handleElementClick("nav-entrenar", e); }}
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
