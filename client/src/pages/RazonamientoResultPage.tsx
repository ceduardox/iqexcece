import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";
import { Brain, Home, RotateCcw, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const categoryLabels: Record<string, string> = {
  preescolar: "Pre escolar",
  ninos: "Niños",
  adolescentes: "Adolescentes",
  universitarios: "Universitarios",
  profesionales: "Profesionales",
  adulto_mayor: "Adulto Mayor",
};

export default function RazonamientoResultPage() {
  const [, setLocation] = useLocation();
  const { userData, setUserData } = useUserData();
  
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center"
      >
        {/* Trophy/Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
          className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          {percentage >= 60 ? (
            <Trophy className="w-12 h-12 text-white" />
          ) : (
            <Brain className="w-12 h-12 text-white" />
          )}
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {message}
          </h1>
          <p className="text-gray-500 mb-4">{categoryLabel}</p>
          {results.title && (
            <p className="text-sm text-purple-600 font-medium mb-4">{results.title}</p>
          )}
        </motion.div>

        {/* Score Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="relative w-40 h-40 mx-auto mb-6"
        >
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: percentage / 100 }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              style={{
                strokeDasharray: "283",
                strokeDashoffset: "0"
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#14B8A6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-4xl font-bold text-gray-800"
            >
              {percentage}%
            </motion.span>
            <span className="text-gray-500 text-sm">Aciertos</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-purple-600">{results.correct}</p>
            <p className="text-xs text-gray-500">Correctas</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-gray-600">{results.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-cyan-600">{formatTime(results.time)}</p>
            <p className="text-xs text-gray-500">Tiempo</p>
          </div>
        </motion.div>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-2 mb-6"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
            >
              <Star
                className={`w-8 h-8 ${
                  i < Math.ceil(percentage / 20) 
                    ? "text-yellow-400 fill-yellow-400" 
                    : "text-gray-200"
                }`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          <Button
            onClick={handleRetry}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
            data-testid="button-retry"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Intentar otro test
          </Button>
          <Button
            onClick={handleHome}
            variant="outline"
            size="lg"
            className="w-full font-bold"
            data-testid="button-home"
          >
            <Home className="w-5 h-5 mr-2" />
            Volver al inicio
          </Button>
        </motion.div>
      </motion.div>
      
      <BottomNavBar />
    </motion.div>
  );
}
