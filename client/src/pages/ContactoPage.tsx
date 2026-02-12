import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { MessageCircle, Mail, Newspaper, BookOpen, Headphones, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
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

const DEFAULT_OPERATOR_IMG = "https://cdn-icons-png.flaticon.com/512/4825/4825038.png";

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
    {
      id: "blog",
      icon: Newspaper,
      labelKey: "contact.blog",
      subKey: "contact.blogSub",
      gradient: "linear-gradient(135deg, #f3e8ff, #e0f2fe)",
      iconColor: "#8b5cf6",
      action: () => setLocation("/blog"),
    },
    {
      id: "leer-bolivia",
      icon: BookOpen,
      labelKey: "contact.leerBolivia",
      subKey: "contact.leerBoliviaSub",
      gradient: "linear-gradient(135deg, #d1fae5, #cffafe)",
      iconColor: "#10b981",
      action: () => setLocation("/a-leer-bolivia"),
    },
    {
      id: "whatsapp",
      icon: MessageCircle,
      labelKey: "contact.whatsapp",
      subKey: "contact.whatsappSub",
      gradient: "linear-gradient(135deg, #25D366, #128C7E)",
      iconColor: "#fff",
      action: () => window.open("https://wa.me/59178767696", "_blank"),
    },
    {
      id: "email",
      icon: Mail,
      labelKey: "contact.email",
      subKey: "contact.emailSub",
      gradient: "linear-gradient(135deg, #8a3ffc, #6d28d9)",
      iconColor: "#fff",
      action: () => { window.location.href = "mailto:soporte@inteligenciaexponencial.com"; },
    },
  ];

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
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30 flex flex-col" onClick={() => { if (editorMode) setSelectedElement(null); }}>
      <CurvedHeader showBack onBack={() => setLocation("/")} />

      <div className="flex-1 px-5 pb-28 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4 flex flex-col items-center"
        >
          <h1
            className={`text-2xl font-bold text-center mb-1 ${getEditableClass("title")}`}
            onClick={(e) => handleElementClick("title", e)}
            style={getElementStyle("title")}
            data-testid="text-contacto-title"
          >
            {getResolvedStyle("title")?.buttonText || t("contact.title")}
          </h1>
          <p
            className={`text-sm text-gray-500 text-center mb-6 ${getEditableClass("subtitle")}`}
            onClick={(e) => handleElementClick("subtitle", e)}
            style={getElementStyle("subtitle")}
            data-testid="text-contacto-subtitle"
          >
            {getResolvedStyle("subtitle")?.buttonText || t("contact.subtitle")}
          </p>
        </motion.div>

        <div
          className={`flex flex-col gap-3 rounded-2xl p-3 relative ${getEditableClass("cards-section")}`}
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
          {contactItems.slice(0, 2).map((item, index) => (
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
            onClick={(e) => {
              if (editorMode) { handleElementClick("contact-asesor", e); }
            }}
            className={`w-full rounded-2xl overflow-hidden transition-all ${getEditableClass("contact-asesor")}`}
            style={{
              background: asesorCardS?.background || "linear-gradient(135deg, #7c3aed, #a855f7)",
              boxShadow: asesorCardS?.shadowBlur ? `0 4px ${asesorCardS.shadowBlur}px ${asesorCardS.shadowColor || "rgba(0,0,0,0.1)"}` : "0 4px 20px rgba(124,58,237,0.2)",
              borderRadius: asesorCardS?.borderRadius || 16,
            }}
            data-testid="button-contact-asesor"
          >
            <div className="flex items-center p-4 gap-4">
              <div
                className={`w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/30 ${getEditableClass("operator-image")}`}
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
              <motion.div {...arrowBounce}>
                <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
              </motion.div>
            </div>
          </motion.div>

          {contactItems.slice(2).map((item, index) => (
            <ContactCard
              key={item.id}
              item={item}
              index={index + 3}
              editorMode={editorMode}
              getEditableClass={getEditableClass}
              getResolvedStyle={getResolvedStyle}
              handleElementClick={handleElementClick}
              playClick={playClick}
              arrowBounce={arrowBounce}
              t={t}
            />
          ))}
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
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] ${getEditableClass(`contact-${item.id}`)}`}
      style={{
        background: s?.background || "white",
        boxShadow: s?.shadowBlur ? `0 4px ${s.shadowBlur}px ${s.shadowColor || "rgba(0,0,0,0.06)"}` : "0 2px 12px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      }}
      data-testid={`button-contact-${item.id}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getEditableClass(`icon-${item.id}`)}`}
        style={{ background: iconS?.background || item.gradient }}
        onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`icon-${item.id}`, e); } }}
      >
        {iconS?.imageUrl ? (
          <img src={iconS.imageUrl} alt="" className="object-contain" style={{ width: iconS?.imageSize ? `${iconS.imageSize}%` : 24, height: iconS?.imageSize ? `${iconS.imageSize}%` : 24 }} />
        ) : (
          <Icon className="w-6 h-6" style={{ color: item.iconColor }} />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <span
          className="text-base font-semibold block"
          style={{ color: s?.textColor || "#374151", fontSize: s?.fontSize }}
        >
          {s?.buttonText || t(item.labelKey)}
        </span>
        <span className="text-xs text-gray-400 block mt-0.5">
          {getResolvedStyle(`sub-${item.id}`)?.buttonText || t(item.subKey)}
        </span>
      </div>
      <motion.div {...arrowBounce}>
        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
      </motion.div>
    </motion.button>
  );
}
