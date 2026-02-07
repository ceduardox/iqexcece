import { useState, useEffect, useRef } from "react";
import { Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { languages } from "@/lib/i18n";
import { FlagIcon } from "./FlagIcon";
import { useSounds } from "@/hooks/use-sounds";

export function LanguageButton() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { playClick } = useSounds();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08))" }}
        whileTap={{ scale: 0.9 }}
        data-testid="button-lang"
      >
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Globe className="w-5 h-5" strokeWidth={1.8} style={{ color: "#7c3aed" }} />
        </motion.div>
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl overflow-hidden z-[100]"
            style={{ boxShadow: "0 12px 40px rgba(124,58,237,0.15), 0 4px 12px rgba(0,0,0,0.08)" }}
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.92 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            data-testid="dropdown-lang"
          >
            <div className="px-4 py-2 border-b border-purple-50" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.04), rgba(6,182,212,0.03))" }}>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("nav.idioma")}</span>
            </div>
            <div className="py-1">
              {languages.map((lang) => {
                const isActive = i18n.language === lang.code || i18n.language.startsWith(lang.code);
                return (
                  <motion.button
                    key={lang.code}
                    onClick={() => { if (lang.disabled) return; playClick(); i18n.changeLanguage(lang.code); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 active:bg-gray-50 transition-colors ${isActive ? "bg-purple-50/50" : ""} ${lang.disabled ? "opacity-40" : ""}`}
                    whileTap={lang.disabled ? {} : { scale: 0.98 }}
                    data-testid={`lang-${lang.code}`}
                  >
                    <FlagIcon code={lang.code} size={22} />
                    <span className={`text-sm flex-1 text-left ${isActive ? "font-bold text-purple-600" : "font-medium text-gray-600"}`}>{lang.label}</span>
                    {isActive && <Check className="w-4 h-4 text-purple-500" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
