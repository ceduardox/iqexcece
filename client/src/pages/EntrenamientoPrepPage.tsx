import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Zap, Brain, Grid3X3 } from "lucide-react";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import { useSounds } from "@/hooks/use-sounds";
import { LanguageButton } from "@/components/LanguageButton";
import { useTranslation } from "react-i18next";
import menuCurveImg from "@assets/menu_1769957804819.png";

interface PrepData {
  imagen: string;
  titulo: string;
  subtitulo: string;
  instrucciones: string;
  textoBoton: string;
  tipoEjercicio: string;
}

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";
const GAME_TYPES = ["neurosync", "neurolink", "memoryflash"];

function NeuroSyncAnimation() {
  return (
    <div className="relative w-48 h-48 mx-auto">
      <div className="absolute inset-0 rounded-full border-2 border-purple-300/30" />
      <div className="absolute inset-4 rounded-full border-2 border-cyan-300/30" />
      <div className="absolute inset-8 rounded-full border-2 border-purple-400/30" />
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 rounded-full"
          style={{
            background: i % 2 === 0 ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "linear-gradient(135deg, #06B6D4, #8B5CF6)",
            top: "50%", left: "50%",
          }}
          animate={{
            x: [0, Math.cos(i * 72 * Math.PI / 180) * 60, 0],
            y: [0, Math.sin(i * 72 * Math.PI / 180) * 60, 0],
            scale: [0.5, 1.2, 0.5],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
        />
      ))}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)" }}
        animate={{ scale: [1, 1.15, 1], boxShadow: ["0 0 10px rgba(139,92,246,0.3)", "0 0 25px rgba(139,92,246,0.6)", "0 0 10px rgba(139,92,246,0.3)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Zap className="w-6 h-6 text-white" />
      </motion.div>
    </div>
  );
}

function NeuroLinkAnimation() {
  const nodes = useMemo(() => [
    { x: 80, y: 30 }, { x: 140, y: 60 }, { x: 50, y: 90 },
    { x: 120, y: 120 }, { x: 70, y: 150 },
  ], []);
  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg width="192" height="192" viewBox="0 0 192 192" className="absolute inset-0">
        {nodes.map((n, i) => i < nodes.length - 1 ? (
          <motion.line
            key={`l${i}`} x1={n.x} y1={n.y} x2={nodes[i + 1].x} y2={nodes[i + 1].y}
            stroke="url(#linkGrad)" strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          />
        ) : null)}
        <defs>
          <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      {nodes.map((n, i) => (
        <motion.div
          key={i}
          className="absolute w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ left: n.x - 20, top: n.y - 20, background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)" }}
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
        >
          {i + 1}
        </motion.div>
      ))}
    </div>
  );
}

