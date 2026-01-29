import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Check, XCircle, Zap } from "lucide-react";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function NumerosEjercicioPage() {
  const [, navigate] = useLocation();
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [board, setBoard] = useState<number[]>([]);
  const [target, setTarget] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [level, setLevel] = useState(1);
  const [flashingCell, setFlashingCell] = useState<number | null>(null);
  const [flashType, setFlashType] = useState<"correct" | "incorrect" | null>(null);
  const [targetPop, setTargetPop] = useState(false);

  useEffect(() => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    setBoard(shuffleArray(numbers));
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      setGameState("finished");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleStart = useCallback(() => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    setBoard(shuffleArray(numbers));
    setTarget(1);
    setTimeLeft(60);
    setCorrectCount(0);
    setIncorrectCount(0);
    setGameState("playing");
  }, []);

  const handleCellClick = useCallback((num: number, index: number) => {
    if (gameState !== "playing") return;

    if (num === target) {
      setCorrectCount(c => c + 1);
      setFlashingCell(index);
      setFlashType("correct");
      setTargetPop(true);
      
      setTimeout(() => {
        setFlashingCell(null);
        setFlashType(null);
        setTargetPop(false);
      }, 150);

      if (target === 25) {
        setGameState("finished");
        setLevel(l => l + 1);
      } else {
        setTarget(t => t + 1);
      }
    } else {
      setIncorrectCount(c => c + 1);
      setFlashingCell(index);
      setFlashType("incorrect");
      
      setTimeout(() => {
        setFlashingCell(null);
        setFlashType(null);
      }, 200);
    }
  }, [gameState, target]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 flex items-center justify-between text-white">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          data-testid="button-close"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Nivel {level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-green-300" />
            <span>{correctCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-300" />
            <span>{incorrectCount}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <p className="text-gray-700 text-center text-lg mb-4 font-medium">
          Encuentra el siguiente número en el tablero:
        </p>

        <motion.div
          className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          animate={targetPop ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.15 }}
        >
          <span className="text-white text-5xl font-bold" data-testid="text-target">
            {gameState === "finished" ? "✓" : gameState === "idle" ? "?" : target}
          </span>
        </motion.div>

        <div className="grid grid-cols-5 gap-2 mb-8">
          {board.map((num, index) => {
            const isFlashing = flashingCell === index;
            const isCorrectFlash = isFlashing && flashType === "correct";
            const isIncorrectFlash = isFlashing && flashType === "incorrect";
            const isActive = gameState === "playing";
            const isIdle = gameState === "idle" || gameState === "finished";

            return (
              <motion.button
                key={index}
                onClick={() => handleCellClick(num, index)}
                disabled={!isActive}
                className={`
                  w-14 h-14 rounded-xl text-xl font-bold flex items-center justify-center
                  transition-all duration-150 shadow-md
                  ${isIdle ? "bg-gray-300 text-gray-500 cursor-not-allowed" : ""}
                  ${isActive && !isFlashing ? "bg-gradient-to-br from-cyan-400 to-teal-400 text-white hover:from-cyan-500 hover:to-teal-500 cursor-pointer" : ""}
                  ${isCorrectFlash ? "bg-green-400 text-white scale-95" : ""}
                  ${isIncorrectFlash ? "bg-red-500 text-white animate-pulse" : ""}
                `}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isIncorrectFlash ? [1, 0.95, 1.05, 1] : 1, 
                  opacity: 1 
                }}
                transition={{ 
                  duration: isIncorrectFlash ? 0.2 : 0.3, 
                  delay: gameState === "playing" ? index * 0.02 : 0 
                }}
                data-testid={`cell-${num}`}
              >
                {num}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={handleStart}
              className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl rounded-full shadow-lg transition-colors"
              data-testid="button-start"
            >
              Iniciar
            </motion.button>
          )}

          {gameState === "finished" && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center"
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {target > 25 ? "¡Completado!" : "¡Tiempo agotado!"}
                </h2>
                <p className="text-gray-600 mb-4">
                  Encontraste <span className="text-teal-600 font-bold">{correctCount}</span> números correctamente
                </p>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="w-5 h-5" />
                    <span>{correctCount} correctos</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-500">
                    <XCircle className="w-5 h-5" />
                    <span>{incorrectCount} errores</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full transition-colors"
                  data-testid="button-back-result"
                >
                  Volver
                </button>
                <button
                  onClick={handleStart}
                  className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg transition-colors"
                  data-testid="button-retry"
                >
                  Reintentar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
