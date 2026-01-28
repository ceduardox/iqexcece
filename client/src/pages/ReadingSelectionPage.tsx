import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useUserData } from "@/lib/user-context";

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

function ChildishBackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center justify-center"
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.05 }}
      data-testid="button-back-reading"
    >
      <motion.div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ 
          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          boxShadow: "0 4px 15px rgba(255, 165, 0, 0.4)"
        }}
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-400"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-cyan-400"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
      />
    </motion.button>
  );
}

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
  const smallImage = content?.pageSmallImage || defaultImages[categoria]?.smallImage || defaultImages.preescolar.smallImage;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #9333EA 0%, #7C3AED 30%, #A855F7 70%, #C084FC 100%)" }}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center px-4 py-4 safe-area-inset"
      >
        <ChildishBackButton onClick={handleBack} />
        <h1 className="flex-1 text-center text-xl font-bold text-white pr-12">
          {testName}
        </h1>
      </motion.header>

      <div className="relative flex-1 flex flex-col">
        <div className="relative h-72 flex items-end justify-center overflow-visible">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="relative z-10"
          >
            <img 
              src={mainImage}
              alt="Niño feliz"
              className="w-64 h-64 object-contain drop-shadow-2xl"
              style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, rotate: -10 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
            className="absolute right-2 bottom-12 z-20"
          >
            <motion.div 
              className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/40 bg-white"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img 
                src={smallImage}
                alt="Libro mascota"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 6 + Math.random() * 12,
                height: 6 + Math.random() * 12,
                left: `${5 + Math.random() * 90}%`,
                top: `${10 + Math.random() * 80}%`,
                backgroundColor: ["#FFD700", "#FF69B4", "#00CED1", "#98FB98", "#FFA500", "#DDA0DD", "#87CEEB"][Math.floor(Math.random() * 7)],
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 0.9, 0.5],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${15 + Math.random() * 60}%`,
              }}
              animate={{
                rotate: [0, 180, 360],
                scale: [0.8, 1.2, 0.8],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex-1 bg-white dark:bg-gray-900 rounded-t-[2.5rem] px-6 pt-8 pb-12 shadow-2xl overflow-y-auto"
          style={{ boxShadow: "0 -10px 40px rgba(0,0,0,0.15)", maxHeight: "50vh" }}
        >
          <div className="mb-6">
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-purple-500 font-semibold text-base mb-1"
            >
              {categoryLabel}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="text-2xl font-black text-gray-900 dark:text-white"
            >
              Elige una lectura
            </motion.h2>
          </div>

          <div className="space-y-4">
            {themes.map((theme, index) => (
              <motion.div
                key={theme.temaNumero || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                onClick={() => handleReadingSelect(theme.temaNumero || 1)}
                className="cursor-pointer"
                data-testid={`card-reading-${String(theme.temaNumero || index + 1).padStart(2, '0')}`}
              >
                <motion.div
                  className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 flex items-center gap-5 border-2 border-gray-100 dark:border-gray-700"
                  whileHover={{ scale: 1.02, backgroundColor: "#F3F4F6" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <span 
                    className="text-5xl font-thin tracking-tight"
                    style={{ color: "#D1D5DB" }}
                  >
                    {String(theme.temaNumero || index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200 flex-1">
                    {theme.title}
                  </span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
