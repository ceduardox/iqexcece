import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain, Check, Gauge } from "lucide-react";

export interface CognitiveSurveyAnswer {
  questionId: string;
  question: string;
  answerId: string;
  answer: string;
  score: number;
}

export interface CognitiveSurveyResult {
  answers: CognitiveSurveyAnswer[];
  score: number;
  profile: string;
  mainNeed: string;
  interestLevel: string;
}

interface SurveyOption {
  id: string;
  label: string;
  helper?: string;
  score: number;
}

interface SurveyQuestion {
  id: string;
  title: string;
  subtitle?: string;
  options: SurveyOption[];
}

interface Props {
  categoria: string;
  testType?: string;
  onSubmit: (result: CognitiveSurveyResult) => void;
  submitting?: boolean;
}

const baseQuestion6: SurveyQuestion = {
  id: "interest",
  title: "Si existiera un metodo cientifico para optimizar tu rendimiento mental, te interesaria conocerlo?",
  subtitle: "Esto nos ayuda a mostrar una recomendacion mas util para ti.",
  options: [
    { id: "yes", label: "Si, quiero informacion", helper: "Me interesa mejorar con un metodo guiado.", score: 3 },
    { id: "later", label: "Tal vez mas adelante", helper: "Quiero verlo con calma.", score: 2 },
    { id: "no", label: "No por ahora", helper: "Solo quiero ver mi resultado.", score: 1 },
  ],
};

const kidsQuestion6: SurveyQuestion = {
  id: "interest",
  title: "Te gustaria conocer una forma divertida para entrenar tu mente?",
  subtitle: "Esto nos ayuda a mostrar una recomendacion mas util para ti.",
  options: [
    { id: "yes", label: "🌟 Si, quiero saber mas", helper: "Quiero mejorar con juegos y ejercicios.", score: 3 },
    { id: "later", label: "🙂 Tal vez despues", helper: "Quiero verlo con calma.", score: 2 },
    { id: "no", label: "🙈 No por ahora", helper: "Solo quiero ver mi resultado.", score: 1 },
  ],
};

