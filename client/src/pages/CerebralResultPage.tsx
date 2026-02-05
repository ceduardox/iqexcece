import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Share2, MessageCircle, Brain, ArrowLeft, RotateCcw } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { BottomNavBar } from "@/components/BottomNavBar";
import html2canvas from "html2canvas";

const HEADER_LOGO = "https://iqexponencial.app/api/images/e038af72-17b2-4944-a203-afa1f753b33a";
const CAPTURE_LOGO = "https://iqexponencial.app/api/images/43c8a96f-020d-482e-83c7-3de342d11d48";
const LOGO_BASE64_KEY = "iqx_capture_logo_43c8";

interface PreferenciaAnswer {
  tema: string;
  imageUrl: string;
  meaning: string;
}

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

export default function CerebralResultPage() {
  const [, setLocation] = useLocation();
  const resultsRef = useRef<HTMLDivElement>(null);
  const captureAreaRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  
  const storedLateralidad = sessionStorage.getItem('lateralidadAnswers');
  const storedPreferencia = sessionStorage.getItem('preferenciaAnswers');
  const storedCerebral = sessionStorage.getItem('cerebralAnswers');
  const lateralidadAnswers: string[] = storedLateralidad ? JSON.parse(storedLateralidad) : [];
  const preferenciaAnswers: PreferenciaAnswer[] = storedPreferencia ? JSON.parse(storedPreferencia) : [];
  const cerebralAnswers: { tema: string; type: string; answer: string; correct: string }[] = storedCerebral ? JSON.parse(storedCerebral) : [];
  
  // Calculate correct answers for other exercises
  const correctCount = cerebralAnswers.filter(a => a.answer === a.correct).length;
  const totalExercises = cerebralAnswers.length;
  
  const leftCount = lateralidadAnswers.filter(a => a.toLowerCase().includes('izquierda') || a.toLowerCase() === 'izquierda').length;
  const rightCount = lateralidadAnswers.filter(a => a.toLowerCase().includes('derecha') || a.toLowerCase() === 'derecha').length;
  const total = leftCount + rightCount || 1;
  
  const leftPercent = Math.round((leftCount / total) * 100);
  const rightPercent = 100 - leftPercent;
  
  const isDominantLeft = leftPercent >= rightPercent;
  const personalityTraits = preferenciaAnswers.map(a => a.meaning).filter(Boolean);

  const leftTraits = ["reglas", "estrategia", "detalles", "racionalidad", "idioma", "lógica"];
  const rightTraits = ["imágenes", "caos", "creatividad", "intuición", "fantasía", "curiosidad"];
  
  useEffect(() => {
    const cached = sessionStorage.getItem(LOGO_BASE64_KEY);
    if (cached) {
      setLogoBase64(cached);
    } else {
      fetch(CAPTURE_LOGO)
        .then(r => r.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const b64 = reader.result as string;
            sessionStorage.setItem(LOGO_BASE64_KEY, b64);
            setLogoBase64(b64);
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => setLogoBase64(CAPTURE_LOGO));
    }
  }, []);

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
      
      if (logoBase64) {
        const logoImg = new Image();
        logoImg.src = logoBase64;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        const logoWidth = Math.min(200, finalWidth * 0.4);
        const logoX = (finalWidth - logoWidth) / 2;
        ctx.drawImage(logoImg, logoX, padding / 2, logoWidth, logoHeight - padding);
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
        <header className="flex items-center justify-center px-5 py-3 bg-white border-b border-gray-100">
          <img src={HEADER_LOGO} alt="iQx" className="h-10 w-auto object-contain" />
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
                className="relative w-40 h-48"
              >
                <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-lg">
                  <defs>
                    <linearGradient id="leftBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#0891B2" />
                    </linearGradient>
                    <linearGradient id="rightBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8a3ffc" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                    <clipPath id="leftHalf">
                      <rect x="0" y="0" width="100" height="220" />
                    </clipPath>
                    <clipPath id="rightHalf">
                      <rect x="100" y="0" width="100" height="220" />
                    </clipPath>
                  </defs>
                  
                  <g clipPath="url(#leftHalf)">
                    <path
                      d="M100 15 C55 15 25 50 20 95 C15 140 25 170 40 190 C55 210 75 218 100 218 L100 15"
                      fill="url(#leftBrainGrad)"
                      stroke="#0E7490"
                      strokeWidth="2"
                    />
                    <path d="M45 60 Q65 75 55 95 Q45 115 65 130 Q75 145 60 165" fill="none" stroke="#0E7490" strokeWidth="2" strokeLinecap="round" />
                    <path d="M35 100 Q55 115 45 140 Q40 160 55 175" fill="none" stroke="#0E7490" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                  
                  <g clipPath="url(#rightHalf)">
                    <path
                      d="M100 15 C145 15 175 50 180 95 C185 140 175 170 160 190 C145 210 125 218 100 218 L100 15"
                      fill="url(#rightBrainGrad)"
                      stroke="#6D28D9"
                      strokeWidth="2"
                    />
                    <path d="M155 60 Q135 75 145 95 Q155 115 135 130 Q125 145 140 165" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" />
                    <path d="M165 100 Q145 115 155 140 Q160 160 145 175" fill="none" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" />
                  </g>

                  <line x1="100" y1="15" x2="100" y2="218" stroke="#374151" strokeWidth="2" strokeDasharray="4,4" />

                  <text x="50" y="120" textAnchor="middle" className="text-xl font-black" fill="white">
                    {leftPercent}%
                  </text>
                  <text x="150" y="120" textAnchor="middle" className="text-xl font-black" fill="white">
                    {rightPercent}%
                  </text>
                </svg>
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
                        ans.answer === ans.correct ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <span className="text-gray-600 capitalize">{ans.type}</span>
                      <div className="flex items-center gap-2">
                        <span className={ans.answer === ans.correct ? 'text-green-600' : 'text-red-600'}>
                          {ans.answer}
                        </span>
                        {ans.answer !== ans.correct && (
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
