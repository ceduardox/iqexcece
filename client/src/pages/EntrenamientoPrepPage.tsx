import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface PrepData {
  imagen: string;
  titulo: string;
  subtitulo: string;
  instrucciones: string;
  textoBoton: string;
  tipoEjercicio: string;
}

export default function EntrenamientoPrepPage() {
  const { categoria, itemId } = useParams<{ categoria: string; itemId: string }>();
  const [, setLocation] = useLocation();
  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrepData = async () => {
      try {
        // Cargar datos del item para obtener el tipo de ejercicio
        const itemRes = await fetch(`/api/entrenamiento/item/${itemId}`);
        const itemData = await itemRes.json();
        const tipoEjercicio = itemData.item?.tipoEjercicio || "velocidad";
        
        // Intentar cargar la página de preparación de la categoría
        const prepRes = await fetch(`/api/prep-page/${categoria}`);
        const prepPageData = await prepRes.json();
        
        if (prepPageData.page) {
          setPrepData({
            imagen: prepPageData.page.imagen || "",
            titulo: prepPageData.page.titulo || "Preparación",
            subtitulo: prepPageData.page.subtitulo || "",
            instrucciones: prepPageData.page.instrucciones || "",
            textoBoton: prepPageData.page.textoBoton || "Empezar",
            tipoEjercicio,
          });
        } else if (itemData.item) {
          setPrepData({
            imagen: itemData.item.prepImage || "",
            titulo: itemData.item.prepTitle || itemData.item.title || "Preparación",
            subtitulo: itemData.item.prepSubtitle || "",
            instrucciones: itemData.item.prepInstructions || "",
            textoBoton: itemData.item.prepButtonText || "Empezar",
            tipoEjercicio,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadPrepData();
  }, [categoria, itemId]);

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
          {prepData?.imagen && (
            <img 
              src={prepData.imagen} 
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
            {prepData?.titulo}
          </h1>
          
          {prepData?.subtitulo && (
            <p 
              className="text-xl font-semibold text-white"
              data-testid="text-prep-subtitle"
            >
              {prepData.subtitulo}
            </p>
          )}
          
          {prepData?.instrucciones && (
            <p 
              className="text-white/90 text-lg max-w-sm mx-auto"
              data-testid="text-prep-instructions"
            >
              {prepData.instrucciones}
            </p>
          )}
        </motion.div>

        <motion.button
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          onClick={() => {
            const tipo = prepData?.tipoEjercicio || "velocidad";
            if (tipo === "velocidad") {
              setLocation(`/velocidad/${categoria}/${itemId}/ejercicio/1`);
            } else if (tipo === "lectura") {
              setLocation(`/lectura/${categoria}/${itemId}`);
            } else if (tipo === "memoria") {
              setLocation(`/memoria/${categoria}/${itemId}`);
            } else {
              setLocation(`/velocidad/${categoria}/${itemId}/ejercicio/1`);
            }
          }}
          className="mt-10 px-12 py-4 bg-orange-500 text-white font-bold text-xl rounded-full shadow-lg"
          data-testid="button-start"
        >
          {prepData?.textoBoton || "Empezar"}
        </motion.button>
      </main>
    </div>
  );
}
