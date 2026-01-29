import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";

interface Ejercicio {
  id: number;
  tipo: "numero" | "letra";
  objetivo: string;
  opciones: string[];
  tiempoMs: number;
}

const ejerciciosDefault: Ejercicio[] = [
  { id: 1, tipo: "numero", objetivo: "7", opciones: ["5", "7", "9", "2"], tiempoMs: 1500 },
  { id: 2, tipo: "letra", objetivo: "B", opciones: ["D", "B", "R", "P"], tiempoMs: 1500 },
  { id: 3, tipo: "numero", objetivo: "3", opciones: ["8", "6", "3", "0"], tiempoMs: 1200 },
  { id: 4, tipo: "letra", objetivo: "M", opciones: ["N", "W", "M", "H"], tiempoMs: 1200 },
  { id: 5, tipo: "numero", objetivo: "9", opciones: ["9", "6", "4", "1"], tiempoMs: 1000 },
  { id: 6, tipo: "letra", objetivo: "G", opciones: ["C", "O", "G", "Q"], tiempoMs: 1000 },
  { id: 7, tipo: "numero", objetivo: "4", opciones: ["7", "1", "9", "4"], tiempoMs: 800 },
  { id: 8, tipo: "letra", objetivo: "E", opciones: ["F", "E", "L", "T"], tiempoMs: 800 },
];

export default function NumerosExercisePage() {
  const { categoria } = useParams<{ categoria: string; itemId: string }>();
  const [, setLocation] = useLocation();
  
  const [ejercicios] = useState<Ejercicio[]>(ejerciciosDefault);
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [gameState, setGameState] = useState<"ready" | "showing" | "question" | "feedback" | "final">("ready");
  const [correctos, setCorrectos] = useState(0);
  const [incorrectos, setIncorrectos] = useState(0);
  const [ultimaRespuesta, setUltimaRespuesta] = useState<"correcta" | "incorrecta" | null>(null);
  const [countdown, setCountdown] = useState(3);

  const ejercicio = ejercicios[ejercicioActual];

  const iniciarEjercicio = useCallback(() => {
    setGameState("showing");
    
    setTimeout(() => {
      setGameState("question");
    }, ejercicio.tiempoMs);
  }, [ejercicio]);

  const verificarRespuesta = (respuesta: string) => {
    const esCorrecta = respuesta === ejercicio.objetivo;
    
    if (esCorrecta) {
      setCorrectos(prev => prev + 1);
      setUltimaRespuesta("correcta");
    } else {
      setIncorrectos(prev => prev + 1);
      setUltimaRespuesta("incorrecta");
    }
    
    setGameState("feedback");
    
    setTimeout(() => {
      if (ejercicioActual < ejercicios.length - 1) {
        setEjercicioActual(prev => prev + 1);
        setUltimaRespuesta(null);
        setGameState("showing");
        
        const nextEjercicio = ejercicios[ejercicioActual + 1];
        setTimeout(() => {
          setGameState("question");
        }, nextEjercicio.tiempoMs);
      } else {
        setGameState("final");
      }
    }, 800);
  };

  const reiniciar = () => {
    setEjercicioActual(0);
    setCorrectos(0);
    setIncorrectos(0);
    setUltimaRespuesta(null);
    setCountdown(3);
    setGameState("ready");
  };

  useEffect(() => {
    if (gameState === "ready" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "ready" && countdown === 0) {
      iniciarEjercicio();
    }
  }, [gameState, countdown, iniciarEjercicio]);

  const porcentaje = Math.round((correctos / ejercicios.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 via-teal-400 to-emerald-500 flex flex-col">
      <header className="bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 flex items-center justify-between">
        <div className="text-white text-sm">
          {ejercicioActual + 1} / {ejercicios.length}
        </div>
        <h1 className="text-white font-bold text-lg">Números y Letras</h1>
        <button
          onClick={() => setLocation(`/entrenamiento/${categoria}`)}
          className="w-8 h-8 flex items-center justify-center text-white/80"
          data-testid="button-close"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {gameState === "ready" && (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-center"
            >
              <div className="text-8xl font-bold text-white mb-4">{countdown}</div>
              <p className="text-white/80 text-lg">¡Prepárate!</p>
            </motion.div>
          )}

          {gameState === "showing" && (
            <motion.div
              key="showing"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-white rounded-3xl w-48 h-48 flex items-center justify-center shadow-2xl"
            >
              <span className={`font-bold ${ejercicio.tipo === "numero" ? "text-blue-600" : "text-purple-600"}`} style={{ fontSize: "8rem" }}>
                {ejercicio.objetivo}
              </span>
            </motion.div>
          )}

          {gameState === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm"
            >
              <p className="text-white text-xl text-center mb-6 font-semibold">
                ¿Qué {ejercicio.tipo === "numero" ? "número" : "letra"} viste?
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {ejercicio.opciones.map((opcion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => verificarRespuesta(opcion)}
                    className="bg-white/90 backdrop-blur rounded-2xl py-6 text-4xl font-bold text-gray-800 shadow-lg hover:bg-white hover:scale-105 transition-all"
                    data-testid={`button-opcion-${idx}`}
                  >
                    {opcion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-32 h-32 rounded-full flex items-center justify-center ${
                ultimaRespuesta === "correcta" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <span className="text-5xl">
                {ultimaRespuesta === "correcta" ? "✓" : "✗"}
              </span>
            </motion.div>
          )}

          {gameState === "final" && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl"
            >
              <div className="text-6xl mb-4">
                {porcentaje >= 80 ? "🎉" : porcentaje >= 50 ? "👍" : "💪"}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ¡Ejercicio completado!
              </h2>
              
              <div className="text-5xl font-bold text-teal-600 mb-4">
                {porcentaje}%
              </div>
              
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">{correctos}</div>
                  <div className="text-sm text-gray-500">Correctas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">{incorrectos}</div>
                  <div className="text-sm text-gray-500">Incorrectas</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={reiniciar}
                  className="flex-1 bg-teal-100 text-teal-700 font-semibold py-3 px-4 rounded-full flex items-center justify-center gap-2"
                  data-testid="button-reintentar"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reintentar
                </button>
                <button
                  onClick={() => setLocation(`/entrenamiento/${categoria}`)}
                  className="flex-1 bg-teal-500 text-white font-semibold py-3 px-4 rounded-full"
                  data-testid="button-continuar"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-white h-full"
            initial={{ width: 0 }}
            animate={{ width: `${((ejercicioActual + (gameState === "final" ? 1 : 0)) / ejercicios.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
