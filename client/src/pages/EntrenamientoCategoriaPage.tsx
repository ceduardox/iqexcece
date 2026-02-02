import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";
import menuCurveImg from "@assets/menu_1769957804819.png";

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const categorias = [
  { id: "ninos", label: "Niños", sublabel: "6-11 años", icon: "👦" },
  { id: "adolescentes", label: "Adolescentes", sublabel: "12-17 años", icon: "🧑" },
  { id: "universitarios", label: "Universitarios", sublabel: "18-25 años", icon: "🎓" },
  { id: "profesionales", label: "Profesionales", sublabel: "26-59 años", icon: "💼" },
  { id: "adulto_mayor", label: "Adulto Mayor", sublabel: "60+ años", icon: "👴" },
];

const tipoLabels: Record<string, string> = {
  velocidad: "Velocidad Visual",
  memoria: "Memoria",
  atencion: "Atención",
};

export default function EntrenamientoCategoriaPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ tipo: string }>();
  const tipo = params.tipo || "velocidad";

  const handleSelect = (categoriaId: string) => {
    playCardSound();
    setLocation(`/entrenamiento/${categoriaId}`);
  };

  const handleBack = () => {
    setLocation("/entrenamiento");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CurvedHeader showBack onBack={handleBack} />
      
      <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "#8a3ffc" }}>
            {tipoLabels[tipo] || "Entrenamiento"}
          </p>
          <h1 className="text-xl font-bold mb-2" style={{ color: "#1f2937" }}>
            Selecciona tu categoría
          </h1>
          <p className="text-sm text-gray-500">
            Elige tu grupo de edad para contenido personalizado
          </p>
        </motion.div>

        <div className="space-y-3">
          {categorias.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + index * 0.05 }}
              onClick={() => handleSelect(cat.id)}
              className="cursor-pointer"
              data-testid={`categoria-${cat.id}`}
            >
              <div 
                className="rounded-xl p-4 flex items-center gap-4 border-2 border-gray-100 hover:border-purple-300 transition-colors"
                style={{ background: "linear-gradient(135deg, rgba(138, 63, 252, 0.04) 0%, rgba(0, 217, 255, 0.02) 100%)" }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(138, 63, 252, 0.1) 0%, rgba(0, 217, 255, 0.1) 100%)" }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold" style={{ color: "#1f2937" }}>{cat.label}</h3>
                  <p className="text-sm text-gray-500">{cat.sublabel}</p>
                </div>
                <div style={{ color: "#8a3ffc" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
