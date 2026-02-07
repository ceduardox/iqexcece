import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { useUserData } from "@/lib/user-context";
import { Brain, Check, Lock, Star, ChevronRight, ArrowLeft } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import { LanguageButton } from "@/components/LanguageButton";
import menuCurveImg from "@assets/menu_1769957804819.png";

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

interface RazonamientoTheme {
  temaNumero: number;
  title: string;
}

interface RazonamientoProgress {
  completed: number[];
  inProgress: number | null;
  scores: Record<number, number>;
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

const testTypes = ["Memoria", "Lógica", "Problemas", "Pruebas"];
const difficulties = ["Fácil", "Medio", "Difícil"];

const getProgress = (category: string): RazonamientoProgress => {
  try {
    const saved = localStorage.getItem(`razonamiento_progress_${category}`);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { completed: [], inProgress: null, scores: {} };
};

const getThemeStatus = (
  temaNumero: number,
  index: number,
  progress: RazonamientoProgress
): { status: "completed" | "in_progress" | "available" | "locked"; score?: number; requiredLevel?: number } => {
  if (progress.completed.includes(temaNumero)) {
    return { status: "completed", score: progress.scores[temaNumero] || 100 };
  }
  if (progress.inProgress === temaNumero) {
    return { status: "in_progress" };
  }
  if (index === 0) {
    return { status: "available" };
  }
  const prevCompleted = progress.completed.length;
  if (index <= prevCompleted) {
    return { status: "available" };
  }
  return { status: "locked", requiredLevel: Math.ceil(index / 2) + 1 };
};

export default function RazonamientoSelectionPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ category?: string }>();
  const { userData, setUserData } = useUserData();
  const [themes, setThemes] = useState<RazonamientoTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<RazonamientoProgress>({ completed: [], inProgress: null, scores: {} });

  const categoryLabels: Record<string, string> = {
    preescolar: t("age.preescolarShort"),
    ninos: t("age.ninoShort"),
    adolescentes: t("age.adolescenteShort"),
    universitarios: t("age.universitarioShort"),
    profesionales: t("age.profesionalShort"),
    adulto_mayor: t("age.adultoMayorShort"),
  };
  
  const categoria = params.category || userData.childCategory || "ninos";

  useEffect(() => {
    setProgress(getProgress(categoria));
    
    const fetchThemes = async () => {
      try {
        const res = await fetch(`/api/razonamiento/${categoria}/themes`);
        const data = await res.json();
        if (data.themes && data.themes.length > 0) {
          setThemes(data.themes);
        } else {
          setThemes([
            { temaNumero: 1, title: "RAZONAMIENTO 1" },
            { temaNumero: 2, title: "RAZONAMIENTO 2" },
            { temaNumero: 3, title: "RAZONAMIENTO 3" },
          ]);
        }
      } catch {
        setThemes([
          { temaNumero: 1, title: "RAZONAMIENTO 1" },
          { temaNumero: 2, title: "RAZONAMIENTO 2" },
        ]);
      }
      setLoading(false);
    };
    fetchThemes();
  }, [categoria]);

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleTestSelect = useCallback((tema: number, title: string, status: string) => {
    if (status === "locked") return;
    playCardSound();
    
    const newProgress = { ...progress };
    if (status === "available" && !newProgress.completed.includes(tema)) {
      newProgress.inProgress = tema;
      localStorage.setItem(`razonamiento_progress_${categoria}`, JSON.stringify(newProgress));
    }
    
    setUserData({ 
      ...userData, 
      selectedRazonamientoTest: tema,
      selectedRazonamientoTitle: title,
      childCategory: categoria 
    });
    setLocation(`/razonamiento-quiz/${categoria}/${tema}`);
  }, [userData, setUserData, categoria, setLocation, progress]);

  const categoryLabel = categoryLabels[categoria] || "Niño";
  
