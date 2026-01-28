import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useUserData } from "@/lib/user-context";
import { ArrowLeft } from "lucide-react";

interface RazonamientoTest {
  id: number;
  title: string;
}

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

const categoryLabels: Record<string, string> = {
  preescolar: "Pre escolar",
  ninos: "Niño",
  adolescentes: "Adolescente",
  universitarios: "Universitario",
  profesionales: "Profesional",
  adulto_mayor: "Adulto Mayor",
};

const defaultTests: RazonamientoTest[] = [
  { id: 1, title: "RAZONAMIENTO 6" },
  { id: 2, title: "RAZONAMIENTO 5" },
  { id: 3, title: "RAZONAMIENTO 4" },
];

export default function RazonamientoSelectionPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ category?: string }>();
  const { userData, setUserData } = useUserData();
  const [tests] = useState<RazonamientoTest[]>(defaultTests);
  
  const categoria = params.category || userData.childCategory || "ninos";

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleTestSelect = useCallback((testId: number, testTitle: string) => {
    playCardSound();
    setUserData({ 
      ...userData, 
      selectedRazonamientoTest: testId,
      selectedRazonamientoTitle: testTitle,
      childCategory: categoria 
    });
    console.log("Selected razonamiento test:", testId, testTitle);
  }, [userData, setUserData, categoria]);

  const categoryLabel = categoryLabels[categoria] || "Niño";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-white"
    >
      {/* Hero Section with gradient background */}
      <div 
        className="relative w-full overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #6366F1 100%)",
          minHeight: "280px"
        }}
      >
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <motion.button
            onClick={handleBack}
            className="flex items-center gap-2 text-white font-semibold text-lg"
            whileTap={{ scale: 0.95 }}
            data-testid="button-back-razonamiento"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Test Razonamiento</span>
          </motion.button>
        </div>

        {/* Hero Image from reference */}
        <div className="absolute inset-0 flex items-center justify-center pt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative w-full max-w-xs h-48 flex items-center justify-center"
          >
            <img 
              src="/razonamiento-hero.jpeg"
              alt="Test Razonamiento"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-4 py-6 -mt-4 bg-white rounded-t-3xl relative z-10">
        {/* Category Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-cyan-500 font-semibold text-sm mb-1"
        >
          {categoryLabel}
        </motion.p>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-gray-800 mb-6"
        >
          Elige un test
        </motion.h2>

        {/* Test Options */}
        <div className="space-y-3">
          {tests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => handleTestSelect(test.id, test.title)}
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer card-touch"
              data-testid={`button-razonamiento-test-${test.id}`}
            >
              {/* Number */}
              <span 
                className="text-3xl font-light"
                style={{ color: "#14B8A6" }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              
              {/* Test Title */}
              <span className="text-lg font-bold text-gray-800 tracking-wide">
                {test.title}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
