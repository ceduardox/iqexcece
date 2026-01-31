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
        <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black" style={{ color: "#7C3AED" }}>IQ</span>
            <span className="text-2xl font-black" style={{ 
              background: "linear-gradient(90deg, #14B8A6, #7C3AED)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}>X</span>
          </div>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-600"
            data-testid="button-menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
      )}

      <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
        <div 
          className="relative w-full overflow-hidden"
          style={{ 
            backgroundImage: `url(${fondoImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="relative z-10 px-5 pt-6 pb-8 md:px-8 md:pt-10 md:pb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-5xl mx-auto">
              <div className="flex-1 md:max-w-lg">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4"
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
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm md:text-base text-gray-700 mb-2"
                >
                  Un método científico de entrenamiento cognitivo
                </motion.p>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xs md:text-sm text-gray-600 leading-relaxed"
                >
                  basado en neuroplasticidad y activación de <span className="font-semibold text-gray-800">ondas gamma</span>, diseñado para optimizar la forma en que el cerebro aprende y procesa información en todas las etapas de <span className="font-semibold text-gray-800">la vida</span>.
                </motion.p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-shrink-0 mt-4 md:mt-0 md:ml-8"
              >
                <img 
                  src={brainHeaderImg} 
                  alt="Cerebro" 
                  className="w-40 h-auto md:w-56 lg:w-64 mx-auto md:mx-0"
                />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-3">Diagnóstico inicial</h2>
            
            <div 
              onClick={() => handleOptionSelect("tests")}
              className="relative rounded-2xl overflow-hidden cursor-pointer"
              style={{
                backgroundImage: `url(${boton1Img})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
              data-testid="button-option-tests"
            >
              <div className="relative p-4 md:p-5 flex items-center gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <img src={avatar1Img} alt="" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-bold" style={{ color: "#7C3AED" }}>
                    Diagnóstico Cognitivo
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 leading-snug">
                    Conoce tu punto de partida y cómo funciona tu mente.
                  </p>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-white text-sm font-bold"
                  style={{ background: "linear-gradient(90deg, #7C3AED, #14B8A6)" }}
                  data-testid="button-iniciar-diagnostico"
                >
                  <Play className="w-4 h-4" />
                  Iniciar diagnóstico
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div 
              onClick={() => handleOptionSelect("training")}
              className="relative rounded-2xl overflow-hidden cursor-pointer"
              style={{
                backgroundImage: `url(${boton1Img})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
              data-testid="button-option-training"
            >
              <div className="relative p-4 md:p-5 flex items-center gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <img src={trainingImg} alt="" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-bold" style={{ color: "#14B8A6" }}>
                    Entrenamiento
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 leading-snug">
                    Ejercicios diseñados para activar, decodificar y estructurar el aprendizaje
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-purple-100 bg-white p-4 md:p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1">Método X</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Sistema de Neuro-Aceleración Cognitiva
                </p>
              </div>
              
              <div className="flex-shrink-0 ml-4">
                <img src={xIconImg} alt="X" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
              </div>
            </div>
            
            <button 
              className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
              data-testid="button-conocer-metodo"
            >
              Conocer el método
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-purple-100 bg-white p-4 md:p-5"
          >
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3">Contáctanos</h3>
            
            <div className="flex gap-3">
              <button
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: "linear-gradient(90deg, #25D366, #128C7E)" }}
                data-testid="button-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              
              <button
                onClick={handleEmail}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                style={{ 
                  background: "linear-gradient(90deg, rgba(124, 58, 237, 0.1), rgba(20, 184, 166, 0.1))",
                  color: "#7C3AED"
                }}
                data-testid="button-email"
              >
                <Mail className="w-4 h-4" />
                Envíanos un Email
              </button>
            </div>
            
            <p className="text-[10px] text-gray-400 text-center mt-3">
              soporte@inteligenciaexponencial.com
            </p>
          </motion.div>
        </div>
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50">
          <div className="flex items-center justify-around">
            <button 
              className="flex flex-col items-center gap-1 px-3 py-1"
              data-testid="nav-inicio"
            >
              <Home className="w-5 h-5" style={{ color: "#7C3AED" }} />
              <span className="text-[10px] font-medium" style={{ color: "#7C3AED" }}>Inicio</span>
            </button>
            
            <button 
              onClick={() => handleOptionSelect("tests")}
              className="flex flex-col items-center gap-1 px-3 py-1"
              data-testid="nav-diagnostico"
            >
              <Brain className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Diagnóstico</span>
            </button>
            
            <button 
              onClick={() => handleOptionSelect("training")}
              className="flex flex-col items-center gap-1 px-3 py-1"
              data-testid="nav-entrenar"
            >
              <Dumbbell className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Entrenar</span>
            </button>
            
            <button 
              className="flex flex-col items-center gap-1 px-3 py-1"
              data-testid="nav-progreso"
            >
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400">Progreso</span>
            </button>
            
            <button 
              className="flex flex-col items-center gap-1 px-3 py-1"
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
