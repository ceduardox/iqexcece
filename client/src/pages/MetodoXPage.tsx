import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Brain, Zap, TrendingUp, BarChart3, ChevronLeft, ChevronRight, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSounds } from "@/hooks/use-sounds";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { CurvedHeader } from "@/components/CurvedHeader";
import { BottomNavBar } from "@/components/BottomNavBar";
import { EditorToolbar, type PageStyles, type ElementStyle, type DeviceMode } from "@/components/EditorToolbar";

function resolveStyle(styles: PageStyles, elementId: string, isMobile: boolean): ElementStyle | undefined {
  const base = styles[elementId];
  if (isMobile) return base;
  const desktop = styles[`${elementId}-desktop`];
  if (!desktop) return base;
  return { ...base, ...desktop };
}

const STEP_ICONS = [Brain, Zap, TrendingUp, BarChart3];
const STEP_COLORS = [
  { bg: "linear-gradient(135deg, #7c3aed, #a855f7)", shadow: "rgba(124,58,237,0.3)" },
  { bg: "linear-gradient(135deg, #f59e0b, #f97316)", shadow: "rgba(245,158,11,0.3)" },
  { bg: "linear-gradient(135deg, #10b981, #06b6d4)", shadow: "rgba(16,185,129,0.3)" },
  { bg: "linear-gradient(135deg, #3b82f6, #6366f1)", shadow: "rgba(59,130,246,0.3)" },
];