function MemoryFlashAnimation() {
  const cells = useMemo(() => Array.from({ length: 9 }, (_, i) => i), []);
  const seq = [0, 4, 8, 2, 6];
  return (
    <div className="relative w-40 h-40 mx-auto">
      <div className="grid grid-cols-3 gap-2 w-full h-full">
        {cells.map((i) => (
          <motion.div
            key={i}
            className="rounded-lg"
            style={{ background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)" }}
            animate={seq.includes(i) ? {
              background: ["rgba(139,92,246,0.1)", "linear-gradient(135deg,#8B5CF6,#06B6D4)", "rgba(139,92,246,0.1)"],
              scale: [1, 1.05, 1],
            } : {}}
            transition={seq.includes(i) ? {
              duration: 2.5, repeat: Infinity, delay: seq.indexOf(i) * 0.4, ease: "easeInOut",
            } : {}}
          />
        ))}
      </div>
    </div>
  );
}

function GamePrepPage({ gameType, categoria, itemId }: { gameType: string; categoria: string; itemId: string }) {
  const [, setLocation] = useLocation();
  const { playSound } = useSounds();
  const { t } = useTranslation();

  const config: Record<string, { icon: typeof Zap; gradient: string; animation: () => JSX.Element }> = {
    neurosync: { icon: Zap, gradient: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)", animation: NeuroSyncAnimation },
    neurolink: { icon: Brain, gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)", animation: NeuroLinkAnimation },
    memoryflash: { icon: Grid3X3, gradient: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)", animation: MemoryFlashAnimation },
  };

  const c = config[gameType] || config.neurosync;
  const AnimComp = c.animation;

  const handleStart = () => {
    playSound("iphone");
    setLocation(`/${gameType}/${categoria}/${itemId}`);
  };

  return (
    <div className="h-[100dvh] bg-white flex flex-col overflow-hidden">
      <header className="sticky top-0 z-50 w-full md:hidden" style={{ background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)" }}>
        <div className="relative pt-3 pb-2 px-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { playSound("iphone"); window.history.back(); }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255, 255, 255, 0.9)", boxShadow: "0 2px 8px rgba(138, 63, 252, 0.15)" }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#8a3ffc" }} />
            </button>
            <img src={LOGO_URL} alt="IQX" className="h-10 w-auto object-contain" />
            <LanguageButton />
          </div>
        </div>
      </header>
      <div className="w-full sticky z-40 md:hidden" style={{ top: 56, marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center px-5 pb-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <AnimComp />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-800 text-center leading-tight mb-2"
          data-testid="text-prep-title"
        >
          {t(`${gameType}.prepTitle`)}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-semibold text-center mb-3"
          style={{ color: "#06B6D4" }}
          data-testid="text-prep-subtitle"
        >
          {t(`${gameType}.prepSubtitle`)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full max-w-sm mb-6"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: c.gradient }}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{t("prep.instructions")}</h3>
              <p className="text-gray-500 text-xs leading-relaxed" data-testid="text-prep-instructions">
                {t(`${gameType}.prepInstructions`)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleStart}
          className="w-full max-w-sm py-3.5 rounded-full font-semibold text-white text-base shadow-lg"
          style={{ background: c.gradient }}
          whileTap={{ scale: 0.98 }}
          data-testid="button-start"
        >
          {t(`${gameType}.prepButton`)}
        </motion.button>
      </main>

      <TrainingNavBar activePage="entrenar" categoria={categoria} />
    </div>
  );
}

export default function EntrenamientoPrepPage() {
  const { categoria, itemId } = useParams<{ categoria: string; itemId: string }>();
  const [, setLocation] = useLocation();
  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameType, setGameType] = useState<string | null>(null);
  const { playSound } = useSounds();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'es';

  useEffect(() => {
    const loadPrepData = async () => {
      try {
        const itemRes = await fetch(`/api/entrenamiento/item/${itemId}?lang=${lang}`);
        const itemData = await itemRes.json();
        const tipoEjercicio = itemData.item?.tipoEjercicio || "velocidad";

        if (tipoEjercicio === "numeros") {
          setLocation(`/numeros/${categoria}/${itemId}`);
          return;
        }

        if (GAME_TYPES.includes(tipoEjercicio)) {
          setGameType(tipoEjercicio);
          setLoading(false);
          return;
        }

        const item = itemData.item;
        if (item && (item.prepTitle || item.prepInstructions || item.prepSubtitle || item.prepButtonText)) {
          setPrepData({
            imagen: item.prepImage || "",
            titulo: item.prepTitle || item.title || "",
            subtitulo: item.prepSubtitle || "",
            instrucciones: item.prepInstructions || "",
            textoBoton: item.prepButtonText || "",
            tipoEjercicio,
          });
        } else {
          const prepRes = await fetch(`/api/prep-page/${categoria}`);
          const prepPageData = await prepRes.json();
          if (prepPageData.page) {
            setPrepData({
              imagen: prepPageData.page.imagen || "",
              titulo: prepPageData.page.titulo || "",
              subtitulo: prepPageData.page.subtitulo || "",
              instrucciones: prepPageData.page.instrucciones || "",
              textoBoton: prepPageData.page.textoBoton || "",
              tipoEjercicio,
            });
          } else if (item) {
            setPrepData({
              imagen: item.prepImage || "",
              titulo: item.title || "",
              subtitulo: "",
              instrucciones: "",
              textoBoton: "",
              tipoEjercicio,
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadPrepData();
  }, [categoria, itemId, setLocation, lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (gameType) {
    return <GamePrepPage gameType={gameType} categoria={categoria || ""} itemId={itemId || ""} />;
  }

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
    } else {
      setLocation(`/velocidad/${categoria}/${itemId}`);
    }
  };

  const handleBack = () => {
    playSound("iphone");
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 w-full md:hidden" style={{ background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)" }}>
        <div className="relative pt-3 pb-2 px-5">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255, 255, 255, 0.9)", boxShadow: "0 2px 8px rgba(138, 63, 252, 0.15)" }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#8a3ffc" }} />
            </button>
            <img src={LOGO_URL} alt="IQX" className="h-10 w-auto object-contain" />
            <LanguageButton />
          </div>
        </div>
      </header>
      <div className="w-full sticky z-40 md:hidden" style={{ top: 56, marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

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
                {prepData?.titulo || t("prep.defaultTitle")}
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
            {prepData?.textoBoton || t("prep.defaultButton")}
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
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{t("prep.instructions")}</h3>
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
