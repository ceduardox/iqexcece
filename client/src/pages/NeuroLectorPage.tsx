import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, LogOut, BookOpen } from "lucide-react";
import { LanguageButton } from "@/components/LanguageButton";
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

const DATA: Record<string, string[]> = {
  "FINANZAS": ["BONO","BOLSA","PAGO","BANCO","VALOR","EURO","COBRO","ACTIVO","DEUDA","FONDO","RENTA","COSTO","LUCRO","GASTO","DIVISA","CRÉDITO","MONEDA","CHEQUE","TASA","PLAZO","AHORRO","FIANZA","PRIMA","CUOTA","SALDO","INTERÉS","ACCIÓN","MERCADO","CAMBIO","ARANCEL"],
  "ANIMALES": ["LEÓN","PERRO","GATO","LOBO","AVES","PECES","TIGRE","MONO","RANA","RATA","TORO","BÚHO","CIERVO","FOCA","BURRO","CABRA","CERDO","VACA","PUMA","ÁGUILA","HALCÓN","DELFÍN","BALLENA","ZORRO","CONEJO","OVEJA","PATO","GALLO","MULA","CEBRA"],
  "CIUDADES": ["MADRID","PARÍS","TOKIO","ROMA","QUITO","LIMA","MIAMI","BERLÍN","PRAGA","DUBÁI","OSLO","SEÚL","PEKÍN","CAIRO","MOSCÚ","VIENA","BERNA","ATENAS","BOGOTÁ","CUENCA","SUCRE","NATAL","CUSCO","CÁDIZ","LEÓN","DAVOS","BALI","DOHA","MACAO","ÁMBAR"],
  "FRUTAS": ["PERA","COCO","PIÑA","MANGO","UVA","KIWI","MORA","LIMA","FRESA","CEREZA","PAPAYA","SANDÍA","MELÓN","DURAZNO","HIGO","GUAYABA","TORONJA","NARANJA","MANDARINA","BANANA","LICHI","DÁTIL","CIRUELA","ARÁNDANO","FRAMBUESA","GRANADA","NÍSPERO","CAQUI","POMELO","TAMARINDO"],
};

const CATEGORIES = Object.keys(DATA);

type Phase = "countdown" | "playing" | "gameover";

