import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header sticky */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#8a3ffc] to-[#06b6d4] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            {ejercicio?.imagenCabecera && (
              <img 
                src={ejercicio.imagenCabecera} 
                alt="" 
                className="w-10 h-10 object-contain rounded-lg bg-white/10" 
              />
            )}
            <h1 className="text-white font-bold text-lg">
              {ejercicio?.titulo || "Aceleración de Lectura"}
            </h1>
          </div>
        </div>
      </header>

      {/* Curva decorativa */}
      <div className="sticky z-40" style={{ top: "56px" }}>
        <svg viewBox="0 0 400 30" className="w-full h-8 -mb-1">
          <path
            d="M0,0 C100,30 300,30 400,0 L400,30 L0,30 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Contenido */}
      <main className="flex-1 px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Selecciona el Modo
              </h2>
              <p className="text-gray-500">
                Elige cómo quieres practicar la lectura rápida
              </p>
            </div>

            {/* Tarjeta Golpe de Vista */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => handleModeSelect("golpe")}
              className="cursor-pointer"
              data-testid="card-mode-golpe"
            >
              <div className="bg-gradient-to-br from-[#8a3ffc] to-[#6b2ed9] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">👁️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-1">
                      Golpe de Vista
                    </h3>
                    <p className="text-white/80 text-sm">
                      Entrena tu campo visual para capturar más palabras de un vistazo
                    </p>
                  </div>
                  <ChevronLeft className="w-6 h-6 text-white/60 rotate-180" />
                </div>
              </div>
            </motion.div>

            {/* Tarjeta Desplazamiento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleModeSelect("desplazamiento")}
              className="cursor-pointer"
              data-testid="card-mode-desplazamiento"
            >
              <div className="bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">📖</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-1">
                      Desplazamiento
                    </h3>
                    <p className="text-white/80 text-sm">
                      Practica la lectura continua siguiendo el ritmo marcado
                    </p>
                  </div>
                  <ChevronLeft className="w-6 h-6 text-white/60 rotate-180" />
                </div>
              </div>
            </motion.div>

            {/* Info de velocidad */}
            {ejercicio && (
              <div className="bg-gray-50 rounded-xl p-4 mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Velocidad configurada:</span>
                  <span className="font-bold text-[#8a3ffc]">{ejercicio.velocidadPPM} PPM</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Modo Golpe:</span>
                  <span className="font-bold text-[#06b6d4]">{ejercicio.modoGolpePorcentaje}% visible</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
