import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { LanguageButton } from "@/components/LanguageButton";

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
        
        if (velocidadData.ejercicio) {
          setTitulo(velocidadData.ejercicio.titulo || "Velocidad Lectora");
          const parsed = JSON.parse(velocidadData.ejercicio.niveles || "[]");
          setNiveles(parsed);
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
    const patrones: Record<string, JSX.Element> = {
      "2x2": (
        <div className="grid grid-cols-2 gap-1.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-purple-400" />
          ))}
        </div>
      ),
      "3x3": (
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          ))}
        </div>
      ),
      "2x3": (
        <div className="grid grid-cols-3 gap-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          ))}
        </div>
      ),
      "3x2": (
        <div className="grid grid-cols-2 gap-1.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          ))}
        </div>
      ),
      "4x4": (
        <div className="grid grid-cols-4 gap-0.5">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-purple-400" />
          ))}
        </div>
      ),
    };
    return patrones[patron] || patrones["2x2"];
  };

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
        <header className="p-4 flex items-center justify-between">
          <button
            onClick={() => setLocation(`/entrenamiento-edad/${itemId}`)}
            className="flex items-center gap-2 text-white font-semibold"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6" />
            Volver
          </button>
          <LanguageButton />
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-white text-xl">No hay niveles disponibles</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-pink-500 flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={() => setLocation(`/entrenamiento-edad/${itemId}`)}
          className="flex items-center gap-2 text-white font-semibold"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6" />
          Volver
        </button>
        <LanguageButton />
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
            {niveles.map((nivel, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setLocation(`/velocidad/${categoria}/${itemId}/ejercicio/${nivel.nivel}`)}
                className="bg-white border-2 border-purple-200 rounded-2xl p-6 text-center hover:border-purple-400 hover:shadow-lg transition-all"
                data-testid={`button-nivel-${nivel.nivel}`}
              >
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                    {getPatronIcon(nivel.patron)}
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-700">Nivel {nivel.nivel}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
