import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Zap, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data, isLoading } = useQuery<{ content: CerebralContent | null }>({
    queryKey: [`/api/cerebral/${params.categoria}?tema=${params.tema}`],
  });

  const content = data?.content ? {
    ...data.content,
    exerciseData: safeParseJSON(data.content.exerciseData, { instruction: "", correctAnswer: "" }),
  } : null;

  const handleSubmit = () => {
    if (!content || !userAnswer.trim()) return;
    
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

  const renderBailarinaExercise = () => (
    <div className="space-y-4">
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
      <div className="flex gap-2 justify-center mt-4">
        {["izquierda", "derecha", "ambos"].map((option) => (
          <Button
            key={option}
            onClick={() => setUserAnswer(option)}
            variant={userAnswer === option ? "default" : "outline"}
            disabled={submitted}
            data-testid={`button-option-${option}`}
          >
            {option === "izquierda" ? "Izquierda" : option === "derecha" ? "Derecha" : "Ambos"}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderSecuenciaExercise = () => (
    <div className="space-y-4">
      <p className="text-white/80 text-center text-lg">Completa la secuencia:</p>
      <div className="text-center">
        <p className="text-3xl font-bold text-white mb-4">{content?.exerciseData.sequence}</p>
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
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Tu respuesta..."
          className="text-center text-xl"
          disabled={submitted}
          data-testid="input-sequence-answer"
        />
      </div>
    </div>
  );

  const renderGenericExercise = () => (
    <div className="space-y-4">
      <p className="text-white/80 text-center text-lg">{content?.exerciseData.instruction}</p>
      {content?.imageUrl && (
        <div className="flex justify-center">
          <img 
            src={content.imageUrl} 
            alt="Ejercicio"
            style={{ width: `${content.imageSize}%`, maxWidth: '300px' }}
            className="rounded-lg"
          />
        </div>
      )}
      <div className="max-w-xs mx-auto">
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Tu respuesta..."
          className="text-center text-xl"
          disabled={submitted}
          data-testid="input-generic-answer"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Skeleton className="h-10 w-48 bg-white/10" />
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(`/cerebral/seleccion`)}
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              {content.title || "Test Cerebral"}
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 rounded-xl p-6 border border-purple-500/30"
        >
          {content.exerciseType === "bailarina" && renderBailarinaExercise()}
          {content.exerciseType === "secuencia" && renderSecuenciaExercise()}
          {(content.exerciseType === "memoria" || content.exerciseType === "patron") && renderGenericExercise()}

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
                className="flex-1"
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
                  className="flex-1"
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
