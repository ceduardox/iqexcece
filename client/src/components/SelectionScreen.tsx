import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgeGroup {
  id: string;
  label: string;
  ageRange: string;
  image: string;
  description: string;
  gradient: string;
  borderColor: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  gradient: string;
}

const ageGroups: AgeGroup[] = [
  { 
    id: "ninos", 
    label: "NINOS", 
    ageRange: "6-12 anos", 
    image: "/age-ninos.png",
    description: "Tareas eternas y falta de atencion",
    gradient: "from-cyan-500/20 to-cyan-600/30",
    borderColor: "border-cyan-400"
  },
  { 
    id: "adolescentes", 
    label: "ADOLESCENTES", 
    ageRange: "13-17 anos", 
    image: "/age-adolescentes.png",
    description: "Desmotivacion academica",
    gradient: "from-purple-500/20 to-purple-600/30",
    borderColor: "border-purple-400"
  },
  { 
    id: "universitarios", 
    label: "UNIVERSITARIOS", 
    ageRange: "18-25 anos", 
    image: "/age-universitarios.png",
    description: "Sobrecarga y ansiedad",
    gradient: "from-cyan-500/20 to-purple-500/20",
    borderColor: "border-cyan-400"
  },
  { 
    id: "profesionales", 
    label: "PROFESIONALES", 
    ageRange: "26-50 anos", 
    image: "/age-profesionales.png",
    description: "Fatiga mental y estancamiento",
    gradient: "from-purple-600/20 to-cyan-500/20",
    borderColor: "border-purple-400"
  },
  { 
    id: "adulto-mayor", 
    label: "ADULTO MAYOR", 
    ageRange: "50+ anos", 
    image: "/age-adulto-mayor.png",
    description: "Prevencion y agilidad",
    gradient: "from-cyan-400/20 to-cyan-600/30",
    borderColor: "border-cyan-500"
  },
];

const problems: Problem[] = [
  { 
    id: "atencion", 
    title: "Tareas eternas y falta de atencion", 
    description: "Es inteligente pero se distrae facilmente. Las tardes de estudio son una batalla de frustracion.",
    gradient: "from-cyan-500/20 to-cyan-600/30"
  },
  { 
    id: "desmotivacion", 
    title: "Desmotivacion academica", 
    description: "Estudia sin tecnica. Lee pero no retiene. Siente que el colegio es lento y aburrido.",
    gradient: "from-purple-500/20 to-purple-600/30"
  },
  { 
    id: "sobrecarga", 
    title: "Sobrecarga y ansiedad", 
    description: "Lecturas interminables para la tesis y bloqueos mentales durante los examenes por estres.",
    gradient: "from-cyan-500/20 to-purple-500/20"
  },
  { 
    id: "fatiga", 
    title: "Fatiga mental y estancamiento", 
    description: "Niebla mental (Brain Fog). Te cuesta mantener el enfoque profundo y expresar tus ideas.",
    gradient: "from-purple-600/20 to-cyan-500/20"
  },
  { 
    id: "prevencion", 
    title: "Prevencion y agilidad", 
    description: "Pequenos olvidos frecuentes. Buscas mantener tu mente lucida y activa para no perder independencia.",
    gradient: "from-cyan-400/20 to-purple-400/20"
  },
];

const getAgeLabel = (id: string) => ageGroups.find(g => g.id === id)?.label || id;
const getProblemTitle = (id: string) => problems.find(p => p.id === id)?.title || id;

