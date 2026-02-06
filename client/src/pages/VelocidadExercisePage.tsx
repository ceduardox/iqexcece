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
  const [velocidadMaxAlcanzada, setVelocidadMaxAlcanzada] = useState(0);
  const [intentosTotales, setIntentosTotales] = useState(0);
  const maxIntentos = 20;
  
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
  }, [velocidadActual]);
  
  useEffect(() => {
    patronRef.current = patronActual;
  }, [patronActual]);
  
  useEffect(() => {
    palabrasRef.current = palabrasRonda;
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
          nivelesFiltrados.sort((a, b) => a.velocidad - b.velocidad);
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

  const prepararEjercicio = useCallback((ej: Ejercicio) => {
    const todasPalabras = ej.palabras.split(",").map(p => p.trim()).filter(p => p);
    const todasOpciones = ej.opciones.split(",").map(o => o.trim()).filter(o => o);
    const shuffled = [...todasPalabras].sort(() => Math.random() - 0.5);
    const respuestaCorrectaCalculada = getRespuestaCorrecta(ej.tipoPregunta, shuffled);
    let opcionesMezcladas = [...todasOpciones].sort(() => Math.random() - 0.5);
    if (!opcionesMezcladas.some(op => op.toLowerCase() === respuestaCorrectaCalculada.toLowerCase())) {
      opcionesMezcladas[Math.floor(Math.random() * opcionesMezcladas.length)] = respuestaCorrectaCalculada;
    }
    const totalPos = getTotalPositions(ej.patron);
    setPalabrasRonda(shuffled);
    setOpcionesRonda(opcionesMezcladas);
    setShownWords(Array(totalPos).fill(""));
    setCurrentPosition(-1);
    setPreguntaActual(getPreguntaTexto(ej.tipoPregunta));
    setRespuestaCorrecta(respuestaCorrectaCalculada);
    setUltimaRespuesta(null);
    setVelocidadActual(ej.velocidad);
    setPatronActual(ej.patron);
    setPlayingKey(k => k + 1);
  }, []);

  const iniciarEjercicio = useCallback(() => {
    if (!ejercicio) return;
    prepararEjercicio(ejercicio);
    setVelocidadMaxAlcanzada(ejercicio.velocidad);
    
    if (esSegundoEjercicioEnAdelante) {
      setGameState("playing");
    } else {
      setGameState("animacion_inicial");
    }
  }, [ejercicio, esSegundoEjercicioEnAdelante, prepararEjercicio]);

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
      return;
    }
    
    const totalPos = getTotalPositions(patronParaUsar);
    const totalPalabras = palabrasParaUsar.length;
    const intervalMs = getIntervalMs(velocidadParaUsar);
    
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

  const [resultSubmitted, setResultSubmitted] = useState(false);

  useEffect(() => {
    if (gameState !== "final" || resultSubmitted) return;
    setResultSubmitted(true);
    const isPwa = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const totalResp = correctos + incorrectos;
    fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Entrenamiento Velocidad",
        categoria: categoria || "general",
        testType: "velocidad",
        respuestasCorrectas: correctos,
        respuestasTotales: totalResp,
        comprension: totalResp > 0 ? Math.round((correctos / totalResp) * 100) : 0,
        velocidadMaxima: velocidadMaxAlcanzada,
        isPwa: isPwa,
      }),
    }).catch(e => console.error("Error saving result:", e));
  }, [gameState, resultSubmitted, correctos, incorrectos, velocidadMaxAlcanzada, categoria]);

  const handleRespuesta = (opcion: string) => {
    const esCorrecta = opcion.toLowerCase() === respuestaCorrecta.toLowerCase();
    const newIntentos = intentosTotales + 1;
    setIntentosTotales(newIntentos);

    if (esCorrecta) {
      setCorrectos(c => c + 1);
      setUltimaRespuesta("correcta");
      const newMax = Math.max(velocidadMaxAlcanzada, ejercicio.velocidad);
      setVelocidadMaxAlcanzada(newMax);

      if (ejercicioActual >= ejercicios.length - 1 || newIntentos >= maxIntentos) {
        setGameState("final");
        return;
      }
      setEsSegundoEjercicioEnAdelante(true);
      setTimeout(() => {
        const nextIdx = ejercicioActual + 1;
        setEjercicioActual(nextIdx);
        prepararEjercicio(ejercicios[nextIdx]);
        setGameState("preparando");
      }, 500);
    } else {
      setIncorrectos(i => i + 1);
      setUltimaRespuesta("incorrecta");

      if (newIntentos >= maxIntentos) {
        setGameState("final");
        return;
      }
      setEsSegundoEjercicioEnAdelante(true);
      setTimeout(() => {
        const prevIdx = Math.max(0, ejercicioActual - 1);
        setEjercicioActual(prevIdx);
        prepararEjercicio(ejercicios[prevIdx]);
        setGameState("preparando");
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="bg-white flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
        <header 
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
        >
          <div className="h-6 w-32 bg-white/20 rounded animate-pulse mx-auto" />
          <button
            onClick={() => setLocation(`/entrenamiento-edad/${itemId}`)}
            className="w-8 h-8 flex items-center justify-center text-white/80"
          >
            <X className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (ejercicios.length === 0 || !ejercicio) {
    return (
      <div className="bg-white flex flex-col items-center justify-center p-4" style={{ height: "100dvh", overflow: "hidden" }}>
        <p className="text-gray-800 text-xl mb-4">No hay ejercicios configurados</p>
        <button
          onClick={() => setLocation(`/entrenamiento-edad/${itemId}`)}
          className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
        >
          Volver
        </button>
      </div>
    );
  }

  const { cols } = getGridDimensions(ejercicio.patron);
  const totalPos = getTotalPositions(ejercicio.patron);

  return (
    <div className="bg-white flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
      <header 
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
      >
        <h1 className="text-white font-bold text-lg flex-1 text-center">{titulo}</h1>
        <button
          onClick={() => setLocation(`/entrenamiento-edad/${itemId}`)}
          className="w-8 h-8 flex items-center justify-center text-white/80"
          data-testid="button-close"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="mx-4 bg-white rounded-xl shadow-lg px-4 py-3 -mt-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">NIVEL</span>
            <span className="text-gray-800 text-2xl font-bold">{getNivelFromPatron(ejercicio.patron)}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-gray-400 text-xs">CORRECTOS</span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg">😊</span>
                <span className="text-green-500 text-xl font-bold">{correctos}</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-gray-400 text-xs">INCORRECTOS</span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg">😢</span>
                <span className="text-red-500 text-xl font-bold">{incorrectos}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center px-6 py-4 bg-gradient-to-b from-purple-50/50 to-white overflow-auto">
        <div className="text-center mb-3">
          <span className="text-purple-600 text-lg font-bold">
            {velocidadActual} palabras /min.
          </span>
          {velocidadMaxAlcanzada > 0 && gameState !== "ready" && (
            <div className="text-gray-400 text-xs mt-1">Max alcanzado: {velocidadMaxAlcanzada} p/m</div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {(gameState === "ready" || gameState === "animacion_inicial" || gameState === "preparando" || gameState === "playing") && (
            <motion.div 
              key={`grid-${ejercicioActual}`}
              initial={esSegundoEjercicioEnAdelante ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid mb-4 w-full max-w-md"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, rowGap: "2.8rem", columnGap: "1.5rem" }}
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
                        className="text-purple-700 font-bold text-xl"
                      >
                        {shownWords[idx]}
                      </motion.span>
                    )}
                  </div>
                  <motion.div 
                    className="w-full h-1 rounded-full"
                    animate={{ 
                      backgroundColor: currentPosition === idx ? "#8a3ffc" : "#e9d5ff",
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
              className="text-white px-14 py-4 rounded-lg font-bold text-xl shadow-lg flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
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
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.15 }}
              className="w-full max-w-md"
            >
              <p className="text-gray-800 text-xl font-medium mb-6 text-center">
                {preguntaActual}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {opcionesRonda.map((opcion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRespuesta(opcion)}
                    className="bg-white border border-gray-200 hover:border-purple-400 active:scale-95 text-gray-800 py-4 px-4 rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
                    data-testid={`button-opcion-${idx}`}
                  >
                    {opcion}
                  </button>
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
                className={`w-16 h-16 mx-auto mb-2 rounded-lg flex items-center justify-center text-3xl text-white font-bold ${
                  ultimaRespuesta === "correcta" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {ultimaRespuesta === "correcta" ? "✓" : "✗"}
              </motion.div>
              <p className="text-gray-800 text-lg font-bold">
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
                className="w-20 h-20 mx-auto mb-6 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
              >
                <span className="text-white text-4xl">✓</span>
              </motion.div>
              
              <h3 className="text-gray-800 text-2xl font-bold mb-2">
                ¡Completado!
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 352" }}
                        animate={{ 
                          strokeDasharray: `${(correctos + incorrectos) > 0 ? (correctos / (correctos + incorrectos)) * 352 : 0} 352` 
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8a3ffc" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-gray-800 text-3xl font-bold">
                        {(correctos + incorrectos) > 0 ? Math.round((correctos / (correctos + incorrectos)) * 100) : 0}%
                      </span>
                      <span className="text-gray-400 text-xs">Precisión</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-100 to-cyan-100 rounded-lg p-4 mb-4 text-center">
                  <div className="text-purple-700 text-3xl font-bold">{velocidadMaxAlcanzada}</div>
                  <div className="text-purple-500 text-sm font-medium">Velocidad Máxima (p/m)</div>
                </div>

                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-green-500 text-2xl font-bold">{correctos}</span>
                    </div>
                    <p className="text-gray-500 text-xs">CORRECTOS</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-red-500 text-2xl font-bold">{incorrectos}</span>
                    </div>
                    <p className="text-gray-500 text-xs">INCORRECTOS</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-purple-500 text-2xl font-bold">{intentosTotales}</span>
                    </div>
                    <p className="text-gray-500 text-xs">INTENTOS</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEjercicioActual(0);
                    setCorrectos(0);
                    setIncorrectos(0);
                    setUltimaRespuesta(null);
                    setEsSegundoEjercicioEnAdelante(false);
                    setVelocidadMaxAlcanzada(0);
                    setIntentosTotales(0);
                    setResultSubmitted(false);
                    setGameState("ready");
                  }}
                  className="text-white px-8 py-3 rounded-lg font-semibold text-base shadow-md"
                  style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
                  data-testid="button-repetir-todo"
                >
                  Repetir Todo
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation(`/entrenamiento-edad/${itemId}`)}
                  className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold text-base"
                  data-testid="button-volver"
                >
                  Volver
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
