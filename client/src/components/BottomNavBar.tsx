import { useState } from "react";
import { useLocation } from "wouter";
import { Home, Brain, Dumbbell, MoreHorizontal, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useSounds } from "@/hooks/use-sounds";
import { useTranslation } from "react-i18next";
import { useEmbed } from "@/hooks/use-embed";
import { NavMoreMenu } from "@/components/NavMoreMenu";

export function BottomNavBar() {
  const isEmbed = useEmbed();
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { playSound } = useSounds();
  const [moreOpen, setMoreOpen] = useState(false);

  if (isEmbed) return null;

  const navItems = [
    { id: "inicio", icon: Home, label: t("nav.inicio"), path: "/" },
    { id: "tests", icon: Brain, label: t("nav.diagnostico"), path: "/tests" },
    { id: "entrena", icon: Dumbbell, label: t("nav.entrena"), path: "/entrenamiento" },
    { id: "progreso", icon: BarChart3, label: t("nav.progreso"), path: "/progreso" },
  ];

  const getActiveId = () => {
    if (location === "/") return "inicio";
    if (location.startsWith("/tests") || location.startsWith("/age-selection")) return "tests";
    if (location.startsWith("/entrenamiento")) return "entrena";
    if (location.startsWith("/progreso")) return "progreso";
    if (location.startsWith("/blog")) return "mas";
    if (location.startsWith("/metodo-x")) return "mas";
    if (location.startsWith("/a-leer-bolivia")) return "mas";
    if (location.startsWith("/contacto")) return "mas";
    return "";
  };

  const activeId = getActiveId();

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
            return (
              <motion.button
                key={item.id}
                onClick={() => { playSound("iphone"); setLocation(item.path); }}
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
              className={`flex flex-col items-center gap-0.5 p-2 ${activeId === "mas" ? "text-purple-600" : "text-gray-400"}`}
              whileTap={{ scale: 0.9 }}
              data-testid="nav-mas"
            >
              {activeId === "mas" ? (
                <div className="w-11 h-11 -mt-6 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)" }}>
                  <MoreHorizontal className="w-5 h-5 text-white" />
                </div>
              ) : (
                <MoreHorizontal className="w-5 h-5" />
              )}
              <span className={`text-[10px] ${activeId === "mas" ? "font-medium mt-1" : ""}`}>{t("nav.mas")}</span>
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
    </>
  );
}
