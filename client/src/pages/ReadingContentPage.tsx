import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, BookOpen, HelpCircle, CheckCircle, Share2, MessageCircle, RotateCcw } from "lucide-react";
import { useUserData } from "@/lib/user-context";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";
import menuCurveImg from "@assets/menu_1769957804819.png";

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
        className="min-h-screen flex flex-col"
        style={{ background: "linear-gradient(180deg, #c4b5fd 0%, #ddd6fe 40%, #f5f3ff 100%)" }}
      >
        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex flex-col items-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2a9 9 0 0 1 9 9c0 3.5-2 6.5-5 8v2a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2c-3-1.5-5-4.5-5-8a9 9 0 0 1 9-9z"/>
                <path d="M9 22h6"/>
                <path d="M12 6v4"/>
                <path d="M8 10h8"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">Test de Lectura</h1>
            <p className="text-sm text-gray-600 text-center">Completa tus datos para ver tu resultado.</p>
          </div>

          <div 
            className="rounded-2xl p-5 space-y-4"
            style={{ backgroundColor: "rgba(255,255,255,0.85)", boxShadow: "0 4px 20px rgba(124, 58, 237, 0.15)" }}
          >
            <div>
              <label className="text-xs font-semibold text-purple-700 mb-1 block">Nombre completo</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7c3aed" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => handleFormChange("nombre", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ backgroundColor: "#ede9fe" }}
                  data-testid="input-nombre"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-700 mb-1 block">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7c3aed" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input
                  type="email"
                  placeholder="nombre@email.com"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ backgroundColor: "#ede9fe" }}
                  data-testid="input-email"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-700 mb-1 block">Teléfono (Bolivia)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-700 font-medium text-sm">
                  <span>BO +591</span>
                </div>
                <input
                  type="tel"
                  placeholder="71234567"
                  value={formData.telefono}
                  onChange={(e) => handleFormChange("telefono", e.target.value)}
                  className="w-full pl-20 pr-10 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ backgroundColor: "#ede9fe" }}
                  data-testid="input-telefono"
                />
                {formData.telefono.length > 5 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-700 mb-1 block">Edad</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#0891b2" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <input
                  type="number"
                  placeholder="Ej: 15"
                  value={formData.edad}
                  onChange={(e) => handleFormChange("edad", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ backgroundColor: "#ede9fe" }}
                  data-testid="input-edad"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-700 mb-1 block">Ciudad</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#0891b2" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Ej: La Paz"
                  value={formData.ciudad}
                  onChange={(e) => handleFormChange("ciudad", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ backgroundColor: "#ede9fe" }}
                  data-testid="input-ciudad"
                />
              </div>
            </div>
          </div>

          {(isNinos || isAdolescentes) && (
            <div 
              className="rounded-2xl p-5 mt-4 space-y-3"
              style={{ backgroundColor: "rgba(255,255,255,0.85)", boxShadow: "0 4px 20px rgba(124, 58, 237, 0.15)" }}
            >
              <label className="text-xs font-semibold text-purple-700 block">Perfil educativo</label>
              
              <select
                value={formData.grado}
                onChange={(e) => handleFormChange("grado", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-no-repeat"
                style={{ 
                  backgroundColor: "#e5e7eb",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 12px center",
                  backgroundSize: "20px"
                }}
                data-testid="select-grado"
              >
                <option value="">Selecciona grado</option>
                {(isNinos ? gradosPrimaria : gradosSecundaria).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          )}

          <div 
            className="rounded-2xl p-5 mt-4"
            style={{ backgroundColor: "rgba(255,255,255,0.85)", boxShadow: "0 4px 20px rgba(124, 58, 237, 0.15)" }}
          >
            <label className="text-xs font-semibold text-purple-700 mb-1 block">Comentario (opcional)</label>
            <textarea
              placeholder="Mensaje adicional..."
              value={formData.comentario}
              onChange={(e) => handleFormChange("comentario", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              style={{ backgroundColor: "#ede9fe", minHeight: "60px" }}
              data-testid="input-comentario"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitForm}
            disabled={submitting || !formData.nombre}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-lg text-white font-bold shadow-lg disabled:opacity-50 mt-6"
            style={{ background: "linear-gradient(90deg, #7c3aed 0%, #5b21b6 50%, #0891b2 100%)" }}
            data-testid="button-submit-form"
          >
            {submitting ? "Enviando..." : "Ver mis resultados"}
          </motion.button>
          
          <p className="text-xs text-gray-400 text-center mt-3">
            Tus datos se usan solo para mostrar resultados y recomendaciones.
          </p>
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
          <svg width="80" height="36" viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a3ffc" />
                <stop offset="100%" stopColor="#00d9ff" />
              </linearGradient>
            </defs>
            <text x="0" y="28" fontSize="32" fontWeight="900" fontFamily="Inter, sans-serif">
              <tspan fill="#8a3ffc">i</tspan>
              <tspan fill="#8a3ffc">Q</tspan>
              <tspan fill="url(#logoGradient3)">x</tspan>
            </text>
          </svg>
        </div>
      </header>

      <div className="flex mx-4 mt-3 rounded-full overflow-hidden border border-gray-200">
        <button
          onClick={() => setActiveTab("lectura")}
          className={`flex-1 py-2.5 text-xs font-bold text-center transition-all ${
            activeTab === "lectura" 
              ? "text-white"
              : "text-gray-500"
          }`}
          style={activeTab === "lectura" ? { background: "linear-gradient(90deg, #8a3ffc, #6b21a8)" } : {}}
          data-testid="tab-lectura"
        >
          LECTURA
        </button>
        <button
          onClick={() => setActiveTab("cuestionario")}
          className={`flex-1 py-2.5 text-xs font-bold text-center transition-all ${
            activeTab === "cuestionario" 
              ? "text-white"
              : "text-gray-500"
          }`}
          style={activeTab === "cuestionario" ? { background: "linear-gradient(90deg, #8a3ffc, #6b21a8)" } : {}}
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
