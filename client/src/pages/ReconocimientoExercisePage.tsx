import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, ThumbsUp, ThumbsDown, Share2, RotateCcw, X } from "lucide-react";
import { useSounds } from "@/hooks/use-sounds";
import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import { apiRequest } from "@/lib/queryClient";
import html2canvas from "html2canvas";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ROWS = 7;
const COLS = 9;
const CENTER_ROW = 3;
const CENTER_COL = 4;
const TARGET_POSITIONS = [
  { row: 0, col: 4 },
  { row: 3, col: 0 },
  { row: 3, col: 8 },
  { row: 6, col: 4 },
];
const GAME_DURATION = 50;
const MATCH_PROB = 0.25;

function generateRandomLetter(): string {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

function generateCombo(forceMatch: boolean, prevCombo: string[] | null): string[] {
  if (forceMatch && prevCombo) {
    return [...prevCombo];
  }

  const isAllSame = Math.random() > 0.5;
  let combo: string[];

  if (isAllSame) {
    const letter = generateRandomLetter();
    combo = [letter, letter, letter, letter];
  } else {
    const mainLetter = generateRandomLetter();
    let diffLetter = generateRandomLetter();
    while (diffLetter === mainLetter) {
      diffLetter = generateRandomLetter();
    }
    combo = [mainLetter, mainLetter, mainLetter, mainLetter];
    const diffPos = Math.floor(Math.random() * 4);
    combo[diffPos] = diffLetter;
  }

  if (prevCombo && combo.every((l, i) => l === prevCombo[i])) {
    return generateCombo(false, prevCombo);
  }

  return combo;
}

function generateBaseGrid(): string[][] {
  const grid: string[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: string[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(generateRandomLetter());
    }
    grid.push(row);
  }
  return grid;
}

type GameState = "idle" | "running" | "finished";

export default function ReconocimientoExercisePage() {
  const [, navigate] = useLocation();
  const params = useParams<{ categoria: string; itemId: string; nivel: string }>();
  const categoria = params.categoria || "ninos";
  const itemId = params.itemId || "";
  const nivel = parseInt(params.nivel || "1");
  const { playSound } = useSounds();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [baseGrid, setBaseGrid] = useState<string[][]>(() => generateBaseGrid());
  const [currentCombo, setCurrentCombo] = useState<string[]>(() => generateCombo(false, null));
  const [prevCombo, setPrevCombo] = useState<string[] | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const comboRef = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("iq_session_id") : null;
  const isPwa = typeof window !== "undefined" 
    ? window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    : false;

  const saveResultMutation = useMutation({
    mutationFn: async (resultData: any) => {
      return apiRequest("POST", "/api/training-results", resultData);
    }
  });

  const handleBack = () => {
    playSound("iphone");
    if (timerRef.current) clearInterval(timerRef.current);
    if (comboRef.current) clearInterval(comboRef.current);
    window.history.back();
  };

  const handleClose = () => {
    playSound("iphone");
    if (timerRef.current) clearInterval(timerRef.current);
    if (comboRef.current) clearInterval(comboRef.current);
    setGameState("idle");
  };

  const startGame = useCallback(() => {
    playSound("card");
    setGameState("running");
    setTimeLeft(GAME_DURATION);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSkippedCount(0);
    setBaseGrid(generateBaseGrid());
    const initialCombo = generateCombo(false, null);
    setCurrentCombo(initialCombo);
    setPrevCombo(null);
    setHasAnswered(false);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (comboRef.current) clearInterval(comboRef.current);
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    comboRef.current = setInterval(() => {
      setHasAnswered(prev => {
        if (!prev) {
          setSkippedCount(s => s + 1);
        }
        return false;
      });

      setPrevCombo(currentCombo);
      const shouldMatch = Math.random() < MATCH_PROB;
      setCurrentCombo(prev => generateCombo(shouldMatch, prev));
    }, 1000);
  }, [playSound, currentCombo]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (comboRef.current) clearInterval(comboRef.current);
    };
  }, []);

  // Save result when game finishes
  useEffect(() => {
    if (gameState === "finished" && !resultSaved) {
      const totalAnswers = correctCount + incorrectCount;
      const accuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
      
      saveResultMutation.mutate({
        sessionId: sessionId || null,
        categoria,
        tipoEjercicio: "reconocimiento_visual",
        ejercicioTitulo: `Reconocimiento Visual - Nivel ${nivel}`,
        puntaje: accuracy,
        nivelAlcanzado: nivel,
        tiempoSegundos: GAME_DURATION,
        respuestasCorrectas: correctCount,
        respuestasTotales: totalAnswers,
        datosExtra: JSON.stringify({ skippedCount, nivel }),
        isPwa
      });
      setResultSaved(true);
    }
  }, [gameState, resultSaved, correctCount, incorrectCount, skippedCount, nivel, categoria, sessionId, isPwa, saveResultMutation]);

  const handleAnswer = (isEqual: boolean) => {
    if (gameState !== "running" || hasAnswered || !prevCombo) return;
    
    playSound("iphone");
    setHasAnswered(true);

    const actuallyEqual = currentCombo.every((l, i) => l === prevCombo[i]);
    const isCorrect = isEqual === actuallyEqual;

    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setShowFeedback("correct");
    } else {
      setIncorrectCount(c => c + 1);
      setShowFeedback("incorrect");
    }

    setTimeout(() => setShowFeedback(null), 300);
  };

  const handleShare = async () => {
    if (isSharing || !resultsRef.current) return;
    setIsSharing(true);
    playSound("iphone");
    
    const shareText = `Reconocimiento Visual | Nivel: ${nivel} | Correctas: ${correctCount} | Incorrectas: ${incorrectCount} | Sin responder: ${skippedCount}`;
    
    try {
      const logoImg = resultsRef.current.querySelector('img[alt="IQEXPONENCIAL"]') as HTMLImageElement;
      if (logoImg) {
        try {
          const response = await fetch(logoImg.src);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          logoImg.src = base64;
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {
          console.log('Could not convert logo to base64');
        }
      }
      
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png', 1.0);
      });
      
      const file = new File([blob], 'resultado-iqexponencial.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Reconocimiento Visual - IQEXPONENCIAL',
          text: shareText,
          files: [file]
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Reconocimiento Visual - IQEXPONENCIAL',
          text: shareText,
          url: 'https://iqexponencial.app'
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado-iqexponencial.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.log('Share error:', err);
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Reconocimiento Visual - IQEXPONENCIAL',
            text: shareText,
            url: 'https://iqexponencial.app'
          });
        } else {
          await navigator.clipboard.writeText(shareText);
        }
      } catch {
        console.log('Share cancelled');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handlePlayAgain = () => {
    playSound("card");
    setGameState("idle");
    setTimeLeft(GAME_DURATION);
    setBaseGrid(generateBaseGrid());
    setCurrentCombo(generateCombo(false, null));
    setPrevCombo(null);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSkippedCount(0);
    setHasAnswered(false);
    setResultSaved(false);
  };

  const getGridWithCombo = () => {
    const grid = baseGrid.map(row => [...row]);
    TARGET_POSITIONS.forEach((pos, i) => {
      grid[pos.row][pos.col] = currentCombo[i];
    });
    return grid;
  };

  const isTargetPosition = (row: number, col: number) => {
    return TARGET_POSITIONS.some(p => p.row === row && p.col === col);
  };

  const gridData = getGridWithCombo();

  // Calculate performance metrics for results
  const totalAnswers = correctCount + incorrectCount;
  const accuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
  const performancePercent = Math.min(100, accuracy);
  const stars = Math.max(1, Math.min(5, Math.ceil(performancePercent / 20)));
  const circumference = 2 * Math.PI * 58;
  const strokeDashoffset = circumference - (performancePercent / 100) * circumference;

  // Results screen
  if (gameState === "finished") {
    return (
      <div ref={resultsRef} className="min-h-[100dvh] bg-white flex flex-col relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 right-0 h-2"
          style={{ background: "linear-gradient(90deg, #06B6D4 0%, #8B5CF6 50%, #EC4899 100%)" }}
        />
        
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10" style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }} />

        <main className="flex-1 px-6 pt-6 pb-8 flex flex-col relative z-10">
          <motion.div 
            className="mx-auto mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="https://iqexponencial.app/api/images/5e3b7dfb-4bda-42bf-b454-c1fe7d5833e3" 
              alt="IQEXPONENCIAL" 
              className="h-20 object-contain"
            />
          </motion.div>

          <motion.div 
            className="mx-auto mb-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </motion.div>

          <motion.div 
            className="text-center mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-gray-800">
              {performancePercent >= 50 ? "¡Excelente trabajo!" : "¡Sigue practicando!"}
            </h1>
          </motion.div>

          <motion.p 
            className="text-center text-purple-500 font-semibold text-sm uppercase tracking-wide mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Reconocimiento Visual - Nivel {nivel}
          </motion.p>

          <motion.div 
            className="relative mx-auto mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="58" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="58"
                  stroke="url(#progressGradientReco)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeDashoffset }}
                  transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="progressGradientReco" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  className="text-4xl font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {performancePercent}%
                </motion.span>
                <span className="text-gray-400 text-sm">Precisión</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="flex justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex-1 max-w-[90px] bg-green-50 rounded-2xl p-3 text-center border border-green-100">
              <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              <p className="text-green-600 text-xs mt-1">Correctas</p>
            </div>
            <div className="flex-1 max-w-[90px] bg-red-50 rounded-2xl p-3 text-center border border-red-100">
              <p className="text-2xl font-bold text-red-500">{incorrectCount}</p>
              <p className="text-red-500 text-xs mt-1">Incorrectas</p>
            </div>
            <div className="flex-1 max-w-[90px] bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
              <p className="text-2xl font-bold text-gray-500">{skippedCount}</p>
              <p className="text-gray-500 text-xs mt-1">Sin resp.</p>
            </div>
          </motion.div>

          <motion.div 
            className="flex justify-center gap-2 mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.svg
                key={star}
                className={`w-7 h-7 ${star <= stars ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + star * 0.1 }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </motion.svg>
            ))}
          </motion.div>

          <motion.button
            onClick={handleShare}
            disabled={isSharing}
            className="mx-auto mb-4 flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4" />
            {isSharing ? "Compartiendo..." : "Compartir resultado"}
          </motion.button>

          <motion.button
            onClick={handlePlayAgain}
            className="mx-auto py-3 px-8 rounded-xl text-white font-semibold flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            data-testid="button-play-again"
          >
            <RotateCcw className="w-4 h-4" />
            Practicar de nuevo
          </motion.button>
        </main>

        <TrainingNavBar activePage="entrenar" categoria={categoria} />
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header 
        className="relative px-4 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
      >
        <motion.button
          onClick={handleBack}
          className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </motion.button>
        <h1 className="text-white font-semibold text-sm flex-1 text-center">Amplía tu Reconocimiento Visual</h1>
        {gameState === "running" ? (
          <motion.button
            onClick={handleClose}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
            data-testid="button-close"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        ) : (
          <div className="w-9" />
        )}
      </header>

      <div 
        className="flex justify-center gap-2 px-4 py-3 border-b border-gray-100"
        style={{ background: "#f9fafb" }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm">
          <span className="text-gray-500 text-xs uppercase">Nivel</span>
          <span className="text-purple-600 font-bold">{nivel}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm">
          <span className="text-gray-500 text-xs uppercase">Tiempo</span>
          <span className="text-purple-600 font-bold">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl shadow-sm">
          <span className="text-lg">😊</span>
          <span className="text-green-600 font-bold">{correctCount}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl shadow-sm">
          <span className="text-lg">😟</span>
          <span className="text-red-500 font-bold">{incorrectCount}</span>
        </div>
      </div>

      <main className="flex-1 px-4 pb-28 flex flex-col">
        <div className="text-center py-4">
          <h2 className="text-gray-800 font-bold text-base mb-1">
            ¡Descubre los símbolos que cambian y decide si son iguales!
          </h2>
          <p className="text-gray-400 text-xs">
            Cada 1s cambia el "combo" de 4 letras. Sale 4 iguales o 3 iguales + 1 distinta (posición aleatoria).
          </p>
        </div>

        <div 
          className="rounded-2xl p-4 mx-auto transition-colors duration-300"
          style={{ 
            background: gameState === "running" ? "#f5f3ff" : "#f3f4f6",
            border: "1px solid #e5e7eb"
          }}
        >
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {gridData.map((row, r) => 
              row.map((letter, c) => {
                const isCenter = r === CENTER_ROW && c === CENTER_COL;
                
                return (
                  <div
                    key={`${r}-${c}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg"
                    style={{ 
                      background: isCenter ? "transparent" : "#ffffff",
                      border: isCenter ? "none" : "1px solid #e5e7eb"
                    }}
                  >
                    {isCenter ? (
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    ) : (
                      <span className="text-gray-700 text-sm font-semibold">
                        {letter}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-6">
          <motion.button
            onClick={() => handleAnswer(false)}
            disabled={gameState !== "running" || hasAnswered || !prevCombo}
            className="flex-1 max-w-[140px] py-4 rounded-2xl flex flex-col items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
            whileTap={{ scale: 0.95 }}
            data-testid="button-not-equal"
          >
            <ThumbsDown className="w-8 h-8 text-red-500" />
            <span className="text-red-600 text-xs font-medium">No son iguales</span>
          </motion.button>

          <motion.button
            onClick={() => handleAnswer(true)}
            disabled={gameState !== "running" || hasAnswered || !prevCombo}
            className="flex-1 max-w-[140px] py-4 rounded-2xl flex flex-col items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            whileTap={{ scale: 0.95 }}
            data-testid="button-equal"
          >
            <ThumbsUp className="w-8 h-8 text-green-500" />
            <span className="text-green-600 text-xs font-medium">Sí, son iguales</span>
          </motion.button>
        </div>

        {gameState === "idle" && (
          <motion.button
            onClick={startGame}
            className="mt-6 mx-auto py-3 px-10 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            whileTap={{ scale: 0.98 }}
            data-testid="button-start"
          >
            Iniciar <Play className="w-4 h-4" fill="white" />
          </motion.button>
        )}

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  showFeedback === "correct" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {showFeedback === "correct" ? (
                  <ThumbsUp className="w-10 h-10 text-white" />
                ) : (
                  <ThumbsDown className="w-10 h-10 text-white" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <TrainingNavBar activePage="entrenar" categoria={categoria} />
    </div>
  );
}
