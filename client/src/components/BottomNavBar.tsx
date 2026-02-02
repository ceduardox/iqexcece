import { useLocation } from "wouter";
import { Home, Brain, Dumbbell, User } from "lucide-react";
import { motion } from "framer-motion";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Inicio", path: "/" },
  { icon: Brain, label: "Tests", path: "/tests" },
  { icon: Dumbbell, label: "Entrena", path: "/entrenamiento" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

export function BottomNavBar() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <>
      {/* Espaciador automático para que el contenido no quede oculto */}
      <div className="h-24 flex-shrink-0" aria-hidden="true" />
      
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50"
        data-testid="bottom-nav"
      >
      <div 
        className="mx-3 mb-3 rounded-2xl shadow-lg border border-purple-100/50"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => { playButtonSound(); setLocation(item.path); }}
                className="flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200"
                style={{
                  background: active 
                    ? "linear-gradient(135deg, rgba(138, 63, 252, 0.15) 0%, rgba(0, 217, 255, 0.1) 100%)"
                    : "transparent",
                }}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon 
                  className="w-5 h-5 mb-1 transition-colors duration-200"
                  style={{ 
                    color: active ? "#8a3ffc" : "#9ca3af",
                    strokeWidth: active ? 2.5 : 2
                  }}
                />
                <span 
                  className="text-[10px] font-semibold transition-colors duration-200"
                  style={{ color: active ? "#8a3ffc" : "#9ca3af" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
    </>
  );
}
