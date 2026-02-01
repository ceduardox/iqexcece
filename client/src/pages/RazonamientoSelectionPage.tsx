import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useUserData } from "@/lib/user-context";
import { ArrowLeft, Brain } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";
import menuCurveImg from "@assets/menu_1769957804819.png";

interface RazonamientoTheme {
  temaNumero: number;
  title: string;
}

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const categoryLabels: Record<string, string> = {
  preescolar: "Pre escolar",
  ninos: "Niño",
  adolescentes: "Adolescente",
  universitarios: "Universitario",
  profesionales: "Profesional",
  adulto_mayor: "Adulto Mayor",
};

export default function RazonamientoSelectionPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ category?: string }>();
  const { userData, setUserData } = useUserData();
  const [themes, setThemes] = useState<RazonamientoTheme[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categoria = params.category || userData.childCategory || "ninos";

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch(`/api/razonamiento/${categoria}/themes`);
        const data = await res.json();
        if (data.themes && data.themes.length > 0) {
          setThemes(data.themes);
        } else {
          setThemes([]);
        }
      } catch {
        setThemes([]);
      }
      setLoading(false);
    };
    fetchThemes();
  }, [categoria]);

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleTestSelect = useCallback((tema: number, title: string) => {
    playCardSound();
    setUserData({ 
      ...userData, 
      selectedRazonamientoTest: tema,
      selectedRazonamientoTitle: title,
      childCategory: categoria 
    });
    setLocation(`/razonamiento-quiz/${categoria}/${tema}`);
  }, [userData, setUserData, categoria, setLocation]);

  const categoryLabel = categoryLabels[categoria] || "Niño";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-white"
    >
      {/* Hero Section with gradient background */}
      <div 
        className="relative w-full overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #6366F1 100%)",
          minHeight: "280px"
        }}
      >
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <motion.button
            onClick={handleBack}
            className="flex items-center gap-2 text-white font-semibold text-lg"
            whileTap={{ scale: 0.95 }}
            data-testid="button-back-razonamiento"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Test Razonamiento</span>
          </motion.button>
        </div>

        {/* Hero Image from reference */}
        <div className="absolute inset-0 flex items-center justify-center pt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative w-full max-w-xs h-48 flex items-center justify-center"
          >
            <img 
              src="/razonamiento-hero.jpeg"
              alt="Test Razonamiento"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-4 py-6 -mt-4 bg-white rounded-t-3xl relative z-10">
        {/* Category Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-cyan-500 font-semibold text-sm mb-1"
        >
          {categoryLabel}
        </motion.p>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-gray-800 mb-6"
        >
          Elige un test
        </motion.h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"
            />
          </div>
        ) : themes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No hay tests disponibles</p>
            <p className="text-gray-400 text-sm">
              Los tests de razonamiento para esta categoría aún no han sido creados.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {themes.map((theme, index) => (
              <motion.div
                key={theme.temaNumero}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => handleTestSelect(theme.temaNumero, theme.title)}
                className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer card-touch"
                data-testid={`button-razonamiento-test-${theme.temaNumero}`}
              >
                {/* Number */}
                <span 
                  className="text-3xl font-light"
                  style={{ color: "#14B8A6" }}
                >
                  {String(theme.temaNumero).padStart(2, '0')}
                </span>
                
                {/* Test Title */}
                <span className="text-lg font-bold text-gray-800 tracking-wide flex-1">
                  {theme.title || `Razonamiento ${theme.temaNumero}`}
                </span>
                
                {/* Arrow */}
                <svg 
                  className="w-6 h-6 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNavBar />
    </motion.div>
  );
}
