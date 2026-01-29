import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";

interface Nivel {
  nivel: number;
  patron: string;
  velocidad: number;
  palabras: string;
  opciones: string;
  tipoPregunta: string;
}

export default function VelocidadLevelPage() {
  const { categoria, itemId } = useParams<{ categoria: string; itemId: string }>();
  const [, setLocation] = useLocation();
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [titulo, setTitulo] = useState("Velocidad Lectora");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/velocidad/${itemId}`);
        const data = await res.json();
        if (data.ejercicio) {
          setTitulo(data.ejercicio.titulo || "Velocidad Lectora");
          const parsed = JSON.parse(data.ejercicio.niveles || "[]");
          setNiveles(parsed);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [itemId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (niveles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-pink-500 flex flex-col">
        <header className="p-4">
          <button
            onClick={() => setLocation(`/entrenamiento/${categoria}`)}
            className="flex items-center gap-2 text-white font-semibold"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6" />
            Volver
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-white text-xl">No hay niveles disponibles</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-pink-500 flex flex-col">
      <header className="p-4">
        <button
          onClick={() => setLocation(`/entrenamiento/${categoria}`)}
          className="flex items-center gap-2 text-white font-semibold"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6" />
          Volver
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Zap className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">{titulo}</h1>
          <p className="text-white/80">Selecciona un nivel</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {niveles.map((nivel, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setLocation(`/velocidad/${categoria}/${itemId}/ejercicio/${nivel.nivel}`)}
              className="bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-2xl p-6 text-center hover:bg-white/30 transition-all"
              data-testid={`button-nivel-${nivel.nivel}`}
            >
              <div className="text-4xl font-bold text-white mb-2">{nivel.nivel}</div>
              <div className="text-lg text-yellow-200 font-semibold">{nivel.velocidad} pal/min</div>
              <div className="text-xs text-white/60 mt-1">Patrón {nivel.patron}</div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
