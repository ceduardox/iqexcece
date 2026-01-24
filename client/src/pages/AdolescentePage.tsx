import { useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Brain, Target } from "lucide-react";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";
import { Button } from "@/components/ui/button";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const options = [
  {
    id: "lectura",
    label: "LECTURA",
    subtitle: "Adolescente",
    description: "Comprensión y análisis de textos",
    icon: Brain,
    gradient: "from-fuchsia-500 via-purple-500 to-indigo-500",
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
];

function ModernCard({
  option,
  index,
  onClick,
}: {
  option: typeof options[0];
  index: number;
  onClick: () => void;
}) {
  const Icon = option.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -50, rotateY: -15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.6, type: "spring" }}
      onClick={onClick}
      className="cursor-pointer group"
      data-testid={`card-option-${option.id}`}
    >
      <motion.div
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: `0 8px 32px ${option.glowColor}`,
        }}
        whileHover={{ 
          scale: 1.02, 
          boxShadow: `0 15px 50px ${option.glowColor}`,
        }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
        />
        
        <div className="relative flex items-center gap-5">
          <motion.div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${option.gradient}`}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          
          <div className="flex-1">
            <p className="text-purple-300 text-sm font-medium mb-1" data-testid={`text-option-subtitle-${option.id}`}>{option.subtitle}</p>
            <h3 className="text-xl font-bold text-white mb-1" data-testid={`text-option-label-${option.id}`}>{option.label}</h3>
            <p className="text-gray-400 text-sm" data-testid={`text-option-description-${option.id}`}>{option.description}</p>
          </div>
          
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
            whileHover={{ scale: 1.2, background: "rgba(255,255,255,0.2)" }}
          >
            <ArrowLeft className="w-5 h-5 text-white rotate-180" />
          </motion.div>
        </div>
        
        <motion.div
          className="absolute top-2 right-2"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function AdolescentePage() {
  const [, setLocation] = useLocation();
  const { updateUserData } = useUserData();

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleOptionSelect = useCallback(() => {
    playCardSound();
    updateUserData({ childCategory: "adolescentes" });
    setLocation("/adolescente-reading");
  }, [updateUserData, setLocation]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)"
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
            top: "-20%",
            right: "-20%",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)",
            bottom: "10%",
            left: "-15%",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen safe-area-inset">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between px-5 py-5"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-2xl bg-white/10 backdrop-blur-md border-0"
            data-testid="button-back-adolescente"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Button>
          
          <motion.div 
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            animate={{ boxShadow: ["0 0 20px rgba(139,92,246,0.3)", "0 0 30px rgba(236,72,153,0.3)", "0 0 20px rgba(139,92,246,0.3)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">Adolescente</span>
          </motion.div>
        </motion.header>

        <motion.div
          className="px-6 pt-8 pb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "rgba(139, 92, 246, 0.2)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Test de Lectura</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-black text-transparent bg-clip-text mb-4"
            style={{ 
              backgroundImage: "linear-gradient(135deg, #fff 0%, #a78bfa 50%, #f0abfc 100%)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            data-testid="text-main-title"
          >
            Descubre tu potencial
          </motion.h1>
          
          <motion.p 
            className="text-gray-400 text-lg max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            Elige una opción para comenzar tu entrenamiento cognitivo
          </motion.p>
          
          <motion.div
            className="flex justify-center gap-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ 
                  background: i === 0 ? "#a78bfa" : i === 1 ? "#f0abfc" : "#fbbf24",
                }}
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: i * 0.15, 
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        <div className="px-6 pb-8 space-y-4">
          {options.map((option, index) => (
            <ModernCard
              key={option.id}
              option={option}
              index={index}
              onClick={handleOptionSelect}
            />
          ))}
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="flex items-center gap-2 px-6 py-3 rounded-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">Potencia tu mente</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
