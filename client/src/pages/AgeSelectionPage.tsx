import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Baby, GraduationCap, Users, Briefcase, Home, Menu, Dumbbell, BarChart3, MoreHorizontal } from "lucide-react";
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

const ageIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  preescolar: Baby,
  ninos: Users,
  adolescentes: GraduationCap,
  adultos: Briefcase,
};

const ageGradients: Record<string, string> = {
  preescolar: "linear-gradient(135deg, #FFB347 0%, #FF9A56 50%, #FF7043 100%)",
  ninos: "linear-gradient(135deg, #7C4DFF 0%, #651FFF 50%, #6200EA 100%)",
  adolescentes: "linear-gradient(135deg, #00BCD4 0%, #00ACC1 50%, #0097A7 100%)",
  adultos: "linear-gradient(135deg, #EC407A 0%, #D81B60 50%, #AD1457 100%)",
};

const ageCategories = [
  { id: "preescolar", label: "Pre-escolar", ageRange: "3-5 años", ageGroup: "preescolar" },
  { id: "ninos", label: "Niños", ageRange: "6-12 años", ageGroup: "ninos" },
  { id: "adolescentes", label: "Adolescentes", ageRange: "13-17 años", ageGroup: "adolescentes" },
  { id: "adultos", label: "Adultos", ageRange: "18+ años", ageGroup: "adultos" },
];

interface AgeCardProps {
  category: typeof ageCategories[0];
  index: number;
  onClick: () => void;
  editorMode: boolean;
  styles: PageStyles;
  onElementClick: (id: string, e: React.MouseEvent) => void;
  getEditableClass: (id: string) => string;
}

