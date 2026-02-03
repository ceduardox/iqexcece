import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Home, Brain, BarChart3, Dumbbell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSounds } from "@/hooks/use-sounds";
import { useState, useEffect } from "react";

function GolpeAnimation() {
  const words = ["LEER", "VER", "OJO", "LUZ", "SOL"];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord(prev => (prev + 1) % words.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Outer circle */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{ 
          background: "conic-gradient(from 0deg, #7c3aed 0%, #06b6d4 50%, #7c3aed 100%)",
          padding: "2px"
        }}
      >
        <div className="w-full h-full rounded-full bg-white" />
      </div>
      {/* Inner circle */}
      <div className="absolute inset-2 rounded-full border border-purple-100" />
      {/* Animated word */}
      <motion.span
        key={currentWord}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.5 }}
        className="absolute text-purple-600 font-bold text-[10px]"
      >
        {words[currentWord]}
      </motion.span>
    </div>
  );
}

function DesplazamientoAnimation() {
  const words = ["Lectura", "Rápida", "Visual", "Mental"];
  
  return (
    <div className="relative w-16 h-16 overflow-hidden rounded-xl bg-gradient-to-b from-purple-50/50 to-white border border-purple-100/50">
      {/* Scrolling text container */}
      <motion.div
        className="flex flex-col items-center gap-1.5 py-1"
        animate={{ y: [0, -48, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        {[...words, ...words].map((word, i) => (
          <span 
            key={i} 
            className="text-[9px] font-medium text-purple-600 whitespace-nowrap"
          >
            {word}
          </span>
        ))}
      </motion.div>
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-purple-50/80 to-transparent pointer-events-none" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      {/* Reading line indicator */}
      <div 
        className="absolute top-1/2 left-1 right-1 h-0.5 -translate-y-1/2 rounded-full"
        style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}
      />
    </div>
  );
}

export default function AceleracionSelectionPage() {
  const [, navigate] = useLocation();
  const params = useParams<{ categoria: string; itemId: string }>();
  const categoria = params.categoria || "ninos";
  const itemId = params.itemId || "";
  const { playSound } = useSounds();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/aceleracion", itemId],
    queryFn: async () => {
      const res = await fetch(`/api/aceleracion/${itemId}`);
      if (!res.ok) throw new Error("No encontrado");
      return res.json();
    },
    enabled: !!itemId
  });

  const ejercicio = data?.ejercicio;

  const handleBack = () => {
    playSound("iphone");
    window.history.back();
  };

  const handleModeSelect = (mode: "golpe" | "desplazamiento") => {
    playSound("card");
    navigate(`/aceleracion/${categoria}/${itemId}/${mode}`);
  };

  const handleNavClick = (path: string) => {
    playSound("iphone");
    navigate(path);
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 30%, #ffffff 70%, #f0fdff 100%)"
      }}
    >
      {/* Header */}
      <header className="relative px-4 py-4 flex items-center justify-between">
        <motion.button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          style={{ boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </motion.button>
        <div className="w-10" />
      </header>

      {/* Hero image */}
      <div className="relative px-6 mb-6 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="https://iqexponencial.app/api/images/855a8501-7a45-48c1-be95-a678a94836b5"
            alt="Aceleración de Lectura"
            className="w-28 sm:w-32 h-auto rounded-2xl object-cover"
            style={{ boxShadow: "0 8px 24px rgba(124, 58, 237, 0.15)" }}
          />
        </motion.div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-5 pb-28 relative">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div 
              className="w-8 h-8 rounded-full border-3 border-purple-100 border-t-purple-500 animate-spin"
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {/* Title */}
            <motion.div 
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                Selecciona el Modo
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                Elige cómo quieres practicar
              </p>
            </motion.div>

            {/* Cards grid - square cards */}
            <div className="grid grid-cols-2 gap-4 px-2">
              {/* Golpe de Vista Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleModeSelect("golpe")}
                className="cursor-pointer aspect-square"
                data-testid="card-mode-golpe"
              >
                <motion.div 
                  className="relative bg-white rounded-3xl p-3 sm:p-4 h-full flex flex-col items-center justify-center"
                  style={{ boxShadow: "0 4px 20px rgba(124, 58, 237, 0.08)" }}
                  whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(124, 58, 237, 0.15)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animation preview */}
                  <div className="mb-3">
                    <GolpeAnimation />
                  </div>
                  
                  {/* Text */}
                  <div className="text-center">
                    <h3 className="text-gray-800 font-semibold text-xs sm:text-sm mb-0.5">
                      Golpe de Vista
                    </h3>
                    <p className="text-gray-400 text-[9px] sm:text-[10px]">
                      Campo visual
                    </p>
                  </div>
                  
                  {/* Bottom gradient line */}
                  <div 
                    className="absolute bottom-0 left-4 right-4 h-1 rounded-full"
                    style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                  />
                </motion.div>
              </motion.div>

              {/* Desplazamiento Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => handleModeSelect("desplazamiento")}
                className="cursor-pointer aspect-square"
                data-testid="card-mode-desplazamiento"
              >
                <motion.div 
                  className="relative bg-white rounded-3xl p-3 sm:p-4 h-full flex flex-col items-center justify-center"
                  style={{ boxShadow: "0 4px 20px rgba(6, 182, 212, 0.08)" }}
                  whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(6, 182, 212, 0.15)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animation preview */}
                  <div className="mb-3">
                    <DesplazamientoAnimation />
                  </div>
                  
                  {/* Text */}
                  <div className="text-center">
                    <h3 className="text-gray-800 font-semibold text-xs sm:text-sm mb-0.5">
                      Desplazamiento
                    </h3>
                    <p className="text-gray-400 text-[9px] sm:text-[10px]">
                      Lectura continua
                    </p>
                  </div>
                  
                  {/* Bottom gradient line */}
                  <div 
                    className="absolute bottom-0 left-4 right-4 h-1 rounded-full"
                    style={{ background: "linear-gradient(90deg, #06b6d4, #22d3ee)" }}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Exercise info */}
            {ejercicio?.titulo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-center"
              >
                <span 
                  className="inline-block px-4 py-2 rounded-full text-xs text-purple-600 font-medium"
                  style={{ background: "rgba(124, 58, 237, 0.08)" }}
                >
                  {ejercicio.titulo}
                </span>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-purple-50 px-4 py-2 z-50"
      >
        <div className="max-w-md mx-auto flex justify-around items-center">
          <motion.button
            onClick={() => handleNavClick("/")}
            className="flex flex-col items-center gap-0.5 p-2 text-gray-400"
            whileTap={{ scale: 0.9 }}
            data-testid="nav-home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Inicio</span>
          </motion.button>
          <motion.button
            onClick={() => handleNavClick(`/reading-selection/${categoria}`)}
            className="flex flex-col items-center gap-0.5 p-2 text-gray-400"
            whileTap={{ scale: 0.9 }}
            data-testid="nav-diagnostico"
          >
            <Brain className="w-5 h-5" />
            <span className="text-[10px]">Diagnóstico</span>
          </motion.button>
          <motion.button
            onClick={() => handleNavClick(`/entrenamiento/${categoria}`)}
            className="flex flex-col items-center gap-0.5 p-2 text-purple-600"
            whileTap={{ scale: 0.9 }}
            data-testid="nav-entrenar"
          >
            <div 
              className="w-11 h-11 -mt-6 rounded-2xl flex items-center justify-center"
              style={{ 
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)"
              }}
            >
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-medium mt-1">Entrenar</span>
          </motion.button>
          <motion.button
            onClick={() => handleNavClick(`/progreso`)}
            className="flex flex-col items-center gap-0.5 p-2 text-gray-400"
            whileTap={{ scale: 0.9 }}
            data-testid="nav-progreso"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px]">Progreso</span>
          </motion.button>
        </div>
      </nav>
    </div>
  );
}
