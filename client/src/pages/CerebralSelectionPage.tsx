import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUserData } from "@/lib/user-context";
import { ArrowLeft, Clock } from "lucide-react";
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
    if (themes.length > 0) {
      setLocation(`/cerebral/ejercicio/${categoria}/${themes[0].temaNumero}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-cyan-500 to-blue-600 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Skeleton className="h-10 w-40 bg-white/20" />
          <Skeleton className="h-64 w-full rounded-xl bg-white/20" />
          <Skeleton className="h-20 w-full bg-white/20" />
        </div>
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-cyan-500 to-blue-600 p-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/tests")}
              className="text-white"
              data-testid="button-back-tests"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Test Cerebral</h1>
          </motion.div>
          <div className="text-center py-12">
            <p className="text-white/80 text-lg">No hay ejercicios disponibles.</p>
            <p className="text-white/60 text-sm mt-2">El administrador debe crear ejercicios primero.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-cyan-500 to-blue-600 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/tests")}
            className="text-white hover:bg-white/20"
            data-testid="button-back-tests"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Test Cerebral</h1>
        </motion.div>

        {/* Brain Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          {intro.imageUrl ? (
            <img 
              src={intro.imageUrl} 
              alt="Cerebro" 
              className="w-64 h-64 object-contain"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Brain cartoon placeholder */}
                <ellipse cx="100" cy="100" rx="80" ry="70" fill="#F8BBD9" stroke="#EC407A" strokeWidth="3"/>
                <path d="M60 60 Q80 40 100 60 Q120 40 140 60" fill="none" stroke="#EC407A" strokeWidth="2"/>
                <path d="M50 100 Q30 80 50 60" fill="none" stroke="#EC407A" strokeWidth="2"/>
                <path d="M150 100 Q170 80 150 60" fill="none" stroke="#EC407A" strokeWidth="2"/>
                <circle cx="75" cy="95" r="8" fill="#333"/>
                <circle cx="125" cy="95" r="8" fill="#333"/>
                <circle cx="77" cy="93" r="3" fill="#fff"/>
                <circle cx="127" cy="93" r="3" fill="#fff"/>
                <path d="M90 120 Q100 130 110 120" fill="none" stroke="#333" strokeWidth="2"/>
                {/* Question mark */}
                <g transform="translate(150, 30)">
                  <circle cx="20" cy="30" r="25" fill="#E91E63"/>
                  <text x="20" y="40" textAnchor="middle" fill="white" fontSize="30" fontWeight="bold">?</text>
                </g>
              </svg>
            </div>
          )}
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-xl text-center"
        >
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-800 mb-4 leading-tight">
            {intro.title}
          </h2>

          {/* Duration */}
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
            <Clock className="w-5 h-5" />
            <p>{intro.subtitle}</p>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            className="px-12 py-6 text-lg font-semibold rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
            data-testid="button-start-test"
          >
            {intro.buttonText}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
