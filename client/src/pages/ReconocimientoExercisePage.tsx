import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, ThumbsUp, ThumbsDown, Share2, RotateCcw } from "lucide-react";
import { useSounds } from "@/hooks/use-sounds";
import { useState, useEffect, useCallback, useRef } from "react";
import { TrainingNavBar } from "@/components/TrainingNavBar";

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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const comboRef = useRef<NodeJS.Timeout | null>(null);

  const handleBack = () => {
    playSound("iphone");
    if (timerRef.current) clearInterval(timerRef.current);
    if (comboRef.current) clearInterval(comboRef.current);
    window.history.back();
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
    playSound("iphone");
    const text = `Reconocimiento Visual | Nivel: ${nivel} | Correctas: ${correctCount} | Incorrectas: ${incorrectCount} | Sin responder: ${skippedCount} | Tiempo: ${GAME_DURATION}s`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: "Reconocimiento Visual", text });
      } catch (e) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(text);
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

  if (gameState === "finished") {
    return (
      <div 
        className="min-h-screen flex flex-col"
        style={{ background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 50%, #f0fdff 100%)" }}
      >
        <header className="relative px-4 py-4 flex items-center">
          <motion.button
            onClick={handleBack}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
            style={{ boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5 text-purple-600" />
          </motion.button>
        </header>

        <main className="flex-1 px-5 pb-28 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm text-center"
            style={{ boxShadow: "0 8px 32px rgba(124, 58, 237, 0.12)" }}
          >
            <h1 className="text-xl font-bold text-purple-600 mb-2">
              Reconocimiento Visual
            </h1>
            <p className="text-gray-500 text-sm mb-6">Nivel {nivel}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-2xl p-3">
                <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                <p className="text-xs text-green-600">Correctas</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-3">
                <p className="text-2xl font-bold text-red-500">{incorrectCount}</p>
                <p className="text-xs text-red-500">Incorrectas</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-2xl font-bold text-gray-500">{skippedCount}</p>
                <p className="text-xs text-gray-500">Sin responder</p>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={handleShare}
                className="flex-1 py-3 rounded-xl border-2 border-purple-200 text-purple-600 font-semibold flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </motion.button>
              <motion.button
                onClick={handlePlayAgain}
                className="flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                whileTap={{ scale: 0.98 }}
                data-testid="button-play-again"
              >
                <RotateCcw className="w-4 h-4" />
                De nuevo
              </motion.button>
            </div>
          </motion.div>
        </main>

        <TrainingNavBar activePage="entrenar" categoria={categoria} />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #7c3aed 0%, #a855f7 100%)" }}
    >
      <header className="relative px-4 py-3 flex items-center justify-between">
        <motion.button
          onClick={handleBack}
          className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </motion.button>
        <h1 className="text-white font-semibold text-sm">Amplía tu Reconocimiento Visual</h1>
        <div className="w-9" />
      </header>

      <div className="flex justify-center gap-4 px-4 py-2">
        <div className="text-center">
          <p className="text-white/70 text-[10px] uppercase">Nivel</p>
          <p className="text-white font-bold text-lg">{nivel}</p>
        </div>
        <div className="text-center">
          <p className="text-white/70 text-[10px] uppercase">Tiempo</p>
          <p className="text-white font-bold text-lg">{timeLeft}s</p>
        </div>
        <div className="text-center">
          <p className="text-white/70 text-[10px] uppercase">Correctos</p>
          <p className="text-white font-bold text-lg flex items-center gap-1">
            <span className="text-green-300">✓</span> {correctCount}
          </p>
        </div>
        <div className="text-center">
          <p className="text-white/70 text-[10px] uppercase">Incorrectos</p>
          <p className="text-white font-bold text-lg flex items-center gap-1">
            <span className="text-red-300">✗</span> {incorrectCount}
          </p>
        </div>
      </div>

      <main className="flex-1 px-4 pb-28 flex flex-col">
        <div className="text-center mb-3">
          <h2 className="text-white font-bold text-base">
            ¡Descubre los símbolos que cambian y decide si son iguales!
          </h2>
          <p className="text-white/70 text-xs mt-1">
            Cada 1s cambia el "combo" de 4 letras. Sale 4 iguales o 3 iguales + 1 distinta.
          </p>
        </div>

        <div 
          className="rounded-2xl p-3 mx-auto transition-colors duration-300"
          style={{ 
            background: gameState === "running" ? "#d8b4fe" : "#e5e7eb",
            maxWidth: "320px"
          }}
        >
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {gridData.map((row, r) => 
              row.map((letter, c) => {
                const isCenter = r === CENTER_ROW && c === CENTER_COL;
                const isTarget = isTargetPosition(r, c);
                
                return (
                  <div
                    key={`${r}-${c}`}
                    className="w-7 h-7 flex items-center justify-center text-xs font-bold"
                  >
                    {isCenter ? (
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    ) : (
                      <motion.span
                        key={isTarget ? `${r}-${c}-${letter}` : `${r}-${c}`}
                        initial={isTarget ? { scale: 0.8, opacity: 0 } : false}
                        animate={isTarget ? { scale: 1, opacity: 1 } : {}}
                        className={isTarget ? "text-purple-700" : "text-gray-600"}
                      >
                        {letter}
                      </motion.span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-4">
          <motion.button
            onClick={() => handleAnswer(false)}
            disabled={gameState !== "running" || hasAnswered || !prevCombo}
            className="flex-1 max-w-[140px] py-3 rounded-2xl flex flex-col items-center justify-center gap-1 disabled:opacity-50"
            style={{ background: "rgba(239, 68, 68, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            data-testid="button-not-equal"
          >
            <ThumbsDown className="w-6 h-6 text-red-500" />
            <span className="text-red-600 text-xs font-medium">No son iguales</span>
          </motion.button>

          <motion.button
            onClick={() => handleAnswer(true)}
            disabled={gameState !== "running" || hasAnswered || !prevCombo}
            className="flex-1 max-w-[140px] py-3 rounded-2xl flex flex-col items-center justify-center gap-1 disabled:opacity-50"
            style={{ background: "rgba(34, 197, 94, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            data-testid="button-equal"
          >
            <ThumbsUp className="w-6 h-6 text-green-500" />
            <span className="text-green-600 text-xs font-medium">Sí, son iguales</span>
          </motion.button>
        </div>

        {gameState === "idle" && (
          <motion.button
            onClick={startGame}
            className="mt-4 mx-auto py-3 px-8 rounded-xl text-white font-semibold flex items-center gap-2"
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

        <p className="text-white/60 text-[10px] text-center mt-3">
          Fin. Correctos: {correctCount} | Incorrectos: {incorrectCount}
        </p>
      </main>

      <TrainingNavBar activePage="entrenar" categoria={categoria} />
    </div>
  );
}
