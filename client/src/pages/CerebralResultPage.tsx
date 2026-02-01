import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Share2, MessageCircle, Sparkles, Brain } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";

interface PreferenciaAnswer {
  tema: string;
  imageUrl: string;
  meaning: string;
}

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
            initial={{ 
              x: Math.random() * 400, 
              y: Math.random() * 800,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, -100],
              opacity: [0.3, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Header with glow effect */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <motion.div
            animate={{ 
              textShadow: ["0 0 20px rgba(147, 51, 234, 0.5)", "0 0 40px rgba(147, 51, 234, 0.8)", "0 0 20px rgba(147, 51, 234, 0.5)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-purple-300 text-xs uppercase tracking-[0.3em] font-medium mb-2">✦ RESULTADO ✦</p>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Test Cerebral
            </h1>
          </motion.div>
        </motion.div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="bg-gradient-to-br from-white/95 to-white/90 rounded-3xl p-6 shadow-2xl shadow-purple-500/20 backdrop-blur-sm border border-white/50"
        >
          {/* Celebration header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
            className="text-center mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="inline-block"
            >
              <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            </motion.div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              ¡Felicidades!
            </h2>
          </motion.div>
          
          {/* Brain Visualization - Enhanced 3D style */}
          <div className="relative flex justify-center items-center mb-8">
            {/* Left traits */}
            <div className="absolute left-0 text-right pr-2 space-y-1 w-20">
              {leftTraits.map((trait, idx) => (
                <motion.p
                  key={trait}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1, type: "spring" }}
                  className={`text-xs transition-all ${
                    idx === 3 
                      ? 'font-bold text-purple-700 text-sm' 
                      : 'text-gray-500 font-medium'
                  }`}
                >
                  {trait}
                </motion.p>
              ))}
            </div>

            {/* 3D Brain SVG */}
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.4 }}
              className="relative w-44 h-52"
            >
              {/* Glow effect behind brain */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-cyan-400/30 blur-2xl rounded-full" />
              
              <svg viewBox="0 0 200 220" className="w-full h-full relative z-10 drop-shadow-xl">
                <defs>
                  <linearGradient id="leftBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#0891B2" />
                  </linearGradient>
                  <linearGradient id="rightBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                  <filter id="brainShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.3"/>
                  </filter>
                  <clipPath id="leftHalf">
                    <rect x="0" y="0" width="100" height="220" />
                  </clipPath>
                  <clipPath id="rightHalf">
                    <rect x="100" y="0" width="100" height="220" />
                  </clipPath>
                </defs>
                
                {/* Left brain hemisphere */}
                <g clipPath="url(#leftHalf)" filter="url(#brainShadow)">
                  <motion.path
                    initial={{ pathLength: 0, fillOpacity: 0 }}
                    animate={{ pathLength: 1, fillOpacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    d="M100 15 C55 15 25 50 20 95 C15 140 25 170 40 190 C55 210 75 218 100 218 L100 15"
                    fill="url(#leftBrainGrad)"
                    stroke="#0E7490"
                    strokeWidth="2"
                  />
                  {/* Brain folds - left */}
                  <motion.g 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <path d="M45 60 Q65 75 55 95 Q45 115 65 130 Q75 145 60 165" fill="none" stroke="#0E7490" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M35 100 Q55 115 45 140 Q40 160 55 175" fill="none" stroke="#0E7490" strokeWidth="2" strokeLinecap="round" />
                    <path d="M70 45 Q80 60 75 80" fill="none" stroke="#0E7490" strokeWidth="2" strokeLinecap="round" />
                  </motion.g>
                </g>
                
                {/* Right brain hemisphere */}
                <g clipPath="url(#rightHalf)" filter="url(#brainShadow)">
                  <motion.path
                    initial={{ pathLength: 0, fillOpacity: 0 }}
                    animate={{ pathLength: 1, fillOpacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    d="M100 15 C145 15 175 50 180 95 C185 140 175 170 160 190 C145 210 125 218 100 218 L100 15"
                    fill="url(#rightBrainGrad)"
                    stroke="#6D28D9"
                    strokeWidth="2"
                  />
                  {/* Brain folds - right */}
                  <motion.g 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <path d="M155 60 Q135 75 145 95 Q155 115 135 130 Q125 145 140 165" fill="none" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M165 100 Q145 115 155 140 Q160 160 145 175" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" />
                    <path d="M130 45 Q120 60 125 80" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" />
                  </motion.g>
                </g>

                {/* Center line */}
                <motion.line 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  x1="100" y1="15" x2="100" y2="218" 
                  stroke="#374151" 
                  strokeWidth="2" 
                  strokeDasharray="4,4"
                />

                {/* Percentage labels with animated counters */}
                <motion.text
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, type: "spring" }}
                  x="50"
                  y="120"
                  textAnchor="middle"
                  className="text-2xl font-black"
                  fill="white"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {leftPercent}%
                </motion.text>
                <motion.text
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, type: "spring" }}
                  x="150"
                  y="120"
                  textAnchor="middle"
                  className="text-2xl font-black"
                  fill="white"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {rightPercent}%
                </motion.text>
              </svg>
            </motion.div>

            {/* Right traits */}
            <div className="absolute right-0 text-left pl-2 space-y-1 w-20">
              {rightTraits.map((trait, idx) => (
                <motion.p
                  key={trait}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1, type: "spring" }}
                  className={`text-xs transition-all ${
                    idx === 3 
                      ? 'font-bold text-purple-700 text-sm' 
                      : 'text-gray-500 font-medium'
                  }`}
                >
                  {trait}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Result text with animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="text-center"
          >
            <p className="text-gray-600 text-lg">
              El lado <span className="font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                {isDominantLeft ? 'izquierdo' : 'derecho'}
              </span> de tu cerebro es
            </p>
            <motion.p 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ delay: 2, duration: 0.5 }}
              className="text-2xl font-black text-gray-800 mt-1"
            >
              más dominante.
            </motion.p>
          </motion.div>

          {/* Personality traits */}
          {personalityTraits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
              className="mt-6 pt-5 border-t-2 border-dashed border-purple-200"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-purple-500" />
                <p className="text-purple-600 font-semibold text-sm">Tu perfil revela:</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {personalityTraits.map((trait, idx) => (
                  <motion.span 
                    key={idx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.4 + idx * 0.1, type: "spring" }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium rounded-full shadow-lg shadow-purple-500/30"
                  >
                    {trait}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Action buttons with better styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {
                sessionStorage.removeItem('lateralidadAnswers');
                sessionStorage.removeItem('preferenciaAnswers');
                setLocation('/cerebral/seleccion');
              }}
              className="w-full flex flex-col items-center gap-2 py-6 bg-gradient-to-br from-purple-600 to-purple-700 border border-purple-400 shadow-lg shadow-purple-500/30"
              data-testid="button-new-test"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Nuevo Test</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="w-full flex flex-col items-center gap-2 py-6 bg-gradient-to-br from-cyan-500 to-cyan-600 border border-cyan-400 shadow-lg shadow-cyan-500/30"
              data-testid="button-share"
            >
              <Share2 className="w-6 h-6" />
              <span className="text-xs font-medium">Compartir</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="w-full flex flex-col items-center gap-2 py-6 bg-gradient-to-br from-pink-500 to-pink-600 border border-pink-400 shadow-lg shadow-pink-500/30"
              data-testid="button-contact"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-medium">Escríbenos</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      <BottomNavBar />
    </div>
  );
}
