import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Dumbbell, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";
import menuCurveImg from "@assets/menu_1769957804819.png";

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
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

const gradients = [
  "linear-gradient(135deg, #9333EA 0%, #7C3AED 50%, #6366F1 100%)",
  "linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0891B2 100%)",
  "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
  "linear-gradient(135deg, #EC4899 0%, #DB2777 50%, #BE185D 100%)",
  "linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)",
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

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay entrenamientos disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                onClick={() => handleSelect(item)}
                className="cursor-pointer"
                data-testid={`card-entrenamiento-${item.id}`}
              >
                <div 
                  className="rounded-2xl p-4 flex items-center gap-4 shadow-md"
                  style={{ background: gradients[index % gradients.length] }}
                >
                  {item.imageUrl ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/20">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-white/80 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/70 flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
