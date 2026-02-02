import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useUserData } from "@/lib/user-context";
import { ArrowLeft, Brain, CheckCircle2, XCircle, User, Mail, Calendar, MapPin, Phone, MessageSquare, Clock } from "lucide-react";
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
  universitarios: "Universitarios",
  profesionales: "Profesionales",
  adulto_mayor: "Adulto Mayor",
};

const optionColors = [
  { bg: "bg-gradient-to-r from-purple-500 to-purple-600", ring: "ring-purple-300" },
  { bg: "bg-gradient-to-r from-cyan-500 to-cyan-600", ring: "ring-cyan-300" },
  { bg: "bg-gradient-to-r from-teal-500 to-teal-600", ring: "ring-teal-300" },
  { bg: "bg-gradient-to-r from-indigo-500 to-indigo-600", ring: "ring-indigo-300" },
  { bg: "bg-gradient-to-r from-pink-500 to-pink-600", ring: "ring-pink-300" },
];

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
    telefono: "",
    comentario: "",
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
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex flex-col"
      >
        <div className="p-4">
          <motion.button
            onClick={handleBack}
            className="flex items-center gap-2 text-white font-semibold text-lg"
            whileTap={{ scale: 0.95 }}
            data-testid="button-back-form"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Resultados</span>
          </motion.button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="text-center mb-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-800"
              >
                {title}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 mt-2"
              >
                Completa tus datos para ver tus resultados
              </motion.p>
            </div>

            <div className="space-y-3">
              {[
                { icon: User, placeholder: "Tu nombre *", key: "nombre", type: "text", delay: 0.1 },
                { icon: Mail, placeholder: "Correo electrónico", key: "email", type: "email", delay: 0.15 },
                { icon: Calendar, placeholder: "Edad", key: "edad", type: "text", delay: 0.2 },
                { icon: MapPin, placeholder: "Ciudad", key: "ciudad", type: "text", delay: 0.25 },
                { icon: Phone, placeholder: "Teléfono", key: "telefono", type: "tel", delay: 0.3 },
              ].map(({ icon: Icon, placeholder, key, type, delay }) => (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay }}
                  className="relative"
                >
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                  <Input
                    type={type}
                    placeholder={placeholder}
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData(p => ({ ...p, [key]: e.target.value }))}
                    className="pl-10 border-2 border-gray-200 focus:border-cyan-400 bg-gray-50 rounded-xl h-12 transition-all text-gray-800 placeholder:text-gray-400"
                    data-testid={`input-${key}`}
                  />
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="relative"
              >
                <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-cyan-500" />
                <textarea
                  placeholder="Comentario (opcional)"
                  value={formData.comentario}
                  onChange={(e) => setFormData(p => ({ ...p, comentario: e.target.value }))}
                  rows={2}
                  className="w-full pl-10 p-3 rounded-xl border-2 border-gray-200 focus:border-cyan-400 bg-gray-50 resize-none text-sm transition-all outline-none text-gray-800 placeholder:text-gray-400"
                  data-testid="input-comentario"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={submitting || !formData.nombre.trim()}
                size="lg"
                className="w-full mt-5 bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 text-white font-bold shadow-lg hover:shadow-xl transition-shadow"
                data-testid="button-submit-results"
              >
                {submitting ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    Enviando...
                  </motion.span>
                ) : (
                  "Ver mis resultados"
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
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

              <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 rounded-2xl p-5 shadow-lg">
                <h3 className="text-lg font-bold text-white leading-relaxed">
                  {currentQ?.question}
                </h3>
              </div>

            <div className="space-y-3">
              {currentQ?.options.map((option, index) => {
                const color = optionColors[index % optionColors.length];
                const isSelected = selectedAnswer === index;
                const isCorrect = questions[currentQuestion]?.correct === index;
                
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`relative w-full text-left font-bold text-white overflow-hidden transition-all py-4 px-5 rounded-xl ${color.bg} ${
                      isSelected ? `ring-4 ${color.ring} ring-offset-2` : ""
                    } ${selectedAnswer !== null && !isSelected ? "opacity-50" : ""}`}
                    data-testid={`button-option-${index}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {selectedAnswer !== null && isCorrect && (
                        <CheckCircle2 className="w-6 h-6 text-green-300" />
                      )}
                      {selectedAnswer !== null && isSelected && !isCorrect && (
                        <XCircle className="w-6 h-6 text-red-300" />
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
