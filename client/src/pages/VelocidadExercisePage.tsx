import { useEffect, useState, useCallback, useRef } from "react";
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
  
  const [gameState, setGameState] = useState<"ready" | "animacion_inicial" | "preparando" | "playing" | "question" | "transicion" | "final">("ready");
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
  const [velocidadActual, setVelocidadActual] = useState(150);
  const [patronActual, setPatronActual] = useState("3x2");
  const [playingKey, setPlayingKey] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs para tener siempre valores actuales en el intervalo
  const velocidadRef = useRef(velocidadActual);
  const patronRef = useRef(patronActual);
  const palabrasRef = useRef<string[]>([]);
  
  // Sincronizar refs con estado
  useEffect(() => {
    velocidadRef.current = velocidadActual;
    console.log("velocidadRef actualizado:", velocidadActual);
  }, [velocidadActual]);
  
  useEffect(() => {
    patronRef.current = patronActual;
    console.log("patronRef actualizado:", patronActual);
  }, [patronActual]);
  
  useEffect(() => {
    palabrasRef.current = palabrasRonda;
    console.log("palabrasRef actualizadas:", palabrasRonda.length, "palabras");
  }, [palabrasRonda]);

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

  const getNivelFromPatron = (patron: string): number => {
    const parts = patron.split("x");
    const total = (parseInt(parts[0]) || 2) * (parseInt(parts[1]) || 2);
    if (total <= 4) return 1;
    if (total <= 6) return 2;
    if (total <= 8) return 3;
    return 4;
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
    setVelocidadActual(ejercicio.velocidad);
    setPatronActual(ejercicio.patron);
    setPlayingKey(k => k + 1);
    
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

  // Estado "preparando": muestra círculos estáticos por 800ms antes de empezar
  useEffect(() => {
    if (gameState !== "preparando") return;
    
    const timeout = setTimeout(() => {
      setGameState("playing");
    }, 800);
    
    return () => clearTimeout(timeout);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;
    
    // Limpiar cualquier intervalo anterior SIEMPRE
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Usar refs para obtener valores más recientes
    const velocidadParaUsar = velocidadRef.current;
    const patronParaUsar = patronRef.current;
    const palabrasParaUsar = [...palabrasRef.current];
    
    if (palabrasParaUsar.length === 0) {
      console.log("No hay palabras, saltando...");
      return;
    }
    
    const totalPos = getTotalPositions(patronParaUsar);
    const totalPalabras = palabrasParaUsar.length;
    const intervalMs = getIntervalMs(velocidadParaUsar);
    
    console.log("=== PLAYING STATE (desde refs) ===");
    console.log("velocidad:", velocidadParaUsar);
    console.log("intervalMs:", intervalMs);
    console.log("patron:", patronParaUsar);
    console.log("totalPalabras:", totalPalabras);
    
    let wordIndex = 0;
    
    // Mostrar primera palabra inmediatamente
    const posActual = wordIndex % totalPos;
    setCurrentPosition(posActual);
    setShownWords(Array(totalPos).fill("").map((_, i) => i === posActual ? palabrasParaUsar[wordIndex] : ""));
    wordIndex = 1;
    
    intervalRef.current = setInterval(() => {
      if (wordIndex < totalPalabras) {
        const pos = wordIndex % totalPos;
        setCurrentPosition(pos);
        setShownWords(Array(totalPos).fill("").map((_, i) => i === pos ? palabrasParaUsar[wordIndex] : ""));
        wordIndex++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setCurrentPosition(-1);
        setShownWords([]);
        setTimeout(() => setGameState("question"), 300);
      }
    }, intervalMs);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameState, playingKey]);

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
      setEsSegundoEjercicioEnAdelante(true);
      setTimeout(() => {
        const nextEjercicio = ejercicios[ejercicioActual + 1];
        if (!nextEjercicio) return;
        
        const todasPalabras = nextEjercicio.palabras.split(",").map(p => p.trim()).filter(p => p);
        const todasOpciones = nextEjercicio.opciones.split(",").map(o => o.trim()).filter(o => o);
        const shuffled = [...todasPalabras].sort(() => Math.random() - 0.5);
        const respuestaCorrectaCalc = getRespuestaCorrecta(nextEjercicio.tipoPregunta, shuffled);
        
        let opcionesMezcladas = [...todasOpciones].sort(() => Math.random() - 0.5);
        if (!opcionesMezcladas.some(op => op.toLowerCase() === respuestaCorrectaCalc.toLowerCase())) {
          opcionesMezcladas[Math.floor(Math.random() * opcionesMezcladas.length)] = respuestaCorrectaCalc;
        }
        
        const totalPos = getTotalPositions(nextEjercicio.patron);
        setEjercicioActual(e => e + 1);
        setPalabrasRonda(shuffled);
        setOpcionesRonda(opcionesMezcladas);
        setShownWords(Array(totalPos).fill(""));
        setCurrentPosition(-1);
        setPreguntaActual(getPreguntaTexto(nextEjercicio.tipoPregunta));
        setRespuestaCorrecta(respuestaCorrectaCalc);
        setUltimaRespuesta(null);
        setVelocidadActual(nextEjercicio.velocidad);
        setPatronActual(nextEjercicio.patron);
        setPlayingKey(k => k + 1);
        setGameState("preparando");
      }, 500);
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
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg flex-1 text-center">{titulo}</h1>
        <button
          onClick={() => setLocation(`/entrenamiento/${categoria}`)}
          className="w-8 h-8 flex items-center justify-center text-white/80"
          data-testid="button-close"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="bg-purple-900/60 px-4 py-3 flex items-center justify-between">
        <div className="text-center">
          <span className="text-purple-300 text-xs block">NIVEL</span>
          <span className="text-white text-2xl font-bold">{getNivelFromPatron(ejercicio.patron)}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-purple-300 text-xs block">CORRECTOS</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl">😊</span>
              <span className="text-white text-2xl font-bold">{correctos}</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-purple-300 text-xs block">INCORRECTOS</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl">😔</span>
              <span className="text-white text-2xl font-bold">{incorrectos}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center px-6 py-6">
        <div className="text-center mb-6">
          <span className="text-white text-lg font-bold">
            {ejercicio.velocidad} palabras /min.
          </span>
        </div>

        <AnimatePresence mode="wait">
          {(gameState === "ready" || gameState === "animacion_inicial" || gameState === "preparando" || gameState === "playing") && (
            <motion.div 
              key={`grid-${ejercicioActual}`}
              initial={esSegundoEjercicioEnAdelante ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 mb-8 w-full max-w-md"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {Array.from({ length: totalPos }).map((_, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center gap-3"
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
                    {gameState === "preparando" && (
                      <motion.div
                        key={`static-circle-${idx}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.05, type: "spring", stiffness: 400, damping: 15 }}
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
                </div>
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
