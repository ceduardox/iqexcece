import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Dumbbell, Zap, Brain, Eye } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";
import menuCurveImg from "@assets/menu_1769957804819.png";

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const entrenamientos = [
  {
    id: "velocidad",
    title: "Velocidad Visual",
    description: "Mejora tu velocidad de percepción y reacción visual",
    icon: Zap,
    gradient: "linear-gradient(135deg, #8a3ffc 0%, #6b21a8 100%)",
  },
  {
    id: "memoria",
    title: "Memoria",
    description: "Fortalece tu memoria visual y de trabajo",
    icon: Brain,
    gradient: "linear-gradient(135deg, #00d9ff 0%, #0891b2 100%)",
  },
  {
    id: "atencion",
    title: "Atención",
    description: "Entrena tu concentración y enfoque mental",
    icon: Eye,
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
];

export default function EntrenamientoSelectionPage() {
  const [, setLocation] = useLocation();

  const handleSelect = (id: string) => {
    playCardSound();
    setLocation(`/entrenamiento-categoria/${id}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CurvedHeader />
      
      <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
          >
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: "#1f2937" }}>
            Entrenamientos
          </h1>
          <p className="text-sm text-gray-600">
            Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas
          </p>
        </motion.div>

        <div className="space-y-4">
          {entrenamientos.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                onClick={() => handleSelect(item.id)}
                className="cursor-pointer"
                data-testid={`card-entrenamiento-${item.id}`}
              >
                <div 
                  className="rounded-2xl p-5 flex items-center gap-4 shadow-md"
                  style={{ background: item.gradient }}
                >
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-white/80">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
