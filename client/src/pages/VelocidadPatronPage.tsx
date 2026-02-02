import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Grid3X3 } from "lucide-react";
import { CurvedHeader } from "@/components/CurvedHeader";
import { BottomNavBar } from "@/components/BottomNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

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
    <div className="min-h-screen bg-white flex flex-col">
      <CurvedHeader showBack onBack={() => { playButtonSound(); setLocation(`/entrenamiento-edad/${itemId}`); }} />
      
      <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="px-5 pt-4 pb-6">
            {imagen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center mb-4"
              >
                <img src={imagen} alt="" className="w-24 h-24 object-contain" />
              </motion.div>
            )}
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-gray-800 text-center mb-2"
            >
              {titulo}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-gray-500 text-center"
            >
              Selecciona el nivel de dificultad
            </motion.p>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
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
              patrones.map((patron, idx) => (
                <motion.button
                  key={patron}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => { playButtonSound(); setLocation(`/velocidad/${categoria}/${itemId}/patron/${encodeURIComponent(patron)}`); }}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
                  data-testid={`button-patron-${patron}`}
                >
                  <div className="flex justify-center mb-3">
                    <div 
                      className="w-14 h-14 rounded-lg flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
                    >
                      {getPatronIcon(patron)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {getPatronLabel(patron)}
                  </div>
                  <div className="text-xs text-purple-500 mt-1">
                    {patron}
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
