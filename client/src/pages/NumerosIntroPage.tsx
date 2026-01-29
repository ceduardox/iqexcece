import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-b from-teal-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  const titulo = introData?.titulo || "Identifica rápidamente\nNúmeros y Letras";
  const descripcion = introData?.descripcion || "¡Haz más fuerte tu vista jugando!";
  const subtitulo = introData?.subtitulo || "Identifica el número o letra para ver el mundo más grande";
  const imagen = introData?.imagenCabecera || cerebroNumerosImg;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-400 via-teal-500 to-emerald-600 flex flex-col">
      <header className="p-4 flex items-center">
        <button
          onClick={() => setLocation(`/entrenamiento/${categoria}`)}
          className="flex items-center gap-2 text-white font-semibold text-lg"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6" />
          Volver
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <img 
            src={imagen} 
            alt="Cerebro con números y letras" 
            className="w-56 h-56 object-contain"
            data-testid="img-numeros-intro"
          />
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 
            className="text-2xl font-bold text-white leading-tight whitespace-pre-line"
            data-testid="text-numeros-title"
          >
            {titulo}
          </h1>
          
          <p 
            className="text-lg font-semibold text-white"
            data-testid="text-numeros-subtitle"
          >
            {descripcion}
          </p>
          
          <p 
            className="text-white/90 text-base max-w-xs mx-auto"
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
          className="mt-10 px-12 py-4 bg-orange-500 text-white font-bold text-xl rounded-full shadow-lg hover:bg-orange-600 transition-colors"
          data-testid="button-start-numeros"
        >
          Empezar
        </motion.button>
      </main>
    </div>
  );
}
