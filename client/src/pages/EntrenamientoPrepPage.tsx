import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Target } from "lucide-react";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import { useSounds } from "@/hooks/use-sounds";
import { LanguageButton } from "@/components/LanguageButton";

interface PrepData {
  imagen: string;
  titulo: string;
  subtitulo: string;
  instrucciones: string;
  textoBoton: string;
  tipoEjercicio: string;
}

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

export default function EntrenamientoPrepPage() {
  const { categoria, itemId } = useParams<{ categoria: string; itemId: string }>();
  const [, setLocation] = useLocation();
  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [loading, setLoading] = useState(true);
  const { playSound } = useSounds();

  useEffect(() => {
    const loadPrepData = async () => {
      try {
        const itemRes = await fetch(`/api/entrenamiento/item/${itemId}`);
        const itemData = await itemRes.json();
        const tipoEjercicio = itemData.item?.tipoEjercicio || "velocidad";
        
        if (tipoEjercicio === "numeros") {
          setLocation(`/numeros/${categoria}/${itemId}`);
          return;
        }
        
        const prepRes = await fetch(`/api/prep-page/${categoria}`);
        const prepPageData = await prepRes.json();
        
        if (prepPageData.page) {
          setPrepData({
            imagen: prepPageData.page.imagen || "",
            titulo: prepPageData.page.titulo || "Preparación",
            subtitulo: prepPageData.page.subtitulo || "",
            instrucciones: prepPageData.page.instrucciones || "",
            textoBoton: prepPageData.page.textoBoton || "Iniciar sesión",
            tipoEjercicio,
          });
        } else if (itemData.item) {
          setPrepData({
            imagen: itemData.item.prepImage || "",
            titulo: itemData.item.prepTitle || itemData.item.title || "Preparación",
            subtitulo: itemData.item.prepSubtitle || "",
            instrucciones: itemData.item.prepInstructions || "",
            textoBoton: itemData.item.prepButtonText || "Iniciar sesión",
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
  }, [categoria, itemId, setLocation]);

  const handleStart = () => {
    playSound("iphone");
    const tipo = prepData?.tipoEjercicio || "velocidad";
    if (tipo === "velocidad") {
      setLocation(`/velocidad/${categoria}/${itemId}`);
    } else if (tipo === "numeros") {
      setLocation(`/numeros/${categoria}/${itemId}`);
    } else if (tipo === "lectura") {
      setLocation(`/lectura/${categoria}/${itemId}`);
    } else if (tipo === "memoria") {
      setLocation(`/memoria/${categoria}/${itemId}`);
    } else if (tipo === "aceleracion_lectura") {
      setLocation(`/aceleracion/${categoria}/${itemId}`);
    } else if (tipo === "reconocimiento_visual") {
      setLocation(`/reconocimiento/${categoria}/${itemId}`);
    } else if (tipo === "neurosync") {
      setLocation(`/neurosync/${categoria}/${itemId}`);
    } else if (tipo === "neurolink") {
      setLocation(`/neurolink/${categoria}/${itemId}`);
    } else {
      setLocation(`/velocidad/${categoria}/${itemId}`);
    }
  };

  const handleBack = () => {
    playSound("iphone");
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="relative sticky top-0 z-50 bg-white flex items-center justify-center px-5 py-3 border-b border-gray-100 md:hidden">
        <button
          onClick={handleBack}
          className="absolute left-4 p-2 text-purple-600"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <img 
          src={LOGO_URL} 
          alt="IQX" 
          className="h-8"
        />
        <div className="absolute right-5"><LanguageButton /></div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">
        <div 
          className="relative px-5 pt-6 pb-8"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 50%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="flex items-start justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1 pr-4"
            >
              <h1 
                className="text-2xl font-bold text-gray-800 leading-tight mb-2"
                data-testid="text-prep-title"
              >
                {prepData?.titulo || "Acelera tu Lectura"}
              </h1>
              
              {prepData?.subtitulo && (
                <p 
                  className="text-sm text-gray-500 leading-relaxed"
                  data-testid="text-prep-subtitle"
                >
                  {prepData.subtitulo}
                </p>
              )}
            </motion.div>

            {prepData?.imagen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex-shrink-0"
              >
                <img 
                  src={prepData.imagen} 
                  alt="" 
                  className="w-24 h-24 object-contain"
                  data-testid="img-prep"
                />
              </motion.div>
            )}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            onClick={handleStart}
            className="w-full mt-6 py-3.5 rounded-full font-semibold text-white text-base shadow-lg"
            style={{
              background: "linear-gradient(135deg, #00C9A7 0%, #00B4D8 100%)"
            }}
            whileTap={{ scale: 0.98 }}
            data-testid="button-start"
          >
            {prepData?.textoBoton || "Iniciar sesión"}
          </motion.button>
        </div>

        {prepData?.instrucciones && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="px-5 py-4"
          >
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)" }}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">Instrucciones</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {prepData.instrucciones}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <TrainingNavBar activePage="entrenar" categoria={categoria} />
    </div>
  );
}
