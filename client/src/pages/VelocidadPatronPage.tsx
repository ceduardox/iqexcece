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
          // Extraer patrones únicos y ordenarlos por nivel
          const patronesUnicos = Array.from(new Set(niveles.map(n => n.patron)));
          // Ordenar por nivel (usando getPatronOrder)
          const getOrder = (p: string) => {
            const order: Record<string, number> = {
              "2x2": 1, "1x3": 1, "2x3": 2, "3x2": 2, "2x4": 3, "4x2": 3, "3x3": 4, "4x4": 5
            };
            return order[p] || 99;
          };
          patronesUnicos.sort((a, b) => getOrder(a) - getOrder(b));
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
            className="w-3 h-3 rounded-full bg-white/90 shadow-sm"
          />
        ))}
      </div>
    );
  };

  const getPatronOrder = (patron: string) => {
    const order: Record<string, number> = {
      "2x2": 1,
      "1x3": 1,
      "2x3": 2,
      "3x2": 2,
      "2x4": 3,
      "4x2": 3,
      "3x3": 4,
      "4x4": 5,
    };
    return order[patron] || 99;
  };

  const getPatronLabel = (patron: string) => {
    const order = getPatronOrder(patron);
    return `Nivel ${order}`;
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

          <p className="text-gray-500 text-sm mb-6">Selecciona el nivel de dificultad:</p>

          <div className="grid grid-cols-2 gap-4">
            {patrones.map((patron, index) => (
              <motion.button
                key={patron}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setLocation(`/velocidad/${categoria}/${itemId}/patron/${encodeURIComponent(patron)}`)}
                className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-5 text-center hover:border-purple-500 hover:shadow-xl hover:scale-105 transition-all duration-200"
                data-testid={`button-patron-${patron}`}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                    <div className="scale-110">
                      {getPatronIcon(patron)}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {getPatronLabel(patron)}
                </div>
                <div className="text-xs text-purple-500 mt-1 font-medium">
                  {patron}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
