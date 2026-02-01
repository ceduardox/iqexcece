import { useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Brain, HelpCircle, Search, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";

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

const testIcons = {
  lectura: BookOpen,
  razonamiento: Brain,
  cerebral: HelpCircle,
  iq: Search,
};

const testGradients = {
  lectura: "linear-gradient(135deg, #4DD0E1 0%, #26C6DA 50%, #00ACC1 100%)",
  razonamiento: "linear-gradient(135deg, #F48FB1 0%, #CE93D8 50%, #7E57C2 100%)",
  cerebral: "linear-gradient(135deg, #E1BEE7 0%, #CE93D8 50%, #BA68C8 100%)",
  iq: "linear-gradient(135deg, #90CAF9 0%, #7986CB 50%, #5C6BC0 100%)",
};

function TestCard({ 
  testId,
  title,
  description,
  index, 
  onClick 
}: { 
  testId: string;
  title: string;
  description: string;
  index: number;
  onClick: () => void;
}) {
  const Icon = testIcons[testId as keyof typeof testIcons] || Brain;
  const gradient = testGradients[testId as keyof typeof testGradients] || testGradients.razonamiento;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
      onClick={onClick}
      className="cursor-pointer card-touch"
      data-testid={`card-test-${testId}`}
    >
      <motion.div
        className="relative overflow-hidden rounded-3xl p-4 flex items-center gap-4"
        style={{ background: gradient }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
          <div className="relative w-20 h-20 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-10 h-10 text-white drop-shadow-lg" />
          </div>
        </div>
        
        <div className="flex-1 text-white py-2">
          <p className="text-sm font-medium opacity-90 mb-0.5">Test</p>
          <h3 className="text-2xl font-black mb-1">{title}</h3>
          <p className="text-sm opacity-90 leading-snug">{description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TestsPage() {
  const [, setLocation] = useLocation();
  const { updateUserData } = useUserData();

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleTestClick = useCallback((testId: string) => {
    playCardSound();
    updateUserData({ selectedTest: testId });
    setLocation(`/age-selection/${testId}`);
  }, [updateUserData, setLocation]);

  const genericTestCategories = [
    { id: "lectura", title: "Lectura", description: "Evalúa tu velocidad y comprensión lectora" },
    { id: "razonamiento", title: "Razonamiento", description: "Pon a prueba tu lógica y pensamiento analítico" },
    { id: "cerebral", title: "Test Cerebral", description: "Ejercicios para evaluar tus capacidades cognitivas" },
    { id: "iq", title: "Test IQ", description: "Mide tu coeficiente intelectual con ejercicios variados" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white overflow-hidden relative"
    >
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
        }}
      />

      <div className="relative z-10 min-h-screen safe-area-inset">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-sm"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-purple-600 font-medium"
            data-testid="button-back-tests"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold">
            Diagnóstico
          </div>
          
          <button 
            className="p-2 text-gray-400"
            data-testid="button-menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </motion.header>

        <motion.div
          className="px-6 pt-4 pb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Descubre tu potencial
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Explora tu mente con nuestra serie de tests cognitivos interactivos.
          </p>
        </motion.div>

        <div className="px-4 pb-8 space-y-4">
          {genericTestCategories.map((category, index) => (
            <TestCard
              key={category.id}
              testId={category.id}
              title={category.title}
              description={category.description}
              index={index}
              onClick={() => handleTestClick(category.id)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
