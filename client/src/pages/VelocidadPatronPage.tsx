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
    
    // Ajustar tamaño de círculos según cantidad
    const dotSize = total > 6 ? "w-2 h-2" : "w-2.5 h-2.5";
    const gap = total > 6 ? "gap-1" : "gap-1.5";
    
    return (
      <div 
        className={`grid ${gap}`}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {[...Array(total)].map((_, i) => (
          <div 
            key={i} 
            className={`${dotSize} rounded-full bg-white/90 shadow-sm`}
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

  // Skeleton para carga instantánea
  const SkeletonCard = () => (
    <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-5 animate-pulse">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-2xl bg-purple-200" />
      </div>
      <div className="h-5 bg-purple-200 rounded w-20 mx-auto mb-2" />
      <div className="h-3 bg-purple-100 rounded w-12 mx-auto" />
    </div>
  );

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
          <div className="flex justify-center mb-4">
            <img 
              src={imagen} 
              alt="Ejercicio" 
              className="w-48 h-48 object-contain"
            />
          </div>
        )}

        <div className="bg-white rounded-t-3xl flex-1 px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            {titulo}
          </h1>

          <p className="text-gray-500 text-sm mb-6">Selecciona el nivel de dificultad:</p>

          <div className="grid grid-cols-2 gap-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : patrones.length === 0 ? (
              <p className="col-span-2 text-center text-gray-500">No hay ejercicios disponibles</p>
            ) : (
              patrones.map((patron) => (
                <button
                  key={patron}
                  onClick={() => setLocation(`/velocidad/${categoria}/${itemId}/patron/${encodeURIComponent(patron)}`)}
                  className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-5 text-center hover:border-purple-500 hover:shadow-xl hover:scale-105 transition-all duration-200"
                  data-testid={`button-patron-${patron}`}
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                      {getPatronIcon(patron)}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {getPatronLabel(patron)}
                  </div>
                  <div className="text-xs text-purple-500 mt-1 font-medium">
                    {patron}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
