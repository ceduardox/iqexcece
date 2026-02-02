import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useUserData } from "@/lib/user-context";
import { Check, Lock, Star, ChevronDown, BookOpen, ArrowLeft } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

interface ReadingTheme {
  temaNumero: number | null;
  title: string;
  categoryImage?: string;
}

interface ReadingProgress {
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

const categoryLabels: Record<string, string> = {
  preescolar: "Pre escolar",
  ninos: "Niño",
  adolescentes: "Adolescente",
  universitarios: "Universitario",
  profesionales: "Profesional",
  adulto_mayor: "Adulto Mayor",
};

const defaultImages: Record<string, string> = {
  preescolar: "https://img.freepik.com/free-vector/happy-cute-kid-boy-ready-go-school_97632-4315.jpg",
  ninos: "https://img.freepik.com/free-vector/cute-girl-back-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
  adolescentes: "https://img.freepik.com/free-vector/student-boy-with-book-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
  universitarios: "https://img.freepik.com/free-vector/college-student-concept-illustration_114360-12640.jpg",
  profesionales: "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg",
  adulto_mayor: "https://img.freepik.com/free-vector/elderly-couple-concept-illustration_114360-5765.jpg",
};

const getProgress = (category: string): ReadingProgress => {
  try {
    const saved = localStorage.getItem(`reading_progress_${category}`);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { completed: [], inProgress: null, scores: {} };
};

const getThemeStatus = (
  temaNumero: number,
  index: number,
  progress: ReadingProgress,
  totalThemes: number
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
  return { status: "locked", requiredLevel: index };
};

export default function ReadingSelectionPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ category?: string }>();
  const { userData, setUserData } = useUserData();
  const [themes, setThemes] = useState<ReadingTheme[]>([]);
  const [progress, setProgress] = useState<ReadingProgress>({ completed: [], inProgress: null, scores: {} });
  
  const categoria = params.category || userData.childCategory || "preescolar";

  useEffect(() => {
    setProgress(getProgress(categoria));
    
    fetch(`/api/reading/${categoria}/themes`)
      .then(res => res.json())
      .then(data => {
        if (data.themes && data.themes.length > 0) {
          setThemes(data.themes);
        } else {
          setThemes([
            { temaNumero: 1, title: "LA HISTORIA DEL CHOCOLATE" },
            { temaNumero: 2, title: "LA MEMORIA" },
            { temaNumero: 3, title: "Test Tema Nuevo" },
          ]);
        }
      })
      .catch(() => {
        setThemes([
          { temaNumero: 1, title: "LA HISTORIA DEL CHOCOLATE" },
          { temaNumero: 2, title: "LA MEMORIA" },
        ]);
      });
  }, [categoria]);

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleReadingSelect = useCallback((temaNumero: number, status: string) => {
    if (status === "locked") return;
    playCardSound();
    
    const newProgress = { ...progress };
    if (status === "available" && !newProgress.completed.includes(temaNumero)) {
      newProgress.inProgress = temaNumero;
      localStorage.setItem(`reading_progress_${categoria}`, JSON.stringify(newProgress));
    }
    
    setUserData({ ...userData, selectedTema: temaNumero, childCategory: categoria });
    setLocation("/lectura-contenido");
  }, [setLocation, userData, setUserData, categoria, progress]);

  const categoryLabel = categoryLabels[categoria] || "Pre escolar";
  const mainImage = defaultImages[categoria] || defaultImages.preescolar;
  
  const recommendedTheme = themes[0];
  const recommendedStatus = recommendedTheme ? getThemeStatus(recommendedTheme.temaNumero || 1, 0, progress, themes.length) : null;

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
            
