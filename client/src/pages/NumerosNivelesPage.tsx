import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

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
    sessionStorage.setItem("numerosNivelesPath", window.location.pathname);
    navigate("/numeros-ejercicio");
  };

  const activeNiveles = niveles.filter(n => n.activo);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header 
        className="sticky top-0 z-50 w-full"
        style={{
          background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
        }}
      >
        <div className="relative pt-3 pb-2 px-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 2px 8px rgba(138, 63, 252, 0.15)",
              }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#8a3ffc" }} />
            </button>
            
            <div className="flex items-center justify-center">
              <img src={LOGO_URL} alt="iQx" className="h-10 w-auto object-contain" />
            </div>
            
            <div className="w-10" />
          </div>
        </div>
      </header>

      <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(6, 182, 212, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="flex flex-col items-center pt-4 pb-4 px-4">
            {introData?.imagenCabecera && (
              <motion.img
                src={introData.imagenCabecera}
                alt="Cerebro"
                className="w-32 h-32 object-contain mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            <h1 className="text-xl font-bold text-gray-800 text-center mb-2 whitespace-pre-line">
              {introData?.titulo || "Identifica rápidamente\nNúmeros y Letras"}
            </h1>

            <p className="text-gray-500 text-center mt-2">
              Elige un nivel:
            </p>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className={`grid gap-3 ${activeNiveles.length === 3 ? 'grid-cols-2' : activeNiveles.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {activeNiveles.slice(0, 2).map((nivel, idx) => (
              <motion.button
                key={nivel.id}
                onClick={() => handleSelectNivel(nivel.id)}
                className="bg-white border border-gray-200 hover:border-purple-400 rounded-lg p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                data-testid={`button-nivel-${nivel.id}`}
              >
                {nivel.icono ? (
                  <img src={nivel.icono} alt={nivel.nombre} className="w-16 h-16 object-contain mb-3" />
                ) : (
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
                  >
                    <span className="text-white text-xl font-bold">
                      {nivel.id === "numeros" ? "123" : nivel.id === "letras" ? "ABC" : "XII"}
                    </span>
                  </div>
                )}
                <span className="text-gray-800 font-semibold text-base">{nivel.nombre}</span>
              </motion.button>
            ))}
          </div>

          {activeNiveles.length >= 3 && (
            <div className="flex justify-center mt-3">
              <motion.button
                onClick={() => handleSelectNivel(activeNiveles[2].id)}
                className="bg-white border border-gray-200 hover:border-purple-400 rounded-lg p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all w-1/2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                data-testid={`button-nivel-${activeNiveles[2].id}`}
              >
                {activeNiveles[2].icono ? (
                  <img src={activeNiveles[2].icono} alt={activeNiveles[2].nombre} className="w-16 h-16 object-contain mb-3" />
                ) : (
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
                  >
                    <span className="text-white text-xl font-bold">XII</span>
                  </div>
                )}
                <span className="text-gray-800 font-semibold text-base">{activeNiveles[2].nombre}</span>
              </motion.button>
            </div>
          )}
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
