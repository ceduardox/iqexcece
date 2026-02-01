import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Home, Brain, Dumbbell, TrendingUp, MoreHorizontal, MessageCircle, Mail, ChevronRight, Play } from "lucide-react";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { EditorToolbar, type PageStyles, type ElementStyle } from "./EditorToolbar";
import { useToast } from "@/hooks/use-toast";

import avatar1Img from "@/assets/ui/avatars/avatar-1.png";
import trainingImg from "@/assets/ui/icons/training.png";
import menuCurveImg from "@assets/menu_1769957804819.png";

interface SelectionScreenProps {
  onComplete: (selection: { ageGroup: string; ageLabel: string; problems: string[]; problemTitles: string[] }) => void;
}

export function SelectionScreen({ onComplete }: SelectionScreenProps) {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();
  const { setUserData } = useUserData();
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast } = useToast();
  
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [adminToken, setAdminToken] = useState<string | null>(null);
  
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
      })
      .catch(() => {});
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
      result.background = style.background;
    } else if (defaultBg) {
      result.background = defaultBg;
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
    setUserData({
      ageGroup: "ninos",
      ageLabel: "Usuario",
      selectedProblems: []
    });
    if (option === "tests") {
      setLocation("/tests");
    } else {
      setLocation("/entrenamiento/ninos");
    }
  }, [setUserData, setLocation]);

  const handleWhatsApp = () => {
    window.open("https://wa.me/59178767696", "_blank");
  };

  const handleEmail = () => {
    window.location.href = "mailto:soporte@inteligenciaexponencial.com";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {isMobile && (
        <header className="flex items-center justify-center px-5 py-4 bg-white sticky top-0 z-50">
          <div className="absolute left-5 w-10" />
          
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
          
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="absolute right-5 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="button-menu"
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </header>
      )}

      {isMobile && (
        <div
          className={`w-full relative z-50 ${getEditableClass("menu-curve")}`}
          onClick={(e) => handleElementClick("menu-curve", e)}
          style={{
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
                    className={`text-sm font-semibold mb-2 ${getEditableClass("hero-subtitle")}`}
                    onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle", e); }}
                    style={{ color: styles["hero-subtitle"]?.textColor || "#1f2937", ...getElementStyle("hero-subtitle") }}
                  >
                    Un método científico de entrenamiento cognitivo
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
                  className={`text-sm font-semibold mb-2 ${getEditableClass("hero-subtitle")}`}
                  onClick={(e) => { e.stopPropagation(); handleElementClick("hero-subtitle", e); }}
                  style={{ color: styles["hero-subtitle"]?.textColor || "#1f2937", ...getElementStyle("hero-subtitle") }}
                >
                  Un método científico de entrenamiento cognitivo
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
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("btn-diagnostico", e); }}}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md ${getEditableClass("btn-diagnostico")}`}
                  style={getElementStyle("btn-diagnostico", "linear-gradient(90deg, #8a3ffc, #6b21a8)")}
                  data-testid="button-iniciar-diagnostico"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Iniciar diagnóstico
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
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("btn-entrenamiento", e); }}}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md ${getEditableClass("btn-entrenamiento")}`}
                  style={getElementStyle("btn-entrenamiento", "linear-gradient(90deg, #00d9ff, #8a3ffc)")}
                  data-testid="button-iniciar-entrenamiento"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  Iniciar entrenamiento
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
              className={`mt-3 flex items-center justify-center gap-1 max-w-[200px] mx-auto py-2 px-4 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors ${getEditableClass("btn-metodo")}`}
              style={getElementStyle("btn-metodo")}
              data-testid="button-conocer-metodo"
            >
              Conocer el método
              <ChevronRight className="w-3.5 h-3.5" />
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
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm ${getEditableClass("btn-whatsapp")}`}
                style={getElementStyle("btn-whatsapp", "linear-gradient(90deg, #25D366, #128C7E)")}
                data-testid="button-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              
              <button
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("btn-email", e); } else { handleEmail(); }}}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold shadow-sm border border-purple-200 ${getEditableClass("btn-email")}`}
                style={getElementStyle("btn-email", "linear-gradient(135deg, rgba(138, 63, 252, 0.08), rgba(0, 217, 255, 0.08))")}
                data-testid="button-email"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>
            
            <p 
              className={`text-[10px] text-center mt-2 ${getEditableClass("email-contacto")}`}
              onClick={(e) => { if (editorMode) handleElementClick("email-contacto", e); }}
              style={{ color: styles["email-contacto"]?.textColor || "#9ca3af", ...getElementStyle("email-contacto") }}
            >
              soporte@inteligenciaexponencial.com
            </p>
          </motion.div>
        </div>
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50 shadow-lg">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button 
              onClick={(e) => { if (editorMode) handleElementClick("nav-inicio", e); }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-inicio")}`}
              style={getElementStyle("nav-inicio")}
              data-testid="nav-inicio"
            >
              <Home className="w-5 h-5" style={{ color: styles["nav-inicio"]?.textColor || "#8a3ffc" }} />
              <span className="text-[10px] font-medium" style={{ color: styles["nav-inicio"]?.textColor || "#8a3ffc" }}>Inicio</span>
            </button>
            
            <button 
              onClick={(e) => { if (editorMode) { handleElementClick("nav-diagnostico", e); } else { handleOptionSelect("tests"); }}}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-diagnostico")}`}
              style={getElementStyle("nav-diagnostico")}
              data-testid="nav-diagnostico"
            >
              <Brain className="w-5 h-5" style={{ color: styles["nav-diagnostico"]?.textColor || "#9ca3af" }} />
              <span className="text-[10px] font-medium" style={{ color: styles["nav-diagnostico"]?.textColor || "#9ca3af" }}>Diagnóstico</span>
            </button>
            
            <button 
              onClick={(e) => { if (editorMode) { handleElementClick("nav-entrenar", e); } else { handleOptionSelect("training"); }}}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-entrenar")}`}
              style={getElementStyle("nav-entrenar")}
              data-testid="nav-entrenar"
            >
              <Dumbbell className="w-5 h-5" style={{ color: styles["nav-entrenar"]?.textColor || "#9ca3af" }} />
              <span className="text-[10px] font-medium" style={{ color: styles["nav-entrenar"]?.textColor || "#9ca3af" }}>Entrenar</span>
            </button>
            
            <button 
              onClick={(e) => { if (editorMode) handleElementClick("nav-progreso", e); }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-progreso")}`}
              style={getElementStyle("nav-progreso")}
              data-testid="nav-progreso"
            >
              <TrendingUp className="w-5 h-5" style={{ color: styles["nav-progreso"]?.textColor || "#9ca3af" }} />
              <span className="text-[10px] font-medium" style={{ color: styles["nav-progreso"]?.textColor || "#9ca3af" }}>Progreso</span>
            </button>
            
            <button 
              onClick={(e) => { if (editorMode) handleElementClick("nav-mas", e); }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${getEditableClass("nav-mas")}`}
              style={getElementStyle("nav-mas")}
              data-testid="nav-mas"
            >
              <MoreHorizontal className="w-5 h-5" style={{ color: styles["nav-mas"]?.textColor || "#9ca3af" }} />
              <span className="text-[10px] font-medium" style={{ color: styles["nav-mas"]?.textColor || "#9ca3af" }}>Más</span>
            </button>
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
