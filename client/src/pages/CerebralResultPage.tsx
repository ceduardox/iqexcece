import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Share2, MessageCircle } from "lucide-react";

interface PreferenciaAnswer {
  tema: string;
  imageUrl: string;
  meaning: string;
}

export default function CerebralResultPage() {
  const [, setLocation] = useLocation();
  
  // Get stored answers from sessionStorage
  const storedLateralidad = sessionStorage.getItem('lateralidadAnswers');
  const storedPreferencia = sessionStorage.getItem('preferenciaAnswers');
  const lateralidadAnswers: string[] = storedLateralidad ? JSON.parse(storedLateralidad) : [];
  const preferenciaAnswers: PreferenciaAnswer[] = storedPreferencia ? JSON.parse(storedPreferencia) : [];
  
  // Calculate percentages based on lateralidad answers
  const leftCount = lateralidadAnswers.filter(a => a.toLowerCase().includes('izquierda') || a.toLowerCase() === 'izquierda').length;
  const rightCount = lateralidadAnswers.filter(a => a.toLowerCase().includes('derecha') || a.toLowerCase() === 'derecha').length;
  const total = leftCount + rightCount || 1;
  
  const leftPercent = Math.round((leftCount / total) * 100);
  const rightPercent = 100 - leftPercent;
  
  const isDominantLeft = leftPercent >= rightPercent;

  // Get unique personality traits from preferencia answers
  const personalityTraits = preferenciaAnswers.map(a => a.meaning).filter(Boolean);

  const leftTraits = ["reglas", "estrategia", "detalles", "racionalidad", "idioma", "lógica"];
  const rightTraits = ["imágenes", "caos", "creatividad", "intuición", "fantasía", "curiosidad"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-cyan-500 to-teal-500 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center py-6">
          <p className="text-white/80 text-sm uppercase tracking-wider">RESULTADO</p>
          <h1 className="text-3xl font-bold text-white mt-2">Test Cerebral</h1>
        </div>

        {/* Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">¡Felicidades!</h2>
          
          {/* Brain Visualization */}
          <div className="relative flex justify-center items-center mb-6">
            {/* Left traits */}
            <div className="absolute left-0 text-right pr-4 space-y-1">
              {leftTraits.map((trait, idx) => (
                <motion.p
                  key={trait}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className={`text-sm ${idx === 3 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}
                >
                  {trait}
                </motion.p>
              ))}
            </div>

            {/* Brain SVG */}
            <div className="relative w-48 h-56">
              <svg viewBox="0 0 200 220" className="w-full h-full">
                {/* Brain outline */}
                <defs>
                  <clipPath id="leftHalf">
                    <rect x="0" y="0" width="100" height="220" />
                  </clipPath>
                  <clipPath id="rightHalf">
                    <rect x="100" y="0" width="100" height="220" />
                  </clipPath>
                </defs>
                
                {/* Left brain (cyan/teal) */}
                <g clipPath="url(#leftHalf)">
                  <motion.path
                    initial={{ fillOpacity: 0 }}
                    animate={{ fillOpacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    d="M100 20 C60 20 30 50 25 90 C20 130 30 160 40 180 C50 200 70 210 100 210 L100 20"
                    fill="#14B8A6"
                    stroke="#0D9488"
                    strokeWidth="2"
                  />
                  {/* Brain folds left */}
                  <path d="M50 70 Q70 80 60 100 Q50 120 70 130" fill="none" stroke="#0D9488" strokeWidth="2" />
                  <path d="M40 120 Q60 130 50 150" fill="none" stroke="#0D9488" strokeWidth="2" />
                </g>
                
                {/* Right brain (cyan lighter) */}
                <g clipPath="url(#rightHalf)">
                  <motion.path
                    initial={{ fillOpacity: 0 }}
                    animate={{ fillOpacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    d="M100 20 C140 20 170 50 175 90 C180 130 170 160 160 180 C150 200 130 210 100 210 L100 20"
                    fill="#22D3EE"
                    stroke="#06B6D4"
                    strokeWidth="2"
                  />
                  {/* Brain folds right */}
                  <path d="M150 70 Q130 80 140 100 Q150 120 130 130" fill="none" stroke="#06B6D4" strokeWidth="2" />
                  <path d="M160 120 Q140 130 150 150" fill="none" stroke="#06B6D4" strokeWidth="2" />
                </g>
                
                {/* Center line */}
                <line x1="100" y1="20" x2="100" y2="210" stroke="#1F2937" strokeWidth="2" />
                
                {/* Percentage labels */}
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  x="55"
                  y="130"
                  textAnchor="middle"
                  className="text-xl font-bold"
                  fill="white"
                >
                  <motion.tspan
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    {leftPercent}%
                  </motion.tspan>
                </motion.text>
                
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  x="145"
                  y="130"
                  textAnchor="middle"
                  className="text-xl font-bold"
                  fill="white"
                >
                  {rightPercent}%
                </motion.text>
              </svg>
            </div>

            {/* Right traits */}
            <div className="absolute right-0 text-left pl-4 space-y-1">
              {rightTraits.map((trait, idx) => (
                <motion.p
                  key={trait}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className={`text-sm ${idx === 3 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}
                >
                  {trait}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Result text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center mt-4"
          >
            <p className="text-gray-700 text-lg">
              El lado <span className="font-bold">{isDominantLeft ? 'izquierdo' : 'derecho'}</span> de tu cerebro es
            </p>
            <p className="text-gray-800 text-xl font-bold">más dominante.</p>
          </motion.div>

          {/* Personality traits from preferencia */}
          {personalityTraits.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-6 pt-4 border-t border-gray-200"
            >
              <p className="text-gray-600 text-sm mb-2 text-center">Tu perfil revela:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {personalityTraits.map((trait, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm rounded-full"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          <Button
            onClick={() => {
              sessionStorage.removeItem('lateralidadAnswers');
              sessionStorage.removeItem('preferenciaAnswers');
              setLocation('/cerebral/seleccion');
            }}
            className="flex flex-col items-center gap-1 py-6 bg-blue-500 hover:bg-blue-600"
            data-testid="button-new-test"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Nuevo Test</span>
          </Button>
          <Button
            className="flex flex-col items-center gap-1 py-6 bg-blue-500 hover:bg-blue-600"
            data-testid="button-share"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-xs">Compartir</span>
          </Button>
          <Button
            className="flex flex-col items-center gap-1 py-6 bg-blue-500 hover:bg-blue-600"
            data-testid="button-contact"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Escríbenos</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
