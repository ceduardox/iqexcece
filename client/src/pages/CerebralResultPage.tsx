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

const HEADER_LOGO = "https://iqexponencial.app/api/images/e038af72-17b2-4944-a203-afa1f753b33a";

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
  const [isSharing, setIsSharing] = useState(false);
  
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
  const brainTopY = 22;
  const brainBottomY = 252;
  const brainHeight = brainBottomY - brainTopY;
  const leftFillY = brainBottomY - (leftPercent / 100) * brainHeight;
  const rightFillY = brainBottomY - (rightPercent / 100) * brainHeight;

  const leftTraits = ["reglas", "estrategia", "detalles", "racionalidad", "idioma", "lógica"];
  const rightTraits = ["imágenes", "caos", "creatividad", "intuición", "fantasía", "curiosidad"];

  const captureAndShare = async (): Promise<Blob | null> => {
    if (!captureAreaRef.current) return null;
    
    try {
      const capturedCanvas = await html2canvas(captureAreaRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
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
            text: `¡Mi dominancia cerebral: ${dominance}! https://iqexponencial.app`
          });
        } catch (e) {
          console.error("Share cancelled:", e);
        }
        setIsSharing(false);
        return;
      }
    }
    
    const text = encodeURIComponent(`¡Mi dominancia cerebral: ${dominance}!\n\nEntrena tu cerebro: https://iqexponencial.app`);
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
        <header className="relative flex items-center justify-center px-5 py-3 bg-white border-b border-gray-100 md:hidden">
          <img src={HEADER_LOGO} alt="iQx" className="h-10 w-auto object-contain" />
          <div className="absolute right-5"><LanguageButton /></div>
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
              ¡Felicidades!
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
                  <motion.p
                    key={trait}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className={`text-xs ${idx === 3 ? 'font-bold text-sm' : 'text-gray-500'}`}
                    style={idx === 3 ? { color: "#8a3ffc" } : {}}
                  >
                    {trait}
                  </motion.p>
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
                  <defs>
                    <linearGradient id="leftBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#67E8F9" />
                      <stop offset="55%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#0E7490" />
                    </linearGradient>
                    <linearGradient id="rightBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C4B5FD" />
                      <stop offset="55%" stopColor="#8A3FFC" />
                      <stop offset="100%" stopColor="#6D28D9" />
                    </linearGradient>
                    <radialGradient id="holoShine" cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
                      <stop offset="45%" stopColor="rgba(255,255,255,0.15)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                    <clipPath id="leftHalf">
                      <rect x="0" y="0" width="120" height="260" />
                    </clipPath>
                    <clipPath id="rightHalf">
                      <rect x="120" y="0" width="120" height="260" />
                    </clipPath>
                    <clipPath id="leftBrainShape">
                      <path
                        d="M120 22
                         C104 14, 86 16, 74 28
                         C62 23, 46 28, 39 43
                         C23 48, 16 66, 20 83
                         C10 98, 12 120, 27 134
                         C20 153, 28 176, 45 186
                         C47 208, 64 225, 85 230
                         C96 246, 110 252, 120 252
                         L120 22 Z"
                      />
                    </clipPath>
                    <clipPath id="rightBrainShape">
                      <path
                        d="M120 22
                         C136 14, 154 16, 166 28
                         C178 23, 194 28, 201 43
                         C217 48, 224 66, 220 83
                         C230 98, 228 120, 213 134
                         C220 153, 212 176, 195 186
                         C193 208, 176 225, 155 230
                         C144 246, 130 252, 120 252
                         L120 22 Z"
                      />
                    </clipPath>
                  </defs>
                  
                  <g clipPath="url(#leftHalf)">
                    <path
                      d="M120 22
                         C104 14, 86 16, 74 28
                         C62 23, 46 28, 39 43
                         C23 48, 16 66, 20 83
                         C10 98, 12 120, 27 134
                         C20 153, 28 176, 45 186
                         C47 208, 64 225, 85 230
                         C96 246, 110 252, 120 252
                         L120 22 Z"
                      fill="rgba(6,182,212,0.12)"
                    />
                    <motion.rect
                      x="0"
                      y={leftFillY}
                      width="120"
                      height={Math.max(0, brainBottomY - leftFillY) + 6}
                      fill="url(#leftBrainGrad)"
                      clipPath="url(#leftBrainShape)"
                      animate={{ y: [leftFillY, leftFillY - 2, leftFillY] }}
                      transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.rect
                      x="18"
                      y={leftFillY - 2}
                      width="95"
                      height="2"
                      fill="rgba(255,255,255,0.55)"
                      clipPath="url(#leftBrainShape)"
                      animate={{ opacity: [0.35, 0.8, 0.35] }}
                      transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <path
                      d="M120 22
                         C104 14, 86 16, 74 28
                         C62 23, 46 28, 39 43
                         C23 48, 16 66, 20 83
                         C10 98, 12 120, 27 134
                         C20 153, 28 176, 45 186
                         C47 208, 64 225, 85 230
                         C96 246, 110 252, 120 252
                         L120 22 Z"
                      fill="url(#leftBrainGrad)"
                     stroke="rgba(14,116,144,0.75)"
                      strokeWidth="2.4"
                    />
                    <path d="M86 42 C68 50, 62 66, 74 80 C84 92, 86 104, 74 116" fill="none" stroke="rgba(14,116,144,0.9)" strokeWidth="2.1" strokeLinecap="round" />
                    <path d="M62 66 C52 78, 52 92, 64 102 C76 112, 74 126, 60 136" fill="none" stroke="rgba(14,116,144,0.75)" strokeWidth="1.9" strokeLinecap="round" />
                    <path d="M48 110 C62 120, 66 134, 56 146 C46 158, 50 172, 64 182" fill="none" stroke="rgba(14,116,144,0.82)" strokeWidth="1.9" strokeLinecap="round" />
                    <path d="M84 154 C74 166, 74 182, 88 192 C98 200, 102 212, 94 224" fill="none" stroke="rgba(14,116,144,0.75)" strokeWidth="1.8" strokeLinecap="round" />
                  </g>
                  
                  <g clipPath="url(#rightHalf)">
                    <path
                      d="M120 22
                         C136 14, 154 16, 166 28
                         C178 23, 194 28, 201 43
                         C217 48, 224 66, 220 83
                         C230 98, 228 120, 213 134
                         C220 153, 212 176, 195 186
                         C193 208, 176 225, 155 230
                         C144 246, 130 252, 120 252
                         L120 22 Z"
                      fill="rgba(138,63,252,0.12)"
                    />
                    <motion.rect
                      x="120"
                      y={rightFillY}
                      width="120"
                      height={Math.max(0, brainBottomY - rightFillY) + 6}
                      fill="url(#rightBrainGrad)"
                      clipPath="url(#rightBrainShape)"
                      animate={{ y: [rightFillY, rightFillY - 2, rightFillY] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.rect
                      x="128"
                      y={rightFillY - 2}
                      width="95"
                      height="2"
                      fill="rgba(255,255,255,0.55)"
                      clipPath="url(#rightBrainShape)"
                      animate={{ opacity: [0.35, 0.8, 0.35] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <path
                      d="M120 22
                         C136 14, 154 16, 166 28
                         C178 23, 194 28, 201 43
                         C217 48, 224 66, 220 83
                         C230 98, 228 120, 213 134
                         C220 153, 212 176, 195 186
                         C193 208, 176 225, 155 230
                         C144 246, 130 252, 120 252
                         L120 22 Z"
                      fill="url(#rightBrainGrad)"
                      stroke="rgba(109,40,217,0.82)"
                      strokeWidth="2.4"
                    />
                    <path d="M154 42 C172 50, 178 66, 166 80 C156 92, 154 104, 166 116" fill="none" stroke="rgba(109,40,217,0.9)" strokeWidth="2.1" strokeLinecap="round" />
                    <path d="M178 66 C188 78, 188 92, 176 102 C164 112, 166 126, 180 136" fill="none" stroke="rgba(109,40,217,0.75)" strokeWidth="1.9" strokeLinecap="round" />
                    <path d="M192 110 C178 120, 174 134, 184 146 C194 158, 190 172, 176 182" fill="none" stroke="rgba(109,40,217,0.82)" strokeWidth="1.9" strokeLinecap="round" />
                    <path d="M156 154 C166 166, 166 182, 152 192 C142 200, 138 212, 146 224" fill="none" stroke="rgba(109,40,217,0.75)" strokeWidth="1.8" strokeLinecap="round" />
                  </g>

                  <path
                    d="M120 26 C120 52, 120 88, 120 252"
                    stroke="rgba(31,41,55,0.55)"
                    strokeWidth="2.4"
                    strokeDasharray="5,6"
                  />

                  <ellipse cx="120" cy="136" rx="98" ry="114" fill="url(#holoShine)" />

                  <text x="78" y="146" textAnchor="middle" className="text-2xl font-black" fill="white">
                    {leftPercent}%
                  </text>
                  <text x="162" y="146" textAnchor="middle" className="text-2xl font-black" fill="white">
                    {rightPercent}%
                  </text>
                </motion.svg>
              </motion.div>

              <div className="absolute right-0 text-left pl-2 space-y-1 w-20">
                {rightTraits.map((trait, idx) => (
                  <motion.p
                    key={trait}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className={`text-xs ${idx === 3 ? 'font-bold text-sm' : 'text-gray-500'}`}
                    style={idx === 3 ? { color: "#8a3ffc" } : {}}
                  >
                    {trait}
                  </motion.p>
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
              <p className="text-xl font-black text-gray-800">más dominante.</p>
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
              Más opciones
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
