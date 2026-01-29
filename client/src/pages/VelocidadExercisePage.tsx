import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Smile, Frown } from "lucide-react";

interface Nivel {
  nivel: number;
  velocidad: number; // palabras por minuto
  patron: string; // ej: "3x2" = 3 columnas, 2 filas
  palabras: string; // palabras separadas por comas
  opciones: string; // opciones separadas por comas
  tipoPregunta: string; // "ultima", "primera", "penultima"
}

export default function VelocidadExercisePage() {
  const { categoria, itemId, nivelNum } = useParams<{ categoria: string; itemId: string; nivelNum: string }>();
  const [, setLocation] = useLocation();
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [gameState, setGameState] = useState<"ready" | "animating" | "playing" | "question">("ready");
  const [correctos, setCorrectos] = useState(0);
  const [incorrectos, setIncorrectos] = useState(0);
  
  // Para la animación y palabras
  const [currentPosition, setCurrentPosition] = useState(-1);
  const [shownWords, setShownWords] = useState<string[]>([]);
  const [palabrasRonda, setPalabrasRonda] = useState<string[]>([]);
  const [opcionesRonda, setOpcionesRonda] = useState<string[]>([]);
  const [preguntaActual, setPreguntaActual] = useState("");
  const [respuestaCorrecta, setRespuestaCorrecta] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/velocidad/${itemId}`);
        const data = await res.json();
        if (data.ejercicio && data.ejercicio.niveles) {
          const niveles = JSON.parse(data.ejercicio.niveles);
          const found = niveles.find((n: Nivel) => n.nivel === parseInt(nivelNum || "1"));
          if (found) {
            setNivel(found);
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

  const getGridDimensions = (patron: string) => {
    const parts = patron.split("x");
    return { cols: parseInt(parts[0]) || 3, rows: parseInt(parts[1]) || 2 };
  };

  const getTotalPositions = (patron: string) => {
    const { cols, rows } = getGridDimensions(patron);
    return cols * rows;
  };

  const getIntervalMs = (palabrasPorMinuto: number) => {
    // palabras por minuto -> ms por palabra
    return Math.round(60000 / palabrasPorMinuto);
  };

  const getPreguntaTexto = (tipo: string) => {
    switch (tipo) {
      case "primera": return "Selecciona la primera palabra que viste";
      case "penultima": return "Selecciona la penúltima palabra que viste";
      case "ultima": 
      default: return "Selecciona la última palabra que recuerdas";
    }
  };

  const getRespuestaCorrecta = (tipo: string, palabras: string[]) => {
    switch (tipo) {
      case "primera": return palabras[0];
      case "penultima": return palabras[palabras.length - 2];
      case "ultima": 
      default: return palabras[palabras.length - 1];
    }
  };

  const iniciarRonda = useCallback(() => {
    if (!nivel) return;
    
    const totalPos = getTotalPositions(nivel.patron);
    const todasPalabras = nivel.palabras.split(",").map(p => p.trim()).filter(p => p);
    const todasOpciones = nivel.opciones.split(",").map(o => o.trim()).filter(o => o);
    
    // Seleccionar palabras aleatorias para esta ronda
    const shuffled = [...todasPalabras].sort(() => Math.random() - 0.5);
    const palabrasSeleccionadas = shuffled.slice(0, totalPos);
    
    // Mezclar opciones
    const opcionesMezcladas = [...todasOpciones].sort(() => Math.random() - 0.5);
    
    setPalabrasRonda(palabrasSeleccionadas);
    setOpcionesRonda(opcionesMezcladas);
    setShownWords(Array(totalPos).fill(""));
    setCurrentPosition(-1);
    setPreguntaActual(getPreguntaTexto(nivel.tipoPregunta));
    setRespuestaCorrecta(getRespuestaCorrecta(nivel.tipoPregunta, palabrasSeleccionadas));
    
    // Empezar animación de pelota
    setGameState("animating");
  }, [nivel]);

  // Animación de pelota moviéndose por las posiciones
  useEffect(() => {
    if (gameState !== "animating" || !nivel) return;
    
    const totalPos = getTotalPositions(nivel.patron);
    let pos = 0;
    
    const interval = setInterval(() => {
      setCurrentPosition(pos);
      pos++;
      if (pos >= totalPos) {
        clearInterval(interval);
        // Después de la animación, empezar las palabras
        setTimeout(() => {
          setCurrentPosition(-1);
          setGameState("playing");
        }, 300);
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [gameState, nivel]);

  // Mostrar palabras una por una
  useEffect(() => {
    if (gameState !== "playing" || !nivel) return;
    
    const totalPos = getTotalPositions(nivel.patron);
    const intervalMs = getIntervalMs(nivel.velocidad);
    let wordIndex = 0;
    
    const interval = setInterval(() => {
      if (wordIndex < totalPos) {
        setShownWords(prev => {
          const newWords = [...prev];
          newWords[wordIndex] = palabrasRonda[wordIndex] || "";
          return newWords;
        });
        setCurrentPosition(wordIndex);
        wordIndex++;
      } else {
        clearInterval(interval);
        // Mostrar pregunta
        setTimeout(() => {
          setGameState("question");
        }, 500);
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
    // Reiniciar para siguiente ronda
    setGameState("ready");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!nivel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex flex-col items-center justify-center p-4">
        <p className="text-white text-xl mb-4">Nivel no encontrado</p>
        <button
          onClick={() => setLocation(`/velocidad/${categoria}/${itemId}`)}
          className="bg-white/20 text-white px-6 py-3 rounded-full"
        >
          Volver
        </button>
      </div>
    );
  }

  const { cols, rows } = getGridDimensions(nivel.patron);
  const totalPos = cols * rows;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-pink-500 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-pink-600 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Mejora tu Velocidad de Lectura</h1>
        <button
          onClick={() => setLocation(`/velocidad/${categoria}/${itemId}`)}
          className="text-white/80 hover:text-white"
          data-testid="button-close"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Stats bar */}
      <div className="bg-purple-800/50 px-4 py-2 flex items-center gap-6">
        <div className="text-white">
          <span className="text-xs text-white/60">NIVEL</span>
          <div className="text-2xl font-bold">{nivel.nivel}</div>
        </div>
        <div className="flex items-center gap-2 text-white">
          <span className="text-xs text-white/60">CORRECTOS</span>
          <Smile className="w-5 h-5 text-yellow-400" />
          <span className="text-xl font-bold">{correctos}</span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <span className="text-xs text-white/60">INCORRECTOS</span>
          <Frown className="w-5 h-5 text-orange-400" />
          <span className="text-xl font-bold">{incorrectos}</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        {/* Nivel y velocidad */}
        <div className="text-center mb-8">
          <span className="text-purple-200 text-sm font-medium">NIVEL {nivel.nivel}</span>
          <h2 className="text-white text-2xl font-bold">{nivel.velocidad} palabras /min.</h2>
        </div>

        {/* Grid de posiciones */}
        <div 
          className="grid gap-4 mb-8 w-full max-w-md"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: totalPos }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              {/* Círculo / Pelota */}
              <motion.div
                animate={{
                  scale: currentPosition === idx ? 1.3 : 1,
                  backgroundColor: currentPosition === idx ? "#a855f7" : "#c084fc"
                }}
                className="w-4 h-4 rounded-full"
              />
              {/* Palabra o línea */}
              <div className="w-full min-h-[28px] flex items-center justify-center">
                {shownWords[idx] ? (
                  <span className="text-gray-800 font-medium text-lg">{shownWords[idx]}</span>
                ) : null}
              </div>
              {/* Línea base */}
              <div className="w-full h-0.5 bg-purple-400" />
            </div>
          ))}
        </div>

        {/* Estado: Listo para iniciar */}
        {gameState === "ready" && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={iniciarRonda}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-4 rounded-full font-bold text-xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-shadow"
            data-testid="button-iniciar"
          >
            Iniciar
            <Play className="w-6 h-6 fill-white" />
          </motion.button>
        )}

        {/* Estado: Pregunta */}
        {gameState === "question" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <p className="text-gray-800 text-lg mb-6">{preguntaActual}</p>
            <div 
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)` }}
            >
              {opcionesRonda.map((opcion, idx) => (
                <motion.button
                  key={idx}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleRespuesta(opcion)}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  data-testid={`button-opcion-${idx}`}
                >
                  {opcion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
