import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Zap, Target, Activity, Cpu, Scan, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

class SoundPlayer {
  private audioContext: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private fallbackAudios: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      ['/card.mp3', '/iphone.mp3'].forEach(src => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.load();
        this.fallbackAudios.set(src, audio);
      });
      this.initWebAudio();
    }
  }

  private async initWebAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      for (const src of ['/card.mp3', '/iphone.mp3']) {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.buffers.set(src, audioBuffer);
      }
    } catch (e) {}
  }

  play(src: string, volume: number = 0.5) {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
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

interface TestCategory {
  id: string;
  title: string;
  description: string;
  icon: typeof Brain;
  gradient: string;
  features: string[];
}

const testCategories: TestCategory[] = [
  {
    id: "memoria",
    title: "Memoria",
    description: "Evalúa tu capacidad de retención y recuperación de información",
    icon: Brain,
    gradient: "from-purple-600 via-purple-500 to-cyan-500",
    features: ["Memoria visual", "Memoria auditiva", "Memoria de trabajo"]
  },
  {
    id: "atencion",
    title: "Atención",
    description: "Mide tu concentración y capacidad de enfoque",
    icon: Target,
    gradient: "from-cyan-500 via-blue-500 to-purple-600",
    features: ["Atención selectiva", "Atención sostenida", "Velocidad de procesamiento"]
  },
  {
    id: "razonamiento",
    title: "Razonamiento",
    description: "Analiza tu capacidad lógica y resolución de problemas",
    icon: Cpu,
    gradient: "from-purple-500 via-pink-500 to-cyan-400",
    features: ["Lógica deductiva", "Patrones abstractos", "Análisis espacial"]
  },
  {
    id: "velocidad",
    title: "Velocidad Mental",
    description: "Evalúa tu rapidez de procesamiento cognitivo",
    icon: Zap,
    gradient: "from-cyan-400 via-teal-500 to-purple-500",
    features: ["Tiempo de reacción", "Agilidad mental", "Procesamiento rápido"]
  }
];

export default function TestsPage() {
  const [, setLocation] = useLocation();
  const [showImage, setShowImage] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowImage(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = useCallback(() => {
    playButtonSound();
    setLocation("/");
  }, [setLocation]);

  const handleTestSelect = useCallback((testId: string) => {
    playCardSound();
    setSelectedTest(testId === selectedTest ? null : testId);
  }, [selectedTest]);

  const handleStartTest = useCallback((testId: string) => {
    playButtonSound();
    console.log("Starting test:", testId);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background overflow-hidden relative"
    >
      {/* Background Images with Swipe Effect */}
      <div className="fixed inset-0 z-0">
        {/* Base image - nino2 (cyan X logo) */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src="/nino2.png"
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Overlay image - nino (person in X) with swipe effect */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ clipPath: "inset(0 0 0 100%)" }}
          animate={{ clipPath: showImage ? "inset(0 0 0 0%)" : "inset(0 0 0 100%)" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <img
            src="/nino.png"
            alt=""
            className="w-full h-full object-cover object-center opacity-30"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen px-4 py-6 safe-area-inset">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-cyan-400/50 bg-cyan-400/10 text-cyan-400 btn-instant"
            data-testid="button-back-tests"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Title Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px hsl(187 85% 53% / 0.3)",
                  "0 0 40px hsl(187 85% 53% / 0.5)",
                  "0 0 20px hsl(187 85% 53% / 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center"
            >
              <Scan className="w-6 h-6 text-white" />
            </motion.div>
          </div>
          
          <h1 
            className="text-3xl md:text-5xl font-black tracking-[0.2em] mb-2"
            style={{
              background: "linear-gradient(135deg, hsl(187 85% 53%) 0%, hsl(280 70% 60%) 50%, hsl(187 85% 53%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 40px hsl(187 85% 53% / 0.3)",
            }}
          >
            TESTS COGNITIVOS
          </h1>
          
          <motion.div
            className="w-32 h-1 mx-auto rounded-full mb-4"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(187 85% 53%), hsl(280 70% 60%), transparent)",
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Descubre tu potencial cognitivo con nuestros tests científicamente diseñados
          </p>
        </motion.div>

        {/* Test Categories */}
        <motion.div
          className="space-y-4 max-w-lg mx-auto pb-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.3 }
            }
          }}
        >
          {testCategories.map((test, index) => {
            const isSelected = selectedTest === test.id;
            const IconComponent = test.icon;
            
            return (
              <motion.div
                key={test.id}
                variants={{
                  hidden: { opacity: 0, x: 50 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <motion.div
                  onClick={() => handleTestSelect(test.id)}
                  className={`rounded-2xl border-2 overflow-hidden cursor-pointer card-touch ${
                    isSelected
                      ? "border-cyan-400"
                      : "border-purple-500/30 bg-background/80 backdrop-blur-sm"
                  }`}
                  style={isSelected ? {
                    boxShadow: "0 0 30px hsl(187 85% 53% / 0.4), 0 0 60px hsl(280 70% 50% / 0.2)",
                  } : {}}
                  data-testid={`button-test-${test.id}`}
                >
                  <AnimatePresence mode="wait">
                    {isSelected ? (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scaleY: 0.9 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.9 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        style={{ transformOrigin: "top", willChange: "transform, opacity" }}
                        className={`bg-gradient-to-br ${test.gradient} p-5`}
                      >
                        <div className="flex items-start gap-4">
                          <motion.div
                            className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
                            animate={{ 
                              boxShadow: [
                                "0 0 10px rgba(255,255,255,0.3)",
                                "0 0 20px rgba(255,255,255,0.5)",
                                "0 0 10px rgba(255,255,255,0.3)"
                              ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <IconComponent className="w-7 h-7 text-white" />
                          </motion.div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-white mb-1">
                              {test.title}
                            </h3>
                            <p className="text-white/80 text-sm mb-4">
                              {test.description}
                            </p>
                            
                            <div className="space-y-2 mb-4">
                              {test.features.map((feature, i) => (
                                <motion.div
                                  key={feature}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-center gap-2"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  <span className="text-white/90 text-sm">{feature}</span>
                                </motion.div>
                              ))}
                            </div>
                            
                            <Button
                              onClick={(e) => { e.stopPropagation(); handleStartTest(test.id); }}
                              size="lg"
                              className="w-full text-base font-bold bg-white/20 hover:bg-white/30 border border-white/30 text-white btn-instant"
                              data-testid={`button-start-${test.id}`}
                            >
                              <Activity className="w-5 h-5 mr-2" />
                              INICIAR TEST
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.08 }}
                        className="p-4 flex items-center gap-4"
                      >
                        <div 
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${test.gradient} flex items-center justify-center flex-shrink-0`}
                          style={{
                            boxShadow: "0 0 15px hsl(187 85% 53% / 0.3)",
                          }}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground">
                            {test.title}
                          </h3>
                          <p className="text-muted-foreground text-sm truncate">
                            {test.description}
                          </p>
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-cyan-400/60 flex-shrink-0" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Floating decorative elements */}
        <div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-0">
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, hsl(210 40% 8%), transparent)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
