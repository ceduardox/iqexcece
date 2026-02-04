import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Zap, CheckCircle, XCircle, ArrowRight, ChevronLeft, ChevronRight, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNavBar } from "@/components/BottomNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

interface AnswerOption {
  id: string;
  label: string;
  value: string;
  position: number;
}

interface CerebralContent {
  title: string;
  exerciseType: string;
  imageUrl?: string;
  imageSize?: number;
  exerciseData: any;
}

function safeParseJSON(data: any, fallback: any = {}): any {
  if (typeof data === "object" && data !== null) return data;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

export default function CerebralExercisePage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ categoria: string; tema: string }>();
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [memoriaPhase, setMemoriaPhase] = useState<'memorize' | 'recall'>('memorize');
  const [memoriaTimer, setMemoriaTimer] = useState(5);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [shouldRedirectToResults, setShouldRedirectToResults] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState<{ imageUrl: string; meaning: string } | null>(null);
  const [selectedLat, setSelectedLat] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ content: CerebralContent | null }>({
    queryKey: [`/api/cerebral/${params.categoria}?tema=${params.tema}`],
  });

  const content = data?.content ? {
    ...data.content,
    exerciseData: safeParseJSON(data.content.exerciseData, { instruction: "", correctAnswer: "", answerOptions: [] }),
  } : null;

  // Reset states when tema/categoria changes (navigating to next exercise)
  useEffect(() => {
    setSelectedPreference(null);
    setSelectedLat(null);
    setUserAnswer("");
    setSubmitted(false);
    setMemoriaPhase('memorize');
    setSelectedItems([]);
  }, [params.tema, params.categoria]);

  // Timer effect
  useEffect(() => {
    if (content?.exerciseData?.timerEnabled && !submitted) {
      setTimeLeft(content.exerciseData.timerSeconds || 30);
    }
  }, [content?.exerciseData?.timerEnabled, content?.exerciseData?.timerSeconds]);

  // Handle redirect to form (before results)
  useEffect(() => {
    if (shouldRedirectToResults) {
      setLocation(`/cerebral/formulario/${params.categoria}`);
    }
  }, [shouldRedirectToResults, params.categoria, setLocation]);

  // Check for lateralidad/preferencia results redirect when no more exercises
  useEffect(() => {
    if (!content && !isLoading) {
      const lateralidadAnswers = sessionStorage.getItem('lateralidadAnswers');
      const preferenciaAnswers = sessionStorage.getItem('preferenciaAnswers');
      if (lateralidadAnswers || preferenciaAnswers) {
        const latAnswers = lateralidadAnswers ? JSON.parse(lateralidadAnswers) : [];
        const prefAnswers = preferenciaAnswers ? JSON.parse(preferenciaAnswers) : [];
        if (latAnswers.length > 0 || prefAnswers.length > 0) {
          setShouldRedirectToResults(true);
        }
      }
    }
  }, [content, isLoading]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t && t <= 1) {
          handleNext(); // Auto-skip when time runs out
          return null;
        }
        return t ? t - 1 : null;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleSubmit = () => {
    if (!content) return;
    
    // Special handling for memoria
    if (content.exerciseType === 'memoria') {
      const correctItems = content.exerciseData.memoriaItems || [];
      const userItems = selectedItems;
      const isMatch = correctItems.length === userItems.length && 
        correctItems.every((item: string) => userItems.includes(item));
      setIsCorrect(isMatch);
      setSubmitted(true);
      return;
    }
    
    if (!userAnswer.trim()) return;
    const correctAnswer = content.exerciseData.correctAnswer?.toString().toLowerCase().trim();
    const userAnswerLower = userAnswer.toLowerCase().trim();
    
    setIsCorrect(userAnswerLower === correctAnswer);
    setSubmitted(true);
  };

  const handleNext = () => {
    const nextTema = parseInt(params.tema || "1") + 1;
    setLocation(`/cerebral/ejercicio/${params.categoria}/${nextTema}`);
    setUserAnswer("");
    setSubmitted(false);
  };

  const handleReset = () => {
    setUserAnswer("");
    setSubmitted(false);
  };

  // Get answer options from exerciseData - ONLY what's saved in database
  const getAnswerOptions = (): AnswerOption[] => {
    if (content?.exerciseData?.answerOptions && content.exerciseData.answerOptions.length > 0) {
      return content.exerciseData.answerOptions
        .filter((opt: AnswerOption) => opt.label && opt.value)
        .sort((a: AnswerOption, b: AnswerOption) => a.position - b.position);
    }
    return [];
  };

  const renderBailarinaExercise = () => {
    const options = getAnswerOptions();
    
    return (
      <div className="space-y-6">
        <p className="text-white/80 text-center text-lg">{content?.exerciseData.instruction}</p>
        {content?.imageUrl && (
          <div className="flex justify-center">
            <img 
              src={content.imageUrl} 
              alt="Ejercicio de bailarina"
              style={{ width: `${content.imageSize}%`, maxWidth: '300px' }}
              className="rounded-lg"
            />
          </div>
        )}
        
        {/* Modern Arrow Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          {options.map((option) => {
            const isSelected = userAnswer === option.value;
            const isLeftArrow = option.value.toLowerCase().includes("izquierda") || option.value.toLowerCase().includes("left");
            const isRightArrow = option.value.toLowerCase().includes("derecha") || option.value.toLowerCase().includes("right");
            const isBothArrow = option.value.toLowerCase().includes("ambos") || option.value.toLowerCase().includes("both");
            
            return (
              <button
                key={option.id}
                onClick={() => !submitted && setUserAnswer(option.value)}
                disabled={submitted}
                className={`
                  relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl
                  min-w-[100px] min-h-[100px] transition-colors overflow-visible
                  ${isSelected 
                    ? "bg-gradient-to-br from-purple-500 to-cyan-500 border border-purple-400 shadow-lg shadow-purple-500/40" 
                    : "bg-white/10 border border-white/20 hover-elevate"
                  }
                  ${submitted ? "opacity-60 cursor-not-allowed" : "cursor-pointer active-elevate-2"}
                `}
                data-testid={`button-option-${option.value}`}
              >
                {/* Arrow Icon */}
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full
                  ${isSelected ? "bg-white/20" : "bg-gradient-to-br from-purple-500/30 to-cyan-500/30"}
                `}>
                  {isLeftArrow && <ChevronLeft className="w-8 h-8 text-white" />}
                  {isRightArrow && <ChevronRight className="w-8 h-8 text-white" />}
                  {isBothArrow && (
                    <div className="flex">
                      <ChevronLeft className="w-6 h-6 text-white -mr-2" />
                      <ChevronRight className="w-6 h-6 text-white -ml-2" />
                    </div>
                  )}
                  {!isLeftArrow && !isRightArrow && !isBothArrow && (
                    <RotateCcw className="w-6 h-6 text-white" />
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-white/80"}`}>
                  {option.label}
                </span>
                
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSecuenciaExercise = () => {
    const options = content?.exerciseData?.sequenceOptions || [];
    return (
      <div className="space-y-3">
        <p className="text-gray-600 text-center text-sm">Completa la secuencia:</p>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800 mb-2">{content?.exerciseData.sequence}</p>
        </div>
        {content?.imageUrl && (
          <div className="flex justify-center">
            <img 
              src={content.imageUrl} 
              alt="Secuencia"
              style={{ width: `${content.imageSize}%`, maxWidth: '300px' }}
              className="rounded-lg"
            />
          </div>
        )}
        <div className="max-w-xs mx-auto">
          {options.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {options.map((opt: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (submitted) return;
                    setUserAnswer(opt);
                    // Save and auto-advance
                    const stored = sessionStorage.getItem('cerebralAnswers');
                    const answers = stored ? JSON.parse(stored) : [];
                    answers.push({ tema: params.tema, type: 'secuencia', answer: opt, correct: content?.exerciseData?.correctAnswer });
                    sessionStorage.setItem('cerebralAnswers', JSON.stringify(answers));
                    setTimeout(() => handleNext(), 500);
                  }}
                  disabled={submitted}
                  className={`p-2 rounded-lg text-sm font-bold transition-colors ${
                    userAnswer === opt 
                      ? 'bg-purple-600 text-white border-2 border-purple-400' 
                      : 'bg-purple-50 text-gray-700 border border-purple-200 hover-elevate'
                  } ${submitted ? 'opacity-60' : ''}`}
                  data-testid={`button-sequence-option-${idx}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Tu respuesta..."
                className="text-center text-xl bg-purple-50 border-purple-200 text-gray-800 placeholder:text-gray-400"
                disabled={submitted}
                data-testid="input-sequence-answer"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    const stored = sessionStorage.getItem('cerebralAnswers');
                    const answers = stored ? JSON.parse(stored) : [];
                    answers.push({ tema: params.tema, type: 'secuencia', answer: userAnswer, correct: content?.exerciseData?.correctAnswer });
                    sessionStorage.setItem('cerebralAnswers', JSON.stringify(answers));
                    setTimeout(() => handleNext(), 500);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Memoria timer effect
  useEffect(() => {
    if (content?.exerciseType !== 'memoria' || memoriaPhase !== 'memorize') return;
    const time = content?.exerciseData?.memorizeTime || 5;
    setMemoriaTimer(time);
    const interval = setInterval(() => {
      setMemoriaTimer(t => {
        if (t <= 1) {
          setMemoriaPhase('recall');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [content?.exerciseType, content?.exerciseData?.memorizeTime]);

  const renderMemoriaExercise = () => {
    const items = content?.exerciseData?.memoriaItems || [];
    const allOptions = content?.exerciseData?.memoriaOptions || items;
    
    if (memoriaPhase === 'memorize') {
      return (
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-lg">Memoriza: {memoriaTimer}s</span>
          </div>
          <p className="text-gray-500 text-sm">Recuerda estos elementos</p>
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {items.map((item: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="aspect-square bg-purple-50 rounded-xl flex items-center justify-center text-2xl border border-purple-200 text-gray-800"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 text-center">
        <p className="text-gray-600 text-sm">¿Cuáles viste? Selecciona y confirma:</p>
        <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
          {allOptions.map((item: string, idx: number) => {
            const isSelected = selectedItems.includes(item);
            return (
              <button
                key={idx}
                onClick={() => {
                  if (submitted) return;
                  const newSelected = isSelected 
                    ? selectedItems.filter(i => i !== item) 
                    : [...selectedItems, item];
                  setSelectedItems(newSelected);
                  setUserAnswer(newSelected.join(','));
                }}
                disabled={submitted}
                className={`aspect-square rounded-lg text-xl flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-purple-600 text-white border-2 border-purple-400' 
                    : 'bg-purple-50 text-gray-700 border border-purple-200 hover-elevate'
                } ${submitted ? 'opacity-60' : ''}`}
              >
                {item}
              </button>
            );
          })}
        </div>
        {selectedItems.length > 0 && (
          <button
            onClick={() => {
              const stored = sessionStorage.getItem('cerebralAnswers');
              const answers = stored ? JSON.parse(stored) : [];
              const correctItems = content?.exerciseData?.memoriaItems || [];
              answers.push({ 
                tema: params.tema, 
                type: 'memoria', 
                answer: selectedItems.join(','), 
                correct: correctItems.join(',') 
              });
              sessionStorage.setItem('cerebralAnswers', JSON.stringify(answers));
              setTimeout(() => handleNext(), 500);
            }}
            className="mt-4 px-8 py-3 rounded-xl text-white font-bold"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)" }}
          >
            Continuar
          </button>
        )}
      </div>
    );
  };

  const renderPatronExercise = () => {
    const sequence = content?.exerciseData?.patronSequence || [];
    const options = content?.exerciseData?.patronOptions || [];
    
    return (
      <div className="space-y-4">
        <p className="text-gray-600 text-center text-sm">¿Qué sigue en el patrón?</p>
        
        {/* Pattern sequence display */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {sequence.map((item: string, idx: number) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                item === '?' 
                  ? 'bg-purple-100 border-2 border-dashed border-purple-400 text-purple-600' 
                  : 'bg-purple-50 border border-purple-200 text-gray-800'
              }`}
            >
              {item}
            </motion.div>
          ))}
        </div>

        {/* Image if provided */}
        {content?.imageUrl && (
          <div className="flex justify-center">
            <img 
              src={content.imageUrl} 
              alt="Patrón"
              style={{ width: `${content.imageSize}%`, maxWidth: '200px' }}
              className="rounded-lg"
            />
          </div>
        )}

        {/* Options */}
        <div className="max-w-xs mx-auto">
          {options.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {options.map((opt: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (submitted) return;
                    setUserAnswer(opt);
                    // Save and auto-advance
                    const stored = sessionStorage.getItem('cerebralAnswers');
                    const answers = stored ? JSON.parse(stored) : [];
                    answers.push({ tema: params.tema, type: 'patron', answer: opt, correct: content?.exerciseData?.correctAnswer });
                    sessionStorage.setItem('cerebralAnswers', JSON.stringify(answers));
                    setTimeout(() => handleNext(), 500);
                  }}
                  disabled={submitted}
                  className={`p-3 rounded-lg text-xl flex items-center justify-center transition-colors ${
                    userAnswer === opt 
                      ? 'bg-purple-600 text-white border-2 border-purple-400' 
                      : 'bg-purple-50 text-gray-700 border border-purple-200 hover-elevate'
                  } ${submitted ? 'opacity-60' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Tu respuesta..."
              className="text-center text-xl bg-purple-50 border-purple-200 text-gray-800 placeholder:text-gray-400"
              disabled={submitted}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && userAnswer.trim()) {
                  const stored = sessionStorage.getItem('cerebralAnswers');
                  const answers = stored ? JSON.parse(stored) : [];
                  answers.push({ tema: params.tema, type: 'patron', answer: userAnswer, correct: content?.exerciseData?.correctAnswer });
                  sessionStorage.setItem('cerebralAnswers', JSON.stringify(answers));
                  setTimeout(() => handleNext(), 500);
                }
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const renderStroopExercise = () => {
    const word = content?.exerciseData?.stroopWord || "";
    const color = content?.exerciseData?.stroopColor || "red";
    const options = content?.exerciseData?.stroopOptions || [];
    
    return (
      <div className="space-y-6">
        {/* Instruction */}
        <p className="text-gray-600 text-center text-sm">
          Escoge el <span className="text-cyan-600 font-bold">COLOR</span>, no la palabra.
        </p>

        {/* Word display with color */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center py-6"
        >
          <span 
            className="text-4xl font-black"
            style={{ color: color }}
          >
            {word}
          </span>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          {options.map((opt: string, idx: number) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                if (submitted) return;
                setUserAnswer(opt);
                // Save and auto-advance
                const stored = sessionStorage.getItem('cerebralAnswers');
                const answers = stored ? JSON.parse(stored) : [];
                answers.push({ tema: params.tema, type: 'stroop', answer: opt, correct: content?.exerciseData?.correctAnswer });
                sessionStorage.setItem('cerebralAnswers', JSON.stringify(answers));
                setTimeout(() => handleNext(), 500);
              }}
              disabled={submitted}
              className={`py-4 px-6 rounded-xl text-lg font-semibold border-2 transition-colors ${
                userAnswer === opt 
                  ? 'bg-purple-600 border-purple-400 text-white' 
                  : 'bg-white border-gray-200 text-gray-800 hover-elevate'
              } ${submitted ? 'opacity-60' : ''}`}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  const renderPreferenciaExercise = () => {
    const options = content?.exerciseData?.prefOptions || [];
    const title1 = content?.exerciseData?.prefTitle1 || "De los siguientes dibujos";
    const title2 = content?.exerciseData?.prefTitle2 || "¿cuál te atrae más?";
    const isOdd = options.length % 2 !== 0;
    
    return (
      <div className="space-y-6">
        {/* Instruction - editable from admin */}
        <div className="text-center space-y-1">
          <p className="text-gray-600 text-lg">{title1}</p>
          <p className="text-gray-800 font-semibold text-xl">{title2}</p>
        </div>

        {/* Main header image if provided */}
        {content?.imageUrl && (
          <div className="flex justify-center">
            <img 
              src={content.imageUrl} 
              alt="Imagen del ejercicio"
              style={{ width: `${content.imageSize}%`, maxWidth: '300px' }}
              className="rounded-lg"
            />
          </div>
        )}

        {/* Image options - center last item if odd count */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt: { imageUrl: string; meaning: string }, idx: number) => {
            const isLastOdd = isOdd && idx === options.length - 1;
            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  if (!selectedPreference) {
                    setSelectedPreference(opt);
                    setUserAnswer(opt.meaning);
                    // Save answer to sessionStorage for final results
                    const stored = sessionStorage.getItem('preferenciaAnswers');
                    const answers = stored ? JSON.parse(stored) : [];
                    answers.push({ 
                      tema: params.tema,
                      imageUrl: opt.imageUrl, 
                      meaning: opt.meaning 
                    });
                    sessionStorage.setItem('preferenciaAnswers', JSON.stringify(answers));
                    // Auto-advance immediately after selection
                    setTimeout(() => {
                      handleNext();
                    }, 400);
                  }
                }}
                disabled={!!selectedPreference}
                className={`aspect-square p-4 rounded-xl border-2 transition-all flex items-center justify-center bg-white ${
                  isLastOdd ? 'col-span-2 mx-auto w-1/2' : ''
                } ${
                  selectedPreference?.imageUrl === opt.imageUrl 
                    ? 'border-purple-500 ring-2 ring-purple-400' 
                    : 'border-gray-200 hover-elevate'
                } ${selectedPreference && selectedPreference.imageUrl !== opt.imageUrl ? 'opacity-40' : ''}`}
              >
                {opt.imageUrl ? (
                  <img src={opt.imageUrl} alt={`Opción ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-gray-400">Imagen {idx + 1}</span>
                )}
              </motion.button>
            );
          })}
        </div>

      </div>
    );
  };

  const renderLateralidadExercise = () => {
    const instruction = content?.exerciseData?.latInstruction || "Coloca una mano sobre tu cabeza.";
    const question = content?.exerciseData?.latQuestion || "¿Qué mano has utilizado?";
    const leftOption = content?.exerciseData?.latLeft || "Izquierda";
    const rightOption = content?.exerciseData?.latRight || "Derecha";

    return (
      <div className="space-y-8">
        {/* Instruction */}
        <div className="text-center">
          <p className="text-gray-600 text-lg">{instruction}</p>
        </div>

        {/* Question */}
        <div className="text-center">
          <p className="text-gray-800 font-bold text-xl">{question}</p>
        </div>

        {/* Options */}
        <div className="flex gap-4 justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!selectedLat) {
                setSelectedLat(leftOption);
                setUserAnswer(leftOption);
                // Save answer to sessionStorage
                const stored = sessionStorage.getItem('lateralidadAnswers');
                const answers = stored ? JSON.parse(stored) : [];
                answers.push(leftOption);
                sessionStorage.setItem('lateralidadAnswers', JSON.stringify(answers));
                // Auto-advance after selection
                setTimeout(() => {
                  handleNext();
                }, 600);
              }
            }}
            disabled={!!selectedLat}
            className={`px-10 py-4 rounded-2xl border-2 text-lg font-semibold transition-all ${
              selectedLat === leftOption
                ? 'border-purple-400 text-white shadow-lg shadow-purple-500/30'
                : 'border-purple-200 text-gray-700 hover-elevate'
            } ${selectedLat && selectedLat !== leftOption ? 'opacity-30' : ''}`}
            style={selectedLat === leftOption ? { background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)" } : { background: "rgba(245, 243, 255, 1)" }}
          >
            {leftOption}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!selectedLat) {
                setSelectedLat(rightOption);
                setUserAnswer(rightOption);
                // Save answer to sessionStorage
                const stored = sessionStorage.getItem('lateralidadAnswers');
                const answers = stored ? JSON.parse(stored) : [];
                answers.push(rightOption);
                sessionStorage.setItem('lateralidadAnswers', JSON.stringify(answers));
                // Auto-advance after selection
                setTimeout(() => {
                  handleNext();
                }, 600);
              }
            }}
            disabled={!!selectedLat}
            className={`px-10 py-4 rounded-2xl border-2 text-lg font-semibold transition-all ${
              selectedLat === rightOption
                ? 'border-cyan-400 text-white shadow-lg shadow-cyan-500/30'
                : 'border-cyan-200 text-gray-700 hover-elevate'
            } ${selectedLat && selectedLat !== rightOption ? 'opacity-30' : ''}`}
            style={selectedLat === rightOption ? { background: "linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)" } : { background: "rgba(236, 254, 255, 1)" }}
          >
            {rightOption}
          </motion.button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Skeleton className="h-16 w-full bg-purple-100" />
          <Skeleton className="h-64 w-full rounded-xl bg-purple-50" />
        </div>
      </div>
    );
  }

  if (shouldRedirectToResults) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Calculando resultados...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4">
        <div className="max-w-md mx-auto text-center py-12">
          <Zap className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 text-lg">Ejercicio no encontrado.</p>
          <Button
            onClick={() => setLocation(`/cerebral/seleccion`)}
            className="mt-4"
            data-testid="button-back-selection"
          >
            Volver a selección
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    playButtonSound();
    setLocation(`/cerebral/seleccion`);
  };

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
            
            <div className="w-10" />
          </div>
        </div>
      </header>
      
      <div className="w-full sticky z-40" style={{ top: 56, marginTop: -4, marginBottom: -20 }}>
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
                  Test Cerebral
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-xl font-bold"
                  style={{ color: "#1f2937" }}
                >
                  {content.title}
                </motion.h1>
              </div>
              {timeLeft !== null && (
                <div className={`flex items-center gap-1 px-3 py-2 rounded-full ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{timeLeft}s</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {timeLeft !== null && content?.exerciseData?.timerEnabled && (
          <div className="px-5 mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-cyan-400'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / (content?.exerciseData?.timerSeconds || 30)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Exercise Content */}
        <div className="px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 shadow-xl border border-purple-100"
            style={{
              background: "linear-gradient(180deg, rgba(237, 233, 254, 0.6) 0%, rgba(255, 255, 255, 0.95) 100%)",
              boxShadow: "0 8px 32px rgba(124, 58, 237, 0.15)"
            }}
          >
            {content.exerciseType === "bailarina" && renderBailarinaExercise()}
            {content.exerciseType === "secuencia" && renderSecuenciaExercise()}
            {content.exerciseType === "memoria" && renderMemoriaExercise()}
            {content.exerciseType === "patron" && renderPatronExercise()}
            {content.exerciseType === "stroop" && renderStroopExercise()}
            {content.exerciseType === "preferencia" && renderPreferenciaExercise()}
            {content.exerciseType === "lateralidad" && renderLateralidadExercise()}

            {/* No verification feedback - answers saved and shown only in final results */}
          </motion.div>
        </div>
      </main>
      
      <BottomNavBar />
    </div>
  );
}
