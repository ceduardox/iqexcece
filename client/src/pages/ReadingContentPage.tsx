import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, BookOpen, HelpCircle, CheckCircle, Share2, MessageCircle, RotateCcw, Home } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useUserData } from "@/lib/user-context";
import { BottomNavBar } from "@/components/BottomNavBar";
import { TestFormUnified, FormDataType } from "@/components/TestFormUnified";
import html2canvas from "html2canvas";
import localCaptureLogo from "@assets/logo1q_1770275527185.png";

const HEADER_LOGO = "https://iqexponencial.app/api/images/e038af72-17b2-4944-a203-afa1f753b33a";

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
  const resultsRef = useRef<HTMLDivElement>(null);
  const captureAreaRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
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
    telefono: "",
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

  const handleUnifiedFormSubmit = async (formDataUnified: FormDataType) => {
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
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formDataUnified.nombre,
          email: formDataUnified.email || null,
          edad: formDataUnified.edad || null,
          ciudad: formDataUnified.estado || null,
          telefono: formDataUnified.telefono ? `${formDataUnified.codigoPais} ${formDataUnified.telefono}` : null,
          comentario: formDataUnified.comentario || null,
          grado: formDataUnified.grado || null,
          institucion: formDataUnified.institucion || null,
          tipoEstudiante: formDataUnified.tipoEstudiante || null,
          semestre: formDataUnified.semestre || null,
          esProfesional: formDataUnified.esProfesional,
          profesion: formDataUnified.profesion || null,
          ocupacion: formDataUnified.ocupacion || null,
          lugarTrabajo: formDataUnified.lugarTrabajo || null,
          pais: formDataUnified.pais || null,
          codigoPais: formDataUnified.codigoPais || null,
          estado: formDataUnified.estado || null,
          categoria: userData.childCategory || "preescolar",
          testType: "lectura",
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

  const captureAndShare = async (): Promise<Blob | null> => {
    if (!captureAreaRef.current) return null;
    
    try {
      const capturedCanvas = await html2canvas(captureAreaRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      
      const logoHeight = 80;
      const padding = 20;
      const finalWidth = capturedCanvas.width;
      const finalHeight = capturedCanvas.height + logoHeight + padding;
      
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = finalWidth;
      finalCanvas.height = finalHeight;
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalWidth, finalHeight);
      
      if (localCaptureLogo) {
        const logoImg = new Image();
        logoImg.src = localCaptureLogo;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        const logoWidth = Math.min(200, finalWidth * 0.4);
        const logoX = (finalWidth - logoWidth) / 2;
        ctx.drawImage(logoImg, logoX, padding / 2, logoWidth, logoHeight - padding);
      }
      
      ctx.drawImage(capturedCanvas, 0, logoHeight);
      
      return new Promise<Blob>((resolve, reject) => {
        finalCanvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png', 0.95);
      });
    } catch (e) {
      console.error("Capture error:", e);
      return null;
    }
  };
  
  const handleWhatsAppShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    playButtonSound();
    
    const percentage = Math.round((correctAnswers / content.questions.length) * 100);
    const blob = await captureAndShare();
    
    if (blob && navigator.share && navigator.canShare) {
      const file = new File([blob], 'resultado-lectura.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Mi resultado - IQEXPONENCIAL',
            text: `¡Obtuve ${percentage}% en el Test de Lectura! Velocidad: ${wordsPerMinute} ppm. https://iqexponencial.app`
          });
        } catch (e) {
          console.error("Share cancelled:", e);
        }
        setIsSharing(false);
        return;
      }
    }
    
    const text = encodeURIComponent(`¡Obtuve ${percentage}% en el Test de Lectura! Velocidad: ${wordsPerMinute} ppm.\n\nEntrena tu cerebro: https://iqexponencial.app`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setIsSharing(false);
  };
  
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    playButtonSound();
    
    const blob = await captureAndShare();
    
    if (blob) {
      const file = new File([blob], 'resultado-lectura.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Resultado Lectura' });
        } catch (e) {}
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado-lectura.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } else {
      const percentage = Math.round((correctAnswers / content.questions.length) * 100);
      const text = `¡${percentage}% en Lectura! ${wordsPerMinute} ppm.\n\nhttps://iqexponencial.app`;
      if (navigator.share) {
        await navigator.share({ title: "Resultado", text });
      }
    }
    setIsSharing(false);
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
      <div ref={resultsRef} className="min-h-screen bg-white flex flex-col">
        {/* Capture area - contains header and content, excludes buttons */}
        <div ref={captureAreaRef} className="bg-white">
          <header className="flex items-center justify-center px-5 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center justify-center" data-testid="header-logo">
              <img 
                src={HEADER_LOGO} 
                alt="iQx" 
                className="h-10 w-auto object-contain" 
              />
            </div>
          </header>
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
          </div>
        </div>
        {/* End capture area */}

        {/* Buttons section - excluded from capture */}
        <div className="px-5 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            {/* WhatsApp - Primary button on mobile */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsAppShare}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-bold shadow-lg disabled:opacity-50"
                style={{ background: "#25D366" }}
                data-testid="button-whatsapp-share"
              >
                <SiWhatsapp className="w-5 h-5" />
                {isSharing ? 'Compartiendo...' : 'Compartir en WhatsApp'}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold border-2 disabled:opacity-50"
                style={{ borderColor: "#8a3ffc", color: "#8a3ffc" }}
                data-testid="button-share"
              >
                <Share2 className="w-5 h-5" />
                Más opciones
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNewTest}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold"
                style={{ background: "linear-gradient(90deg, #8a3ffc, #6b21a8)", color: "white" }}
                data-testid="button-new-test"
              >
                <RotateCcw className="w-5 h-5" />
                Nuevo test
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-2 font-medium"
                style={{ color: "#6b7280" }}
                data-testid="button-whatsapp-info"
              >
                <MessageCircle className="w-4 h-4" />
                Más información
              </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <TestFormUnified
        categoria={categoria}
        onSubmit={handleUnifiedFormSubmit}
        submitting={submitting}
        title="Test de Lectura"
        subtitle="Completa tus datos para ver tu resultado"
        buttonText="Ver mis resultados"
      />
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