function ElectronParticle({ delay, startX, startY }: { delay: number; startX: number; startY: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-cyan-400"
      style={{ 
        left: `${startX}%`, 
        top: `${startY}%`,
        boxShadow: "0 0 10px hsl(187 85% 53%), 0 0 20px hsl(187 85% 53% / 0.5)"
      }}
      animate={{
        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
        y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
        opacity: [0.3, 0.8, 0.5, 0.3],
        scale: [0.5, 1.2, 0.8, 0.5],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    />
  );
}

function ElectronLine({ startX, startY, endX, endY, delay }: { startX: number; startY: number; endX: number; endY: number; delay: number }) {
  return (
    <motion.div
      className="absolute h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: `${Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)}%`,
        transform: `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`,
        transformOrigin: "left center",
      }}
      animate={{
        opacity: [0, 0.6, 0],
        scaleX: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    />
  );
}

interface SelectionScreenProps {
  onComplete: (selection: { ageGroup: string; ageLabel: string; problems: string[]; problemTitles: string[] }) => void;
}

export function SelectionScreen({ onComplete }: SelectionScreenProps) {
  const [step, setStep] = useState<"age" | "problems">("age");
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [electrons] = useState(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      delay: Math.random() * 3,
    }))
  );
  const [lines] = useState(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      startX: Math.random() * 80 + 10,
      startY: Math.random() * 80 + 10,
      endX: Math.random() * 80 + 10,
      endY: Math.random() * 80 + 10,
      delay: Math.random() * 5,
    }))
  );

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
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div 
      className="min-h-screen bg-background p-4 md:p-8 overflow-y-auto relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="selection-screen"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.img 
          src="/x-background.png" 
          alt=""
          className="absolute right-0 bottom-0 w-64 md:w-96 opacity-10"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {electrons.map((electron) => (
          <ElectronParticle
            key={electron.id}
            delay={electron.delay}
            startX={electron.startX}
            startY={electron.startY}
          />
        ))}
        
        {lines.map((line) => (
          <ElectronLine
            key={line.id}
            startX={line.startX}
            startY={line.startY}
            endX={line.endX}
            endY={line.endY}
            delay={line.delay}
          />
        ))}
      </div>

      <div className="max-w-lg mx-auto relative z-10">
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
                className="text-center space-y-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="inline-block"
                  animate={{
                    textShadow: [
                      "0 0 10px hsl(280 70% 50% / 0.5)",
                      "0 0 20px hsl(280 70% 50% / 0.8)",
                      "0 0 10px hsl(280 70% 50% / 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <h1 className="text-2xl md:text-4xl font-bold">
                    <span className="text-muted-foreground">Que esta </span>
                    <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                      frenando
                    </span>
                  </h1>
                </motion.div>
                <h2 className="text-2xl md:text-4xl font-bold">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    tu potencial
                  </span>
                  <span className="text-muted-foreground"> hoy?</span>
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
                className="space-y-4"
                role="radiogroup"
                aria-label="Selecciona tu grupo de edad"
              >
                {ageGroups.map((group) => {
                  const isSelected = selectedAge === group.id;
                  
                  return (
                    <motion.button
                      key={group.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      variants={itemVariants}
                      onClick={() => handleAgeSelect(group.id)}
                      className={`w-full rounded-2xl border-2 overflow-hidden transition-all duration-300 text-left ${
                        isSelected
                          ? `${group.borderColor} shadow-lg`
                          : "border-border/30"
                      }`}
                      style={isSelected ? {
                        boxShadow: "0 0 30px hsl(187 85% 53% / 0.3), 0 0 60px hsl(280 70% 50% / 0.2)",
                      } : {}}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`button-age-${group.id}`}
                    >
                      <div className={`bg-gradient-to-r ${group.gradient}`}>
                        <div className="flex gap-4 p-4">
                          <motion.div 
                            className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg"
                            whileHover={{ scale: 1.03 }}
                            style={{
                              boxShadow: isSelected ? "0 0 20px hsl(187 85% 53% / 0.4)" : "0 4px 15px rgba(0,0,0,0.3)"
                            }}
                          >
                            <img 
                              src={group.image} 
                              alt={group.label}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          </motion.div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className={`font-bold text-base md:text-lg ${isSelected ? "text-cyan-400" : "text-foreground"}`}>
                                {group.label}
                              </span>
                              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                {group.ageRange}
                              </span>
                            </div>
                            <p className="text-sm md:text-base text-muted-foreground">
                              {group.description}
                            </p>
                            
                            <motion.div
                              className={`mt-3 w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-cyan-400 bg-cyan-400" : "border-muted-foreground/30"
                              }`}
                              animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              {isSelected && <Check className="w-4 h-4 text-background" />}
                            </motion.div>
                          </div>
                        </div>
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
                  className="w-full text-lg font-bold bg-gradient-to-r from-purple-500 to-cyan-500 border-0"
                  data-testid="button-continue-age"
                >
                  <motion.span
                    animate={{ opacity: selectedAge ? 1 : 0.7 }}
                  >
                    CONTINUAR
                  </motion.span>
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
                className="text-center space-y-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-2xl md:text-4xl font-bold text-foreground">
                  Cual es tu mayor
                </h1>
                <motion.h2 
                  className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                  animate={{
                    textShadow: [
                      "0 0 10px hsl(280 70% 50% / 0.3)",
                      "0 0 20px hsl(280 70% 50% / 0.5)",
                      "0 0 10px hsl(280 70% 50% / 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  desafio?
                </motion.h2>
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
                  const isSelected = selectedProblems.includes(problem.id);
                  
                  return (
                    <motion.button
                      key={problem.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      variants={itemVariants}
                      onClick={() => handleProblemToggle(problem.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left bg-gradient-to-r ${problem.gradient} ${
                        isSelected
                          ? "border-purple-400 shadow-lg"
                          : "border-border/30"
                      }`}
                      style={isSelected ? {
                        boxShadow: "0 0 20px hsl(280 70% 50% / 0.4)",
                      } : {}}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`button-problem-${problem.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <span className={`font-bold text-sm block ${isSelected ? "text-purple-300" : "text-foreground"}`}>
                            {problem.title}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {problem.description}
                          </p>
                        </div>

                        <motion.div
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "border-purple-400 bg-purple-500" : "border-muted-foreground/30"
                          }`}
                          animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </motion.div>
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
                  className="w-full text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 border-0"
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
