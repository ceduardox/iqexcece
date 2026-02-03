import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, BookOpen, HelpCircle, CheckCircle, Share2, MessageCircle, RotateCcw } from "lucide-react";
import { useUserData } from "@/lib/user-context";
import { BottomNavBar } from "@/components/BottomNavBar";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
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

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const defaultReadingContent: Record<string, { title: string; text: string; questions: Question[] }> = {
  preescolar: {
    title: "Paseando con mi perrito",
    text: "Mariana tiene un perrito café llamado Pipo. Un día lo llevó al parque a pasear. Mientras jugaban, el perrito se escapó. Mariana lo buscó mucho. Al final, lo encontró escondido detrás del kiosco comiendo un helado que alguien había dejado.",
    questions: [
      { question: "¿Qué se llamaba la niña?", options: ["Marcela", "Matilde", "Mariana"], correct: 2 },
      { question: "¿De qué color es su perrito?", options: ["Negro", "Café", "Azul"], correct: 1 },
      { question: "¿Dónde lo llevaba a pasear?", options: ["Parque", "Jardín", "Plaza"], correct: 0 },
      { question: "¿Dónde encontró al perrito?", options: ["Casa", "Calle", "Kiosco"], correct: 2 },
    ],
  },
  ninos: {
    title: "LA HISTORIA DEL CHOCOLATE",
    text: "Hace muchos años, antes de que existieran las tabletas y los bombones como los conocemos hoy, el cacao era considerado un tesoro muy valioso. Los antiguos mayas y aztecas, civilizaciones que vivieron en América Central, fueron de los primeros en cultivarlo. No usaban el cacao para hacer dulces, sino como una bebida especial. Preparaban una mezcla de granos de cacao molidos con agua, chile y algunas especias. Esta bebida era amarga, pero la consideraban un regalo de los dioses. Los aztecas valoraban tanto el cacao que incluso usaban sus granos como moneda: por ejemplo, se podía comprar un tomate con un grano de cacao, o un conejo con 30 granos. Además, solo las personas importantes, como guerreros y nobles, podían tomar esa bebida.\n\nCuando los conquistadores españoles llegaron a América en el siglo XVI, llevaron el cacao a Europa. Allí, las personas comenzaron a mezclarlo con azúcar y leche, creando una bebida caliente más dulce y agradable. Con el tiempo, los chocolateros inventaron nuevas formas de disfrutar el cacao, como las tabletas y los bombones que conocemos hoy.\n\nActualmente, el chocolate se produce en muchas partes del mundo, pero el cacao sigue creciendo principalmente en países tropicales como Costa de Marfil, Ghana, Ecuador y Brasil. Y además de ser delicioso, el chocolate puede tener beneficios, como mejorar el estado de ánimo y aportar energía, siempre que se consuma con moderación.",
    questions: [
      { question: "¿Qué civilizaciones fueron las primeras en cultivar el cacao?", options: ["Mayas y Aztecas.", "Quechuas y Aymaras.", "Andinos.", "Europeos."], correct: 0 },
      { question: "¿Cómo preparaban la bebida de cacao los antiguos mayas y aztecas?", options: ["Cocinaban hasta derretir el cacao.", "Una mezcla de granos de cacao molidos con agua, chile.", "Lo colocaban en hornos de barros.", "Lo colocaban al sol hasta derretir"], correct: 1 },
      { question: "¿Para qué usaban los aztecas los granos de cacao, además de preparar bebidas?", options: ["Intercambio.", "Moneda.", "Licor.", "Medicina natural."], correct: 1 },
      { question: "¿Qué cambios hizo Europa en la forma de consumir el cacao?", options: ["Comercializaron.", "Mezclaron con azúcar y leche.", "Usaban como bebida caliente.", "Lo intercambiaron."], correct: 1 },
      { question: "Menciona dos países actuales donde se cultiva el cacao.", options: ["Europa y África.", "Centro América y el caribe.", "Ecuador y Ghana.", "Brasil y Bolivia."], correct: 2 },
    ],
  },
  adolescentes: {
    title: "EUTANASIA",
    text: `El término eutanasia es todo acto u omisión cuya responsabilidad recae en personal médico o en individuos cercanos al enfermo, y que ocasiona la muerte inmediata de éste. La palabra deriva del griego: eu ("bueno") y thanatos ("muerte").

Quienes defienden la eutanasia sostienen que la finalidad del acto es evitarle sufrimientos insoportables o la prolongación artificial de la vida a un enfermo, presentando tales situaciones como "contrarias a la dignidad". También sus defensores sostienen que, para que la eutanasia sea considerada como tal, el enfermo ha de padecer, necesariamente, una enfermedad terminal o incurable y, en segundo lugar, el personal sanitario ha de contar expresamente con el consentimiento del enfermo.

Otros, en cambio, creen que los programas de eutanasia están en contraposición con los ideales con los que se defiende su implementación.`,
    questions: [
      { question: "¿Qué es la eutanasia?", options: ["Es aquello que considera lo bueno y lo malo", "Es quitarse la vida para evitar el sufrimiento", "Es todo acto u omisión cuya responsabilidad recae en el medico y/o familiares"], correct: 2 },
      { question: "¿Dónde surge la propaganda de realizar la eutanasia?", options: ["E.E.U.U.", "Alemania", "Rusia"], correct: 1 },
      { question: "¿En qué países se ha despenalizado la eutanasia?", options: ["Alemania - Italia", "Bélgica - Holanda", "España - Inglaterra"], correct: 1 },
      { question: "¿Quién fue juzgado como asesino por practicar la eutanasia en el gobierno nazi?", options: ["Arthun", "Nuberg", "Vemberth"], correct: 0 },
    ],
  },
};

