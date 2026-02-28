import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Home, Share2, MessageCircle, Brain, ArrowLeft, RotateCcw } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { BottomNavBar } from "@/components/BottomNavBar";
import { LanguageButton } from "@/components/LanguageButton";
import html2canvas from "html2canvas";
import localCaptureLogo from "@assets/logo1q_1770275527185.png";
import { computeCerebralProfile, isCerebralAnswerCorrect, type CerebralAnswer, type PreferenciaAnswer } from "@/lib/cerebral-scoring";

const LOGO_URL = "https://iqexponencial.app/api/images/e038af72-17b2-4944-a203-afa1f753b33a";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

export default function CerebralResultPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const resultsRef = useRef<HTMLDivElement>(null);
  const captureAreaRef = useRef<HTMLDivElement>(null);
  const shareCaptureRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [animatedLeftPercent, setAnimatedLeftPercent] = useState(0);
  const [animatedRightPercent, setAnimatedRightPercent] = useState(0);
  
  const storedLateralidad = sessionStorage.getItem('lateralidadAnswers');
  const storedPreferencia = sessionStorage.getItem('preferenciaAnswers');
  const storedCerebral = sessionStorage.getItem('cerebralAnswers');
  const lateralidadAnswers: string[] = storedLateralidad ? JSON.parse(storedLateralidad) : [];
  const preferenciaAnswers: PreferenciaAnswer[] = storedPreferencia ? JSON.parse(storedPreferencia) : [];
  const cerebralAnswers: CerebralAnswer[] = storedCerebral ? JSON.parse(storedCerebral) : [];

  const profile = computeCerebralProfile({
    lateralidadAnswers,
    preferenciaAnswers,
    cerebralAnswers,
  });

  const correctCount = profile.correctCount;
  const totalExercises = profile.totalExercises;
  const leftPercent = profile.leftPercent;
  const rightPercent = profile.rightPercent;
  const isDominantLeft = profile.dominantSide === "izquierdo";
  const personalityTraits = profile.personalityTraits;

  const leftTraits = ["reglas", "estrategia", "detalles", "racionalidad", "idioma", "l\u00f3gica"];
  const rightTraits = ["im\u00e1genes", "caos", "creatividad", "intuici\u00f3n", "fantas\u00eda", "curiosidad"];

  const normalize = (value: string) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const normalizedPersonalityTraits = personalityTraits.map(normalize);
  const leftTraitHints: Record<string, string[]> = {
    reglas: ["regla", "orden", "norma"],
    estrategia: ["estrateg", "plan"],
    detalles: ["detalle", "precision", "minuc"],
    racionalidad: ["racional", "analit", "analisis"],
    idioma: ["idioma", "lengua", "verbal", "comunic"],
    "l\u00f3gica": ["logica", "razon", "deduc"],
  };
  const rightTraitHints: Record<string, string[]> = {
    "im\u00e1genes": ["imagen", "visual"],
    caos: ["caos", "improvis"],
    creatividad: ["creativ", "innov", "original"],
    "intuici\u00f3n": ["intuic", "instint"],
    "fantas\u00eda": ["fantas", "imagin"],
    curiosidad: ["curios", "explor"],
  };

  const highlightedLeftTrait =
    leftTraits.find((trait) =>
      (leftTraitHints[trait] || []).some((hint) =>
        normalizedPersonalityTraits.some((entry) => entry.includes(hint)),
      ),
    ) || null;

  const highlightedRightTrait =
    rightTraits.find((trait) =>
      (rightTraitHints[trait] || []).some((hint) =>
        normalizedPersonalityTraits.some((entry) => entry.includes(hint)),
      ),
    ) || null;

  useEffect(() => {
    const durationMs = 1400;
    const start = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedLeftPercent(Math.round(leftPercent * eased));
      setAnimatedRightPercent(Math.round(rightPercent * eased));
      if (t < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [leftPercent, rightPercent]);

  const captureAndShare = async (): Promise<Blob | null> => {
    const nodeToCapture = shareCaptureRef.current ?? captureAreaRef.current;
    if (!nodeToCapture) return null;
    
    try {
      const capturedCanvas = await html2canvas(nodeToCapture, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        foreignObjectRendering: false,
        logging: false,
        allowTaint: true,
      });
      
      const logoHeight = 240;
      const padding = 20;
      const finalWidth = capturedCanvas.width;
      const finalHeight = capturedCanvas.height + logoHeight + padding;
      
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = finalWidth;
      finalCanvas.height = finalHeight;
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalWidth, finalHeight);
      
      if (localCaptureLogo) {
        const logoImg = new Image();
        logoImg.src = localCaptureLogo;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
        const drawHeight = logoHeight - padding;
        const drawWidth = drawHeight * aspectRatio;
        const logoX = (finalWidth - drawWidth) / 2;
        ctx.drawImage(logoImg, logoX, padding / 2, drawWidth, drawHeight);
      }
      
      ctx.drawImage(capturedCanvas, 0, logoHeight);
      
      return new Promise<Blob>((resolve, reject) => {
        finalCanvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png', 0.95);
      });
    } catch (e) {
      console.error("Capture error:", e);
      return null;
    }
  };
  
  const handleWhatsAppShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    playButtonSound();
    
    const blob = await captureAndShare();
    const dominance = isDominantLeft ? "Hemisferio Izquierdo" : "Hemisferio Derecho";
    
    if (blob && navigator.share && navigator.canShare) {
      const file = new File([blob], 'resultado-cerebral.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Mi resultado - IQEXPONENCIAL',
            text: `\u00a1Mi dominancia cerebral: ${dominance}! https://iqexponencial.app`
          });
        } catch (e) {
          console.error("Share cancelled:", e);
        }
        setIsSharing(false);
        return;
      }
    }
    
    const text = encodeURIComponent(`\u00a1Mi dominancia cerebral: ${dominance}!\n\nEntrena tu cerebro: https://iqexponencial.app`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setIsSharing(false);
  };
  
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    playButtonSound();
    
    const blob = await captureAndShare();
    
    if (blob) {
      const file = new File([blob], 'resultado-cerebral.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Resultado Cerebral' });
        } catch (e) {}
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado-cerebral.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } else {
      const dominance = isDominantLeft ? "Hemisferio Izquierdo" : "Hemisferio Derecho";
      const text = `Mi dominancia: ${dominance}\n\nhttps://iqexponencial.app`;
      if (navigator.share) {
        await navigator.share({ title: "Resultado", text });
      }
    }
    setIsSharing(false);
  };

  const handleNewTest = () => {
    playButtonSound();
    sessionStorage.removeItem('lateralidadAnswers');
    sessionStorage.removeItem('preferenciaAnswers');
    sessionStorage.removeItem('cerebralAnswers');
    setLocation('/cerebral/seleccion');
  };

  return (
    <div ref={resultsRef} className="min-h-screen bg-white flex flex-col">
      {/* Capture area - contains header and content, excludes buttons */}
      <div ref={captureAreaRef} className="bg-white">
        <header
          className="sticky top-0 z-50 w-full md:hidden"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
          }}
        >
          <div className="relative pt-3 pb-2 px-5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setLocation('/cerebral/seleccion')}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 2px 8px rgba(138, 63, 252, 0.15)",
                }}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: "#8a3ffc" }} />
              </button>

              <div className="flex items-center justify-center">
                <img src={LOGO_URL} alt="iQx" className="h-10 w-auto object-contain" />
              </div>

              <LanguageButton />
            </div>
          </div>
        </header>
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(6, 182, 212, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="px-5 pt-4 pb-2 text-center">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold"
              style={{ color: "#8a3ffc" }}
            >
              Test Cerebral
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-xl font-bold"
              style={{ color: "#1f2937" }}
            >
              {"\u00a1Felicidades!"}
            </motion.h1>
          </div>
        </div>

        <div className="px-4 py-3">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
          >
            <div className="relative flex justify-center items-center mb-6">
              <div className="absolute left-0 text-right pr-2 space-y-1 w-20">
                {leftTraits.map((trait, idx) => (
                  (() => {
                    const isHighlighted = trait === highlightedLeftTrait;
                    return (
                  <motion.p
                    key={trait}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className={`text-xs ${isHighlighted ? 'font-bold text-sm' : 'text-gray-500'}`}
                    style={isHighlighted ? { color: "#8a3ffc" } : {}}
                  >
                    {trait}
                  </motion.p>
                    );
                  })()
                ))}
              </div>

              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative w-48 h-56"
              >
                <motion.div
                  className="absolute inset-0 rounded-[40px] blur-2xl opacity-50"
                  style={{ background: "radial-gradient(circle at 30% 40%, rgba(6,182,212,0.5), transparent 55%), radial-gradient(circle at 70% 40%, rgba(138,63,252,0.5), transparent 55%)" }}
                  animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.96, 1.03, 0.96] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.span
                  className="absolute -top-2 left-8 w-2 h-2 rounded-full bg-cyan-300/80"
                  animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute top-8 -right-1 w-2.5 h-2.5 rounded-full bg-violet-300/80"
                  animate={{ y: [0, 8, 0], opacity: [0.35, 0.95, 0.35] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute bottom-8 -left-1 w-2 h-2 rounded-full bg-cyan-200/80"
                  animate={{ y: [0, -7, 0], opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.svg
                  viewBox="0 0 240 260"
                  className="relative w-full h-full drop-shadow-[0_10px_22px_rgba(0,0,0,0.22)]"
                  animate={{ y: [0, -4, 0], rotateZ: [0, 0.8, 0] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <foreignObject x="0" y="0" width="240" height="260">
                    <div
                      style={{
                        position: "relative",
                        width: "240px",
                        height: "260px",
                        WebkitMaskImage: "url('/brain50.svg')",
                        maskImage: "url('/brain50.svg')",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                        background: "rgba(15,23,42,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        style={{
                          position: "absolute",
                          left: "0",
                          width: "50%",
                          bottom: "0",
                          height: `${animatedLeftPercent}%`,
                          background: "linear-gradient(180deg, #67E8F9 0%, #06B6D4 60%, #0E7490 100%)",
                          boxShadow: "inset 0 6px 18px rgba(255,255,255,0.35)",
                        }}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        style={{
                          position: "absolute",
                          left: "3%",
                          width: "44%",
                          bottom: `calc(${animatedLeftPercent}% - 2px)`,
                          height: "2px",
                          background: "rgba(255,255,255,0.75)",
                          borderRadius: "999px",
                        }}
                        animate={{ opacity: [0.35, 0.9, 0.35] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      />

                      <motion.div
                        style={{
                          position: "absolute",
                          right: "0",
                          width: "50%",
                          bottom: "0",
                          height: `${animatedRightPercent}%`,
                          background: "linear-gradient(180deg, #C4B5FD 0%, #8A3FFC 60%, #6D28D9 100%)",
                          boxShadow: "inset 0 6px 18px rgba(255,255,255,0.35)",
                        }}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        style={{
                          position: "absolute",
                          right: "3%",
                          width: "44%",
                          bottom: `calc(${animatedRightPercent}% - 2px)`,
                          height: "2px",
                          background: "rgba(255,255,255,0.75)",
                          borderRadius: "999px",
                        }}
                        animate={{ opacity: [0.35, 0.9, 0.35] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </foreignObject>

                  <line
                    x1="120"
                    y1="18"
                    x2="120"
                    y2="248"
                    stroke="rgba(31,41,55,0.6)"
                    strokeWidth="2.2"
                    strokeDasharray="5,6"
                  />

                  <text
                    x="78"
                    y="146"
                    textAnchor="middle"
                    className="text-3xl font-black"
                    fill="#06B6D4"
                    style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))" }}
                  >
                    {animatedLeftPercent}%
                  </text>
                  <text
                    x="162"
                    y="146"
                    textAnchor="middle"
                    className="text-3xl font-black"
                    fill="#8A3FFC"
                    style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))" }}
                  >
                    {animatedRightPercent}%
                  </text>
                </motion.svg>
                <svg viewBox="0 0 240 260" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                  <image href="/brain50.svg" x="0" y="0" width="240" height="260" opacity="0.22" />
                </svg>
              </motion.div>

              <div className="absolute right-0 text-left pl-2 space-y-1 w-20">
                {rightTraits.map((trait, idx) => (
                  (() => {
                    const isHighlighted = trait === highlightedRightTrait;
                    return (
                  <motion.p
                    key={trait}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className={`text-xs ${isHighlighted ? 'font-bold text-sm' : 'text-gray-500'}`}
                    style={isHighlighted ? { color: "#8a3ffc" } : {}}
                  >
                    {trait}
                  </motion.p>
                    );
                  })()
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center mb-4"
            >
              <p className="text-gray-600">
                El lado <span className="font-bold" style={{ color: "#8a3ffc" }}>
                  {isDominantLeft ? 'izquierdo' : 'derecho'}
                </span> de tu cerebro es
              </p>
              <p className="text-xl font-black text-gray-800">{"m\u00e1s dominante."}</p>
            </motion.div>

            {personalityTraits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-4 border-t border-dashed border-gray-200"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Brain className="w-4 h-4" style={{ color: "#8a3ffc" }} />
                  <p className="font-semibold text-sm" style={{ color: "#8a3ffc" }}>Tu perfil revela:</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {personalityTraits.map((trait, idx) => (
                    <motion.span 
                      key={idx}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + idx * 0.1 }}
                      className="px-3 py-1.5 text-white text-xs font-medium rounded-full"
                      style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
                    >
                      {trait}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Exercise Results Section */}
            {totalExercises > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="pt-4 mt-4 border-t border-dashed border-gray-200"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-2xl font-black" style={{ color: "#8a3ffc" }}>{correctCount}/{totalExercises}</span>
                  <span className="text-sm text-gray-600">respuestas correctas</span>
                </div>
                <div className="space-y-2">
                  {cerebralAnswers.map((ans, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        isCerebralAnswerCorrect(ans) ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <span className="text-gray-600 capitalize">{ans.type}</span>
                      <div className="flex items-center gap-2">
                        <span className={isCerebralAnswerCorrect(ans) ? 'text-green-600' : 'text-red-600'}>
                          {ans.answer}
                        </span>
                        {!isCerebralAnswerCorrect(ans) && (
                          <span className="text-green-600">({ans.correct})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      {/* End capture area */}

      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <div ref={shareCaptureRef} className="w-[900px] bg-white p-8">
          <div className="text-center mb-6">
            <p className="text-2xl font-semibold" style={{ color: "#8a3ffc" }}>Test Cerebral</p>
            <h2 className="text-5xl font-black text-gray-800">{"\u00a1Felicidades!"}</h2>
          </div>
          <div className="rounded-3xl border border-gray-200 p-8 bg-white">
            <div className="flex items-center justify-between">
              <div className="w-44 text-right space-y-2">
                {leftTraits.map((trait, idx) => (
                  <p
                    key={`capture-left-${trait}`}
                    className={`text-2xl ${trait === highlightedLeftTrait ? "font-bold" : "text-gray-500"}`}
                    style={trait === highlightedLeftTrait ? { color: "#8a3ffc" } : {}}
                  >
                    {trait}
                  </p>
                ))}
              </div>

              <div className="relative w-[340px] h-[380px]">
                <div className="absolute inset-0 rounded-[70px] overflow-hidden border border-gray-200 bg-[#eef7fb]">
                  <div
                    className="absolute left-0 bottom-0 w-1/2"
                    style={{
                      height: `${leftPercent}%`,
                      background: "linear-gradient(180deg, #67E8F9 0%, #06B6D4 60%, #0E7490 100%)",
                    }}
                  />
                  <div
                    className="absolute right-0 bottom-0 w-1/2"
                    style={{
                      height: `${rightPercent}%`,
                      background: "linear-gradient(180deg, #C4B5FD 0%, #8A3FFC 60%, #6D28D9 100%)",
                    }}
                  />
                  <div className="absolute inset-0">
                    <img src="/brain-colorful.png" alt="" className="w-full h-full object-contain opacity-60" />
                  </div>
                </div>
                <div className="absolute inset-y-3 left-1/2 -translate-x-1/2 w-[2px] bg-gray-500/70" style={{ borderStyle: "dashed" }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-[34%] -translate-x-1/2 text-[56px] font-black"
                  style={{ color: "#06B6D4", textShadow: "0 3px 4px rgba(0,0,0,0.35)" }}
                >
                  {leftPercent}%
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 left-[66%] -translate-x-1/2 text-[56px] font-black"
                  style={{ color: "#8A3FFC", textShadow: "0 3px 4px rgba(0,0,0,0.35)" }}
                >
                  {rightPercent}%
                </div>
              </div>

              <div className="w-44 text-left space-y-2">
                {rightTraits.map((trait, idx) => (
                  <p
                    key={`capture-right-${trait}`}
                    className={`text-2xl ${trait === highlightedRightTrait ? "font-bold" : "text-gray-500"}`}
                    style={trait === highlightedRightTrait ? { color: "#8a3ffc" } : {}}
                  >
                    {trait}
                  </p>
                ))}
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-[42px] text-gray-700">
                El lado <span className="font-bold" style={{ color: "#8a3ffc" }}>{isDominantLeft ? "izquierdo" : "derecho"}</span> de tu cerebro es
              </p>
              <p className="text-[56px] font-black text-gray-800">{"m\u00e1s dominante."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons section - excluded from capture */}
      <div className="px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          {/* WhatsApp - Primary button on mobile */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppShare}
              disabled={isSharing}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-bold shadow-lg disabled:opacity-50"
              style={{ background: "#25D366" }}
              data-testid="button-whatsapp-share"
            >
              <SiWhatsapp className="w-5 h-5" />
              {isSharing ? 'Compartiendo...' : 'Compartir en WhatsApp'}
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              disabled={isSharing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold border-2 disabled:opacity-50"
              style={{ borderColor: "#8a3ffc", color: "#8a3ffc" }}
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5" />
              {"M\u00e1s opciones"}
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleNewTest}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold"
              style={{ background: "linear-gradient(90deg, #8a3ffc, #6b21a8)", color: "white" }}
              data-testid="button-new-test"
            >
              <RotateCcw className="w-5 h-5" />
              Nuevo test
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setLocation("/")}
              className="w-full flex items-center justify-center gap-2 py-2 font-medium"
              style={{ color: "#6b7280" }}
              data-testid="button-home"
            >
              <Home className="w-4 h-4" />
              Volver al inicio
            </motion.button>
        </motion.div>
      </div>
      
      <BottomNavBar />
    </div>
  );
}

