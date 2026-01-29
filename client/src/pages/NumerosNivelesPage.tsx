import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface NivelConfig {
  id: string;
  nombre: string;
  icono: string;
  activo: boolean;
}

export default function NumerosNivelesPage() {
  const [, navigate] = useLocation();
  const [introData, setIntroData] = useState<any>(null);
  const [niveles, setNiveles] = useState<NivelConfig[]>([
    { id: "numeros", nombre: "Números", icono: "", activo: true },
    { id: "letras", nombre: "Letras", icono: "", activo: true },
    { id: "romanos", nombre: "Romanos", icono: "", activo: true }
  ]);

  useEffect(() => {
    const itemId = sessionStorage.getItem("numerosItemId");
    if (itemId) {
      fetch(`/api/numeros-intro/${itemId}`)
        .then(res => res.json())
        .then(data => {
          if (data.intro) {
            setIntroData(data.intro);
            if (data.intro.niveles) {
              try {
                const parsed = JSON.parse(data.intro.niveles);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setNiveles(parsed);
                }
              } catch (e) {}
            }
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleSelectNivel = (nivelId: string) => {
    sessionStorage.setItem("numerosNivelSeleccionado", nivelId);
    navigate("/numeros-ejercicio");
  };

  const activeNiveles = niveles.filter(n => n.activo);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-emerald-600 flex flex-col">
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
        data-testid="button-back"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      <div className="flex-1 flex flex-col items-center pt-8 pb-6 px-4">
        {introData?.imagenCabecera && (
          <motion.img
            src={introData.imagenCabecera}
            alt="Cerebro"
            className="w-40 h-40 object-contain mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-t-[40px] w-full max-w-md flex-1 px-6 py-8 mt-4"
        >
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2 whitespace-pre-line">
            {introData?.titulo || "Identifica rápidamente\nNúmeros y Letras"}
          </h1>

          <p className="text-gray-600 text-center mt-6 mb-4">
            Elige un nivel:
          </p>

          <div className={`grid gap-4 mt-4 ${activeNiveles.length === 3 ? 'grid-cols-2' : activeNiveles.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {activeNiveles.slice(0, 2).map((nivel, idx) => (
              <motion.button
                key={nivel.id}
                onClick={() => handleSelectNivel(nivel.id)}
                className="bg-gray-50 hover:bg-teal-50 border-2 border-gray-200 hover:border-teal-300 rounded-2xl p-6 flex flex-col items-center justify-center transition-all"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid={`button-nivel-${nivel.id}`}
              >
                {nivel.icono ? (
                  <img src={nivel.icono} alt={nivel.nombre} className="w-20 h-20 object-contain mb-3" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-teal-100 border-2 border-teal-300 flex items-center justify-center mb-3">
                    <span className="text-teal-600 text-2xl font-bold">
                      {nivel.id === "numeros" ? "123" : nivel.id === "letras" ? "ABC" : "XII"}
                    </span>
                  </div>
                )}
                <span className="text-gray-700 font-medium text-lg">{nivel.nombre}</span>
              </motion.button>
            ))}
          </div>

          {activeNiveles.length >= 3 && (
            <div className="flex justify-center mt-4">
              <motion.button
                onClick={() => handleSelectNivel(activeNiveles[2].id)}
                className="bg-gray-50 hover:bg-teal-50 border-2 border-gray-200 hover:border-teal-300 rounded-2xl p-6 flex flex-col items-center justify-center transition-all w-1/2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid={`button-nivel-${activeNiveles[2].id}`}
              >
                {activeNiveles[2].icono ? (
                  <img src={activeNiveles[2].icono} alt={activeNiveles[2].nombre} className="w-20 h-20 object-contain mb-3" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-teal-100 border-2 border-teal-300 flex items-center justify-center mb-3">
                    <span className="text-teal-600 text-2xl font-bold">XII</span>
                  </div>
                )}
                <span className="text-gray-700 font-medium text-lg">{activeNiveles[2].nombre}</span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
