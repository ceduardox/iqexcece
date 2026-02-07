import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { useUserData } from "@/lib/user-context";
import { ArrowLeft, Brain, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNavBar } from "@/components/BottomNavBar";
import { TestFormUnified, FormDataType } from "@/components/TestFormUnified";
import { LanguageButton } from "@/components/LanguageButton";
import menuCurveImg from "@assets/menu_1769957804819.png";

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

export default function RazonamientoQuizPage() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ category?: string; tema?: string }>();
  const { userData, setUserData } = useUserData();

  const categoryLabels: Record<string, string> = {
    preescolar: t("age.preescolarShort"),
    ninos: t("age.ninosShort"),
    adolescentes: t("age.adolescentesShort"),
    universitarios: t("age.adolescentesShort"),
    profesionales: t("age.profesionalesShort"),
    adulto_mayor: t("age.adultoMayorShort"),
  };
  
  const categoria = params.category || userData.childCategory || "ninos";
  const tema = parseInt(params.tema || "1");
  
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageSize, setImageSize] = useState(100);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizTime, setQuizTime] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const lang = i18n.language || 'es';
        const res = await fetch(`/api/razonamiento/${categoria}?tema=${tema}&lang=${lang}`);
        const data = await res.json();
        if (data.content) {
          const parsedQuestions = typeof data.content.questions === 'string' 
            ? JSON.parse(data.content.questions) 
            : data.content.questions || [];
          setTitle(data.content.title || `Razonamiento Tema ${tema}`);
          setImageUrl(data.content.imageUrl || "");
          setImageSize(data.content.imageSize || 100);
          setQuestions(parsedQuestions);
        } else {
          setQuestions([]);
        }
      } catch {
        setQuestions([]);
      }
      setLoading(false);
    };
    fetchContent();
  }, [categoria, tema, i18n.language]);

  useEffect(() => {
    if (!quizFinished && questions.length > 0) {
      const interval = setInterval(() => {
        setQuizTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quizFinished, questions.length]);

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleSelectAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return;
    playButtonSound();
    setSelectedAnswer(index);
    setAnswers(prev => [...prev, index]);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setQuizFinished(true);
        setShowForm(true);
      }
    }, 600);
  }, [currentQuestion, questions.length, selectedAnswer]);

  const correctAnswers = answers.reduce((count, answer, idx) => {
    return count + (questions[idx]?.correct === answer ? 1 : 0);
  }, 0);

  const handleFormSubmit = async (formData: FormDataType) => {
    setSubmitting(true);
    
    try {
      const isPwa = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email || null,
          edad: formData.edad || null,
          ciudad: formData.estado || null,
          telefono: formData.telefono ? `${formData.codigoPais} ${formData.telefono}` : null,
          comentario: formData.comentario || null,
          grado: formData.grado || null,
          institucion: formData.institucion || null,
          tipoEstudiante: formData.tipoEstudiante || null,
          semestre: formData.semestre || null,
          esProfesional: formData.esProfesional,
          profesion: formData.profesion || null,
          ocupacion: formData.ocupacion || null,
          lugarTrabajo: formData.lugarTrabajo || null,
          pais: formData.pais || null,
          codigoPais: formData.codigoPais || null,
          estado: formData.estado || null,
          categoria: categoria,
          testType: "razonamiento",
          tiempoLectura: null,
          tiempoCuestionario: quizTime,
          respuestasCorrectas: correctAnswers,
          respuestasTotales: questions.length,
          comprension: Math.round((correctAnswers / questions.length) * 100),
          isPwa: isPwa,
        }),
      });
    } catch (error) {
      console.error("Error submitting:", error);
    }
    
    setUserData({
      ...userData,
      razonamientoResults: {
        correct: correctAnswers,
        total: questions.length,
        time: quizTime,
        categoria: categoria,
        title: title,
      }
    });
    
    setLocation(`/razonamiento-result/${categoria}`);
  };

  const categoryLabel = categoryLabels[categoria] || t("age.ninosShort");
  const currentQ = questions[currentQuestion];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex flex-col items-center justify-center p-6">
        <Brain className="w-16 h-16 text-white mb-4" />
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          No hay preguntas disponibles
        </h2>
        <p className="text-white/80 text-center mb-6">
          Este test aún no tiene contenido. Por favor, selecciona otro test o vuelve más tarde.
        </p>
        <Button
          onClick={handleBack}
          className="bg-white text-purple-600 font-bold"
          data-testid="button-back-no-content"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  if (showForm) {
    return (
      <TestFormUnified
        categoria={categoria}
        onSubmit={handleFormSubmit}
        submitting={submitting}
        title={title || t("tests.razonamiento")}
        subtitle={t("tests.completeData")}
        buttonText={t("tests.seeResults")}
      />
    );
  }

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
            
            <LanguageButton />
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
          <div className="relative px-5 pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-semibold"
                  style={{ color: "#8a3ffc" }}
                >
                  {categoryLabel}
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-xl font-bold"
                  style={{ color: "#1f2937" }}
                >
                  Test Razonamiento
                </motion.h1>
              </div>
              <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-purple-100 text-purple-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold text-sm">{Math.floor(quizTime / 60)}:{String(quizTime % 60).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Pregunta {currentQuestion + 1} de {questions.length}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
            />
          </div>
        </div>

        {/* Question */}
        <div className="px-5 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              {/* Test Title */}
              <div className="text-center">
                <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: "#8a3ffc" }} data-testid="text-razonamiento-title">
                  {title}
                </h2>
              </div>

              {/* Image if present */}
              {imageUrl && (
                <div className="flex justify-center">
                  <img 
                    src={imageUrl} 
                    alt={title}
                    style={{ width: `${imageSize}%`, maxWidth: '300px' }}
                    className="rounded-2xl shadow-lg"
                    data-testid="img-razonamiento"
                  />
                </div>
              )}

              {/* Pregunta - Tarjeta formal futurista */}
              <div 
                className="rounded-2xl p-6 border border-purple-100/50"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,245,255,0.9) 100%)",
                  boxShadow: "0 4px 20px rgba(138, 63, 252, 0.08), 0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <h3 className="text-lg font-semibold leading-relaxed text-center" style={{ color: "#1f2937" }}>
                  {currentQ?.question}
                </h3>
                {(currentQ as any)?.imageUrl && (
                  <div className="mt-4 flex justify-center">
                    <img 
                      src={(currentQ as any).imageUrl} 
                      alt="Imagen de la pregunta"
                      className="max-h-44 rounded-xl object-contain"
                      style={{ boxShadow: "0 4px 12px rgba(138, 63, 252, 0.12)" }}
                      data-testid={`img-question-${currentQuestion}`}
                    />
                  </div>
                )}
              </div>

            {/* Opciones - Tarjetas formales futuristas */}
            <div className="space-y-3">
              {currentQ?.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = questions[currentQuestion]?.correct === index;
                const showResult = selectedAnswer !== null;
                
                let bgStyle = "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)";
                let borderColor = "rgba(138, 63, 252, 0.15)";
                let textColor = "#374151";
                let shadowStyle = "0 2px 8px rgba(138, 63, 252, 0.06)";
                
                if (showResult && isCorrect) {
                  bgStyle = "linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)";
                  borderColor = "#10b981";
                  textColor = "#065f46";
                  shadowStyle = "0 4px 12px rgba(16, 185, 129, 0.15)";
                } else if (showResult && isSelected && !isCorrect) {
                  bgStyle = "linear-gradient(145deg, #fef2f2 0%, #fecaca 100%)";
                  borderColor = "#ef4444";
                  textColor = "#991b1b";
                  shadowStyle = "0 4px 12px rgba(239, 68, 68, 0.15)";
                } else if (isSelected) {
                  bgStyle = "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)";
                  borderColor = "#8a3ffc";
                  textColor = "#5b21b6";
                  shadowStyle = "0 4px 12px rgba(138, 63, 252, 0.2)";
                }
                
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`relative w-full text-left font-medium overflow-hidden transition-all py-4 px-5 rounded-xl ${
                      showResult && !isSelected && !isCorrect ? "opacity-40" : ""
                    }`}
                    style={{
                      background: bgStyle,
                      border: `2px solid ${borderColor}`,
                      color: textColor,
                      boxShadow: shadowStyle
                    }}
                    data-testid={`button-option-${index}`}
                  >
                    <span className="flex items-center gap-3">
                      <span 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
                        style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 text-base">{option}</span>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="w-6 h-6" style={{ color: "#10b981" }} />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-6 h-6" style={{ color: "#ef4444" }} />
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
        </div>
      </main>
      
      <BottomNavBar />
    </div>
  );
}
