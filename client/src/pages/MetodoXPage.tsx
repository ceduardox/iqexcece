import { useState } from "react";
import { useLocation } from "wouter";
import { Brain, Zap, TrendingUp, BarChart3, BookOpen, Eye, Target, Lightbulb, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSounds } from "@/hooks/use-sounds";
import { useIsMobile } from "@/hooks/use-mobile";
import { CurvedHeader } from "@/components/CurvedHeader";
import { BottomNavBar } from "@/components/BottomNavBar";

const STEP_ICONS = [Brain, Zap, TrendingUp, BarChart3];
const STEP_COLORS = [
  { bg: "linear-gradient(135deg, #7c3aed, #a855f7)", shadow: "rgba(124,58,237,0.3)" },
  { bg: "linear-gradient(135deg, #f59e0b, #f97316)", shadow: "rgba(245,158,11,0.3)" },
  { bg: "linear-gradient(135deg, #10b981, #06b6d4)", shadow: "rgba(16,185,129,0.3)" },
  { bg: "linear-gradient(135deg, #3b82f6, #6366f1)", shadow: "rgba(59,130,246,0.3)" },
];

const BENEFIT_ICONS = [BookOpen, Eye, Brain, Target, Lightbulb, Zap];

export default function MetodoXPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { playClick } = useSounds();
  const isMobile = useIsMobile();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: t("metodoX.step1Title"), desc: t("metodoX.step1Desc") },
    { title: t("metodoX.step2Title"), desc: t("metodoX.step2Desc") },
    { title: t("metodoX.step3Title"), desc: t("metodoX.step3Desc") },
    { title: t("metodoX.step4Title"), desc: t("metodoX.step4Desc") },
  ];

  const benefits = [
    t("metodoX.benefit1"),
    t("metodoX.benefit2"),
    t("metodoX.benefit3"),
    t("metodoX.benefit4"),
    t("metodoX.benefit5"),
    t("metodoX.benefit6"),
  ];

  const nextStep = () => setActiveStep((p) => (p + 1) % steps.length);
  const prevStep = () => setActiveStep((p) => (p - 1 + steps.length) % steps.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white flex flex-col" data-testid="page-metodo-x">
      <CurvedHeader showBack onBack={() => setLocation("/")} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="relative overflow-hidden rounded-b-3xl" style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #6d28d9 100%)",
          minHeight: isMobile ? 320 : 380,
        }}>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(167,139,250,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(139,92,246,0.3) 0%, transparent 40%)",
          }} />
          <div className="absolute top-6 right-6 w-24 h-24 rounded-full opacity-10" style={{
            background: "linear-gradient(135deg, #a78bfa, #c084fc)",
            filter: "blur(20px)",
          }} />

          <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 text-center" style={{ minHeight: isMobile ? 320 : 380 }}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Zap className="w-10 h-10 text-amber-300" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-3xl font-extrabold text-white mb-2 tracking-tight"
              data-testid="text-metodo-title"
            >
              {t("metodoX.heroTitle")}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-purple-200 font-medium text-sm mb-4"
              data-testid="text-metodo-subtitle"
            >
              {t("metodoX.heroSubtitle")}
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-purple-300/80 text-xs leading-relaxed max-w-sm"
              data-testid="text-metodo-desc"
            >
              {t("metodoX.heroDesc")}
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playClick(); setLocation("/tests"); }}
              className="mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                boxShadow: "0 4px 15px rgba(168,85,247,0.4)",
              }}
              data-testid="button-metodo-start"
            >
              {t("metodoX.btnStart")}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="px-5 py-8 max-w-lg mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl font-bold text-gray-800 mb-1"
            data-testid="text-section-title"
          >
            {t("metodoX.sectionTitle")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xs text-gray-500 mb-6 leading-relaxed"
          >
            {t("metodoX.sectionDesc")}
          </motion.p>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl p-5 border border-purple-100"
                style={{ background: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.08)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: STEP_COLORS[activeStep].bg, boxShadow: `0 4px 12px ${STEP_COLORS[activeStep].shadow}` }}
                  >
                    {(() => { const Icon = STEP_ICONS[activeStep]; return <Icon className="w-6 h-6 text-white" />; })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-purple-400">{String(activeStep + 1).padStart(2, "0")}</span>
                      <h3 className="text-base font-bold text-gray-800" data-testid={`text-step-title-${activeStep}`}>
                        {steps[activeStep].title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed" data-testid={`text-step-desc-${activeStep}`}>
                      {steps[activeStep].desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => { playClick(); prevStep(); }}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-purple-200 text-purple-400"
                data-testid="button-step-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { playClick(); setActiveStep(i); }}
                    className="transition-all duration-300"
                    style={{
                      width: activeStep === i ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: activeStep === i
                        ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                        : "#e5e7eb",
                    }}
                    data-testid={`button-step-dot-${i}`}
                  />
                ))}
              </div>

              <button
                onClick={() => { playClick(); nextStep(); }}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-purple-200 text-purple-400"
                data-testid="button-step-next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4" data-testid="text-benefits-title">
              {t("metodoX.benefitsTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((b, i) => {
                const Icon = BENEFIT_ICONS[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-purple-50"
                    style={{ background: "rgba(124,58,237,0.02)" }}
                    data-testid={`card-benefit-${i}`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: STEP_COLORS[i % 4].bg, boxShadow: `0 2px 8px ${STEP_COLORS[i % 4].shadow}` }}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-gray-600 leading-relaxed pt-1">{b}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
