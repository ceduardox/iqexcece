import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Brain, LogOut, Grid3X3, RotateCcw } from "lucide-react";
import { LanguageButton } from "@/components/LanguageButton";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const hitPool: HTMLAudioElement[] = [];
for (let i = 0; i < 5; i++) { const a = new Audio('/bura.mp3'); a.volume = 0.7; hitPool.push(a); }
let hitIdx = 0;
const playHitSound = () => { const a = hitPool[hitIdx]; a.currentTime = 0; a.play().catch(() => {}); hitIdx = (hitIdx + 1) % hitPool.length; };

const errPool: HTMLAudioElement[] = [];
for (let i = 0; i < 3; i++) { const a = new Audio('/errore.mp3'); a.volume = 0.6; errPool.push(a); }
let errIdx = 0;
const playErrSound = () => { const a = errPool[errIdx]; a.currentTime = 0; a.play().catch(() => {}); errIdx = (errIdx + 1) % errPool.length; };

type GamePhase = "prep" | "showing" | "playing" | "finished" | "failed";

export default function MemoryFlashPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ categoria: string; itemId: string }>();
  const categoria = params.categoria || "general";
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("iq_session_id") : null;

  const [phase, setPhase] = useState<GamePhase>("prep");
  const [countdown, setCountdown] = useState(3);
  const [level, setLevel] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerPos, setPlayerPos] = useState(0);
  const [gridSize, setGridSize] = useState(3);
  const [cellStates, setCellStates] = useState<Record<number, string>>({});
  const [statusText, setStatusText] = useState("");
  const [statusColor, setStatusColor] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const levelRef = useRef(1);
  const totalHitsRef = useRef(0);
  const totalErrorsRef = useRef(0);
  const sequenceRef = useRef<number[]>([]);
  const playerPosRef = useRef(0);
  const isShowingRef = useRef(false);
  const usedTouchRef = useRef(false);

  const getGridSize = (lvl: number) => lvl < 4 ? 3 : (lvl < 8 ? 4 : 5);

  const initLevel = useCallback(() => {
    const size = getGridSize(levelRef.current);
    setGridSize(size);
    setCellStates({});
    setPlayerPos(0);
    playerPosRef.current = 0;

    const length = 2 + levelRef.current;
    const seq: number[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * size * size));
    }
    sequenceRef.current = seq;
    setSequence(seq);

    setStatusText(t("memoryflash.memorize"));
    setStatusColor("");

    setTimeout(() => showSequence(seq, size), 800);
  }, [t]);

  const showSequence = useCallback(async (seq: number[], _size: number) => {
    isShowingRef.current = true;
    setPhase("showing");

    const flashSpeed = Math.max(120, 500 - (levelRef.current * 35));

    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 180));
      setCellStates(prev => ({ ...prev, [seq[i]]: "active" }));
      await new Promise(r => setTimeout(r, flashSpeed));
      setCellStates(prev => {
        const next = { ...prev };
        delete next[seq[i]];
        return next;
      });
    }

    isShowingRef.current = false;
    setPhase("playing");
    setStatusText(t("memoryflash.yourTurn"));
    setStatusColor("#0051ff");
  }, [t]);

  const startGame = useCallback(() => {
    setPhase("showing");
    setLevel(1); setTotalHits(0); setTotalErrors(0);
    levelRef.current = 1; totalHitsRef.current = 0; totalErrorsRef.current = 0;
    setTimeout(() => initLevel(), 100);
  }, [initLevel]);

  useEffect(() => {
    if (phase !== "prep") return;
    if (countdown <= 0) { startGame(); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown, startGame]);

  const handleCellClick = useCallback((id: number) => {
    if (isShowingRef.current || phase !== "playing") return;

    const expected = sequenceRef.current[playerPosRef.current];

    if (id === expected) {
      playHitSound();
      setCellStates(prev => ({ ...prev, [id]: "correct" }));
      setTimeout(() => setCellStates(prev => { const n = { ...prev }; delete n[id]; return n; }), 150);

      playerPosRef.current++;
      setPlayerPos(playerPosRef.current);
      totalHitsRef.current++;
      setTotalHits(totalHitsRef.current);

      if (playerPosRef.current === sequenceRef.current.length) {
        setStatusText(t("memoryflash.correct"));
        setStatusColor("#34c759");
        levelRef.current++;
        setLevel(levelRef.current);
        setTimeout(() => initLevel(), 900);
      }
    } else {
      playErrSound();
      setCellStates(prev => ({ ...prev, [id]: "error" }));
      totalErrorsRef.current++;
      setTotalErrors(totalErrorsRef.current);
      setStatusText(t("memoryflash.fail"));
      setStatusColor("#ff3b30");
      saveResultsRef.current();
      setTimeout(() => setPhase("failed"), 600);
    }
  }, [phase, t, initLevel]);

  const saveResults = useCallback(() => {
    const isPwa = window.matchMedia('(display-mode: standalone)').matches;
    return fetch("/api/training-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId || null,
        categoria,
        tipoEjercicio: "memoryflash",
        ejercicioTitulo: "Memory Flash",
        puntaje: totalHitsRef.current * 50 + (levelRef.current - 1) * 100,
        nivelAlcanzado: levelRef.current,
        tiempoSegundos: 0,
        respuestasCorrectas: totalHitsRef.current,
        respuestasTotales: totalHitsRef.current + totalErrorsRef.current,
        datosExtra: JSON.stringify({ level: levelRef.current, errors: totalErrorsRef.current, hits: totalHitsRef.current }),
        isPwa,
      }),
    }).catch(e => console.error("Error saving:", e));
  }, [categoria, sessionId]);

  const saveResultsRef = useRef(saveResults);
  saveResultsRef.current = saveResults;

  const handleExitConfirm = useCallback(() => {
    playButtonSound();
    setShowExitConfirm(false);
    saveResults().then(() => setLocation(`/progreso/${categoria}`));
  }, [saveResults, setLocation, categoria]);

  const handleBack = () => { playButtonSound(); window.history.back(); };

  const seqLength = 2 + level;

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
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0051ff 0%, #8a3ffc 100%)" }}>
                <Grid3X3 className="w-14 h-14 text-white" />
              </div>
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-8 rounded-lg"
                  style={{ background: "#0051ff", opacity: 0.3 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0.8, 1],
                    opacity: [0, 0.6, 0.2, 0.6],
                    x: [0, (i % 2 === 0 ? -1 : 1) * 55][1],
                    y: [0, (i < 2 ? -1 : 1) * 55][1],
                  }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                />
              ))}
            </div>
            <h2 className="text-3xl font-black mb-2" style={{ color: "#0051ff" }}>{t("memoryflash.title")}</h2>
            <p className="text-gray-500 text-sm mb-8">{t("memoryflash.prepDesc")}</p>
            <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl font-black" style={{ color: "#8a3ffc" }}>
              {countdown}
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (phase === "finished" || phase === "failed") {
    const score = totalHits * 50 + (level - 1) * 100;
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
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: phase === "failed" ? "linear-gradient(135deg, #ff3b30, #ff6b6b)" : "linear-gradient(135deg, #34c759 0%, #00d9ff 100%)" }}>
                {phase === "failed" ? <RotateCcw className="w-10 h-10 text-white" /> : <Grid3X3 className="w-10 h-10 text-white" />}
              </div>
              <h2 className="text-2xl font-black" style={{ color: "#1f2937" }}>
                {phase === "failed" ? t("memoryflash.sequenceFail") : t("memoryflash.completed")}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{t("memoryflash.resultsSaved")}</p>
            </motion.div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl p-4 text-center border border-blue-100" style={{ background: "linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)" }}>
                <p className="text-xs text-blue-400 font-semibold mb-1">{t("memoryflash.score")}</p>
                <p className="text-3xl font-black" style={{ color: "#0051ff" }}>{score}</p>
              </div>
              <div className="rounded-2xl p-4 text-center border border-purple-100" style={{ background: "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)" }}>
                <p className="text-xs text-purple-400 font-semibold mb-1">{t("memoryflash.level")}</p>
                <p className="text-3xl font-black" style={{ color: "#8a3ffc" }}>{level}</p>
              </div>
              <div className="rounded-2xl p-4 text-center border border-green-100" style={{ background: "linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)" }}>
                <p className="text-xs text-green-500 font-semibold mb-1">{t("memoryflash.hits")}</p>
                <p className="text-3xl font-black" style={{ color: "#22c55e" }}>{totalHits}</p>
              </div>
              <div className="rounded-2xl p-4 text-center border border-red-100" style={{ background: "linear-gradient(145deg, #fef2f2 0%, #fecaca 100%)" }}>
                <p className="text-xs text-red-400 font-semibold mb-1">{t("memoryflash.errors")}</p>
                <p className="text-3xl font-black" style={{ color: "#ef4444" }}>{totalErrors}</p>
              </div>
            </div>
            <div className="space-y-3">
              <motion.button onClick={() => { setPhase("prep"); setCountdown(3); }} className="w-full py-3.5 rounded-full font-semibold text-white text-base" style={{ background: "linear-gradient(135deg, #0051ff 0%, #8a3ffc 100%)" }} whileTap={{ scale: 0.98 }} data-testid="button-retry">
                {t("memoryflash.playAgain")}
              </motion.button>
              <motion.button onClick={() => setLocation(`/progreso/${categoria}`)} className="w-full py-3.5 rounded-full font-semibold text-base border-2" style={{ color: "#0051ff", borderColor: "#0051ff" }} whileTap={{ scale: 0.98 }} data-testid="button-progress">
                {t("memoryflash.viewProgress")}
              </motion.button>
            </div>
          </div>
        </main>
        <TrainingNavBar activePage="entrenar" categoria={categoria} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col" style={{ userSelect: "none", background: "linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%)" }}>
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0051ff, #8a3ffc)" }}>
              <Grid3X3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: "#1d1d1f" }}>{t("memoryflash.title")}</span>
          </div>
          <div className="flex items-center gap-2">
            {statusText && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{
                background: statusColor === "#34c759" ? "rgba(52,199,89,0.15)" : statusColor === "#ff3b30" ? "rgba(255,59,48,0.15)" : statusColor === "#0051ff" ? "rgba(0,81,255,0.15)" : "#e8e8ed",
                color: statusColor || "#86868b",
              }}>
                {statusText}
              </span>
            )}
            <button onClick={() => { playButtonSound(); setShowExitConfirm(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(255,59,48,0.1)", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.2)" }} data-testid="button-exit">
              <LogOut className="w-3.5 h-3.5" />
              {t("memoryflash.exit")}
            </button>
          </div>
        </div>

        <div className="rounded-2xl p-3" style={{ background: "linear-gradient(145deg, rgba(0, 81, 255, 0.06) 0%, rgba(138, 63, 252, 0.04) 100%)", border: "1px solid rgba(0, 81, 255, 0.12)" }}>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">{t("memoryflash.level")}</p>
              <p className="text-xl font-black" style={{ color: "#0051ff" }} data-testid="text-level">{level}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">{t("memoryflash.hits")}</p>
              <p className="text-xl font-black" style={{ color: "#34c759" }} data-testid="text-hits">{totalHits}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">{t("memoryflash.step")}</p>
              <p className="text-xl font-black" style={{ color: "#8a3ffc" }} data-testid="text-step">{playerPos}/{seqLength}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5" style={{ background: "radial-gradient(circle, #fff 0%, #f9f9fb 100%)" }}>
        <div
          className="w-full"
          style={{
            maxWidth: 340,
            display: "grid",
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: 12,
            aspectRatio: "1/1",
          }}
          data-testid="game-grid"
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const state = cellStates[i];
            return (
              <div
                key={`${level}-${i}`}
                className="rounded-2xl cursor-pointer"
                style={{
                  background: state === "active" ? "#0051ff" : state === "correct" ? "#34c759" : state === "error" ? "#ff3b30" : "#fff",
                  border: `2px solid ${state === "active" ? "#0051ff" : state === "correct" ? "#34c759" : state === "error" ? "#ff3b30" : "#e5e5e7"}`,
                  boxShadow: state ? `0 0 15px ${state === "active" ? "rgba(0,81,255,0.3)" : state === "correct" ? "rgba(52,199,89,0.3)" : "rgba(255,59,48,0.3)"}` : "0 4px 10px rgba(0,0,0,0.02)",
                  transition: "all 0.15s ease",
                  transform: state === "active" ? "scale(0.94)" : "scale(1)",
                  WebkitTapHighlightColor: "transparent",
                }}
                onTouchStart={(e) => { e.preventDefault(); usedTouchRef.current = true; handleCellClick(i); }}
                onMouseDown={() => { if (usedTouchRef.current) { usedTouchRef.current = false; return; } handleCellClick(i); }}
                data-testid={`cell-${i}`}
              />
            );
          })}
        </div>
      </div>

      <div className="px-4 py-1.5 text-center text-[9px] font-medium text-gray-300">
        {t("memoryflash.footer")}
      </div>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="mx-6 w-full max-w-sm rounded-3xl p-6 bg-white" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div className="text-center mb-5">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: "rgba(255,59,48,0.1)" }}>
                  <LogOut className="w-8 h-8" style={{ color: "#ff3b30" }} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{t("memoryflash.exitTitle")}</h3>
                <p className="text-sm text-gray-500">{t("memoryflash.exitMessage")}</p>
              </div>
              <div className="space-y-2">
                <button onClick={handleExitConfirm} className="w-full py-3 rounded-full font-semibold text-white text-sm" style={{ background: "linear-gradient(135deg, #ff3b30, #ff6b6b)" }} data-testid="button-confirm-exit">
                  {t("memoryflash.exitConfirm")}
                </button>
                <button onClick={() => setShowExitConfirm(false)} className="w-full py-3 rounded-full font-semibold text-sm text-gray-500" style={{ border: "1px solid #e5e5e7" }} data-testid="button-cancel-exit">
                  {t("memoryflash.exitCancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}