export default function MetodoXPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "es";
  const [, setLocation] = useLocation();
  const { playClick } = useSounds();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(0);

  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const checkEditorMode = () => setEditorMode(localStorage.getItem("editorMode") === "true");
    window.addEventListener("storage", checkEditorMode);
    const interval = setInterval(checkEditorMode, 1000);
    return () => { window.removeEventListener("storage", checkEditorMode); clearInterval(interval); };
  }, []);

  useEffect(() => { setAdminToken(localStorage.getItem("adminToken")); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setStylesLoaded(true), 2000);
    fetch(`/api/page-styles/metodo-x-page?lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        if (data.style?.styles) {
          try { setStyles(JSON.parse(data.style.styles)); } catch {}
        }
        clearTimeout(timeout);
        setStylesLoaded(true);
      })
      .catch(() => { clearTimeout(timeout); setStylesLoaded(true); });
    return () => clearTimeout(timeout);
  }, [lang]);

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    if (!editorMode) return;
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  const handleStyleChange = (elementId: string, style: ElementStyle) => {
    setStyles(prev => ({ ...prev, [elementId]: style }));
  };

  const handleSaveStyles = async () => {
    if (!adminToken) {
      toast({ title: "Error", description: "Debes iniciar sesión en el panel admin", variant: "destructive" });
      return;
    }
    try {
      await fetch("/api/admin/page-styles", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ pageName: "metodo-x-page", lang, styles: JSON.stringify(styles) }),
      });
      toast({ title: "Guardado", description: "Estilos guardados correctamente" });
    } catch {
      toast({ title: "Error", description: "No se pudieron guardar los estilos", variant: "destructive" });
    }
  };

  const handleCloseEditor = () => setSelectedElement(null);

  const getEditableClass = (elementId: string) =>
    editorMode ? `cursor-pointer transition-all duration-200 ${selectedElement === elementId ? "ring-2 ring-purple-500 ring-offset-2" : "hover:ring-2 hover:ring-purple-300 hover:ring-offset-1"}` : "";

  const getElementStyle = useCallback((elementId: string, defaultBg?: string): React.CSSProperties => {
    const s = resolveStyle(styles, elementId, isMobile);
    if (!s) return defaultBg ? { background: defaultBg } : {};
    const result: React.CSSProperties = {};
    if (s.background) result.background = s.background;
    else if (defaultBg) result.background = defaultBg;
    if (s.textColor) result.color = s.textColor;
    if (s.fontSize) result.fontSize = s.fontSize;
    if (s.fontWeight) result.fontWeight = s.fontWeight;
    if (s.textAlign) result.textAlign = s.textAlign as any;
    if (s.shadowBlur || s.shadowColor) result.boxShadow = `0 4px ${s.shadowBlur || 10}px ${s.shadowColor || "rgba(0,0,0,0.1)"}`;
    if (s.imageUrl && s.imageSize) {
      result.backgroundImage = `url(${s.imageUrl})`;
      result.backgroundSize = `${s.imageSize}%`;
      result.backgroundPosition = "center";
      result.backgroundRepeat = "no-repeat";
    }
    if (s.cardHeight) result.minHeight = s.cardHeight;
    return result;
  }, [styles, isMobile]);

  const steps = [
    { title: t("metodoX.step1Title"), desc: t("metodoX.step1Desc") },
    { title: t("metodoX.step2Title"), desc: t("metodoX.step2Desc") },
    { title: t("metodoX.step3Title"), desc: t("metodoX.step3Desc") },
    { title: t("metodoX.step4Title"), desc: t("metodoX.step4Desc") },
  ];

  const EDITABLE_SECTIONS = [
    { id: "hero-section", label: "Hero fondo" },
    { id: "hero-icon", label: "Hero icono" },
    { id: "hero-title", label: "Hero título" },
    { id: "hero-subtitle", label: "Hero subtítulo" },
    { id: "hero-desc", label: "Hero descripción" },
    { id: "hero-btn", label: "Hero botón" },
    { id: "section-title", label: "Título sección pasos" },
    { id: "section-desc", label: "Desc sección pasos" },
    ...steps.map((_, i) => [
      { id: `step-card-${i}`, label: `Paso ${i + 1} tarjeta` },
      { id: `step-icon-${i}`, label: `Paso ${i + 1} icono` },
      { id: `step-num-${i}`, label: `Paso ${i + 1} número` },
      { id: `step-title-${i}`, label: `Paso ${i + 1} título` },
      { id: `step-desc-${i}`, label: `Paso ${i + 1} desc` },
    ]).flat(),
  ];

  const nextStep = () => setActiveStep((p) => (p + 1) % steps.length);
  const prevStep = () => setActiveStep((p) => (p - 1 + steps.length) % steps.length);

  if (!stylesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="w-8 h-8 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const heroStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #6d28d9 100%)",
    minHeight: isMobile ? 320 : 380,
    ...getElementStyle("hero-section"),
  };
  const heroS = resolveStyle(styles, "hero-section", isMobile);
  if (heroS?.imageUrl) {
    heroStyle.backgroundImage = `url(${heroS.imageUrl})`;
    heroStyle.backgroundSize = heroS.imageSize ? `${heroS.imageSize}%` : "cover";
    heroStyle.backgroundPosition = "center";
    heroStyle.backgroundRepeat = "no-repeat";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white flex flex-col" data-testid="page-metodo-x">
      <CurvedHeader showBack onBack={() => setLocation("/")} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div
          className={`relative overflow-hidden rounded-b-3xl ${getEditableClass("hero-section")}`}
          style={heroStyle}
          onClick={(e) => { if (editorMode) handleElementClick("hero-section", e); }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(167,139,250,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(139,92,246,0.3) 0%, transparent 40%)",
          }} />

          <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 text-center" style={{ minHeight: isMobile ? 320 : 380 }}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${getEditableClass("hero-icon")}`}
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                ...getElementStyle("hero-icon"),
              }}
              onClick={(e) => { if (editorMode) handleElementClick("hero-icon", e); }}
            >
              {resolveStyle(styles, "hero-icon", isMobile)?.imageUrl ? (
                <img src={resolveStyle(styles, "hero-icon", isMobile)!.imageUrl} alt="" style={{ width: resolveStyle(styles, "hero-icon", isMobile)?.iconSize || 40, height: resolveStyle(styles, "hero-icon", isMobile)?.iconSize || 40 }} />
              ) : (
                <Zap className="w-10 h-10 text-amber-300" />
              )}
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className={`text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight ${getEditableClass("hero-title")}`}
              onClick={(e) => { if (editorMode) handleElementClick("hero-title", e); }}
              style={getElementStyle("hero-title")}
              data-testid="text-metodo-title"
            >
              {t("metodoX.heroTitle")}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className={`text-purple-200 font-medium text-sm md:text-base mb-4 ${getEditableClass("hero-subtitle")}`}
              onClick={(e) => { if (editorMode) handleElementClick("hero-subtitle", e); }}
              style={getElementStyle("hero-subtitle")}
              data-testid="text-metodo-subtitle"
            >
              {t("metodoX.heroSubtitle")}
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className={`text-purple-300/80 text-xs md:text-sm leading-relaxed max-w-sm md:max-w-lg ${getEditableClass("hero-desc")}`}
              onClick={(e) => { if (editorMode) handleElementClick("hero-desc", e); }}
              style={getElementStyle("hero-desc")}
              data-testid="text-metodo-desc"
            >
              {t("metodoX.heroDesc")}
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { if (editorMode) { handleElementClick("hero-btn", e); } else { playClick(); setLocation("/tests"); } }}
              className={`mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white flex items-center gap-2 ${getEditableClass("hero-btn")}`}
              style={{
                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                boxShadow: "0 4px 15px rgba(168,85,247,0.4)",
                ...getElementStyle("hero-btn"),
              }}
              data-testid="button-metodo-start"
            >
              {resolveStyle(styles, "hero-btn", isMobile)?.buttonText || t("metodoX.btnStart")}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="px-5 py-8 max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-xl md:text-2xl font-bold text-gray-800 mb-1 ${getEditableClass("section-title")}`}
            onClick={(e) => { if (editorMode) handleElementClick("section-title", e); }}
            style={getElementStyle("section-title")}
            data-testid="text-section-title"
          >
            {t("metodoX.sectionTitle")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`text-xs md:text-sm text-gray-500 mb-6 leading-relaxed ${getEditableClass("section-desc")}`}
            onClick={(e) => { if (editorMode) handleElementClick("section-desc", e); }}
            style={getElementStyle("section-desc")}
          >
            {t("metodoX.sectionDesc")}
          </motion.p>

          {isMobile ? (
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-2xl p-5 border border-purple-100 ${getEditableClass(`step-card-${activeStep}`)}`}
                  style={{ background: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.08)", ...getElementStyle(`step-card-${activeStep}`, "white") }}
                  onClick={(e) => { if (editorMode) handleElementClick(`step-card-${activeStep}`, e); }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${getEditableClass(`step-icon-${activeStep}`)}`}
                      style={{ background: STEP_COLORS[activeStep].bg, boxShadow: `0 4px 12px ${STEP_COLORS[activeStep].shadow}`, ...getElementStyle(`step-icon-${activeStep}`) }}
                      onClick={(e) => { if (editorMode) handleElementClick(`step-icon-${activeStep}`, e); }}
                    >
                      {resolveStyle(styles, `step-icon-${activeStep}`, isMobile)?.imageUrl ? (
                        <img src={resolveStyle(styles, `step-icon-${activeStep}`, isMobile)!.imageUrl} alt="" style={{ width: resolveStyle(styles, `step-icon-${activeStep}`, isMobile)?.iconSize || 28, height: resolveStyle(styles, `step-icon-${activeStep}`, isMobile)?.iconSize || 28 }} />
                      ) : (
                        (() => { const Icon = STEP_ICONS[activeStep]; return <Icon className="w-7 h-7 text-white" />; })()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`text-2xl font-extrabold ${getEditableClass(`step-num-${activeStep}`)}`}
                          style={{ color: STEP_COLORS[activeStep].shadow.replace("0.3", "1"), ...getElementStyle(`step-num-${activeStep}`) }}
                          onClick={(e) => { if (editorMode) handleElementClick(`step-num-${activeStep}`, e); }}
                        >
                          {String(activeStep + 1).padStart(2, "0")}
                        </span>
                        <h3
                          className={`text-base font-bold text-gray-800 ${getEditableClass(`step-title-${activeStep}`)}`}
                          onClick={(e) => { if (editorMode) handleElementClick(`step-title-${activeStep}`, e); }}
                          style={getElementStyle(`step-title-${activeStep}`)}
                          data-testid={`text-step-title-${activeStep}`}
                        >
                          {steps[activeStep].title}
                        </h3>
                      </div>
                      <p
                        className={`text-xs text-gray-500 leading-relaxed ${getEditableClass(`step-desc-${activeStep}`)}`}
                        onClick={(e) => { if (editorMode) handleElementClick(`step-desc-${activeStep}`, e); }}
                        style={getElementStyle(`step-desc-${activeStep}`)}
                        data-testid={`text-step-desc-${activeStep}`}
                      >
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
                        background: activeStep === i ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "#e5e7eb",
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
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {steps.map((step, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl p-6 border border-purple-100 flex flex-col gap-4 ${getEditableClass(`step-card-${i}`)}`}
                    style={{ background: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.08)", ...getElementStyle(`step-card-${i}`, "white") }}
                    onClick={(e) => { if (editorMode) handleElementClick(`step-card-${i}`, e); }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${getEditableClass(`step-icon-${i}`)}`}
                        style={{ background: STEP_COLORS[i].bg, boxShadow: `0 4px 12px ${STEP_COLORS[i].shadow}`, ...getElementStyle(`step-icon-${i}`) }}
                        onClick={(e) => { if (editorMode) handleElementClick(`step-icon-${i}`, e); }}
                      >
                        {resolveStyle(styles, `step-icon-${i}`, isMobile)?.imageUrl ? (
                          <img src={resolveStyle(styles, `step-icon-${i}`, isMobile)!.imageUrl} alt="" style={{ width: resolveStyle(styles, `step-icon-${i}`, isMobile)?.iconSize || 28, height: resolveStyle(styles, `step-icon-${i}`, isMobile)?.iconSize || 28 }} />
                        ) : (
                          <Icon className="w-7 h-7 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-3xl font-extrabold ${getEditableClass(`step-num-${i}`)}`}
                        style={{ color: STEP_COLORS[i].shadow.replace("0.3", "0.7"), ...getElementStyle(`step-num-${i}`) }}
                        onClick={(e) => { if (editorMode) handleElementClick(`step-num-${i}`, e); }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3
                      className={`text-lg font-bold text-gray-800 ${getEditableClass(`step-title-${i}`)}`}
                      onClick={(e) => { if (editorMode) handleElementClick(`step-title-${i}`, e); }}
                      style={getElementStyle(`step-title-${i}`)}
                      data-testid={`text-step-title-${i}`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-sm text-gray-500 leading-relaxed ${getEditableClass(`step-desc-${i}`)}`}
                      onClick={(e) => { if (editorMode) handleElementClick(`step-desc-${i}`, e); }}
                      style={getElementStyle(`step-desc-${i}`)}
                      data-testid={`text-step-desc-${i}`}
                    >
                      {step.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      <BottomNavBar />

      {editorMode && (
        <>
          <div className="fixed left-3 top-1/2 -translate-y-1/2 z-[9999]" data-testid="section-navigator">
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white mb-1"
              style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", boxShadow: "0 2px 10px rgba(124,58,237,0.4)" }}
              data-testid="button-toggle-nav"
            >
              {navOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {navOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-2 max-h-[60vh] overflow-y-auto"
                  style={{ width: 180, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", scrollbarWidth: "thin" }}
                >
                  <p className="text-[9px] text-gray-400 font-bold uppercase px-2 mb-1">Secciones</p>
                  {EDITABLE_SECTIONS.map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setSelectedElement(sec.id);
                        const el = document.querySelector(`[data-testid*="${sec.id}"]`);
                        el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        selectedElement === sec.id
                          ? "bg-purple-600 text-white"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                      data-testid={`nav-${sec.id}`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <EditorToolbar
            selectedElement={selectedElement}
            styles={styles}
            onStyleChange={handleStyleChange}
            onSave={handleSaveStyles}
            onClose={handleCloseEditor}
            onClearSelection={() => setSelectedElement(null)}
            deviceMode={deviceMode}
            onDeviceModeChange={setDeviceMode}
          />
        </>
      )}
    </div>
  );
}
