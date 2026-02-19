import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Brain, Zap, TrendingUp, BarChart3, ChevronLeft, ChevronRight, ArrowRight, ChevronDown, ChevronUp, Target, Scan, CheckCircle2, Eye, BookOpen, Network, Megaphone, Image } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSounds } from "@/hooks/use-sounds";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { CurvedHeader } from "@/components/CurvedHeader";
import { BottomNavBar } from "@/components/BottomNavBar";
import { EditorToolbar, type PageStyles, type ElementStyle, type DeviceMode } from "@/components/EditorToolbar";
import laxCyan from "@assets/laxcyan2_1771479429192.png";
import laxPurpura from "@assets/laxpurpura_1771479319056.png";
import laxBlanca from "@assets/laxblanca_1771479319056.png";
import laxVerde from "@assets/laxverde_1771479319057.png";

function Card3D({ children, className, style, onClick, ...props }: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { stiffness: 300, damping: 30 });
  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.div
      className={className}
      style={{ ...style, rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function resolveStyle(styles: PageStyles, elementId: string, isMobile: boolean): ElementStyle | undefined {
  const base = styles[elementId];
  if (isMobile) return base;
  const desktop = styles[`${elementId}-desktop`];
  if (!desktop) return base;
  return { ...base, ...desktop };
}

const STEP_ICONS = [Brain, Zap, TrendingUp, BarChart3];
const STEP_COLORS = [
  { bg: "linear-gradient(135deg, #7c3aed, #a855f7)", shadow: "rgba(124,58,237,0.3)", accent: "#7c3aed", light: "rgba(124,58,237,0.08)", mid: "rgba(124,58,237,0.15)", glow: "rgba(124,58,237,0.5)", border: "#a855f7" },
  { bg: "linear-gradient(135deg, #f59e0b, #f97316)", shadow: "rgba(245,158,11,0.3)", accent: "#f59e0b", light: "rgba(245,158,11,0.08)", mid: "rgba(245,158,11,0.15)", glow: "rgba(245,158,11,0.5)", border: "#f97316" },
  { bg: "linear-gradient(135deg, #10b981, #06b6d4)", shadow: "rgba(16,185,129,0.3)", accent: "#10b981", light: "rgba(16,185,129,0.08)", mid: "rgba(16,185,129,0.15)", glow: "rgba(16,185,129,0.5)", border: "#06b6d4" },
  { bg: "linear-gradient(135deg, #3b82f6, #6366f1)", shadow: "rgba(59,130,246,0.3)", accent: "#3b82f6", light: "rgba(59,130,246,0.08)", mid: "rgba(59,130,246,0.15)", glow: "rgba(59,130,246,0.5)", border: "#6366f1" },
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

  const [activeProg, setActiveProg] = useState(0);

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
    if (s.imageUrl && s.imageSize && s.backgroundType === "image") {
      result.backgroundImage = `url(${s.imageUrl})`;
      result.backgroundSize = `${s.imageSize}%`;
      result.backgroundPosition = "center";
      result.backgroundRepeat = "no-repeat";
    }
    if (s.cardHeight) result.minHeight = s.cardHeight;
    return result;
  }, [styles, isMobile]);

  const steps = [
    { title: t("metodoX.step1Title"), subtitle: t("metodoX.step1Subtitle"), hook: t("metodoX.step1Hook"), desc: t("metodoX.step1Desc"), detail: t("metodoX.step1Detail") },
    { title: t("metodoX.step2Title"), subtitle: t("metodoX.step2Subtitle"), hook: t("metodoX.step2Hook"), desc: t("metodoX.step2Desc"), detail: t("metodoX.step2Detail") },
    { title: t("metodoX.step3Title"), subtitle: t("metodoX.step3Subtitle"), hook: t("metodoX.step3Hook"), desc: t("metodoX.step3Desc"), detail: t("metodoX.step3Detail") },
    { title: t("metodoX.step4Title"), subtitle: t("metodoX.step4Subtitle"), hook: t("metodoX.step4Hook"), desc: t("metodoX.step4Desc"), detail: t("metodoX.step4Detail") },
  ];

  const programs = [
    { name: t("metodoX.prog1Name"), age: t("metodoX.prog1Age"), label: t("metodoX.prog1Label"), desc: t("metodoX.prog1Desc"), obj: t("metodoX.prog1Obj"), bases: t("metodoX.prog1Bases"), comps: [t("metodoX.prog1Comp1"), t("metodoX.prog1Comp2"), t("metodoX.prog1Comp3")] },
    { name: t("metodoX.prog2Name"), age: t("metodoX.prog2Age"), label: t("metodoX.prog2Label"), desc: t("metodoX.prog2Desc"), obj: t("metodoX.prog2Obj"), bases: t("metodoX.prog2Bases"), comps: [t("metodoX.prog2Comp1"), t("metodoX.prog2Comp2"), t("metodoX.prog2Comp3")] },
    { name: t("metodoX.prog3Name"), age: t("metodoX.prog3Age"), label: t("metodoX.prog3Label"), desc: t("metodoX.prog3Desc"), obj: t("metodoX.prog3Obj"), bases: t("metodoX.prog3Bases"), comps: [t("metodoX.prog3Comp1"), t("metodoX.prog3Comp2"), t("metodoX.prog3Comp3")] },
    { name: t("metodoX.prog4Name"), age: t("metodoX.prog4Age"), label: t("metodoX.prog4Label"), desc: t("metodoX.prog4Desc"), obj: t("metodoX.prog4Obj"), bases: t("metodoX.prog4Bases"), comps: [t("metodoX.prog4Comp1"), t("metodoX.prog4Comp2"), t("metodoX.prog4Comp3")] },
  ];

  const METHOD_APPS = [
    { key: "activacion", label: t("metodoX.detailActivacion"), icon: Zap },
    { key: "decodificacion", label: t("metodoX.detailDecodificacion"), icon: Eye },
    { key: "arquitectura", label: t("metodoX.detailArquitectura"), icon: Network },
    { key: "proyeccion", label: t("metodoX.detailProyeccion"), icon: Megaphone },
  ];

  const PROG_COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"];

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
    { id: "programs-section", label: "Programas fondo" },
    { id: "programs-title", label: "Programas título" },
    ...programs.map((p, i) => [
      { id: `prog-bg-${i}`, label: `${p.name} fondo exterior` },
      { id: `prog-title-bg-${i}`, label: `${p.name} título fondo` },
      { id: `prog-card-${i}`, label: `${p.name} card` },
      { id: `prog-image-${i}`, label: `${p.name} imagen` },
      { id: `prog-detail-section-${i}`, label: `${p.name} detalle fondo` },
      { id: `prog-obj-icon-${i}`, label: `${p.name} icono objetivo` },
      { id: `prog-bases-icon-${i}`, label: `${p.name} icono bases` },
    ]).flat(),
    ...METHOD_APPS.map((m, i) => ({ id: `method-app-icon-${i}`, label: `Método ${m.label} icono` })),
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white flex flex-col relative overflow-hidden" data-testid="page-metodo-x">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.img src={laxCyan} alt="" className="absolute opacity-[0.06] w-[240px] md:w-[420px]" style={{ top: "2%", right: "-65px" }} animate={{ rotate: [0, 8, -5, 0], scale: [1, 1.05, 0.97, 1] }} transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }} />
        <motion.img src={laxPurpura} alt="" className="absolute opacity-[0.05] w-[180px] md:w-[310px]" style={{ top: "38%", left: "-50px" }} animate={{ rotate: [0, -7, 6, 0], y: [0, 22, -14, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }} />
        <motion.img src={laxVerde} alt="" className="absolute opacity-[0.05] w-[200px] md:w-[360px]" style={{ bottom: "10%", right: "-35px" }} animate={{ rotate: [0, 6, -8, 0], x: [0, -16, 12, 0] }} transition={{ duration: 23, repeat: Infinity, ease: "easeInOut", delay: 6 }} />
        <motion.img src={laxBlanca} alt="" className="absolute opacity-[0.03] w-[150px] md:w-[260px]" style={{ top: "62%", left: "30%" }} animate={{ rotate: [0, -10, 7, 0], scale: [1, 1.08, 0.95, 1] }} transition={{ duration: 27, repeat: Infinity, ease: "easeInOut", delay: 9 }} />
      </div>
      <div className="relative z-[1] flex flex-col min-h-screen">
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
              animate={{ scale: [1, 1.08, 1], opacity: 1, boxShadow: ["0 0 0px rgba(168,85,247,0)", "0 0 30px rgba(168,85,247,0.5)", "0 0 0px rgba(168,85,247,0)"] }}
              transition={{ scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }, boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.4 } }}
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
              onClick={(e) => {
                if (editorMode) { handleElementClick("hero-btn", e); }
                else {
                  playClick();
                  const msg = encodeURIComponent("Hola, quiero empezar con el método X, mi nombre es ");
                  window.open(`https://wa.me/59173600060?text=${msg}`, "_blank");
                }
              }}
              className={`mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white flex items-center gap-2 ${getEditableClass("hero-btn")}`}
              style={{
                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                boxShadow: "0 4px 15px rgba(168,85,247,0.4)",
                ...getElementStyle("hero-btn"),
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(168,85,247,0.6)" }}
              data-testid="button-metodo-start"
            >
              {resolveStyle(styles, "hero-btn", isMobile)?.buttonText || t("metodoX.btnStart")}
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
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
                  className={`rounded-2xl overflow-hidden ${getEditableClass(`step-card-${activeStep}`)}`}
                  style={{ background: "white", boxShadow: `0 6px 25px ${STEP_COLORS[activeStep].shadow}`, border: `2px solid ${STEP_COLORS[activeStep].mid}`, ...getElementStyle(`step-card-${activeStep}`, "white") }}
                  onClick={(e) => { if (editorMode) handleElementClick(`step-card-${activeStep}`, e); }}
                >
                  <div className="p-4 flex items-center gap-3 relative overflow-hidden" style={{ background: STEP_COLORS[activeStep].bg }}>
                    <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20" style={{ background: "radial-gradient(circle, white, transparent)" }} />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], boxShadow: [`0 0 0px transparent`, `0 0 18px ${STEP_COLORS[activeStep].glow}`, `0 0 0px transparent`] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${getEditableClass(`step-icon-${activeStep}`)}`}
                      style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.3)", ...getElementStyle(`step-icon-${activeStep}`) }}
                      onClick={(e) => { if (editorMode) handleElementClick(`step-icon-${activeStep}`, e); }}
                    >
                      {resolveStyle(styles, `step-icon-${activeStep}`, isMobile)?.imageUrl ? (
                        <img src={resolveStyle(styles, `step-icon-${activeStep}`, isMobile)!.imageUrl} alt="" style={{ width: resolveStyle(styles, `step-icon-${activeStep}`, isMobile)?.iconSize || 28, height: resolveStyle(styles, `step-icon-${activeStep}`, isMobile)?.iconSize || 28 }} />
                      ) : (
                        (() => { const Icon = STEP_ICONS[activeStep]; return <Icon className="w-7 h-7 text-white drop-shadow-lg" />; })()
                      )}
                    </motion.div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-3xl font-black text-white/25 ${getEditableClass(`step-num-${activeStep}`)}`}
                          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)", ...getElementStyle(`step-num-${activeStep}`) }}
                          onClick={(e) => { if (editorMode) handleElementClick(`step-num-${activeStep}`, e); }}
                        >
                          {String(activeStep + 1).padStart(2, "0")}
                        </span>
                        <h3
                          className={`text-base font-extrabold text-white drop-shadow-sm ${getEditableClass(`step-title-${activeStep}`)}`}
                          onClick={(e) => { if (editorMode) handleElementClick(`step-title-${activeStep}`, e); }}
                          style={getElementStyle(`step-title-${activeStep}`)}
                          data-testid={`text-step-title-${activeStep}`}
                        >
                          {steps[activeStep].title}
                        </h3>
                      </div>
                      <p className="text-white/90 text-xs font-semibold mt-0.5">{steps[activeStep].subtitle}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 relative" style={{ borderLeft: `3px solid ${STEP_COLORS[activeStep].accent}` }}>
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.04] pointer-events-none" style={{ background: `radial-gradient(circle, ${STEP_COLORS[activeStep].accent}, transparent)` }} />
                    <p className="text-xs font-bold italic" style={{ color: STEP_COLORS[activeStep].accent }}>{steps[activeStep].hook}</p>
                    <p
                      className={`text-xs text-gray-600 leading-relaxed ${getEditableClass(`step-desc-${activeStep}`)}`}
                      onClick={(e) => { if (editorMode) handleElementClick(`step-desc-${activeStep}`, e); }}
                      style={getElementStyle(`step-desc-${activeStep}`)}
                      data-testid={`text-step-desc-${activeStep}`}
                    >
                      {steps[activeStep].desc}
                    </p>
                    <div className="rounded-xl p-3" style={{ background: STEP_COLORS[activeStep].light, borderLeft: `2px solid ${STEP_COLORS[activeStep].mid}` }}>
                      <p className="text-[11px] text-gray-500 leading-relaxed italic">
                        {steps[activeStep].detail}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-4">
                <motion.button
                  onClick={() => { playClick(); prevStep(); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: STEP_COLORS[activeStep].light, border: `1.5px solid ${STEP_COLORS[activeStep].mid}`, color: STEP_COLORS[activeStep].accent }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  data-testid="button-step-prev"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <div className="flex gap-2.5 items-center">
                  {steps.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => { playClick(); setActiveStep(i); }}
                      className="transition-all duration-300"
                      animate={activeStep === i ? { boxShadow: `0 0 10px ${STEP_COLORS[i].glow}` } : { boxShadow: "0 0 0px transparent" }}
                      style={{
                        width: activeStep === i ? 28 : 10,
                        height: 10,
                        borderRadius: 5,
                        background: activeStep === i ? STEP_COLORS[i].bg : STEP_COLORS[i].mid,
                      }}
                      whileTap={{ scale: 0.8 }}
                      data-testid={`button-step-dot-${i}`}
                    />
                  ))}
                </div>
                <motion.button
                  onClick={() => { playClick(); nextStep(); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: STEP_COLORS[activeStep].light, border: `1.5px solid ${STEP_COLORS[activeStep].mid}`, color: STEP_COLORS[activeStep].accent }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  data-testid="button-step-next"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {steps.map((step, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <Card3D
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl ${getEditableClass(`step-card-${i}`)}`}
                    style={{ background: "white", boxShadow: `0 6px 25px ${STEP_COLORS[i].shadow}`, border: `2px solid ${STEP_COLORS[i].mid}`, ...getElementStyle(`step-card-${i}`, "white") }}
                    onClick={(e: any) => { if (editorMode) handleElementClick(`step-card-${i}`, e); }}
                  >
                    <div className="p-5 flex items-center gap-4 relative overflow-hidden" style={{ background: STEP_COLORS[i].bg }}>
                      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-15" style={{ background: "radial-gradient(circle, white, transparent)" }} />
                      <motion.div
                        animate={{ scale: [1, 1.08, 1], boxShadow: [`0 0 0px transparent`, `0 0 20px ${STEP_COLORS[i].glow}`, `0 0 0px transparent`] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${getEditableClass(`step-icon-${i}`)}`}
                        style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.3)", ...getElementStyle(`step-icon-${i}`) }}
                        onClick={(e: any) => { if (editorMode) handleElementClick(`step-icon-${i}`, e); }}
                      >
                        {resolveStyle(styles, `step-icon-${i}`, isMobile)?.imageUrl ? (
                          <img src={resolveStyle(styles, `step-icon-${i}`, isMobile)!.imageUrl} alt="" style={{ width: resolveStyle(styles, `step-icon-${i}`, isMobile)?.iconSize || 32, height: resolveStyle(styles, `step-icon-${i}`, isMobile)?.iconSize || 32 }} />
                        ) : (
                          <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-3xl font-black text-white/25 ${getEditableClass(`step-num-${i}`)}`}
                            style={getElementStyle(`step-num-${i}`)}
                            onClick={(e) => { if (editorMode) handleElementClick(`step-num-${i}`, e); }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <h3
                            className={`text-base font-bold text-white ${getEditableClass(`step-title-${i}`)}`}
                            onClick={(e) => { if (editorMode) handleElementClick(`step-title-${i}`, e); }}
                            style={getElementStyle(`step-title-${i}`)}
                            data-testid={`text-step-title-${i}`}
                          >
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-white/90 text-sm font-semibold mt-0.5">{step.subtitle}</p>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col gap-3 relative" style={{ borderLeft: `3px solid ${STEP_COLORS[i].accent}` }}>
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none" style={{ background: `radial-gradient(circle, ${STEP_COLORS[i].accent}, transparent)` }} />
                      <p className="text-sm font-bold italic" style={{ color: STEP_COLORS[i].accent }}>{step.hook}</p>
                      <p
                        className={`text-sm text-gray-600 leading-relaxed ${getEditableClass(`step-desc-${i}`)}`}
                        onClick={(e) => { if (editorMode) handleElementClick(`step-desc-${i}`, e); }}
                        style={getElementStyle(`step-desc-${i}`)}
                        data-testid={`text-step-desc-${i}`}
                      >
                        {step.desc}
                      </p>
                      <div className="rounded-xl p-4 mt-auto" style={{ background: STEP_COLORS[i].light, borderLeft: `2px solid ${STEP_COLORS[i].mid}` }}>
                        <p className="text-xs text-gray-500 leading-relaxed italic">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </Card3D>
                );
              })}
            </div>
          )}

        </div>

        <div
          className={`relative py-10 px-5 ${getEditableClass("programs-section")}`}
          style={{ background: "linear-gradient(135deg, #6d28d9, #7c3aed, #06b6d4)", ...getElementStyle("programs-section") }}
          onClick={(e) => { if (editorMode) handleElementClick("programs-section", e); }}
          data-testid="programs-section"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: "radial-gradient(circle, white, transparent)" }} />
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, white, transparent)" }} />
          </div>

          <div className="relative max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`mb-8 ${getEditableClass("programs-title")}`}
              onClick={(e) => { if (editorMode) handleElementClick("programs-title", e); }}
              style={getElementStyle("programs-title")}
              data-testid="programs-title"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{t("metodoX.programsTitle")}</h2>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{t("metodoX.programsTitle2")}</h2>
            </motion.div>

            {programs.map((prog, i) => (
              <Card3D
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4 }}
                className={`mb-10 last:mb-0 rounded-2xl p-3 md:p-4 transition-all duration-300 hover:shadow-2xl ${getEditableClass(`prog-bg-${i}`)}`}
                style={{ background: `rgba(255,255,255,0.07)`, border: `2px solid ${PROG_COLORS[i]}40`, boxShadow: `0 8px 30px ${PROG_COLORS[i]}20`, ...getElementStyle(`prog-bg-${i}`) }}
                onClick={(e: any) => { if (editorMode) handleElementClick(`prog-bg-${i}`, e); }}
                data-testid={`prog-bg-${i}`}
              >
              <div
                className={`${getEditableClass(`prog-card-${i}`)}`}
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`prog-card-${i}`, e); } }}
                data-testid={`prog-card-${i}`}
              >
                <div
                  className={`rounded-t-2xl p-5 md:p-6 relative overflow-hidden ${getEditableClass(`prog-title-bg-${i}`)}`}
                  style={{ background: `linear-gradient(135deg, ${PROG_COLORS[i]}dd, ${PROG_COLORS[i]}99)`, ...getElementStyle(`prog-title-bg-${i}`) }}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`prog-title-bg-${i}`, e); } }}
                  data-testid={`prog-title-bg-${i}`}
                >
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-15" style={{ background: "radial-gradient(circle, white, transparent)" }} />
                  <motion.div className="absolute right-4 bottom-2 opacity-[0.06] text-[80px] font-black text-white pointer-events-none select-none" animate={{ opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>X</motion.div>
                  <div className="flex flex-wrap items-end justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl md:text-4xl font-black text-white leading-none drop-shadow-lg">{prog.name}</h3>
                      <motion.span
                        animate={{ scale: [1, 1.2, 1], boxShadow: [`0 0 0px transparent`, `0 0 25px ${PROG_COLORS[i]}90`, `0 0 0px transparent`], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-10 h-10 md:w-13 md:h-13 rounded-full flex items-center justify-center font-black text-white text-lg md:text-2xl"
                        style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(4px)", border: "2px solid rgba(255,255,255,0.3)" }}
                      >X</motion.span>
                      <span className="text-sm md:text-base text-white/80 font-semibold">{prog.age}</span>
                    </div>
                    <div className="text-right max-w-[220px]">
                      <p className="text-sm font-bold text-white drop-shadow-sm">{prog.label}</p>
                      <p className="text-[11px] text-white/70 leading-relaxed mt-1">{prog.desc}</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-full aspect-[16/9] bg-gray-700 flex items-center justify-center relative overflow-hidden ${getEditableClass(`prog-image-${i}`)}`}
                  style={{
                    backgroundImage: resolveStyle(styles, `prog-image-${i}`, isMobile)?.imageUrl ? `url(${resolveStyle(styles, `prog-image-${i}`, isMobile)!.imageUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    ...getElementStyle(`prog-image-${i}`),
                  }}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`prog-image-${i}`, e); } }}
                  data-testid={`prog-image-${i}`}
                >
                  {!resolveStyle(styles, `prog-image-${i}`, isMobile)?.imageUrl && (
                    <div className="flex flex-col items-center gap-2">
                      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${PROG_COLORS[i]}30`, border: `2px dashed ${PROG_COLORS[i]}50` }}>
                        <Image className="w-7 h-7" style={{ color: `${PROG_COLORS[i]}80` }} />
                      </motion.div>
                      <p className="text-white/40 text-xs">Usa el editor para agregar imagen</p>
                    </div>
                  )}
                </div>

                <div
                  className={`rounded-b-2xl overflow-hidden relative ${getEditableClass(`prog-detail-section-${i}`)}`}
                  style={{ background: `linear-gradient(180deg, ${PROG_COLORS[i]}15, rgba(255,255,255,0.06))`, backdropFilter: "blur(10px)", ...getElementStyle(`prog-detail-section-${i}`) }}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`prog-detail-section-${i}`, e); } }}
                  data-testid={`prog-detail-section-${i}`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${PROG_COLORS[i]}80, transparent)` }} />
                  <div className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-3 gap-5"} p-5`}>
                    <div className="flex flex-col items-center text-center gap-2">
                      <motion.div
                        animate={{ y: [0, -8, 0], boxShadow: [`0 0 0px transparent`, `0 0 24px ${PROG_COLORS[i]}60`, `0 0 0px transparent`] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getEditableClass(`prog-obj-icon-${i}`)}`}
                        style={{ border: `2px solid ${PROG_COLORS[i]}60`, background: `${PROG_COLORS[i]}20`, ...getElementStyle(`prog-obj-icon-${i}`) }}
                        onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`prog-obj-icon-${i}`, e); } }}
                        data-testid={`prog-obj-icon-${i}`}
                      >
                        {resolveStyle(styles, `prog-obj-icon-${i}`, isMobile)?.imageUrl ? (
                          <img src={resolveStyle(styles, `prog-obj-icon-${i}`, isMobile)!.imageUrl} alt="" className="w-8 h-8 object-contain" />
                        ) : (
                          <Target className="w-8 h-8 text-white drop-shadow-lg" />
                        )}
                      </motion.div>
                      <h4 className="text-sm font-bold text-white">{t("metodoX.detailObj")}</h4>
                      <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}><ChevronDown className="w-3.5 h-3.5" style={{ color: PROG_COLORS[i] }} /></motion.div>
                      <p className="text-[11px] text-white/75 leading-relaxed">{prog.obj}</p>
                    </div>

                    <div className="flex flex-col items-center text-center gap-2">
                      <motion.div
                        animate={{ y: [0, -8, 0], boxShadow: [`0 0 0px transparent`, `0 0 24px ${PROG_COLORS[i]}60`, `0 0 0px transparent`] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getEditableClass(`prog-bases-icon-${i}`)}`}
                        style={{ border: `2px solid ${PROG_COLORS[i]}60`, background: `${PROG_COLORS[i]}20`, ...getElementStyle(`prog-bases-icon-${i}`) }}
                        onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`prog-bases-icon-${i}`, e); } }}
                        data-testid={`prog-bases-icon-${i}`}
                      >
                        {resolveStyle(styles, `prog-bases-icon-${i}`, isMobile)?.imageUrl ? (
                          <img src={resolveStyle(styles, `prog-bases-icon-${i}`, isMobile)!.imageUrl} alt="" className="w-8 h-8 object-contain" />
                        ) : (
                          <Scan className="w-8 h-8 text-white drop-shadow-lg" />
                        )}
                      </motion.div>
                      <h4 className="text-sm font-bold text-white">{t("metodoX.detailBases")}</h4>
                      <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}><ChevronDown className="w-3.5 h-3.5" style={{ color: PROG_COLORS[i] }} /></motion.div>
                      <p className="text-[11px] text-white/75 leading-relaxed">{prog.bases}</p>
                    </div>

                    <div className="flex flex-col items-center text-center gap-2">
                      <motion.div
                        animate={{ y: [0, -8, 0], boxShadow: [`0 0 0px transparent`, `0 0 24px ${PROG_COLORS[i]}60`, `0 0 0px transparent`] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ border: `2px solid ${PROG_COLORS[i]}60`, background: `${PROG_COLORS[i]}20` }}
                      >
                        <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" />
                      </motion.div>
                      <h4 className="text-sm font-bold text-white">{t("metodoX.detailComp")}</h4>
                      <div className="space-y-2 mt-1">
                        {prog.comps.map((comp, ci) => (
                          <motion.div
                            key={ci}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: ci * 0.1 }}
                            className="flex items-center gap-2 text-white/85"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PROG_COLORS[i] }} />
                            <span className="text-[11px] font-medium">{comp}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t p-5 relative" style={{ borderColor: `${PROG_COLORS[i]}25` }}>
                    <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${PROG_COLORS[i]}50, transparent)` }} />
                    <h4 className="text-base font-bold text-white mb-4 italic">{t("metodoX.detailApp")}</h4>
                    <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-3`}>
                      {METHOD_APPS.map((m, mi) => {
                        const MIcon = m.icon;
                        return (
                          <motion.div key={mi} className="flex flex-col items-center gap-2" whileHover={{ scale: 1.08 }}>
                            <motion.div
                              animate={{ y: [0, -5, 0], rotate: [0, 4, -4, 0], boxShadow: [`0 0 0px transparent`, `0 0 16px ${PROG_COLORS[i]}50`, `0 0 0px transparent`] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: mi * 0.4 }}
                              className={`w-13 h-13 rounded-xl flex items-center justify-center ${getEditableClass(`method-app-icon-${mi}`)}`}
                              style={{ background: `${PROG_COLORS[i]}25`, border: `1.5px solid ${PROG_COLORS[i]}40`, ...getElementStyle(`method-app-icon-${mi}`) }}
                              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`method-app-icon-${mi}`, e); } }}
                              data-testid={`method-app-icon-${mi}`}
                            >
                              {resolveStyle(styles, `method-app-icon-${mi}`, isMobile)?.imageUrl ? (
                                <img src={resolveStyle(styles, `method-app-icon-${mi}`, isMobile)!.imageUrl} alt="" className="w-6 h-6 object-contain" />
                              ) : (
                                <MIcon className="w-6 h-6 text-white drop-shadow-md" />
                              )}
                            </motion.div>
                            <span className="text-[10px] font-semibold text-white/85 text-center">{m.label}</span>
                            <motion.div animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: mi * 0.2 }}><ChevronDown className="w-3 h-3" style={{ color: `${PROG_COLORS[i]}70` }} /></motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              </Card3D>
            ))}
          </div>
        </div>
      </div>

      <BottomNavBar />
      </div>

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
