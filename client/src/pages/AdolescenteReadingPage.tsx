import { useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Plus, Circle, Diamond, Star, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useUserData } from "@/lib/user-context";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ReadingContent {
  pageMainImage?: string;
  pageSmallImage?: string;
  title?: string;
}

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const readings = [
  { id: 1, title: "EUTANASIA", available: true },
  { id: 2, title: "EL HALCÓN COMÚN O PEREGRINO", available: false },
  { id: 3, title: "EL ESTUDIO", available: false },
];

const defaultImages = {
  mainImage: "https://img.freepik.com/free-vector/stock-market-analysis-concept-illustration_114360-1592.jpg",
  smallImage: "https://img.freepik.com/free-vector/cute-hamster-gaming-cartoon-vector-icon-illustration-animal-technology-icon-isolated-flat_138676-9067.jpg",
};

function FloatingElements() {
  const icons = [Plus, DollarSign, Star, Diamond, Circle];
  const colors = ["#FBBF24", "#F472B6", "#22D3EE", "#A78BFA", "#F97316"];
  
  return (
    <>
      {[...Array(15)].map((_, i) => {
        const IconComponent = icons[i % icons.length];
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              color: colors[i % colors.length],
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <IconComponent className="w-5 h-5" />
          </motion.div>
        );
      })}
    </>
  );
}

export default function AdolescenteReadingPage() {
  const [, setLocation] = useLocation();
  const { i18n } = useTranslation();
  const { userData } = useUserData();
  const lang = i18n.language || 'es';

  const { data: contentData, isLoading } = useQuery<{ content: ReadingContent }>({
    queryKey: ["/api/reading/adolescentes", lang],
    queryFn: () => fetch(`/api/reading/adolescentes?tema=1&lang=${lang}`).then(r => r.json()),
  });

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleReadingSelect = useCallback((reading: typeof readings[0]) => {
    if (!reading.available) return;
    playCardSound();
    setLocation("/lectura-contenido");
  }, [setLocation]);

  const content = contentData?.content;
  const mainImage = content?.pageMainImage || defaultImages.mainImage;
  const smallImage = content?.pageSmallImage || defaultImages.smallImage;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{ 
        background: "linear-gradient(180deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)" 
      }}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 px-4 py-4 safe-area-inset"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="rounded-full bg-white/20 backdrop-blur-md border-0"
          data-testid="button-back-adolescente-reading"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
        
        <h1 className="text-xl font-bold text-white" data-testid="text-header-title">
          Test Lectura
        </h1>
      </motion.header>

      <div className="relative flex-1 flex flex-col">
        <div className="relative h-56 flex items-center justify-center overflow-visible">
          <div className="absolute inset-0 text-purple-300/40">
            <FloatingElements />
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="relative z-10 bg-purple-100/90 rounded-3xl p-4"
            style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}
          >
            {isLoading ? (
              <Skeleton className="w-48 h-40 rounded-2xl" />
            ) : (
              <img 
                src={mainImage}
                alt="Ilustración"
                className="w-48 h-40 object-contain"
                data-testid="img-main-illustration"
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, rotate: -10 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
            className="absolute right-4 bottom-0 z-20"
          >
            <motion.div 
              className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/60 bg-white"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <img 
                  src={smallImage}
                  alt="Mascota"
                  className="w-full h-full object-cover"
                  data-testid="img-mascot"
                />
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex-1 bg-white dark:bg-gray-900 rounded-t-[2.5rem] px-5 pt-6 pb-6 shadow-2xl"
          style={{ boxShadow: "0 -10px 40px rgba(0,0,0,0.15)" }}
        >
          <div className="mb-5">
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-purple-500 font-semibold text-sm mb-1"
              data-testid="text-category-label"
            >
              Adolescente
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="text-2xl font-black text-gray-900 dark:text-white"
              data-testid="text-section-title"
            >
              Elige una lectura
            </motion.h2>
          </div>

          <div className="space-y-3">
            {readings.map((reading, index) => (
              <motion.div
                key={reading.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                onClick={() => handleReadingSelect(reading)}
                className={`cursor-pointer ${!reading.available ? 'opacity-60' : ''}`}
                data-testid={`card-reading-${String(reading.id).padStart(2, '0')}`}
              >
                <motion.div
                  className={`rounded-2xl p-4 flex items-center gap-4 ${
                    reading.available 
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 hover-elevate' 
                      : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700'
                  }`}
                  whileTap={reading.available ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.15 }}
                >
                  <span 
                    className="text-3xl font-light"
                    style={{ color: reading.available ? "#7C3AED" : "#9CA3AF" }}
                    data-testid={`text-reading-number-${reading.id}`}
                  >
                    {String(reading.id).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span 
                      className={`text-sm font-bold block ${
                        reading.available 
                          ? 'text-gray-800 dark:text-gray-200' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                      data-testid={`text-reading-title-${reading.id}`}
                    >
                      {reading.title}
                    </span>
                    {!reading.available && (
                      <p className="text-xs text-gray-400 mt-0.5" data-testid={`text-coming-soon-${reading.id}`}>Próximamente</p>
                    )}
                  </div>
                  {reading.available && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
