import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Home, Brain, BarChart3, Dumbbell, Sparkles, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSounds } from "@/hooks/use-sounds";

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background with mesh gradient */}
      <div 
        className="absolute inset-0 -z-10"
        style={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite"
        }}
      />
      
      {/* Floating decorative elements */}
      <motion.div 
        className="absolute top-20 left-4 w-20 h-20 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-40 right-8 w-32 h-32 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        animate={{ y: [0, 20, 0], scale: [1, 0.9, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div 
        className="absolute bottom-40 left-10 w-16 h-16 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Glass overlay */}
      <div className="absolute inset-0 -z-5 backdrop-blur-[100px]" />

      {/* Header with glassmorphism */}
      <header className="relative px-4 py-4 flex items-center justify-between">
        <motion.button
          onClick={handleBack}
          className="w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-lg"
          style={{ background: "rgba(255,255,255,0.25)" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </motion.button>
        
        {/* Sparkle decoration */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-6 h-6 text-white/60" />
        </motion.div>
      </header>

      {/* Hero section with floating image */}
      <div className="relative px-6 mb-2">
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative">
            {/* Glow effect behind image */}
            <div 
              className="absolute inset-0 blur-2xl opacity-60 scale-110"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)" }}
            />
            <motion.img 
              src="https://iqexponencial.app/api/images/855a8501-7a45-48c1-be95-a678a94836b5"
              alt="Aceleración de Lectura"
              className="relative w-36 h-auto rounded-3xl object-cover shadow-2xl border-2 border-white/30"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-5 pb-28 relative">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div 
              className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {/* Title with glass card */}
            <motion.div 
              className="mb-6 text-center p-4 rounded-3xl backdrop-blur-xl border border-white/20"
              style={{ background: "rgba(255,255,255,0.15)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-yellow-300" />
                <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                  Selecciona el Modo
                </h1>
                <Zap className="w-5 h-5 text-yellow-300" />
              </div>
              <p className="text-white/80 text-xs sm:text-sm">
                Elige cómo quieres practicar la lectura rápida
              </p>
            </motion.div>

            {/* Two column cards with glassmorphism */}
            <div className="grid grid-cols-2 gap-4">
              {/* Golpe de Vista Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                onClick={() => handleModeSelect("golpe")}
                className="cursor-pointer"
                data-testid="card-mode-golpe"
              >
                <motion.div 
                  className="relative rounded-3xl p-4 h-full overflow-hidden backdrop-blur-xl border border-white/30 shadow-xl"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite"
                    }}
                  />
                  
                  {/* Icon with glow */}
                  <div className="relative flex justify-center mb-3">
                    <div className="relative">
                      <div 
                        className="absolute inset-0 blur-xl opacity-50"
                        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
                      />
                      <img 
                        src="https://iqexponencial.app/api/images/4c4e3c88-df96-43fa-aa54-2e8d1fb97634" 
                        alt="Golpe de Vista" 
                        className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                      />
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="relative text-center">
                    <h3 className="text-white font-bold text-sm sm:text-base mb-1 drop-shadow-md">
                      Golpe de Vista
                    </h3>
                    <p className="text-white/70 text-[10px] sm:text-xs leading-tight">
                      Entrena tu campo visual
                    </p>
                  </div>
                  
                  {/* Bottom accent line */}
                  <div 
                    className="absolute bottom-0 left-4 right-4 h-1 rounded-full"
                    style={{ background: "linear-gradient(90deg, #a855f7, #7c3aed)" }}
                  />
                </motion.div>
              </motion.div>

              {/* Desplazamiento Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                onClick={() => handleModeSelect("desplazamiento")}
                className="cursor-pointer"
                data-testid="card-mode-desplazamiento"
              >
                <motion.div 
                  className="relative rounded-3xl p-4 h-full overflow-hidden backdrop-blur-xl border border-white/30 shadow-xl"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite"
                    }}
                  />
                  
                  {/* Icon with glow */}
                  <div className="relative flex justify-center mb-3">
                    <div className="relative">
                      <div 
                        className="absolute inset-0 blur-xl opacity-50"
                        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
                      />
                      <img 
                        src="https://iqexponencial.app/api/images/9c5d7335-73c7-41cc-a920-d59ae93a78b0" 
                        alt="Desplazamiento" 
                        className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                      />
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="relative text-center">
                    <h3 className="text-white font-bold text-sm sm:text-base mb-1 drop-shadow-md">
                      Desplazamiento
                    </h3>
                    <p className="text-white/70 text-[10px] sm:text-xs leading-tight">
                      Practica lectura continua
                    </p>
                  </div>
                  
                  {/* Bottom accent line */}
                  <div 
                    className="absolute bottom-0 left-4 right-4 h-1 rounded-full"
                    style={{ background: "linear-gradient(90deg, #06b6d4, #0891b2)" }}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Exercise info badge */}
            {ejercicio?.titulo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex justify-center"
              >
                <div 
                  className="px-4 py-2 rounded-full backdrop-blur-xl border border-white/20 shadow-lg"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <p className="text-white/80 text-xs">
                    <span className="text-white font-medium">{ejercicio.titulo}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Bottom navigation bar with glassmorphism */}
      <nav 
        className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t border-white/20 px-4 py-3 z-50"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        <div className="max-w-md mx-auto flex justify-around items-center">
          <motion.button
            onClick={() => handleNavClick("/")}
            className="flex flex-col items-center gap-1 p-2 text-white/60 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            data-testid="nav-home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Inicio</span>
          </motion.button>
          <motion.button
            onClick={() => handleNavClick(`/tests/${categoria}`)}
            className="flex flex-col items-center gap-1 p-2 text-white/60 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            data-testid="nav-diagnostico"
          >
            <Brain className="w-5 h-5" />
            <span className="text-[10px] font-medium">Diagnóstico</span>
          </motion.button>
          <motion.button
            onClick={() => handleNavClick(`/entrenamiento/${categoria}`)}
            className="flex flex-col items-center gap-1 p-2 text-white relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            data-testid="nav-entrenar"
          >
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-white/30"
              style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}
            >
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium mt-6">Entrenar</span>
          </motion.button>
          <motion.button
            onClick={() => handleNavClick(`/progreso`)}
            className="flex flex-col items-center gap-1 p-2 text-white/60 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            data-testid="nav-progreso"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Progreso</span>
          </motion.button>
        </div>
      </nav>

      {/* CSS animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
