import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";

interface Ejercicio {
  nivel: number;
  velocidad: number;
  patron: string;
  palabras: string;
  opciones: string;
  tipoPregunta: string;
}

export default function VelocidadExercisePage() {
  const { categoria, itemId, patron } = useParams<{ categoria: string; itemId: string; patron: string }>();
  const [, setLocation] = useLocation();
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [titulo, setTitulo] = useState("Velocidad Lectora");
  const [loading, setLoading] = useState(true);
  const [tiempoAnimacionInicial, setTiempoAnimacionInicial] = useState(3);
  const [velocidadAnimacion, setVelocidadAnimacion] = useState(5);
  
  const [gameState, setGameState] = useState<"ready" | "animacion_inicial" | "playing" | "question" | "transicion" | "final">("ready");
  const [correctos, setCorrectos] = useState(0);
  const [incorrectos, setIncorrectos] = useState(0);
  const [ultimaRespuesta, setUltimaRespuesta] = useState<"correcta" | "incorrecta" | null>(null);
  const [esSegundoEjercicioEnAdelante, setEsSegundoEjercicioEnAdelante] = useState(false);
  
  const [currentPosition, setCurrentPosition] = useState(-1);
  const [shownWords, setShownWords] = useState<string[]>([]);
  const [palabrasRonda, setPalabrasRonda] = useState<string[]>([]);
  const [opcionesRonda, setOpcionesRonda] = useState<string[]>([]);
  const [preguntaActual, setPreguntaActual] = useState("");
  const [respuestaCorrecta, setRespuestaCorrecta] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [velocidadRes, itemRes] = await Promise.all([
          fetch(`/api/velocidad/${itemId}`),
          fetch(`/api/entrenamiento/item/${itemId}`)
        ]);
        const velocidadData = await velocidadRes.json();
        const itemData = await itemRes.json();
        
        if (velocidadData.ejercicio && velocidadData.ejercicio.niveles) {
          const todosNiveles: Ejercicio[] = JSON.parse(velocidadData.ejercicio.niveles);
          const patronDecoded = decodeURIComponent(patron || "");
          const nivelesFiltrados = patronDecoded 
            ? todosNiveles.filter(n => n.patron === patronDecoded)
            : todosNiveles;
          setEjercicios(nivelesFiltrados);
          setTitulo(velocidadData.ejercicio.titulo || itemData.item?.title || "Velocidad Lectora");
          
          if (velocidadData.ejercicio.tiempoAnimacionInicial) {
            setTiempoAnimacionInicial(velocidadData.ejercicio.tiempoAnimacionInicial);
          }
          if (velocidadData.ejercicio.velocidadAnimacion) {
            setVelocidadAnimacion(velocidadData.ejercicio.velocidadAnimacion);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [itemId, patron]);

  const ejercicio = ejercicios[ejercicioActual];

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
    if (tipo === "primera") {
      return "¿Cuál fue la primera palabra?";
    } else if (tipo === "ultima") {
      return "¿Cuál fue la última palabra?";
    }
    return "¿Cuál fue la primera palabra?";
  };

  const getRespuestaCorrecta = (tipo: string, palabras: string[]) => {
    if (tipo === "ultima") {
      return palabras[palabras.length - 1] || palabras[0];
    }
    return palabras[0];
  };

  const iniciarEjercicio = useCallback(() => {
    if (!ejercicio) return;
    
    const todasPalabras = ejercicio.palabras.split(",").map(p => p.trim()).filter(p => p);
    const todasOpciones = ejercicio.opciones.split(",").map(o => o.trim()).filter(o => o);
    
    const shuffled = [...todasPalabras].sort(() => Math.random() - 0.5);
    
    const respuestaCorrectaCalculada = getRespuestaCorrecta(ejercicio.tipoPregunta, shuffled);
    
    let opcionesMezcladas = [...todasOpciones].sort(() => Math.random() - 0.5);
    const respuestaExiste = opcionesMezcladas.some(
      op => op.toLowerCase() === respuestaCorrectaCalculada.toLowerCase()
    );
    
    if (!respuestaExiste) {
      const posicionAleatoria = Math.floor(Math.random() * opcionesMezcladas.length);
      opcionesMezcladas[posicionAleatoria] = respuestaCorrectaCalculada;
    }
    
    const totalPos = getTotalPositions(ejercicio.patron);
    setPalabrasRonda(shuffled);
    setOpcionesRonda(opcionesMezcladas);
    setShownWords(Array(totalPos).fill(""));
    setCurrentPosition(-1);
    setPreguntaActual(getPreguntaTexto(ejercicio.tipoPregunta));
    setRespuestaCorrecta(respuestaCorrectaCalculada);
    setUltimaRespuesta(null);
    
    if (esSegundoEjercicioEnAdelante) {
      setGameState("playing");
    } else {
      setGameState("animacion_inicial");
    }
  }, [ejercicio, esSegundoEjercicioEnAdelante]);

  useEffect(() => {
    if (gameState !== "animacion_inicial" || !ejercicio) return;
    
    const totalPos = getTotalPositions(ejercicio.patron);
    const duracionMs = tiempoAnimacionInicial * 1000;
    // velocidadAnimacion: 1=lento (500ms), 5=normal (250ms), 10=rápido (100ms)
    const baseInterval = 600 - (velocidadAnimacion * 50); // 1=550ms, 5=350ms, 10=100ms
    const totalSaltos = Math.floor(duracionMs / baseInterval);
    let posicion = 0;
    let saltos = 0;
    
    const interval = setInterval(() => {
      setCurrentPosition(posicion);
      posicion = (posicion + 1) % totalPos;
      saltos++;
      if (saltos >= totalSaltos) {
        clearInterval(interval);
        setCurrentPosition(-1);
        setGameState("playing");
      }
    }, baseInterval);
    
    return () => clearInterval(interval);
  }, [gameState, ejercicio, tiempoAnimacionInicial, velocidadAnimacion]);

  useEffect(() => {
    if (gameState !== "playing" || !ejercicio || palabrasRonda.length === 0) return;
    
    const totalPos = getTotalPositions(ejercicio.patron);
    const totalPalabras = palabrasRonda.length;
    const intervalMs = getIntervalMs(ejercicio.velocidad);
    let wordIndex = 0;
    
    const posActual = wordIndex % totalPos;
    setCurrentPosition(posActual);
    setShownWords(Array(totalPos).fill("").map((_, i) => i === posActual ? palabrasRonda[wordIndex] : ""));
    wordIndex = 1;
    
    const interval = setInterval(() => {
      if (wordIndex < totalPalabras) {
        const pos = wordIndex % totalPos;
        setCurrentPosition(pos);
        setShownWords(Array(totalPos).fill("").map((_, i) => i === pos ? palabrasRonda[wordIndex] : ""));
        wordIndex++;
      } else {
        clearInterval(interval);
        setCurrentPosition(-1);
        setShownWords([]);
        setTimeout(() => setGameState("question"), 300);
      }
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [gameState, ejercicio, palabrasRonda]);

  const handleRespuesta = (opcion: string) => {
    const esCorrecta = opcion.toLowerCase() === respuestaCorrecta.toLowerCase();
    if (esCorrecta) {
      setCorrectos(c => c + 1);
      setUltimaRespuesta("correcta");
    } else {
      setIncorrectos(i => i + 1);
      setUltimaRespuesta("incorrecta");
    }
    
    if (ejercicioActual < ejercicios.length - 1) {
      setGameState("transicion");
      setTimeout(() => {
        setEjercicioActual(e => e + 1);
        setEsSegundoEjercicioEnAdelante(true);
        setGameState("ready");
        setTimeout(() => {
          iniciarEjercicioSiguiente();
        }, 100);
      }, 700);
    } else {
      setGameState("final");
    }
  };

  const iniciarEjercicioSiguiente = useCallback(() => {
    const nextEjercicio = ejercicios[ejercicioActual + 1];
    if (!nextEjercicio) return;
    
    const todasPalabras = nextEjercicio.palabras.split(",").map(p => p.trim()).filter(p => p);
    const todasOpciones = nextEjercicio.opciones.split(",").map(o => o.trim()).filter(o => o);
    
    const shuffled = [...todasPalabras].sort(() => Math.random() - 0.5);
    const respuestaCorrectaCalculada = getRespuestaCorrecta(nextEjercicio.tipoPregunta, shuffled);
    
    let opcionesMezcladas = [...todasOpciones].sort(() => Math.random() - 0.5);
    const respuestaExiste = opcionesMezcladas.some(
      op => op.toLowerCase() === respuestaCorrectaCalculada.toLowerCase()
    );
    
    if (!respuestaExiste) {
      const posicionAleatoria = Math.floor(Math.random() * opcionesMezcladas.length);
      opcionesMezcladas[posicionAleatoria] = respuestaCorrectaCalculada;
    }
    
    const totalPos = getTotalPositions(nextEjercicio.patron);
    setPalabrasRonda(shuffled);
    setOpcionesRonda(opcionesMezcladas);
    setShownWords(Array(totalPos).fill(""));
    setCurrentPosition(-1);
    setPreguntaActual(getPreguntaTexto(nextEjercicio.tipoPregunta));
    setRespuestaCorrecta(respuestaCorrectaCalculada);
    setUltimaRespuesta(null);
    setGameState("playing");
  }, [ejercicios, ejercicioActual]);

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

  if (ejercicios.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-700 to-pink-500 flex flex-col items-center justify-center p-4">
        <p className="text-white text-xl mb-4">No hay ejercicios configurados</p>
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

  if (!ejercicio) {
    return null;
  }

  const { cols } = getGridDimensions(ejercicio.patron);
  const totalPos = getTotalPositions(ejercicio.patron);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-700 via-purple-600 to-pink-500 flex flex-col">
      <header className="bg-gradient-to-r from-purple-800/80 to-pink-700/80 backdrop-blur px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">{titulo}</h1>
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
          <span className="text-purple-200 text-xs">EJERCICIO</span>
          <span className="text-white text-xl font-bold">{ejercicioActual + 1}/{ejercicios.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-2xl">😊</span>
            <span className="text-green-400 text-sm font-bold">CORRECTO</span>
            <span className="text-white text-xl font-bold ml-1">{correctos}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl">😔</span>
            <span className="text-red-400 text-sm font-bold">INCORRECTO</span>
            <span className="text-white text-xl font-bold ml-1">{incorrectos}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <motion.div 
          key={ejercicioActual}
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-8"
        >
          <span className="text-purple-200 text-sm font-medium tracking-wider">
            {ejercicio.velocidad} palabras/min
          </span>
        </motion.div>

        <AnimatePresence mode="wait">
          {(gameState === "ready" || gameState === "animacion_inicial" || gameState === "playing") && (
            <motion.div 
              key={`grid-${ejercicioActual}`}
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
                  <div className="h-10 flex items-center justify-center relative">
                    {gameState === "animacion_inicial" && currentPosition === idx && (
                      <motion.div
                        key={`circle-${idx}`}
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="w-6 h-6 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"
                      />
                    )}
                    {gameState === "playing" && currentPosition === idx && shownWords[idx] && (
                      <motion.span
                        key={`word-${idx}-${shownWords[idx]}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.1 }}
                        className="text-white font-bold text-xl"
                      >
                        {shownWords[idx]}
                      </motion.span>
                    )}
                  </div>
                  <motion.div 
                    className="w-full h-1 rounded-full"
                    animate={{ 
                      backgroundColor: currentPosition === idx ? "#c084fc" : "#6b21a8",
                      scaleY: currentPosition === idx ? 2 : 1
                    }}
                    transition={{ duration: 0.1 }}
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
              onClick={iniciarEjercicio}
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
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="w-full max-w-md"
            >
              <motion.p 
                className="text-white text-xl font-medium mb-6 text-center"
              >
                {preguntaActual}
              </motion.p>
              <div className="grid grid-cols-3 gap-3">
                {opcionesRonda.map((opcion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.05, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.05 }}
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

        <AnimatePresence>
          {gameState === "transicion" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl ${
                  ultimaRespuesta === "correcta" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {ultimaRespuesta === "correcta" ? "😊" : "😔"}
              </motion.div>
              <p className="text-white text-lg font-bold">
                {ultimaRespuesta === "correcta" ? "¡CORRECTO!" : "INCORRECTO"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {gameState === "final" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="w-full max-w-md text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-5xl"
              >
                🏆
              </motion.div>
              
              <h3 className="text-white text-2xl font-bold mb-2">
                ¡Completado!
              </h3>
              
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
                <p className="text-white/80 mb-4">Resultados:</p>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <span className="text-4xl">😊</span>
                    <p className="text-white text-2xl font-bold">{correctos}</p>
                    <p className="text-green-400 text-sm font-bold">CORRECTOS</p>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl">😔</span>
                    <p className="text-white text-2xl font-bold">{incorrectos}</p>
                    <p className="text-red-400 text-sm font-bold">INCORRECTOS</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/60 text-sm">Precisión</p>
                  <p className="text-white text-3xl font-bold">
                    {ejercicios.length > 0 ? Math.round((correctos / ejercicios.length) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setEjercicioActual(0);
                    setCorrectos(0);
                    setIncorrectos(0);
                    setUltimaRespuesta(null);
                    setEsSegundoEjercicioEnAdelante(false);
                    setGameState("ready");
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg"
                  data-testid="button-repetir-todo"
                >
                  Repetir Todo
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setLocation(`/entrenamiento/${categoria}`)}
                  className="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-full font-bold text-lg"
                  data-testid="button-volver"
                >
                  Volver a Entrenamiento
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
