import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Dumbbell, ChevronRight } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

interface EntrenamientoItem {
  id: string;
  title: string;
  linkUrl: string | null;
}

const categorias = [
  { 
    id: "ninos", 
    label: "Niños", 
    ageRange: "6-11", 
    description: "Atención, lectura y lógica básica.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    iconBg: "linear-gradient(135deg, #CE93D8 0%, #9C27B0 100%)"
  },
  { 
    id: "adolescentes", 
    label: "Adolescentes", 
    ageRange: "12-17", 
    description: "Velocidad, enfoque y memoria.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588658.png",
    iconBg: "linear-gradient(135deg, #B39DDB 0%, #7E57C2 100%)"
  },
  { 
    id: "universitarios", 
    label: "Universitarios", 
    ageRange: "18-25", 
    description: "Productividad, lectura y claridad mental.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4213/4213958.png",
    iconBg: "linear-gradient(135deg, #90CAF9 0%, #1976D2 100%)"
  },
  { 
    id: "profesionales", 
    label: "Profesionales", 
    ageRange: "26-59", 
    description: "Alto rendimiento y concentración.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4213/4213958.png",
    iconBg: "linear-gradient(135deg, #90CAF9 0%, #1976D2 100%)"
  },
  { 
    id: "adulto_mayor", 
    label: "Adulto Mayor", 
    ageRange: "60+", 
    description: "Memoria, agilidad y prevención cognitiva.",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588614.png",
    iconBg: "linear-gradient(135deg, #CE93D8 0%, #8E24AA 100%)"
  },
];

export default function EntrenamientoEdadPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ itemId: string }>();
  const itemId = params.itemId;

  const storedItem = sessionStorage.getItem("selectedEntrenamientoItem");
  const item: EntrenamientoItem | null = storedItem ? JSON.parse(storedItem) : null;

  const handleSelect = (categoriaId: string) => {
    playCardSound();
    
    if (item?.linkUrl === "velocidad") {
      setLocation(`/velocidad/${categoriaId}/${itemId}`);
    } else if (item?.linkUrl && item.linkUrl.startsWith("/")) {
      setLocation(item.linkUrl);
    } else {
      setLocation(`/entrenamiento/${categoriaId}/prep/${itemId}`);
    }
  };

  const handleBack = () => {
    setLocation("/entrenamiento");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CurvedHeader showBack onBack={handleBack} />

      <main className="flex-1 overflow-y-auto pb-20">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <motion.div
            className="px-5 pt-4 pb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
          >
            <div className="flex items-start gap-4 mb-2">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-0.5" style={{ color: "#8a3ffc" }}>
                  {item?.title || "Entrenamiento"}
                </p>
                <h1 
                  className="font-bold mb-1"
                  style={{ fontSize: 22, color: "#5b21b6", fontWeight: 700 }}
                >
                  Selecciona tu etapa
                </h1>
                <p className="leading-relaxed" style={{ fontSize: 13, color: "#9ca3af" }}>
                  Así ajustamos ejercicios y dificultad.
                </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="flex-shrink-0"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)",
                    boxShadow: "0 4px 16px rgba(138, 63, 252, 0.3)"
                  }}
                >
                  <Dumbbell className="w-7 h-7 text-white" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="px-4 pb-4 space-y-2">
            {categorias.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.05, duration: 0.25 }}
                onClick={() => handleSelect(cat.id)}
                className="cursor-pointer"
                data-testid={`card-edad-${cat.id}`}
              >
                <motion.div
                  className="relative overflow-visible rounded-2xl px-3 py-2.5 flex items-center gap-3 transition-all bg-white hover:shadow-md"
                  style={{ 
                    borderRadius: 16,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <div 
                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{ 
                      width: 48, 
                      height: 48,
                      background: cat.iconBg,
                      padding: 6
                    }}
                  >
                    <img 
                      src={cat.iconUrl} 
                      alt="" 
                      className="drop-shadow-sm"
                      style={{ width: 34, height: 34, objectFit: "contain" }} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold leading-tight"
                      style={{ fontSize: 14, color: "#1f2937" }}
                    >
                      {cat.label} <span style={{ color: "#7c3aed", fontWeight: 600 }}>({cat.ageRange})</span>
                    </h3>
                    <p 
                      className="leading-tight mt-0.5"
                      style={{ fontSize: 12, color: "#9ca3af" }}
                    >
                      {cat.description}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
