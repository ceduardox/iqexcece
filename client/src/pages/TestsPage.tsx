import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Zap, Target, Cpu, ChevronRight } from "lucide-react";
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
  subtitle: string;
  icon: typeof Brain;
  color: string;
  glowColor: string;
}

const testCategories: TestCategory[] = [
  {
    id: "memoria",
    title: "MEMORIA",
    subtitle: "Retención y recuperación",
    icon: Brain,
    color: "hsl(280 70% 60%)",
    glowColor: "hsl(280 70% 60% / 0.5)"
  },
  {
    id: "atencion",
    title: "ATENCIÓN",
    subtitle: "Concentración y enfoque",
    icon: Target,
    color: "hsl(187 85% 53%)",
    glowColor: "hsl(187 85% 53% / 0.5)"
  },
  {
    id: "razonamiento",
    title: "RAZONAMIENTO",
    subtitle: "Lógica y análisis",
    icon: Cpu,
    color: "hsl(320 70% 55%)",
    glowColor: "hsl(320 70% 55% / 0.5)"
  },
  {
    id: "velocidad",
    title: "VELOCIDAD",
    subtitle: "Procesamiento rápido",
    icon: Zap,
    color: "hsl(45 90% 55%)",
    glowColor: "hsl(45 90% 55% / 0.5)"
  }
];

function HexCard({ 
  category, 
  index, 
  isSelected, 
  onSelect, 
  onStart 
}: { 
  category: TestCategory; 
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onStart: () => void;
}) {
  const Icon = category.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
      className="relative"
    >
      <motion.div
        onClick={onSelect}
        className="relative cursor-pointer card-touch"
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        data-testid={`card-test-${category.id}`}
      >
        <div 
          className="relative overflow-hidden rounded-2xl border-2 transition-all duration-200"
          style={{
            borderColor: isSelected ? category.color : 'hsl(187 85% 53% / 0.2)',
            background: isSelected 
              ? `linear-gradient(135deg, ${category.color}15 0%, transparent 50%, ${category.color}10 100%)`
              : 'hsl(0 0% 0% / 0.4)',
            boxShadow: isSelected 
              ? `0 0 30px ${category.glowColor}, inset 0 0 30px ${category.glowColor}` 
              : 'none'
          }}
        >
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: category.color }}
          />
          
          <div className="relative p-4 flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-xl flex items-center justify-center relative"
              style={{ 
                background: `linear-gradient(135deg, ${category.color}30 0%, ${category.color}10 100%)`,
                border: `1px solid ${category.color}50`
              }}
              animate={isSelected ? {
                boxShadow: [
                  `0 0 10px ${category.glowColor}`,
                  `0 0 25px ${category.glowColor}`,
                  `0 0 10px ${category.glowColor}`
                ]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Icon 
                className="w-7 h-7" 
                style={{ color: category.color }}
              />
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-bold tracking-wider"
                style={{ color: category.color }}
              >
                {category.title}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {category.subtitle}
              </p>
            </div>
            
            <motion.div
              animate={{ rotate: isSelected ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </div>

          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2">
                  <div 
                    className="h-px w-full mb-4"
                    style={{ background: `linear-gradient(90deg, transparent, ${category.color}50, transparent)` }}
                  />
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {["Nivel 1", "Nivel 2", "Nivel 3"].map((level, i) => (
                      <div
                        key={level}
                        className="text-center py-2 rounded-lg text-xs font-medium"
                        style={{
                          background: `${category.color}15`,
                          border: `1px solid ${category.color}30`,
                          color: category.color
                        }}
                      >
                        {level}
                      </div>
                    ))}
                  </div>
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStart();
                    }}
                    className="w-full py-3 rounded-xl font-bold tracking-wider text-sm btn-instant"
                    style={{
                      background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}CC 100%)`,
                      boxShadow: `0 0 20px ${category.glowColor}`,
                      color: 'white'
                    }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`button-start-${category.id}`}
                  >
                    INICIAR TEST
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TestsPage() {
  const [, setLocation] = useLocation();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showNino, setShowNino] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNino(true), 300);
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
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src="/nino2.png"
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Overlay image - nino (person in X) with swipe effect from right to left */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ clipPath: "inset(0 0 0 100%)" }}
          animate={{ clipPath: showNino ? "inset(0 0 0 0%)" : "inset(0 0 0 100%)" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <img
            src="/nino.png"
            alt=""
            className="w-full h-full object-cover object-center opacity-50"
          />
        </motion.div>

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
        
        {/* Subtle radial glow */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, hsl(187 85% 53% / 0.08) 0%, transparent 60%)"
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen px-4 py-6 safe-area-inset flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4 mb-4"
        >
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-cyan-400/50 bg-cyan-400/10 text-cyan-400 btn-instant"
            data-testid="button-back-tests"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 
              className="text-xl font-black tracking-[0.15em]"
              style={{
                background: "linear-gradient(135deg, hsl(187 85% 53%) 0%, hsl(280 70% 60%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              TESTS COGNITIVOS
            </h1>
            <p className="text-xs text-muted-foreground">
              Evalúa tu potencial mental
            </p>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center -mt-8">
          <div className="space-y-3 max-w-lg mx-auto w-full">
            {testCategories.map((category, index) => (
              <HexCard
                key={category.id}
                category={category}
                index={index}
                isSelected={selectedTest === category.id}
                onSelect={() => handleTestSelect(category.id)}
                onStart={() => handleStartTest(category.id)}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-4 pb-4"
        >
          <p className="text-xs text-muted-foreground/50">
            Powered by IQ<span style={{ color: "hsl(187 85% 53%)" }}>EXPONENCIAL</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
