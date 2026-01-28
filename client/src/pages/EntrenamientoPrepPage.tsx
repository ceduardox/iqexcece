import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface PrepData {
  prepImage: string;
  prepTitle: string;
  prepSubtitle: string;
  prepInstructions: string;
  prepButtonText: string;
}

export default function EntrenamientoPrepPage() {
  const { categoria, itemId } = useParams<{ categoria: string; itemId: string }>();
  const [, setLocation] = useLocation();
  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrepData = async () => {
      try {
        const res = await fetch(`/api/entrenamiento/item/${itemId}`);
        const data = await res.json();
        if (data.item) {
          setPrepData({
            prepImage: data.item.prepImage || "",
            prepTitle: data.item.prepTitle || data.item.title || "Preparación",
            prepSubtitle: data.item.prepSubtitle || "",
            prepInstructions: data.item.prepInstructions || "",
            prepButtonText: data.item.prepButtonText || "Empezar",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadPrepData();
  }, [itemId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-pink-500 flex flex-col">
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
          {prepData?.prepImage && (
            <img 
              src={prepData.prepImage} 
              alt="" 
              className="w-48 h-48 object-contain"
              data-testid="img-prep"
            />
          )}
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 
            className="text-3xl font-bold text-white"
            data-testid="text-prep-title"
          >
            {prepData?.prepTitle}
          </h1>
          
          {prepData?.prepSubtitle && (
            <p 
              className="text-xl font-semibold text-white"
              data-testid="text-prep-subtitle"
            >
              {prepData.prepSubtitle}
            </p>
          )}
          
          {prepData?.prepInstructions && (
            <p 
              className="text-white/90 text-lg max-w-sm mx-auto"
              data-testid="text-prep-instructions"
            >
              {prepData.prepInstructions}
            </p>
          )}
        </motion.div>

        <motion.button
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          onClick={() => {
            // Por ahora vuelve a la página de entrenamiento
            // Después aquí irá la ruta a los ejercicios
            alert("Aquí comenzarán los ejercicios");
          }}
          className="mt-10 px-12 py-4 bg-orange-500 text-white font-bold text-xl rounded-full shadow-lg"
          data-testid="button-start"
        >
          {prepData?.prepButtonText || "Empezar"}
        </motion.button>
      </main>
    </div>
  );
}
