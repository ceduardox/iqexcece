import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";

// Web Audio API for instant sound playback (especially on mobile)
class SoundPlayer {
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private fallbackAudios: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      // Preload with HTML Audio as fallback
      ['/card.mp3', '/iphone.mp3'].forEach(src => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.load();
        this.fallbackAudios.set(src, audio);
      });

      // Try to initialize Web Audio API
      this.initWebAudio();
    }
  }

  private async initWebAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Load buffers
      for (const src of ['/card.mp3', '/iphone.mp3']) {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.buffers.set(src, audioBuffer);
      }
    } catch (e) {
      // Fall back to HTML Audio
    }
  }

  play(src: string, volume: number = 0.5) {
    // Resume audio context if suspended (iOS requirement)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    // Try Web Audio API first (faster)
    if (this.audioContext && this.buffers.has(src)) {
      try {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        source.buffer = this.buffers.get(src)!;
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
        return;
      } catch (e) {}
    }

    // Fallback to HTML Audio
    const fallback = this.fallbackAudios.get(src);
    if (fallback) {
      const clone = fallback.cloneNode() as HTMLAudioElement;
      clone.volume = volume;
      clone.play().catch(() => {});
    }
  }
}

const soundPlayer = new SoundPlayer();

const playCardSound = () => soundPlayer.play('/card.mp3', 0.5);
const playButtonSound = () => soundPlayer.play('/iphone.mp3', 0.6);

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
    id: "adulto_mayor", 
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
  "adulto_mayor": "adulto"
};

// Map problem IDs to image suffixes
const problemImageSuffix: Record<string, string> = {
  "atencion": "atencion",
  "desmotivacion": "desmotivacion",
  "sobrecarga": "sobrecarga",
  "fatiga": "fatiga",
  "prevencion": "olvidos"
};

// Get specific image for age + problem combination (WebP for performance)
const getProblemImage = (ageId: string | null, problemId: string): string => {
  if (!ageId) return `/age-ninos.png`;
  const agePrefix = ageImagePrefix[ageId] || "ninos";
  const problemSuffix = problemImageSuffix[problemId] || "atencion";
  return `/problem-${agePrefix}-${problemSuffix}.webp`;
};

// Preload images for selected age group
const preloadImagesForAge = (ageId: string) => {
  const agePrefix = ageImagePrefix[ageId] || "ninos";
  const suffixes = ["atencion", "desmotivacion", "sobrecarga", "fatiga", "olvidos"];
  suffixes.forEach(suffix => {
    const img = new Image();
    img.src = `/problem-${agePrefix}-${suffix}.webp`;
  });
};

