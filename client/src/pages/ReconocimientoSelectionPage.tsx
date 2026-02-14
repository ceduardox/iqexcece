import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Eye } from "lucide-react";
import { useSounds } from "@/hooks/use-sounds";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import { LanguageButton } from "@/components/LanguageButton";

const letrasNivel1 = ["A", "B", "C", "D"];
const letrasNivel2 = ["M", "N", "O", "P", "Q", "R"];

function LetterCircle({ letters, count }: { letters: string[]; count: number }) {
  const [currentLetters, setCurrentLetters] = useState<string[]>(
    Array(count).fill(null).map((_, i) => letters[i % letters.length])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLetters(
        Array(count).fill(null).map(() => letters[Math.floor(Math.random() * letters.length)])
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [letters, count]);

  const size = 96;
  const radius = 30;
  const center = size / 2;

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div 
        className="absolute inset-0 rounded-full"
        style={{ 
          background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)"
        }}
      />
      
      <svg 
        width={size} 
        height={size} 
        className="absolute inset-0"
      >
        {currentLetters.map((letter, i) => {
          const angle = (360 / count) * i - 90;
          const radian = (angle * Math.PI) / 180;
          const x = center + radius * Math.cos(radian);
          const y = center + radius * Math.sin(radian);
          
          return (
            <motion.text
              key={`${i}-${letter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              x={x}
              y={y}
              fill="white"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {letter}
            </motion.text>
          );
        })}
        
        <circle cx={center} cy={center} r={5} fill="#fbbf24" />
      </svg>
    </div>
  );
}

function AnimatedEye() {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <motion.div
      className="relative w-20 h-20 flex items-center justify-center"
      animate={{ scale: isBlinking ? 0.95 : 1 }}
      transition={{ duration: 0.15 }}
    >
      <div 
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{ 
          background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)",
          boxShadow: "0 8px 24px rgba(124, 58, 237, 0.3)"
        }}
      >
        <motion.div
          animate={{ 
            scaleY: isBlinking ? 0.1 : 1,
            opacity: isBlinking ? 0.5 : 1
          }}
          transition={{ duration: 0.15 }}
        >
          <Eye className="w-10 h-10 text-white" strokeWidth={1.5} />
        </motion.div>
      </div>
      
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-purple-300/50"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

const niveles = [
  { id: 1, letras: letrasNivel1, count: 4 },
  { id: 2, letras: letrasNivel2, count: 6 },
];

export default function ReconocimientoSelectionPage() {
  const [, navigate] = useLocation();
  const params = useParams<{ categoria: string; itemId: string }>();
  const categoria = params.categoria || "ninos";
  const itemId = params.itemId || "";
  const { playSound } = useSounds();
  const { t } = useTranslation();

  const handleBack = () => {
    playSound("iphone");
    navigate(`/entrenamiento`);
  };

  const handleNivelSelect = (nivel: number) => {
    playSound("card");
    navigate(`/reconocimiento/${categoria}/${itemId}/ejercicio/${nivel}`);
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 30%, #ffffff 70%, #f0fdff 100%)"
      }}
    >
      <header className="relative px-4 py-4 flex items-center justify-between md:hidden">
        <motion.button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          style={{ boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </motion.button>
        <LanguageButton />
      </header>

      <div className="relative px-6 mb-6 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedEye />
        </motion.div>
      </div>

      <main className="flex-1 px-5 pb-28 relative">
        <div className="max-w-md mx-auto">
          <motion.div 
            className="mb-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h1 className="text-lg sm:text-xl font-bold text-purple-600">
              {t("reconocimiento_visual.title")}
            </h1>
          </motion.div>
          
          <motion.div 
            className="mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
              {t("reconocimiento_visual.selectLevel")}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              {t("reconocimiento_visual.selectLevelDesc")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 px-2">
            {niveles.map((nivel, index) => (
              <motion.div
                key={nivel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => handleNivelSelect(nivel.id)}
                className="cursor-pointer"
                data-testid={`card-nivel-${nivel.id}`}
              >
                <motion.div 
                  className="relative bg-white rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center"
                  style={{ boxShadow: "0 4px 20px rgba(124, 58, 237, 0.08)" }}
                  whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(124, 58, 237, 0.15)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="mb-3">
                    <LetterCircle letters={nivel.letras} count={nivel.count} />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-gray-800 font-semibold text-xs sm:text-sm">
                      {t("reconocimiento_visual.level")} {nivel.id}
                    </h3>
                  </div>
                  
                  <div 
                    className="absolute bottom-0 left-4 right-4 h-1 rounded-full"
                    style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <TrainingNavBar activePage="entrenar" categoria={categoria} />
    </div>
  );
}
