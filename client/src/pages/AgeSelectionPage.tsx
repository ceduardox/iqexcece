import { useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Baby, GraduationCap, Users, Briefcase } from "lucide-react";
import { useLocation, useParams } from "wouter";
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

const ageCategories = [
  {
    id: "preescolar",
    label: "Pre-escolar",
    ageRange: "3-5 años",
    icon: Baby,
    gradient: "linear-gradient(135deg, #FFB347 0%, #FF9A56 50%, #FF7043 100%)",
    ageGroup: "preescolar",
  },
  {
    id: "ninos",
    label: "Niños",
    ageRange: "6-12 años",
    icon: Users,
    gradient: "linear-gradient(135deg, #7C4DFF 0%, #651FFF 50%, #6200EA 100%)",
    ageGroup: "ninos",
  },
  {
    id: "adolescentes",
    label: "Adolescentes",
    ageRange: "13-17 años",
    icon: GraduationCap,
    gradient: "linear-gradient(135deg, #00BCD4 0%, #00ACC1 50%, #0097A7 100%)",
    ageGroup: "adolescentes",
  },
  {
    id: "adultos",
    label: "Adultos",
    ageRange: "18+ años",
    icon: Briefcase,
    gradient: "linear-gradient(135deg, #EC407A 0%, #D81B60 50%, #AD1457 100%)",
    ageGroup: "adultos",
  },
];

function AgeCategoryCard({
  category,
  index,
  onClick,
}: {
  category: typeof ageCategories[0];
  index: number;
  onClick: () => void;
}) {
  const Icon = category.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
      onClick={onClick}
      className="cursor-pointer"
      data-testid={`card-age-${category.id}`}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4"
        style={{ background: category.gradient }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <div className="flex-1 text-white">
          <h3 className="text-xl font-bold mb-0.5">{category.label}</h3>
          <p className="text-sm opacity-90">{category.ageRange}</p>
        </div>
        
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AgeSelectionPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ testId: string }>();
  const testId = params.testId || "lectura";
  const { updateUserData } = useUserData();

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleAgeSelect = useCallback((category: typeof ageCategories[0]) => {
    playCardSound();
    updateUserData({ 
      ageGroup: category.ageGroup, 
      ageLabel: category.label 
    });
    
    if (testId === "lectura") {
      if (category.ageGroup === "preescolar" || category.ageGroup === "ninos") {
        setLocation("/child-category");
      } else if (category.ageGroup === "adolescentes") {
        setLocation("/adolescente");
      } else if (category.ageGroup === "adultos") {
        setLocation("/reading-selection/universitarios");
      } else {
        setLocation(`/reading-selection/${category.ageGroup}`);
      }
    } else if (testId === "razonamiento") {
      const razonamientoCategory = category.ageGroup === "adultos" ? "universitarios" : category.ageGroup;
      setLocation(`/razonamiento-selection/${razonamientoCategory}`);
    } else if (testId === "cerebral") {
      setLocation("/cerebral/seleccion");
    } else if (testId === "iq") {
      setLocation("/cerebral/seleccion");
    }
  }, [testId, updateUserData, setLocation]);

  const testTitles: Record<string, string> = {
    lectura: "Lectura",
    razonamiento: "Razonamiento",
    cerebral: "Test Cerebral",
    iq: "Test IQ",
  };

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
            data-testid="button-back-age"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold">
            {testTitles[testId] || "Test"}
          </div>
          
          <div className="w-16" />
        </motion.header>

        <motion.div
          className="px-6 pt-4 pb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Selecciona tu edad
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Elige tu grupo de edad para personalizar la experiencia
          </p>
        </motion.div>

        <div className="px-4 pb-8 space-y-3">
          {ageCategories.map((category, index) => (
            <AgeCategoryCard
              key={category.id}
              category={category}
              index={index}
              onClick={() => handleAgeSelect(category)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
