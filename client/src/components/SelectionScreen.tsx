import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Home, Brain, Dumbbell, TrendingUp, MoreHorizontal, MessageCircle, Mail, ChevronRight, Play, Newspaper, BookOpen, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { languages } from "@/lib/i18n";
import { FlagIcon } from "./FlagIcon";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { EditorToolbar, type PageStyles, type ElementStyle } from "./EditorToolbar";
import { useToast } from "@/hooks/use-toast";
import { useSounds } from "@/hooks/use-sounds";

import avatar1Img from "@/assets/ui/avatars/avatar-1.png";
import trainingImg from "@/assets/ui/icons/training.png";
import menuCurveImg from "@assets/menu_1769957804819.png";

interface SelectionScreenProps {
  onComplete: (selection: { ageGroup: string; ageLabel: string; problems: string[]; problemTitles: string[] }) => void;
}

export function SelectionScreen({ onComplete }: SelectionScreenProps) {
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { userData, setUserData } = useUserData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navMoreOpen, setNavMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { playClick, playCard } = useSounds();
  
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  
  useEffect(() => {
    const checkEditorMode = () => {
      setEditorMode(localStorage.getItem("editorMode") === "true");
    };
    window.addEventListener("storage", checkEditorMode);
    const interval = setInterval(checkEditorMode, 1000);
    return () => {
      window.removeEventListener("storage", checkEditorMode);
      clearInterval(interval);
    };
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setAdminToken(token);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  
  useEffect(() => {
    const timeout = setTimeout(() => setStylesLoaded(true), 2000);
    
    fetch("/api/page-styles/selection-screen")
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
  
  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    if (!editorMode) return;
    e.stopPropagation();
    setSelectedElement(elementId);
  };
  
  const handleStyleChange = (elementId: string, style: ElementStyle) => {
    setStyles(prev => ({ ...prev, [elementId]: style }));
  };
  
  const handleSaveStyles = async () => {
    if (!adminToken) {
      toast({ title: "Error", description: "Debes iniciar sesión en el panel admin", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch("/api/admin/page-styles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          pageName: "selection-screen",
          styles: JSON.stringify(styles)
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to save");
      }
      
      toast({ title: "Guardado", description: "Los estilos se guardaron correctamente" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    }
  };
  
  const handleCloseEditor = () => {
    setEditorMode(false);
    localStorage.setItem("editorMode", "false");
  };
  
  const getElementStyle = (elementId: string, defaultBg?: string): React.CSSProperties => {
    const style = styles[elementId];
    const result: React.CSSProperties = {};
    
    if (style?.backgroundType === "image" && style?.imageUrl) {
      result.backgroundImage = `url(${style.imageUrl})`;
      result.backgroundSize = style.imageSize ? `${style.imageSize}%` : "cover";
      result.backgroundPosition = "center";
      result.backgroundRepeat = "no-repeat";
      result.backgroundColor = "transparent";
    } else if (style?.background) {
      result.backgroundColor = style.background;
    } else if (defaultBg) {
      result.backgroundColor = defaultBg;
    }
    
    if (style?.boxShadow) result.boxShadow = style.boxShadow;
    if (style?.marginTop) result.marginTop = style.marginTop;
    if (style?.marginBottom) result.marginBottom = style.marginBottom;
    if (style?.marginLeft) result.marginLeft = style.marginLeft;
    if (style?.marginRight) result.marginRight = style.marginRight;
    if (style?.textColor) result.color = style.textColor;
    if (style?.fontSize) result.fontSize = style.fontSize;
    if (style?.textAlign) result.textAlign = style.textAlign;
    if (style?.fontWeight) result.fontWeight = style.fontWeight;
    if (style?.borderRadius) result.borderRadius = style.borderRadius;
    
    return result;
  };
  
  const getEditableClass = (elementId: string) => {
    if (!editorMode) return "";
    const base = "cursor-pointer transition-all duration-200";
    return selectedElement === elementId 
      ? `${base} ring-2 ring-cyan-400 ring-offset-2` 
      : `${base} hover:ring-2 hover:ring-purple-400 hover:ring-offset-1`;
  };

  const handleOptionSelect = useCallback((option: "tests" | "training") => {
    playCard();
    setUserData({
      ageGroup: "ninos",
      ageLabel: "Usuario",
      selectedProblems: []
    });
    if (option === "tests") {
      setLocation("/tests");
    } else {
      setLocation("/entrenamiento");
    }
  }, [setUserData, setLocation, playCard]);

  const handleWhatsApp = () => {
    window.open("https://wa.me/59178767696", "_blank");
  };

  const handleEmail = () => {
    window.location.href = "mailto:soporte@inteligenciaexponencial.com";
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
      {isMobile && (
        <header 
          className={`flex items-center justify-center px-5 bg-white sticky top-0 z-50 ${getEditableClass("header")}`}
          onClick={(e) => { if (editorMode) handleElementClick("header", e); }}
          style={{
            paddingTop: styles["header"]?.paddingTop || 10,
            paddingBottom: styles["header"]?.paddingBottom || 10,
            ...getElementStyle("header", "white")
          }}
        >
          <div className="absolute left-5 w-10" />
          
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
          
          <div className="absolute right-5" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              data-testid="button-lang"
            >
              <Globe className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl overflow-hidden z-[100]"
                  style={{ boxShadow: "0 12px 40px rgba(124,58,237,0.15), 0 4px 12px rgba(0,0,0,0.08)" }}
                  initial={{ opacity: 0, y: -8, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.92 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  data-testid="dropdown-lang"
                >
                  <div className="px-4 py-2 border-b border-purple-50" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.04), rgba(6,182,212,0.03))" }}>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("nav.idioma")}</span>
                  </div>
                  <div className="py-1">
                    {languages.map((lang) => {
                      const isActive = i18n.language === lang.code || i18n.language.startsWith(lang.code);
                      return (
                        <motion.button
                          key={lang.code}
                          onClick={() => { if (lang.disabled) return; playClick(); i18n.changeLanguage(lang.code); setMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 active:bg-gray-50 transition-colors ${isActive ? "bg-purple-50/50" : ""} ${lang.disabled ? "opacity-40" : ""}`}
                          whileTap={lang.disabled ? {} : { scale: 0.98 }}
                          data-testid={`lang-${lang.code}`}
                        >
                          <FlagIcon code={lang.code} size={22} />
                          <span className={`text-sm flex-1 text-left ${isActive ? "font-bold text-purple-600" : "font-medium text-gray-600"}`}>{lang.label}</span>
                          {isActive && <Check className="w-4 h-4 text-purple-500" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>
      )}

      {isMobile && (
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
      )}

      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        {isMobile && (
          <div 
            className="relative w-full"
          >
            <div 
              className={`w-full ${getEditableClass("hero-section")}`}
              onClick={(e) => handleElementClick("hero-section", e)}
              style={{
                paddingTop: "16px",
                position: "relative",
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
                    <span style={{ color: styles["hero-title"]?.textColor || "#8a3ffc" }}>Activa la</span>
                    <br />
                    <span style={{ color: styles["hero-title"]?.textColor || "#8a3ffc" }}>Inteligencia</span>
                    <br />
                    <span style={{ 
                      background: "linear-gradient(90deg, #00d9ff, #8a3ffc)", 
                      WebkitBackgroundClip: "text", 
                      WebkitTextFillColor: "transparent" 
                    }}>eXponencial</span>
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`text-sm font-semibold mb-0 ${getEditableClass("hero-subtitle")}`}
                    onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle", e); }}
                    style={{ color: styles["hero-subtitle"]?.textColor || "#1f2937", ...getElementStyle("hero-subtitle") }}
                  >
                    Un método científico de
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className={`text-sm font-semibold mb-2 ${getEditableClass("hero-subtitle2")}`}
                    onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle2", e); }}
                    style={{ color: styles["hero-subtitle2"]?.textColor || "#1f2937", ...getElementStyle("hero-subtitle2") }}
                  >
                    entrenamiento cognitivo
                  </motion.p>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={`text-xs leading-relaxed ${getEditableClass("hero-desc")}`}
                    onClick={(e) => { e.stopPropagation(); handleElementClick("hero-desc", e); }}
                    style={{ color: styles["hero-desc"]?.textColor || "#6b7280", ...getElementStyle("hero-desc") }}
                  >
                    basado en neuroplasticidad y activación de <span className="font-semibold" style={{ color: styles["hero-desc"]?.textColor || "#374151" }}>ondas gamma</span>, diseñado para optimizar la forma en que el cerebro aprende y procesa información en todas las etapas de la vida.
                  </motion.p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isMobile && (
          <div 
            className={`relative w-full ${getEditableClass("hero-section")}`}
            onClick={(e) => handleElementClick("hero-section", e)}
            style={{ 
              minHeight: "320px",
              ...getElementStyle("hero-section", "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)")
            }}
            data-testid="hero-section-desktop"
          >
            <div className="relative z-10 px-5 pt-10 pb-10">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-4xl font-black leading-[1.15] mb-4 ${getEditableClass("hero-title")}`}
                  onClick={(e) => { e.stopPropagation(); handleElementClick("hero-title", e); }}
                  style={getElementStyle("hero-title")}
                >
                  <span style={{ color: styles["hero-title"]?.textColor || "#8a3ffc" }}>Activa la</span>
                  <br />
                  <span style={{ color: styles["hero-title"]?.textColor || "#8a3ffc" }}>Inteligencia</span>
                  <br />
                  <span style={{ 
                    background: "linear-gradient(90deg, #00d9ff, #8a3ffc)", 
                    WebkitBackgroundClip: "text", 
                    WebkitTextFillColor: "transparent" 
                  }}>eXponencial</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`text-sm font-semibold mb-0 ${getEditableClass("hero-subtitle")}`}
                  onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle", e); }}
                  style={{ color: styles["hero-subtitle"]?.textColor || "#1f2937", ...getElementStyle("hero-subtitle") }}
                >
                  Un método científico de
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className={`text-sm font-semibold mb-2 ${getEditableClass("hero-subtitle2")}`}
                  onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle2", e); }}
                  style={{ color: styles["hero-subtitle2"]?.textColor || "#1f2937", ...getElementStyle("hero-subtitle2") }}
                >
                  entrenamiento cognitivo
                </motion.p>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`text-xs leading-relaxed ${getEditableClass("hero-desc")}`}
                  onClick={(e) => { e.stopPropagation(); handleElementClick("hero-desc", e); }}
                  style={{ color: styles["hero-desc"]?.textColor || "#6b7280", ...getElementStyle("hero-desc") }}
                >
                  basado en neuroplasticidad y activación de <span className="font-semibold" style={{ color: styles["hero-desc"]?.textColor || "#374151" }}>ondas gamma</span>, diseñado para optimizar la forma en que el cerebro aprende y procesa información en todas las etapas de la vida.
                </motion.p>
              </div>
            </div>
          </div>
        )}

        <div className="px-5 pb-6 space-y-4 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 
              className={`text-base font-bold mb-3 ${getEditableClass("section-diagnostico")}`}
              onClick={(e) => { if (editorMode) handleElementClick("section-diagnostico", e); }}
              style={{ color: styles["section-diagnostico"]?.textColor || "#1f2937", ...getElementStyle("section-diagnostico") }}
            >
              Diagnóstico inicial
            </h2>
            
            <div 
              onClick={(e) => editorMode ? handleElementClick("card-tests", e) : handleOptionSelect("tests")}
              className={`relative rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-purple-100 ${getEditableClass("card-tests")}`}
              style={getElementStyle("card-tests", "linear-gradient(135deg, rgba(138, 63, 252, 0.06) 0%, rgba(0, 217, 255, 0.04) 100%)")}
              data-testid="button-option-tests"
            >
              <div className="p-4 flex items-start gap-3">
                <div 
                  className={`w-12 h-12 flex-shrink-0 flex items-center justify-center ${getEditableClass("icon-tests")}`}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("icon-tests", e); }}}
                  style={getElementStyle("icon-tests")}
                >
                  <img 
                    src={styles["icon-tests"]?.imageUrl || avatar1Img} 
                    alt="" 
                    className="w-10 h-10 object-contain" 
                    style={{ width: styles["icon-tests"]?.imageSize ? `${styles["icon-tests"].imageSize}%` : undefined }}
                  />
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 
                    className={`text-sm font-bold mb-0.5 ${getEditableClass("title-tests")}`}
                    onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("title-tests", e); }}}
                    style={{ color: styles["title-tests"]?.textColor || "#8a3ffc", ...getElementStyle("title-tests") }}
                  >
                    Diagnóstico Cognitivo
                  </h3>
                  <p 
                    className={`text-xs leading-snug ${getEditableClass("desc-tests")}`}
                    onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("desc-tests", e); }}}
                    style={{ color: styles["desc-tests"]?.textColor || "#4b5563", ...getElementStyle("desc-tests") }}
                  >
                    Conoce tu punto de partida y cómo funciona tu mente.
                  </p>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("btn-diagnostico", e); } else { handleOptionSelect("tests"); }}}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white font-bold shadow-md ${getEditableClass("btn-diagnostico")}`}
                  style={{ 
                    fontSize: styles["btn-diagnostico"]?.fontSize || 12,
                    ...getElementStyle("btn-diagnostico", "linear-gradient(90deg, #8a3ffc, #6b21a8)")
                  }}
                  data-testid="button-iniciar-diagnostico"
                >
                  <span 
                    className={getEditableClass("icon-btn-diagnostico")}
                    onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("icon-btn-diagnostico", e); }}}
                  >
                    {styles["icon-btn-diagnostico"]?.imageUrl ? (
                      <img src={styles["icon-btn-diagnostico"].imageUrl} alt="" style={{ width: styles["icon-btn-diagnostico"]?.iconSize || 14, height: styles["icon-btn-diagnostico"]?.iconSize || 14 }} />
                    ) : (
                      <Play style={{ width: styles["icon-btn-diagnostico"]?.iconSize || 14, height: styles["icon-btn-diagnostico"]?.iconSize || 14 }} className="fill-current" />
                    )}
                  </span>
                  <span className="whitespace-pre-line">{styles["btn-diagnostico"]?.buttonText || "Iniciar diagnóstico"}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div 
              onClick={(e) => editorMode ? handleElementClick("card-training", e) : handleOptionSelect("training")}
              className={`relative rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-purple-100 ${getEditableClass("card-training")}`}
              style={getElementStyle("card-training", "linear-gradient(135deg, rgba(138, 63, 252, 0.06) 0%, rgba(0, 217, 255, 0.04) 100%)")}
              data-testid="button-option-training"
            >
              <div className="p-4 flex items-start gap-3">
                <div 
                  className={`w-12 h-12 flex-shrink-0 flex items-center justify-center ${getEditableClass("icon-training")}`}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("icon-training", e); }}}
                  style={getElementStyle("icon-training")}
                >
                  <img 
                    src={styles["icon-training"]?.imageUrl || trainingImg} 
                    alt="" 
                    className="w-10 h-10 object-contain"
                    style={{ width: styles["icon-training"]?.imageSize ? `${styles["icon-training"].imageSize}%` : undefined }}
                  />
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 
                    className={`text-sm font-bold mb-0.5 ${getEditableClass("title-training")}`}
                    onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("title-training", e); }}}
                    style={{ color: styles["title-training"]?.textColor || "#8a3ffc", ...getElementStyle("title-training") }}
                  >
                    Entrenamiento
                  </h3>
                  <p 
                    className={`text-xs leading-snug ${getEditableClass("desc-training")}`}
                    onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("desc-training", e); }}}
                    style={{ color: styles["desc-training"]?.textColor || "#4b5563", ...getElementStyle("desc-training") }}
                  >
                    Ejercicios diseñados para activar, decodificar y estructurar el aprendizaje.
                  </p>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("btn-entrenamiento", e); } else { handleOptionSelect("training"); }}}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white font-bold shadow-md ${getEditableClass("btn-entrenamiento")}`}
                  style={{ 
                    fontSize: styles["btn-entrenamiento"]?.fontSize || 12,
                    ...getElementStyle("btn-entrenamiento", "linear-gradient(90deg, #00d9ff, #8a3ffc)")
                  }}
                  data-testid="button-iniciar-entrenamiento"
                >
                  <span 
                    className={getEditableClass("icon-btn-entrenamiento")}
                    onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("icon-btn-entrenamiento", e); }}}
                  >
                    {styles["icon-btn-entrenamiento"]?.imageUrl ? (
                      <img src={styles["icon-btn-entrenamiento"].imageUrl} alt="" style={{ width: styles["icon-btn-entrenamiento"]?.iconSize || 14, height: styles["icon-btn-entrenamiento"]?.iconSize || 14 }} />
                    ) : (
                      <Dumbbell style={{ width: styles["icon-btn-entrenamiento"]?.iconSize || 14, height: styles["icon-btn-entrenamiento"]?.iconSize || 14 }} />
                    )}
                  </span>
                  <span className="whitespace-pre-line">{styles["btn-entrenamiento"]?.buttonText || "Iniciar entrenamiento"}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={(e) => { if (editorMode) handleElementClick("card-metodox", e); }}
            className={`rounded-2xl border border-purple-100 p-4 shadow-sm ${getEditableClass("card-metodox")}`}
            style={getElementStyle("card-metodox", "white")}
          >
            <div>
              <h3 
                className={`text-base font-bold mb-0.5 ${getEditableClass("title-metodox")}`}
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("title-metodox", e); }}}
                style={{ color: styles["title-metodox"]?.textColor || "#1f2937", ...getElementStyle("title-metodox") }}
              >
                Método X
              </h3>
              <p 
                className={`text-xs ${getEditableClass("desc-metodox")}`}
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("desc-metodox", e); }}}
                style={{ color: styles["desc-metodox"]?.textColor || "#6b7280", ...getElementStyle("desc-metodox") }}
              >
                Sistema de Neuro Aceleración Cognitiva
              </p>
            </div>
            
            <button 
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("btn-metodo", e); }}}
              className={`mt-3 flex items-center justify-center gap-1 max-w-[200px] mx-auto py-2 px-4 rounded-full border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors ${getEditableClass("btn-metodo")}`}
              style={{ 
                fontSize: styles["btn-metodo"]?.fontSize || 12,
                ...getElementStyle("btn-metodo")
              }}
              data-testid="button-conocer-metodo"
            >
              <span className="whitespace-pre-line">{styles["btn-metodo"]?.buttonText || "Conocer el método"}</span>
              <span 
                className={getEditableClass("icon-btn-metodo")}
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("icon-btn-metodo", e); }}}
              >
                {styles["icon-btn-metodo"]?.imageUrl ? (
                  <img src={styles["icon-btn-metodo"].imageUrl} alt="" style={{ width: styles["icon-btn-metodo"]?.iconSize || 14, height: styles["icon-btn-metodo"]?.iconSize || 14 }} />
                ) : (
                  <ChevronRight style={{ width: styles["icon-btn-metodo"]?.iconSize || 14, height: styles["icon-btn-metodo"]?.iconSize || 14 }} />
                )}
              </span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm"
          >
            <h3 
              className={`text-base font-bold mb-3 ${getEditableClass("title-contacto")}`}
              onClick={(e) => { if (editorMode) handleElementClick("title-contacto", e); }}
              style={{ color: styles["title-contacto"]?.textColor || "#1f2937", ...getElementStyle("title-contacto") }}
            >
              Contáctanos
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("btn-whatsapp", e); } else { handleWhatsApp(); }}}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold shadow-sm ${getEditableClass("btn-whatsapp")}`}
                style={{ 
                  fontSize: styles["btn-whatsapp"]?.fontSize || 12,
                  ...getElementStyle("btn-whatsapp", "linear-gradient(90deg, #25D366, #128C7E)")
                }}
                data-testid="button-whatsapp"
              >
                <span 
                  className={getEditableClass("icon-btn-whatsapp")}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("icon-btn-whatsapp", e); }}}
                >
                  {styles["icon-btn-whatsapp"]?.imageUrl ? (
                    <img src={styles["icon-btn-whatsapp"].imageUrl} alt="" style={{ width: styles["icon-btn-whatsapp"]?.iconSize || 16, height: styles["icon-btn-whatsapp"]?.iconSize || 16 }} />
                  ) : (
                    <MessageCircle style={{ width: styles["icon-btn-whatsapp"]?.iconSize || 16, height: styles["icon-btn-whatsapp"]?.iconSize || 16 }} />
                  )}
                </span>
                <span className="whitespace-pre-line">{styles["btn-whatsapp"]?.buttonText || "WhatsApp"}</span>
              </button>
              
              <button
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("btn-email", e); } else { handleEmail(); }}}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold shadow-sm border border-purple-200 ${getEditableClass("btn-email")}`}
                style={{ 
                  fontSize: styles["btn-email"]?.fontSize || 12,
                  ...getElementStyle("btn-email", "linear-gradient(135deg, rgba(138, 63, 252, 0.08), rgba(0, 217, 255, 0.08))")
                }}
                data-testid="button-email"
              >
                <span 
                  className={getEditableClass("icon-btn-email")}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("icon-btn-email", e); }}}
                >
                  {styles["icon-btn-email"]?.imageUrl ? (
                    <img src={styles["icon-btn-email"].imageUrl} alt="" style={{ width: styles["icon-btn-email"]?.iconSize || 16, height: styles["icon-btn-email"]?.iconSize || 16 }} />
                  ) : (
                    <Mail style={{ width: styles["icon-btn-email"]?.iconSize || 16, height: styles["icon-btn-email"]?.iconSize || 16 }} />
                  )}
                </span>
                <span className="whitespace-pre-line">{styles["btn-email"]?.buttonText || "Email"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-purple-50 px-4 py-2 z-50 safe-area-inset-bottom">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button 
              onClick={(e) => { if (editorMode) handleElementClick("nav-inicio", e); }}
              className={`flex flex-col items-center gap-0.5 p-2 ${getEditableClass("nav-inicio")}`}
              style={getElementStyle("nav-inicio")}
              data-testid="nav-inicio"
            >
              <div 
                className="w-11 h-11 -mt-6 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: styles["nav-inicio"]?.background || "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  boxShadow: styles["nav-inicio"]?.boxShadow || "0 4px 15px rgba(124, 58, 237, 0.4)"
                }}
              >
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-medium mt-1" style={{ color: styles["nav-inicio"]?.textColor || "#7c3aed" }}>{t("nav.inicio")}</span>
            </button>
            
            <button 
              onClick={(e) => { if (editorMode) { handleElementClick("nav-diagnostico", e); } else { handleOptionSelect("tests"); }}}
              className={`flex flex-col items-center gap-0.5 p-2 ${getEditableClass("nav-diagnostico")}`}
              style={getElementStyle("nav-diagnostico")}
              data-testid="nav-diagnostico"
            >
              <Brain className="w-5 h-5" style={{ color: styles["nav-diagnostico"]?.textColor || "#9ca3af" }} />
              <span className="text-[10px]" style={{ color: styles["nav-diagnostico"]?.textColor || "#9ca3af" }}>{t("nav.diagnostico")}</span>
            </button>
            
            <button 
              onClick={(e) => { if (editorMode) { handleElementClick("nav-entrenar", e); } else { handleOptionSelect("training"); }}}
              className={`flex flex-col items-center gap-0.5 p-2 ${getEditableClass("nav-entrenar")}`}
              style={getElementStyle("nav-entrenar")}
              data-testid="nav-entrenar"
            >
              <Dumbbell className="w-5 h-5" style={{ color: styles["nav-entrenar"]?.textColor || "#9ca3af" }} />
              <span className="text-[10px]" style={{ color: styles["nav-entrenar"]?.textColor || "#9ca3af" }}>{t("nav.entrenar")}</span>
            </button>
            
            <button 
              onClick={(e) => { if (editorMode) { handleElementClick("nav-progreso", e); } else { setLocation(`/progreso/${userData?.ageGroup || "ninos"}`); } }}
              className={`flex flex-col items-center gap-0.5 p-2 ${getEditableClass("nav-progreso")}`}
              style={getElementStyle("nav-progreso")}
              data-testid="nav-progreso"
            >
              <TrendingUp className="w-5 h-5" style={{ color: styles["nav-progreso"]?.textColor || "#9ca3af" }} />
              <span className="text-[10px]" style={{ color: styles["nav-progreso"]?.textColor || "#9ca3af" }}>{t("nav.progreso")}</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={(e) => { 
                  if (editorMode) { handleElementClick("nav-mas", e); } 
                  else { playClick(); setNavMoreOpen(!navMoreOpen); }
                }}
                className={`flex flex-col items-center gap-0.5 p-2 ${getEditableClass("nav-mas")}`}
                style={getElementStyle("nav-mas")}
                data-testid="nav-mas"
              >
                <MoreHorizontal className="w-5 h-5" style={{ color: styles["nav-mas"]?.textColor || "#9ca3af" }} />
                <span className="text-[10px]" style={{ color: styles["nav-mas"]?.textColor || "#9ca3af" }}>{t("nav.mas")}</span>
              </button>
              {navMoreOpen && (
                <div
                  className="absolute bottom-full right-0 mb-3 w-48 bg-white rounded-2xl z-[9999]"
                  style={{ boxShadow: "0 8px 30px rgba(124,58,237,0.15), 0 2px 8px rgba(0,0,0,0.06)" }}
                  data-testid="dropdown-mas"
                >
                  <button
                    onClick={() => { setNavMoreOpen(false); setLocation("/blog"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-t-2xl active:bg-purple-50"
                    data-testid="dropdown-item-blog"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f3e8ff, #e0f2fe)" }}>
                      <Newspaper className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{t("nav.blog")}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                  </button>
                  <button
                    onClick={() => { setNavMoreOpen(false); setLocation("/a-leer-bolivia"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-b-2xl active:bg-purple-50"
                    data-testid="dropdown-item-aleer"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d1fae5, #cffafe)" }}>
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{t("nav.aleerBolivia")}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
      
      <AnimatePresence>
        {editorMode && (
          <EditorToolbar
            selectedElement={selectedElement}
            styles={styles}
            onStyleChange={handleStyleChange}
            onSave={handleSaveStyles}
            onClose={handleCloseEditor}
            onClearSelection={() => setSelectedElement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