  const recommendedIndex = progress.completed.length;
  const recommendedTheme = themes[recommendedIndex] || themes[0];
  const recommendedStatus = recommendedTheme ? getThemeStatus(recommendedTheme.temaNumero, recommendedIndex, progress) : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header 
        className="sticky top-0 z-50 w-full"
        style={{
          background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
        }}
      >
        <div className="relative pt-3 pb-2 px-5">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 2px 8px rgba(138, 63, 252, 0.15)",
              }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#8a3ffc" }} />
            </button>
            
            <div className="flex items-center justify-center">
              <img src={LOGO_URL} alt="iQx" className="h-10 w-auto object-contain" />
            </div>
            
            <div className="w-10"><LanguageButton /></div>
          </div>
        </div>
      </header>

      <div
        className="w-full sticky z-40"
        style={{
          top: 56,
          marginTop: -4,
          marginBottom: -20,
        }}
      >
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(6, 182, 212, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="relative px-5 pt-4 pb-6">
            <div className="flex items-start gap-4 mb-3">
              <div className="flex-1">
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium mb-0.5"
                  style={{ color: "#8a3ffc" }}
                >
                  {categoryLabel}
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-2xl font-black leading-tight mb-1"
                  style={{ color: "#1f2937" }}
                >
                  Test Razonamiento
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs leading-relaxed"
                  style={{ color: "#9ca3af" }}
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
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)",
                    boxShadow: "0 4px 16px rgba(138, 63, 252, 0.3)"
                  }}
                >
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            </div>

            {recommendedTheme && !loading && (
              <>
                <h2 className="text-sm font-bold mb-2" style={{ color: "#1f2937" }}>
                  Recomendado <span style={{ color: "#9ca3af", fontWeight: 400 }}>(5 min)</span>
                </h2>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleTestSelect(recommendedTheme.temaNumero, recommendedTheme.title, recommendedStatus?.status || "available")}
                  className="cursor-pointer"
                  data-testid="card-recommended"
                >
                  <div 
                    className="p-3 rounded-2xl flex items-center gap-3"
                    style={{ 
                      background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)",
                      boxShadow: "0 4px 16px rgba(138, 63, 252, 0.3)"
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-lg font-bold text-white"
                    >
                      {String(recommendedTheme.temaNumero).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">
                        {recommendedTheme.title}
                      </h3>
                      <p className="text-xs text-white/70">
                        3-5 min · Medio · <span className="text-cyan-300">Lógica</span>
                      </p>
                      <div className="mt-1.5 h-1 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-300" style={{ width: "40%" }} />
                      </div>
                    </div>
                    <button 
                      className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{ backgroundColor: "white", color: "#1f2937" }}
                    >
                      Empezar <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>

        <div className="px-5 pt-2 pb-6">
          <h2 className="text-base font-bold mb-3" style={{ color: "#1f2937" }}>
            Elige un test
          </h2>

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
            <div className="space-y-2.5">
              {themes.map((theme, index) => {
                const themeStatus = getThemeStatus(theme.temaNumero, index, progress);
                const isLocked = themeStatus.status === "locked";
                const isCompleted = themeStatus.status === "completed";
                const isInProgress = themeStatus.status === "in_progress";
                const isPerfect = isCompleted && themeStatus.score === 100;
                const testType = testTypes[index % testTypes.length];
                const difficulty = difficulties[index % difficulties.length];

                return (
                  <motion.div
                    key={theme.temaNumero}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.06 }}
                    onClick={() => handleTestSelect(theme.temaNumero, theme.title, themeStatus.status)}
                    className={`cursor-pointer ${isLocked ? "opacity-60" : ""}`}
                    data-testid={`button-razonamiento-test-${theme.temaNumero}`}
                  >
                    <div
                      className="relative rounded-2xl overflow-hidden border"
                      style={{ 
                        background: isCompleted 
                          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)"
                          : isInProgress
                          ? "linear-gradient(135deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 100%)"
                          : "linear-gradient(135deg, rgba(243, 244, 246, 0.5) 0%, rgba(255, 255, 255, 1) 100%)",
                        borderColor: isCompleted ? "rgba(16, 185, 129, 0.2)" : isInProgress ? "rgba(138, 63, 252, 0.15)" : "#e5e7eb"
                      }}
                    >
                      <div className="p-3 flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg"
                          style={{ 
                            background: isCompleted
                              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)"
                              : isInProgress || !isLocked
                              ? "linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(138, 63, 252, 0.08) 100%)"
                              : "rgba(229, 231, 235, 0.5)",
                            color: isCompleted ? "#10b981" : isInProgress || !isLocked ? "#00d9ff" : "#9ca3af"
                          }}
                        >
                          {isPerfect ? (
                            <Star className="w-5 h-5 fill-current" style={{ color: "#f59e0b" }} />
                          ) : (
                            String(theme.temaNumero).padStart(2, '0')
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-sm font-bold truncate mb-0.5"
                            style={{ color: isLocked ? "#9ca3af" : "#1f2937" }}
                          >
                            {theme.title || `RAZONAMIENTO ${theme.temaNumero}`}
                          </h3>
                          <p className="text-[10px]" style={{ color: "#9ca3af" }}>
                            {index === 0 ? "3 min" : index === 1 ? "3-5 min" : "4 min"} · {difficulty} · <span style={{ color: "#00d9ff" }}>
                              {testType}
                            </span>
                          </p>
                          
                          {isInProgress && (
                            <div className="mt-1.5 h-1 rounded-full bg-gray-200 overflow-hidden">
                              <div 
                                className="h-full rounded-full"
                                style={{ width: "40%", background: "linear-gradient(90deg, #8a3ffc, #00d9ff)" }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {isCompleted && (
                            <div 
                              className="px-3 py-1.5 rounded-lg flex items-center gap-1"
                              style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}
                            >
                              <Check className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                              <span className="text-xs font-medium" style={{ color: "#10b981" }}>Hecho</span>
                            </div>
                          )}
                          {isInProgress && (
                            <button 
                              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
                              style={{ 
                                background: "linear-gradient(90deg, #8a3ffc, #6b21a8)",
                                boxShadow: "0 2px 8px rgba(138, 63, 252, 0.3)"
                              }}
                            >
                              Continuar
                            </button>
                          )}
                          {themeStatus.status === "available" && !isInProgress && (
                            <button 
                              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
                              style={{ 
                                background: "linear-gradient(90deg, #8a3ffc, #6b21a8)",
                                boxShadow: "0 2px 8px rgba(138, 63, 252, 0.3)"
                              }}
                            >
                              Iniciar
                            </button>
                          )}
                          {isLocked && (
                            <div 
                              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                              style={{ backgroundColor: "rgba(156, 163, 175, 0.15)" }}
                            >
                              <Lock className="w-3 h-3" style={{ color: "#9ca3af" }} />
                              <span className="text-[10px]" style={{ color: "#9ca3af" }}>
                                Requiere <span className="font-bold">nivel {themeStatus.requiredLevel}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <BottomNavBar />
    </div>
  );
}
