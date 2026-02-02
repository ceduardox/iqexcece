import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";

interface EntrenamientoPage {
  bannerText: string;
  pageTitle: string;
  pageDescription: string;
}

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

export default function EntrenamientoPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ categoria: string }>();
  const categoria = params.categoria || "ninos";

  const { data: pageData } = useQuery<{ page: EntrenamientoPage }>({
    queryKey: ["/api/entrenamiento", categoria, "page"],
    queryFn: async () => {
      const res = await fetch(`/api/entrenamiento/${categoria}/page`);
      return res.json();
    },
  });

  const { data: itemsData } = useQuery<{ items: EntrenamientoItem[] }>({
    queryKey: ["/api/entrenamiento", categoria, "items"],
    queryFn: async () => {
      const res = await fetch(`/api/entrenamiento/${categoria}/items`);
      return res.json();
    },
  });

  const page = pageData?.page;
  const items = itemsData?.items?.filter(i => i.isActive !== false) || [];

  const handleBack = () => {
    window.history.back();
  };

  const handleItemClick = (item: EntrenamientoItem) => {
    if (item.linkUrl === "velocidad") {
      setLocation(`/velocidad/${categoria}/${item.id}`);
    } else if (item.linkUrl && item.linkUrl.startsWith("/")) {
      setLocation(item.linkUrl);
    } else {
      setLocation(`/entrenamiento/${categoria}/prep/${item.id}`);
    }
  };

  const gradients = [
    "linear-gradient(135deg, #9333EA 0%, #7C3AED 50%, #6366F1 100%)",
    "linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0891B2 100%)",
    "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
    "linear-gradient(135deg, #EC4899 0%, #DB2777 50%, #BE185D 100%)",
    "linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white flex flex-col"
    >
      <CurvedHeader showBack onBack={handleBack} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-3 mx-4 mt-4 rounded-xl"
      >
        <p className="text-white text-sm font-medium text-center">
          {page?.bannerText || "¡Disfruta ahora de ejercicios de entrenamiento gratuitos por tiempo limitado!"}
        </p>
      </motion.div>

      <div className="px-4 py-6 flex-1 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            {page?.pageTitle || "Entrenamientos"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {page?.pageDescription || "Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas"}
          </p>
        </motion.div>

        <div className="space-y-4">
          {items.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>No hay entrenamientos disponibles aún.</p>
              <p className="text-sm mt-2">Los entrenamientos se pueden agregar desde el panel de administración.</p>
            </div>
          )}
          
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleItemClick(item)}
              className="relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ background: gradients[index % gradients.length] }}
              data-testid={`card-entrenamiento-${item.id}`}
            >
              <div className="p-4 flex items-center gap-4">
                {item.imageUrl && (
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white/20">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-white/80 leading-snug">
                      {item.description}
                    </p>
                  )}
                </div>
                
                <ChevronRight className="w-6 h-6 text-white/60 flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <BottomNavBar />
    </motion.div>
  );
}
