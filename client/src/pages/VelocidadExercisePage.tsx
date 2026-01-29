import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, RotateCcw, CheckCircle } from "lucide-react";

interface Nivel {
  nivel: number;
  patron: string;
  velocidad: number;
  contenido: string;
}

export default function VelocidadExercisePage() {
  const { categoria, itemId, nivelNum } = useParams<{ categoria: string; itemId: string; nivelNum: string }>();
  const [, setLocation] = useLocation();
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/velocidad-ejercicios/${itemId}`);
        const data = await res.json();
        if (data.ejercicio && data.ejercicio.niveles) {
          const found = data.ejercicio.niveles.find((n: Nivel) => n.nivel === parseInt(nivelNum || "1"));
          if (found) {
            setNivel(found);
            const contenido = found.contenido.split("\n").filter((s: string) => s.trim());
            setItems(contenido);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [itemId, nivelNum]);

  const getGridClass = (patron: string) => {
    switch (patron) {
      case "1x3": return "grid-cols-1";
      case "2x2": return "grid-cols-2";
      case "2x3": return "grid-cols-2";
      case "3x3": return "grid-cols-3";
      case "1x4": return "grid-cols-1";
      case "2x4": return "grid-cols-2";
      default: return "grid-cols-2";
    }
  };

  const getPointCount = (patron: string) => {
    const [cols, rows] = patron.split("x").map(Number);
    return cols * rows;
  };

  const startGame = useCallback(() => {
    setCurrentIndex(0);
    setGameState("playing");
  }, []);

  useEffect(() => {
    if (gameState !== "playing" || !nivel) return;

    if (currentIndex >= items.length) {
      setGameState("finished");
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, nivel.velocidad);

    return () => clearTimeout(timer);
  }, [gameState, currentIndex, items.length, nivel]);

  const getCurrentItems = () => {
    if (!nivel) return [];
    const pointCount = getPointCount(nivel.patron);
    const start = Math.floor(currentIndex / pointCount) * pointCount;
    return items.slice(start, start + pointCount);
  };

  const getActivePoint = () => {
    if (!nivel) return 0;
    const pointCount = getPointCount(nivel.patron);
    return currentIndex % pointCount;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!nivel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 flex flex-col">
        <header className="p-4">
          <button
            onClick={() => setLocation(`/velocidad/${categoria}/${itemId}`)}
            className="flex items-center gap-2 text-white font-semibold"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6" />
            Volver
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-white text-xl">Nivel no encontrado</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={() => setLocation(`/velocidad/${categoria}/${itemId}`)}
          className="flex items-center gap-2 text-white font-semibold"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6" />
          Volver
        </button>
        <div className="text-cyan-400 font-bold">Nivel {nivel.nivel}</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {gameState === "ready" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Velocidad Lectora</h2>
            <p className="text-white/70 mb-2">Patrón: {nivel.patron}</p>
            <p className="text-white/70 mb-8">Velocidad: {nivel.velocidad}ms</p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-full font-bold text-xl flex items-center gap-3 mx-auto hover:scale-105 transition-transform"
              data-testid="button-start"
            >
              <Play className="w-6 h-6" />
              Empezar
            </button>
          </motion.div>
        )}

        {gameState === "playing" && (
          <div className="w-full max-w-md">
            <div className={`grid ${getGridClass(nivel.patron)} gap-4`}>
              {getCurrentItems().map((item, idx) => (
                <motion.div
                  key={`${currentIndex}-${idx}`}
                  initial={{ opacity: 0.3, scale: 0.95 }}
                  animate={{ 
                    opacity: getActivePoint() === idx ? 1 : 0.4,
                    scale: getActivePoint() === idx ? 1.1 : 1,
                  }}
                  className={`
                    p-4 rounded-xl text-center font-bold text-xl
                    ${getActivePoint() === idx 
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/50" 
                      : "bg-white/10 text-white/50"
                    }
                  `}
                >
                  {item}
                </motion.div>
              ))}
            </div>
            <div className="mt-8 text-center text-white/60">
              {Math.min(currentIndex + 1, items.length)} / {items.length}
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">¡Completado!</h2>
            <p className="text-white/70 mb-8">Has terminado el ejercicio</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setGameState("ready");
                }}
                className="bg-white/20 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-white/30"
                data-testid="button-retry"
              >
                <RotateCcw className="w-5 h-5" />
                Repetir
              </button>
              <button
                onClick={() => setLocation(`/velocidad/${categoria}/${itemId}`)}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                data-testid="button-levels"
              >
                Otros niveles
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
