import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { MessageCircle, Mail, Headphones, ChevronRight, Send, X, Loader2, Sparkles, ArrowDown, User, Phone, MapPin, Globe, FileText, Calendar, Hash, PenLine, Building2, Navigation } from "lucide-react";
import scCentroImg from "@assets/santacruz_centro_1771477590891.JPG";
import scNorteImg from "@assets/santac_cruz_norte_1771477590891.JPG";
import cbbaAmericasImg from "@assets/cochabamba_americas_1771477590890.JPG";
import cbbaCentroImg from "@assets/cochambaba_centro_1771477590891.JPG";
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

const HERO_IMG = "https://iqexponencial.app/api/images/8892fe4f-7ef0-45f3-ab1f-04bcf6c78960";
const DEFAULT_OPERATOR_IMG = "https://cdn-icons-png.flaticon.com/512/4825/4825038.png";

function getSessionId() {
  let sid = sessionStorage.getItem("asesor_session");
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("asesor_session", sid);
  }
  return sid;
}

interface ChatMsg { role: "user" | "assistant"; content: string }

export default function ContactoPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "es";
  const [, setLocation] = useLocation();
  const { playClick } = useSounds();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkEditorMode = () => setEditorMode(localStorage.getItem("editorMode") === "true");
    window.addEventListener("storage", checkEditorMode);
    const interval = setInterval(checkEditorMode, 1000);
    return () => { window.removeEventListener("storage", checkEditorMode); clearInterval(interval); };
  }, []);

  useEffect(() => { setAdminToken(localStorage.getItem("adminToken")); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setStylesLoaded(true), 2000);
    fetch(`/api/page-styles/contacto-page?lang=${lang}`)
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

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [chatOpen, chatMessages.length]);

  const sendMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    const userMsg: ChatMsg = { role: "user", content: msg };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/asesor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId: getSessionId(), history: [...chatMessages, userMsg] }),
      });
      const data = await res.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.error || "Error al responder" }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Error de conexión" }]);
    }
    setChatLoading(false);
  };

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
        body: JSON.stringify({ pageName: "contacto-page", lang, styles: JSON.stringify(styles) }),
      });
      toast({ title: "Guardado", description: "Estilos guardados correctamente" });
    } catch {
      toast({ title: "Error", description: "No se pudieron guardar los estilos", variant: "destructive" });
    }
  };

  const handleCloseEditor = () => setSelectedElement(null);

  const getEditableClass = (elementId: string) =>
    editorMode ? `cursor-pointer transition-all duration-200 ${selectedElement === elementId ? "ring-2 ring-purple-500 ring-offset-2" : "hover:ring-2 hover:ring-purple-300 hover:ring-offset-1"}` : "";

  const getResolvedStyle = useCallback((elementId: string) => resolveStyle(styles, elementId, isMobile), [styles, isMobile]);

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
    if (s.imageUrl && s.imageSize) { result.backgroundImage = `url(${s.imageUrl})`; result.backgroundSize = `${s.imageSize}%`; result.backgroundPosition = "center"; result.backgroundRepeat = "no-repeat"; }
    return result;
  }, [styles, isMobile]);

  const contactItems = [
    { id: "whatsapp", icon: MessageCircle, labelKey: "contact.whatsapp", subKey: "contact.whatsappSub", gradient: "linear-gradient(135deg, #25D366, #128C7E)", iconColor: "#fff", action: () => window.open("https://wa.me/59173600060?text=Bienvenido%20a%20IQExponencial%20en%20que%20podemos%20ayudarle", "_blank") },
    { id: "email", icon: Mail, labelKey: "contact.email", subKey: "contact.emailSub", gradient: "linear-gradient(135deg, #8a3ffc, #6d28d9)", iconColor: "#fff", action: () => { window.location.href = "mailto:soporte@inteligenciaexponencial.com"; } },
  ];

  const emptyGeneral = { nombres: "", apellidos: "", telefono: "", email: "", ciudad: "", pais: "", comentario: "" };
  const emptyTrial = { nombres: "", apellidos: "", cedula: "", fechaNacimiento: "", edad: "", telefono: "", email: "", ciudad: "", pais: "", pgNombres: "", pgApellidos: "", pgCedula: "", pgFechaNac: "", pgEdad: "", pgTelefono: "", pgEmail: "", pgCiudad: "", pgPais: "" };
  const [generalForm, setGeneralForm] = useState(emptyGeneral);
  const [trialForm, setTrialForm] = useState(emptyTrial);
  const [submittingGeneral, setSubmittingGeneral] = useState(false);
  const [submittingTrial, setSubmittingTrial] = useState(false);

  const submitGeneral = async () => {
    if (!generalForm.nombres) return;
    setSubmittingGeneral(true);
    try {
      const res = await fetch("/api/contact-submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formType: "general", ...generalForm }) });
      if (res.ok) { toast({ title: t("contact.formSuccess") }); setGeneralForm(emptyGeneral); }
      else toast({ title: t("contact.formError"), variant: "destructive" });
    } catch { toast({ title: t("contact.formError"), variant: "destructive" }); }
    setSubmittingGeneral(false);
  };

  const submitTrial = async () => {
    if (!trialForm.nombres) return;
    setSubmittingTrial(true);
    try {
      const res = await fetch("/api/contact-submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formType: "prueba_gratuita", nombres: trialForm.nombres, apellidos: trialForm.apellidos, cedula: trialForm.cedula, fechaNacimiento: trialForm.fechaNacimiento, edad: trialForm.edad, telefono: trialForm.telefono, email: trialForm.email, ciudad: trialForm.ciudad, pais: trialForm.pais, pruebaGratuitaNombres: trialForm.pgNombres, pruebaGratuitaApellidos: trialForm.pgApellidos, pruebaGratuitaCedula: trialForm.pgCedula, pruebaGratuitaFechaNac: trialForm.pgFechaNac, pruebaGratuitaEdad: trialForm.pgEdad, pruebaGratuitaTelefono: trialForm.pgTelefono, pruebaGratuitaEmail: trialForm.pgEmail, pruebaGratuitaCiudad: trialForm.pgCiudad, pruebaGratuitaPais: trialForm.pgPais }) });
      if (res.ok) { toast({ title: t("contact.formSuccess") }); setTrialForm(emptyTrial); }
      else toast({ title: t("contact.formError"), variant: "destructive" });
    } catch { toast({ title: t("contact.formError"), variant: "destructive" }); }
    setSubmittingTrial(false);
  };

  const arrowBounce = {
    animate: { x: [0, 4, 0] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  };

  if (!stylesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const operatorS = getResolvedStyle("operator-image");
  const asesorCardS = getResolvedStyle("contact-asesor");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        ...(() => {
          const bgS = getResolvedStyle("page-background");
          if (bgS?.imageUrl) return { background: `url(${bgS.imageUrl}) center/cover no-repeat`, backgroundSize: bgS?.imageSize ? `${bgS.imageSize}%` : "cover" };
          if (bgS?.background) return { background: bgS.background };
          return { background: "#ffffff" };
        })(),
      }}
      onClick={(e) => {
        if (!editorMode) return;
        if ((e.target as HTMLElement).closest('[data-testid="editor-toolbar"]')) return;
        setSelectedElement(null);
      }}
    >
      <CurvedHeader showBack onBack={() => setLocation("/")} />

      {editorMode && (
        <div
          className={`mx-auto mt-1 px-3 py-1 rounded-full text-[10px] text-gray-400 border border-dashed border-gray-300 ${getEditableClass("page-background")}`}
          onClick={(e) => handleElementClick("page-background", e)}
          data-testid="edit-page-background"
        >
          Fondo de página
        </div>
      )}

      <div className="flex-1 pb-28 w-full">
        <div
          className={`relative overflow-hidden ${getEditableClass("hero-section")}`}
          style={{ ...getElementStyle("hero-section") }}
          onClick={(e) => { if (editorMode) handleElementClick("hero-section", e); }}
          data-testid="hero-section"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.06, 0.15, 0.06] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full"
              style={{ background: "radial-gradient(circle, #a855f7, transparent)" }}
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.12, 0.04] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full"
              style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
            />
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 right-10 w-3 h-3 rounded-full bg-purple-400/30"
            />
            <motion.div
              animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/2 left-8 w-2 h-2 rounded-full bg-cyan-400/30"
            />
          </div>

          <div className="relative max-w-5xl mx-auto px-5 pt-6 pb-8">
            <div className={`flex ${isMobile ? "flex-col" : "flex-row items-center gap-10"}`}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`${isMobile ? "w-full" : "flex-1"} flex flex-col gap-4`}
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className={`text-3xl md:text-5xl font-black leading-tight ${getEditableClass("hero-title")}`}
                  style={{ background: "linear-gradient(135deg, #6d28d9, #a855f7, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", ...getElementStyle("hero-title") }}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("hero-title", e); } }}
                  data-testid="text-hero-title"
                >
                  {t("contact.title")}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className={`text-sm md:text-base text-gray-600 leading-relaxed ${getEditableClass("hero-desc")}`}
                  style={getElementStyle("hero-desc")}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("hero-desc", e); } }}
                  data-testid="text-hero-desc"
                >
                  {t("contact.heroDesc")}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className={`relative rounded-2xl overflow-hidden p-4 md:p-5 mt-2 ${getEditableClass("cta-block")}`}
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", ...getElementStyle("cta-block") }}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("cta-block", e); } }}
                  data-testid="cta-block"
                >
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-2 right-2 w-16 h-16 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3), transparent)" }}
                  />
                  <div className="relative flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="w-7 h-7 text-yellow-300 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <h3 className="text-white font-bold text-base md:text-lg">{t("contact.ctaTitle")}</h3>
                      <p className="text-white/80 text-xs md:text-sm mt-0.5">{t("contact.ctaDesc")}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="flex justify-center mt-3"
                  >
                    <ArrowDown className="w-5 h-5 text-white/60" />
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`${isMobile ? "mt-6 mx-auto" : ""} relative flex-shrink-0`}
              >
                <div
                  className={`relative ${getEditableClass("hero-image")}`}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("hero-image", e); } }}
                  data-testid="hero-image"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "conic-gradient(from 0deg, #7c3aed, #06b6d4, #a855f7, #f59e0b, #7c3aed)",
                      padding: 3,
                      borderRadius: "50%",
                    }}
                  />
                  <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, #7c3aed, #06b6d4, #a855f7, #f59e0b, #7c3aed)", padding: 3 }}>
                    <div className="w-full h-full rounded-full bg-white" />
                  </div>

                  <div
                    className="relative w-52 h-52 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white"
                    style={{ boxShadow: "0 20px 60px rgba(124,58,237,0.3), 0 0 40px rgba(6,182,212,0.15)" }}
                  >
                    <img
                      src={getResolvedStyle("hero-image")?.imageUrl || HERO_IMG}
                      alt="Contacto IQ Exponencial"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(124,58,237,0.3) 0%, transparent 50%)" }} />
                  </div>

                  <motion.div
                    animate={{ scale: [1, 1.2, 1], boxShadow: ["0 0 0 rgba(124,58,237,0)", "0 0 30px rgba(124,58,237,0.4)", "0 0 0 rgba(124,58,237,0)"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                  >
                    <span className="text-white font-black text-sm">IQ</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-1 -left-3 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", boxShadow: "0 4px 15px rgba(6,182,212,0.4)" }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="px-5 max-w-md md:max-w-full mx-auto w-full mt-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-sm text-gray-500 text-center mb-5 ${getEditableClass("subtitle")}`}
            onClick={(e) => handleElementClick("subtitle", e)}
            style={getElementStyle("subtitle")}
            data-testid="text-contacto-subtitle"
          >
            {getResolvedStyle("subtitle")?.buttonText || t("contact.subtitle")}
          </motion.p>

          <div
            className={`flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-5 rounded-2xl p-3 md:p-6 relative ${getEditableClass("cards-section")}`}
            onClick={(e) => handleElementClick("cards-section", e)}
            style={{
              ...(() => {
                const cs = getResolvedStyle("cards-section");
                return cs?.imageUrl
                  ? { background: `url(${cs.imageUrl}) center/cover no-repeat`, backgroundSize: cs?.imageSize ? `${cs.imageSize}%` : "cover" }
                  : cs?.background ? { background: cs.background } : {};
              })(),
              borderRadius: getResolvedStyle("cards-section")?.borderRadius || 16,
              minHeight: getResolvedStyle("cards-section")?.sectionHeight,
            }}
          >
            {contactItems.map((item, index) => (
              <ContactCard
                key={item.id}
                item={item}
                index={index}
                editorMode={editorMode}
                getEditableClass={getEditableClass}
                getResolvedStyle={getResolvedStyle}
                handleElementClick={handleElementClick}
                playClick={playClick}
                arrowBounce={arrowBounce}
                t={t}
              />
            ))}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.16 }}
              className={`w-full rounded-2xl overflow-hidden transition-all md:col-span-1 ${getEditableClass("contact-asesor")}`}
              style={{
                background: asesorCardS?.background || "linear-gradient(135deg, #7c3aed, #a855f7)",
                boxShadow: asesorCardS?.shadowBlur ? `0 4px ${asesorCardS.shadowBlur}px ${asesorCardS.shadowColor || "rgba(0,0,0,0.1)"}` : "0 4px 20px rgba(124,58,237,0.2)",
                borderRadius: asesorCardS?.borderRadius || 16,
              }}
              data-testid="button-contact-asesor"
            >
              <div
                className="flex items-center md:flex-col md:items-center md:text-center p-4 md:py-10 md:px-6 gap-4 md:gap-4 cursor-pointer"
                onClick={(e) => {
                  if (editorMode) { handleElementClick("contact-asesor", e); }
                  else { playClick(); setChatOpen(!chatOpen); }
                }}
              >
                <div
                  className={`w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/30 ${getEditableClass("operator-image")}`}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("operator-image", e); } }}
                  style={{ background: operatorS?.background || "rgba(255,255,255,0.15)" }}
                >
                  <img
                    src={operatorS?.imageUrl || DEFAULT_OPERATOR_IMG}
                    alt="operator"
                    className="w-full h-full object-cover"
                    style={operatorS?.imageSize ? { width: `${operatorS.imageSize}%`, height: `${operatorS.imageSize}%` } : {}}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-white/80 text-xs font-medium mb-0.5 ${getEditableClass("hablamos")}`}
                    onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("hablamos", e); } }}
                    style={(() => { const h = getResolvedStyle("hablamos"); return h?.textColor ? { color: h.textColor } : {}; })()}
                    data-testid="text-hablamos"
                  >
                    {getResolvedStyle("hablamos")?.buttonText || t("contact.hablamos")}
                  </p>
                  <h3 className="text-white font-bold text-base leading-tight" style={{ color: asesorCardS?.textColor }}>
                    {asesorCardS?.buttonText || t("contact.asesor")}
                  </h3>
                  <p className="text-white/70 text-xs mt-0.5" style={{ color: asesorCardS?.textColor ? `${asesorCardS.textColor}99` : undefined }}>
                    {getResolvedStyle("asesor-sub")?.buttonText || t("contact.asesorSub")}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: chatOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
                </motion.div>
              </div>

              <AnimatePresence>
                {chatOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white rounded-t-2xl mx-1 mb-1 overflow-hidden" style={{ borderRadius: 16 }}>
                      <div className="flex items-center justify-between px-4 py-2 bg-purple-50 border-b border-purple-100">
                        <span className="text-xs font-semibold text-purple-700">Chat con Asesor</span>
                        <button onClick={(e) => { e.stopPropagation(); setChatOpen(false); }} className="text-purple-400 hover:text-purple-600" data-testid="button-close-chat">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50" data-testid="chat-messages">
                        {chatMessages.length === 0 && (
                          <div className="text-center text-gray-400 text-xs mt-8">
                            <Headphones className="w-8 h-8 mx-auto mb-2 text-purple-300" />
                            <p className="font-medium text-gray-500">Escribe tu consulta</p>
                            <p className="mt-1">Nuestro asesor te responderá al instante</p>
                          </div>
                        )}
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.role === "user" ? "bg-purple-600 text-white rounded-br-md" : "bg-white text-gray-700 border border-gray-200 rounded-bl-md"}`} data-testid={`chat-msg-${msg.role}-${i}`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 px-3 py-2 rounded-2xl rounded-bl-md">
                              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="flex items-center gap-2 p-2 border-t border-gray-100 bg-white">
                        <input ref={inputRef} type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} placeholder="Escribe un mensaje..." className="flex-1 px-3 py-2 text-sm rounded-full bg-gray-100 text-gray-900 placeholder-gray-400 border-0 outline-none focus:ring-2 focus:ring-purple-300" disabled={chatLoading} data-testid="input-chat-message" />
                        <button onClick={(e) => { e.stopPropagation(); sendMessage(); }} disabled={chatLoading || !chatInput.trim()} className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center disabled:opacity-40 transition-all active:scale-95" data-testid="button-send-chat">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
            data-testid="form-escribenos"
          >
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:p-10 md:w-2/5 flex flex-col justify-center text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{t("contact.formWriteUs")}</h2>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">{t("contact.formWriteUsDesc")}</p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm p-5 md:p-8 md:flex-1 rounded-t-2xl md:rounded-t-none md:rounded-l-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField icon={<User className="w-4 h-4" />} label={t("contact.formNames")} value={generalForm.nombres} onChange={(v) => setGeneralForm(p => ({ ...p, nombres: v }))} testId="input-gen-nombres" />
                  <FormField icon={<User className="w-4 h-4" />} label={t("contact.formLastNames")} value={generalForm.apellidos} onChange={(v) => setGeneralForm(p => ({ ...p, apellidos: v }))} testId="input-gen-apellidos" />
                  <FormField icon={<Phone className="w-4 h-4" />} label={t("contact.formPhone")} value={generalForm.telefono} onChange={(v) => setGeneralForm(p => ({ ...p, telefono: v }))} testId="input-gen-telefono" />
                  <FormField icon={<Mail className="w-4 h-4" />} label={t("contact.formEmail")} value={generalForm.email} onChange={(v) => setGeneralForm(p => ({ ...p, email: v }))} type="email" testId="input-gen-email" />
                  <FormField icon={<MapPin className="w-4 h-4" />} label={t("contact.formCity")} value={generalForm.ciudad} onChange={(v) => setGeneralForm(p => ({ ...p, ciudad: v }))} testId="input-gen-ciudad" />
                  <FormField icon={<Globe className="w-4 h-4" />} label={t("contact.formCountry")} value={generalForm.pais} onChange={(v) => setGeneralForm(p => ({ ...p, pais: v }))} testId="input-gen-pais" />
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                    <PenLine className="w-3.5 h-3.5 text-gray-400" />
                    {t("contact.formComment")}
                  </label>
                  <textarea
                    value={generalForm.comentario}
                    onChange={(e) => setGeneralForm(p => ({ ...p, comentario: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    data-testid="input-gen-comentario"
                  />
                </div>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={submitGeneral}
                    disabled={submittingGeneral || !generalForm.nombres}
                    className="px-10 py-3 rounded-full text-white font-bold text-sm tracking-wider transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #5eead4, #14b8a6)" }}
                    data-testid="button-submit-general"
                  >
                    {submittingGeneral ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t("contact.formSend")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0d9488, #0891b2)" }}
            data-testid="form-prueba-gratuita"
          >
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:p-10 md:w-2/5 flex flex-col justify-center text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                  <span style={{ color: "#fbbf24" }}>IQx,</span>
                </h2>
                <p className="text-white/90 text-sm md:text-base leading-relaxed mb-4">{t("contact.formTrialDesc")}</p>
                <p className="text-yellow-300 font-bold text-lg">{t("contact.formTrialMotivation")}</p>
              </div>
              <div className="md:flex-1 flex flex-col gap-4 p-5 md:p-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5">
                  <h3 className="text-center font-bold text-gray-700 text-sm mb-4 tracking-wide">{t("contact.formContactData")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField icon={<User className="w-4 h-4" />} label={t("contact.formNames")} value={trialForm.nombres} onChange={(v) => setTrialForm(p => ({ ...p, nombres: v }))} testId="input-trial-nombres" />
                    <FormField icon={<User className="w-4 h-4" />} label={t("contact.formLastNames")} value={trialForm.apellidos} onChange={(v) => setTrialForm(p => ({ ...p, apellidos: v }))} testId="input-trial-apellidos" />
                  </div>
                  <div className="mt-3">
                    <FormField icon={<Hash className="w-4 h-4" />} label={t("contact.formId")} value={trialForm.cedula} onChange={(v) => setTrialForm(p => ({ ...p, cedula: v }))} testId="input-trial-cedula" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <FormField icon={<Calendar className="w-4 h-4" />} label={t("contact.formBirthDate")} value={trialForm.fechaNacimiento} onChange={(v) => setTrialForm(p => ({ ...p, fechaNacimiento: v }))} type="date" testId="input-trial-fecha" />
                    <FormField icon={<Hash className="w-4 h-4" />} label={t("contact.formAge")} value={trialForm.edad} onChange={(v) => setTrialForm(p => ({ ...p, edad: v }))} testId="input-trial-edad" />
                  </div>
                  <div className="mt-3"><FormField icon={<Phone className="w-4 h-4" />} label={t("contact.formPhone")} value={trialForm.telefono} onChange={(v) => setTrialForm(p => ({ ...p, telefono: v }))} testId="input-trial-tel" /></div>
                  <div className="mt-3"><FormField icon={<Mail className="w-4 h-4" />} label={t("contact.formEmail")} value={trialForm.email} onChange={(v) => setTrialForm(p => ({ ...p, email: v }))} type="email" testId="input-trial-email" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <FormField icon={<MapPin className="w-4 h-4" />} label={t("contact.formCity")} value={trialForm.ciudad} onChange={(v) => setTrialForm(p => ({ ...p, ciudad: v }))} testId="input-trial-ciudad" />
                    <FormField icon={<Globe className="w-4 h-4" />} label={t("contact.formCountry")} value={trialForm.pais} onChange={(v) => setTrialForm(p => ({ ...p, pais: v }))} testId="input-trial-pais" />
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5">
                  <h3 className="text-center font-bold text-gray-700 text-sm mb-4 tracking-wide">{t("contact.formWhoTrial")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField icon={<User className="w-4 h-4" />} label={t("contact.formNames")} value={trialForm.pgNombres} onChange={(v) => setTrialForm(p => ({ ...p, pgNombres: v }))} testId="input-pg-nombres" />
                    <FormField icon={<User className="w-4 h-4" />} label={t("contact.formLastNames")} value={trialForm.pgApellidos} onChange={(v) => setTrialForm(p => ({ ...p, pgApellidos: v }))} testId="input-pg-apellidos" />
                  </div>
                  <div className="mt-3"><FormField icon={<Hash className="w-4 h-4" />} label={t("contact.formId")} value={trialForm.pgCedula} onChange={(v) => setTrialForm(p => ({ ...p, pgCedula: v }))} testId="input-pg-cedula" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <FormField icon={<Calendar className="w-4 h-4" />} label={t("contact.formBirthDate")} value={trialForm.pgFechaNac} onChange={(v) => setTrialForm(p => ({ ...p, pgFechaNac: v }))} type="date" testId="input-pg-fecha" />
                    <FormField icon={<Hash className="w-4 h-4" />} label={t("contact.formAge")} value={trialForm.pgEdad} onChange={(v) => setTrialForm(p => ({ ...p, pgEdad: v }))} testId="input-pg-edad" />
                  </div>
                  <div className="mt-3"><FormField icon={<Phone className="w-4 h-4" />} label={t("contact.formPhone")} value={trialForm.pgTelefono} onChange={(v) => setTrialForm(p => ({ ...p, pgTelefono: v }))} testId="input-pg-tel" /></div>
                  <div className="mt-3"><FormField icon={<Mail className="w-4 h-4" />} label={t("contact.formEmail")} value={trialForm.pgEmail} onChange={(v) => setTrialForm(p => ({ ...p, pgEmail: v }))} type="email" testId="input-pg-email" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <FormField icon={<MapPin className="w-4 h-4" />} label={t("contact.formCity")} value={trialForm.pgCiudad} onChange={(v) => setTrialForm(p => ({ ...p, pgCiudad: v }))} testId="input-pg-ciudad" />
                    <FormField icon={<Globe className="w-4 h-4" />} label={t("contact.formCountry")} value={trialForm.pgPais} onChange={(v) => setTrialForm(p => ({ ...p, pgPais: v }))} testId="input-pg-pais" />
                  </div>
                </div>

                <div className="flex justify-center mt-2 mb-2">
                  <button
                    onClick={submitTrial}
                    disabled={submittingTrial || !trialForm.nombres}
                    className="px-10 py-3 rounded-full text-white font-bold text-sm tracking-wider transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                    data-testid="button-submit-trial"
                  >
                    {submittingTrial ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t("contact.formSend")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10"
            data-testid="offices-section"
          >
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative"
                style={{ background: "linear-gradient(135deg, #6d28d9, #06b6d4)" }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-4px] rounded-2xl border-2 border-dashed border-purple-300/40"
                />
                <Building2 className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-4xl font-black" style={{ background: "linear-gradient(135deg, #6d28d9, #a855f7, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t("contact.ourOffices")}
              </h2>
              <motion.div
                animate={{ scaleX: [0.3, 1, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mt-3 h-0.5 w-32 rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, #a855f7, #06b6d4, transparent)" }}
              />
              <p className="text-gray-500 text-sm mt-3">{t("contact.ourOfficesDesc")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {[
                { name: "Santa Cruz - Centro", img: scCentroImg, address: "Av. Cochabamba No. 694, esquina Calle Saavedra", phone: "74160960 - 73600060", email: "info@iqexponencial.com", delay: 0, color: "#7c3aed", glow: "rgba(124,58,237,0.25)" },
                { name: "Santa Cruz - Norte", img: scNorteImg, address: "Av. Los Cusis # 139, entre Banzer y Beni", phone: "75577756 - 73600060", email: "info@iqexponencial.com", delay: 0.12, color: "#0891b2", glow: "rgba(8,145,178,0.25)" },
                { name: "Cochabamba - Américas", img: cbbaAmericasImg, address: "Calle Luis Calvo esq. Collasuyo", phone: "77024283 - 73600060", email: "info@iqexponencial.com", delay: 0.24, color: "#6366f1", glow: "rgba(99,102,241,0.25)" },
                { name: "Cochabamba - Centro", img: cbbaCentroImg, address: "c. 16 de Julio # 515, entre Venezuela y Federico Blanco", phone: "77024284 - 73600060", email: "info@iqexponencial.com", delay: 0.36, color: "#059669", glow: "rgba(5,150,105,0.25)" },
              ].map((office, i) => (
                <motion.div
                  key={office.name}
                  initial={{ opacity: 0, y: 40, rotateX: 15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + office.delay }}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-3xl bg-white"
                  style={{ boxShadow: `0 8px 32px ${office.glow}, 0 2px 8px rgba(0,0,0,0.06)` }}
                  data-testid={`office-card-${i}`}
                >
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <motion.img
                        src={office.img}
                        alt={office.name}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: i * 2 }}
                      />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 30%, ${office.color}22 70%, ${office.color}88 100%)` }} />
                    </div>

                    <motion.div
                      animate={{ opacity: [0.4, 0.8, 0.4], x: ["-100%", "200%"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 1.2 }}
                      className="absolute top-0 left-0 w-1/3 h-full pointer-events-none"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }}
                    />

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md"
                        style={{ background: `${office.color}cc` }}
                      >
                        <Navigation className="w-4 h-4 text-white" />
                        <h3 className="text-white font-black text-sm tracking-wide">{office.name}</h3>
                      </motion.div>
                    </div>

                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
                      className="absolute top-4 right-4 w-3 h-3 rounded-full"
                      style={{ background: office.color, boxShadow: `0 0 12px ${office.color}` }}
                    />
                  </div>

                  <div className="p-5 space-y-3">
                    <motion.div
                      className="flex items-start gap-3"
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 + i * 0.3 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${office.color}15` }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: office.color }} />
                      </motion.div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{t("contact.officeAddress")}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{office.address}</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start gap-3"
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 + i * 0.3 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${office.color}15` }}
                      >
                        <Phone className="w-4 h-4" style={{ color: office.color }} />
                      </motion.div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{t("contact.officePhone")}</p>
                        <p className="text-sm text-gray-700 font-semibold">{office.phone}</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start gap-3"
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 + i * 0.3 }}
                    >
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${office.color}15` }}
                      >
                        <Mail className="w-4 h-4" style={{ color: office.color }} />
                      </motion.div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{t("contact.officeEmail")}</p>
                        <p className="text-sm text-gray-700">{office.email}</p>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${office.color}, transparent)` }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      <BottomNavBar />

      {editorMode && (
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
      )}
    </div>
  );
}

