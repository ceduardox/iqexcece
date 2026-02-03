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
    <div className="relative w-20 h-20 flex items-center justify-center">
      <div 
        className="absolute inset-0 rounded-full"
        style={{ 
          background: "conic-gradient(from 0deg, #7c3aed 0%, #06b6d4 50%, #7c3aed 100%)",
          padding: "2px"
        }}
      >
        <div className="w-full h-full rounded-full bg-white" />
      </div>
      <div className="absolute inset-2 rounded-full border border-purple-100" />
      {positions.map((pos, i) => (
        <motion.span
          key={`${i}-${currentLetters[i]}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute text-purple-600 font-bold text-xs"
          style={{ 
            left: `${50 + pos.x * 28}%`, 
            top: `${50 + pos.y * 28}%`,
            transform: "translate(-50%, -50%)"
          }}
        >
          {currentLetters[i]}
        </motion.span>
      ))}
      <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-400" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} />
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
        background: "linear-gradient(180deg, #a855f7 0%, #7c3aed 40%, #6366f1 100%)"
      }}
    >
      <header className="relative px-4 py-4 flex items-center">
        <motion.button
          onClick={handleBack}
          className="flex items-center gap-1 text-white"
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </motion.button>
      </header>

      <div className="relative px-6 mb-4 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="https://iqexponencial.app/api/images/855a8501-7a45-48c1-be95-a678a94836b5"
            alt="Reconocimiento Visual"
            className="w-32 sm:w-36 h-auto"
          />
        </motion.div>
      </div>

      <main 
        className="flex-1 px-5 pb-28 pt-6 rounded-t-[2rem]"
        style={{ background: "white" }}
      >
        <div className="max-w-md mx-auto">
          <motion.div 
            className="mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h1 className="text-xl font-bold text-gray-800">
              Amplía tu Reconocimiento Visual
            </h1>
          </motion.div>
          
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-gray-500 text-sm">
              Elige un nivel:
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {niveles.map((nivel, index) => (
              <motion.div
                key={nivel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.1 }}
                onClick={() => handleNivelSelect(nivel.id)}
                className="cursor-pointer"
                data-testid={`card-nivel-${nivel.id}`}
              >
                <motion.div 
                  className="relative bg-white rounded-2xl p-4 flex flex-col items-center justify-center border border-purple-100"
                  style={{ boxShadow: "0 4px 20px rgba(124, 58, 237, 0.08)" }}
                  whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(124, 58, 237, 0.15)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="mb-3">
                    <LetterAnimation letters={nivel.letras} positions={nivel.positions} />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-gray-800 font-semibold text-sm">
                      {nivel.nombre}
                    </h3>
                  </div>
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
