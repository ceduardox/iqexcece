import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CurvedHeader } from "@/components/CurvedHeader";
import { BottomNavBar } from "@/components/BottomNavBar";
import cerebroNumerosImg from "@assets/image_1769698514762.png";

interface IntroData {
  id: string;
  titulo: string;
  descripcion: string;
  subtitulo: string;
  imagenCabecera: string | null;
}

export default function NumerosIntroPage() {
  const { categoria, itemId } = useParams<{ categoria: string; itemId: string }>();
  const [, setLocation] = useLocation();
  const [introData, setIntroData] = useState<IntroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIntro = async () => {
      try {
        const res = await fetch(`/api/numeros-intro/${itemId}`);
        const data = await res.json();
        if (data.intro) {
          setIntroData(data.intro);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadIntro();
  }, [itemId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const titulo = introData?.titulo || "Identifica rápidamente\nNúmeros y Letras";
  const descripcion = introData?.descripcion || "¡Haz más fuerte tu vista jugando!";
  const subtitulo = introData?.subtitulo || "Identifica el número o letra para ver el mundo más grande";
  const imagen = introData?.imagenCabecera || cerebroNumerosImg;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CurvedHeader showBack onBack={() => setLocation(`/entrenamiento/${categoria}`)} />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 -mt-2">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(6, 182, 212, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="flex flex-col items-center pt-8 pb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <img 
                src={imagen} 
                alt="Cerebro con números y letras" 
                className="w-48 h-48 object-contain"
                data-testid="img-numeros-intro"
              />
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center space-y-4 px-4"
            >
              <h1 
                className="text-2xl font-bold text-gray-800 leading-tight whitespace-pre-line"
                data-testid="text-numeros-title"
              >
                {titulo}
              </h1>
              
              <p 
                className="text-lg font-semibold"
                style={{ color: "#8a3ffc" }}
                data-testid="text-numeros-subtitle"
              >
                {descripcion}
              </p>
              
              <p 
                className="text-gray-500 text-base max-w-xs mx-auto"
                data-testid="text-numeros-instructions"
              >
                {subtitulo}
              </p>
            </motion.div>

            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              onClick={() => {
                sessionStorage.setItem("numerosItemId", itemId || "");
                setLocation(`/numeros/${categoria}/${itemId}/niveles`);
              }}
              className="mt-10 px-12 py-4 text-white font-bold text-xl rounded-lg shadow-lg hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
              data-testid="button-start-numeros"
            >
              Empezar
            </motion.button>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