// Lightweight particle for mobile - using logo colors
function ElectronParticle({ delay, startX, startY, isMobile }: { delay: number; startX: number; startY: number; isMobile: boolean }) {
  const isPurple = Math.random() > 0.5;
  const color = isPurple ? "#9333EA" : "#14B8A6";
  
  if (isMobile) {
    // Static glowing dot on mobile - no animation
    return (
      <div
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{ left: `${startX}%`, top: `${startY}%`, backgroundColor: color, opacity: 0.3 }}
      />
    );
  }
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ 
        left: `${startX}%`, 
        top: `${startY}%`,
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}50`
      }}
      animate={{
        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
        y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
        opacity: [0.2, 0.5, 0.3, 0.2],
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

// Lightweight line for mobile - using logo colors
function ElectronLine({ startX, startY, endX, endY, delay, isMobile }: { startX: number; startY: number; endX: number; endY: number; delay: number; isMobile: boolean }) {
  if (isMobile) return null; // No lines on mobile
  const isPurple = Math.random() > 0.5;
  return (
    <motion.div
      className="absolute h-0.5"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: `${Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)}%`,
        transform: `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`,
        transformOrigin: "left center",
        background: isPurple 
          ? "linear-gradient(to right, transparent, #9333EA, transparent)"
          : "linear-gradient(to right, transparent, #14B8A6, transparent)",
      }}
      animate={{
        opacity: [0, 0.4, 0],
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
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();
  const { setUserData } = useUserData();
  const [step, setStep] = useState<"age" | "problems" | "fingerprint" | "options">("age");
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Reduce particles on mobile for performance
  const electrons = useMemo(() => 
    Array.from({ length: isMobile ? 5 : 15 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      delay: Math.random() * 3,
    }))
  , [isMobile]);
  
  // No lines on mobile
  const lines = useMemo(() => 
    isMobile ? [] : Array.from({ length: 8 }, (_, i) => ({
      id: i,
      startX: Math.random() * 80 + 10,
      startY: Math.random() * 80 + 10,
      endX: Math.random() * 80 + 10,
      endY: Math.random() * 80 + 10,
      delay: Math.random() * 5,
    }))
  , [isMobile]);

  const handleAgeSelect = (ageId: string) => {
    playCardSound();
    setSelectedAge(ageId);
    // Preload problem images for this age group immediately
    preloadImagesForAge(ageId);
  };

  const handleProblemToggle = (problemId: string) => {
    if (expandedProblem === problemId) {
      playCardSound();
      setSelectedProblems(prev => 
        prev.includes(problemId)
          ? prev.filter(id => id !== problemId)
          : [...prev, problemId]
      );
    } else {
      playCardSound();
      setExpandedProblem(problemId);
    }
  };

  const handleContinue = () => {
    playButtonSound();
    if (step === "age" && selectedAge) {
      setStep("problems");
    } else if (step === "problems" && selectedProblems.length > 0) {
      setStep("fingerprint");
    }
  };

  // Cleanup function for scan resources
  const cleanupScan = useCallback((isSuccess: boolean) => {
    // Stop vibration
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(isSuccess ? [80, 40, 80] : 0);
    }
    
    // Stop and close audio
    try {
      if ((audioContextRef as any).current?.audio) {
        const audio = (audioContextRef as any).current.audio;
        audio.pause();
        audio.currentTime = 0;
        (audioContextRef as any).current = null;
      }
    } catch (e) {}
    
    // Clear timer
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  }, []);

  // Start scanning when finger touches
  const handleScanStart = useCallback(() => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    
    // Start continuous vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
      vibrationIntervalRef.current = setInterval(() => {
        navigator.vibrate(30);
      }, 100);
    }
    
    // Start scan sound from mp3
    try {
      const audio = new Audio('/fingerprint-sound.mp3');
      audio.loop = true;
      audio.volume = 0.5;
      audio.play();
      (audioContextRef as any).current = { audio };
    } catch (e) {}
    
    // Progress timer - complete after 1 second
    let progress = 0;
    scanTimerRef.current = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      
      if (progress >= 100) {
        // Cleanup first
        cleanupScan(true);
        // Transition to options
        setTimeout(() => {
          setStep("options");
          setIsScanning(false);
          setScanProgress(0);
        }, 150);
      }
    }, 100);
  }, [isScanning, cleanupScan]);

  const handleScanEnd = useCallback(() => {
    if (!isScanning) return;
    
    // Cancel if not complete
    cleanupScan(false);
    setIsScanning(false);
    setScanProgress(0);
  }, [isScanning, cleanupScan]);

  const handleOptionSelect = (option: "tests" | "training") => {
    playButtonSound();
    setUserData({
      ageGroup: selectedAge,
      ageLabel: getAgeLabel(selectedAge!),
      selectedProblems: selectedProblems
    });
    if (option === "tests") {
      setLocation("/tests");
    } else {
      setLocation(`/entrenamiento/${selectedAge || 'ninos'}`);
    }
  };

  const handleBack = () => {
    playButtonSound();
    if (step === "problems") {
      setStep("age");
      setExpandedProblem(null);
    } else if (step === "fingerprint") {
      setStep("problems");
    } else if (step === "options") {
      setStep("fingerprint");
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
      className="min-h-screen p-4 md:p-8 overflow-y-auto relative"
      style={{
        background: "linear-gradient(135deg, #FAFBFF 0%, #F0F4FF 50%, #F5FAFF 100%)"
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="selection-screen"
    >
      {/* Decorative X shape in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px]"
          initial={{ opacity: 0, rotate: -15 }}
          animate={{ opacity: 0.06, rotate: 0 }}
          transition={{ duration: 1 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M10 10 L45 50 L10 90 L20 90 L50 55 L80 90 L90 90 L55 50 L90 10 L80 10 L50 45 L20 10 Z" 
              fill="url(#xGradient)" />
            <defs>
              <linearGradient id="xGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#14B8A6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        
        {step === "age" && !isMobile && (
          <motion.img 
            src="/circuit-pattern.png" 
            alt=""
            className="absolute right-0 bottom-0 w-72 md:w-[400px] opacity-20"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: [0.15, 0.25, 0.15], x: 0 }}
            transition={{
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 0.8 }
            }}
            style={{ filter: "drop-shadow(0 0 20px rgba(147, 51, 234, 0.3))" }}
          />
        )}
        {step === "age" && isMobile && (
          <img 
            src="/circuit-pattern.png" 
            alt=""
            className="absolute right-0 bottom-0 w-48 opacity-10"
            loading="lazy"
          />
        )}
        
        {step === "problems" && !isMobile && (
          <motion.img 
            src="/x-background.png" 
            alt=""
            className="absolute left-0 top-20 w-48 md:w-72 opacity-10"
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 0.1, rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        )}
        {step === "problems" && isMobile && (
          <img 
            src="/x-background.png" 
            alt=""
            className="absolute left-0 top-20 w-32 opacity-[0.08]"
            loading="lazy"
          />
        )}
        
        {electrons.map((electron) => (
          <ElectronParticle
            key={electron.id}
            delay={electron.delay}
            startX={electron.startX}
            startY={electron.startY}
            isMobile={isMobile}
          />
        ))}
        
        {!isMobile && lines.map((line) => (
          <ElectronLine
            key={line.id}
            startX={line.startX}
            startY={line.startY}
            endX={line.endX}
            endY={line.endY}
            delay={line.delay}
            isMobile={isMobile}
          />
        ))}
      </div>

      <div className="max-w-lg mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {step === "age" && (
            <motion.div
              key="age-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="relative min-h-[85vh] flex flex-col"
            >
              {/* X-shaped girl image - full height, positioned to the left */}
              <motion.div 
                className="absolute top-0 bottom-0 pointer-events-none"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{ left: "25%", right: "-20%" }}
              >
                <img 
                  src="/girl-x-image.png" 
                  alt=""
                  className="h-full w-full object-contain object-right"
                  style={{
                    maskImage: "linear-gradient(to left, black 80%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to left, black 80%, transparent 100%)",
                  }}
                />
              </motion.div>

              {/* Title section - full width for 2-line layout */}
              <motion.div 
                className="text-left py-4 relative z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-3" style={{ color: "#9333EA" }}>
                  Descubre tu camino
                </p>
                
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight">
                  <span className="text-slate-700">Que esta </span>
                  <span className="relative inline-block">
                    <span style={{ background: "linear-gradient(90deg, #9333EA, #14B8A6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      frenando
                    </span>
                    <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full" style={{ background: "linear-gradient(90deg, #9333EA, #14B8A6)" }} />
                  </span>
                </h1>
                
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight mt-1">
                  <span style={{ background: "linear-gradient(90deg, #14B8A6, #9333EA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    tu potencial
                  </span>
                  <span className="text-slate-700"> hoy?</span>
                </h2>
              </motion.div>

              <motion.p
                className="text-left text-slate-500 text-sm mb-4 relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Selecciona tu grupo de edad
              </motion.p>

              {/* Age cards - grid layout matching design */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 relative z-10 w-full px-4 space-y-2"
                role="radiogroup"
                aria-label="Selecciona tu grupo de edad"
              >
                {/* Row 1: NIÑOS | ADOLESCENTES */}
                <div className="grid grid-cols-2 gap-2">
                  {[ageGroups[0], ageGroups[1]].map((group) => {
                    const isSelected = selectedAge === group.id;
                    return (
                      <motion.div key={group.id} variants={itemVariants}>
                        <motion.div
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => !isSelected && handleAgeSelect(group.id)}
                          className="w-full rounded-2xl border-2 overflow-hidden cursor-pointer card-touch relative bg-white/90 backdrop-blur-sm"
                          style={{
                            borderColor: isSelected ? "#14B8A6" : "rgba(147, 51, 234, 0.3)",
                            boxShadow: isSelected 
                              ? "0 0 30px rgba(20, 184, 166, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)" 
                              : "0 4px 20px rgba(147, 51, 234, 0.1)"
                          }}
                          data-testid={`button-age-${group.id}`}
                        >
                          <div className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.2), rgba(147, 51, 234, 0.2), transparent)", backgroundSize: "200% 100%", animation: "shimmer 3s ease-in-out infinite" }} />
                          <div className="flex flex-col">
                            <div className="w-full h-32 overflow-hidden">
                              <img src={group.image} alt={group.label} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="flex items-center justify-between p-2">
                              <div>
                                <span className="font-bold text-sm text-slate-800 block leading-tight">{group.label}</span>
                                <span className="text-xs block" style={{ color: "#14B8A6" }}>{group.ageRange}</span>
                              </div>
                              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: isSelected ? "#14B8A6" : "rgba(147, 51, 234, 0.4)", backgroundColor: isSelected ? "#14B8A6" : "transparent" }}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Row 2: UNIVERSITARIOS | PROFESIONALES */}
                <div className="grid grid-cols-2 gap-2">
                  {[ageGroups[2], ageGroups[3]].map((group) => {
                    const isSelected = selectedAge === group.id;
                    return (
                      <motion.div key={group.id} variants={itemVariants}>
                        <motion.div
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => !isSelected && handleAgeSelect(group.id)}
                          className="w-full rounded-2xl border-2 overflow-hidden cursor-pointer card-touch relative bg-white/90 backdrop-blur-sm"
                          style={{
                            borderColor: isSelected ? "#14B8A6" : "rgba(147, 51, 234, 0.3)",
                            boxShadow: isSelected 
                              ? "0 0 30px rgba(20, 184, 166, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)" 
                              : "0 4px 20px rgba(147, 51, 234, 0.1)"
                          }}
                          data-testid={`button-age-${group.id}`}
                        >
                          <div className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.2), rgba(147, 51, 234, 0.2), transparent)", backgroundSize: "200% 100%", animation: "shimmer 3s ease-in-out infinite" }} />
                          <div className="flex flex-col">
                            <div className="w-full h-32 overflow-hidden">
                              <img src={group.image} alt={group.label} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="flex items-center justify-between p-2">
                              <div>
                                <span className="font-bold text-sm text-slate-800 block leading-tight">{group.label}</span>
                                <span className="text-xs block" style={{ color: "#14B8A6" }}>{group.ageRange}</span>
                              </div>
                              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: isSelected ? "#14B8A6" : "rgba(147, 51, 234, 0.4)", backgroundColor: isSelected ? "#14B8A6" : "transparent" }}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Row 3: ADULTO MAYOR (full width) */}
                <div className="w-full">
                  {(() => {
                    const group = ageGroups[4];
                    const isSelected = selectedAge === group.id;
                    return (
                      <motion.div key={group.id} variants={itemVariants}>
                        <motion.div
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => !isSelected && handleAgeSelect(group.id)}
                          className="w-full h-36 rounded-2xl border-2 overflow-hidden cursor-pointer card-touch relative bg-white/90 backdrop-blur-sm"
                          style={{
                            borderColor: isSelected ? "#14B8A6" : "rgba(147, 51, 234, 0.3)",
                            boxShadow: isSelected 
                              ? "0 0 30px rgba(20, 184, 166, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)" 
                              : "0 4px 20px rgba(147, 51, 234, 0.1)"
                          }}
                          data-testid={`button-age-${group.id}`}
                        >
                          <div className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.2), rgba(147, 51, 234, 0.2), transparent)", backgroundSize: "200% 100%", animation: "shimmer 3s ease-in-out infinite" }} />
                          <div className="flex h-full">
                            <div className="w-36 h-full overflow-hidden flex-shrink-0">
                              <img src={group.image} alt={group.label} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center p-4">
                              <span className="font-bold text-lg text-slate-800 block leading-tight">{group.label}</span>
                              <span className="text-sm mt-1 block" style={{ color: "#14B8A6" }}>{group.ageRange}</span>
                              <div className="w-5 h-5 rounded-full border-2 mt-2 flex items-center justify-center" style={{ borderColor: isSelected ? "#14B8A6" : "rgba(147, 51, 234, 0.4)", backgroundColor: isSelected ? "#14B8A6" : "transparent" }}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })()}
                </div>

                {/* Continue button when selected */}
                {selectedAge && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-2"
                  >
                    <Button
                      onClick={handleContinue}
                      size="lg"
                      className="w-full text-base font-bold border-0 btn-instant text-white"
                      style={{ background: "linear-gradient(90deg, #9333EA, #14B8A6)" }}
                      data-testid="button-continue-age"
                    >
                      CONTINUAR
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {step === "problems" && (
            <motion.div
              key="problems-selection"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium btn-instant"
                style={{ borderColor: "#14B8A6", backgroundColor: "rgba(20, 184, 166, 0.1)", color: "#14B8A6" }}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

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
                  {!isMobile && (
                    <motion.div
                      className="absolute -inset-4 rounded-3xl opacity-20 blur-xl"
                      style={{ background: "linear-gradient(135deg, #14B8A6, #9333EA)" }}
                      animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}
                  
                  <div className="relative">
                    <p className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-2" style={{ color: "#9333EA" }}>
                      Identifica tu reto
                    </p>
                    
                    <h1 className="text-3xl md:text-5xl font-black leading-tight">
                      <span className="text-slate-700">Cual es tu mayor</span>
                    </h1>
                    
                    <h2 className="text-3xl md:text-5xl font-black leading-tight mt-1">
                      <span className="relative inline-block">
                        <span style={{ background: "linear-gradient(90deg, #9333EA, #14B8A6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          desafio?
                        </span>
                        <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full" style={{ background: "linear-gradient(90deg, #14B8A6, #9333EA)" }} />
                      </span>
                    </h2>
                  </div>
                </motion.div>
              </motion.div>

              <motion.p
                className="text-center text-slate-500 text-sm"
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
                        className="w-full rounded-2xl border-2 overflow-hidden text-left card-touch bg-white/90 backdrop-blur-sm"
                        style={{
                          borderColor: isSelected ? "#9333EA" : "rgba(147, 51, 234, 0.2)",
                          boxShadow: isSelected 
                            ? "0 0 25px rgba(147, 51, 234, 0.3)" 
                            : "0 4px 20px rgba(147, 51, 234, 0.08)"
                        }}
                        data-testid={`button-problem-${problem.id}`}
                      >
                        <AnimatePresence mode="wait">
                          {isExpanded ? (
                            <motion.div
                              key="expanded"
                              initial={{ opacity: 0, scaleY: 0.9 }}
                              animate={{ opacity: 1, scaleY: 1 }}
                              exit={{ opacity: 0, scaleY: 0.9 }}
                              transition={{ duration: 0.12, ease: "easeOut" }}
                              style={{ transformOrigin: "top", willChange: "transform, opacity" }}
                            >
                              <div className="relative">
                                <div className="w-full h-48 md:h-56 bg-gradient-to-br from-purple-900/50 to-cyan-900/50">
                                  <img 
                                    src={getProblemImage(selectedAge, problem.id)} 
                                    alt={problem.title}
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                  />
                                </div>
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
                                    loading="lazy"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-bold text-base md:text-lg" style={{ color: isSelected ? "#9333EA" : "#334155" }}>
                                    {problem.title}
                                  </span>
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                    {problem.description}
                                  </p>
                                </div>
                                <motion.div
                                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                  style={{
                                    borderColor: isSelected ? "#9333EA" : "rgba(147, 51, 234, 0.3)",
                                    backgroundColor: isSelected ? "#9333EA" : "transparent"
                                  }}
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
                  className="w-full text-lg font-bold border-0 btn-instant text-white"
                  style={{ background: "linear-gradient(90deg, #14B8A6, #9333EA)" }}
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
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center min-h-[70vh] space-y-8"
            >
              <motion.div
                className="relative"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-3xl md:text-4xl font-black text-center">
                  <span style={{ background: "linear-gradient(90deg, #14B8A6, #9333EA, #14B8A6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Continuemos
                  </span>
                </h1>
              </motion.div>

              <motion.button
                onTouchStart={handleScanStart}
                onTouchEnd={handleScanEnd}
                onTouchCancel={handleScanEnd}
                onMouseDown={handleScanStart}
                onMouseUp={handleScanEnd}
                onMouseLeave={handleScanEnd}
                className="relative w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center cursor-pointer touch-none select-none"
                whileHover={{ scale: 1.02 }}
                animate={isScanning ? { scale: 0.95 } : { scale: 1 }}
                data-testid="button-fingerprint"
              >
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle, transparent 40%, rgba(20, 184, 166, 0.15) 70%, transparent 100%)",
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
                    borderColor: "#14B8A6",
                    boxShadow: isScanning 
                      ? "0 0 30px #14B8A6, 0 0 60px rgba(20, 184, 166, 0.5), inset 0 0 30px rgba(20, 184, 166, 0.3)"
                      : "0 0 15px rgba(20, 184, 166, 0.5), 0 0 30px rgba(20, 184, 166, 0.3)",
                  }}
                  animate={isScanning ? {
                    scale: [1, 1.05, 1],
                    borderColor: ["#14B8A6", "#9333EA", "#14B8A6"],
                  } : {}}
                  transition={{ duration: 0.4, repeat: Infinity }}
                />
                
                {/* Inner background - lighter for white theme */}
                <div 
                  className="absolute inset-4 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #F0F4FF 0%, #E8F0FE 100%)",
                    boxShadow: "inset 0 2px 10px rgba(147, 51, 234, 0.1)"
                  }}
                />
                
                {/* Fingerprint Image */}
                <motion.div
                  className="relative w-32 h-32 md:w-40 md:h-40 z-10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <img 
                    src="/fingerprint-custom.png" 
                    alt="Huella digital"
                    className="w-full h-full object-contain"
                    style={{
                      filter: isScanning 
                        ? "drop-shadow(0 0 25px #14B8A6) drop-shadow(0 0 50px #9333EA)"
                        : "drop-shadow(0 0 15px rgba(20, 184, 166, 0.6))",
                    }}
                  />
                  {/* Scanning line overlay */}
                  {isScanning && (
                    <motion.div
                      className="absolute left-0 right-0 h-1"
                      style={{ background: "linear-gradient(to right, transparent, #14B8A6, transparent)", boxShadow: "0 0 20px #14B8A6" }}
                      initial={{ top: "10%" }}
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>
                
                {/* Scan effect overlay */}
                {isScanning && (
                  <motion.div
                    className="absolute inset-4 rounded-full"
                    style={{
                      background: "linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.3) 50%, transparent 100%)",
                    }}
                    initial={{ y: "-100%" }}
                    animate={{ y: ["−100%", "100%", "−100%"] }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                )}
              </motion.button>

              <motion.div
                className="text-center space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* Progress bar */}
                {isScanning && (
                  <div className="w-48 h-2 rounded-full bg-slate-200 overflow-hidden mx-auto">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ 
                        background: "linear-gradient(90deg, #14B8A6, #9333EA)",
                        boxShadow: "0 0 10px #14B8A6",
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                )}
                
                <motion.p
                  className="text-xl md:text-2xl font-bold"
                  style={{
                    color: isScanning ? "#14B8A6" : "#9333EA",
                    textShadow: isScanning ? "0 0 20px rgba(20, 184, 166, 0.5)" : "none",
                  }}
                  animate={!isScanning ? { opacity: [0.8, 1, 0.8] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {isScanning ? "Escaneando..." : "Presiona aquí"}
                </motion.p>
                <p className="text-sm text-slate-500">
                  {isScanning ? "Mantén presionado" : "Mantén tu dedo para continuar"}
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
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium btn-instant"
                style={{ borderColor: "#9333EA", backgroundColor: "rgba(147, 51, 234, 0.1)", color: "#9333EA" }}
                data-testid="button-back-options"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

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
                  {!isMobile && (
                    <motion.div
                      className="absolute -inset-4 rounded-3xl opacity-20 blur-xl"
                      style={{ background: "linear-gradient(135deg, #14B8A6, #9333EA)" }}
                      animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}
                  
                  <div className="relative">
                    <p className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-2" style={{ color: "#14B8A6" }}>
                      Elige tu camino
                    </p>
                    
                    <h1 className="text-3xl md:text-5xl font-black leading-tight">
                      <span className="relative inline-block">
                        <span style={{ background: "linear-gradient(90deg, #14B8A6, #9333EA, #14B8A6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          Desafía tu Mente
                        </span>
                        <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full" style={{ background: "linear-gradient(90deg, #9333EA, #14B8A6, #9333EA)" }} />
                      </span>
                    </h1>
                  </div>
                </motion.div>
                
                <motion.p
                  className="text-sm md:text-base text-slate-500 max-w-sm mx-auto"
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
                <motion.div
                  variants={itemVariants}
                  onClick={() => handleOptionSelect("tests")}
                  className="w-full rounded-3xl overflow-hidden text-left relative group cursor-pointer card-touch"
                  style={{
                    background: "linear-gradient(135deg, #9333EA 0%, #7C3AED 50%, #14B8A6 100%)",
                  }}
                  data-testid="button-option-tests"
                >
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.4) 0%, transparent 70%)",
                    }}
                  />
                  {!isMobile && (
                    <motion.div
                      className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-60 blur-xl transition-all duration-500"
                      style={{ background: "linear-gradient(135deg, #9333EA, #14B8A6)" }}
                    />
                  )}
                  
                  <div className="relative p-5 flex items-center gap-4">
                    <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 relative">
                      <img 
                        src="/brain-head.png" 
                        alt="Tests cognitivos"
                        className="w-full h-full object-contain relative z-10"
                        loading="lazy"
                      />
                    </div>
                    
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
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  onClick={() => handleOptionSelect("training")}
                  className="w-full rounded-3xl overflow-hidden text-left relative group cursor-pointer card-touch"
                  style={{
                    background: "linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #9333EA 100%)",
                  }}
                  data-testid="button-option-training"
                >
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.4) 0%, transparent 70%)",
                    }}
                  />
                  {!isMobile && (
                    <motion.div
                      className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-60 blur-xl transition-all duration-500"
                      style={{ background: "linear-gradient(135deg, #14B8A6, #9333EA)" }}
                    />
                  )}
                  
                  <div className="relative p-5 flex items-center gap-4">
                    <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 relative">
                      <img 
                        src="/brain-cube.png" 
                        alt="Entrenamiento"
                        className="w-full h-full object-contain relative z-10"
                        loading="lazy"
                      />
                    </div>
                    
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
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