const surveyByCategory: Record<string, SurveyQuestion[]> = {
  preescolar: [
    {
      id: "reading_understanding",
      title: "Cuando lee o escucha un texto...",
      options: [
        { id: "understands", label: "😊 Entiende casi todo", score: 3 },
        { id: "partial", label: "😐 Entiende algunas cosas", score: 2 },
        { id: "confused", label: "😕 Se confunde rapido", score: 1 },
      ],
    },
    {
      id: "attention",
      title: "Se distrae cuando hace tareas?",
      options: [
        { id: "rarely", label: "🟢 Casi nunca", score: 3 },
        { id: "sometimes", label: "🟡 A veces", score: 2 },
        { id: "often", label: "🔴 Muchas veces", score: 1 },
      ],
    },
    {
      id: "help_response",
      title: "Cuando no entiende algo...",
      options: [
        { id: "asks", label: "🤔 Pide ayuda", score: 3 },
        { id: "continues", label: "⏭️ Sigue intentando", score: 2 },
        { id: "frustrated", label: "😣 Se cansa o se enoja", score: 1 },
      ],
    },
    {
      id: "reading_speed",
      title: "Su ritmo al leer o aprender es...",
      options: [
        { id: "fast", label: "🚀 Rapido", score: 3 },
        { id: "normal", label: "🚶 Normal", score: 2 },
        { id: "slow", label: "🐢 Lento", score: 1 },
      ],
    },
    {
      id: "recall",
      title: "Despues de leer puede contar lo que entendio?",
      options: [
        { id: "yes", label: "👍 Si", score: 3 },
        { id: "sometimes", label: "🤷 A veces", score: 2 },
        { id: "little", label: "👎 No mucho", score: 1 },
      ],
    },
    kidsQuestion6,
  ],
  ninos: [
    {
      id: "reading_understanding",
      title: "Cuando leo un texto...",
      options: [
        { id: "understands", label: "😊 Entiendo casi todo", score: 3 },
        { id: "partial", label: "😐 Entiendo algunas cosas", score: 2 },
        { id: "confused", label: "😕 Me confundo rapido", score: 1 },
      ],
    },
    {
      id: "attention",
      title: "Me distraigo cuando hago tareas",
      options: [
        { id: "rarely", label: "🟢 Casi nunca", score: 3 },
        { id: "sometimes", label: "🟡 A veces", score: 2 },
        { id: "often", label: "🔴 Muchas veces", score: 1 },
      ],
    },
    {
      id: "help_response",
      title: "Cuando no entiendo algo...",
      options: [
        { id: "asks", label: "🤔 Pido ayuda", score: 3 },
        { id: "continues", label: "⏭️ Sigo leyendo", score: 2 },
        { id: "frustrated", label: "😣 Me enojo o me canso", score: 1 },
      ],
    },
    {
      id: "reading_speed",
      title: "Mi velocidad al leer es...",
      options: [
        { id: "fast", label: "🚀 Rapida", score: 3 },
        { id: "normal", label: "🚶 Normal", score: 2 },
        { id: "slow", label: "🐢 Lenta", score: 1 },
      ],
    },
    {
      id: "recall",
      title: "Despues de leer puedo contar lo que entendi",
      options: [
        { id: "yes", label: "👍 Si", score: 3 },
        { id: "sometimes", label: "🤷 A veces", score: 2 },
        { id: "little", label: "👎 No mucho", score: 1 },
      ],
    },
    kidsQuestion6,
  ],
  adolescentes: [
    {
      id: "main_difficulty",
      title: "Mi principal dificultad al estudiar es...",
      options: [
        { id: "concentration", label: "Concentracion", score: 1 },
        { id: "comprehension", label: "Comprension", score: 1 },
        { id: "memory", label: "Memoria", score: 1 },
        { id: "organization", label: "Organizacion", score: 2 },
      ],
    },
    {
      id: "long_texts",
      title: "Al leer textos largos...",
      options: [
        { id: "tired", label: "Me canso rapido", score: 1 },
        { id: "dont_retain", label: "No retengo", score: 1 },
        { id: "reread", label: "Debo releer", score: 2 },
        { id: "comfortable", label: "Me siento comodo", score: 3 },
      ],
    },
    {
      id: "distraction",
      title: "Me distraigo con celular, ruido o interrupciones...",
      options: [
        { id: "often", label: "Muy seguido", score: 1 },
        { id: "sometimes", label: "A veces", score: 2 },
        { id: "rarely", label: "Casi nunca", score: 3 },
      ],
    },
    {
      id: "study_method",
      title: "Mi forma de estudiar es...",
      options: [
        { id: "weak", label: "Poco efectiva", score: 1 },
        { id: "normal", label: "Normal", score: 2 },
        { id: "efficient", label: "Eficiente", score: 3 },
      ],
    },
    {
      id: "improvement_goal",
      title: "Creo que aprenderia mejor si...",
      options: [
        { id: "speed", label: "Leyera mas rapido", score: 2 },
        { id: "depth", label: "Comprendiera mejor", score: 2 },
        { id: "focus", label: "Tuviera mas concentracion", score: 1 },
        { id: "techniques", label: "Supiera tecnicas", score: 3 },
      ],
    },
    baseQuestion6,
  ],
  profesionales: [
    {
      id: "work_reading",
      title: "Al leer por estudio o trabajo...",
      options: [
        { id: "distracted", label: "Me distraigo", score: 1 },
        { id: "forget", label: "Olvido rapido", score: 1 },
        { id: "slow", label: "Tardo mucho", score: 2 },
        { id: "retain", label: "Retengo bien", score: 3 },
      ],
    },
    {
      id: "main_difficulty",
      title: "Mi mayor dificultad es...",
      options: [
        { id: "concentration", label: "Concentracion", score: 1 },
        { id: "memory", label: "Memoria", score: 1 },
        { id: "time", label: "Falta de tiempo", score: 2 },
        { id: "method", label: "Falta de metodo", score: 2 },
      ],
    },
    {
      id: "reading_style",
      title: "Cuando leo suelo...",
      options: [
        { id: "underline", label: "Subrayar sin estrategia", score: 1 },
        { id: "reread", label: "Releer", score: 2 },
        { id: "fast_unclear", label: "Leer rapido sin claridad", score: 1 },
        { id: "strategic", label: "Leer estrategicamente", score: 3 },
      ],
    },
    {
      id: "current_performance",
      title: "Mi rendimiento intelectual actual es...",
      options: [
        { id: "low", label: "Bajo", score: 1 },
        { id: "medium", label: "Medio", score: 2 },
        { id: "high", label: "Alto", score: 3 },
      ],
    },
    {
      id: "improvement_style",
      title: "Me gustaria mejorar de forma...",
      options: [
        { id: "fast", label: "Rapida", score: 2 },
        { id: "scientific", label: "Cientifica", score: 3 },
        { id: "practical", label: "Practica", score: 3 },
        { id: "integral", label: "Integral", score: 3 },
      ],
    },
    baseQuestion6,
  ],
  adulto_mayor: [
    {
      id: "learning_limit",
      title: "El aprendizaje se ve limitado por...",
      options: [
        { id: "time", label: "Falta de tiempo", score: 2 },
        { id: "saturation", label: "Saturacion mental", score: 1 },
        { id: "focus", label: "Dificultad de concentracion", score: 1 },
        { id: "inefficient_reading", label: "Lectura poco eficiente", score: 2 },
      ],
    },
    {
      id: "reports",
      title: "Al leer informes o textos importantes...",
      options: [
        { id: "slow", label: "Tardo mucho", score: 2 },
        { id: "reread", label: "Debo releer", score: 2 },
        { id: "dont_retain", label: "No retengo", score: 1 },
        { id: "clear", label: "Proceso con claridad", score: 3 },
      ],
    },
    {
      id: "mind_state",
      title: "Mi mente esta...",
      options: [
        { id: "tired", label: "Cansada", score: 1 },
        { id: "scattered", label: "Dispersa", score: 1 },
        { id: "functional", label: "Funcional pero no optimizada", score: 2 },
        { id: "agile", label: "Agil", score: 3 },
      ],
    },
    {
      id: "learning_style",
      title: "Mi forma de aprender es...",
      options: [
        { id: "intuitive", label: "Intuitiva", score: 2 },
        { id: "traditional", label: "Tradicional", score: 2 },
        { id: "strategic", label: "Estrategica", score: 3 },
        { id: "efficient", label: "Altamente eficiente", score: 3 },
      ],
    },
    {
      id: "optimization_interest",
      title: "Me interesaria optimizar si...",
      options: [
        { id: "save_time", label: "Ahorro tiempo", score: 3 },
        { id: "better_results", label: "Mejoro resultados", score: 3 },
        { id: "less_effort", label: "Reduzco esfuerzo", score: 2 },
        { id: "capacity", label: "Incremento capacidad", score: 3 },
      ],
    },
    baseQuestion6,
  ],
};

