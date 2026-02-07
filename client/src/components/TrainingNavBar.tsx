import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Brain, Dumbbell, BarChart3, MoreHorizontal, Newspaper, ChevronRight, type LucideIcon } from "lucide-react";
import { useSounds } from "@/hooks/use-sounds";
import { createPortal } from "react-dom";

export interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
}

interface DropdownItem {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
  description: string;
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
];

const moreItems: DropdownItem[] = [
  { id: "blog", icon: Newspaper, label: "Blog", path: "/blog", description: "Artículos y noticias" },
];

export function TrainingNavBar({ 
  activePage, 
  categoria = "ninos",
  items,
  onNavClick
}: TrainingNavBarProps) {
  const [location, setLocation] = useLocation();
  const { playSound } = useSounds();
  const [moreOpen, setMoreOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ bottom: 0, right: 0 });

  const updatePosition = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  useEffect(() => {
    if (moreOpen) updatePosition();
  }, [moreOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  const navItems = items || defaultItems(categoria);
  const isMoreActive = activePage === "blog" || activePage === "mas";

  const handleNavClick = (path: string, id: string) => {
    playSound("iphone");
    if (onNavClick) {
      onNavClick(path, id);
    } else {
      setLocation(path);
    }
  };

  const handleMoreItemClick = (path: string) => {
    playSound("iphone");
    setMoreOpen(false);
    setLocation(path);
  };

  const dropdownContent = (
    <AnimatePresence>
      {moreOpen && (
        <motion.div
          ref={dropdownRef}
          className="fixed w-52 bg-white rounded-2xl z-[9999]"
          style={{
            bottom: dropdownPos.bottom,
            right: Math.max(8, dropdownPos.right),
            boxShadow: "0 8px 30px rgba(124,58,237,0.15), 0 2px 8px rgba(0,0,0,0.06)",
          }}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          data-testid="dropdown-mas"
        >
          <div className="px-3 py-2 border-b border-purple-50 rounded-t-2xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Más opciones</span>
          </div>
          {moreItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMoreItemClick(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 transition-colors last:rounded-b-2xl ${
                  isItemActive ? "bg-purple-50" : "active:bg-gray-50"
                }`}
                data-testid={`dropdown-item-${item.id}`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={isItemActive
                    ? { background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }
                    : { background: "linear-gradient(135deg, #f3e8ff, #e0f2fe)" }}
                >
                  <Icon className={`w-4 h-4 ${isItemActive ? "text-white" : "text-purple-500"}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className={`text-sm font-semibold block ${isItemActive ? "text-purple-600" : "text-gray-700"}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-gray-400">{item.description}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
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

          <div>
            <motion.button
              ref={btnRef}
              onClick={() => { playSound("iphone"); setMoreOpen(!moreOpen); }}
              className={`flex flex-col items-center gap-0.5 p-2 ${isMoreActive ? "text-purple-600" : "text-gray-400"}`}
              whileTap={{ scale: 0.9 }}
              data-testid="nav-mas"
            >
              {isMoreActive ? (
                <div 
                  className="w-11 h-11 -mt-6 rounded-2xl flex items-center justify-center"
                  style={{ 
                    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                    boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)"
                  }}
                >
                  <MoreHorizontal className="w-5 h-5 text-white" />
                </div>
              ) : (
                <MoreHorizontal className="w-5 h-5" />
              )}
              <span className={`text-[10px] ${isMoreActive ? "font-medium mt-1" : ""}`}>Más</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {createPortal(dropdownContent, document.body)}
    </>
  );
}
