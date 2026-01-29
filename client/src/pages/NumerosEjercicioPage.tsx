import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");
const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV"];

export default function NumerosEjercicioPage() {
  const [, navigate] = useLocation();
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [board, setBoard] = useState<(number | string)[]>([]);
  const [targetIndex, setTargetIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [flashingCell, setFlashingCell] = useState<number | null>(null);
  const [flashType, setFlashType] = useState<"correct" | "incorrect" | null>(null);
  const [targetPop, setTargetPop] = useState(false);
  const [nivelesPath, setNivelesPath] = useState("/");
  const [nivel, setNivel] = useState<"numeros" | "letras" | "romanos">("numeros");

  const getNivelNombre = () => {
    switch (nivel) {
      case "numeros": return "Números";
      case "letras": return "Letras";
      case "romanos": return "Romanos";
      default: return "Números";
    }
  };

  const getTargetDisplay = () => {
    if (gameState === "finished") return "✓";
    if (gameState === "idle") return "?";
    
    if (nivel === "numeros") {
      return targetIndex + 1;
    } else if (nivel === "letras") {
      return LETTERS[targetIndex];
    } else if (nivel === "romanos") {
      return ROMANOS[targetIndex];
    }
    return targetIndex + 1;
  };

  const getInstructionText = () => {
    if (nivel === "letras") {
      return "Encuentra la siguiente letra en el tablero:";
    }
    return "Encuentra el siguiente número en el tablero:";
  };

  useEffect(() => {
    const storedNivel = sessionStorage.getItem("numerosNivelSeleccionado");
    if (storedNivel === "letras" || storedNivel === "romanos" || storedNivel === "numeros") {
      setNivel(storedNivel);
    }
    
    const storedPath = sessionStorage.getItem("numerosNivelesPath");
    if (storedPath) {
      setNivelesPath(storedPath);
    }

    if (storedNivel === "letras") {
      setBoard(shuffleArray([...LETTERS]));
    } else if (storedNivel === "romanos") {
      setBoard(shuffleArray([...ROMANOS]));
    } else {
      const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
      setBoard(shuffleArray(numbers));
    }
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      const sinResponder = 25 - targetIndex - 1;
      sessionStorage.setItem("numerosResultados", JSON.stringify({
        correctas: correctCount,
        incorrectas: incorrectCount,
        sinResponder: sinResponder > 0 ? sinResponder : 0,
        tiempo: 60,
        nivel: getNivelNombre()
      }));
      navigate("/numeros-resultado");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, targetIndex, correctCount, incorrectCount, navigate, nivel]);

  const handleStart = useCallback(() => {
    if (nivel === "letras") {
      setBoard(shuffleArray([...LETTERS]));
    } else if (nivel === "romanos") {
      setBoard(shuffleArray([...ROMANOS]));
    } else {
      const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
      setBoard(shuffleArray(numbers));
    }
    setTargetIndex(0);
    setTimeLeft(60);
    setCorrectCount(0);
    setIncorrectCount(0);
    setGameState("playing");
  }, [nivel]);

  const handleCellClick = useCallback((value: number | string, index: number) => {
    if (gameState !== "playing") return;

    let isCorrect = false;
    if (nivel === "numeros") {
      isCorrect = value === targetIndex + 1;
    } else if (nivel === "letras") {
      isCorrect = value === LETTERS[targetIndex];
    } else if (nivel === "romanos") {
      isCorrect = value === ROMANOS[targetIndex];
    }

    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setFlashingCell(index);
      setFlashType("correct");
      setTargetPop(true);
      
      setTimeout(() => {
        setFlashingCell(null);
        setFlashType(null);
        setTargetPop(false);
      }, 150);

      if (targetIndex === 24) {
        sessionStorage.setItem("numerosResultados", JSON.stringify({
          correctas: correctCount + 1,
          incorrectas: incorrectCount,
          sinResponder: 0,
          tiempo: 60 - timeLeft,
          nivel: getNivelNombre()
        }));
        navigate("/numeros-resultado");
      } else {
        setTargetIndex(t => t + 1);
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
  }, [gameState, targetIndex, nivel, correctCount, incorrectCount, timeLeft, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold leading-tight">
            Identifica rápidamente<br/>Números y Letras
          </h1>
          <button
            onClick={() => navigate(nivelesPath)}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            data-testid="button-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="bg-teal-600/50 rounded-full px-4 py-2 flex items-center justify-between text-xs">
          <div className="text-center">
            <span className="text-white/70 block text-[10px]">NIVEL</span>
            <span className="font-bold">{getNivelNombre()}</span>
          </div>
          <div className="text-center">
            <span className="text-white/70 block text-[10px]">TIEMPO</span>
            <span className="font-bold">{timeLeft}s 😊</span>
          </div>
          <div className="text-center">
            <span className="text-white/70 block text-[10px]">CORRECTOS</span>
            <span className="font-bold">{correctCount}</span>
          </div>
          <div className="text-center">
            <span className="text-white/70 block text-[10px]">INCORRECTOS</span>
            <span className="font-bold">{incorrectCount}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <p className="text-gray-700 text-center text-lg mb-4 font-medium">
          {getInstructionText()}
        </p>

        <motion.div
          className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          animate={targetPop ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.15 }}
        >
          <span className="text-white text-5xl font-bold" data-testid="text-target">
            {getTargetDisplay()}
          </span>
        </motion.div>

        <div className="grid grid-cols-5 gap-2 mb-8">
          {board.map((value, index) => {
            const isFlashing = flashingCell === index;
            const isCorrectFlash = isFlashing && flashType === "correct";
            const isIncorrectFlash = isFlashing && flashType === "incorrect";
            const isActive = gameState === "playing";
            const isIdle = gameState === "idle" || gameState === "finished";

            return (
              <motion.button
                key={index}
                onClick={() => handleCellClick(value, index)}
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
                data-testid={`cell-${value}`}
              >
                {value}
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
        </AnimatePresence>
      </main>
    </div>
  );
}
