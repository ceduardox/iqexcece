import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface Ejercicio {
  nivel: number;
  patron: string;
  velocidad: number;
  palabras: string;
  opciones: string;
  tipoPregunta: string;
}

export default function VelocidadPatronPage() {
  const { categoria, itemId } = useParams<{ categoria: string; itemId: string }>();
  const [, setLocation] = useLocation();
  const [patrones, setPatrones] = useState<string[]>([]);
  const [titulo, setTitulo] = useState("Mejora tu Velocidad de Lectura");
  const [imagen, setImagen] = useState("");
  const [loading, setLoading] = useState(true);

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
          const niveles: Ejercicio[] = JSON.parse(velocidadData.ejercicio.niveles);
          // Extraer patrones únicos
          const patronesUnicos = Array.from(new Set(niveles.map(n => n.patron)));
          setPatrones(patronesUnicos);
          setTitulo(velocidadData.ejercicio.titulo || itemData.item?.title || "Mejora tu Velocidad de Lectura");
        }
        
        if (itemData.item?.prepImage) {
          setImagen(itemData.item.prepImage);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [itemId]);

  const getPatronIcon = (patron: string) => {
    const [cols, rows] = patron.split("x").map(n => parseInt(n) || 2);
    const total = cols * rows;
    
    return (
      <div 
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {[...Array(total)].map((_, i) => (
          <div 
            key={i} 
            className="w-3 h-3 rounded-full bg-purple-400"
          />
        ))}
      </div>
    );
  };

  const getPatronLabel = (patron: string) => {
    const labels: Record<string, string> = {
      "2x2": "Nivel 1",
      "2x3": "Nivel 2",
      "3x2": "Nivel 2",
      "3x3": "Nivel 3",
      "4x4": "Nivel 4",
      "1x3": "Nivel 1",
    };
    return labels[patron] || `Patrón ${patron}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (patrones.length === 0) {
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
          <p className="text-white text-xl">No hay ejercicios disponibles</p>
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

      <main className="flex-1 flex flex-col">
        {imagen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <img 
              src={imagen} 
              alt="Ejercicio" 
              className="w-48 h-48 object-contain"
            />
          </motion.div>
        )}

        <div className="bg-white rounded-t-3xl flex-1 px-6 py-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-gray-800 text-center mb-6"
          >
            {titulo}
          </motion.h1>

          <p className="text-gray-600 mb-4">Elige un nivel:</p>

          <div className="grid grid-cols-2 gap-4">
            {patrones.map((patron, index) => (
              <motion.button
                key={patron}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setLocation(`/velocidad/${categoria}/${itemId}/patron/${encodeURIComponent(patron)}`)}
                className="bg-white border-2 border-purple-200 rounded-2xl p-6 text-center hover:border-purple-400 hover:shadow-lg transition-all"
                data-testid={`button-patron-${patron}`}
              >
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                    {getPatronIcon(patron)}
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  {getPatronLabel(patron)}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
