import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

// All images to preload
const imagesToPreload = [
  // Age group images
  "/age-ninos.png",
  "/age-adolescentes.png", 
  "/age-universitarios.png",
  "/age-profesionales.png",
  "/age-adulto-mayor.png",
  "/girl-x-image.png",
  "/fingerprint-custom.png",
  // Problem images for all age groups
  "/problem-ninos-atencion.webp",
  "/problem-ninos-desmotivacion.webp",
  "/problem-ninos-sobrecarga.webp",
  "/problem-ninos-fatiga.webp",
  "/problem-ninos-olvidos.webp",
  "/problem-adolescentes-atencion.webp",
  "/problem-adolescentes-desmotivacion.webp",
  "/problem-adolescentes-sobrecarga.webp",
  "/problem-adolescentes-fatiga.webp",
  "/problem-adolescentes-olvidos.webp",
  "/problem-universitarios-atencion.webp",
  "/problem-universitarios-desmotivacion.webp",
  "/problem-universitarios-sobrecarga.webp",
  "/problem-universitarios-fatiga.webp",
  "/problem-universitarios-olvidos.webp",
  "/problem-profesionales-atencion.webp",
  "/problem-profesionales-desmotivacion.webp",
  "/problem-profesionales-sobrecarga.webp",
  "/problem-profesionales-fatiga.webp",
  "/problem-profesionales-olvidos.webp",
  "/problem-adulto-atencion.webp",
  "/problem-adulto-desmotivacion.webp",
  "/problem-adulto-sobrecarga.webp",
  "/problem-adulto-fatiga.webp",
  "/problem-adulto-olvidos.webp",
];

// All sounds to preload
const soundsToPreload = [
  "/card.mp3",
  "/iphone.mp3",
  "/fingerprint-sound.mp3",
];

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function LoadingScreen({ onComplete, duration = 3500 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload all assets on mount
  useEffect(() => {
    // Preload images
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Preload sounds using fetch for faster caching
    soundsToPreload.forEach(src => {
      fetch(src)
        .then(res => res.arrayBuffer())
        .catch(() => {});
    });
  }, []);

  // Play open.mp3 sound on mount
  useEffect(() => {
    try {
      const audio = new Audio('/open.mp3');
      audio.volume = 0.6;
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch (e) {}
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      data-testid="loading-screen"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        data-testid="video-background"
      >
        <source src="/loading-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-md">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-foreground tracking-wider text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            textShadow: "0 0 20px hsl(187 85% 53% / 0.6), 0 0 40px hsl(187 85% 53% / 0.3)"
          }}
          data-testid="text-loading-title"
        >
          CARGANDO
        </motion.h1>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div 
            className="relative w-full h-6 bg-muted/50 rounded-full overflow-hidden border-2 border-primary/40"
            style={{
              boxShadow: "0 0 15px hsl(187 85% 53% / 0.3), inset 0 0 10px hsl(187 85% 53% / 0.1)"
            }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-cyan-400 to-primary rounded-full"
              style={{ 
                width: `${progress}%`,
                boxShadow: "0 0 15px hsl(187 85% 53% / 0.8), 0 0 30px hsl(187 85% 53% / 0.4)"
              }}
              transition={{ duration: 0.1 }}
            />

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"
              style={{ 
                left: `calc(${Math.max(progress - 1, 0)}% - 6px)`,
                boxShadow: "0 0 10px hsl(187 85% 53%), 0 0 20px hsl(187 85% 53%)"
              }}
            />
          </div>

          <motion.p
            className="text-center text-muted-foreground mt-3 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {Math.round(progress)}%
          </motion.p>
        </motion.div>

        <motion.h2
          className="text-xl md:text-2xl font-bold text-accent tracking-widest"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            textShadow: "0 0 10px hsl(187 85% 53% / 0.5)",
          }}
          data-testid="text-brand"
        >
          IQEXPONENCIAL
        </motion.h2>

        <motion.div
          className="flex gap-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-accent rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