            <div className="w-10" />
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
            <div className="flex items-center justify-between mb-3">
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{ borderColor: "#e5e7eb", backgroundColor: "white" }}
              >
                <span className="text-sm" style={{ color: "#6b7280" }}>Etapa:</span>
                <span className="text-sm font-bold" style={{ color: "#1f2937" }}>{categoryLabel}</span>
                <ChevronDown className="w-4 h-4" style={{ color: "#9ca3af" }} />
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-shrink-0"
              >
                <div 
                  className="w-16 h-16 rounded-xl overflow-hidden"
                  style={{ boxShadow: "0 4px 12px rgba(138, 63, 252, 0.15)" }}
                >
                  <img 
                    src={mainImage}
                    alt={categoryLabel}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
            
            <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>
              Selecciona una lectura para comenzar tu evaluación cognitiva.
            </p>

            {recommendedTheme && (
              <>
                <h2 className="text-sm font-bold mb-2" style={{ color: "#1f2937" }}>
                  Recomendado <span style={{ color: "#9ca3af", fontWeight: 400 }}>(5 min)</span>
                </h2>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleReadingSelect(recommendedTheme.temaNumero || 1, recommendedStatus?.status || "available")}
                  className="cursor-pointer mb-4"
                  data-testid="card-recommended"
                >
                  <div 
                    className="p-3 rounded-2xl flex items-center gap-3"
                    style={{ 
                      background: "linear-gradient(135deg, #8a3ffc 0%, #6b21a8 100%)",
                      boxShadow: "0 4px 16px rgba(138, 63, 252, 0.3)"
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">
                        {recommendedTheme.title}
                      </h3>
                      <p className="text-xs text-white/70">
                        5 min · Fácil · <span className="text-cyan-300">Comprensión</span>
                      </p>
                    </div>
                    <button 
                      className="px-4 py-1.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: "#00d9ff", color: "#1f2937" }}
                    >
                      Empezar
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>

        <div className="px-5 pt-2 pb-6">
          <h2 className="text-base font-bold mb-3" style={{ color: "#1f2937" }}>
            Lecturas disponibles
          </h2>

          <div className="space-y-2.5">
            {themes.map((theme, index) => {
              const temaNum = theme.temaNumero || index + 1;
              const themeStatus = getThemeStatus(temaNum, index, progress, themes.length);
              const isLocked = themeStatus.status === "locked";
              const isCompleted = themeStatus.status === "completed";
              const isInProgress = themeStatus.status === "in_progress";
              const isPerfect = isCompleted && themeStatus.score === 100;

              return (
                <motion.div
                  key={temaNum}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.06 }}
                  onClick={() => handleReadingSelect(temaNum, themeStatus.status)}
                  className={`cursor-pointer ${isLocked ? "opacity-60" : ""}`}
                  data-testid={`card-reading-${String(temaNum).padStart(2, '0')}`}
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
                            ? "linear-gradient(135deg, rgba(138, 63, 252, 0.12) 0%, rgba(0, 217, 255, 0.08) 100%)"
                            : "rgba(229, 231, 235, 0.5)",
                          color: isCompleted ? "#10b981" : isInProgress || !isLocked ? "#8a3ffc" : "#9ca3af"
                        }}
                      >
                        {isPerfect ? (
                          <Star className="w-5 h-5 fill-current" style={{ color: "#f59e0b" }} />
                        ) : (
                          String(temaNum).padStart(2, '0')
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span 
                          className="text-[10px] font-medium block mb-0.5"
                          style={{ color: "#9ca3af" }}
                        >
                          Lectura {String(temaNum).padStart(2, '0')}
                        </span>
                        <h3 
                          className="text-sm font-bold truncate"
                          style={{ color: isLocked ? "#9ca3af" : "#1f2937" }}
                        >
                          {theme.title}
                        </h3>
                        <p className="text-[10px]" style={{ color: "#9ca3af" }}>
                          {index === 0 ? "5 min · Fácil" : index === 1 ? "3-5 min · Medio" : "4 min · Difícil"} · <span style={{ color: "#8a3ffc" }}>
                            {index % 2 === 0 ? "Comprensión" : "Velocidad"}
                          </span>
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {isCompleted && (
                          <div className="flex flex-col items-center">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center mb-0.5"
                              style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}
                            >
                              <Check className="w-4 h-4" style={{ color: "#10b981" }} />
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: "#10b981" }}>Hecho</span>
                          </div>
                        )}
                        {isInProgress && (
                          <button 
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
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
                            className="px-4 py-1.5 rounded-lg text-xs font-bold"
                            style={{ 
                              backgroundColor: "white",
                              border: "1.5px solid #8a3ffc",
                              color: "#8a3ffc"
                            }}
                          >
                            Iniciar
                          </button>
                        )}
                        {isLocked && (
                          <div className="flex flex-col items-center">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center mb-0.5"
                              style={{ backgroundColor: "rgba(156, 163, 175, 0.15)" }}
                            >
                              <Lock className="w-3.5 h-3.5" style={{ color: "#9ca3af" }} />
                            </div>
                            <span className="text-[9px] text-center leading-tight" style={{ color: "#9ca3af", maxWidth: 60 }}>
                              Requiere nivel {themeStatus.requiredLevel}
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
        </div>
      </main>
      
      <BottomNavBar />
    </div>
  );
}