function AgeCard({ category, index, onClick, editorMode, styles, onElementClick, getEditableClass }: AgeCardProps) {
  const Icon = ageIcons[category.id] || Users;
  const gradient = ageGradients[category.id];
  const cardId = `card-${category.id}`;
  const iconId = `icon-${category.id}`;
  const titleId = `title-${category.id}`;
  const descId = `desc-${category.id}`;
  
  const cardStyle = styles[cardId];
  const hasBackgroundImage = cardStyle?.imageUrl;
  const iconSize = styles[iconId]?.iconSize || 28;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
      onClick={(e) => editorMode ? onElementClick(cardId, e) : onClick()}
      className={`cursor-pointer ${getEditableClass(cardId)}`}
      data-testid={`card-age-${category.id}`}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4"
        style={{ 
          background: hasBackgroundImage ? `url(${cardStyle.imageUrl}) center/cover no-repeat` : (cardStyle?.background || gradient),
          borderRadius: cardStyle?.borderRadius || 16,
          boxShadow: cardStyle?.shadowBlur ? `0 ${cardStyle.shadowBlur / 2}px ${cardStyle.shadowBlur}px ${cardStyle.shadowColor || "rgba(0,0,0,0.3)"}` : "0 4px 15px rgba(0,0,0,0.15)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <div 
          className={`flex-shrink-0 flex items-center justify-center ${getEditableClass(iconId)}`}
          onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(iconId, e); }}}
          style={{ width: iconSize + 28, height: iconSize + 28 }}
        >
          {styles[iconId]?.imageUrl ? (
            <img 
              src={styles[iconId].imageUrl} 
              alt="" 
              className="drop-shadow-lg"
              style={{ width: iconSize, height: iconSize, objectFit: "contain" }} 
            />
          ) : (
            <div className="bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm" style={{ width: iconSize + 14, height: iconSize + 14 }}>
              <Icon className="text-white" style={{ width: iconSize, height: iconSize }} />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-white">
          <h3 
            className={`text-xl font-bold mb-0.5 ${getEditableClass(titleId)}`}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(titleId, e); }}}
            style={{
              fontSize: styles[titleId]?.fontSize || 20,
              color: styles[titleId]?.textColor || "white"
            }}
          >
            {styles[titleId]?.buttonText || category.label}
          </h3>
          <p 
            className={`text-sm opacity-90 ${getEditableClass(descId)}`}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(descId, e); }}}
            style={{
              fontSize: styles[descId]?.fontSize || 14,
              color: styles[descId]?.textColor || "rgba(255,255,255,0.9)"
            }}
          >
            {styles[descId]?.buttonText || category.ageRange}
          </p>
        </div>
        
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
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
  
  const [editorMode, setEditorMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("editorMode");
    if (stored === "true") setEditorMode(true);
    
    fetch("/api/page-styles/age-selection")
      .then(res => res.json())
      .then(data => {
        if (data.styles) {
          const parsed = typeof data.styles === 'string' ? JSON.parse(data.styles) : data.styles;
          setStyles(parsed);
        }
      })
      .catch(() => {});
  }, []);

  const saveStyles = useCallback(async (newStyles: PageStyles) => {
    console.log("saveStyles llamado", newStyles);
    const authToken = localStorage.getItem("adminToken");
    console.log("Token:", authToken ? "existe" : "NO existe");
    if (!authToken) {
      alert("No hay sesión de admin. Inicia sesión en /gestion primero.");
      return;
    }
    
    try {
      const res = await fetch("/api/admin/page-styles", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ pageName: "age-selection", styles: JSON.stringify(newStyles) }),
      });
      
      if (res.ok) {
        console.log("Estilos guardados correctamente");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error al guardar: ${errData.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Error saving styles:", err);
      alert("Error de conexión al guardar");
    }
  }, []);

  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  }, []);

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
    if (!style) return defaultBg ? { background: defaultBg } : {};
    return {
      background: style.background || defaultBg,
      boxShadow: style.shadowBlur ? `0 0 ${style.shadowBlur}px ${style.shadowColor || "rgba(0,0,0,0.3)"}` : undefined,
      borderRadius: style.borderRadius,
    };
  }, [styles]);

  const handleBack = useCallback(() => {
    playButtonSound();
    setLocation("/tests");
  }, [setLocation]);

  const handleAgeSelect = useCallback((category: typeof ageCategories[0]) => {
    playCardSound();
    updateUserData({ 
      ageGroup: category.ageGroup, 
      ageLabel: category.label 
    });
    
    if (testId === "lectura") {
      if (category.ageGroup === "preescolar" || category.ageGroup === "ninos") {
        setLocation("/child-category");
      } else if (category.ageGroup === "adolescentes") {
        setLocation("/adolescente");
      } else if (category.ageGroup === "adultos") {
        setLocation("/reading-selection/universitarios");
      } else {
        setLocation(`/reading-selection/${category.ageGroup}`);
      }
    } else if (testId === "razonamiento") {
      const razonamientoCategory = category.ageGroup === "adultos" ? "universitarios" : category.ageGroup;
      setLocation(`/razonamiento-selection/${razonamientoCategory}`);
    } else if (testId === "cerebral") {
      setLocation("/cerebral/seleccion");
    }
  }, [testId, updateUserData, setLocation]);

  const handleNavHome = useCallback(() => {
    playButtonSound();
    setLocation("/");
  }, [setLocation]);

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

      <main className="flex-1 overflow-y-auto pb-24">
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
            <p 
              className={`text-sm font-medium tracking-widest mb-2 ${getEditableClass("top-label")}`}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("top-label", e); }}}
              style={{
                fontSize: styles["top-label"]?.fontSize || 12,
                color: styles["top-label"]?.textColor || "#9ca3af",
                letterSpacing: "0.15em"
              }}
            >
              <span className="whitespace-pre-line">{styles["top-label"]?.buttonText || "SELECCIÓN"}</span>
            </p>
            <h1 
              className={`text-3xl font-black mb-3 ${getEditableClass("main-title")}`}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("main-title", e); }}}
              style={{
                fontSize: styles["main-title"]?.fontSize || 32,
                background: styles["main-title"]?.textColor ? styles["main-title"].textColor : "linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              <span className="whitespace-pre-line">{styles["main-title"]?.buttonText || "Selecciona tu edad"}</span>
            </h1>
            <p 
              className={`text-gray-500 text-base leading-relaxed ${getEditableClass("main-subtitle")}`}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("main-subtitle", e); }}}
              style={{
                fontSize: styles["main-subtitle"]?.fontSize || 15,
                color: styles["main-subtitle"]?.textColor || "#6b7280"
              }}
            >
              <span className="whitespace-pre-line">{styles["main-subtitle"]?.buttonText || "Elige tu grupo de edad para personalizar la experiencia"}</span>
            </p>
          </motion.div>

          <div className="px-4 pb-8 space-y-3">
            {ageCategories.map((category, index) => (
              <AgeCard
                key={category.id}
                category={category}
                index={index}
                onClick={() => handleAgeSelect(category)}
                editorMode={editorMode}
                styles={styles}
                onElementClick={handleElementClick}
                getEditableClass={getEditableClass}
              />
            ))}
          </div>
        </div>
      </main>

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
