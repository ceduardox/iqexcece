import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useUserData } from "@/lib/user-context";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const categoryLabels: Record<string, string> = {
  preescolar: "Pre escolar",
  ninos: "Niños",
};

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const readingContent: Record<string, { title: string; text: string; questions: Question[] }> = {
  preescolar: {
    title: "Paseando con mi perrito",
    text: "Mariana tiene un perrito de color café llamado Balu, lo saca a pasear todos los días al parque que esta frente su casa, un día se le escapo, estaba asustada y lloro llego hasta el kiosco y el señor le devolvió a su perrito.",
    questions: [
      { question: "¿qué se llamaba la niña?", options: ["Marcela", "Matilde", "Mariana"], correct: 2 },
      { question: "¿De qué color era el perrito?", options: ["Negro", "Blanco", "Café"], correct: 2 },
      { question: "¿Cómo se llamaba el perrito?", options: ["Balu", "Max", "Toby"], correct: 0 },
      { question: "¿A dónde iba Mariana a pasear?", options: ["A la escuela", "Al parque", "A la tienda"], correct: 1 },
    ],
  },
  ninos: {
    title: "La aventura del explorador",
    text: "Carlos era un niño muy curioso que soñaba con ser explorador. Un día encontró un mapa antiguo en el ático de su abuela. Siguió las pistas por el jardín hasta descubrir un cofre enterrado con monedas antiguas y una carta de su bisabuelo.",
    questions: [
      { question: "¿Cómo se llamaba el niño?", options: ["Pedro", "Carlos", "Miguel"], correct: 1 },
      { question: "¿Qué soñaba ser?", options: ["Astronauta", "Doctor", "Explorador"], correct: 2 },
      { question: "¿Dónde encontró el mapa?", options: ["En su cuarto", "En el ático", "En el jardín"], correct: 1 },
      { question: "¿Qué había en el cofre?", options: ["Juguetes", "Monedas antiguas", "Libros"], correct: 1 },
    ],
  },
};

function FloatingBubbles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 8 + Math.random() * 16,
            height: 8 + Math.random() * 16,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: ["#FFD700", "#FF69B4", "#00CED1", "#98FB98", "#FFA500", "#DDA0DD", "#87CEEB", "#FFB6C1"][Math.floor(Math.random() * 8)],
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            rotate: [0, 180, 360],
            scale: [0.6, 1, 0.6],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function ChildishCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative"
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.1 }}
      data-testid="button-close-reading"
    >
      <motion.div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ 
          background: "linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)",
          boxShadow: "0 4px 15px rgba(255, 105, 180, 0.4)"
        }}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <X className="w-5 h-5 text-white" strokeWidth={3} />
      </motion.div>
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.button>
  );
}

export default function ReadingContentPage() {
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState<"lectura" | "cuestionario">("lectura");
  const [readingTime, setReadingTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "lectura") {
        setReadingTime(prev => prev + 1);
      } else {
        setQuestionTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleClose = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleGoToQuestionnaire = useCallback(() => {
    playButtonSound();
    setActiveTab("cuestionario");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
  }, []);

  const handleSelectAnswer = useCallback((index: number) => {
    playButtonSound();
    setSelectedAnswer(index);
  }, []);

  const categoryLabel = categoryLabels[userData.childCategory || "preescolar"] || "Pre escolar";
  const content = readingContent[userData.childCategory || "preescolar"] || readingContent.preescolar;
  const currentQ = content.questions[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #E879F9 0%, #D946EF 30%, #A855F7 70%, #8B5CF6 100%)" }}
    >
      <FloatingBubbles />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex items-center justify-between px-5 py-4"
      >
        <motion.h1 
          className="text-2xl font-black text-white drop-shadow-lg"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Test Lectura
        </motion.h1>
        <ChildishCloseButton onClick={handleClose} />
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 flex mx-4 rounded-t-2xl overflow-hidden"
      >
        <button
          onClick={() => setActiveTab("lectura")}
          className={`flex-1 py-3 text-sm font-bold text-center transition-all ${
            activeTab === "lectura" 
              ? "bg-purple-600 text-white shadow-lg" 
              : "bg-purple-400/60 text-white/80"
          }`}
          data-testid="tab-lectura"
        >
          LECTURA
        </button>
        <button
          onClick={() => setActiveTab("cuestionario")}
          className={`flex-1 py-3 text-sm font-bold text-center transition-all ${
            activeTab === "cuestionario" 
              ? "bg-purple-600 text-white shadow-lg" 
              : "bg-purple-400/60 text-white/80"
          }`}
          data-testid="tab-cuestionario"
        >
          CUESTIONARIO
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="relative z-10 mx-4 grid grid-cols-4 text-white text-xs font-medium rounded-b-2xl overflow-hidden"
        style={{ background: "linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)" }}
      >
        <div className="py-3 px-1 text-center">
          <div className="text-white/60 text-[9px] mb-0.5">CATEGORÍA</div>
          <div className="font-bold text-[11px]">{categoryLabel}</div>
        </div>
        <div className="py-3 px-1 text-center">
          <div className="text-white/60 text-[9px] mb-0.5">TIEMPO</div>
          <div className="font-bold">{formatTime(readingTime)}</div>
        </div>
        <div className="py-3 px-1 text-center">
          <div className="text-white/60 text-[9px] mb-0.5">TIEMPO</div>
          <div className="font-bold">{formatTime(questionTime)}</div>
        </div>
        <div className="py-3 px-1 text-center">
          <div className="text-white/60 text-[9px] mb-0.5">PREGUNTAS</div>
          <div className="font-bold">{activeTab === "cuestionario" ? currentQuestion + 1 : 0} / {content.questions.length}</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 flex-1 bg-white dark:bg-gray-900 rounded-t-[2.5rem] mx-0 mt-4 px-6 py-8 shadow-2xl"
        style={{ boxShadow: "0 -10px 40px rgba(0,0,0,0.2)" }}
      >
        {activeTab === "lectura" ? (
          <div className="space-y-6">
            <div className="text-center">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-purple-500 font-bold text-sm tracking-wide"
              >
                LECTURA
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black text-gray-900 dark:text-white mt-2"
              >
                {content.title}
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed"
            >
              {content.text}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleGoToQuestionnaire}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 mt-8"
              style={{ 
                background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                boxShadow: "0 6px 20px rgba(249, 115, 22, 0.4)"
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(249, 115, 22, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              data-testid="button-go-questionnaire"
            >
              Ir a cuestionario
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-purple-500 font-bold text-sm tracking-wide"
              >
                CUESTIONARIO
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-black text-gray-900 dark:text-white mt-2"
              >
                {content.title}
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-800 dark:text-gray-200 text-lg font-medium"
            >
              {currentQ.question}
            </motion.p>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.08 }}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full py-4 px-5 rounded-2xl text-left font-semibold text-lg transition-all border-2 ${
                    selectedAnswer === index
                      ? "bg-purple-100 dark:bg-purple-900/40 border-purple-400 text-purple-700 dark:text-purple-300"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`option-${index}`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
