import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Brain, Dumbbell, BarChart3, Newspaper, type LucideIcon } from "lucide-react";
import { useSounds } from "@/hooks/use-sounds";

export interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
}

interface TrainingNavBarProps {
  activePage: string;
  categoria?: string;
  items?: NavItem[];
  onNavClick?: (path: string, id: string) => void;
}

const defaultItems = (categoria: string): NavItem[] => [
  { id: "inicio", icon: Home, label: "Inicio", path: "/" },
  { id: "diagnostico", icon: Brain, label: "Diagnóstico", path: `/reading-selection/${categoria}` },
  { id: "entrenar", icon: Dumbbell, label: "Entrenar", path: "/entrenamiento" },
  { id: "progreso", icon: BarChart3, label: "Progreso", path: `/progreso/${categoria}` },
  { id: "blog", icon: Newspaper, label: "Blog", path: "/blog" },
];

export function TrainingNavBar({ 
  activePage, 
  categoria = "ninos",
  items,
  onNavClick
}: TrainingNavBarProps) {
  const [, setLocation] = useLocation();
  const { playSound } = useSounds();

  const navItems = items || defaultItems(categoria);

  const handleNavClick = (path: string, id: string) => {
    playSound("iphone");
    if (onNavClick) {
      onNavClick(path, id);
    } else {
      setLocation(path);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-purple-50 px-4 py-2 z-50 safe-area-inset-bottom"
    >
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;

          if (isActive) {
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.path, item.id)}
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
              onClick={() => handleNavClick(item.path, item.id)}
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
  );
}
