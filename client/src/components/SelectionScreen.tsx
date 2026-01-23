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
  image: string;
  icon: string;
}

const ageGroups: AgeGroup[] = [
  { 
    id: "ninos", 
    label: "NIÑOS", 
    ageRange: "6-12 años", 
    image: "/age-ninos.png",
    description: "Tareas eternas y falta de atención",
    gradient: "from-cyan-500/20 to-cyan-600/30",
    borderColor: "border-cyan-400"
  },
  { 
    id: "adolescentes", 
    label: "ADOLESCENTES", 
    ageRange: "13-17 años", 
    image: "/age-adolescentes.png",
    description: "Desmotivación académica",
    gradient: "from-purple-500/20 to-purple-600/30",
    borderColor: "border-purple-400"
  },
  { 
    id: "universitarios", 
    label: "UNIVERSITARIOS", 
    ageRange: "18-25 años", 
    image: "/age-universitarios.png",
    description: "Sobrecarga y ansiedad",
    gradient: "from-cyan-500/20 to-purple-500/20",
    borderColor: "border-cyan-400"
  },
  { 
    id: "profesionales", 
    label: "PROFESIONALES", 
    ageRange: "26-50 años", 
    image: "/age-profesionales.png",
    description: "Fatiga mental y estancamiento",
    gradient: "from-purple-600/20 to-cyan-500/20",
    borderColor: "border-purple-400"
  },
  { 
    id: "adulto-mayor", 
    label: "ADULTO MAYOR", 
    ageRange: "50+ años", 
    image: "/age-adulto-mayor.png",
    description: "Prevención y agilidad",
    gradient: "from-cyan-400/20 to-cyan-600/30",
    borderColor: "border-cyan-500"
  },
];

const problems: Problem[] = [
  { 
    id: "atencion", 
    title: "Falta de atencion", 
    description: "Es inteligente pero se distrae facilmente. Las tardes de estudio son una batalla.",
    gradient: "from-cyan-500/30 to-cyan-600/40",
    image: "/age-ninos.png",
    icon: "Focus"
  },
  { 
    id: "desmotivacion", 
    title: "Desmotivacion", 
    description: "Estudia sin tecnica. Lee pero no retiene. El colegio es lento y aburrido.",
    gradient: "from-purple-500/30 to-purple-600/40",
    image: "/age-adolescentes.png",
    icon: "TrendingDown"
  },
  { 
    id: "sobrecarga", 
    title: "Sobrecarga mental", 
    description: "Lecturas interminables y bloqueos mentales durante examenes por estres.",
    gradient: "from-cyan-500/30 to-purple-500/30",
    image: "/age-universitarios.png",
    icon: "Brain"
  },
  { 
    id: "fatiga", 
    title: "Fatiga mental", 
    description: "Niebla mental (Brain Fog). Te cuesta mantener el enfoque y expresar ideas.",
    gradient: "from-purple-600/30 to-cyan-500/30",
    image: "/age-profesionales.png",
    icon: "Battery"
  },
  { 
    id: "prevencion", 
    title: "Olvidos frecuentes", 
    description: "Buscas mantener tu mente lucida y activa para no perder independencia.",
    gradient: "from-cyan-400/30 to-purple-400/30",
    image: "/age-adulto-mayor.png",
    icon: "Lightbulb"
  },
];

const getAgeLabel = (id: string) => ageGroups.find(g => g.id === id)?.label || id;
const getAgeImage = (id: string) => ageGroups.find(g => g.id === id)?.image || "/age-ninos.png";
const getProblemTitle = (id: string) => problems.find(p => p.id === id)?.title || id;

// Map age IDs to image prefixes
const ageImagePrefix: Record<string, string> = {
  "ninos": "ninos",
  "adolescentes": "adolescentes", 
  "universitarios": "universitarios",
  "profesionales": "profesionales",
  "adulto-mayor": "adulto"
};

// Map problem IDs to image suffixes
const problemImageSuffix: Record<string, string> = {
  "atencion": "atencion",
  "desmotivacion": "desmotivacion",
  "sobrecarga": "sobrecarga",
  "fatiga": "fatiga",
  "prevencion": "olvidos"
};

