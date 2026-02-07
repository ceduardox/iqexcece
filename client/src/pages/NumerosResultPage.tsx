import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { RotateCcw, Share2, ArrowLeft } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";
import html2canvas from "html2canvas";
import { LanguageButton } from "@/components/LanguageButton";

const LOGO_URL = "https://iqexponencial.app/api/images/5e3b7dfb-4bda-42bf-b454-c1fe7d5833e3";

export default function NumerosResultPage() {
  const [, navigate] = useLocation();
  const [results, setResults] = useState({
    correctas: 0,
    incorrectas: 0,
    sinResponder: 0,
    tiempo: 60,
    nivel: "Números"
  });
  const [nivelesPath, setNivelesPath] = useState("/");

  useEffect(() => {
    const stored = sessionStorage.getItem("numerosResultados");
    if (stored) {
      setResults(JSON.parse(stored));
    }
    const storedPath = sessionStorage.getItem("numerosNivelesPath");
    if (storedPath) {
      setNivelesPath(storedPath);
    }
  }, []);

  const resultsRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing || !resultsRef.current) return;
    setIsSharing(true);
    
    try {
      const logoImg = resultsRef.current.querySelector('img[alt="iQx"]') as HTMLImageElement;
      if (logoImg) {
        try {
          const response = await fetch(logoImg.src);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          logoImg.src = base64;
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {}
      }
      
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed'));
        }, 'image/png', 1.0);
      });
      
      const file = new File([blob], 'resultado-numeros.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Números y Letras - IQEXPONENCIAL',
          text: `Mi resultado en Números y Letras\n\nEntrena tu cerebro en: https://iqexponencial.app`,
          files: [file]
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado-numeros.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {}
    setIsSharing(false);
  };

  const total = results.correctas + results.incorrectas + results.sinResponder || 1;
  const percentage = Math.round((results.correctas / total) * 100);

  return (
    <div ref={resultsRef} className="min-h-screen bg-white flex flex-col">
      <header 
        className="sticky top-0 z-50 w-full bg-white"
        style={{
          background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
        }}
      >
        <div className="relative pt-3 pb-2 px-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(nivelesPath)}
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
              <img 
                src={LOGO_URL} 
                alt="iQx" 
                className="h-10 w-auto object-contain"
              />
            </div>
            
            <LanguageButton />
          </div>
        </div>
      </header>

      <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(6, 182, 212, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="px-5 pt-4 pb-4 text-center">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold mb-2"
              style={{ color: "#8a3ffc" }}
            >
              RESULTADO
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold text-gray-800"
            >
              Identifica rápidamente<br/>Números y Letras
            </motion.h1>
          </div>
        </div>

        <div className="px-5 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mb-6"
          >
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#gradientNumeros)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 42 * (1 - percentage / 100) 
                  }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="gradientNumeros" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8a3ffc" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="text-3xl font-bold text-gray-800"
                >
                  {percentage}%
                </motion.span>
                <span className="text-xs text-gray-500">Aciertos</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-lg p-5 w-full max-w-sm shadow-sm"
          >
            <div className="text-center mb-4">
              <p className="text-gray-400 text-xs tracking-wider">NIVEL</p>
              <p className="text-gray-800 text-lg font-bold">{results.nivel}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-lg">😊</span>
                  <span className="text-2xl font-bold text-green-600">{results.correctas}</span>
                </div>
                <p className="text-xs text-gray-500">Correctas</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-lg">😢</span>
                  <span className="text-2xl font-bold text-red-500">{results.incorrectas}</span>
                </div>
                <p className="text-xs text-gray-500">Incorrectas</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-600">{results.sinResponder}</p>
                <p className="text-xs text-gray-500">Sin responder</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{results.tiempo}s</p>
                <p className="text-xs text-gray-500">Tiempo</p>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-3 mt-6 w-full max-w-sm">
            <button
              onClick={() => navigate(nivelesPath)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-white font-semibold rounded-lg"
              style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
              data-testid="button-new-test"
            >
              <RotateCcw className="w-5 h-5" />
              Nuevo Test
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg"
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
