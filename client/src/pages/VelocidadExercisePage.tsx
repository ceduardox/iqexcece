import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";

interface Nivel {
  nivel: number;
  velocidad: number;
  patron: string;
  palabras: string;
  opciones: string;
  tipoPregunta: string;
}

export default function VelocidadExercisePage() {
  const { categoria, itemId, nivelNum } = useParams<{ categoria: string; itemId: string; nivelNum: string }>();
  const [, setLocation] = useLocation();
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [gameState, setGameState] = useState<"ready" | "animating" | "playing" | "question">("ready");
  const [correctos, setCorrectos] = useState(0);
  const [incorrectos, setIncorrectos] = useState(0);
  
  const [currentPosition, setCurrentPosition] = useState(-1);
  const [shownWords, setShownWords] = useState<string[]>([]);
  const [palabrasRonda, setPalabrasRonda] = useState<string[]>([]);
  const [opcionesRonda, setOpcionesRonda] = useState<string[]>([]);
  const [preguntaActual, setPreguntaActual] = useState("");
  const [respuestaCorrecta, setRespuestaCorrecta] = useState("");
  const [showCircles, setShowCircles] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/velocidad/${itemId}`);
        const data = await res.json();
        if (data.ejercicio && data.ejercicio.niveles) {
          const niveles = JSON.parse(data.ejercicio.niveles);
          const found = niveles.find((n: Nivel) => n.nivel === parseInt(nivelNum || "1"));
          if (found) setNivel(found);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [itemId, nivelNum]);

  const getGridDimensions = (patron: string) => {
    const parts = patron.split("x");
    return { cols: parseInt(parts[0]) || 3, rows: parseInt(parts[1]) || 2 };
  };

  const getTotalPositions = (patron: string) => {
    const { cols, rows } = getGridDimensions(patron);
    return cols * rows;
  };

  const getIntervalMs = (palabrasPorMinuto: number) => Math.round(60000 / palabrasPorMinuto);

  const getPreguntaTexto = (tipo: string) => {
    switch (tipo) {
      case "primera": return "Selecciona la primera palabra que viste";
      case "penultima": return "Selecciona la penultima palabra que viste";
      default: return "Selecciona la ultima palabra que recuerdas";
    }
  };

  const getRespuestaCorrecta = (tipo: string, palabras: string[]) => {
    switch (tipo) {
      case "primera": return palabras[0];
      case "penultima": return palabras[palabras.length - 2];
      default: return palabras[palabras.length - 1];
    }
  };

  const iniciarRonda = useCallback(() => {
    if (!nivel) return;
    
    const totalPos = getTotalPositions(nivel.patron);
    const todasPalabras = nivel.palabras.split(",").map(p => p.trim()).filter(p => p);
    const todasOpciones = nivel.opciones.split(",").map(o => o.trim()).filter(o => o);
    
    // Mezclar palabras y usar TODAS (no solo las que caben en el patrón)
    const shuffled = [...todasPalabras].sort(() => Math.random() - 0.5);
    const opcionesMezcladas = [...todasOpciones].sort(() => Math.random() - 0.5);
    
    setPalabrasRonda(shuffled); // Usar todas las palabras
    setOpcionesRonda(opcionesMezcladas);
    setShownWords(Array(totalPos).fill(""));
    setCurrentPosition(-1);
    setPreguntaActual(getPreguntaTexto(nivel.tipoPregunta));
    setRespuestaCorrecta(getRespuestaCorrecta(nivel.tipoPregunta, shuffled));
    setShowCircles(true);
    setGameState("animating");
  }, [nivel]);

  useEffect(() => {
    if (gameState !== "animating" || !nivel) return;
    const totalPos = getTotalPositions(nivel.patron);
    let pos = 0;
    const interval = setInterval(() => {
      setCurrentPosition(pos);
      pos++;
      if (pos >= totalPos) {
        clearInterval(interval);
        setTimeout(() => {
          setShowCircles(false);
          setCurrentPosition(-1);
          setGameState("playing");
        }, 400);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [gameState, nivel]);

  useEffect(() => {
    if (gameState !== "playing" || !nivel || palabrasRonda.length === 0) return;
    const totalPos = getTotalPositions(nivel.patron);
    const totalPalabras = palabrasRonda.length;
    const intervalMs = getIntervalMs(nivel.velocidad);
    let wordIndex = 0;
    
    // Mostrar primera palabra inmediatamente en posición 0
    const posActual = wordIndex % totalPos;
    setCurrentPosition(posActual);
    setShownWords(Array(totalPos).fill("").map((_, i) => i === posActual ? palabrasRonda[wordIndex] : ""));
    wordIndex = 1;
    
    const interval = setInterval(() => {
      if (wordIndex < totalPalabras) {
        const pos = wordIndex % totalPos; // Posición cíclica
        setCurrentPosition(pos);
        setShownWords(Array(totalPos).fill("").map((_, i) => i === pos ? palabrasRonda[wordIndex] : ""));
        wordIndex++;
      } else {
        clearInterval(interval);
        setCurrentPosition(-1);
        setShownWords([]);
        setTimeout(() => setGameState("question"), 400);
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [gameState, nivel, palabrasRonda]);

  const handleRespuesta = (opcion: string) => {
    if (opcion.toLowerCase() === respuestaCorrecta.toLowerCase()) {
      setCorrectos(c => c + 1);
    } else {
      setIncorrectos(i => i + 1);
    }
    setGameState("ready");
    setShownWords([]);
    setShowCircles(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-700 via-purple-600 to-pink-500 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full"
        />
      </div>
    );
  }

  if (!nivel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-700 to-pink-500 flex flex-col items-center justify-center p-4">
        <p className="text-white text-xl mb-4">Nivel no encontrado</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLocation(`/entrenamiento/${categoria}`)}
          className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-full font-semibold"
        >
          Volver
        </motion.button>
      </div>
    );
  }

  const { cols } = getGridDimensions(nivel.patron);
  const totalPos = getTotalPositions(nivel.patron);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-700 via-purple-600 to-pink-500 flex flex-col">
      <header className="bg-gradient-to-r from-purple-800/80 to-pink-700/80 backdrop-blur px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Mejora tu Velocidad de Lectura</h1>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setLocation(`/entrenamiento/${categoria}`)}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
          data-testid="button-close"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </header>

      <div className="bg-purple-900/40 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-purple-200 text-xs">NIVEL</span>
          <span className="text-white text-2xl font-bold">{nivel.nivel}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-purple-200 text-xs">CORRECTOS</span>
            <span className="text-2xl">😊</span>
            <span className="text-white text-xl font-bold">{correctos}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-200 text-xs">INCORRECTOS</span>
            <span className="text-2xl">😔</span>
            <span className="text-white text-xl font-bold">{incorrectos}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="text-purple-200 text-sm font-medium tracking-wider">NIVEL {nivel.nivel}</span>
          <h2 className="text-white text-3xl font-bold">{nivel.velocidad} palabras /min.</h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {gameState !== "question" && (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="grid gap-6 mb-8 w-full max-w-md"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {Array.from({ length: totalPos }).map((_, idx) => (
                <motion.div 
                  key={idx} 
                  className="flex flex-col items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {/* Contenedor fijo para círculo - mantiene altura aunque círculo desaparezca */}
                  <div className="h-7 flex items-center justify-center">
                    {showCircles && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: currentPosition === idx ? 1.4 : 1,
                          backgroundColor: currentPosition === idx ? "#c084fc" : "#a855f7"
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-5 h-5 rounded-full shadow-lg"
                        style={{ boxShadow: currentPosition === idx ? "0 0 20px rgba(168, 85, 247, 0.6)" : "none" }}
                      />
                    )}
                  </div>
                  
                  {/* Contenedor fijo para palabra */}
                  <div className="h-8 flex items-center justify-center">
                    {currentPosition === idx && shownWords[idx] && (
                      <motion.span
                        key={`word-${idx}-${shownWords[idx]}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="text-gray-800 font-bold text-xl"
                      >
                        {shownWords[idx]}
                      </motion.span>
                    )}
                  </div>
                  
                  <motion.div 
                    className="w-full h-0.5 rounded-full"
                    animate={{ backgroundColor: currentPosition === idx ? "#c084fc" : "#9333ea" }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {gameState === "ready" && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={iniciarRonda}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-14 py-5 rounded-full font-bold text-xl shadow-xl flex items-center gap-3"
              data-testid="button-iniciar"
            >
              Iniciar
              <Play className="w-6 h-6 fill-white" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {gameState === "question" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-md">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-800 text-xl font-medium mb-6 text-center">
                {preguntaActual}
              </motion.p>
              <div className="grid grid-cols-3 gap-3">
                {opcionesRonda.map((opcion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.08, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRespuesta(opcion)}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-4 rounded-xl font-semibold text-lg shadow-lg transition-colors"
                    data-testid={`button-opcion-${idx}`}
                  >
                    {opcion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
