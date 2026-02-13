import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Brain, LogOut, Link2, RotateCcw } from "lucide-react";
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

interface NodeData { id: number; x: number; y: number; completed: boolean; }
interface LineData { x1: number; y1: number; x2: number; y2: number; }

type GamePhase = "prep" | "playing" | "finished" | "failed";

export default function NeuroLinkPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ categoria: string; itemId: string }>();
  const categoria = params.categoria || "general";
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("iq_session_id") : null;

  const [phase, setPhase] = useState<GamePhase>("prep");
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextNode, setNextNode] = useState(1);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [lines, setLines] = useState<LineData[]>([]);
  const [timer, setTimer] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [statusColor, setStatusColor] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);

  const fieldRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const durationRef = useRef(0);
  const gameActiveRef = useRef(false);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const totalCorrectRef = useRef(0);
  const totalErrorsRef = useRef(0);
  const lastClickRef = useRef(0);

  const initLevel = useCallback(() => {
    if (!fieldRef.current) return;
    const w = fieldRef.current.clientWidth;
    const h = fieldRef.current.clientHeight;
    const numNodes = 2 + levelRef.current;
    const dur = 2 + (numNodes * 0.9) * Math.pow(0.95, levelRef.current);
    durationRef.current = dur;

    const newNodes: NodeData[] = [];
    for (let i = 1; i <= numNodes; i++) {
      const x = Math.random() * (w - 80) + 40;
      const y = Math.random() * (h - 80) + 40;
      newNodes.push({ id: i, x, y, completed: false });
    }

    setNodes(newNodes);
    setLines([]);
    setNextNode(1);
    setStatusText(t("neurolink.syncing"));
    setStatusColor("");
    gameActiveRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, dur - elapsed);
      setTimer(remaining);
      if (remaining <= 0) {
        gameActiveRef.current = false;
        if (timerRef.current) clearInterval(timerRef.current);
        setPhase("failed");
      }
    }, 50);
  }, [t]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setScore(0); setLevel(1); setTotalCorrect(0); setTotalErrors(0);
    scoreRef.current = 0; levelRef.current = 1;
    totalCorrectRef.current = 0; totalErrorsRef.current = 0;
    setTimeout(() => initLevel(), 100);
  }, [initLevel]);

  useEffect(() => {
    if (phase !== "prep") return;
    if (countdown <= 0) { startGame(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, startGame]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleNodeClick = useCallback((id: number) => {
    if (!gameActiveRef.current) return;
    const now = Date.now();
    if (now - lastClickRef.current < 80) return;
    lastClickRef.current = now;
    setNextNode(prev => {
      if (id === prev) {
        playHitSound();
        totalCorrectRef.current++;
        setTotalCorrect(totalCorrectRef.current);
        setNodes(ns => ns.map(n => n.id === id ? { ...n, completed: true } : n));
        setNodes(ns => {
          if (prev > 1) {
            const prevNode = ns.find(n => n.id === prev - 1);
            const currNode = ns.find(n => n.id === id);
            if (prevNode && currNode) {
              setLines(ls => [...ls, { x1: prevNode.x, y1: prevNode.y, x2: currNode.x, y2: currNode.y }]);
            }
          }
          if (id === ns.length) {
            gameActiveRef.current = false;
            if (timerRef.current) clearInterval(timerRef.current);
            setStatusText(t("neurolink.correct"));
            setStatusColor("#34c759");
            const pts = levelRef.current * 100;
            scoreRef.current += pts;
            setScore(scoreRef.current);
            levelRef.current++;
            setLevel(levelRef.current);
            setTimeout(() => initLevel(), 600);
          }
          return ns;
        });
        return prev + 1;
      } else {
        playErrSound();
        totalErrorsRef.current++;
        setTotalErrors(totalErrorsRef.current);
        setStatusText(t("neurolink.fail"));
        setStatusColor("#ff3b30");
        setTimeout(() => {
          if (gameActiveRef.current) {
            setStatusText(t("neurolink.syncing"));
            setStatusColor("");
          }
        }, 400);
        return prev;
      }
    });
  }, [t, initLevel]);

  const saveResults = useCallback(() => {
    const isPwa = window.matchMedia('(display-mode: standalone)').matches;
    return fetch("/api/training-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId || null,
        categoria,
        tipoEjercicio: "neurolink",
        ejercicioTitulo: "Neuro-Link Pro",
        puntaje: scoreRef.current,
        nivelAlcanzado: levelRef.current,
        tiempoSegundos: 0,
        respuestasCorrectas: totalCorrectRef.current,
        respuestasTotales: totalCorrectRef.current + totalErrorsRef.current,
        datosExtra: JSON.stringify({ level: levelRef.current, errors: totalErrorsRef.current }),
        isPwa,
      }),
    }).catch(e => console.error("Error saving:", e));
  }, [categoria, sessionId]);

  const handleExitConfirm = useCallback(() => {
    playButtonSound();
    gameActiveRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    setShowExitConfirm(false);
    saveResults().then(() => setLocation(`/progreso/${categoria}`));
  }, [saveResults, setLocation, categoria]);

  const handleBack = () => { playButtonSound(); window.history.back(); };

  const numNodes = 2 + level;

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
                <Link2 className="w-14 h-14 text-white" />
              </div>
              {[1, 2, 3, 4, 5].map(i => (
                <motion.div
                  key={i}
                  className="absolute w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "#fff", border: "2px solid #0051ff", color: "#0051ff", boxShadow: "0 2px 8px rgba(0,81,255,0.2)" }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: Math.cos((i * 72 - 90) * Math.PI / 180) * 58,
                    y: Math.sin((i * 72 - 90) * Math.PI / 180) * 58,
                    opacity: 1,
                  }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                >
                  {i}
                </motion.div>
              ))}
              {[1, 2, 3, 4].map(i => (
                <motion.svg key={`l${i}`} className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
                  <motion.line
                    x1={64 + Math.cos((i * 72 - 90) * Math.PI / 180) * 58}
                    y1={64 + Math.sin((i * 72 - 90) * Math.PI / 180) * 58}
                    x2={64 + Math.cos(((i + 1) * 72 - 90) * Math.PI / 180) * 58}
                    y2={64 + Math.sin(((i + 1) * 72 - 90) * Math.PI / 180) * 58}
                    stroke="#0051ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ delay: 0.6 + i * 0.15, duration: 0.3 }}
                  />
                </motion.svg>
              ))}
            </div>
            <h2 className="text-3xl font-black mb-2" style={{ color: "#0051ff" }}>{t("neurolink.title")}</h2>
            <p className="text-gray-500 text-sm mb-8">{t("neurolink.prepDesc")}</p>
            <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl font-black" style={{ color: "#8a3ffc" }}>
              {countdown}
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (phase === "finished" || phase === "failed") {
    const acc = (totalCorrect + totalErrors) > 0 ? Math.round((totalCorrect / (totalCorrect + totalErrors)) * 100) : 0;
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
                {phase === "failed" ? <RotateCcw className="w-10 h-10 text-white" /> : <Link2 className="w-10 h-10 text-white" />}
              </div>
              <h2 className="text-2xl font-black" style={{ color: "#1f2937" }}>
                {phase === "failed" ? t("neurolink.timeUp") : t("neurolink.completed")}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{t("neurolink.resultsSaved")}</p>
            </motion.div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl p-4 text-center border border-blue-100" style={{ background: "linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)" }}>
                <p className="text-xs text-blue-400 font-semibold mb-1">{t("neurolink.score")}</p>
                <p className="text-3xl font-black" style={{ color: "#0051ff" }}>{score}</p>
              </div>
              <div className="rounded-2xl p-4 text-center border border-purple-100" style={{ background: "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)" }}>
                <p className="text-xs text-purple-400 font-semibold mb-1">{t("neurolink.level")}</p>
                <p className="text-3xl font-black" style={{ color: "#8a3ffc" }}>{level}</p>
              </div>
              <div className="rounded-2xl p-4 text-center border border-green-100" style={{ background: "linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)" }}>
                <p className="text-xs text-green-500 font-semibold mb-1">{t("neurolink.correct")}</p>
                <p className="text-3xl font-black" style={{ color: "#22c55e" }}>{totalCorrect}</p>
              </div>
              <div className="rounded-2xl p-4 text-center border border-red-100" style={{ background: "linear-gradient(145deg, #fef2f2 0%, #fecaca 100%)" }}>
                <p className="text-xs text-red-400 font-semibold mb-1">{t("neurolink.errors")}</p>
                <p className="text-3xl font-black" style={{ color: "#ef4444" }}>{totalErrors}</p>
              </div>
            </div>
            <div className="space-y-3">
              <motion.button
                onClick={() => { setPhase("prep"); setCountdown(3); }}
                className="w-full py-3.5 rounded-full font-semibold text-white text-base"
                style={{ background: "linear-gradient(135deg, #0051ff 0%, #8a3ffc 100%)" }}
                whileTap={{ scale: 0.98 }}
                data-testid="button-retry"
              >
                {t("neurolink.playAgain")}
              </motion.button>
              <motion.button
                onClick={() => setLocation(`/progreso/${categoria}`)}
                className="w-full py-3.5 rounded-full font-semibold text-base border-2"
                style={{ color: "#0051ff", borderColor: "#0051ff" }}
                whileTap={{ scale: 0.98 }}
                data-testid="button-progress"
              >
                {t("neurolink.viewProgress")}
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
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: "#1d1d1f" }}>{t("neurolink.title")}</span>
          </div>
          <div className="flex items-center gap-2">
            {statusText && (
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: statusColor === "#34c759" ? "rgba(52,199,89,0.15)" : statusColor === "#ff3b30" ? "rgba(255,59,48,0.15)" : "#e8e8ed",
                  color: statusColor || "#86868b",
                }}
              >
                {statusText}
              </span>
            )}
            <button
              onClick={() => { playButtonSound(); setShowExitConfirm(true); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(255,59,48,0.1)", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.2)" }}
              data-testid="button-exit"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t("neurolink.exit")}
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl p-3"
          style={{ background: "linear-gradient(145deg, rgba(0, 81, 255, 0.06) 0%, rgba(138, 63, 252, 0.04) 100%)", border: "1px solid rgba(0, 81, 255, 0.12)" }}
        >
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">{t("neurolink.score")}</p>
              <p className="text-xl font-black" style={{ color: "#0051ff" }} data-testid="text-score">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">{t("neurolink.level")}</p>
              <p className="text-xl font-black" style={{ color: "#8a3ffc" }} data-testid="text-level">{level}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">{t("neurolink.process")}</p>
              <p className="text-xl font-black" style={{ color: "#0051ff" }} data-testid="text-progress">{Math.min(nextNode - 1, numNodes)}/{numNodes}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">{t("neurolink.time")}</p>
              <p className="text-xl font-black" style={{ color: timer <= 2 ? "#ff3b30" : "#34c759" }} data-testid="text-timer">{timer.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={fieldRef}
        className="flex-1 relative overflow-hidden mx-3 mb-2 rounded-2xl"
        style={{ background: "radial-gradient(circle, #ffffff 0%, #f7f7f9 100%)", border: "1px solid #e5e5e7" }}
        data-testid="game-field"
      >
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {lines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#0051ff" strokeWidth={4} strokeLinecap="round" opacity={0.6} />
          ))}
        </svg>

        {nodes.map(node => (
          <div
            key={`${level}-${node.id}`}
            className="absolute flex items-center justify-center rounded-full font-bold select-none"
            style={{
              width: 52,
              height: 52,
              left: node.x,
              top: node.y,
              transform: "translate(-50%, -50%)",
              fontSize: 19,
              background: node.completed ? "#0051ff" : "#fff",
              border: `2px solid ${node.completed ? "#0051ff" : "#d2d2d7"}`,
              color: node.completed ? "#fff" : "#1d1d1f",
              boxShadow: node.completed ? "0 0 20px rgba(0, 81, 255, 0.3)" : "0 4px 12px rgba(0,0,0,0.05)",
              zIndex: 5,
              cursor: "pointer",
              transition: "transform 0.1s, background 0.2s",
              WebkitTapHighlightColor: "transparent",
            }}
            onTouchStart={(e) => { e.preventDefault(); handleNodeClick(node.id); }}
            onMouseDown={() => handleNodeClick(node.id)}
            data-testid={`node-${node.id}`}
          >
            {node.id}
          </div>
        ))}
      </div>

      <div className="px-4 py-1.5 text-center text-[9px] font-medium text-gray-300">
        {t("neurolink.footer")}
      </div>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="mx-6 w-full max-w-sm rounded-3xl p-6 bg-white"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
            >
              <div className="text-center mb-5">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: "rgba(255,59,48,0.1)" }}>
                  <LogOut className="w-8 h-8" style={{ color: "#ff3b30" }} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{t("neurolink.exitTitle")}</h3>
                <p className="text-sm text-gray-500">{t("neurolink.exitMessage")}</p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleExitConfirm}
                  className="w-full py-3 rounded-full font-semibold text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #ff3b30, #ff6b6b)" }}
                  data-testid="button-confirm-exit"
                >
                  {t("neurolink.exitConfirm")}
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-3 rounded-full font-semibold text-sm text-gray-500"
                  style={{ border: "1px solid #e5e5e7" }}
                  data-testid="button-cancel-exit"
                >
                  {t("neurolink.exitCancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}