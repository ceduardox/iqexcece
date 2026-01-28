import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUserData } from "@/lib/user-context";
import { ArrowLeft, Clock, Brain, Sparkles, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CerebralIntro {
  imageUrl: string;
  title: string;
  subtitle: string;
  duration: string;
  buttonText: string;
}

interface CerebralTheme {
  temaNumero: number;
  title: string;
  exerciseType: string;
}

export default function CerebralSelectionPage() {
  const [, setLocation] = useLocation();
  const { userData } = useUserData();
  const categoria = userData.ageGroup || "adolescentes";

  const { data: themesData, isLoading: themesLoading } = useQuery<{ themes: CerebralTheme[] }>({
    queryKey: [`/api/cerebral/${categoria}/themes`],
  });

  const { data: introData, isLoading: introLoading } = useQuery<{ intro: CerebralIntro | null }>({
    queryKey: [`/api/cerebral/${categoria}/intro`],
  });

  const themes = themesData?.themes || [];
  const intro = introData?.intro || {
    imageUrl: "",
    title: "¿Cuál lado de tu cerebro es más dominante?",
    subtitle: "El test tiene una duración de 30 segundos.",
    duration: "30",
    buttonText: "Empezar"
  };

  const isLoading = themesLoading || introLoading;

  const handleStart = () => {
    sessionStorage.removeItem('lateralidadAnswers');
    sessionStorage.removeItem('preferenciaAnswers');
    if (themes.length > 0) {
      setLocation(`/cerebral/ejercicio/${categoria}/${themes[0].temaNumero}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4">
        <div className="max-w-md mx-auto space-y-6">
          <Skeleton className="h-10 w-48 bg-white/10" />
          <Skeleton className="h-64 w-full rounded-3xl bg-white/10" />
          <Skeleton className="h-48 w-full rounded-3xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/tests")}
                className="text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl"
                data-testid="button-back-tests"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Test Cerebral
            </h1>
          </motion.div>
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
            <p className="text-white/80 text-lg">No hay ejercicios disponibles.</p>
            <p className="text-white/40 text-sm mt-2">El administrador debe crear ejercicios primero.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-500/20 rounded-full"
            initial={{ 
              x: Math.random() * 400, 
              y: Math.random() * 800 + 200,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, -200],
              opacity: [0.2, 0]
            }}
            transition={{ 
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/tests")}
              className="text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg shadow-purple-500/20"
              data-testid="button-back-tests"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          <div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-purple-300 text-xs uppercase tracking-widest font-medium"
            >
              ✦ Evaluación Cognitiva ✦
            </motion.p>
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Test Cerebral
            </h1>
          </div>
        </motion.div>

        {/* Brain Image with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", bounce: 0.4 }}
          className="relative flex justify-center mb-8"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-purple-500/30 blur-3xl rounded-full" />
          
          {intro.imageUrl ? (
            <motion.img 
              src={intro.imageUrl} 
              alt="Cerebro" 
              className="w-56 h-56 object-contain relative z-10 drop-shadow-2xl"
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ) : (
            <motion.div 
              className="w-56 h-56 relative z-10"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Enhanced 3D Brain SVG */}
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <defs>
                  <linearGradient id="brainLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#0891B2" />
                  </linearGradient>
                  <linearGradient id="brainRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Left hemisphere */}
                <path
                  d="M100 20 C55 20 25 55 20 100 C15 145 30 175 50 190 C70 205 85 200 100 200 L100 20"
                  fill="url(#brainLeftGrad)"
                  stroke="#0E7490"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                {/* Left folds */}
                <path d="M45 60 Q65 75 55 95 Q45 115 65 130 Q75 145 60 165" fill="none" stroke="#0E7490" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M35 100 Q55 115 45 140" fill="none" stroke="#0E7490" strokeWidth="2" strokeLinecap="round" />
                
                {/* Right hemisphere */}
                <path
                  d="M100 20 C145 20 175 55 180 100 C185 145 170 175 150 190 C130 205 115 200 100 200 L100 20"
                  fill="url(#brainRightGrad)"
                  stroke="#6D28D9"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                {/* Right folds */}
                <path d="M155 60 Q135 75 145 95 Q155 115 135 130 Q125 145 140 165" fill="none" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M165 100 Q145 115 155 140" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" />
                
                {/* Center line */}
                <line x1="100" y1="20" x2="100" y2="200" stroke="#1E1B4B" strokeWidth="3" />
                
                {/* Question mark badge */}
                <g transform="translate(145, 15)">
                  <circle cx="25" cy="25" r="22" fill="#EC4899" stroke="#F472B6" strokeWidth="2" />
                  <text x="25" y="33" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">?</text>
                </g>
              </svg>
            </motion.div>
          )}
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="bg-gradient-to-br from-white/95 to-white/90 rounded-3xl p-8 shadow-2xl shadow-purple-500/20 backdrop-blur-sm border border-white/50"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
            className="flex justify-center mb-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-black text-center bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-4 leading-tight"
          >
            {intro.title}
          </motion.h2>

          {/* Duration with icon */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 text-gray-500 mb-8 px-4 py-2 bg-gray-100 rounded-full mx-auto w-fit"
          >
            <Clock className="w-4 h-4 text-purple-500" />
            <p className="text-sm font-medium">{intro.subtitle}</p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-4 mb-8"
          >
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Rápido</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Interactivo</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Brain className="w-3.5 h-3.5 text-cyan-500" />
              <span>Preciso</span>
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleStart}
              className="w-full py-7 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-xl shadow-purple-500/30 border-0 group"
              data-testid="button-start-test"
            >
              <span>{intro.buttonText}</span>
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Exercise count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-gray-400 text-xs mt-4"
          >
            {themes.length} ejercicios disponibles
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