export default function NeuroLectorPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ categoria: string; itemId: string }>();
  const categoria = params.categoria || "general";
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("iq_session_id") : null;

  const [phase, setPhase] = useState<Phase>("countdown");
  const [countdown, setCountdown] = useState(3);
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [score, setScore] = useState(500);
  const [hits, setHits] = useState(0);
  const [fails, setFails] = useState(0);
  const [hitsStreak, setHitsStreak] = useState(0);
  const [speed, setSpeed] = useState(1100);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [wordAnim, setWordAnim] = useState("");
  const [missionAnim, setMissionAnim] = useState(false);
  const [categoriesChanged, setCategoriesChanged] = useState(0);

  const gameRunningRef = useRef(false);
  const scoreRef = useRef(500);
  const hitsRef = useRef(0);
  const failsRef = useRef(0);
  const hitsStreakRef = useRef(0);
  const speedRef = useRef(1100);
  const currentCategoryRef = useRef("");
  const currentWordRef = useRef("");
  const wordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoriesChangedRef = useRef(0);
  const startTimeRef = useRef(0);

  const changeCategory = useCallback(() => {
    let newCat: string;
    do {
      newCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    } while (newCat === currentCategoryRef.current && CATEGORIES.length > 1);
    currentCategoryRef.current = newCat;
    setCurrentCategory(newCat);
    hitsStreakRef.current = 0;
    setHitsStreak(0);
    setMissionAnim(true);
    setTimeout(() => setMissionAnim(false), 600);
    categoriesChangedRef.current++;
    setCategoriesChanged(categoriesChangedRef.current);
  }, []);

  const gameOver = useCallback(() => {
    gameRunningRef.current = false;
    if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current);
    setPhase("gameover");
  }, []);

  const applyPenalty = useCallback((amt: number, isWrongTap: boolean) => {
    playErrSound();
    scoreRef.current -= amt;
    if (isWrongTap) {
      failsRef.current++;
      setFails(failsRef.current);
    }
    hitsStreakRef.current = 0;
    setHitsStreak(0);
    setScore(Math.max(0, scoreRef.current));
    setWordAnim("shake");
    setTimeout(() => setWordAnim(""), 400);
    if (scoreRef.current <= 0) gameOver();
  }, [gameOver]);

  const nextWord = useCallback(() => {
    if (!gameRunningRef.current) return;
    const isTarget = Math.random() < 0.35;
    let word: string;
    const cat = currentCategoryRef.current;
    if (isTarget) {
      word = DATA[cat][Math.floor(Math.random() * DATA[cat].length)];
    } else {
      const others = CATEGORIES.filter(c => c !== cat);
      const otherCat = others[Math.floor(Math.random() * others.length)];
      word = DATA[otherCat][Math.floor(Math.random() * DATA[otherCat].length)];
    }
    currentWordRef.current = word;
    setCurrentWord(word);

    wordTimeoutRef.current = setTimeout(() => {
      if (!gameRunningRef.current) return;
      if (DATA[currentCategoryRef.current].includes(currentWordRef.current)) {
        applyPenalty(100, false);
      }
      if (gameRunningRef.current) nextWord();
    }, speedRef.current);
  }, [applyPenalty]);

  const handleTap = useCallback((e?: React.TouchEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!gameRunningRef.current) return;
    if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current);

    const isCorrect = DATA[currentCategoryRef.current].includes(currentWordRef.current);
    if (isCorrect) {
      playHitSound();
      scoreRef.current += 100;
      hitsRef.current++;
      hitsStreakRef.current++;
      setScore(scoreRef.current);
      setHits(hitsRef.current);
      setHitsStreak(hitsStreakRef.current);
      setWordAnim("hit");
      setTimeout(() => setWordAnim(""), 400);

      if (hitsStreakRef.current >= 5) {
        changeCategory();
        speedRef.current = Math.max(500, speedRef.current - 50);
        setSpeed(speedRef.current);
      }
    } else {
      applyPenalty(250, true);
    }

    nextWord();
  }, [applyPenalty, nextWord, changeCategory]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      gameRunningRef.current = true;
      startTimeRef.current = Date.now();
      changeCategory();
      setPhase("playing");
      nextWord();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown, changeCategory, nextWord]);

  useEffect(() => {
    return () => {
      gameRunningRef.current = false;
      if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current);
    };
  }, []);

  const saveResults = useCallback(() => {
    const isPwa = window.matchMedia('(display-mode: standalone)').matches;
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    return fetch("/api/training-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId || null,
        categoria,
        tipoEjercicio: "neurolector",
        ejercicioTitulo: "Neuro-Lector",
        puntaje: Math.max(0, scoreRef.current),
        nivelAlcanzado: categoriesChangedRef.current + 1,
        tiempoSegundos: elapsed,
        respuestasCorrectas: hitsRef.current,
        respuestasTotales: hitsRef.current + failsRef.current,
        datosExtra: JSON.stringify({ hits: hitsRef.current, fails: failsRef.current, categoriesChanged: categoriesChangedRef.current, speed: speedRef.current }),
        isPwa,
      }),
    }).catch(e => console.error("Error saving:", e));
  }, [categoria, sessionId]);

  const handleExitConfirm = useCallback(() => {
    playButtonSound();
    gameRunningRef.current = false;
    if (wordTimeoutRef.current) clearTimeout(wordTimeoutRef.current);
    setShowExitConfirm(false);
    saveResults().then(() => setLocation(`/progreso/${categoria}`));
  }, [saveResults, setLocation, categoria]);

  const handleBack = () => { playButtonSound(); window.history.back(); };

  if (phase === "countdown") {
    return (
      <div className="h-[100dvh] bg-white flex flex-col items-center justify-center">
        <motion.div
          key={countdown}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="text-7xl font-black"
          style={{ color: "#0051ff" }}
        >
          {countdown || t("neurolector.go")}
        </motion.div>
      </div>
    );
  }

  if (phase === "gameover") {
    return (
      <div className="h-[100dvh] bg-white flex flex-col">
        <header className="sticky top-0 z-50 w-full md:hidden" style={{ background: "linear-gradient(180deg, rgba(0,81,255,0.08) 0%, #fff 100%)" }}>
          <div className="relative pt-3 pb-2 px-5 flex items-center justify-between">
            <button onClick={handleBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 2px 8px rgba(0,81,255,0.15)" }} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" style={{ color: "#0051ff" }} />
            </button>
            <img src={LOGO_URL} alt="IQX" className="h-10 w-auto object-contain" />
            <LanguageButton />
          </div>
        </header>
        <div className="w-full sticky z-40 md:hidden" style={{ top: 56, marginTop: -4, marginBottom: -20 }}>
          <img src={menuCurveImg} alt="" className="w-full h-auto" />
        </div>
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(255,59,48,0.1)" }}>
              <BookOpen className="w-10 h-10" style={{ color: "#ff3b30" }} />
            </div>
            <h2 className="text-2xl font-black mb-1" style={{ color: "#ff3b30" }}>{t("neurolector.energyDepleted")}</h2>
            <p className="text-sm text-gray-400 mb-6">{t("neurolector.resultsSaved")}</p>
            <div className="flex justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-black" style={{ color: "#0051ff" }}>{Math.max(0, score)}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">{t("neurolector.score")}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black" style={{ color: "#34c759" }}>{hits}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">{t("neurolector.hits")}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black" style={{ color: "#ff3b30" }}>{fails}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">{t("neurolector.errors")}</div>
              </div>
            </div>
            <button
              onClick={() => { playButtonSound(); saveResults().then(() => { setScore(500); scoreRef.current = 500; setHits(0); hitsRef.current = 0; setFails(0); failsRef.current = 0; setHitsStreak(0); hitsStreakRef.current = 0; setSpeed(1100); speedRef.current = 1100; categoriesChangedRef.current = 0; setCategoriesChanged(0); setCountdown(3); setPhase("countdown"); }); }}
              className="w-full py-3.5 rounded-full font-bold text-white mb-3"
              style={{ background: "linear-gradient(135deg, #0051ff, #00b4d8)" }}
              data-testid="button-play-again"
            >
              {t("neurolector.playAgain")}
            </button>
            <button
              onClick={() => { playButtonSound(); saveResults().then(() => setLocation(`/progreso/${categoria}`)); }}
              className="w-full py-3.5 rounded-full font-bold text-sm"
              style={{ border: "2px solid #e5e5e7", color: "#666" }}
              data-testid="button-view-progress"
            >
              {t("neurolector.viewProgress")}
            </button>
          </motion.div>
        </main>
        <div className="px-4 py-1.5 text-center text-[9px] font-medium text-gray-300">
          {t("neurolector.footer")}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-white flex flex-col overflow-hidden select-none">
      <header className="px-5 py-2.5 flex items-center justify-between border-b border-gray-100" style={{ background: "rgba(255,255,255,0.95)" }}>
        <button onClick={() => { playButtonSound(); setShowExitConfirm(true); }} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 2px 8px rgba(0,81,255,0.15)" }} data-testid="button-exit">
          <ArrowLeft className="w-5 h-5" style={{ color: "#0051ff" }} />
        </button>
        <div className="flex gap-5">
          <div className="text-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase">{t("neurolector.hits")}</div>
            <div className="text-lg font-extrabold" style={{ color: "#34c759" }}>{hits}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase">{t("neurolector.errors")}</div>
            <div className="text-lg font-extrabold" style={{ color: "#ff3b30" }}>{fails}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-black" style={{ color: score < 300 ? "#ff3b30" : "#0051ff" }}>{score}</div>
        </div>
      </header>

      <div
        className="flex-1 relative flex flex-col items-center justify-center"
        style={{ background: "radial-gradient(circle at center, #ffffff 0%, #f4f7fa 100%)" }}
        onTouchStart={handleTap}
        onMouseDown={(e) => { e.preventDefault(); handleTap(); }}
        data-testid="game-stage"
      >
        <motion.div
          className="absolute top-6 w-[85%] bg-white rounded-2xl px-4 py-3 text-center"
          style={{ boxShadow: "0 10px 30px rgba(0,81,255,0.05)", border: "2px solid #f0f4ff" }}
          animate={missionAnim ? { scale: [0.8, 1], opacity: [0, 1] } : {}}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <span className="text-[9px] font-bold text-gray-400 uppercase block">{t("neurolector.lookFor")}</span>
          <span className="text-2xl font-black tracking-wider" style={{ color: "#0051ff" }}>{currentCategory}</span>
        </motion.div>

        <div
          className={`text-5xl font-black uppercase tracking-tight ${wordAnim === "hit" ? "animate-pulse" : ""}`}
          style={{
            color: "#1a1a1a",
            transform: wordAnim === "shake" ? "translateX(-10px)" : "none",
            transition: "transform 0.1s",
          }}
          data-testid="word-display"
        >
          {currentWord}
        </div>
      </div>

      <div className="px-4 py-1.5 text-center text-[9px] font-medium text-gray-300">
        {t("neurolector.footer")}
      </div>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="mx-6 w-full max-w-sm rounded-3xl p-6 bg-white" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div className="text-center mb-5">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: "rgba(255,59,48,0.1)" }}>
                  <LogOut className="w-8 h-8" style={{ color: "#ff3b30" }} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{t("neurolector.exitTitle")}</h3>
                <p className="text-sm text-gray-500">{t("neurolector.exitMessage")}</p>
              </div>
              <div className="space-y-2">
                <button onClick={handleExitConfirm} className="w-full py-3 rounded-full font-semibold text-white text-sm" style={{ background: "linear-gradient(135deg, #ff3b30, #ff6b6b)" }} data-testid="button-confirm-exit">
                  {t("neurolector.exitConfirm")}
                </button>
                <button onClick={() => setShowExitConfirm(false)} className="w-full py-3 rounded-full font-semibold text-sm text-gray-500" style={{ border: "1px solid #e5e5e7" }} data-testid="button-cancel-exit">
                  {t("neurolector.exitCancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
