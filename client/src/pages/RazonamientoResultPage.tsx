import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";
import { Home, RotateCcw, Share2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { BottomNavBar } from "@/components/BottomNavBar";
import html2canvas from "html2canvas";
import localCaptureLogo from "@assets/logo1q_1770275527185.png";

const HEADER_LOGO = "https://iqexponencial.app/api/images/e038af72-17b2-4944-a203-afa1f753b33a";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const categoryLabels: Record<string, string> = {
  preescolar: "Pre escolar",
  ninos: "Niños",
  adolescentes: "Adolescentes",
  universitarios: "Adolescentes",
  profesionales: "Profesionales",
  adulto_mayor: "Adulto Mayor",
};

export default function RazonamientoResultPage() {
  const [, setLocation] = useLocation();
  const { userData, setUserData } = useUserData();
  const resultsRef = useRef<HTMLDivElement>(null);
  const captureAreaRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  const results = userData.razonamientoResults || { correct: 0, total: 0, time: 0, categoria: "ninos", title: "" };
  const percentage = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
  const categoryLabel = categoryLabels[results.categoria] || "Niños";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getMessage = () => {
    if (percentage >= 80) return "¡Excelente!";
    if (percentage >= 60) return "¡Muy bien!";
    if (percentage >= 40) return "¡Buen esfuerzo!";
    return "¡Sigue practicando!";
  };

  const message = getMessage();

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
      
      const logoHeight = 80;
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
    
    if (blob && navigator.share && navigator.canShare) {
      const file = new File([blob], 'resultado-razonamiento.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Mi resultado - IQEXPONENCIAL',
            text: `¡Obtuve ${percentage}% en Razonamiento! Entrena tu cerebro: https://iqexponencial.app`
          });
        } catch (e) {
          console.error("Share cancelled or failed:", e);
        }
        setIsSharing(false);
        return;
      }
    }
    
    const text = encodeURIComponent(`¡Obtuve ${percentage}% en el test de Razonamiento!\n\nEntrena tu cerebro en: https://iqexponencial.app`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setIsSharing(false);
  };
  
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    playButtonSound();
    
    const blob = await captureAndShare();
    
    if (blob) {
      const file = new File([blob], 'resultado-razonamiento.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Resultado Razonamiento' });
        } catch (e) {}
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado-razonamiento.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } else {
      const text = `Mi resultado en Razonamiento - ${percentage}%\n\nhttps://iqexponencial.app`;
      if (navigator.share) {
        await navigator.share({ title: "Resultado", text });
      }
    }
    setIsSharing(false);
  };

  const handleHome = () => {
    playButtonSound();
    setUserData({ ...userData, razonamientoResults: undefined });
    setLocation("/");
  };

  const handleRetry = () => {
    playButtonSound();
    setUserData({ ...userData, razonamientoResults: undefined });
    setLocation(`/razonamiento-selection/${results.categoria}`);
  };

  return (
    <div ref={resultsRef} className="min-h-screen bg-white flex flex-col">
      {/* Capture area - contains header and content, excludes buttons */}
      <div ref={captureAreaRef} className="bg-white">
        <header className="flex items-center justify-center px-5 py-3 bg-white border-b border-gray-100">
          <img src={HEADER_LOGO} alt="iQx" className="h-10 w-auto object-contain" />
        </header>
        <div className="px-5 pt-8 pb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black mb-2"
            style={{ color: "#1f2937" }}
          >
            {message}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm"
            style={{ color: "#6b7280" }}
          >
            Has completado el test de razonamiento
          </motion.p>
        </div>

        <div className="px-5 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center py-4"
          >
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#razonamientoGradient)" strokeWidth="10" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: percentage / 100 }}
                  transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="razonamientoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8a3ffc" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color: "#06b6d4" }}>{percentage}%</span>
                <span className="text-gray-500 text-sm">Comprensión</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-2xl p-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: "#9ca3af" }}>Respuestas</p>
                <p className="text-2xl font-bold" style={{ color: "#1f2937" }}>{results.correct}/{results.total}</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>correctas</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: "#9ca3af" }}>Tiempo</p>
                <p className="text-2xl font-bold" style={{ color: "#06b6d4" }}>{formatTime(results.time)}</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>minutos</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* End capture area */}

      {/* Buttons section - excluded from capture */}
      <div className="px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
              onClick={handleRetry}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold"
              style={{ background: "linear-gradient(90deg, #8a3ffc, #6b21a8)", color: "white" }}
              data-testid="button-retry"
            >
              <RotateCcw className="w-5 h-5" />
              Nuevo test
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleHome}
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