export default function ReadingContentPage() {
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState<"lectura" | "cuestionario">("lectura");
  const [quizStarted, setQuizStarted] = useState(false);
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
    telefono: "+591 ",
    comentario: "",
    nivelEducativo: "",
    grado: "",
  });
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const categoria = userData.childCategory || "preescolar";
  const selectedTema = userData.selectedTema || 1;
  const [content, setContent] = useState(defaultReadingContent[categoria] || defaultReadingContent.preescolar);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/reading/${categoria}?tema=${selectedTema}`);
        const data = await res.json();
        if (data.content) {
          const questions = typeof data.content.questions === 'string' 
            ? JSON.parse(data.content.questions) 
            : data.content.questions;
          setContent({
            title: data.content.title || defaultReadingContent[categoria].title,
            text: data.content.content || defaultReadingContent[categoria].text,
            questions: questions || defaultReadingContent[categoria].questions,
          });
        }
      } catch {
        setContent(defaultReadingContent[categoria] || defaultReadingContent.preescolar);
      }
    };
    fetchContent();
  }, [categoria, selectedTema]);

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
    setQuizStarted(true);
    setActiveTab("cuestionario");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
  }, []);

  const categoryLabel = categoryLabels[categoria] || "Pre escolar";
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

  if (showResults) {
    const percentage = Math.round((correctAnswers / content.questions.length) * 100);
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex items-center justify-center px-5 py-3 bg-white sticky top-0 z-50 border-b border-gray-100">
          <div className="flex items-center justify-center" data-testid="header-logo">
            <img 
              src="https://iqexponencial.app/api/images/e038af72-17b2-4944-a203-afa1f753b33a" 
              alt="iQx" 
              className="h-10 w-auto object-contain" 
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div 
            className="w-full"
            style={{
              background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
            }}
          >
            <div className="px-5 pt-8 pb-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, rgba(138, 63, 252, 0.15) 0%, rgba(0, 217, 255, 0.1) 100%)" }}
              >
                <CheckCircle className="w-10 h-10" style={{ color: "#8a3ffc" }} />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-black mb-2"
                style={{ color: "#1f2937" }}
              >
                ¡Excelente!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm"
                style={{ color: "#6b7280" }}
              >
                Has completado el test de lectura
              </motion.p>
            </div>
          </div>

          <div className="px-5 space-y-4">
            {/* Gráfico circular animado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex justify-center py-4"
            >
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - percentage / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8a3ffc" />
                      <stop offset="100%" stopColor="#00d9ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                    className="text-4xl font-black"
                    style={{ color: "#8a3ffc" }}
                  >
                    {percentage}%
                  </motion.span>
                  <span className="text-xs font-medium" style={{ color: "#6b7280" }}>Comprensión</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl overflow-hidden shadow-sm border border-purple-100 p-5"
              style={{ background: "linear-gradient(135deg, rgba(138, 63, 252, 0.06) 0%, rgba(0, 217, 255, 0.04) 100%)" }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs font-medium mb-1" style={{ color: "#9ca3af" }}>Respuestas</p>
                  <p className="text-2xl font-black" style={{ color: "#8a3ffc" }}>{correctAnswers}/{content.questions.length}</p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>correctas</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium mb-1" style={{ color: "#9ca3af" }}>Velocidad</p>
                  <p className="text-2xl font-black" style={{ color: "#00d9ff" }}>{wordsPerMinute}</p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>palabras/min</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs font-medium mb-1" style={{ color: "#9ca3af" }}>Tiempo lectura</p>
                  <p className="text-lg font-bold" style={{ color: "#1f2937" }}>{formatTime(readingTime)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium mb-1" style={{ color: "#9ca3af" }}>Tiempo preguntas</p>
                  <p className="text-lg font-bold" style={{ color: "#1f2937" }}>{formatTime(questionTime)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-white font-bold shadow-md"
                style={{ background: "linear-gradient(90deg, #8a3ffc, #6b21a8)" }}
                data-testid="button-share"
              >
                <Share2 className="w-5 h-5" />
                Compartir resultado
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold border-2"
                style={{ borderColor: "#8a3ffc", color: "#8a3ffc" }}
                data-testid="button-whatsapp"
              >
                <MessageCircle className="w-5 h-5" />
                Más información
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNewTest}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold"
                style={{ color: "#6b7280" }}
                data-testid="button-new-test"
              >
                <RotateCcw className="w-5 h-5" />
                Nuevo test
              </motion.button>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  if (showForm) {
    const isNinos = categoria === "ninos" || categoria === "preescolar";
    const isAdolescentes = categoria === "adolescentes";
    
    const gradosPrimaria = ["1ero Primaria", "2do Primaria", "3ero Primaria", "4to Primaria", "5to Primaria", "6to Primaria"];
    const gradosSecundaria = ["1ero Secundaria", "2do Secundaria", "3ero Secundaria", "4to Secundaria", "5to Secundaria", "6to Secundaria", "Universitario"];
    
    return (
      <div 
        className="min-h-screen flex flex-col overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)" }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 2 === 0 ? "#a78bfa" : "#06b6d4",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
          {/* Animated Pencil Icon */}
          <motion.div 
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="relative w-20 h-20 mb-4"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Glowing ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ 
                  background: "conic-gradient(from 0deg, #7c3aed, #06b6d4, #7c3aed)",
                  padding: "3px"
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full rounded-full bg-slate-900" />
              </motion.div>
              
              {/* Pencil SVG */}
              <motion.svg 
                className="absolute inset-0 m-auto w-10 h-10"
                viewBox="0 0 24 24" 
                fill="none"
                animate={{ 
                  y: [0, -2, 0],
                  rotate: [0, 10, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path 
                  d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" 
                  stroke="#a78bfa" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <motion.path 
                  d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" 
                  stroke="#06b6d4" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.svg>
              
              {/* Writing sparkles */}
              <motion.div
                className="absolute -bottom-1 -right-1 w-3 h-3"
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
              >
                <svg viewBox="0 0 24 24" fill="#fbbf24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              </motion.div>
            </motion.div>
            
            <motion.h1 
              className="text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Test de Lectura
            </motion.h1>
            <motion.p 
              className="text-sm text-purple-200 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Completa tus datos para ver tu resultado
            </motion.p>
          </motion.div>

          {/* Form Card with glass effect */}
          <motion.div 
            className="rounded-3xl p-6 space-y-5 backdrop-blur-xl border border-white/10"
            style={{ 
              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Nombre */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="text-xs font-semibold text-purple-300 mb-2 block flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Nombre completo
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 transition-colors group-focus-within:text-cyan-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => handleFormChange("nombre", e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  style={{ background: "rgba(30, 27, 75, 0.8)" }}
                  data-testid="input-nombre"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <label className="text-xs font-semibold text-purple-300 mb-2 block flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 transition-colors group-focus-within:text-cyan-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input
                  type="email"
                  placeholder="nombre@email.com"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  style={{ background: "rgba(30, 27, 75, 0.8)" }}
                  data-testid="input-email"
                />
              </div>
            </motion.div>

            {/* Teléfono */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="text-xs font-semibold text-purple-300 mb-2 block flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Teléfono (Bolivia)
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-cyan-400 font-medium text-sm">
                  <span>+591</span>
                </div>
                <input
                  type="tel"
                  placeholder="71234567"
                  value={formData.telefono}
                  onChange={(e) => handleFormChange("telefono", e.target.value)}
                  className="w-full pl-16 pr-12 py-4 rounded-2xl border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  style={{ background: "rgba(30, 27, 75, 0.8)" }}
                  data-testid="input-telefono"
                />
                {formData.telefono.length > 5 && (
                  <motion.div 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Edad y Ciudad en grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 }}
              >
                <label className="text-xs font-semibold text-purple-300 mb-2 block flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Edad
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <input
                    type="number"
                    placeholder="15"
                    value={formData.edad}
                    onChange={(e) => handleFormChange("edad", e.target.value)}
                    className="w-full pl-11 pr-3 py-4 rounded-2xl border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                    style={{ background: "rgba(30, 27, 75, 0.8)" }}
                    data-testid="input-edad"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="text-xs font-semibold text-purple-300 mb-2 block flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  Ciudad
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="La Paz"
                    value={formData.ciudad}
                    onChange={(e) => handleFormChange("ciudad", e.target.value)}
                    className="w-full pl-11 pr-3 py-4 rounded-2xl border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                    style={{ background: "rgba(30, 27, 75, 0.8)" }}
                    data-testid="input-ciudad"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Perfil educativo */}
          {(isNinos || isAdolescentes) && (
            <motion.div 
              className="rounded-3xl p-5 mt-4 backdrop-blur-xl border border-white/10"
              style={{ 
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
              <label className="text-xs font-semibold text-purple-300 mb-3 block flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Perfil educativo
              </label>
              
              <select
                value={formData.grado}
                onChange={(e) => handleFormChange("grado", e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 appearance-none bg-no-repeat cursor-pointer"
                style={{ 
                  background: "rgba(30, 27, 75, 0.8)",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2306b6d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 16px center",
                  backgroundSize: "20px"
                }}
                data-testid="select-grado"
              >
                <option value="" className="bg-slate-900">Selecciona grado</option>
                {(isNinos ? gradosPrimaria : gradosSecundaria).map((g) => (
                  <option key={g} value={g} className="bg-slate-900">{g}</option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Comentario */}
          <motion.div 
            className="rounded-3xl p-5 mt-4 backdrop-blur-xl border border-white/10"
            style={{ 
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <label className="text-xs font-semibold text-purple-300 mb-2 block flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Comentario (opcional)
            </label>
            <textarea
              placeholder="Mensaje adicional..."
              value={formData.comentario}
              onChange={(e) => handleFormChange("comentario", e.target.value)}
              className="w-full px-4 py-4 rounded-2xl border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 resize-none transition-all"
              style={{ background: "rgba(30, 27, 75, 0.8)", minHeight: "80px" }}
              data-testid="input-comentario"
            />
          </motion.div>

          {/* Submit button with glow effect */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitForm}
            disabled={submitting || !formData.nombre}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-bold shadow-lg disabled:opacity-50 mt-6 relative overflow-hidden group"
            style={{ 
              background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
              boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            data-testid="button-submit-form"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {submitting ? "Procesando..." : "Ver mis resultados"}
          </motion.button>
          
          <motion.p 
            className="text-xs text-purple-300/60 text-center mt-4 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Tus datos están seguros y protegidos
          </motion.p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-center px-5 py-3 bg-white sticky top-0 z-50 border-b border-gray-100">
        <button 
          onClick={handleClose}
          className="absolute left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="button-close-reading"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        
        <div className="flex items-center justify-center" data-testid="header-logo">
          <img 
            src="https://iqexponencial.app/api/images/e038af72-17b2-4944-a203-afa1f753b33a" 
            alt="iQx" 
            className="h-10 w-auto object-contain" 
          />
        </div>
      </header>

      <div className="flex mx-4 mt-3 rounded-full overflow-hidden border border-gray-200">
        <button
          onClick={() => {
            if (activeTab !== "cuestionario") {
              playButtonSound();
              setActiveTab("lectura");
            }
          }}
          className={`flex-1 py-2.5 text-xs font-bold text-center transition-all ${
            activeTab === "lectura" 
              ? "text-white"
              : activeTab === "cuestionario"
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500"
          }`}
          style={activeTab === "lectura" ? { background: "linear-gradient(90deg, #8a3ffc, #6b21a8)" } : {}}
          disabled={activeTab === "cuestionario"}
          data-testid="tab-lectura"
        >
          LECTURA
        </button>
        <button
          onClick={() => {
            if (quizStarted && activeTab !== "lectura") {
              playButtonSound();
              setActiveTab("cuestionario");
            }
          }}
          className={`flex-1 py-2.5 text-xs font-bold text-center transition-all ${
            activeTab === "cuestionario" 
              ? "text-white"
              : quizStarted 
                ? "text-gray-500" 
                : "text-gray-300 cursor-not-allowed"
          }`}
          style={activeTab === "cuestionario" ? { background: "linear-gradient(90deg, #8a3ffc, #6b21a8)" } : {}}
          disabled={!quizStarted || activeTab === "lectura"}
          data-testid="tab-cuestionario"
        >
          CUESTIONARIO
        </button>
      </div>

      <div className="flex mx-4 mt-3 rounded-xl overflow-hidden border border-purple-100 divide-x divide-purple-100"
        style={{ background: "linear-gradient(135deg, rgba(138, 63, 252, 0.06) 0%, rgba(0, 217, 255, 0.04) 100%)" }}
      >
        <div className="flex-1 py-2.5 text-center">
          <p className="text-[9px] font-medium" style={{ color: "#9ca3af" }}>CATEGORÍA</p>
          <p className="text-xs font-bold" style={{ color: "#8a3ffc" }}>{categoryLabel}</p>
        </div>
        <div className="flex-1 py-2.5 text-center">
          <p className="text-[9px] font-medium" style={{ color: "#9ca3af" }}>LECTURA</p>
          <p className="text-xs font-bold" style={{ color: "#1f2937" }}>{formatTime(readingTime)}</p>
        </div>
        <div className="flex-1 py-2.5 text-center">
          <p className="text-[9px] font-medium" style={{ color: "#9ca3af" }}>PREGUNTAS</p>
          <p className="text-xs font-bold" style={{ color: "#1f2937" }}>{formatTime(questionTime)}</p>
        </div>
        <div className="flex-1 py-2.5 text-center">
          <p className="text-[9px] font-medium" style={{ color: "#9ca3af" }}>PROGRESO</p>
          <p className="text-xs font-bold" style={{ color: "#1f2937" }}>{activeTab === "cuestionario" ? currentQuestion + 1 : 0}/{content.questions.length}</p>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-5">
        {activeTab === "lectura" ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#8a3ffc" }}>LECTURA</p>
              <h2 className="text-lg font-black" style={{ color: "#1f2937" }}>{content.title}</h2>
            </div>

            <div 
              className="rounded-2xl p-5 border border-purple-100"
              style={{ background: "linear-gradient(135deg, rgba(138, 63, 252, 0.04) 0%, rgba(0, 217, 255, 0.02) 100%)" }}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#374151" }}>
                {content.text}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToQuestionnaire}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-bold shadow-md"
              style={{ background: "linear-gradient(90deg, #8a3ffc, #6b21a8)" }}
              data-testid="button-start-quiz"
            >
              <HelpCircle className="w-5 h-5" />
              Ir al cuestionario
            </motion.button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#8a3ffc" }}>
                PREGUNTA {currentQuestion + 1} DE {content.questions.length}
              </p>
              <h2 className="text-lg font-bold" style={{ color: "#1f2937" }}>{currentQ?.question}</h2>
            </div>

            <div className="space-y-3">
              {currentQ?.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => selectedAnswer === null && handleSelectAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedAnswer === index 
                      ? "border-purple-500 bg-purple-50" 
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  style={selectedAnswer === index ? { borderColor: "#8a3ffc", background: "rgba(138, 63, 252, 0.08)" } : {}}
                  data-testid={`option-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                        selectedAnswer === index ? "text-white" : "text-gray-500"
                      }`}
                      style={selectedAnswer === index 
                        ? { background: "linear-gradient(90deg, #8a3ffc, #6b21a8)" }
                        : { background: "#f3f4f6" }
                      }
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-sm font-medium" style={{ color: "#1f2937" }}>{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <BottomNavBar />
    </div>
  );
}
