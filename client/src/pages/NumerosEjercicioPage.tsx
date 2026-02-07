import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";

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

  const saveTrainingResult = (correctas: number, incorrectas: number, tiempoUsado: number) => {
    const sessionId = localStorage.getItem("iq_session_id");
    const isPwa = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const storedPath = sessionStorage.getItem("numerosNivelesPath") || "";
    const cat = storedPath.split("/")[2] || "ninos";
    const total = correctas + incorrectas;
    fetch("/api/training-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId || null,
        categoria: cat,
        tipoEjercicio: "numeros",
        ejercicioTitulo: `Números - ${getNivelNombre()}`,
        puntaje: total > 0 ? Math.round((correctas / total) * 100) : 0,
        nivelAlcanzado: correctas,
        tiempoSegundos: tiempoUsado,
        respuestasCorrectas: correctas,
        respuestasTotales: total,
        isPwa,
      }),
    }).catch(e => console.error("Error saving training result:", e));
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
      saveTrainingResult(correctCount, incorrectCount, 60);
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
        saveTrainingResult(correctCount + 1, incorrectCount, 60 - timeLeft);
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
    <div className="min-h-screen bg-white flex flex-col">
      <header 
        className="px-4 py-3"
        style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white text-base font-bold leading-tight flex-1 text-center">
            Identifica rápidamente Números y Letras
          </h1>
          <button
            onClick={() => navigate(nivelesPath)}
            className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"
            data-testid="button-close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      <div className="mx-4 bg-white rounded-xl shadow-lg px-4 py-3 -mt-2 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <div className="text-center">
            <span className="text-gray-400 block text-[10px]">NIVEL</span>
            <span className="font-bold text-gray-800">{getNivelNombre()}</span>
          </div>
          <div className="text-center">
            <span className="text-gray-400 block text-[10px]">TIEMPO</span>
            <span className="font-bold text-purple-600">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg">😊</span>
            <span className="font-bold text-green-500">{correctCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg">😢</span>
            <span className="font-bold text-red-500">{incorrectCount}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <p className="text-gray-600 text-center text-base mb-4 font-medium">
          {getInstructionText()}
        </p>

        <motion.div
          className="w-20 h-20 rounded-lg flex items-center justify-center mb-6 shadow-lg"
          style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
          animate={targetPop ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.15 }}
        >
          <span className="text-white text-4xl font-bold" data-testid="text-target">
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
              <button
                key={index}
                onClick={() => handleCellClick(value, index)}
                disabled={!isActive}
                className={`
                  w-14 h-14 rounded-lg text-xl font-bold flex items-center justify-center
                  transition-all duration-150 shadow-sm border
                  ${isIdle ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : ""}
                  ${isActive && !isFlashing ? "bg-white text-gray-800 border-gray-200 hover:border-purple-400 hover:shadow-md cursor-pointer" : ""}
                  ${isCorrectFlash ? "bg-green-500 text-white border-green-500 scale-95" : ""}
                  ${isIncorrectFlash ? "bg-red-500 text-white border-red-500" : ""}
                `}
                data-testid={`cell-${value}`}
              >
                {value}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {gameState === "idle" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleStart}
              className="px-10 py-4 text-white font-bold text-xl rounded-lg shadow-lg flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
              data-testid="button-start"
            >
              Iniciar
              <Play className="w-5 h-5 fill-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
