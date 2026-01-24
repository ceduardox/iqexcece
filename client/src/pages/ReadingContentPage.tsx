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
      { question: "¿de que color es su perrito?", options: ["Negro", "Café", "Azul"], correct: 1 },
      { question: "¿Donde lo llevaba a pasear?", options: ["Parque", "Jardin", "Plaza"], correct: 0 },
      { question: "¿Dónde lo encontro al perrito?", options: ["Casa", "Calle", "Kiosco"], correct: 2 },
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

const optionColors = [
  { bg: "#f472b6", bg2: "#f43f5e", shadow: "rgba(244, 114, 182, 0.4)" },
  { bg: "#22d3ee", bg2: "#14b8a6", shadow: "rgba(34, 211, 238, 0.4)" },
  { bg: "#fbbf24", bg2: "#f97316", shadow: "rgba(251, 191, 36, 0.4)" },
  { bg: "#a78bfa", bg2: "#8b5cf6", shadow: "rgba(167, 139, 250, 0.4)" },
];

const getShuffledColors = (questionIndex: number) => {
  const shuffled = [...optionColors];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (i + questionIndex) % shuffled.length;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function FloatingBubbles({ count = 20, opacity = 0.3 }: { count?: number; opacity?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 8 + Math.random() * 18,
            height: 8 + Math.random() * 18,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: ["#FFD700", "#FF69B4", "#00CED1", "#98FB98", "#FFA500", "#DDA0DD", "#87CEEB", "#FFB6C1", "#90EE90", "#FFC0CB"][Math.floor(Math.random() * 10)],
            opacity: opacity,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            rotate: [0, 180, 360],
            scale: [0.5, 1, 0.5],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

function ChildishCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative"
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      data-testid="button-close-reading"
    >
      <motion.div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ 
          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          boxShadow: "0 4px 15px rgba(255, 165, 0, 0.5)"
        }}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <X className="w-6 h-6 text-white" strokeWidth={3} />
      </motion.div>
      <motion.div
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500"
        animate={{ scale: [1, 1.4, 1] }}
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

function InfoCard({ label, value, color, delay }: { label: string; value: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative py-3 px-2 text-center"
    >
      <motion.div
        className="absolute inset-1 rounded-xl opacity-30"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: delay * 2 }}
      />
      <div className="relative">
        <div className="text-white/70 text-[9px] font-bold mb-0.5 tracking-wider">{label}</div>
        <motion.div 
          className="font-black text-white text-sm"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay }}
        >
          {value}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ReadingContentPage() {
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState<"lectura" | "cuestionario">("lectura");
  const [readingTime, setReadingTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    edad: "",
    ciudad: "",
    telefono: "",
    comentario: "",
  });
  const [answers, setAnswers] = useState<number[]>([]);

  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (quizFinished) return;
    const interval = setInterval(() => {
      if (activeTab === "lectura") {
        setReadingTime(prev => prev + 1);
      } else {
        setQuestionTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab, quizFinished]);

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

  const categoryLabel = categoryLabels[userData.childCategory || "preescolar"] || "Pre escolar";
  const content = readingContent[userData.childCategory || "preescolar"] || readingContent.preescolar;
  const currentQ = content.questions[currentQuestion];

  const handleSelectAnswer = useCallback((index: number) => {
    playButtonSound();
    setSelectedAnswer(index);
    setAnswers(prev => [...prev, index]);
    
    setTimeout(() => {
      if (currentQuestion < content.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setQuizFinished(true);
        setShowForm(true);
      }
    }, 600);
  }, [currentQuestion, content.questions.length]);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const wordCount = content.text.split(/\s+/).length;
  const wordsPerMinute = readingTime > 0 ? Math.round((wordCount / readingTime) * 60) : 0;

  const handleSubmitForm = async () => {
    playButtonSound();
    setSubmitting(true);
    try {
      let correct = 0;
      answers.forEach((ans, i) => {
        if (content.questions[i] && ans === content.questions[i].correct) {
          correct++;
        }
      });
      setCorrectAnswers(correct);
      
      const isPwa = window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categoria: userData.childCategory || "preescolar",
          tiempoLectura: readingTime,
          tiempoCuestionario: questionTime,
          isPwa,
        }),
      });
      setShowForm(false);
      setShowResults(true);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleShare = () => {
    const text = `¡Completé el Test de Lectura en IQxponencial! Mi comprensión fue de ${Math.round((correctAnswers / content.questions.length) * 100)}% y mi velocidad de ${wordsPerMinute.toLocaleString()} palabras por minuto.`;
    if (navigator.share) {
      navigator.share({ title: "Resultado Test Lectura", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Resultado copiado al portapapeles");
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent("Me interesa saber mas de IQxponencial");
    window.open(`https://wa.me/59173600060?text=${msg}`, "_blank");
  };

  const handleNewTest = () => {
    window.location.href = "/";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #E879F9 0%, #D946EF 30%, #A855F7 70%, #8B5CF6 100%)" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingBubbles count={25} opacity={0.4} />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex items-center justify-between px-5 py-4"
      >
        <motion.h1 
          className="text-2xl font-black text-white drop-shadow-lg"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Test Lectura
        </motion.h1>
        <ChildishCloseButton onClick={handleClose} />
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 flex mx-4 rounded-full overflow-hidden border-4 border-white/30"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
      >
        <motion.button
          onClick={() => setActiveTab("lectura")}
          className={`flex-1 py-3 text-sm font-black text-center transition-all ${
            activeTab === "lectura" 
              ? "bg-purple-600 text-white" 
              : "bg-purple-400/50 text-white/70"
          }`}
          whileTap={{ scale: 0.95 }}
          data-testid="tab-lectura"
        >
          LECTURA
        </motion.button>
        <motion.button
          onClick={() => setActiveTab("cuestionario")}
          className={`flex-1 py-3 text-sm font-black text-center transition-all ${
            activeTab === "cuestionario" 
              ? "bg-purple-600 text-white" 
              : "bg-purple-400/50 text-white/70"
          }`}
          whileTap={{ scale: 0.95 }}
          data-testid="tab-cuestionario"
        >
          CUESTIONARIO
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="relative z-10 mx-4 mt-3 grid grid-cols-4 rounded-2xl overflow-hidden border-4 border-white/20"
        style={{ 
          background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A855F7 100%)",
          boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)"
        }}
      >
        <InfoCard label="CATEGORÍA" value={categoryLabel} color="#FF69B4" delay={0} />
        <InfoCard label="TIEMPO" value={formatTime(readingTime)} color="#00CED1" delay={0.1} />
        <InfoCard label="TIEMPO" value={formatTime(questionTime)} color="#FFD700" delay={0.2} />
        <InfoCard label="PREGUNTAS" value={`${activeTab === "cuestionario" ? currentQuestion + 1 : 0} / ${content.questions.length}`} color="#98FB98" delay={0.3} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 flex-1 bg-white dark:bg-gray-900 rounded-t-[2.5rem] mx-0 mt-4 px-6 py-8 overflow-hidden"
        style={{ boxShadow: "0 -10px 40px rgba(0,0,0,0.2)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingBubbles count={15} opacity={0.15} />
        </div>

        {activeTab === "lectura" ? (
          <div className="relative z-10 space-y-6">
            <div className="text-center">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-purple-500 font-black text-sm tracking-widest"
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
              className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed"
            >
              {content.text}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleGoToQuestionnaire}
              className="relative w-full py-5 rounded-2xl font-black text-white text-xl flex items-center justify-center gap-3 mt-8 overflow-hidden"
              style={{ 
                background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                boxShadow: "0 8px 25px rgba(249, 115, 22, 0.5)"
              }}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(249, 115, 22, 0.6)" }}
              whileTap={{ scale: 0.97 }}
              data-testid="button-go-questionnaire"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative">Ir a cuestionario</span>
              <motion.span
                className="relative text-2xl"
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </div>
        ) : showForm ? (
          <div className="relative z-10 space-y-5 pb-6">
            <div className="text-center">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-purple-500 font-black text-sm tracking-widest"
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-300 text-base"
            >
              Para que puedas conocer tu resultado del Test, completa los siguientes datos con tu información
            </motion.p>

            <div className="space-y-3">
              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                type="text"
                placeholder="Nombre y Apellido"
                value={formData.nombre}
                onChange={(e) => handleFormChange("nombre", e.target.value)}
                className="w-full py-4 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                data-testid="input-nombre"
              />

              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                className="w-full py-4 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                data-testid="input-email"
              />

              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                type="text"
                placeholder="Edad"
                value={formData.edad}
                onChange={(e) => handleFormChange("edad", e.target.value)}
                className="w-full py-4 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                data-testid="input-edad"
              />
              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                type="text"
                placeholder="Ciudad"
                value={formData.ciudad}
                onChange={(e) => handleFormChange("ciudad", e.target.value)}
                className="w-full py-4 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                data-testid="input-ciudad"
              />

              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                type="tel"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={(e) => handleFormChange("telefono", e.target.value)}
                className="w-full py-4 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                data-testid="input-telefono"
              />

              <motion.textarea
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                placeholder="Comentario"
                value={formData.comentario}
                onChange={(e) => handleFormChange("comentario", e.target.value)}
                rows={3}
                className="w-full py-4 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors resize-none"
                data-testid="textarea-comentario"
              />
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleSubmitForm}
              className="relative w-full py-5 rounded-2xl font-black text-white text-xl flex items-center justify-center gap-3 overflow-hidden"
              style={{ 
                background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                boxShadow: "0 8px 25px rgba(249, 115, 22, 0.5)"
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              data-testid="button-ver-resultado"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative">Ver mi resultado</span>
              <motion.span
                className="relative text-2xl"
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </div>
        ) : (
          <div className="relative z-10 space-y-6">
            <div className="text-center">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-purple-500 font-black text-sm tracking-widest"
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
              className="text-gray-800 dark:text-gray-200 text-lg font-semibold"
            >
              {currentQ.question}
            </motion.p>

            <div className="space-y-4">
              {currentQ.options.map((option, index) => {
                const colors = getShuffledColors(currentQuestion);
                const color = colors[index % colors.length];
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.1, type: "spring" }}
                    onClick={() => handleSelectAnswer(index)}
                    className={`relative w-full py-5 px-6 rounded-2xl text-left font-bold text-lg text-white overflow-hidden transition-all ${
                      selectedAnswer === index ? "ring-4 ring-white ring-offset-2" : ""
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${color.bg} 0%, ${color.bg2} 100%)`,
                      boxShadow: `0 6px 20px ${color.shadow}`
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    data-testid={`option-${index}`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
                    />
                    <span className="relative drop-shadow-md">{option}</span>
                    {selectedAnswer === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center"
                      >
                        <span className="text-green-500 text-xl">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "linear-gradient(160deg, #E879F9 0%, #D946EF 30%, #A855F7 70%, #8B5CF6 100%)" }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingBubbles count={20} opacity={0.3} />
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/80 text-sm tracking-widest mb-2"
            >
              RESULTADO
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl font-black text-white mb-4"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}
            >
              Test Lectura
            </motion.h1>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-6xl mb-6"
            >
              👍
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">{content.title}</h2>
              
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Cant. Palabras:</span> <strong>{wordCount}</strong></p>
                <p><span className="font-medium">Tiempo de Lectura:</span> <strong>{formatTime(readingTime)}</strong></p>
                <p><span className="font-medium">Tiempo de Cuestionario:</span> <strong>{formatTime(questionTime)}</strong></p>
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <p className="text-gray-700">
                  Tu comprensión es de <strong className="text-purple-600">{Math.round((correctAnswers / content.questions.length) * 100)}%</strong>
                </p>
                <p className="text-gray-700">
                  Tu velocidad es de <strong className="text-purple-600">{wordsPerMinute.toLocaleString()}</strong> palabras por minuto
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative z-10 flex gap-2 p-4 bg-white/10 backdrop-blur-sm"
          >
            <button
              onClick={handleNewTest}
              className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl bg-purple-600 text-white font-bold"
              data-testid="button-nuevo-test"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm">Nuevo Test</span>
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl bg-purple-600 text-white font-bold"
              data-testid="button-compartir"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-sm">Compartir</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl bg-purple-600 text-white font-bold"
              data-testid="button-escribenos"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-sm">Escríbenos</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
