import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Dumbbell, Home, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BottomNavBar } from "@/components/BottomNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

interface EntrenamientoItem {
  id: string;
  categoria: string;
  imageUrl: string | null;
  title: string;
  description: string | null;
  linkUrl: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
}

const cardStyles = [
  { bg: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)", textDark: true },
  { bg: "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6366f1 100%)", textDark: false },
  { bg: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)", textDark: true },
  { bg: "linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0891b2 100%)", textDark: false },
  { bg: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)", textDark: true },
];

const defaultIcons = [
  "https://cdn-icons-png.flaticon.com/512/3588/3588658.png",
  "https://cdn-icons-png.flaticon.com/512/2103/2103633.png",
  "https://cdn-icons-png.flaticon.com/512/3588/3588614.png",
  "https://cdn-icons-png.flaticon.com/512/2693/2693507.png",
  "https://cdn-icons-png.flaticon.com/512/3176/3176267.png",
];

export default function EntrenamientoSelectionPage() {
  const [, setLocation] = useLocation();

  const { data: itemsData, isLoading } = useQuery<{ items: EntrenamientoItem[] }>({
    queryKey: ["/api/entrenamiento", "ninos", "items"],
    queryFn: async () => {
      const res = await fetch(`/api/entrenamiento/ninos/items`);
      return res.json();
    },
  });

  const items = itemsData?.items?.filter(i => i.isActive !== false) || [];

  const handleSelect = (item: EntrenamientoItem) => {
    playCardSound();
    sessionStorage.setItem("selectedEntrenamientoItem", JSON.stringify(item));
    setLocation(`/entrenamiento-edad/${item.id}`);
  };

  const handleNavHome = () => {
    playButtonSound();
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-center px-5 py-3 bg-white sticky top-0 z-50">
        <button 
          onClick={handleNavHome}
          className="absolute left-5 p-2 text-purple-600"
          data-testid="button-home"
        >
          <Home className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center" data-testid="header-logo">
          <svg width="80" height="36" viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a3ffc" />
                <stop offset="100%" stopColor="#00d9ff" />
              </linearGradient>
            </defs>
            <text x="0" y="28" fontSize="32" fontWeight="900" fontFamily="Inter, sans-serif">
              <tspan fill="#8a3ffc">i</tspan>
              <tspan fill="#8a3ffc">Q</tspan>
              <tspan fill="url(#logoGradient)">x</tspan>
            </text>
          </svg>
        </div>
      </header>

      <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="px-5 pt-6 pb-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
              style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
            >
              <Dumbbell className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-black mb-2"
              style={{ color: "#1f2937" }}
            >
              Entrenamientos
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm"
              style={{ color: "#6b7280" }}
            >
              Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas
            </motion.p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay entrenamientos disponibles</p>
            </div>
          ) : (
            items.map((item, index) => {
              const style = cardStyles[index % cardStyles.length];
              const textDark = style.textDark;
              const iconUrl = item.imageUrl || defaultIcons[index % defaultIcons.length];
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08, duration: 0.3 }}
                  onClick={() => handleSelect(item)}
                  className="cursor-pointer"
                  data-testid={`card-entrenamiento-${item.id}`}
                >
                  <motion.div
                    className="relative overflow-hidden rounded-2xl p-4"
                    style={{ 
                      background: style.bg,
                      boxShadow: "0 4px 20px rgba(139, 92, 246, 0.15)",
                      border: textDark ? "1px solid rgba(139, 92, 246, 0.1)" : "none"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                  >
                    <div 
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        background: textDark ? "rgba(139, 92, 246, 0.1)" : "rgba(255,255,255,0.2)",
                        color: textDark ? "#7c3aed" : "white"
                      }}
                    >
                      Entrenamiento
                    </div>
                    
                    <div className="flex items-center gap-3 pt-6">
                      <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 56, height: 56 }}>
                        <img 
                          src={iconUrl} 
                          alt="" 
                          className="drop-shadow-md"
                          style={{ width: 56, height: 56, objectFit: "contain" }} 
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-lg font-bold mb-1"
                          style={{ color: textDark ? "#1f2937" : "white" }}
                        >
                          {item.title}
                        </h3>
                        {item.description && (
                          <p 
                            className="text-sm leading-snug"
                            style={{ color: textDark ? "#6b7280" : "rgba(255,255,255,0.9)" }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      <motion.button
                        className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1"
                        style={{
                          background: textDark ? "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)" : "rgba(255,255,255,0.2)",
                          color: "white",
                          border: textDark ? "none" : "1px solid rgba(255,255,255,0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          playButtonSound(); 
                          handleSelect(item);
                        }}
                      >
                        Iniciar
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
