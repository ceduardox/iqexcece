import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Home, Brain, Dumbbell, TrendingUp, MoreHorizontal, MessageCircle, Mail, ChevronRight, Play } from "lucide-react";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { EditorToolbar, type PageStyles, type ElementStyle } from "./EditorToolbar";
import { useToast } from "@/hooks/use-toast";

import brainBgImg from "@/assets/ui/backgrounds/brain-bg.png";
import avatar1Img from "@/assets/ui/avatars/avatar-1.png";
import trainingImg from "@/assets/ui/icons/training.png";
import xIconImg from "@/assets/ui/icons/x-icon.png";

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
  
  const getElementStyle = (elementId: string): React.CSSProperties => {
    const style = styles[elementId];
    if (!style) return {};
    
    let background = style.background;
    if (style.backgroundType === "image" && style.imageUrl) {
      background = `url(${style.imageUrl})`;
    }
    
    return {
      background,
      backgroundSize: style.imageSize ? `${style.imageSize}%` : undefined,
      backgroundPosition: style.backgroundType === "image" ? "center" : undefined,
      backgroundRepeat: style.backgroundType === "image" ? "no-repeat" : undefined,
      boxShadow: style.boxShadow,
      marginTop: style.marginTop,
      marginBottom: style.marginBottom,
      marginLeft: style.marginLeft,
      marginRight: style.marginRight,
    };
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

      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        {isMobile && (
          <div 
            className="relative w-full"
            style={{ 
              marginTop: "-24px",
              zIndex: 40
            }}
          >
            <div 
              className={`w-full ${getEditableClass("hero-section")}`}
              onClick={(e) => handleElementClick("hero-section", e)}
              style={{
                background: styles["hero-section"]?.background || "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)",
                borderTopLeftRadius: "32px",
                borderTopRightRadius: "32px",
                paddingTop: "32px",
                minHeight: "340px",
                position: "relative",
                ...getElementStyle("hero-section")
              }}
              data-testid="hero-section"
            >
              <div 
                className="absolute right-0 top-0 w-[65%] h-full opacity-90"
                style={{ 
                  backgroundImage: `url(${brainBgImg})`,
                  backgroundSize: "contain",
                  backgroundPosition: "right center",
                  backgroundRepeat: "no-repeat",
                  borderTopRightRadius: "32px"
                }}
              />

              <div className="relative z-10 px-5 pb-8">
                <div className="max-w-[60%] md:max-w-[50%]">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[26px] md:text-4xl font-black leading-[1.15] mb-4"
                  >
                    <span style={{ color: "#8a3ffc" }}>Activa la</span>
                    <br />
                    <span style={{ color: "#8a3ffc" }}>Inteligencia</span>
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
                    className="text-sm font-semibold text-gray-800 mb-2"
                  >
                    Un método científico de entrenamiento cognitivo
                  </motion.p>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xs text-gray-500 leading-relaxed"
                  >
                    basado en neuroplasticidad y activación de <span className="font-semibold text-gray-700">ondas gamma</span>, diseñado para optimizar la forma en que el cerebro aprende y procesa información en todas las etapas de la vida.
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
              background: styles["hero-section"]?.background || "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)",
              ...getElementStyle("hero-section")
            }}
            data-testid="hero-section-desktop"
          >
            <div 
              className="absolute right-0 top-0 w-[65%] h-full opacity-90"
              style={{ 
                backgroundImage: `url(${brainBgImg})`,
                backgroundSize: "contain",
                backgroundPosition: "right center",
                backgroundRepeat: "no-repeat"
              }}
            />

            <div className="relative z-10 px-5 pt-10 pb-10">
              <div className="max-w-[50%]">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-black leading-[1.15] mb-4"
                >
                  <span style={{ color: "#8a3ffc" }}>Activa la</span>
                  <br />
                  <span style={{ color: "#8a3ffc" }}>Inteligencia</span>
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
                  className="text-sm font-semibold text-gray-800 mb-2"
                >
                  Un método científico de entrenamiento cognitivo
                </motion.p>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xs text-gray-500 leading-relaxed"
                >
                  basado en neuroplasticidad y activación de <span className="font-semibold text-gray-700">ondas gamma</span>, diseñado para optimizar la forma en que el cerebro aprende y procesa información en todas las etapas de la vida.
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
            <h2 className="text-base font-bold text-gray-800 mb-3">Diagnóstico inicial</h2>
            
            <div 
              onClick={(e) => editorMode ? handleElementClick("card-tests", e) : handleOptionSelect("tests")}
              className={`relative rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-purple-100 ${getEditableClass("card-tests")}`}
              style={{
                background: styles["card-tests"]?.background || "linear-gradient(135deg, rgba(138, 63, 252, 0.06) 0%, rgba(0, 217, 255, 0.04) 100%)",
                ...getElementStyle("card-tests")
              }}
              data-testid="button-option-tests"
            >
              <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm border border-purple-100">
                  <img src={avatar1Img} alt="" className="w-10 h-10 object-contain" />
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-sm font-bold mb-0.5" style={{ color: "#8a3ffc" }}>
                    Diagnóstico Cognitivo
                  </h3>
                  <p className="text-xs text-gray-600 leading-snug">
                    Conoce tu punto de partida y cómo funciona tu mente.
                  </p>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md"
                  style={{ background: "linear-gradient(90deg, #8a3ffc, #6b21a8)" }}
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
              style={{
                background: styles["card-training"]?.background || "linear-gradient(135deg, rgba(138, 63, 252, 0.06) 0%, rgba(0, 217, 255, 0.04) 100%)",
                ...getElementStyle("card-training")
              }}
              data-testid="button-option-training"
            >
              <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-purple-100">
                  <img src={trainingImg} alt="" className="w-9 h-9 object-contain" />
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-sm font-bold mb-0.5" style={{ color: "#8a3ffc" }}>
                    Entrenamiento
                  </h3>
                  <p className="text-xs text-gray-600 leading-snug">
                    Ejercicios diseñados para activar, decodificar y estructurar el aprendizaje.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <h3 className="text-base font-bold text-gray-800 mb-0.5">Método X</h3>
                <p className="text-xs text-gray-500">
                  Sistema de Neuro Aceleración Cognitiva
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <img src={xIconImg} alt="X" className="w-14 h-14 object-contain" />
              </div>
            </div>
            
            <button 
              className="mt-3 flex items-center justify-center gap-1 w-full py-2.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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
            <h3 className="text-base font-bold text-gray-800 mb-3">Contáctanos</h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm"
                style={{ background: "linear-gradient(90deg, #25D366, #128C7E)" }}
                data-testid="button-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              
              <button
                onClick={handleEmail}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold shadow-sm border border-purple-200"
                style={{ 
                  background: "linear-gradient(135deg, rgba(138, 63, 252, 0.08), rgba(0, 217, 255, 0.08))",
                  color: "#8a3ffc"
                }}
                data-testid="button-email"
              >
                <Mail className="w-4 h-4" />
                Envíanos un Email
              </button>
            </div>
            
            <p className="text-[10px] text-gray-400 text-center mt-2">
              soporte@inteligenciaexponencial.com
            </p>
          </motion.div>
        </div>
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50 shadow-lg">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button 
              className="flex flex-col items-center gap-0.5 px-3 py-1"
              data-testid="nav-inicio"
            >
              <Home className="w-5 h-5" style={{ color: "#8a3ffc" }} />
              <span className="text-[10px] font-medium" style={{ color: "#8a3ffc" }}>Inicio</span>
            </button>
            
            <button 
              onClick={() => handleOptionSelect("tests")}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
              data-testid="nav-diagnostico"
            >
              <Brain className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Diagnóstico</span>
            </button>
            
            <button 
              onClick={() => handleOptionSelect("training")}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
              data-testid="nav-entrenar"
            >
              <Dumbbell className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Entrenar</span>
            </button>
            
            <button 
              className="flex flex-col items-center gap-0.5 px-3 py-1"
              data-testid="nav-progreso"
            >
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Progreso</span>
            </button>
            
            <button 
              className="flex flex-col items-center gap-0.5 px-3 py-1"
              data-testid="nav-mas"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Más</span>
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
