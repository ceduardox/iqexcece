import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, User, GraduationCap, Briefcase, Users, Brain, Heart, Zap, Target, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgeGroup {
  id: string;
  label: string;
  ageRange: string;
  icon: typeof User;
  description: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  icon: typeof Brain;
}

const ageGroups: AgeGroup[] = [
  { id: "ninos", label: "NINOS", ageRange: "6-12 anos", icon: Users, description: "Tareas eternas y falta de atencion" },
  { id: "adolescentes", label: "ADOLESCENTES", ageRange: "13-17 anos", icon: User, description: "Desmotivacion academica" },
  { id: "universitarios", label: "UNIVERSITARIOS", ageRange: "18-25 anos", icon: GraduationCap, description: "Sobrecarga y ansiedad" },
  { id: "profesionales", label: "PROFESIONALES", ageRange: "26-50 anos", icon: Briefcase, description: "Fatiga mental y estancamiento" },
  { id: "adulto-mayor", label: "ADULTO MAYOR", ageRange: "50+ anos", icon: Heart, description: "Prevencion y agilidad" },
];

const problems: Problem[] = [
  { 
    id: "atencion", 
    title: "Tareas eternas y falta de atencion", 
    description: "Es inteligente pero se distrae facilmente. Las tardes de estudio son una batalla de frustracion.",
    icon: Target
  },
  { 
    id: "desmotivacion", 
    title: "Desmotivacion academica", 
    description: "Estudia sin tecnica. Lee pero no retiene. Siente que el colegio es lento y aburrido.",
    icon: Zap
  },
  { 
    id: "sobrecarga", 
    title: "Sobrecarga y ansiedad", 
    description: "Lecturas interminables para la tesis y bloqueos mentales durante los examenes por estres.",
    icon: Brain
  },
  { 
    id: "fatiga", 
    title: "Fatiga mental y estancamiento", 
    description: "Niebla mental (Brain Fog). Te cuesta mantener el enfoque profundo y expresar tus ideas.",
    icon: Sparkles
  },
  { 
    id: "prevencion", 
    title: "Prevencion y agilidad", 
    description: "Pequenos olvidos frecuentes. Buscas mantener tu mente lucida y activa para no perder independencia.",
    icon: Heart
  },
];

const getAgeLabel = (id: string) => ageGroups.find(g => g.id === id)?.label || id;
const getProblemTitle = (id: string) => problems.find(p => p.id === id)?.title || id;

interface SelectionScreenProps {
  onComplete: (selection: { ageGroup: string; ageLabel: string; problems: string[]; problemTitles: string[] }) => void;
}

export function SelectionScreen({ onComplete }: SelectionScreenProps) {
  const [step, setStep] = useState<"age" | "problems">("age");
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

  const handleAgeSelect = (ageId: string) => {
    setSelectedAge(ageId);
  };

  const handleProblemToggle = (problemId: string) => {
    setSelectedProblems(prev => 
      prev.includes(problemId)
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId]
    );
  };

  const handleContinue = () => {
    if (step === "age" && selectedAge) {
      setStep("problems");
    } else if (step === "problems" && selectedProblems.length > 0) {
      onComplete({ 
        ageGroup: selectedAge!, 
        ageLabel: getAgeLabel(selectedAge!),
        problems: selectedProblems,
        problemTitles: selectedProblems.map(getProblemTitle)
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      className="min-h-screen bg-background p-4 md:p-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="selection-screen"
    >
      <div className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {step === "age" && (
            <motion.div
              key="age-selection"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <motion.div 
                className="text-center space-y-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  <span className="text-muted-foreground">Que esta </span>
                  <span className="text-secondary">frenando</span>
                  <span className="text-muted-foreground"> tu</span>
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  potencial hoy?
                </h2>
              </motion.div>

              <motion.p
                className="text-center text-muted-foreground text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Selecciona tu grupo de edad
              </motion.p>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
                role="radiogroup"
                aria-label="Selecciona tu grupo de edad"
              >
                {ageGroups.map((group) => {
                  const Icon = group.icon;
                  const isSelected = selectedAge === group.id;
                  
                  return (
                    <motion.button
                      key={group.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      variants={itemVariants}
                      onClick={() => handleAgeSelect(group.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAgeSelect(group.id);
                        }
                      }}
                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border/50 bg-card/50"
                      }`}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`button-age-${group.id}`}
                    >
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-sm ${isSelected ? "text-accent" : "text-foreground"}`}>
                            {group.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({group.ageRange})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {group.description}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4"
              >
                <Button
                  onClick={handleContinue}
                  disabled={!selectedAge}
                  size="lg"
                  className="w-full text-lg font-bold"
                  data-testid="button-continue-age"
                >
                  CONTINUAR
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === "problems" && (
            <motion.div
              key="problems-selection"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <Button
                onClick={() => setStep("age")}
                variant="ghost"
                size="sm"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>

              <motion.div 
                className="text-center space-y-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Cual es tu mayor
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold text-secondary">
                  desafio?
                </h2>
              </motion.div>

              <motion.p
                className="text-center text-muted-foreground text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Puedes seleccionar multiples opciones
              </motion.p>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
                role="group"
                aria-label="Selecciona tus desafios"
              >
                {problems.map((problem) => {
                  const Icon = problem.icon;
                  const isSelected = selectedProblems.includes(problem.id);
                  
                  return (
                    <motion.button
                      key={problem.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      variants={itemVariants}
                      onClick={() => handleProblemToggle(problem.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleProblemToggle(problem.id);
                        }
                      }}
                      className={`w-full p-4 rounded-xl border-2 flex items-start gap-4 text-left ${
                        isSelected
                          ? "border-secondary bg-secondary/10"
                          : "border-border/50 bg-card/50"
                      }`}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`button-problem-${problem.id}`}
                    >
                      <div 
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`font-bold text-sm block ${isSelected ? "text-secondary" : "text-foreground"}`}>
                          {problem.title}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {problem.description}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "border-secondary bg-secondary" : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-secondary-foreground" />}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4 pb-8"
              >
                <Button
                  onClick={handleContinue}
                  disabled={selectedProblems.length === 0}
                  size="lg"
                  className="w-full text-lg font-bold"
                  data-testid="button-complete"
                >
                  COMENZAR ({selectedProblems.length} seleccionado{selectedProblems.length !== 1 ? "s" : ""})
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
