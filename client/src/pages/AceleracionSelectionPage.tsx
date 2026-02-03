import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #f8f4ff 0%, #e8f4ff 50%, #ffffff 100%)" }}>
      {/* Header */}
      <header className="px-4 py-4">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 px-5 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {/* Title */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold text-gray-800">
                Selecciona el Modo
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Elige cómo quieres practicar la lectura rápida
              </p>
            </motion.div>

            {/* Two column cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Golpe de Vista Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleModeSelect("golpe")}
                className="cursor-pointer group"
                data-testid="card-mode-golpe"
              >
                <div 
                  className="relative rounded-2xl p-4 h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6366f1 100%)"
                  }}
                >
                  {/* Decorative overlay */}
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)"
                    }}
                  />
                  
                  {/* Icon container */}
                  <div className="relative flex justify-center mb-3">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
                      <img 
                        src="https://iqexponencial.app/api/images/4c4e3c88-df96-43fa-aa54-2e8d1fb97634" 
                        alt="Golpe de Vista" 
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="relative text-center">
                    <h3 className="text-white font-bold text-base mb-1">
                      Golpe de Vista
                    </h3>
                    <p className="text-white/80 text-xs leading-tight">
                      Entrena tu campo visual
                    </p>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="relative flex justify-center mt-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Desplazamiento Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleModeSelect("desplazamiento")}
                className="cursor-pointer group"
                data-testid="card-mode-desplazamiento"
              >
                <div 
                  className="relative rounded-2xl p-4 h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)"
                  }}
                >
                  {/* Decorative overlay */}
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)"
                    }}
                  />
                  
                  {/* Icon container */}
                  <div className="relative flex justify-center mb-3">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
                      <img 
                        src="https://iqexponencial.app/api/images/9c5d7335-73c7-41cc-a920-d59ae93a78b0" 
                        alt="Desplazamiento" 
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="relative text-center">
                    <h3 className="text-white font-bold text-base mb-1">
                      Desplazamiento
                    </h3>
                    <p className="text-white/80 text-xs leading-tight">
                      Practica lectura continua
                    </p>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="relative flex justify-center mt-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Exercise title info */}
            {ejercicio?.titulo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-center"
              >
                <p className="text-gray-400 text-xs">
                  Ejercicio: <span className="text-gray-600 font-medium">{ejercicio.titulo}</span>
                </p>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
