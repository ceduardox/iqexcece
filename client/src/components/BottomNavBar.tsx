import { useLocation } from "wouter";
import { Home, Brain, Dumbbell, User } from "lucide-react";
import { motion } from "framer-motion";
import { useSounds } from "@/hooks/use-sounds";

interface NavItem {
  id: string;
  icon: typeof Home;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: "inicio", icon: Home, label: "Inicio", path: "/" },
  { id: "tests", icon: Brain, label: "Tests", path: "/tests" },
  { id: "entrena", icon: Dumbbell, label: "Entrena", path: "/entrenamiento" },
  { id: "perfil", icon: User, label: "Perfil", path: "/perfil" },
];

export function BottomNavBar() {
  const [location, setLocation] = useLocation();
  const { playSound } = useSounds();

  const getActiveId = () => {
    if (location === "/") return "inicio";
    if (location.startsWith("/tests")) return "tests";
    if (location.startsWith("/entrenamiento")) return "entrena";
    if (location.startsWith("/perfil")) return "perfil";
    return "";
  };

  const activeId = getActiveId();

  const handleNavClick = (path: string) => {
    playSound("iphone");
    setLocation(path);
  };

  return (
    <>
      <div className="h-24 flex-shrink-0" aria-hidden="true" />
      
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-purple-50 px-4 py-2 z-50 safe-area-inset-bottom"
        data-testid="bottom-nav"
      >
        <div className="max-w-md mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            const Icon = item.icon;

            if (isActive) {
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className="flex flex-col items-center gap-0.5 p-2 text-purple-600"
                  whileTap={{ scale: 0.9 }}
                  data-testid={`nav-${item.id}`}
                >
                  <div 
                    className="w-11 h-11 -mt-6 rounded-2xl flex items-center justify-center"
                    style={{ 
                      background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                      boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)"
                    }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className="flex flex-col items-center gap-0.5 p-2 text-gray-400"
                whileTap={{ scale: 0.9 }}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
