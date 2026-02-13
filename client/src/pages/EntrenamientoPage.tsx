import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import { EditorToolbar, type PageStyles, type ElementStyle, type DeviceMode, resolveStyle } from "@/components/EditorToolbar";
import { LanguageButton } from "@/components/LanguageButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSounds } from "@/hooks/use-sounds";
import menuCurveImg from "@assets/menu_1769957804819.png";

const LOGO_URL = "https://iqexponencial.app/api/images/1382c7c2-0e84-4bdb-bdd4-687eb9732416";

interface EntrenamientoPageData {
  bannerText: string;
  pageTitle: string;
  pageDescription: string;
}

interface EntrenamientoItem {
  id: string;
  categoria: string;
  imageUrl: string | null;
  title: string;
  description: string | null;
  linkUrl: string | null;
  tipoEjercicio: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
}

const defaultCardStyles = [
  { bg: "linear-gradient(145deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)" },
  { bg: "linear-gradient(145deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)" },
  { bg: "linear-gradient(145deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)" },
  { bg: "linear-gradient(145deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)" },
  { bg: "linear-gradient(145deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)" },
];

export default function EntrenamientoPage() {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'es';
  const params = useParams<{ categoria: string }>();
  const categoria = params.categoria || "ninos";
  const { playSound } = useSounds();
  const isMobile = useIsMobile();

  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");

  const { data: pageData } = useQuery<{ page: EntrenamientoPageData }>({
    queryKey: ["/api/entrenamiento", categoria, "page", lang],
    queryFn: async () => {
      const res = await fetch(`/api/entrenamiento/${categoria}/page?lang=${lang}`);
      return res.json();
    },
  });

  const { data: itemsData } = useQuery<{ items: EntrenamientoItem[] }>({
    queryKey: ["/api/entrenamiento", categoria, "items", lang],
    queryFn: async () => {
      const res = await fetch(`/api/entrenamiento/${categoria}/items?lang=${lang}`);
      return res.json();
    },
  });

  const page = pageData?.page;
  const items = itemsData?.items?.filter(i => i.isActive !== false) || [];

  useEffect(() => {
    const handleStorageChange = () => {
      setEditorMode(localStorage.getItem("editorMode") === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 500);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setStylesLoaded(true), 2000);
    fetch(`/api/page-styles/entrenamiento-items-${categoria}?lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        if (data.style?.styles) {
          try { setStyles(JSON.parse(data.style.styles)); } catch (e) {}
        }
        clearTimeout(timeout);
        setStylesLoaded(true);
      })
      .catch(() => { clearTimeout(timeout); setStylesLoaded(true); });
    return () => clearTimeout(timeout);
  }, [lang, categoria]);

  const saveStyles = useCallback(async (newStyles: PageStyles) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) return;
    try {
      await fetch("/api/admin/page-styles", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ pageName: `entrenamiento-items-${categoria}`, styles: JSON.stringify(newStyles), lang })
      });
    } catch (error) { console.error("Error saving styles:", error); }
  }, [lang, categoria]);

  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    if (!editorMode) return;
    e.stopPropagation();
    setSelectedElement(elementId);
  }, [editorMode]);

  const handleStyleChange = useCallback((elementId: string, newStyle: ElementStyle) => {
    const updated = { ...styles, [elementId]: { ...styles[elementId], ...newStyle } };
    setStyles(updated);
    saveStyles(updated);
  }, [styles, saveStyles]);

  const handleEditorClose = useCallback(() => {
    setSelectedElement(null);
    localStorage.setItem("editorMode", "false");
    setEditorMode(false);
  }, []);

  const getEditableClass = useCallback((elementId: string) => {
    if (!editorMode) return "";
    const base = "transition-all duration-200";
    return selectedElement === elementId
      ? `${base} ring-2 ring-purple-500 ring-offset-2`
      : `${base} hover:ring-2 hover:ring-purple-400 hover:ring-offset-1`;
  }, [editorMode, selectedElement]);

  const getResolvedStyle = useCallback((elementId: string): ElementStyle => {
    return resolveStyle(styles, elementId, isMobile);
  }, [styles, isMobile]);

  const handleBack = () => {
    playSound("iphone");
    window.history.back();
  };

  const handleItemClick = (item: EntrenamientoItem) => {
    playSound("card");
    if (editorMode) return;
    setLocation(`/entrenamiento/${categoria}/prep/${item.id}`);
  };

  if (!stylesLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 w-full md:hidden" style={{ background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)" }}>
        <div className="relative pt-3 pb-2 px-5">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255, 255, 255, 0.9)", boxShadow: "0 2px 8px rgba(138, 63, 252, 0.15)" }} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" style={{ color: "#8a3ffc" }} />
            </button>
            <img src={LOGO_URL} alt="iQx" className="h-10 w-auto object-contain" />
            <LanguageButton />
          </div>
        </div>
      </header>
      <div className="w-full sticky z-40 md:hidden" style={{ top: 56, marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-28">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 mx-4 mt-4 rounded-xl ${getEditableClass("banner")}`}
          style={(() => {
            const s = getResolvedStyle("banner");
            return {
              background: s?.background || "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
            };
          })()}
          onClick={(e) => handleElementClick("banner", e)}
          data-testid="section-banner"
        >
          <p className="text-white text-sm font-medium text-center" style={(() => {
            const s = getResolvedStyle("bannerText");
            return { color: s?.color || "#fff", fontSize: s?.fontSize ? `${s.fontSize}px` : undefined };
          })()}>
            {page?.bannerText || "¡Disfruta ahora de ejercicios de entrenamiento gratuitos por tiempo limitado!"}
          </p>
        </motion.div>

        <div className="px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center mb-8 ${getEditableClass("header")}`}
            onClick={(e) => handleElementClick("header", e)}
          >
            <h1 className="text-3xl font-black text-slate-900 mb-2" style={(() => {
              const s = getResolvedStyle("pageTitle");
              return { color: s?.color, fontSize: s?.fontSize ? `${s.fontSize}px` : undefined };
            })()}>
              {page?.pageTitle || "Entrenamientos"}
            </h1>
            <p className="text-slate-500" style={(() => {
              const s = getResolvedStyle("pageDesc");
              return { color: s?.color, fontSize: s?.fontSize ? `${s.fontSize}px` : undefined };
            })()}>
              {page?.pageDescription || "Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:max-w-3xl md:mx-auto">
            {items.length === 0 && (
              <div className="text-center py-12 text-slate-500 col-span-full">
                <p>No hay entrenamientos disponibles aún.</p>
              </div>
            )}

            {items.map((item, index) => {
              const cardId = `card-${index}`;
              const titleId = `cardTitle-${index}`;
              const descId = `cardDesc-${index}`;
              const imgId = `cardImg-${index}`;
              const btnId = `cardBtn-${index}`;
              const cs = getResolvedStyle(cardId);
              const ts = getResolvedStyle(titleId);
              const ds = getResolvedStyle(descId);
              const is = getResolvedStyle(imgId);
              const bs = getResolvedStyle(btnId);
              const defaultBg = defaultCardStyles[index % defaultCardStyles.length]?.bg;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    opacity: { delay: 0.1 + index * 0.12, duration: 0.4 },
                    scale: { delay: 0.1 + index * 0.12, duration: 0.4, type: "spring", stiffness: 100 },
                    y: { delay: 0.1 + index * 0.12, duration: 0.4 }
                  }}
                  whileHover={editorMode ? undefined : { scale: 1.02, transition: { duration: 0.2 } }}
                  onClick={() => handleItemClick(item)}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer ${getEditableClass(cardId)}`}
                  style={{
                    background: cs?.background || defaultBg,
                    boxShadow: cs?.shadowBlur
                      ? `0 ${(cs.shadowBlur || 0) / 2}px ${cs.shadowBlur}px ${cs?.shadowColor || "rgba(0,0,0,0.3)"}`
                      : "0 8px 32px rgba(0,0,0,0.12)",
                  }}
                  data-testid={`card-entrenamiento-${item.id}`}
                >
                  <div
                    className="p-5 flex gap-4"
                    onClick={(e) => handleElementClick(cardId, e)}
                  >
                    {item.imageUrl && (
                      <div
                        className={`flex-shrink-0 rounded-xl overflow-hidden bg-white/10 self-center ${getEditableClass(imgId)}`}
                        onClick={(e) => handleElementClick(imgId, e)}
                        style={{
                          width: is?.imageSize ? `${is.imageSize}%` : "80px",
                          height: is?.imageSize ? `${is.imageSize}%` : "80px",
                          maxWidth: 100,
                          maxHeight: 100,
                        }}
                      >
                        <img
                          src={is?.imageUrl || item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3
                        className={`text-lg font-bold text-white mb-1 ${getEditableClass(titleId)}`}
                        onClick={(e) => handleElementClick(titleId, e)}
                        style={{
                          color: ts?.color || "#fff",
                          fontSize: ts?.fontSize ? `${ts.fontSize}px` : undefined,
                          fontWeight: ts?.fontWeight || "bold",
                          textAlign: (ts?.textAlign as any) || undefined,
                        }}
                      >
                        {item.title}
                      </h3>
                      {item.description && (
                        <p
                          className={`text-sm text-white/70 leading-snug mb-3 ${getEditableClass(descId)}`}
                          onClick={(e) => handleElementClick(descId, e)}
                          style={{
                            color: ds?.color || "rgba(255,255,255,0.7)",
                            fontSize: ds?.fontSize ? `${ds.fontSize}px` : undefined,
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                      <div className="mt-auto flex justify-end">
                        <motion.button
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full ${getEditableClass(btnId)}`}
                          onClick={(e) => { e.stopPropagation(); if (editorMode) { handleElementClick(btnId, e); } else { handleItemClick(item); } }}
                          style={(() => {
                            return {
                              background: bs?.background || "rgba(139,92,246,0.9)",
                              color: bs?.color || "#fff",
                              boxShadow: bs?.shadowBlur
                                ? `0 ${(bs.shadowBlur || 0) / 2}px ${bs.shadowBlur}px ${bs?.shadowColor || "rgba(139,92,246,0.3)"}`
                                : "0 4px 15px rgba(139,92,246,0.3)"
                            };
                          })()}
                          whileTap={editorMode ? undefined : { scale: 0.95 }}
                        >
                          {bs?.buttonText || "Iniciar"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <TrainingNavBar activePage="entrenar" categoria={categoria} />

      {editorMode && (
        <EditorToolbar
          selectedElement={selectedElement}
          styles={styles}
          onStyleChange={handleStyleChange}
          onSave={() => saveStyles(styles)}
          onClose={handleEditorClose}
          onClearSelection={() => setSelectedElement(null)}
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
        />
      )}
    </div>
  );
}