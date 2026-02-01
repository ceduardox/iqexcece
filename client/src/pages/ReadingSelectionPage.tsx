import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useUserData } from "@/lib/user-context";
import { ChevronLeft, BookOpen, Play } from "lucide-react";

interface ReadingTheme {
  temaNumero: number | null;
  title: string;
  categoryImage?: string;
}

interface ReadingContent {
  pageMainImage?: string;
  pageSmallImage?: string;
  title?: string;
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

const testTitles: Record<string, string> = {
  lectura: "Test Lectura",
  razonamiento: "Test Razonamiento",
  cerebral: "Test Cerebral",
  iq: "Test IQ",
};

const categoryLabels: Record<string, string> = {
  preescolar: "Pre escolar",
  ninos: "Niño",
  adolescentes: "Adolescente",
  universitarios: "Universitario",
  profesionales: "Profesional",
  adulto_mayor: "Adulto Mayor",
};

const defaultImages: Record<string, { mainImage: string; smallImage: string }> = {
  preescolar: {
    mainImage: "https://img.freepik.com/free-vector/happy-cute-kid-boy-ready-go-school_97632-4315.jpg",
    smallImage: "https://img.freepik.com/free-vector/cute-book-reading-cartoon-vector-icon-illustration-education-object-icon-concept-isolated_138676-5765.jpg",
  },
  ninos: {
    mainImage: "https://img.freepik.com/free-vector/cute-girl-back-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
    smallImage: "https://img.freepik.com/free-vector/cute-astronaut-reading-book-cartoon-vector-icon-illustration-science-education-icon-isolated_138676-5765.jpg",
  },
  adolescentes: {
    mainImage: "https://img.freepik.com/free-vector/student-boy-with-book-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
    smallImage: "https://img.freepik.com/free-vector/cute-astronaut-reading-book-cartoon-vector-icon-illustration-science-education-icon-isolated_138676-5765.jpg",
  },
  universitarios: {
    mainImage: "https://img.freepik.com/free-vector/college-student-concept-illustration_114360-12640.jpg",
    smallImage: "https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books-illustration_23-2149341898.jpg",
  },
  profesionales: {
    mainImage: "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg",
    smallImage: "https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books-illustration_23-2149341898.jpg",
  },
  adulto_mayor: {
    mainImage: "https://img.freepik.com/free-vector/elderly-couple-concept-illustration_114360-5765.jpg",
    smallImage: "https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books-illustration_23-2149341898.jpg",
  },
};

export default function ReadingSelectionPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ category?: string }>();
  const { userData, setUserData } = useUserData();
  const [content, setContent] = useState<ReadingContent | null>(null);
  const [themes, setThemes] = useState<ReadingTheme[]>([]);
  
  const categoria = params.category || userData.childCategory || "preescolar";

  useEffect(() => {
    fetch(`/api/reading/${categoria}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setContent(data.content);
        }
      })
      .catch(() => {});

    fetch(`/api/reading/${categoria}/themes`)
      .then(res => res.json())
      .then(data => {
        if (data.themes && data.themes.length > 0) {
          setThemes(data.themes);
        } else {
          setThemes([{ temaNumero: 1, title: "Lectura 01" }]);
        }
      })
      .catch(() => {
        setThemes([{ temaNumero: 1, title: "Lectura 01" }]);
      });
  }, [categoria]);

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleReadingSelect = useCallback((temaNumero: number) => {
    playCardSound();
    setUserData({ ...userData, selectedTema: temaNumero, childCategory: categoria });
    setLocation("/lectura-contenido");
  }, [setLocation, userData, setUserData, categoria]);

  const testName = testTitles[userData.selectedTest || "lectura"] || "Test Lectura";
  const categoryLabel = categoryLabels[categoria] || "Pre escolar";
  
  const mainImage = content?.pageMainImage || defaultImages[categoria]?.mainImage || defaultImages.preescolar.mainImage;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-center px-5 py-3 bg-white sticky top-0 z-50 border-b border-gray-100">
        <button 
          onClick={handleBack}
          className="absolute left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="button-back-reading"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        
        <div className="flex items-center justify-center" data-testid="header-logo">
          <svg width="80" height="36" viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a3ffc" />
                <stop offset="100%" stopColor="#00d9ff" />
              </linearGradient>
            </defs>
            <text x="0" y="28" fontSize="32" fontWeight="900" fontFamily="Inter, sans-serif">
              <tspan fill="#8a3ffc">i</tspan>
              <tspan fill="#8a3ffc">Q</tspan>
              <tspan fill="url(#logoGradient)">x</tspan>
            </text>
          </svg>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-8">
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
                  {testName}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs leading-relaxed"
                  style={{ color: "#6b7280" }}
                >
                  Selecciona una lectura para comenzar tu evaluación cognitiva.
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="flex-shrink-0"
              >
                <div 
                  className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white"
                  style={{ boxShadow: "0 8px 24px rgba(138, 63, 252, 0.15)" }}
                >
                  <img 
                    src={mainImage}
                    alt={categoryLabel}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="px-5 pt-2 pb-6">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base font-bold mb-4"
            style={{ color: "#1f2937" }}
          >
            Lecturas disponibles
          </motion.h2>

          <div className="space-y-3">
            {themes.map((theme, index) => (
              <motion.div
                key={theme.temaNumero || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.08 }}
                onClick={() => handleReadingSelect(theme.temaNumero || 1)}
                className="cursor-pointer"
                data-testid={`card-reading-${String(theme.temaNumero || index + 1).padStart(2, '0')}`}
              >
                <motion.div
                  className="relative rounded-2xl overflow-hidden shadow-sm border border-purple-100"
                  style={{ 
                    background: "linear-gradient(135deg, rgba(138, 63, 252, 0.06) 0%, rgba(0, 217, 255, 0.04) 100%)"
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: "linear-gradient(135deg, rgba(138, 63, 252, 0.15) 0%, rgba(0, 217, 255, 0.1) 100%)"
                      }}
                    >
                      <BookOpen className="w-6 h-6" style={{ color: "#8a3ffc" }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span 
                        className="text-xs font-medium block mb-0.5"
                        style={{ color: "#9ca3af" }}
                      >
                        Lectura {String(theme.temaNumero || index + 1).padStart(2, '0')}
                      </span>
                      <h3 
                        className="text-sm font-bold truncate"
                        style={{ color: "#1f2937" }}
                      >
                        {theme.title}
                      </h3>
                    </div>

                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: "linear-gradient(90deg, #8a3ffc, #6b21a8)",
                        boxShadow: "0 4px 12px rgba(138, 63, 252, 0.3)"
                      }}
                    >
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
