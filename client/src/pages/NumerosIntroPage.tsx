import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { CurvedHeader } from "@/components/CurvedHeader";
import { BottomNavBar } from "@/components/BottomNavBar";

interface IntroData {
  id: string;
  titulo: string;
  descripcion: string;
  subtitulo: string;
  imagenCabecera: string | null;
}

function NumerosPreviewAnimation() {
  const [board] = useState(() => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    const shuffled = [...numbers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  
  const [currentTarget, setCurrentTarget] = useState(1);
  const [flashingIndex, setFlashingIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  const findAndFlash = useCallback(() => {
    if (!isAnimating) return;
    
    const targetIdx = board.findIndex(n => n === currentTarget);
    if (targetIdx !== -1) {
      setFlashingIndex(targetIdx);
      
      setTimeout(() => {
        setFlashingIndex(null);
        if (currentTarget < 5) {
          setCurrentTarget(prev => prev + 1);
        } else {
          setTimeout(() => {
            setCurrentTarget(1);
          }, 500);
        }
      }, 400);
    }
  }, [board, currentTarget, isAnimating]);

  useEffect(() => {
    const timer = setTimeout(findAndFlash, 800);
    return () => clearTimeout(timer);
  }, [findAndFlash]);

  return (
    <div className="relative">
      <div className="flex flex-col items-center">
        <motion.div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 shadow-lg"
          style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.5 }}
        >
          <span className="text-white text-xl font-bold">{currentTarget}</span>
        </motion.div>
        
        <div className="grid grid-cols-5 gap-1">
          {board.map((value, index) => {
            const isFlashing = flashingIndex === index;
            const isFound = value < currentTarget;
            
            return (
              <motion.div
                key={index}
                className={`
                  w-7 h-7 rounded text-xs font-bold flex items-center justify-center
                  transition-colors duration-150 shadow-sm border
                  ${isFlashing ? "bg-green-500 text-white border-green-500" : ""}
                  ${isFound && !isFlashing ? "bg-green-100 text-green-600 border-green-200" : ""}
                  ${!isFlashing && !isFound ? "bg-white text-gray-700 border-gray-200" : ""}
                `}
                animate={isFlashing ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                {value}
              </motion.div>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1">
            <span className="text-sm">😊</span>
            <span className="text-xs font-bold text-green-500">{Math.max(0, currentTarget - 1)}</span>
          </div>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #8a3ffc, #06b6d4)" }}
              animate={{ width: `${((currentTarget - 1) / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NumerosIntroPage() {
  const { categoria, itemId } = useParams<{ categoria: string; itemId: string }>();
  const [, setLocation] = useLocation();
  const [introData, setIntroData] = useState<IntroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIntro = async () => {
      try {
        const res = await fetch(`/api/numeros-intro/${itemId}`);
        const data = await res.json();
        if (data.intro) {
          setIntroData(data.intro);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadIntro();
  }, [itemId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const titulo = introData?.titulo || "Identifica rápidamente\nNúmeros y Letras";
  const descripcion = introData?.descripcion || "¡Haz más fuerte tu vista jugando!";
  const subtitulo = introData?.subtitulo || "Identifica el número o letra para ver el mundo más grande";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CurvedHeader showBack onBack={() => setLocation(`/entrenamiento/${categoria}`)} />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 -mt-2">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(6, 182, 212, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="flex flex-col items-center pt-8 pb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
              data-testid="animation-numeros-preview"
            >
              <NumerosPreviewAnimation />
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center space-y-4 px-4"
            >
              <h1 
                className="text-2xl font-bold text-gray-800 leading-tight whitespace-pre-line"
                data-testid="text-numeros-title"
              >
                {titulo}
              </h1>
              
              <p 
                className="text-lg font-semibold"
                style={{ color: "#8a3ffc" }}
                data-testid="text-numeros-subtitle"
              >
                {descripcion}
              </p>
              
              <p 
                className="text-gray-500 text-base max-w-xs mx-auto"
                data-testid="text-numeros-instructions"
              >
                {subtitulo}
              </p>
            </motion.div>

            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              onClick={() => {
                sessionStorage.setItem("numerosItemId", itemId || "");
                sessionStorage.setItem("numerosCategoria", categoria || "");
                sessionStorage.setItem("numerosIntroPath", `/numeros/${categoria}/${itemId}`);
                setLocation(`/numeros/${categoria}/${itemId}/niveles`);
              }}
              className="mt-10 px-12 py-4 text-white font-bold text-xl rounded-lg shadow-lg hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
              data-testid="button-start-numeros"
            >
              Empezar
            </motion.button>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
