import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useSounds } from "@/hooks/use-sounds";
import { useState, useEffect } from "react";
import { TrainingNavBar } from "@/components/TrainingNavBar";

const letrasNivel1 = ["A", "B", "C", "D"];
const letrasNivel2 = ["M", "N", "O", "P", "Q", "R"];
const letrasNivel3 = ["X", "Y", "Z", "W", "V", "U", "T", "S"];

function LetterAnimation({ letters, positions }: { letters: string[]; positions: { x: number; y: number }[] }) {
  const [currentLetters, setCurrentLetters] = useState<string[]>(
    positions.map((_, i) => letters[i % letters.length])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLetters(prev => 
        prev.map(() => letters[Math.floor(Math.random() * letters.length)])
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [letters]);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <div 
        className="absolute inset-0 rounded-full"
        style={{ 
          background: "conic-gradient(from 0deg, #7c3aed 0%, #06b6d4 50%, #7c3aed 100%)",
          padding: "2px"
        }}
      >
        <div className="w-full h-full rounded-full bg-white" />
      </div>
      {positions.map((pos, i) => (
        <motion.span
          key={`${i}-${currentLetters[i]}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute text-purple-600 font-bold text-sm"
          style={{ 
            left: `${50 + pos.x * 32}%`, 
            top: `${50 + pos.y * 32}%`,
            transform: "translate(-50%, -50%)"
          }}
        >
          {currentLetters[i]}
        </motion.span>
      ))}
      <div className="absolute w-2 h-2 rounded-full bg-amber-400" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />
    </div>
  );
}

const nivel1Positions = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

const nivel2Positions = [
  { x: 0, y: -1 },
  { x: 0.87, y: -0.5 },
  { x: 0.87, y: 0.5 },
  { x: 0, y: 1 },
  { x: -0.87, y: 0.5 },
  { x: -0.87, y: -0.5 },
];

const nivel3Positions = [
  { x: 0, y: -1 },
  { x: 0.71, y: -0.71 },
  { x: 1, y: 0 },
  { x: 0.71, y: 0.71 },
  { x: 0, y: 1 },
  { x: -0.71, y: 0.71 },
  { x: -1, y: 0 },
  { x: -0.71, y: -0.71 },
];

const niveles = [
  { id: 1, nombre: "Nivel 1", letras: letrasNivel1, positions: nivel1Positions },
  { id: 2, nombre: "Nivel 2", letras: letrasNivel2, positions: nivel2Positions },
  { id: 3, nombre: "Nivel 3", letras: letrasNivel3, positions: nivel3Positions },
];

export default function ReconocimientoSelectionPage() {
  const [, navigate] = useLocation();
  const params = useParams<{ categoria: string; itemId: string }>();
  const categoria = params.categoria || "ninos";
  const itemId = params.itemId || "";
  const { playSound } = useSounds();

  const handleBack = () => {
    playSound("iphone");
    window.history.back();
  };

  const handleNivelSelect = (nivel: number) => {
    playSound("card");
    navigate(`/reconocimiento/${categoria}/${itemId}/ejercicio/${nivel}`);
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 30%, #ffffff 70%, #f0fdff 100%)"
      }}
    >
      <header className="relative px-4 py-4 flex items-center justify-between">
        <motion.button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          style={{ boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </motion.button>
        <div className="w-10" />
      </header>

      <div className="relative px-6 mb-6 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="https://iqexponencial.app/api/images/855a8501-7a45-48c1-be95-a678a94836b5"
            alt="Reconocimiento Visual"
            className="w-28 sm:w-32 h-auto rounded-2xl object-cover"
            style={{ boxShadow: "0 8px 24px rgba(124, 58, 237, 0.15)" }}
          />
        </motion.div>
      </div>

      <main className="flex-1 px-5 pb-28 relative">
        <div className="max-w-md mx-auto">
          <motion.div 
            className="mb-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h1 className="text-lg sm:text-xl font-bold text-purple-600">
              Amplía tu Reconocimiento Visual
            </h1>
          </motion.div>
          
          <motion.div 
            className="mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
              Selecciona el Nivel
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Elige la dificultad del ejercicio
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 px-2">
            {niveles.map((nivel, index) => (
              <motion.div
                key={nivel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => handleNivelSelect(nivel.id)}
                className="cursor-pointer aspect-square"
                data-testid={`card-nivel-${nivel.id}`}
              >
                <motion.div 
                  className="relative bg-white rounded-3xl p-3 sm:p-4 h-full flex flex-col items-center justify-center"
                  style={{ boxShadow: "0 4px 20px rgba(124, 58, 237, 0.08)" }}
                  whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(124, 58, 237, 0.15)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="mb-3">
                    <LetterAnimation letters={nivel.letras} positions={nivel.positions} />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-gray-800 font-semibold text-xs sm:text-sm">
                      {nivel.nombre}
                    </h3>
                  </div>
                  
                  <div 
                    className="absolute bottom-0 left-4 right-4 h-1 rounded-full"
                    style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <TrainingNavBar activePage="entrenar" categoria={categoria} />
    </div>
  );
}
