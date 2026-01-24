import { useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
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

const categories = [
  {
    id: "preescolar",
    label: "PRE-ESCOLAR",
    ageRange: "3-5 años",
    description: "Actividades divertidas para los más pequeños",
    gradient: "from-purple-400 via-violet-400 to-fuchsia-400",
    borderColor: "border-purple-400",
    bgColor: "bg-gradient-to-br from-purple-50 to-violet-100",
  },
  {
    id: "ninos",
    label: "NIÑOS",
    ageRange: "6-11 años",
    description: "Retos cognitivos adaptados para niños",
    gradient: "from-violet-500 via-purple-500 to-indigo-500",
    borderColor: "border-violet-500",
    bgColor: "bg-gradient-to-br from-violet-50 to-purple-100",
  },
];

function ChildCategoryCard({
  category,
  index,
  onClick,
}: {
  category: typeof categories[0];
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2 + index * 0.15, duration: 0.5, type: "spring" }}
      onClick={onClick}
      className="cursor-pointer"
      data-testid={`card-category-${category.id}`}
    >
      <motion.div
        className={`relative overflow-hidden rounded-[2rem] p-6 ${category.bgColor} border-4 ${category.borderColor}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-30`} />
        
        <div className="relative flex flex-col items-center text-center py-4">
          <div className="w-32 h-32 mb-4 relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-white/50 blur-xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative w-full h-full rounded-full bg-white/80 flex items-center justify-center shadow-lg border-4 border-white">
              {category.id === "preescolar" ? (
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <circle cx="50" cy="35" r="20" fill="#FFDAB9" stroke="#DDA0DD" strokeWidth="2"/>
                  <circle cx="43" cy="32" r="3" fill="#333"/>
                  <circle cx="57" cy="32" r="3" fill="#333"/>
                  <path d="M 43 42 Q 50 48 57 42" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <rect x="40" y="55" width="20" height="25" rx="3" fill="#9370DB" stroke="#7B68EE" strokeWidth="2"/>
                  <rect x="35" y="55" width="8" height="15" rx="2" fill="#FFDAB9"/>
                  <rect x="57" y="55" width="8" height="15" rx="2" fill="#FFDAB9"/>
                  <rect x="42" y="78" width="7" height="12" rx="2" fill="#9370DB" stroke="#7B68EE" strokeWidth="1"/>
                  <rect x="51" y="78" width="7" height="12" rx="2" fill="#9370DB" stroke="#7B68EE" strokeWidth="1"/>
                  <ellipse cx="50" cy="20" rx="18" ry="12" fill="#8B4513"/>
                  <circle cx="35" cy="22" r="3" fill="#FFD700"/>
                  <circle cx="65" cy="22" r="3" fill="#FFD700"/>
                </svg>
              ) : (
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <circle cx="50" cy="30" r="18" fill="#FFDAB9" stroke="#DDA0DD" strokeWidth="2"/>
                  <circle cx="43" cy="28" r="2.5" fill="#333"/>
                  <circle cx="57" cy="28" r="2.5" fill="#333"/>
                  <path d="M 44 36 Q 50 40 56 36" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M 35 18 Q 50 8 65 18" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
                  <rect x="35" y="12" width="30" height="8" rx="2" fill="#8B4513"/>
                  <rect x="42" y="48" width="16" height="22" rx="3" fill="#7C3AED" stroke="#6D28D9" strokeWidth="2"/>
                  <rect x="58" y="50" width="12" height="8" rx="2" fill="#FFDAB9"/>
                  <rect x="30" y="50" width="12" height="8" rx="2" fill="#FFDAB9"/>
                  <rect x="44" y="68" width="6" height="14" rx="2" fill="#4F46E5"/>
                  <rect x="50" y="68" width="6" height="14" rx="2" fill="#4F46E5"/>
                  <rect x="44" y="80" width="6" height="4" rx="1" fill="#333"/>
                  <rect x="50" y="80" width="6" height="4" rx="1" fill="#333"/>
                  <circle cx="70" cy="60" r="8" fill="#A855F7" stroke="#9333EA" strokeWidth="1"/>
                  <path d="M 67 60 L 73 60 M 70 57 L 70 63" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </div>
          </div>
          
          <motion.h3
            className="text-2xl font-black text-gray-800 mb-1"
            style={{ 
              textShadow: "2px 2px 0px rgba(255,255,255,0.8)",
              fontFamily: "'Comic Sans MS', cursive, sans-serif"
            }}
          >
            {category.label}
          </motion.h3>
          
          <p className="text-lg font-bold text-gray-600 mb-2">
            {category.ageRange}
          </p>
          
          <p className="text-sm text-gray-500">
            {category.description}
          </p>
          
          <motion.div
            className="mt-4 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: i === 0 ? "#FF69B4" : i === 1 ? "#FFD700" : "#32CD32" }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
              />
            ))}
          </motion.div>
        </div>
        
        <motion.div
          className="absolute -top-4 -right-4 w-16 h-16 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 50 50">
            <path d="M25 0 L30 20 L50 25 L30 30 L25 50 L20 30 L0 25 L20 20 Z" fill="currentColor" />
          </svg>
        </motion.div>
        
        <motion.div
          className="absolute -bottom-2 -left-2 w-12 h-12 opacity-20"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="10 5" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function ChildCategoryPage() {
  const [, setLocation] = useLocation();
  const { userData, updateUserData } = useUserData();

  const handleBack = useCallback(() => {
    playButtonSound();
    window.history.back();
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    playCardSound();
    updateUserData({ childCategory: categoryId });
    setLocation("/reading-selection");
  }, [updateUserData, setLocation]);

  const testName = userData.selectedTest || "cognitivo";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, #FFF5F5 0%, #F0F8FF 50%, #F5FFFA 100%)"
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-30"
            style={{
              width: Math.random() * 30 + 10,
              height: Math.random() * 30 + 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ["#FF69B4", "#FFD700", "#32CD32", "#87CEEB", "#DDA0DD"][Math.floor(Math.random() * 5)],
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
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
          className="flex items-center justify-between px-4 py-4"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-pink-500 font-bold"
            data-testid="button-back-child-category"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Volver</span>
          </button>
          
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 text-pink-600 text-sm font-bold shadow-sm">
            Test de {testName.charAt(0).toUpperCase() + testName.slice(1)}
          </div>
        </motion.header>

        <motion.div
          className="px-6 pt-4 pb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.h1 
            className="text-3xl font-black text-gray-800 mb-2"
            style={{ 
              textShadow: "3px 3px 0px rgba(255,182,193,0.5)",
              fontFamily: "'Comic Sans MS', cursive, sans-serif"
            }}
          >
            ¡Elige tu categoría!
          </motion.h1>
          <p className="text-gray-600 text-lg">
            ¿Cuál es tu grupo de edad?
          </p>
          
          <motion.div
            className="flex justify-center gap-3 mt-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: i === 0 ? "#FF69B4" : i === 1 ? "#FFD700" : "#32CD32" }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
              />
            ))}
          </motion.div>
        </motion.div>

        <div className="px-6 pb-8 space-y-6">
          {categories.map((category, index) => (
            <ChildCategoryCard
              key={category.id}
              category={category}
              index={index}
              onClick={() => handleCategorySelect(category.id)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
