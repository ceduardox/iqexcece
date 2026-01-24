import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const categoryLabels: Record<string, string> = {
  preescolar: "Pre escolar",
  ninos: "Niños",
};

const readingContent: Record<string, { title: string; text: string }> = {
  preescolar: {
    title: "Paseando con mi perrito",
    text: "Mariana tiene un perrito de color café llamado Balu, lo saca a pasear todos los días al parque que esta frente su casa, un día se le escapo, estaba asustada y lloro llego hasta el kiosco y el señor le devolvió a su perrito.",
  },
  ninos: {
    title: "La aventura del explorador",
    text: "Carlos era un niño muy curioso que soñaba con ser explorador. Un día encontró un mapa antiguo en el ático de su abuela. Siguió las pistas por el jardín hasta descubrir un cofre enterrado con monedas antiguas y una carta de su bisabuelo.",
  },
};

export default function ReadingContentPage() {
  const [, setLocation] = useLocation();
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState<"lectura" | "cuestionario">("lectura");
  const [readingTime, setReadingTime] = useState(0);
  const [questionTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "lectura") {
        setReadingTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleClose = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleGoToQuestionnaire = useCallback(() => {
    playButtonSound();
    setActiveTab("cuestionario");
  }, []);

  const categoryLabel = categoryLabels[userData.childCategory || "preescolar"] || "Pre escolar";
  const content = readingContent[userData.childCategory || "preescolar"] || readingContent.preescolar;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-gray-50 dark:bg-background"
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-5 py-4"
        style={{ background: "linear-gradient(135deg, #E879F9 0%, #D946EF 50%, #C026D3 100%)" }}
      >
        <h1 className="text-xl font-bold text-white">
          Test Lectura
        </h1>
        <motion.button
          onClick={handleClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
          whileTap={{ scale: 0.9 }}
          data-testid="button-close-reading"
        >
          <X className="w-6 h-6" />
        </motion.button>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex"
      >
        <button
          onClick={() => setActiveTab("lectura")}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            activeTab === "lectura" 
              ? "bg-purple-600 text-white" 
              : "bg-purple-400 text-white/80"
          }`}
          data-testid="tab-lectura"
        >
          LECTURA
        </button>
        <button
          onClick={() => setActiveTab("cuestionario")}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            activeTab === "cuestionario" 
              ? "bg-purple-600 text-white" 
              : "bg-purple-400 text-white/80"
          }`}
          data-testid="tab-cuestionario"
        >
          CUESTIONARIO
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-4 text-white text-xs font-medium"
        style={{ background: "linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)" }}
      >
        <div className="py-3 px-2 text-center">
          <div className="text-white/70 text-[10px] mb-0.5">CATEGORÍA</div>
          <div className="font-bold">{categoryLabel}</div>
        </div>
        <div className="py-3 px-2 text-center">
          <div className="text-white/70 text-[10px] mb-0.5">TIEMPO</div>
          <div className="font-bold">{formatTime(readingTime)}</div>
        </div>
        <div className="py-3 px-2 text-center">
          <div className="text-white/70 text-[10px] mb-0.5">TIEMPO</div>
          <div className="font-bold">{formatTime(questionTime)}</div>
        </div>
        <div className="py-3 px-2 text-center">
          <div className="text-white/70 text-[10px] mb-0.5">PREGUNTAS</div>
          <div className="font-bold">0 / 4</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 px-6 py-8"
      >
        {activeTab === "lectura" ? (
          <div className="space-y-6">
            <div className="text-center">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-purple-600 dark:text-purple-400 font-bold text-sm tracking-wide"
              >
                LECTURA
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black text-gray-900 dark:text-white mt-2"
              >
                {content.title}
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed"
            >
              {content.text}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleGoToQuestionnaire}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 mt-8"
              style={{ background: "linear-gradient(135deg, #EA580C 0%, #F97316 100%)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid="button-go-questionnaire"
            >
              Ir a cuestionario
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Cuestionario
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Próximamente...
              </p>
            </motion.div>
          </div>
        )}
      </motion.div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${30 + Math.random() * 50}%`,
              backgroundColor: ["#FFD700", "#FF69B4", "#00CED1", "#98FB98", "#FFA500", "#DDA0DD"][i],
              opacity: 0.15,
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
