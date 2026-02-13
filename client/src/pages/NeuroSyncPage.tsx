import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Zap, Target, Brain } from "lucide-react";
import { LanguageButton } from "@/components/LanguageButton";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

interface Impulse {
  id: number;
  x: number;
  y: number;
  speed: number;
}

type GamePhase = "prep" | "playing" | "finished";

export default function NeuroSyncPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ categoria: string; itemId: string }>();
  const categoria = params.categoria || "general";
  const itemId = params.itemId || "";

  const [phase, setPhase] = useState<GamePhase>("prep");
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [impulses, setImpulses] = useState<Impulse[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [catcherX, setCatcherX] = useState(50);

  const fieldRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const impulseIdRef = useRef(0);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const impulsesRef = useRef<Impulse[]>([]);
  const scoreRef = useRef(0);
  const hitsRef = useRef(0);
  const totalRef = useRef(0);
  const catcherXRef = useRef(50);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { hitsRef.current = hits; }, [hits]);
  useEffect(() => { totalRef.current = total; }, [total]);
  useEffect(() => { catcherXRef.current = catcherX; }, [catcherX]);

  const showFeedback = useCallback((text: string, color: string) => {
    setFeedback({ text, color });
    setTimeout(() => setFeedback(null), 300);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!fieldRef.current || phase !== "playing") return;
    const rect = fieldRef.current.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(10, Math.min(90, pct));
    setCatcherX(pct);
    catcherXRef.current = pct;
  }, [phase]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setScore(0); setHits(0); setTotal(0); setLevel(1); setTimeLeft(60);
    scoreRef.current = 0; hitsRef.current = 0; totalRef.current = 0;
    impulsesRef.current = [];
    setImpulses([]);
  }, []);

  useEffect(() => {
    if (phase !== "prep") return;
    if (countdown <= 0) { startGame(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, startGame]);

  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const spawnImpulse = useCallback(() => {
    if (!fieldRef.current) return;
    const id = ++impulseIdRef.current;
    const x = Math.random() * 80 + 10;
    const speed = 1.5 + (scoreRef.current / 800);
    const imp: Impulse = { id, x, y: -5, speed };
    impulsesRef.current = [...impulsesRef.current, imp];
    setImpulses([...impulsesRef.current]);
    setTotal(prev => prev + 1);
    totalRef.current += 1;
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const spawn = () => {
      spawnImpulse();
      const next = Math.max(400, 1200 - (scoreRef.current / 8));
      spawnTimerRef.current = setTimeout(spawn, next);
    };
    spawnTimerRef.current = setTimeout(spawn, 800);
    return () => { if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current); };
  }, [phase, spawnImpulse]);

  useEffect(() => {
    if (phase !== "playing") return;
    const loop = () => {
      const catcherY = 82;
      const updated: Impulse[] = [];
      let newHits = 0;
      let didSync = false;
      let didLose = false;

      for (const imp of impulsesRef.current) {
        const ny = imp.y + imp.speed * 0.6;
        if (ny > catcherY - 5 && ny < catcherY + 5) {
          const dist = Math.abs(imp.x - catcherXRef.current);
          if (dist < 12) {
            newHits++;
            didSync = true;
            continue;
          }
        }
        if (ny > 105) {
          didLose = true;
          continue;
        }
        updated.push({ ...imp, y: ny });
      }

      if (newHits > 0) {
        setScore(prev => prev + newHits * 50);
        setHits(prev => prev + newHits);
        scoreRef.current += newHits * 50;
        hitsRef.current += newHits;
        setLevel(Math.floor(scoreRef.current / 500) + 1);
        showFeedback("SYNC", "#34c759");
      }
      if (didLose && !didSync) {
        showFeedback("LOST", "#ff3b30");
      }

      impulsesRef.current = updated;
      setImpulses([...updated]);
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, showFeedback]);

  useEffect(() => {
    if (phase !== "finished") return;
    const accuracy = totalRef.current > 0 ? Math.round((hitsRef.current / totalRef.current) * 100) : 0;
    const isPwa = window.matchMedia('(display-mode: standalone)').matches;
    fetch("/api/training-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoria,
        tipoEjercicio: "neurosync",
        ejercicioTitulo: "Neuro-Sync",
        puntaje: scoreRef.current,
        nivelAlcanzado: Math.floor(scoreRef.current / 500) + 1,
        tiempoSegundos: 60,
        respuestasCorrectas: hitsRef.current,
        respuestasTotales: totalRef.current,
        datosExtra: JSON.stringify({ accuracy, level: Math.floor(scoreRef.current / 500) + 1 }),
        isPwa,
      }),
    }).catch(e => console.error("Error saving result:", e));
  }, [phase, categoria]);

  const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;

  const handleBack = () => {
    playButtonSound();
    window.history.back();
  };

  if (phase === "prep") {
    return (
      <div className="h-[100dvh] overflow-hidden bg-white flex flex-col">
        <header className="sticky top-0 z-50 w-full md:hidden" style={{ background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)" }}>
          <div className="relative pt-3 pb-2 px-5">
            <div className="flex items-center justify-between">
              <button onClick={handleBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255, 255, 255, 0.9)", boxShadow: "0 2px 8px rgba(138, 63, 252, 0.15)" }} data-testid="button-back">
                <ArrowLeft className="w-5 h-5" style={{ color: "#8a3ffc" }} />
              </button>
              <img src={LOGO_URL} alt="iQx" className="h-10 w-auto object-contain" />
              <LanguageButton />
            </div>
          </div>
        </header>
        <div className="w-full sticky z-40 md:hidden" style={{ top: 56, marginTop: -4, marginBottom: -20 }}>
          <img src={menuCurveImg} alt="" className="w-full h-auto" />
        </div>
        <main className="flex-1 flex items-center justify-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}>
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black mb-2" style={{ color: "#8a3ffc" }}>{t("neurosync.title")}</h2>
            <p className="text-gray-500 mb-8">{t("neurosync.getReady")}</p>
            <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl font-black" style={{ color: "#00d9ff" }}>
              {countdown}
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="h-[100dvh] overflow-hidden bg-white flex flex-col">
        <header className="sticky top-0 z-50 w-full md:hidden" style={{ background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)" }}>
          <div className="relative pt-3 pb-2 px-5">
            <div className="flex items-center justify-between">
              <button onClick={handleBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255, 255, 255, 0.9)", boxShadow: "0 2px 8px rgba(138, 63, 252, 0.15)" }} data-testid="button-back-result">
                <ArrowLeft className="w-5 h-5" style={{ color: "#8a3ffc" }} />
              </button>
              <img src={LOGO_URL} alt="iQx" className="h-10 w-auto object-contain" />
              <LanguageButton />
            </div>
          </div>
        </header>
        <div className="w-full sticky z-40 md:hidden" style={{ top: 56, marginTop: -4, marginBottom: -20 }}>
          <img src={menuCurveImg} alt="" className="w-full h-auto" />
        </div>
        <main className="flex-1 overflow-y-auto min-h-0 pb-4">
          <div className="px-5 pt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #34c759 0%, #00d9ff 100%)" }}>
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black" style={{ color: "#1f2937" }}>{t("neurosync.completed")}</h2>
              <p className="text-gray-500 text-sm mt-1">{t("neurosync.resultsSaved")}</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl p-4 text-center border border-purple-100" style={{ background: "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)" }}>
                <p className="text-xs text-purple-400 font-semibold mb-1">{t("neurosync.score")}</p>
                <p className="text-3xl font-black" style={{ color: "#8a3ffc" }}>{score}</p>
              </div>
              <div className="rounded-2xl p-4 text-center border border-cyan-100" style={{ background: "linear-gradient(145deg, #ecfeff 0%, #cffafe 100%)" }}>
                <p className="text-xs text-cyan-500 font-semibold mb-1">{t("neurosync.accuracy")}</p>
                <p className="text-3xl font-black" style={{ color: "#06b6d4" }}>{accuracy}%</p>
              </div>
              <div className="rounded-2xl p-4 text-center border border-green-100" style={{ background: "linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)" }}>
                <p className="text-xs text-green-500 font-semibold mb-1">{t("neurosync.synced")}</p>
                <p className="text-3xl font-black" style={{ color: "#22c55e" }}>{hits}/{total}</p>
              </div>
              <div className="rounded-2xl p-4 text-center border border-blue-100" style={{ background: "linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)" }}>
                <p className="text-xs text-blue-500 font-semibold mb-1">{t("neurosync.level")}</p>
                <p className="text-3xl font-black" style={{ color: "#3b82f6" }}>{level}</p>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={() => { setPhase("prep"); setCountdown(3); setScore(0); setHits(0); setTotal(0); setLevel(1); setTimeLeft(60); setImpulses([]); impulsesRef.current = []; }}
                className="w-full py-3.5 rounded-full font-semibold text-white text-base"
                style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
                whileTap={{ scale: 0.98 }}
                data-testid="button-retry"
              >
                {t("neurosync.playAgain")}
              </motion.button>
              <motion.button
                onClick={() => setLocation(`/progreso/${categoria}`)}
                className="w-full py-3.5 rounded-full font-semibold text-base border-2"
                style={{ color: "#8a3ffc", borderColor: "#8a3ffc" }}
                whileTap={{ scale: 0.98 }}
                data-testid="button-progress"
              >
                {t("neurosync.viewProgress")}
              </motion.button>
            </div>
          </div>
        </main>
        <TrainingNavBar activePage="entrenar" categoria={categoria} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-white flex flex-col" style={{ userSelect: "none" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100" style={{ background: "#fafbfc" }}>
        <div className="text-center flex-1">
          <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">{t("neurosync.score")}</p>
          <p className="text-lg font-bold" style={{ color: "#8a3ffc" }} data-testid="text-score">{score}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">{t("neurosync.accuracy")}</p>
          <p className="text-lg font-bold" style={{ color: "#8a3ffc" }} data-testid="text-accuracy">{accuracy > 0 ? `${accuracy}%` : "--"}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">{t("neurosync.time")}</p>
          <p className="text-lg font-bold" style={{ color: timeLeft <= 10 ? "#ff3b30" : "#8a3ffc" }} data-testid="text-time">{timeLeft}s</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">{t("neurosync.level")}</p>
          <p className="text-lg font-bold" style={{ color: "#8a3ffc" }} data-testid="text-level">{level}</p>
        </div>
      </div>

      <div
        ref={fieldRef}
        className="flex-1 relative overflow-hidden"
        style={{ background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #f8f9fa 100%)", touchAction: "none" }}
        onMouseMove={(e) => handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        data-testid="game-field"
      >
        {impulses.map(imp => (
          <div
            key={imp.id}
            className="absolute rounded-full"
            style={{
              width: 14,
              height: 14,
              background: "#8a3ffc",
              boxShadow: "0 0 12px rgba(138, 63, 252, 0.4)",
              left: `${imp.x}%`,
              top: `${imp.y}%`,
              transform: "translate(-50%, -50%)",
              transition: "none",
            }}
          />
        ))}

        <div
          className="absolute"
          style={{
            bottom: "18%",
            left: `${catcherX}%`,
            transform: "translate(-50%, 50%)",
            width: 65,
            height: 65,
            borderRadius: "50%",
            border: "2px solid #8a3ffc",
            background: "rgba(138, 63, 252, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
          data-testid="neuro-catcher"
        >
          <div
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              background: "#8a3ffc",
              animation: "neurosync-pulse 1.5s infinite",
            }}
          />
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 1, scale: 1.2 }}
            animate={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold pointer-events-none"
            style={{ color: feedback.color }}
          >
            {feedback.text}
          </motion.div>
        )}
      </div>

      <div className="px-4 py-2 text-center text-[10px] text-gray-300 border-t border-gray-50">
        {t("neurosync.footer")}
      </div>

      <style>{`
        @keyframes neurosync-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}