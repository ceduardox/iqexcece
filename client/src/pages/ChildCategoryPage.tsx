import { useCallback, useState, useEffect } from "react";
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

const defaultCategoryImages: Record<string, string> = {
  preescolar: "https://img.freepik.com/free-vector/happy-cute-kid-boy-girl-smile-with-book_97632-5631.jpg",
  ninos: "https://img.freepik.com/free-vector/group-happy-kids-having-fun_1308-78957.jpg",
};

const categoriesBase = [
  {
    id: "preescolar",
    label: "PRE-ESCOLAR",
    ageRange: "3-5 años",
    description: "Actividades divertidas para los más pequeños",
    gradient: "from-orange-400 via-amber-400 to-yellow-400",
    borderColor: "border-orange-400",
    bgColor: "bg-gradient-to-br from-orange-50 to-amber-100",
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

interface CategoryType {
  id: string;
  label: string;
  ageRange: string;
  description: string;
  gradient: string;
  borderColor: string;
  bgColor: string;
  image: string;
}

function ChildCategoryCard({
  category,
  index,
  onClick,
}: {
  category: CategoryType;
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
            <div className="relative w-full h-full rounded-full bg-white overflow-hidden shadow-lg border-4 border-white">
              <img 
                src={category.image} 
                alt={category.label}
                className="w-full h-full object-cover"
              />
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
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const [preescolarRes, ninosRes] = await Promise.all([
          fetch("/api/reading/preescolar"),
          fetch("/api/reading/ninos"),
        ]);
        const preescolarData = await preescolarRes.json();
        const ninosData = await ninosRes.json();
        setCategoryImages({
          preescolar: preescolarData.content?.categoryImage || defaultCategoryImages.preescolar,
          ninos: ninosData.content?.categoryImage || defaultCategoryImages.ninos,
        });
      } catch {
        setCategoryImages(defaultCategoryImages);
      }
    };
    fetchImages();
  }, []);

  const categories = categoriesBase.map(cat => ({
    ...cat,
    image: categoryImages[cat.id] || defaultCategoryImages[cat.id],
  }));

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
