import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";
import { Brain, Home, RotateCcw, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNavBar } from "@/components/BottomNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

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
    <div className="min-h-screen bg-white flex flex-col">
      <header 
        className="sticky top-0 z-50 w-full"
        style={{
          background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
        }}
      >
        <div className="relative pt-3 pb-2 px-5">
          <div className="flex items-center justify-center">
            <img src={LOGO_URL} alt="iQx" className="h-10 w-auto object-contain" />
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
              {categoryLabel}
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-xl font-bold"
              style={{ color: "#1f2937" }}
            >
              Resultados
            </motion.h1>
          </div>
        </div>

        <div className="px-5 py-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
            >
              {percentage >= 60 ? (
                <Trophy className="w-10 h-10 text-white" />
              ) : (
                <Brain className="w-10 h-10 text-white" />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-4"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{message}</h2>
              {results.title && (
                <p className="text-sm font-medium" style={{ color: "#8a3ffc" }}>{results.title}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="relative w-32 h-32 mx-auto mb-4"
            >
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke="url(#resultGradient)" strokeWidth="8" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: percentage / 100 }}
                  transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="resultGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8a3ffc" />
                    <stop offset="100%" stopColor="#00d9ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">{percentage}%</span>
                <span className="text-gray-500 text-xs">Aciertos</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-3 mb-4"
            >
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold" style={{ color: "#8a3ffc" }}>{results.correct}</p>
                <p className="text-xs text-gray-500">Correctas</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-600">{results.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="bg-cyan-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold" style={{ color: "#00d9ff" }}>{formatTime(results.time)}</p>
                <p className="text-xs text-gray-500">Tiempo</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center gap-1 mb-5"
            >
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.ceil(percentage / 20) 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-gray-200"
                  }`}
                />
              ))}
            </motion.div>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                size="lg"
                className="w-full font-bold"
                style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
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
            </div>
          </motion.div>
        </div>
      </main>
      
      <BottomNavBar />
    </div>
  );
}