function FormField({ icon, label, value, onChange, type = "text", testId }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; type?: string; testId: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
        <span className="text-gray-400">{icon}</span>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
        data-testid={testId}
      />
    </div>
  );
}

interface ContactCardProps {
  item: { id: string; icon: any; labelKey: string; subKey: string; gradient: string; iconColor: string; action: () => void };
  index: number;
  editorMode: boolean;
  getEditableClass: (id: string) => string;
  getResolvedStyle: (id: string) => ElementStyle | undefined;
  handleElementClick: (id: string, e: React.MouseEvent) => void;
  playClick: () => void;
  arrowBounce: any;
  t: (key: string) => string;
}

function ContactCard({ item, index, editorMode, getEditableClass, getResolvedStyle, handleElementClick, playClick, arrowBounce, t }: ContactCardProps) {
  const Icon = item.icon;
  const s = getResolvedStyle(`contact-${item.id}`);
  const iconS = getResolvedStyle(`icon-${item.id}`);
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      onClick={(e) => {
        if (editorMode) { handleElementClick(`contact-${item.id}`, e); }
        else { playClick(); item.action(); }
      }}
      className={`w-full flex items-center md:flex-col md:items-center md:text-center gap-4 md:gap-4 p-4 md:py-10 md:px-6 rounded-2xl transition-all active:scale-[0.98] ${getEditableClass(`contact-${item.id}`)}`}
      style={{
        background: s?.background || "white",
        boxShadow: s?.shadowBlur ? `0 4px ${s.shadowBlur}px ${s.shadowColor || "rgba(0,0,0,0.06)"}` : "0 4px 24px rgba(124,58,237,0.1), 0 1px 6px rgba(0,0,0,0.04)",
      }}
      whileHover={{ scale: 1.03, y: -4 }}
      data-testid={`button-contact-${item.id}`}
    >
      <motion.div
        className={`w-12 h-12 md:w-24 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 ${getEditableClass(`icon-${item.id}`)}`}
        style={{ background: iconS?.background || item.gradient }}
        onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`icon-${item.id}`, e); } }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
      >
        {iconS?.imageUrl ? (
          <img src={iconS.imageUrl} alt="" className="object-contain" style={{ width: iconS?.imageSize ? `${iconS.imageSize}%` : 32, height: iconS?.imageSize ? `${iconS.imageSize}%` : 32 }} />
        ) : (
          <Icon className="w-6 h-6 md:w-12 md:h-12" style={{ color: item.iconColor }} />
        )}
      </motion.div>
      <div className="flex-1 text-left md:text-center min-w-0">
        <span
          className="text-base md:text-xl font-semibold block"
          style={{ color: s?.textColor || "#374151", fontSize: s?.fontSize }}
        >
          {s?.buttonText || t(item.labelKey)}
        </span>
        <span className="text-xs md:text-sm text-gray-400 block mt-0.5 md:mt-1">
          {getResolvedStyle(`sub-${item.id}`)?.buttonText || t(item.subKey)}
        </span>
      </div>
      <motion.div {...arrowBounce} className="md:hidden">
        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
      </motion.div>
    </motion.button>
  );
}
