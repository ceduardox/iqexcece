import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Share2, MessageCircle } from "lucide-react";

export default function NumerosResultPage() {
  const [, navigate] = useLocation();
  const [results, setResults] = useState({
    correctas: 0,
    incorrectas: 0,
    sinResponder: 0,
    tiempo: 60,
    nivel: "Números"
  });
  const [nivelesPath, setNivelesPath] = useState("/");

  useEffect(() => {
    const stored = sessionStorage.getItem("numerosResultados");
    if (stored) {
      setResults(JSON.parse(stored));
    }
    const storedPath = sessionStorage.getItem("numerosNivelesPath");
    if (storedPath) {
      setNivelesPath(storedPath);
    }
  }, []);

  const handleShare = async () => {
    const text = `¡He completado el ejercicio de ${results.nivel}!\n✅ Correctas: ${results.correctas}\n❌ Incorrectas: ${results.incorrectas}\n⏱️ Tiempo: ${results.tiempo}s`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mi resultado - IQ Exponencial", text });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(text);
      alert("Resultado copiado al portapapeles");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-400 via-teal-500 to-emerald-600 flex flex-col">
      <header className="p-6 text-center">
        <p className="text-white/80 text-sm font-medium tracking-wider mb-2">
          MÉTODOS AVANZADOS<br/>DE APRENDIZAJE
        </p>
        <div className="flex items-center justify-center gap-1 mb-1">
          <span className="text-white text-4xl font-black tracking-tight">iQ</span>
        </div>
        <p className="text-white text-2xl font-light italic">max</p>
        <p className="text-white/90 text-sm mt-1">Intelecto al máximo</p>
      </header>

      <main className="flex-1 flex flex-col items-center px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <p className="text-white/70 text-xs tracking-widest mb-2">RESULTADO</p>
          <h1 className="text-2xl font-bold text-white leading-tight">
            Identifica<br/>rápidamente<br/>Números y Letras
          </h1>
        </motion.div>

        {/* Gráfico circular animado */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="mb-6"
        >
          <div className="relative w-36 h-36">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ 
                  strokeDashoffset: 2 * Math.PI * 42 * (1 - (results.correctas / (results.correctas + results.incorrectas + results.sinResponder || 1))) 
                }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="text-4xl font-black text-white"
              >
                {Math.round((results.correctas / (results.correctas + results.incorrectas + results.sinResponder || 1)) * 100)}%
              </motion.span>
              <span className="text-xs font-medium text-white/80">Aciertos</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
        >
          <div className="text-center mb-4">
            <p className="text-gray-500 text-xs tracking-wider">NIVEL</p>
            <p className="text-gray-800 text-xl font-bold">{results.nivel}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-teal-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-teal-600">{results.correctas}</p>
              <p className="text-xs text-gray-500">Correctas</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-500">{results.incorrectas}</p>
              <p className="text-xs text-gray-500">Incorrectas</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-600">{results.sinResponder}</p>
              <p className="text-xs text-gray-500">Sin responder</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-cyan-600">{results.tiempo}s</p>
              <p className="text-xs text-gray-500">Tiempo</p>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="p-4">
        <div className="bg-teal-600/50 rounded-full p-2 flex items-center justify-around">
          <button
            onClick={() => navigate(nivelesPath)}
            className="flex flex-col items-center gap-1 px-4 py-2 bg-orange-500 rounded-full text-white"
            data-testid="button-new-test"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Nuevo Test</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 px-4 py-2 text-white"
            data-testid="button-share"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-medium">Compartir</span>
          </button>
          
          <button
            onClick={() => window.open("https://wa.me/", "_blank")}
            className="flex flex-col items-center gap-1 px-4 py-2 text-white"
            data-testid="button-contact"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">Escríbenos</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
