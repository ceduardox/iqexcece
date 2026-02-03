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
    <div className="relative w-20 h-20 flex items-center justify-center">
      {/* Outer circle */}
      <div className="absolute inset-0 rounded-full border-2 border-purple-300" />
      {/* Inner circle */}
      <div className="absolute inset-2 rounded-full border border-purple-200" />
      {/* Center dot */}
      <div className="absolute w-2 h-2 bg-purple-500 rounded-full" />
      {/* Animated word */}
      <motion.span
        key={currentWord}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.5 }}
        className="absolute text-purple-600 font-bold text-xs"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        {words[currentWord]}
      </motion.span>
      {/* Orbiting elements */}
      <motion.div
        className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ top: 0, left: "50%", marginLeft: "-3px" }}
      />
    </div>
  );
}

function DesplazamientoAnimation() {
  const words = ["Lectura", "Rápida", "Visual", "Mental"];
  
  return (
    <div className="relative w-20 h-20 overflow-hidden rounded-lg bg-gradient-to-b from-cyan-50 to-white border border-cyan-100">
      {/* Scrolling text container */}
      <motion.div
        className="flex flex-col items-center gap-2 py-2"
        animate={{ y: [0, -60, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        {[...words, ...words].map((word, i) => (
          <span 
            key={i} 
            className="text-[10px] font-medium text-cyan-600 whitespace-nowrap"
          >
            {word}
          </span>
        ))}
      </motion.div>
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-cyan-50 to-transparent pointer-events-none" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      {/* Reading line indicator */}
      <div className="absolute top-1/2 left-1 right-1 h-0.5 bg-cyan-300/50 -translate-y-1/2" />
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-purple-50/30">
      {/* Subtle decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-32 left-0 w-48 h-48 bg-cyan-100/40 rounded-full blur-3xl -translate-x-1/2" />

      {/* Header */}
      <header className="relative px-4 py-4 flex items-center justify-between">
        <motion.button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
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
            className="w-32 h-auto rounded-2xl object-cover shadow-lg"
          />
        </motion.div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-5 pb-28 relative">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
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
              <p className="text-gray-500 text-xs sm:text-sm">
                Elige cómo quieres practicar
              </p>
            </motion.div>

            {/* Cards grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Golpe de Vista Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleModeSelect("golpe")}
                className="cursor-pointer"
                data-testid="card-mode-golpe"
              >
                <motion.div 
                  className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animation preview */}
                  <div className="flex justify-center mb-3">
                    <GolpeAnimation />
                  </div>
                  
                  {/* Text */}
                  <div className="text-center">
                    <h3 className="text-gray-800 font-semibold text-sm sm:text-base mb-0.5">
                      Golpe de Vista
                    </h3>
                    <p className="text-gray-400 text-[10px] sm:text-xs">
                      Entrena tu campo visual
                    </p>
                  </div>
                  
                  {/* Accent dot */}
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-400" />
                </motion.div>
              </motion.div>

              {/* Desplazamiento Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => handleModeSelect("desplazamiento")}
                className="cursor-pointer"
                data-testid="card-mode-desplazamiento"
              >
                <motion.div 
                  className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-cyan-200 transition-all duration-300"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animation preview */}
                  <div className="flex justify-center mb-3">
                    <DesplazamientoAnimation />
                  </div>
                  
                  {/* Text */}
                  <div className="text-center">
                    <h3 className="text-gray-800 font-semibold text-sm sm:text-base mb-0.5">
                      Desplazamiento
                    </h3>
                    <p className="text-gray-400 text-[10px] sm:text-xs">
                      Lectura continua
                    </p>
                  </div>
                  
                  {/* Accent dot */}
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan-400" />
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
                <span className="inline-block px-3 py-1.5 bg-gray-50 rounded-full text-xs text-gray-500 border border-gray-100">
                  {ejercicio.titulo}
                </span>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 py-2 z-50">
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
            onClick={() => handleNavClick(`/tests/${categoria}`)}
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
            <div className="w-10 h-10 -mt-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-medium">Entrenar</span>
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
