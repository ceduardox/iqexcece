import { useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Home } from "lucide-react";
import { useLocation } from "wouter";
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
  mainImage: "https://img.freepik.com/free-vector/young-man-with-glasses_24877-82111.jpg",
  smallImage: "https://img.freepik.com/free-vector/cute-robot-reading-book-cartoon-vector-icon-illustration-science-education-icon-isolated_138676-5165.jpg",
};

export default function AdolescenteReadingPage() {
  const [, setLocation] = useLocation();
  const { userData } = useUserData();

  const { data: contentData, isLoading } = useQuery<{ content: ReadingContent }>({
    queryKey: ["/api/reading/adolescentes"],
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

  const handleGoHome = useCallback(() => {
    playButtonSound();
    setLocation("/");
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
        background: "linear-gradient(160deg, #7c3aed 0%, #9333ea 30%, #a855f7 70%, #c084fc 100%)" 
      }}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center px-4 py-4 safe-area-inset"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="rounded-2xl bg-white/20 backdrop-blur-md border-0"
          data-testid="button-back-adolescente-reading"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Button>
        
        <h1 className="flex-1 text-center text-xl font-bold text-white pr-12" data-testid="text-header-title">
          Test Lectura
        </h1>
      </motion.header>

      <div className="relative flex-1 flex flex-col">
        <div className="relative h-72 flex items-end justify-center overflow-visible">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="relative z-10"
          >
            {isLoading ? (
              <Skeleton className="w-64 h-64 rounded-full" />
            ) : (
              <img 
                src={mainImage}
                alt="Adolescente"
                className="w-64 h-64 object-contain drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" }}
                data-testid="img-main-character"
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, rotate: -10 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
            className="absolute right-2 bottom-12 z-20"
          >
            <motion.div 
              className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/40 bg-white"
              animate={{ y: [0, -5, 0] }}
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

          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{
                  background: ["#fff", "#fbbf24", "#a78bfa", "#f0abfc"][Math.floor(Math.random() * 4)],
                  opacity: 0.4,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex-1 bg-white dark:bg-gray-900 rounded-t-[2.5rem] px-6 pt-8 pb-8 shadow-2xl"
          style={{ boxShadow: "0 -10px 40px rgba(0,0,0,0.15)" }}
        >
          <div className="mb-6">
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-purple-500 font-semibold text-base mb-1"
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
                className={`cursor-pointer ${!reading.available ? 'opacity-50' : ''}`}
                data-testid={`card-reading-${String(reading.id).padStart(2, '0')}`}
              >
                <motion.div
                  className={`bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 flex items-center gap-5 border-2 ${
                    reading.available 
                      ? 'border-gray-100 dark:border-gray-700' 
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                  whileHover={reading.available ? { scale: 1.02, backgroundColor: "#F3F4F6" } : {}}
                  whileTap={reading.available ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.15 }}
                >
                  <span 
                    className="text-4xl font-thin tracking-tight"
                    style={{ color: reading.available ? "#9333EA" : "#D1D5DB" }}
                    data-testid={`text-reading-number-${reading.id}`}
                  >
                    {String(reading.id).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <span 
                      className={`text-base font-bold ${
                        reading.available 
                          ? 'text-gray-800 dark:text-gray-200' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                      data-testid={`text-reading-title-${reading.id}`}
                    >
                      {reading.title}
                    </span>
                    {!reading.available && (
                      <p className="text-xs text-gray-400 mt-1" data-testid={`text-coming-soon-${reading.id}`}>Próximamente</p>
                    )}
                  </div>
                  {reading.available && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex justify-center"
          >
            <Button
              onClick={handleGoHome}
              className="rounded-full bg-gradient-to-r from-purple-600 to-violet-600"
              data-testid="button-go-home"
            >
              <Home className="w-5 h-5 mr-2" />
              <span>Ir al Inicio</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