// Get specific image for age + problem combination
const getProblemImage = (ageId: string | null, problemId: string): string => {
  if (!ageId) return `/age-ninos.png`;
  const agePrefix = ageImagePrefix[ageId] || "ninos";
  const problemSuffix = problemImageSuffix[problemId] || "atencion";
  return `/problem-${agePrefix}-${problemSuffix}.png`;
};

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
  const [step, setStep] = useState<"age" | "problems" | "fingerprint" | "options">("age");
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
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
    if (expandedProblem === problemId) {
      setSelectedProblems(prev => 
        prev.includes(problemId)
          ? prev.filter(id => id !== problemId)
          : [...prev, problemId]
      );
    } else {
      setExpandedProblem(problemId);
    }
  };

  const handleContinue = () => {
    if (step === "age" && selectedAge) {
      setStep("problems");
    } else if (step === "problems" && selectedProblems.length > 0) {
      setStep("fingerprint");
    }
  };

  const handleFingerprintScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    
    // Play scan sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a futuristic scan sound
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(2400, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
      oscillator.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
    } catch (e) {
      // Audio not supported, continue silently
    }
    
    // Trigger haptic feedback (Android)
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50, 30, 80]);
    }
    
    // Transition to options after scan animation
    setTimeout(() => {
      setStep("options");
      setIsScanning(false);
    }, 800);
  };

  const handleOptionSelect = (option: "tests" | "training") => {
    onComplete({ 
      ageGroup: selectedAge!, 
      ageLabel: getAgeLabel(selectedAge!),
      problems: selectedProblems,
      problemTitles: selectedProblems.map(getProblemTitle)
    });
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
        {step === "age" && (
          <motion.img 
            src="/circuit-pattern.png" 
            alt=""
            className="absolute right-0 bottom-0 w-72 md:w-[400px] opacity-40"
            initial={{ opacity: 0, x: 50 }}
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
              x: 0,
            }}
            transition={{
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 0.8 }
            }}
            style={{
              filter: "drop-shadow(0 0 20px hsl(187 85% 53% / 0.5))",
            }}
          />
        )}
        
        {step === "problems" && (
          <motion.img 
            src="/x-background.png" 
            alt=""
            className="absolute left-0 top-20 w-48 md:w-72 opacity-15"
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ 
              opacity: 0.15,
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        )}
        
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
                className="text-center space-y-3 py-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="relative inline-block"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <motion.div
                    className="absolute -inset-4 rounded-3xl opacity-30 blur-xl"
                    style={{ background: "linear-gradient(135deg, hsl(280 70% 50%), hsl(187 85% 53%))" }}
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  <div className="relative">
                    <motion.p 
                      className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-cyan-400 mb-2"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Descubre tu camino
                    </motion.p>
                    
                    <h1 className="text-3xl md:text-5xl font-black leading-tight">
                      <span className="text-muted-foreground">Que esta </span>
                      <motion.span 
                        className="relative inline-block"
                        animate={{ 
                          textShadow: [
                            "0 0 20px hsl(280 70% 50% / 0.8)",
                            "0 0 40px hsl(280 70% 50% / 1)",
                            "0 0 20px hsl(280 70% 50% / 0.8)",
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                          frenando
                        </span>
                        <motion.span 
                          className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                        />
                      </motion.span>
                    </h1>
                    
                    <h2 className="text-3xl md:text-5xl font-black leading-tight mt-1">
                      <motion.span 
                        className="relative inline-block"
                        animate={{ 
                          textShadow: [
                            "0 0 20px hsl(187 85% 53% / 0.8)",
                            "0 0 40px hsl(187 85% 53% / 1)",
                            "0 0 20px hsl(187 85% 53% / 0.8)",
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                      >
                        <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          tu potencial
                        </span>
                      </motion.span>
                      <span className="text-muted-foreground"> hoy?</span>
                    </h2>
                  </div>
                </motion.div>
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
                  const isSelected = selectedAge === group.id;
                  
                  return (
                    <motion.div
                      key={group.id}
                      variants={itemVariants}
                      layout
                      className="w-full"
                    >
                      <motion.button
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleAgeSelect(group.id)}
                        className={`w-full rounded-2xl border-2 overflow-hidden transition-all duration-300 text-left ${
                          isSelected
                            ? `${group.borderColor}`
                            : "border-border/30"
                        }`}
                        style={isSelected ? {
                          boxShadow: "0 0 30px hsl(187 85% 53% / 0.3), 0 0 60px hsl(280 70% 50% / 0.2)",
                        } : {}}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`button-age-${group.id}`}
                      >
                        <AnimatePresence mode="wait">
                          {isSelected ? (
                            <motion.div
                              key="expanded"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`bg-gradient-to-br ${group.gradient}`}
                            >
                              <div className="relative">
                                <motion.img 
                                  src={group.image} 
                                  alt={group.label}
                                  className="w-full h-56 md:h-72 object-cover"
                                  initial={{ scale: 1.1 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.5 }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <div className="flex items-center gap-3 mb-2">
                                    <motion.div
                                      className="w-8 h-8 rounded-full border-2 border-cyan-400 bg-cyan-400 flex items-center justify-center"
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 0.5 }}
                                    >
                                      <Check className="w-5 h-5 text-background" />
                                    </motion.div>
                                    <div>
                                      <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-lg">
                                        {group.label}
                                      </h3>
                                      <span className="text-sm text-cyan-300">{group.ageRange}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm md:text-base text-white/90 mb-4">
                                    {group.description}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="collapsed"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className={`flex items-center gap-3 p-3 bg-gradient-to-r ${group.gradient}`}
                            >
                              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                                <img 
                                  src={group.image} 
                                  alt={group.label}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-sm md:text-base text-foreground">
                                  {group.label}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {group.ageRange}
                                </span>
                              </div>
                              <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                      
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="mt-3"
                          >
                            <Button
                              onClick={handleContinue}
                              size="lg"
                              className="w-full text-lg font-bold bg-gradient-to-r from-purple-500 to-cyan-500 border-0"
                              data-testid="button-continue-age"
                            >
                              CONTINUAR
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
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
              <motion.button
                onClick={() => setStep("age")}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/50 bg-cyan-400/10 text-cyan-400 text-sm font-medium hover:bg-cyan-400/20 transition-colors"
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </motion.button>

              <motion.div 
                className="text-center space-y-3 py-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="relative inline-block"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <motion.div
                    className="absolute -inset-4 rounded-3xl opacity-30 blur-xl"
                    style={{ background: "linear-gradient(135deg, hsl(187 85% 53%), hsl(280 70% 50%))" }}
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  <div className="relative">
                    <motion.p 
                      className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-purple-400 mb-2"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Identifica tu reto
                    </motion.p>
                    
                    <h1 className="text-3xl md:text-5xl font-black leading-tight">
                      <span className="text-muted-foreground">Cual es tu mayor</span>
                    </h1>
                    
                    <h2 className="text-3xl md:text-5xl font-black leading-tight mt-1">
                      <motion.span 
                        className="relative inline-block"
                        animate={{ 
                          textShadow: [
                            "0 0 20px hsl(280 70% 50% / 0.8)",
                            "0 0 40px hsl(280 70% 50% / 1)",
                            "0 0 20px hsl(280 70% 50% / 0.8)",
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                          desafio?
                        </span>
                        <motion.span 
                          className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                        />
                      </motion.span>
                    </h2>
                  </div>
                </motion.div>
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
                aria-label="Selecciona tus desafíos"
              >
                {problems.map((problem) => {
                  const isSelected = selectedProblems.includes(problem.id);
                  const isExpanded = expandedProblem === problem.id;
                  
                  return (
                    <motion.div
                      key={problem.id}
                      variants={itemVariants}
                      layout
                      className="w-full"
                    >
                      <motion.button
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        onClick={() => handleProblemToggle(problem.id)}
                        className={`w-full rounded-2xl border-2 overflow-hidden text-left transition-all duration-300 ${
                          isSelected
                            ? "border-purple-400"
                            : "border-border/30"
                        }`}
                        style={isSelected ? {
                          boxShadow: "0 0 25px hsl(280 70% 50% / 0.4)",
                        } : {}}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`button-problem-${problem.id}`}
                      >
                        <AnimatePresence mode="wait">
                          {isExpanded ? (
                            <motion.div
                              key="expanded"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="relative">
                                <motion.img 
                                  src={getProblemImage(selectedAge, problem.id)} 
                                  alt={problem.title}
                                  className="w-full h-48 md:h-56 object-cover"
                                  initial={{ scale: 1.1 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.5 }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                  <div className="flex items-start gap-3 mb-3">
                                    <motion.div
                                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                        isSelected 
                                          ? "border-purple-400 bg-purple-500" 
                                          : "border-white/60 bg-black/40"
                                      }`}
                                      animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                                      transition={{ duration: 0.5 }}
                                    >
                                      {isSelected && <Check className="w-5 h-5 text-white" />}
                                    </motion.div>
                                    <div className="flex-1">
                                      <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-lg">
                                        {problem.title}
                                      </h3>
                                    </div>
                                  </div>
                                  <p className="text-sm md:text-base text-white/95 leading-relaxed">
                                    {problem.description}
                                  </p>
                                  <p className="text-xs text-purple-300 mt-3">
                                    Toca para {isSelected ? "deseleccionar" : "seleccionar"}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="collapsed"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="relative"
                            >
                              <div className="flex items-center gap-4 p-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                                  <img 
                                    src={getProblemImage(selectedAge, problem.id)} 
                                    alt={problem.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className={`font-bold text-base md:text-lg ${isSelected ? "text-purple-400" : "text-foreground"}`}>
                                    {problem.title}
                                  </span>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                    {problem.description}
                                  </p>
                                </div>
                                <motion.div
                                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected 
                                      ? "border-purple-400 bg-purple-500" 
                                      : "border-muted-foreground/30"
                                  }`}
                                >
                                  {isSelected && <Check className="w-4 h-4 text-white" />}
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-2 pb-6"
              >
                <Button
                  onClick={handleContinue}
                  disabled={selectedProblems.length === 0}
                  size="lg"
                  className="w-full text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 border-0"
                  data-testid="button-continue-problems"
                >
                  CONTINUAR ({selectedProblems.length} seleccionado{selectedProblems.length !== 1 ? "s" : ""})
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === "fingerprint" && (
            <motion.div
              key="fingerprint-scanner"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[70vh] space-y-8"
            >
              <motion.div
                className="relative"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.p 
                  className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-cyan-400 text-center mb-4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Verificación de identidad
                </motion.p>
                
                <h1 className="text-2xl md:text-3xl font-black text-center mb-8">
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Confirma tu perfil
                  </span>
                </h1>
              </motion.div>

              <motion.button
                onClick={handleFingerprintScan}
                className="relative w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="button-fingerprint"
              >
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle, transparent 40%, hsl(187 85% 53% / 0.1) 70%, transparent 100%)",
                  }}
                  animate={isScanning ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  } : {
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: isScanning ? 0.3 : 2, repeat: Infinity }}
                />
                
                {/* Neon border ring */}
                <motion.div
                  className="absolute inset-2 rounded-full border-2"
                  style={{
                    borderColor: "hsl(187 85% 53%)",
                    boxShadow: isScanning 
                      ? "0 0 30px hsl(187 85% 53%), 0 0 60px hsl(187 85% 53% / 0.5), inset 0 0 30px hsl(187 85% 53% / 0.3)"
                      : "0 0 15px hsl(187 85% 53% / 0.5), 0 0 30px hsl(187 85% 53% / 0.3)",
                  }}
                  animate={isScanning ? {
                    scale: [1, 1.05, 1],
                    borderColor: ["hsl(187 85% 53%)", "hsl(280 70% 60%)", "hsl(187 85% 53%)"],
                  } : {}}
                  transition={{ duration: 0.4, repeat: Infinity }}
                />
                
                {/* Inner background */}
                <div 
                  className="absolute inset-4 rounded-full"
                  style={{
                    background: "radial-gradient(circle, hsl(220 30% 8%) 0%, hsl(220 40% 5%) 100%)",
                  }}
                />
                
                {/* Fingerprint SVG */}
                <motion.svg
                  viewBox="0 0 100 100"
                  className="w-28 h-28 md:w-32 md:h-32 relative z-10"
                  style={{
                    filter: isScanning 
                      ? "drop-shadow(0 0 20px hsl(187 85% 53%)) drop-shadow(0 0 40px hsl(187 85% 53%))"
                      : "drop-shadow(0 0 10px hsl(187 85% 53% / 0.5))",
                  }}
                >
                  {/* Fingerprint lines */}
                  <motion.path
                    d="M50 15 C30 15 20 30 20 50 C20 70 30 85 50 85"
                    fill="none"
                    stroke="hsl(187 85% 53%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.1 }}
                  />
                  <motion.path
                    d="M50 20 C35 20 27 32 27 50 C27 68 35 80 50 80"
                    fill="none"
                    stroke="hsl(280 70% 60%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                  <motion.path
                    d="M50 25 C38 25 33 35 33 50 C33 65 38 75 50 75"
                    fill="none"
                    stroke="hsl(187 85% 53%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                  <motion.path
                    d="M50 30 C42 30 38 38 38 50 C38 62 42 70 50 70"
                    fill="none"
                    stroke="hsl(280 70% 60%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                  <motion.path
                    d="M50 35 C45 35 43 42 43 50 C43 58 45 65 50 65"
                    fill="none"
                    stroke="hsl(187 85% 53%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  <motion.path
                    d="M50 40 C47 40 46 45 46 50 C46 55 47 60 50 60"
                    fill="none"
                    stroke="hsl(280 70% 60%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                  {/* Right side curves */}
                  <motion.path
                    d="M50 15 C70 15 80 30 80 50 C80 70 70 85 50 85"
                    fill="none"
                    stroke="hsl(187 85% 53%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.15 }}
                  />
                  <motion.path
                    d="M50 20 C65 20 73 32 73 50 C73 68 65 80 50 80"
                    fill="none"
                    stroke="hsl(280 70% 60%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.25 }}
                  />
                  <motion.path
                    d="M50 25 C62 25 67 35 67 50 C67 65 62 75 50 75"
                    fill="none"
                    stroke="hsl(187 85% 53%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.35 }}
                  />
                  <motion.path
                    d="M50 30 C58 30 62 38 62 50 C62 62 58 70 50 70"
                    fill="none"
                    stroke="hsl(280 70% 60%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.45 }}
                  />
                  <motion.path
                    d="M50 35 C55 35 57 42 57 50 C57 58 55 65 50 65"
                    fill="none"
                    stroke="hsl(187 85% 53%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.55 }}
                  />
                  <motion.path
                    d="M50 40 C53 40 54 45 54 50 C54 55 53 60 50 60"
                    fill="none"
                    stroke="hsl(280 70% 60%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.65 }}
                  />
                  
                  {/* Scanning line */}
                  {isScanning && (
                    <motion.line
                      x1="15"
                      y1="50"
                      x2="85"
                      y2="50"
                      stroke="hsl(187 85% 53%)"
                      strokeWidth="3"
                      initial={{ y1: 10, y2: 10 }}
                      animate={{ y1: [10, 90, 10], y2: [10, 90, 10] }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      style={{
                        filter: "drop-shadow(0 0 10px hsl(187 85% 53%))",
                      }}
                    />
                  )}
                </motion.svg>
                
                {/* Scan effect overlay */}
                {isScanning && (
                  <motion.div
                    className="absolute inset-4 rounded-full"
                    style={{
                      background: "linear-gradient(180deg, transparent 0%, hsl(187 85% 53% / 0.3) 50%, transparent 100%)",
                    }}
                    initial={{ y: "-100%" }}
                    animate={{ y: ["−100%", "100%", "−100%"] }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                )}
              </motion.button>

              <motion.div
                className="text-center space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.p
                  className="text-lg md:text-xl font-bold"
                  style={{
                    color: isScanning ? "hsl(187 85% 53%)" : "hsl(187 85% 53% / 0.8)",
                    textShadow: isScanning ? "0 0 20px hsl(187 85% 53%)" : "none",
                  }}
                  animate={!isScanning ? { opacity: [0.7, 1, 0.7] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isScanning ? "Escaneando..." : "Presiona aquí"}
                </motion.p>
                <p className="text-sm text-muted-foreground">
                  {isScanning ? "Verificando identidad" : "Coloca tu dedo para continuar"}
                </p>
              </motion.div>
            </motion.div>
          )}

          {step === "options" && (
            <motion.div
              key="options-selection"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <motion.button
                onClick={() => setStep("fingerprint")}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-400/50 bg-purple-400/10 text-purple-400 text-sm font-medium hover:bg-purple-400/20 transition-colors"
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
                data-testid="button-back-options"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </motion.button>

              <motion.div 
                className="text-center space-y-4 py-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="relative inline-block"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <motion.div
                    className="absolute -inset-4 rounded-3xl opacity-30 blur-xl"
                    style={{ background: "linear-gradient(135deg, hsl(187 85% 53%), hsl(280 70% 50%))" }}
                    animate={{
                      opacity: [0.2, 0.5, 0.2],
                      scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  <div className="relative">
                    <motion.p 
                      className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-cyan-400 mb-2"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Elige tu camino
                    </motion.p>
                    
                    <h1 className="text-3xl md:text-5xl font-black leading-tight">
                      <motion.span 
                        className="relative inline-block"
                        animate={{ 
                          textShadow: [
                            "0 0 20px hsl(187 85% 53% / 0.6)",
                            "0 0 40px hsl(280 70% 50% / 0.8)",
                            "0 0 20px hsl(187 85% 53% / 0.6)",
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                          Desafía tu Mente
                        </span>
                        <motion.span 
                          className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                        />
                      </motion.span>
                    </h1>
                  </div>
                </motion.div>
                
                <motion.p
                  className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Explora tu potencial y mejora tu percepción visual
                </motion.p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <motion.button
                  variants={itemVariants}
                  onClick={() => handleOptionSelect("tests")}
                  className="w-full rounded-3xl overflow-hidden text-left relative group"
                  style={{
                    background: "linear-gradient(135deg, hsl(280 70% 45%) 0%, hsl(260 60% 35%) 50%, hsl(200 70% 40%) 100%)",
                  }}
                  whileHover={{ scale: 1.03, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  data-testid="button-option-tests"
                >
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "radial-gradient(circle at 50% 50%, hsl(280 70% 60% / 0.4) 0%, transparent 70%)",
                    }}
                  />
                  <motion.div
                    className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-60 blur-xl transition-all duration-500"
                    style={{ background: "linear-gradient(135deg, hsl(280 70% 60%), hsl(200 80% 50%))" }}
                  />
                  
                  <div className="relative p-5 flex items-center gap-4">
                    <motion.div 
                      className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 relative"
                      animate={{ 
                        y: [0, -6, 0],
                        rotateZ: [0, 2, 0, -2, 0],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full opacity-50 blur-2xl"
                        style={{ background: "radial-gradient(circle, hsl(280 70% 60%), transparent)" }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <img 
                        src="/brain-head.png" 
                        alt="Tests cognitivos"
                        className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                      />
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl font-black text-white mb-2 drop-shadow-lg">
                        Tests cognitivos interactivos
                      </h2>
                      <p className="text-sm text-white/80 leading-relaxed">
                        Descubre tu potencial explorando tu mente con nuestros tests
                      </p>
                      <motion.div
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Comenzar
                        <ArrowLeft className="w-3 h-3 rotate-180" />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  onClick={() => handleOptionSelect("training")}
                  className="w-full rounded-3xl overflow-hidden text-left relative group"
                  style={{
                    background: "linear-gradient(135deg, hsl(187 70% 40%) 0%, hsl(200 60% 35%) 50%, hsl(220 70% 45%) 100%)",
                  }}
                  whileHover={{ scale: 1.03, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  data-testid="button-option-training"
                >
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "radial-gradient(circle at 50% 50%, hsl(187 85% 53% / 0.4) 0%, transparent 70%)",
                    }}
                  />
                  <motion.div
                    className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-60 blur-xl transition-all duration-500"
                    style={{ background: "linear-gradient(135deg, hsl(187 85% 53%), hsl(220 80% 60%))" }}
                  />
                  
                  <div className="relative p-5 flex items-center gap-4">
                    <motion.div 
                      className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 relative"
                      animate={{ 
                        y: [0, -6, 0],
                        rotateZ: [0, -2, 0, 2, 0],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full opacity-50 blur-2xl"
                        style={{ background: "radial-gradient(circle, hsl(187 85% 53%), transparent)" }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      />
                      <img 
                        src="/brain-cube.png" 
                        alt="Entrenamiento"
                        className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                      />
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl font-black text-white mb-2 drop-shadow-lg">
                        Entrenamiento
                      </h2>
                      <p className="text-sm text-white/80 leading-relaxed">
                        Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas
                      </p>
                      <motion.div
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                      >
                        Comenzar
                        <ArrowLeft className="w-3 h-3 rotate-180" />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
