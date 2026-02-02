import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useUserData } from "@/lib/user-context";
import { Brain } from "lucide-react";
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
                  {categoryLabel}
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-2xl font-black leading-tight mb-2"
                  style={{ color: "#1f2937" }}
                >
                  Test Razonamiento
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs leading-relaxed"
                  style={{ color: "#6b7280" }}
                >
                  Selecciona un test para evaluar tu capacidad de razonamiento.
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="flex-shrink-0"
              >
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
                >
                  <Brain className="w-12 h-12 text-white" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-gray-800 mb-4"
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
                  transition={{ delay: 0.2 + index * 0.1 }}
                  onClick={() => handleTestSelect(theme.temaNumero, theme.title)}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`button-razonamiento-test-${theme.temaNumero}`}
                >
                  <span 
                    className="text-3xl font-light"
                    style={{ color: "#00d9ff" }}
                  >
                    {String(theme.temaNumero).padStart(2, '0')}
                  </span>
                  
                  <span className="text-lg font-bold text-gray-800 tracking-wide flex-1">
                    {theme.title || `Razonamiento ${theme.temaNumero}`}
                  </span>
                  
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
      </main>
      
      <BottomNavBar />
    </div>
  );
}
