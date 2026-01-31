import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Menu, Home, Brain, Dumbbell, TrendingUp, MoreHorizontal, MessageCircle, Mail, ChevronRight, Play } from "lucide-react";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";
import { useIsMobile } from "@/hooks/use-mobile";

import fondoImg from "@/assets/ui/backgrounds/fondo-1.png";
import brainHeaderImg from "@/assets/ui/icons/brain-header.png";
import trainingImg from "@/assets/ui/icons/training.png";
import xIconImg from "@/assets/ui/icons/x-icon.png";
import boton1Img from "@/assets/ui/buttons/boton-1.png";
import avatar1Img from "@/assets/ui/avatars/avatar-1.png";

interface SelectionScreenProps {
  onComplete: (selection: { ageGroup: string; ageLabel: string; problems: string[]; problemTitles: string[] }) => void;
}

export function SelectionScreen({ onComplete }: SelectionScreenProps) {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();
  const { setUserData } = useUserData();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <header className="flex items-center justify-between px-5 py-4 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-0.5">
            <span className="text-3xl font-black" style={{ color: "#7C3AED" }}>IQ</span>
            <span className="text-3xl font-black" style={{ 
              background: "linear-gradient(135deg, #14B8A6 0%, #7C3AED 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}>X</span>
          </div>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-500"
            data-testid="button-menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
      )}

      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="relative w-full overflow-hidden">
          <div 
            className="absolute inset-0 z-0"
            style={{ 
              backgroundImage: `url(${fondoImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center top"
            }}
          />
          
          <div 
            className="absolute bottom-0 left-0 right-0 h-16 z-10"
            style={{
              background: "white",
              borderTopLeftRadius: "50% 100%",
              borderTopRightRadius: "50% 100%",
              transform: "translateY(50%)"
            }}
          />

          <div className="relative z-5 px-5 pt-4 pb-16">
            <div className="relative">
              <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 -mr-8 -mt-4 opacity-90">
                <img 
                  src={brainHeaderImg} 
                  alt="" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="relative z-10 pr-32 md:pr-48">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[28px] md:text-4xl font-black leading-[1.1] mb-4"
                >
                  <span style={{ color: "#7C3AED" }}>Activa la</span>
                  <br />
                  <span style={{ color: "#7C3AED" }}>Inteligencia</span>
                  <br />
                  <span style={{ 
                    background: "linear-gradient(90deg, #14B8A6, #7C3AED)", 
                    WebkitBackgroundClip: "text", 
                    WebkitTextFillColor: "transparent" 
                  }}>eXponencial</span>
                </motion.h1>
              </div>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-gray-700 mb-3 max-w-[280px]"
              >
                Un método científico de entrenamiento cognitivo
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xs text-gray-500 leading-relaxed max-w-[320px]"
              >
                basado en neuroplasticidad y activación de <span className="font-semibold text-gray-700">ondas gamma</span>, diseñado para optimizar la forma en que el cerebro aprende y procesa información en todas las etapas de <span className="font-semibold text-gray-700">la vida</span>.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="px-5 pt-2 pb-6 space-y-4 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-base font-bold text-gray-800 mb-3">Diagnóstico inicial</h2>
            
            <div 
              onClick={() => handleOptionSelect("tests")}
              className="relative rounded-2xl overflow-hidden cursor-pointer shadow-sm"
              style={{
                backgroundImage: `url(${boton1Img})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
              data-testid="button-option-tests"
            >
              <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-white/80 flex items-center justify-center shadow-sm">
                  <img src={avatar1Img} alt="" className="w-10 h-10 object-contain" />
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-sm font-bold mb-0.5" style={{ color: "#7C3AED" }}>
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
                  className="flex items-center justify-center gap-2 px-5 py-2 rounded-full text-white text-xs font-bold shadow-md"
                  style={{ background: "linear-gradient(90deg, #7C3AED, #5B21B6)" }}
                  data-testid="button-iniciar-diagnostico"
                >
                  <Play className="w-3 h-3 fill-current" />
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
              onClick={() => handleOptionSelect("training")}
              className="relative rounded-2xl overflow-hidden cursor-pointer shadow-sm"
              style={{
                backgroundImage: `url(${boton1Img})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
              data-testid="button-option-training"
            >
              <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white/60 flex items-center justify-center">
                  <img src={trainingImg} alt="" className="w-10 h-10 object-contain" />
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-sm font-bold mb-0.5" style={{ color: "#7C3AED" }}>
                    Entrenamiento
                  </h3>
                  <p className="text-xs text-gray-600 leading-snug">
                    Ejercicios diseñados para activar, decodificar y estructurar el aprendizaje
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
                  Sistema de Neuro-Aceleración Cognitiva
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <img src={xIconImg} alt="X" className="w-14 h-14 object-contain" />
              </div>
            </div>
            
            <button 
              className="mt-3 flex items-center justify-center gap-1 w-full py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-medium shadow-sm"
                style={{ background: "linear-gradient(90deg, #25D366, #128C7E)" }}
                data-testid="button-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              
              <button
                onClick={handleEmail}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium shadow-sm"
                style={{ 
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(20, 184, 166, 0.15))",
                  color: "#7C3AED"
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
              <Home className="w-5 h-5" style={{ color: "#7C3AED" }} />
              <span className="text-[10px] font-medium" style={{ color: "#7C3AED" }}>Inicio</span>
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
    </div>
  );
}
