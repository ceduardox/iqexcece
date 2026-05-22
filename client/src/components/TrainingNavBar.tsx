import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Brain, Dumbbell, MoreHorizontal, type LucideIcon } from "lucide-react";
import { useSounds } from "@/hooks/use-sounds";
import { useTranslation } from "react-i18next";
import { useEmbed } from "@/hooks/use-embed";
import { NavMoreMenu } from "@/components/NavMoreMenu";

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

export function TrainingNavBar({ 
  activePage, 
  categoria = "ninos",
  items,
  onNavClick
}: TrainingNavBarProps) {
  const isEmbed = useEmbed();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { playSound } = useSounds();
  const [moreOpen, setMoreOpen] = useState(false);

  if (isEmbed) return null;
  const isMoreActive = activePage === "blog" || activePage === "metodo-x" || activePage === "aleer" || activePage === "contacto" || activePage === "mas";

  const defaultItems: NavItem[] = [
    { id: "inicio", icon: Home, label: t("nav.inicio"), path: "/" },
    { id: "diagnostico", icon: Brain, label: t("nav.diagnostico"), path: `/reading-selection/${categoria}` },
    { id: "entrenar", icon: Dumbbell, label: t("nav.entrenar"), path: "/entrenamiento" },
  ];

  const navItems = items || defaultItems;

  const handleNav = (path: string, id: string) => {
    playSound("iphone");
    if (onNavClick) onNavClick(path, id);
    else setLocation(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-purple-50 px-4 py-2 z-50 safe-area-inset-bottom">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNav(item.path, item.id)}
              className={`flex flex-col items-center gap-0.5 p-2 ${isActive ? "text-purple-600" : "text-gray-400"}`}
              whileTap={{ scale: 0.9 }}
              data-testid={`nav-${item.id}`}
            >
              {isActive ? (
                <div className="w-11 h-11 -mt-6 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)" }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className={`text-[10px] ${isActive ? "font-medium mt-1" : ""}`}>{item.label}</span>
            </motion.button>
          );
        })}

        <div className="relative">
          <motion.button
            onClick={() => { playSound("iphone"); setMoreOpen(!moreOpen); }}
            className={`flex flex-col items-center gap-0.5 p-2 ${isMoreActive ? "text-purple-600" : "text-gray-400"}`}
            whileTap={{ scale: 0.9 }}
            data-testid="nav-mas"
          >
            {isMoreActive ? (
              <div className="w-11 h-11 -mt-6 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)" }}>
                <MoreHorizontal className="w-5 h-5 text-white" />
              </div>
            ) : (
              <MoreHorizontal className="w-5 h-5" />
            )}
            <span className={`text-[10px] ${isMoreActive ? "font-medium mt-1" : ""}`}>{t("nav.mas")}</span>
          </motion.button>

          {moreOpen && (
            <NavMoreMenu
              onNavigate={(path) => {
                setMoreOpen(false);
                playSound("iphone");
                setLocation(path);
              }}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
