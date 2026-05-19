import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, BookOpen, HelpCircle, CheckCircle, Share2, MessageCircle, RotateCcw, Home } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useTranslation } from "react-i18next";
import { useUserData } from "@/lib/user-context";
import { BottomNavBar } from "@/components/BottomNavBar";
import { LanguageButton } from "@/components/LanguageButton";
import { TestFormUnified, FormDataType } from "@/components/TestFormUnified";
import { CognitiveSurvey, type CognitiveSurveyResult } from "@/components/CognitiveSurvey";
import { CognitiveResultSummary } from "@/components/CognitiveResultSummary";
import html2canvas from "html2canvas";
import localCaptureLogo from "@assets/logo1q_1770275527185.png";

const HEADER_LOGO = "/api/images/e038af72-17b2-4944-a203-afa1f753b33a";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
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
  const { t, i18n } = useTranslation();
  const { userData } = useUserData();

  const categoryLabels: Record<string, string> = {
    preescolar: t("age.preescolarShort"),
    ninos: t("age.ninoShort"),
    adolescentes: t("age.adolescenteShort"),
    universitarios: t("age.universitarioShort"),
    profesionales: t("age.profesionalShort"),
    adulto_mayor: t("age.adultoMayorShort"),
  };
  const resultsRef = useRef<HTMLDivElement>(null);
  const captureAreaRef = useRef<HTMLDivElement>(null);
  const shareCaptureRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<"lectura" | "cuestionario">("lectura");
  const [quizStarted, setQuizStarted] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [pendingFormData, setPendingFormData] = useState<FormDataType | null>(null);
  const [surveyResult, setSurveyResult] = useState<CognitiveSurveyResult | null>(null);
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
        const lang = i18n.language || 'es';
        const res = await fetch(`/api/reading/${categoria}?tema=${selectedTema}&lang=${lang}`);
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
  }, [categoria, selectedTema, i18n.language]);

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

  const categoryLabel = categoryLabels[categoria] || t("age.preescolarShort");
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

  const submitReadingResult = async (formDataUnified: FormDataType, survey: CognitiveSurveyResult) => {
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
      const sessionId = typeof window !== "undefined" ? localStorage.getItem("iq_session_id") : null;
      const comprension = Math.round((correct / content.questions.length) * 100);
      const velocidadLectura = readingTime > 0 ? Math.round((wordCount / readingTime) * 60) : 0;
      
      const quizResponse = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(sessionId ? { "x-iq-session-id": sessionId } : {})
        },
        body: JSON.stringify({
          sessionId: sessionId || null,
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
          respuestasCorrectas: correct,
          respuestasTotales: content.questions.length,
          comprension,
          velocidadLectura,
          readingTitle: content.title,
          readingWordCount: wordCount,
          readingTemaNumero: selectedTema,
          readingLang: i18n.language || "es",
          readingContent: content.text,
          surveyAnswers: JSON.stringify(survey.answers),
          surveyScore: survey.score,
          surveyProfile: survey.profile,
          surveyMainNeed: survey.mainNeed,
          surveyInterest: survey.interestLevel,
          isPwa,
        }),
      });
      if (!quizResponse.ok) {
        let message = "No se pudo guardar el resultado.";
        try {
          const errorData = await quizResponse.json();
          message = errorData?.error || message;
        } catch {}
        throw new Error(message);
      }

      // Mirror diagnóstico data in training_results so /progreso can show it by sessionId
      await fetch("/api/training-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || null,
          categoria: userData.childCategory || "preescolar",
          tipoEjercicio: "diagnostico_lectura",
          ejercicioTitulo: "Diagnóstico Lectura",
          puntaje: comprension,
          nivelAlcanzado: 1,
          tiempoSegundos: (readingTime || 0) + (questionTime || 0),
          palabrasPorMinuto: velocidadLectura,
          respuestasCorrectas: correct,
          respuestasTotales: content.questions.length,
          datosExtra: JSON.stringify({
            testType: "lectura",
            comprension,
            velocidadLectura,
            tiempoLectura: readingTime,
            tiempoCuestionario: questionTime,
            surveyProfile: survey.profile,
            surveyMainNeed: survey.mainNeed,
            surveyInterest: survey.interestLevel,
          }),
          isPwa,
        }),
      }).catch(() => {});
      setShowForm(false);
      setShowSurvey(false);
      setSurveyResult(survey);
      setShowResults(true);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "No se pudo guardar el resultado.");
    }
    setSubmitting(false);
  };

  const handleUnifiedFormSubmit = async (formDataUnified: FormDataType) => {
    playButtonSound();
    setPendingFormData(formDataUnified);
    setShowForm(false);
    setShowSurvey(true);
  };

  const handleSurveySubmit = (survey: CognitiveSurveyResult) => {
    if (!pendingFormData) return;
    submitReadingResult(pendingFormData, survey);
  };

  const captureAndShare = async (): Promise<Blob | null> => {
    const nodeToCapture = shareCaptureRef.current ?? captureAreaRef.current;
    if (!nodeToCapture) return null;
    
    try {
      const canvas = await html2canvas(nodeToCapture, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
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
            title: t("tests.myResult"),
            text: `${t("tests.shareText", { percentage, speed: wordsPerMinute })} https://iqexponencial.app`
          });
        } catch (e) {
          console.error("Share cancelled:", e);
        }
        setIsSharing(false);
        return;
      }
    }
    
    const text = encodeURIComponent(t("tests.shareTextFull", { percentage, speed: wordsPerMinute }));
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
          await navigator.share({ files: [file], title: t("tests.resultTitle") });
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
      const text = `${t("tests.shareText", { percentage, speed: wordsPerMinute })}\n\nhttps://iqexponencial.app`;
      if (navigator.share) {
        await navigator.share({ title: t("tests.resultTitle"), text });
      }
    }
    setIsSharing(false);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(t("tests.whatsAppInquiry"));
    window.open(`https://wa.me/59173600060?text=${msg}`, "_blank");
  };

  const handleNewTest = () => {
    window.location.href = "/";
  };

  if (showResults) {
    const percentage = Math.round((correctAnswers / content.questions.length) * 100);
    const circumference = 2 * Math.PI * 42;
    const progressOffset = circumference * (1 - percentage / 100);
    return (
      <div ref={resultsRef} className="min-h-screen bg-white flex flex-col">
        {/* Capture area - contains header and content, excludes buttons */}
        <div ref={captureAreaRef} className="bg-white">
          <header className="flex items-center justify-center px-5 py-3 bg-white border-b border-gray-100 md:hidden">
            <div className="flex items-center justify-center" data-testid="header-logo">
              <img 
                src={HEADER_LOGO} 
                alt="iQx" 
                className="h-10 w-auto object-contain" 
              />
            </div>
            <div className="absolute right-5"><LanguageButton /></div>
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
                {t("tests.excellent")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm"
                style={{ color: "#6b7280" }}
              >
                {t("tests.completedReadingTest")}
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
                  <span className="text-xs font-medium" style={{ color: "#6b7280" }}>{t("tests.comprension")}</span>
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
                  <p className="text-xs font-medium mb-1" style={{ color: "#9ca3af" }}>{t("tests.answers")}</p>
                  <p className="text-2xl font-black" style={{ color: "#8a3ffc" }}>{correctAnswers}/{content.questions.length}</p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>{t("tests.correctAnswers")}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium mb-1" style={{ color: "#9ca3af" }}>{t("tests.speed")}</p>
                  <p className="text-2xl font-black" style={{ color: "#00d9ff" }}>{wordsPerMinute}</p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>{t("tests.wordsPerMin")}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs font-medium mb-1" style={{ color: "#9ca3af" }}>{t("tests.readingTimeLabel")}</p>
                  <p className="text-lg font-bold" style={{ color: "#1f2937" }}>{formatTime(readingTime)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium mb-1" style={{ color: "#9ca3af" }}>{t("tests.questionsTimeLabel")}</p>
                  <p className="text-lg font-bold" style={{ color: "#1f2937" }}>{formatTime(questionTime)}</p>
                </div>
              </div>
            </motion.div>

            {surveyResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <CognitiveResultSummary survey={surveyResult} accent="cyan" />
              </motion.div>
            )}
          </div>
        </div>
        {/* End capture area */}

        <div
          ref={shareCaptureRef}
          aria-hidden="true"
          className="fixed top-0 pointer-events-none bg-white"
          style={{ left: "-10000px", width: 390 }}
        >
          <div
            className="w-full bg-white text-center"
            style={{
              padding: "28px 22px 24px",
              fontFamily: "inherit",
              color: "#1f2937",
            }}
          >
            <img
              src={localCaptureLogo}
              alt=""
              className="mx-auto object-contain"
              style={{ width: 235, height: "auto", marginBottom: 22 }}
            />
            <div
              className="mx-auto rounded-full flex items-center justify-center"
              style={{
                width: 74,
                height: 74,
                marginBottom: 18,
                background: "linear-gradient(135deg, rgba(138, 63, 252, 0.15) 0%, rgba(0, 217, 255, 0.1) 100%)",
              }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: "#8a3ffc" }} />
            </div>
            <h1 className="text-3xl font-black mb-2" style={{ color: "#1f2937" }}>
              {t("tests.excellent")}
            </h1>
            <p className="text-base mb-8" style={{ color: "#6b7280" }}>
              {t("tests.completedReadingTest")}
            </p>

            <div className="relative mx-auto" style={{ width: 168, height: 168, marginBottom: 28 }}>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#shareProgressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={progressOffset}
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="shareProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8a3ffc" />
                    <stop offset="100%" stopColor="#00d9ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black" style={{ color: "#8a3ffc" }}>
                  {percentage}%
                </span>
                <span className="text-sm font-medium" style={{ color: "#6b7280" }}>
                  {t("tests.comprension")}
                </span>
              </div>
            </div>

            <div
              className="rounded-2xl overflow-hidden border p-5"
              style={{
                borderColor: "rgba(138, 63, 252, 0.14)",
                background: "linear-gradient(135deg, rgba(138, 63, 252, 0.06) 0%, rgba(0, 217, 255, 0.04) 100%)",
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "#9ca3af" }}>{t("tests.answers")}</p>
                  <p className="text-3xl font-black" style={{ color: "#8a3ffc" }}>{correctAnswers}/{content.questions.length}</p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>{t("tests.correctAnswers")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "#9ca3af" }}>{t("tests.speed")}</p>
                  <p className="text-3xl font-black" style={{ color: "#00d9ff" }}>{wordsPerMinute}</p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>{t("tests.wordsPerMin")}</p>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t grid grid-cols-2 gap-4" style={{ borderColor: "rgba(138, 63, 252, 0.12)" }}>
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: "#9ca3af" }}>{t("tests.readingTimeLabel")}</p>
                  <p className="text-2xl font-bold" style={{ color: "#1f2937" }}>{formatTime(readingTime)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: "#9ca3af" }}>{t("tests.questionsTimeLabel")}</p>
                  <p className="text-2xl font-bold" style={{ color: "#1f2937" }}>{formatTime(questionTime)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                {isSharing ? t("tests.sharing") : t("tests.shareWhatsApp")}
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
                {t("tests.moreOptions")}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNewTest}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold"
                style={{ background: "linear-gradient(90deg, #8a3ffc, #6b21a8)", color: "white" }}
                data-testid="button-new-test"
              >
                <RotateCcw className="w-5 h-5" />
                {t("tests.newTest")}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-2 font-medium"
                style={{ color: "#6b7280" }}
                data-testid="button-whatsapp-info"
              >
                <MessageCircle className="w-4 h-4" />
                {t("tests.moreInfo")}
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
        title={t("tests.readingTestTitle")}
        subtitle={t("tests.completeData")}
        buttonText={t("tests.seeResults")}
      />
    );
  }

  if (showSurvey) {
    return (
      <CognitiveSurvey
        categoria={pendingFormData?.tipoEstudiante === "universitario" ? "universitarios" : categoria}
        testType="lectura"
        onSubmit={handleSurveySubmit}
        submitting={submitting}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-center px-5 py-3 bg-white sticky top-0 z-50 border-b border-gray-100 md:hidden">
        <button 
          onClick={handleClose}
          className="absolute left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="button-close-reading"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        
        <div className="flex items-center justify-center" data-testid="header-logo">
          <img 
            src="/api/images/e038af72-17b2-4944-a203-afa1f753b33a" 
            alt="iQx" 
            className="h-10 w-auto object-contain" 
          />
        </div>
        <div className="absolute right-5"><LanguageButton /></div>
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
          {t("tests.readingTab")}
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
          {t("tests.questionnaireTab")}
        </button>
      </div>

      <div className="flex mx-4 mt-3 rounded-xl overflow-hidden border border-purple-100 divide-x divide-purple-100"
        style={{ background: "linear-gradient(135deg, rgba(138, 63, 252, 0.06) 0%, rgba(0, 217, 255, 0.04) 100%)" }}
      >
        <div className="flex-1 py-2.5 text-center">
          <p className="text-[9px] font-medium" style={{ color: "#9ca3af" }}>{t("tests.category")}</p>
          <p className="text-xs font-bold" style={{ color: "#8a3ffc" }}>{categoryLabel}</p>
        </div>
        <div className="flex-1 py-2.5 text-center">
          <p className="text-[9px] font-medium" style={{ color: "#9ca3af" }}>{t("tests.readingTime")}</p>
          <p className="text-xs font-bold" style={{ color: "#1f2937" }}>{formatTime(readingTime)}</p>
        </div>
        <div className="flex-1 py-2.5 text-center">
          <p className="text-[9px] font-medium" style={{ color: "#9ca3af" }}>{t("tests.questions")}</p>
          <p className="text-xs font-bold" style={{ color: "#1f2937" }}>{formatTime(questionTime)}</p>
        </div>
        <div className="flex-1 py-2.5 text-center">
          <p className="text-[9px] font-medium" style={{ color: "#9ca3af" }}>{t("tests.progressLabel")}</p>
          <p className="text-xs font-bold" style={{ color: "#1f2937" }}>{activeTab === "cuestionario" ? currentQuestion + 1 : 0}/{content.questions.length}</p>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-5">
        {activeTab === "lectura" ? (
          <div className="space-y-5 md:max-w-[50vw] md:mx-auto">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#8a3ffc" }}>{t("tests.readingLabel")}</p>
              <h2 className="text-lg font-black" style={{ color: "#1f2937" }}>{content.title}</h2>
            </div>

            <div 
              className="rounded-2xl p-5 border border-purple-100"
              style={{ background: "linear-gradient(135deg, rgba(138, 63, 252, 0.04) 0%, rgba(0, 217, 255, 0.02) 100%)" }}
            >
              <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: "#374151" }}>
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
              {t("tests.goToQuestionnaire")}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#8a3ffc" }}>
                {t("tests.questionOf", { current: currentQuestion + 1, total: content.questions.length })}
              </p>
              <h2 className="text-lg font-bold" style={{ color: "#1f2937" }}>{currentQ?.question}</h2>
            </div>

            <div className="space-y-3">
              {currentQ?.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut", delay: index * 0.035 }}
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
