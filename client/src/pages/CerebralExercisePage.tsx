import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Zap, CheckCircle, XCircle, ArrowRight, ChevronLeft, ChevronRight, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data, isLoading } = useQuery<{ content: CerebralContent | null }>({
    queryKey: [`/api/cerebral/${params.categoria}?tema=${params.tema}`],
  });

  const content = data?.content ? {
    ...data.content,
    exerciseData: safeParseJSON(data.content.exerciseData, { instruction: "", correctAnswer: "", answerOptions: [] }),
  } : null;

  // Timer effect
  useEffect(() => {
    if (content?.exerciseData?.timerEnabled && !submitted) {
      setTimeLeft(content.exerciseData.timerSeconds || 30);
    }
  }, [content?.exerciseData?.timerEnabled, content?.exerciseData?.timerSeconds]);

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
        <p className="text-white/80 text-center text-sm">Completa la secuencia:</p>
        <div className="text-center">
          <p className="text-xl font-bold text-white mb-2">{content?.exerciseData.sequence}</p>
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
                  onClick={() => !submitted && setUserAnswer(opt)}
                  disabled={submitted}
                  className={`p-2 rounded-lg text-sm font-bold transition-colors ${
                    userAnswer === opt 
                      ? 'bg-purple-600 text-white border-2 border-purple-400' 
                      : 'bg-white/10 text-white border border-white/20 hover-elevate'
                  } ${submitted ? 'opacity-60' : ''}`}
                  data-testid={`button-sequence-option-${idx}`}
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
              className="text-center text-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              disabled={submitted}
              data-testid="input-sequence-answer"
            />
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
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-lg">Memoriza: {memoriaTimer}s</span>
          </div>
          <p className="text-white/60 text-sm">Recuerda estos elementos</p>
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {items.map((item: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="aspect-square bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center text-2xl border border-white/20"
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
        <p className="text-white/80 text-sm">¿Cuáles viste? Selecciona:</p>
        <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
          {allOptions.map((item: string, idx: number) => {
            const isSelected = selectedItems.includes(item);
            return (
              <button
                key={idx}
                onClick={() => {
                  if (submitted) return;
                  setSelectedItems(prev => 
                    isSelected ? prev.filter(i => i !== item) : [...prev, item]
                  );
                  setUserAnswer(isSelected 
                    ? selectedItems.filter(i => i !== item).join(',')
                    : [...selectedItems, item].join(',')
                  );
                }}
                disabled={submitted}
                className={`aspect-square rounded-lg text-xl flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-purple-600 border-2 border-purple-400' 
                    : 'bg-white/10 border border-white/20 hover-elevate'
                } ${submitted ? 'opacity-60' : ''}`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPatronExercise = () => {
    const sequence = content?.exerciseData?.patronSequence || [];
    const options = content?.exerciseData?.patronOptions || [];
    
    return (
      <div className="space-y-4">
        <p className="text-white/80 text-center text-sm">¿Qué sigue en el patrón?</p>
        
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
                  ? 'bg-purple-600/50 border-2 border-dashed border-purple-400 text-purple-300' 
                  : 'bg-white/10 border border-white/20'
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
                  onClick={() => !submitted && setUserAnswer(opt)}
                  disabled={submitted}
                  className={`p-3 rounded-lg text-xl flex items-center justify-center transition-colors ${
                    userAnswer === opt 
                      ? 'bg-purple-600 border-2 border-purple-400' 
                      : 'bg-white/10 border border-white/20 hover-elevate'
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
              className="text-center text-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              disabled={submitted}
            />
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Skeleton className="h-16 w-full bg-white/10" />
          <Skeleton className="h-64 w-full rounded-xl bg-white/10" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4">
      <div className="max-w-md mx-auto">
        {/* Styled Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* Back Button - Modern Design */}
          <Button
            onClick={() => setLocation(`/cerebral/seleccion`)}
            variant="ghost"
            className="mb-4 text-white/70"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          {/* TEST CEREBRAL Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600/40 to-cyan-600/40 p-4 border border-white/10">
            {/* Background X Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-white">
                X
              </div>
            </div>
            
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    TEST CEREBRAL
                  </h1>
                  <p className="text-white/60 text-xs mt-0.5">{content.title}</p>
                </div>
              </div>
              {timeLeft !== null && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${timeLeft <= 10 ? 'bg-red-500/30 text-red-300' : 'bg-white/10 text-white/80'}`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{timeLeft}s</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Exercise Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 rounded-xl p-6 border border-purple-500/30"
        >
          {content.exerciseType === "bailarina" && renderBailarinaExercise()}
          {content.exerciseType === "secuencia" && renderSecuenciaExercise()}
          {content.exerciseType === "memoria" && renderMemoriaExercise()}
          {content.exerciseType === "patron" && renderPatronExercise()}

          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                  isCorrect ? "bg-green-600/20 border border-green-500/30" : "bg-red-600/20 border border-red-500/30"
                }`}
              >
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
                <div>
                  <p className={`font-semibold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                    {isCorrect ? "¡Correcto!" : "Incorrecto"}
                  </p>
                  {!isCorrect && (
                    <p className="text-white/60 text-sm">
                      La respuesta correcta era: {content.exerciseData.correctAnswer}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex gap-3">
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 border border-purple-500"
                data-testid="button-submit"
              >
                Verificar respuesta
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setLocation(`/cerebral/seleccion`)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-more-exercises"
                >
                  Más ejercicios
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 border border-purple-500"
                  data-testid="button-next"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
