import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUserData } from "@/lib/user-context";
import { Brain, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";
import menuCurveImg from "@assets/menu_1769957804819.png";

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

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

export default function CerebralSelectionPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ categoria?: string }>();
  const { userData } = useUserData();
  const categoria = params.categoria || userData.ageGroup || "adolescentes";

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

  const handleBack = () => {
    playButtonSound();
    window.history.back();
  };

  const handleStart = () => {
    playButtonSound();
    sessionStorage.removeItem('lateralidadAnswers');
    sessionStorage.removeItem('preferenciaAnswers');
    if (themes.length > 0) {
      setLocation(`/cerebral/ejercicio/${categoria}/${themes[0].temaNumero}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <CurvedHeader showBack onBack={handleBack} />
        <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
          <img src={menuCurveImg} alt="" className="w-full h-auto" />
        </div>
        <main className="flex-1 p-5 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </main>
        <BottomNavBar />
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <CurvedHeader showBack onBack={handleBack} />
        <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
          <img src={menuCurveImg} alt="" className="w-full h-auto" />
        </div>
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <Brain className="w-16 h-16 text-purple-300 mb-4" />
          <p className="text-gray-700 text-lg font-medium">No hay ejercicios disponibles.</p>
          <p className="text-gray-400 text-sm mt-2">El administrador debe crear ejercicios primero.</p>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CurvedHeader showBack onBack={handleBack} />
      
      <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="relative px-5 pt-6 pb-8">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#8a3ffc" }}
                >
                  Evaluación Cognitiva
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-2xl font-black leading-tight mb-2"
                  style={{ color: "#1f2937" }}
                >
                  Test Cerebral
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs leading-relaxed"
                  style={{ color: "#6b7280" }}
                >
                  {intro.subtitle}
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="flex-shrink-0"
              >
                {intro.imageUrl ? (
                  <div 
                    className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white"
                    style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
                  >
                    <img 
                      src={intro.imageUrl} 
                      alt="Test Cerebral" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
                  >
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-3">{intro.title}</h2>
            
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" style={{ color: "#8a3ffc" }} />
              <span className="text-sm text-gray-600">Duración: {intro.duration} segundos</span>
            </div>

            <div className="space-y-2 mb-5">
              {themes.slice(0, 3).map((theme, index) => (
                <motion.div
                  key={theme.temaNumero}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-xl"
                >
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{theme.title}</span>
                </motion.div>
              ))}
              {themes.length > 3 && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  +{themes.length - 3} ejercicios más
                </p>
              )}
            </div>

            <Button
              onClick={handleStart}
              className="w-full py-6 text-lg font-bold rounded-xl"
              style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
              data-testid="button-start-test"
            >
              <span>{intro.buttonText}</span>
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-400 text-xs mt-4"
          >
            {themes.length} ejercicios disponibles
          </motion.p>
        </div>
      </main>
      
      <BottomNavBar />
    </div>
  );
}