const categoryFallback: Record<string, string> = {
  universitarios: "profesionales",
};

function getProfile(score: number) {
  if (score <= 9) return "Perfil en Desarrollo";
  if (score <= 13) return "Perfil Funcional";
  if (score <= 16) return "Perfil Potencial Alto";
  return "Perfil Avanzado";
}

function getMainNeed(answers: CognitiveSurveyAnswer[]) {
  const weak = answers
    .filter((answer) => answer.questionId !== "interest")
    .sort((a, b) => a.score - b.score)[0];
  if (!weak) return "Optimizacion integral";

  const text = `${weak.question} ${weak.answer}`.toLowerCase();
  if (text.includes("concentr") || text.includes("distra")) return "Concentracion";
  if (text.includes("memoria") || text.includes("retengo") || text.includes("olvido")) return "Memoria y retencion";
  if (text.includes("rapido") || text.includes("velocidad") || text.includes("tardo")) return "Velocidad de procesamiento";
  if (text.includes("comprension") || text.includes("confundo")) return "Comprension";
  if (text.includes("metodo") || text.includes("tecnica") || text.includes("estrateg")) return "Metodo de estudio";
  return weak.answer;
}

export function CognitiveSurvey({ categoria, onSubmit, submitting = false }: Props) {
  const normalizedCategory = categoryFallback[categoria] || categoria;
  const questions = surveyByCategory[normalizedCategory] || surveyByCategory.profesionales;
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<string, SurveyOption>>({});
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advanceTimerRef = useRef<number | null>(null);

  const currentQuestion = questions[current];
  const currentSelection = selected[currentQuestion.id];
  const progress = Math.round(((current + 1) / questions.length) * 100);

  const completedAnswers = useMemo(() => Object.keys(selected).length, [selected]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const selectOption = (option: SurveyOption) => {
    if (submitting || isAdvancing) return;
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);

    const nextSelected = { ...selected, [currentQuestion.id]: option };
    setSelected(nextSelected);
    setIsAdvancing(true);

    advanceTimerRef.current = window.setTimeout(() => {
      goNext(nextSelected);
      setIsAdvancing(false);
      advanceTimerRef.current = null;
    }, 430);
  };

  const goNext = (answersByQuestion = selected) => {
    if (!answersByQuestion[currentQuestion.id]) return;
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
      return;
    }

    const answers = questions.map((question) => {
      const option = answersByQuestion[question.id];
      return {
        questionId: question.id,
        question: question.title,
        answerId: option.id,
        answer: option.label,
        score: option.score,
      };
    });
    const score = answers.reduce((sum, answer) => sum + answer.score, 0);
    const interestLevel = answers.find((answer) => answer.questionId === "interest")?.answer || "Sin respuesta";
    onSubmit({
      answers,
      score,
      profile: getProfile(score),
      mainNeed: getMainNeed(answers),
      interestLevel,
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-5 py-6 flex flex-col">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-purple-50">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-600">Perfil Cognitivo IQX</p>
                <p className="text-[11px] text-gray-500">{completedAnswers}/{questions.length} respuestas</p>
              </div>
            </div>
            <div className="text-xs font-bold text-cyan-600">{progress}%</div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #8a3ffc, #06b6d4)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {current === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-3xl border border-purple-100 p-4"
              style={{ background: "linear-gradient(135deg, rgba(138,63,252,0.08), rgba(6,182,212,0.06))" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white shadow-sm">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-black leading-tight text-gray-900">
                    Tu resultado ya esta listo
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1">
                    Responde 6 preguntas rapidas para personalizar tu Perfil Cognitivo IQX.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-white text-[11px] font-bold text-purple-600 shadow-sm">
                      Menos de 1 minuto
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white text-[11px] font-bold text-cyan-700 shadow-sm">
                      Concentracion, memoria y velocidad
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold mb-3">
                  <Gauge className="w-3.5 h-3.5" />
                  Pregunta {current + 1} de {questions.length}
                </div>
                <h1 className="text-2xl font-black leading-tight text-gray-900">
                  {currentQuestion.title}
                </h1>
                {currentQuestion.subtitle && (
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {currentQuestion.subtitle}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentSelection?.id === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => selectOption(option)}
                      disabled={submitting || isAdvancing}
                      className="w-full text-left rounded-2xl border-2 p-4 transition-all"
                      style={{
                        borderColor: isSelected ? "#8a3ffc" : "rgba(148, 163, 184, 0.25)",
                        background: isSelected
                          ? "linear-gradient(135deg, rgba(138,63,252,0.10), rgba(6,182,212,0.08))"
                          : "#ffffff",
                        boxShadow: isSelected ? "0 12px 28px rgba(138,63,252,0.14)" : "0 4px 14px rgba(15,23,42,0.04)",
                      }}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center border"
                          style={{
                            background: isSelected ? "linear-gradient(135deg, #8a3ffc, #06b6d4)" : "#f8fafc",
                            borderColor: isSelected ? "transparent" : "rgba(148,163,184,0.4)",
                          }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-bold text-gray-900">{option.label}</span>
                          {option.helper && <span className="block text-xs text-gray-500 mt-1">{option.helper}</span>}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pt-5 flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
              setIsAdvancing(false);
              setCurrent((prev) => Math.max(0, prev - 1));
            }}
            disabled={current === 0 || submitting || isAdvancing}
            className="w-14 h-14 rounded-full border border-purple-100 text-purple-600 flex items-center justify-center disabled:opacity-30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => goNext()}
            disabled={!currentSelection || submitting || isAdvancing}
            className="flex-1 h-14 rounded-full text-white font-black flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(90deg, #8a3ffc, #06b6d4)" }}
          >
            {submitting ? "Guardando..." : isAdvancing ? "Avanzando..." : current === questions.length - 1 ? "Ver mi resultado" : "Selecciona una respuesta"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
