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
        body: JSON.stringify({ pageName: `contacto-page`, lang, styles: JSON.stringify(styles) }),
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
    if (s.marginTop || s.marginLeft) result.transform = `translate(${s.marginLeft || 0}px, ${s.marginTop || 0}px)`;
    if (s.imageUrl && s.imageSize) { result.backgroundImage = `url(${s.imageUrl})`; result.backgroundSize = `${s.imageSize}%`; result.backgroundPosition = "center"; result.backgroundRepeat = "no-repeat"; }
    return result;
  }, [styles, isMobile]);

  const contactItems = [
    {
      id: "whatsapp",
      icon: MessageCircle,
      label: "WhatsApp",
      gradient: "linear-gradient(135deg, #25D366, #128C7E)",
      iconColor: "#fff",
      action: () => window.open("https://wa.me/59178767696", "_blank"),
    },
    {
      id: "email",
      icon: Mail,
      label: "Email",
      gradient: "linear-gradient(135deg, #8a3ffc, #6d28d9)",
      iconColor: "#fff",
      action: () => { window.location.href = "mailto:soporte@inteligenciaexponencial.com"; },
    },
    {
      id: "blog",
      icon: Newspaper,
      label: "Blog",
      gradient: "linear-gradient(135deg, #f3e8ff, #e0f2fe)",
      iconColor: "#8b5cf6",
      textDark: true,
      action: () => setLocation("/blog"),
    },
    {
      id: "leer-bolivia",
      icon: BookOpen,
      label: "A Leer Bolivia",
      gradient: "linear-gradient(135deg, #d1fae5, #cffafe)",
      iconColor: "#10b981",
      textDark: true,
      action: () => setLocation("/a-leer-bolivia"),
    },
    {
      id: "asesor",
      icon: Headphones,
      label: "Hablar con un asesor",
      gradient: "linear-gradient(135deg, #fef3c7, #fde68a)",
      iconColor: "#d97706",
      textDark: true,
      action: () => {},
    },
  ];

  if (!stylesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30 flex flex-col" onClick={() => { if (editorMode) setSelectedElement(null); }}>
      <CurvedHeader showBack onBack={() => setLocation("/")} />

      <div className="flex-1 px-5 pb-28 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4"
        >
          <h1
            className={`text-2xl font-bold text-center mb-2 ${getEditableClass("title")}`}
            onClick={(e) => handleElementClick("title", e)}
            style={getElementStyle("title")}
            data-testid="text-contacto-title"
          >
            {resolveStyle(styles, "title", isMobile)?.buttonText || "Contacto"}
          </h1>
          <p
            className={`text-sm text-gray-500 text-center mb-8 ${getEditableClass("subtitle")}`}
            onClick={(e) => handleElementClick("subtitle", e)}
            style={getElementStyle("subtitle")}
            data-testid="text-contacto-subtitle"
          >
            {resolveStyle(styles, "subtitle", isMobile)?.buttonText || "Selecciona una opción para comunicarte con nosotros"}
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {contactItems.map((item, index) => {
            const Icon = item.icon;
            const s = resolveStyle(styles, `contact-${item.id}`, isMobile);
            return (
              <motion.button
                key={item.id}
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
                  ...(s?.marginLeft || s?.marginTop ? { transform: `translate(${s?.marginLeft || 0}px, ${s?.marginTop || 0}px)` } : {}),
                }}
                data-testid={`button-contact-${item.id}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getEditableClass(`icon-${item.id}`)}`}
                  style={{ background: resolveStyle(styles, `icon-${item.id}`, isMobile)?.background || item.gradient }}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`icon-${item.id}`, e); } }}
                >
                  {resolveStyle(styles, `icon-${item.id}`, isMobile)?.imageUrl ? (
                    <img src={resolveStyle(styles, `icon-${item.id}`, isMobile)!.imageUrl} alt="" style={{ width: 24, height: 24 }} />
                  ) : (
                    <Icon className="w-6 h-6" style={{ color: item.iconColor }} />
                  )}
                </div>
                <span
                  className="text-base font-semibold flex-1 text-left"
                  style={{ color: s?.textColor || (item.textDark ? "#374151" : "#374151") }}
                >
                  {s?.buttonText || item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </motion.button>
            );
          })}
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

