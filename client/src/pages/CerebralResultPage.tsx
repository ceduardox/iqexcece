import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Share2, MessageCircle, Brain, ArrowLeft } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

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
  
  const storedLateralidad = sessionStorage.getItem('lateralidadAnswers');
  const storedPreferencia = sessionStorage.getItem('preferenciaAnswers');
  const lateralidadAnswers: string[] = storedLateralidad ? JSON.parse(storedLateralidad) : [];
  const preferenciaAnswers: PreferenciaAnswer[] = storedPreferencia ? JSON.parse(storedPreferencia) : [];
  
  const leftCount = lateralidadAnswers.filter(a => a.toLowerCase().includes('izquierda') || a.toLowerCase() === 'izquierda').length;
  const rightCount = lateralidadAnswers.filter(a => a.toLowerCase().includes('derecha') || a.toLowerCase() === 'derecha').length;
  const total = leftCount + rightCount || 1;
  
  const leftPercent = Math.round((leftCount / total) * 100);
  const rightPercent = 100 - leftPercent;
  
  const isDominantLeft = leftPercent >= rightPercent;
  const personalityTraits = preferenciaAnswers.map(a => a.meaning).filter(Boolean);

  const leftTraits = ["reglas", "estrategia", "detalles", "racionalidad", "idioma", "lógica"];
  const rightTraits = ["imágenes", "caos", "creatividad", "intuición", "fantasía", "curiosidad"];

  const handleNewTest = () => {
    playButtonSound();
    sessionStorage.removeItem('lateralidadAnswers');
    sessionStorage.removeItem('preferenciaAnswers');
    setLocation('/cerebral/seleccion');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header 
        className="sticky top-0 z-50 w-full"
        style={{
          background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
        }}
      >
        <div className="relative pt-3 pb-2 px-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setLocation("/")}
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
            
            <div className="w-10" />
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-4 grid grid-cols-3 gap-3"
          >
            <Button
              onClick={handleNewTest}
              className="flex flex-col items-center gap-1 py-4"
              style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #6D28D9 100%)" }}
              data-testid="button-new-test"
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Nuevo Test</span>
            </Button>
            <Button
              className="flex flex-col items-center gap-1 py-4"
              style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891B2 100%)" }}
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-[10px]">Compartir</span>
            </Button>
            <Button
              className="flex flex-col items-center gap-1 py-4"
              style={{ background: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)" }}
              data-testid="button-contact"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px]">Escríbenos</span>
            </Button>
          </motion.div>
        </div>
      </main>
      
      <BottomNavBar />
    </div>
  );
}
