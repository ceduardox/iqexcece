import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Home, Brain, BarChart3, Dumbbell } from "lucide-react";
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
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #f8f4ff 0%, #e8f4ff 50%, #ffffff 100%)" }}>
      {/* Header with back button */}
      <header className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="w-10" />
      </header>

      {/* Hero image - smaller */}
      <div className="px-4 mb-4 flex justify-center">
        <motion.img 
          src="https://iqexponencial.app/api/images/c4b16288-7262-4c77-849b-65acfb47d363"
          alt="Aceleración de Lectura"
          className="w-1/2 h-auto rounded-2xl object-cover"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 px-5 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {/* Title */}
            <motion.div 
              className="mb-6 text-center"
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
                className="cursor-pointer"
                data-testid="card-mode-golpe"
              >
                <div 
                  className="relative rounded-2xl p-4 h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white"
                >
                  {/* Gradient only on bottom corners */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1/3 opacity-80"
                    style={{
                      background: "linear-gradient(180deg, transparent 0%, rgba(168, 85, 247, 0.15) 50%, rgba(124, 58, 237, 0.25) 100%)",
                      borderBottomLeftRadius: "1rem",
                      borderBottomRightRadius: "1rem"
                    }}
                  />
                  
                  {/* Icon - larger, no background box */}
                  <div className="relative flex justify-center mb-3">
                    <img 
                      src="https://iqexponencial.app/api/images/4c4e3c88-df96-43fa-aa54-2e8d1fb97634" 
                      alt="Golpe de Vista" 
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  
                  {/* Text */}
                  <div className="relative text-center">
                    <h3 className="text-purple-600 font-bold text-base mb-1">
                      Golpe de Vista
                    </h3>
                    <p className="text-gray-500 text-xs leading-tight">
                      Entrena tu campo visual
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Desplazamiento Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleModeSelect("desplazamiento")}
                className="cursor-pointer"
                data-testid="card-mode-desplazamiento"
              >
                <div 
                  className="relative rounded-2xl p-4 h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white"
                >
                  {/* Gradient only on bottom corners */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1/3 opacity-80"
                    style={{
                      background: "linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.15) 50%, rgba(8, 145, 178, 0.25) 100%)",
                      borderBottomLeftRadius: "1rem",
                      borderBottomRightRadius: "1rem"
                    }}
                  />
                  
                  {/* Icon - larger, no background box */}
                  <div className="relative flex justify-center mb-3">
                    <img 
                      src="https://iqexponencial.app/api/images/9c5d7335-73c7-41cc-a920-d59ae93a78b0" 
                      alt="Desplazamiento" 
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  
                  {/* Text */}
                  <div className="relative text-center">
                    <h3 className="text-cyan-600 font-bold text-base mb-1">
                      Desplazamiento
                    </h3>
                    <p className="text-gray-500 text-xs leading-tight">
                      Practica lectura continua
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={() => handleNavClick("/")}
            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-purple-600 transition-colors"
            data-testid="nav-home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Inicio</span>
          </button>
          <button
            onClick={() => handleNavClick(`/tests/${categoria}`)}
            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-purple-600 transition-colors"
            data-testid="nav-diagnostico"
          >
            <Brain className="w-5 h-5" />
            <span className="text-[10px] font-medium">Diagnóstico</span>
          </button>
          <button
            onClick={() => handleNavClick(`/entrenamiento/${categoria}`)}
            className="flex flex-col items-center gap-1 p-2 text-purple-600"
            data-testid="nav-entrenar"
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] font-medium">Entrenar</span>
          </button>
          <button
            onClick={() => handleNavClick(`/progreso`)}
            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-purple-600 transition-colors"
            data-testid="nav-progreso"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Progreso</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
