import { useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
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
      transition={{ delay: 0.4 + index * 0.08, duration: 0.3 }}
      onClick={onClick}
      className="cursor-pointer"
      data-testid={`card-reading-${number}`}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow"
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <span 
          className="text-4xl font-extralight w-14 text-center"
          style={{ color: "#A855F7" }}
        >
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
  const { userData } = useUserData();

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

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
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #7C3AED 0%, #9333EA 40%, #A855F7 100%)" }}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center px-4 py-4 safe-area-inset"
      >
        <motion.button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          whileTap={{ scale: 0.9 }}
          data-testid="button-back-reading"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <h1 className="flex-1 text-center text-xl font-bold text-white pr-10">
          {testName}
        </h1>
      </motion.header>

      <div className="relative flex-shrink-0 h-64 flex items-end justify-center px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10"
        >
          <img 
            src="https://img.freepik.com/free-vector/happy-children-holding-books_1308-132774.jpg"
            alt="Niño leyendo"
            className="w-56 h-56 object-contain drop-shadow-2xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4, type: "spring" }}
          className="absolute right-4 bottom-8 z-20"
        >
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-white/30">
            <img 
              src="https://img.freepik.com/free-vector/cute-book-reading-cartoon-icon-illustration_138676-2690.jpg"
              alt="Libro"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/30"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-1 bg-gray-50 dark:bg-background rounded-t-[2rem] -mt-4 px-6 pt-8 pb-8"
      >
        <div className="mb-6">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-purple-600 dark:text-purple-400 font-semibold text-sm mb-1"
          >
            {categoryLabel}
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Elige una lectura
          </motion.h2>
        </div>

        <div className="space-y-3">
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
      </motion.div>
    </motion.div>
  );
}
