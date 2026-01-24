import { useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/lib/user-context";

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

const preescolarReadings = [
  { id: 1, title: "Paseando con mi perrito" },
  { id: 2, title: "El globo rojo" },
  { id: 3, title: "Mi primer día de clases" },
  { id: 4, title: "Los colores del arcoíris" },
  { id: 5, title: "El gato dormilón" },
];

const ninosReadings = [
  { id: 1, title: "La aventura del explorador" },
  { id: 2, title: "El misterio del jardín" },
  { id: 3, title: "Viaje a las estrellas" },
  { id: 4, title: "El tesoro escondido" },
  { id: 5, title: "Amigos del bosque" },
];

const testTitles: Record<string, string> = {
  lectura: "Test Lectura",
  razonamiento: "Test Razonamiento",
  cerebral: "Test Cerebral",
  iq: "Test IQ",
};

const categoryLabels: Record<string, string> = {
  preescolar: "Pre escolar",
  ninos: "Niños",
};

function ReadingCard({
  number,
  title,
  index,
  onClick,
}: {
  number: number;
  title: string;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
      onClick={onClick}
      className="cursor-pointer"
      data-testid={`card-reading-${number}`}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <span className="text-3xl font-light text-gray-300 dark:text-gray-600 w-12">
          {String(number).padStart(2, '0')}
        </span>
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex-1">
          {title}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function ReadingSelectionPage() {
  const [, setLocation] = useLocation();
  const { userData } = useUserData();

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleGoHome = useCallback(() => {
    playButtonSound();
    setLocation("/");
  }, [setLocation]);

  const handleReadingSelect = useCallback((readingId: number, title: string) => {
    playCardSound();
    console.log("Selected reading:", readingId, title, "category:", userData.childCategory);
  }, [userData.childCategory]);

  const testName = testTitles[userData.selectedTest || "lectura"] || "Test Lectura";
  const categoryLabel = categoryLabels[userData.childCategory || "preescolar"] || "Pre escolar";
  const readings = userData.childCategory === "ninos" ? ninosReadings : preescolarReadings;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-background flex flex-col"
    >
      <div 
        className="relative overflow-hidden pb-8"
        style={{
          background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #A855F7 100%)"
        }}
      >
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center px-4 py-4 safe-area-inset"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-white/20"
            data-testid="button-back-reading"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="flex-1 text-center text-xl font-bold text-white pr-6">
            {testName}
          </h1>
        </motion.header>

        <div className="relative h-64 flex items-end justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative z-10"
          >
            <svg viewBox="0 0 200 220" className="w-48 h-52">
              <circle cx="100" cy="70" r="45" fill="#FFDAB9"/>
              <ellipse cx="100" cy="55" rx="40" ry="35" fill="#8B4513"/>
              <path d="M 65 55 Q 70 35 100 40 Q 130 35 135 55" fill="#8B4513"/>
              <circle cx="85" cy="75" r="6" fill="#333"/>
              <circle cx="115" cy="75" r="6" fill="#333"/>
              <circle cx="87" cy="73" r="2" fill="white"/>
              <circle cx="117" cy="73" r="2" fill="white"/>
              <path d="M 90 95 Q 100 105 110 95" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <circle cx="70" cy="85" r="8" fill="#DDA0DD" opacity="0.4"/>
              <circle cx="130" cy="85" r="8" fill="#DDA0DD" opacity="0.4"/>
              <rect x="75" y="120" width="50" height="60" rx="8" fill="#40E0D0"/>
              <rect x="75" y="120" width="50" height="60" rx="8" fill="url(#shirtStripes)"/>
              <defs>
                <pattern id="shirtStripes" patternUnits="userSpaceOnUse" width="10" height="10">
                  <rect width="10" height="5" fill="#40E0D0"/>
                  <rect y="5" width="10" height="5" fill="#FFD700"/>
                </pattern>
              </defs>
              <path d="M 75 130 L 45 160" stroke="#FFDAB9" strokeWidth="12" strokeLinecap="round"/>
              <path d="M 45 160 L 30 140" stroke="#FFDAB9" strokeWidth="10" strokeLinecap="round"/>
              <path d="M 125 130 L 155 160" stroke="#FFDAB9" strokeWidth="12" strokeLinecap="round"/>
              <path d="M 155 160 L 170 140" stroke="#FFDAB9" strokeWidth="10" strokeLinecap="round"/>
              <rect x="80" y="175" width="18" height="30" rx="4" fill="#2F4F4F"/>
              <rect x="102" y="175" width="18" height="30" rx="4" fill="#2F4F4F"/>
              <rect x="78" y="200" width="22" height="10" rx="3" fill="#333"/>
              <rect x="100" y="200" width="22" height="10" rx="3" fill="#333"/>
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="absolute right-4 bottom-4"
          >
            <div className="w-20 h-20 relative">
              <svg viewBox="0 0 80 80" className="w-full h-full">
                <rect x="10" y="30" width="60" height="45" rx="5" fill="#4169E1"/>
                <rect x="15" y="35" width="50" height="35" rx="3" fill="#FFF8DC"/>
                <line x1="20" y1="45" x2="60" y2="45" stroke="#DDD" strokeWidth="2"/>
                <line x1="20" y1="52" x2="55" y2="52" stroke="#DDD" strokeWidth="2"/>
                <line x1="20" y1="59" x2="50" y2="59" stroke="#DDD" strokeWidth="2"/>
                <circle cx="40" cy="20" r="15" fill="#FFE4B5"/>
                <rect x="30" y="5" width="20" height="12" rx="3" fill="#4169E1"/>
                <circle cx="32" cy="11" r="3" fill="white"/>
                <circle cx="40" cy="11" r="3" fill="white"/>
                <circle cx="48" cy="11" r="3" fill="white"/>
                <circle cx="35" cy="18" r="3" fill="#333"/>
                <circle cx="45" cy="18" r="3" fill="#333"/>
                <circle cx="36" cy="17" r="1" fill="white"/>
                <circle cx="46" cy="17" r="1" fill="white"/>
                <path d="M 37 26 Q 40 29 43 26" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-purple-600 dark:text-purple-400 font-medium text-sm mb-1">
            {categoryLabel}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Elige una lectura
          </h2>
        </motion.div>

        <div className="space-y-3 pb-24">
          {readings.map((reading, index) => (
            <ReadingCard
              key={reading.id}
              number={reading.id}
              title={reading.title}
              index={index}
              onClick={() => handleReadingSelect(reading.id, reading.title)}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 safe-area-inset"
      >
        <Button
          variant="ghost"
          onClick={handleGoHome}
          className="flex items-center justify-center gap-2 w-full text-purple-600 dark:text-purple-400 font-semibold"
          data-testid="button-go-home"
        >
          <Home className="w-5 h-5" />
          <span>Ir al Inicio</span>
        </Button>
      </motion.div>
    </motion.div>
  );
}
