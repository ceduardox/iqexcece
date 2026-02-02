import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useUserData } from "@/lib/user-context";
import { ArrowLeft, Brain, CheckCircle2, XCircle, User, Mail, Calendar, MapPin, Phone, MessageSquare, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";
import menuCurveImg from "@assets/menu_1769957804819.png";

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

const categoryLabels: Record<string, string> = {
  preescolar: "Pre escolar",
  ninos: "Niños",
  adolescentes: "Adolescentes",
  universitarios: "Adolescentes",
  profesionales: "Profesionales",
  adulto_mayor: "Adulto Mayor",
};

export default function RazonamientoQuizPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ category?: string; tema?: string }>();
  const { userData, setUserData } = useUserData();
  
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

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/razonamiento/${categoria}?tema=${tema}`);
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
  }, [categoria, tema]);

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

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) return;
    setSubmitting(true);
    
    try {
      const isPwa = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone === true;
      
      await fetch("/api/quiz-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email || null,
          edad: formData.edad || null,
          ciudad: formData.ciudad || null,
          telefono: formData.telefono || null,
          comentario: formData.comentario || null,
          categoria: categoria,
          nivelEducativo: formData.nivelEducativo || null,
          tiempoLectura: null,
          tiempoCuestionario: quizTime,
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

  const categoryLabel = categoryLabels[categoria] || "Niños";
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
    const isNinos = categoria === "ninos" || categoria === "preescolar";
    const isAdolescentes = categoria === "adolescentes";
    
    const gradosPrimaria = ["1ero Primaria", "2do Primaria", "3ero Primaria", "4to Primaria", "5to Primaria", "6to Primaria"];
    const gradosSecundaria = ["1ero Secundaria", "2do Secundaria", "3ero Secundaria", "4to Secundaria", "5to Secundaria", "6to Secundaria", "Universitario"];
    
    return (
      <div 
        className="min-h-screen flex flex-col"
        style={{ background: "linear-gradient(180deg, #e8def8 0%, #f3e8ff 50%, #ffffff 100%)" }}
      >
        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex flex-col items-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2a9 9 0 0 1 9 9c0 3.5-2 6.5-5 8v2a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2c-3-1.5-5-4.5-5-8a9 9 0 0 1 9-9z"/>
                <path d="M9 22h6"/>
                <path d="M12 6v4"/>
                <path d="M8 10h8"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">{title}</h1>
            <p className="text-sm text-gray-500 text-center">Completa tus datos para ver tu resultado y recomendaciones.</p>
          </div>

          <div 
            className="rounded-2xl p-5 space-y-4"
            style={{ backgroundColor: "rgba(255,255,255,0.7)", boxShadow: "0 4px 20px rgba(139, 92, 246, 0.1)" }}
          >
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={(e) => setFormData(p => ({ ...p, nombre: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ backgroundColor: "#f8f5ff" }}
                data-testid="input-nombre"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <input
                type="email"
                placeholder="nombre@email.com"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ backgroundColor: "#f8f5ff" }}
                data-testid="input-email"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-base">🇧🇴</span>
              </div>
              <input
                type="tel"
                placeholder="+591 Ej: 71234567"
                value={formData.telefono}
                onChange={(e) => setFormData(p => ({ ...p, telefono: e.target.value }))}
                className="w-full pl-10 pr-10 py-3 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ backgroundColor: "#f8f5ff" }}
                data-testid="input-telefono"
              />
              {formData.telefono.length > 5 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="number"
                placeholder="Ej: 15"
                value={formData.edad}
                onChange={(e) => setFormData(p => ({ ...p, edad: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ backgroundColor: "#f8f5ff" }}
                data-testid="input-edad"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Ej: La Paz"
                value={formData.ciudad}
                onChange={(e) => setFormData(p => ({ ...p, ciudad: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ backgroundColor: "#f8f5ff" }}
                data-testid="input-ciudad"
              />
            </div>
          </div>

          {(isNinos || isAdolescentes) && (
            <div 
              className="rounded-2xl p-5 mt-4 space-y-3"
              style={{ backgroundColor: "rgba(255,255,255,0.7)", boxShadow: "0 4px 20px rgba(139, 92, 246, 0.1)" }}
            >
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Perfil educativo</p>
                <p className="text-xs text-gray-500 mb-3">Ajusta la dificultad del test</p>
              </div>
              
              <select
                value={formData.grado}
                onChange={(e) => setFormData(p => ({ ...p, grado: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none bg-no-repeat"
                style={{ 
                  backgroundColor: "#f8f5ff",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
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
            style={{ backgroundColor: "rgba(255,255,255,0.7)", boxShadow: "0 4px 20px rgba(139, 92, 246, 0.1)" }}
          >
            <p className="text-sm text-gray-700 mb-2">Comentario <span className="text-gray-400">(opcional)</span></p>
            <textarea
              placeholder="Mensaje adicional..."
              value={formData.comentario}
              onChange={(e) => setFormData(p => ({ ...p, comentario: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              style={{ backgroundColor: "#f8f5ff", minHeight: "60px" }}
              data-testid="input-comentario"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting || !formData.nombre.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-bold shadow-lg disabled:opacity-50 mt-6"
            style={{ background: "linear-gradient(90deg, #a78bfa 0%, #7c3aed 50%, #06b6d4 100%)" }}
            data-testid="button-submit-results"
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
      <CurvedHeader showBack onBack={handleBack} />
      
      <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
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
