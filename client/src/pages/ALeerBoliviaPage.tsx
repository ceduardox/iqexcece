import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { BookOpen, Lightbulb, Users, Award, Sparkles, Target, ArrowLeft, ChevronLeft, ChevronRight, CheckCheck, School, GraduationCap, Smartphone, BarChart3, ClipboardList } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import { useTranslation } from "react-i18next";
import { EditorToolbar, type PageStyles, type ElementStyle } from "@/components/EditorToolbar";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import menuCurveImg from "@assets/menu_1769957804819.png";
import participarImg from "@assets/image_1770684494294.png";

const participarItems = [
  { id: "p1", icon: School, title: "Camino Abierto para Escuelas de Bolivia", desc: "Extendemos una invitaci\u00f3n a todas las instituciones educativas de Bolivia para que se unan a esta iniciativa transformadora, destinada a enriquecer el panorama educativo a trav\u00e9s de la lectura." },
  { id: "p2", icon: GraduationCap, title: "Estudiantes: Protagonistas del Cambio", desc: "Buscamos estudiantes listos para embarcarse en un viaje de descubrimiento y crecimiento personal a trav\u00e9s de actividades que despierten su pasi\u00f3n por la lectura." },
  { id: "p3", icon: Smartphone, title: "Lectura Digital: La Aplicaci\u00f3n que Revoluciona", desc: "Incorporamos una aplicaci\u00f3n en dispositivos m\u00f3viles para realizar pruebas que no solo eval\u00faan sino que motivan, marcando un nuevo est\u00e1ndar en la educaci\u00f3n digital." },
  { id: "p4", icon: BarChart3, title: "Resultados que Iluminan el Camino", desc: "Los resultados, enviados a padres e instituciones, ofrecen una clasificaci\u00f3n detallada de las habilidades lectoras, promoviendo un desarrollo educativo ajustado a las necesidades de cada estudiante." },
  { id: "p5", icon: ClipboardList, title: "Requisitos para Forjar Futuros Lectores", desc: "El compromiso de las escuelas es crucial, as\u00ed como la autorizaci\u00f3n y el apoyo de un adulto responsable. Esto garantiza un entorno de apoyo total para los estudiantes seleccionados, permiti\u00e9ndoles participar plenamente en las pruebas y actividades propuestas." },
];

const objectivesMeta = [
  { id: "obj1", icon: Lightbulb, color: "#f59e0b", bg: "linear-gradient(135deg, #fef3c7, #fde68a)", titleKey: "obj1Title", descKey: "obj1Desc" },
  { id: "obj2", icon: BookOpen, color: "#8b5cf6", bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)", titleKey: "obj2Title", descKey: "obj2Desc" },
  { id: "obj3", icon: Users, color: "#06b6d4", bg: "linear-gradient(135deg, #cffafe, #a5f3fc)", titleKey: "obj3Title", descKey: "obj3Desc" },
  { id: "obj4", icon: Target, color: "#10b981", bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)", titleKey: "obj4Title", descKey: "obj4Desc" },
  { id: "obj5", icon: Award, color: "#f43f5e", bg: "linear-gradient(135deg, #ffe4e6, #fecdd3)", titleKey: "obj5Title", descKey: "obj5Desc" },
];

export default function ALeerBoliviaPage() {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "es";
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

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
    fetch(`/api/page-styles/aleer-page?lang=${lang}`)
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
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    onSelect();
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  const saveStyles = useCallback(async (newStyles: PageStyles) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) return;
    try {
      await fetch("/api/admin/page-styles", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ pageName: "aleer-page", styles: JSON.stringify(newStyles), lang })
      });
    } catch {}
  }, [lang]);

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

  if (!stylesLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const iconSize = (objId: string) => styles[`icon-${objId}`]?.iconSize || 24;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header
        className={`flex items-center justify-center px-5 bg-white sticky top-0 z-50 ${getEditableClass("header")}`}
        style={{ paddingTop: 10, paddingBottom: 10 }}
        onClick={(e) => { if (editorMode) handleElementClick("header", e); }}
      >
        <button onClick={() => setLocation("/")} className="absolute left-5 p-2 text-gray-400" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <svg width="80" height="36" viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8a3ffc" />
              <stop offset="100%" stopColor="#00d9ff" />
            </linearGradient>
          </defs>
          <text x="0" y="28" fontSize="32" fontWeight="900" fontFamily="Inter, sans-serif">
            <tspan fill="#8a3ffc">i</tspan>
            <tspan fill="#8a3ffc">Q</tspan>
            <tspan fill="url(#logoGrad)">x</tspan>
          </text>
        </svg>
      </header>

      <div className="w-full sticky z-40" style={{ top: 56, marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-28">
        <section className="relative px-5 pt-8 pb-10">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
          </div>

          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: "linear-gradient(135deg, #f3e8ff, #e0f2fe)" }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-purple-600">{t("aleer.badge")}</span>
            </motion.div>

            <h1 className="text-2xl font-black text-gray-800 mb-2 leading-tight" data-testid="text-welcome-title">
              {t("aleer.welcome")}
            </h1>
            <h2 className="text-lg font-bold mb-1" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t("aleer.subtitle1")}
            </h2>
            <h3 className="text-base font-bold text-purple-600 mb-4">
              {t("aleer.subtitle2")}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              {t("aleer.description")}
            </p>
          </motion.div>

          <motion.div
            className="mt-8 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div
              className={`w-full h-48 rounded-2xl flex items-center justify-center ${getEditableClass("hero-image")}`}
              style={{
                background: styles["hero-image"]?.imageUrl
                  ? `url(${styles["hero-image"].imageUrl}) center/cover no-repeat`
                  : "linear-gradient(135deg, #ede9fe 0%, #e0f2fe 50%, #f3e8ff 100%)"
              }}
              onClick={(e) => { if (editorMode) handleElementClick("hero-image", e); }}
              data-testid="img-placeholder"
            >
              {!styles["hero-image"]?.imageUrl && (
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-purple-300 mx-auto mb-2" />
                  <span className="text-sm text-purple-400 font-medium">{t("aleer.placeholder")}</span>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        <section
          className={`px-5 pb-10 ${getEditableClass("section-objectives")}`}
          style={{ background: styles["section-objectives"]?.background || undefined }}
          onClick={(e) => { if (editorMode) handleElementClick("section-objectives", e); }}
        >
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl font-black text-gray-800 mb-2" data-testid="text-objectives-title">{t("aleer.objectivesTitle")}</h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
              {t("aleer.objectivesDesc")}
            </p>
          </motion.div>

          <div className="relative">
            <Carousel
              opts={{ align: "start", loop: true }}
              setApi={setCarouselApi}
              className="w-full"
            >
              <CarouselContent className="-ml-3">
                {objectivesMeta.map((obj, i) => {
                  const Icon = obj.icon;
                  const iSize = iconSize(obj.id);
                  return (
                    <CarouselItem key={obj.id} className="pl-3 basis-[80%] sm:basis-[45%] md:basis-[33%]">
                      <motion.div
                        className={`bg-white rounded-2xl p-4 h-full ${getEditableClass(`card-${obj.id}`)}`}
                        style={{
                          boxShadow: styles[`card-${obj.id}`]?.shadowBlur
                            ? `0 ${(styles[`card-${obj.id}`]?.shadowBlur || 10) / 2}px ${styles[`card-${obj.id}`]?.shadowBlur || 10}px ${styles[`card-${obj.id}`]?.shadowColor || "rgba(124,58,237,0.08)"}`
                            : "0 4px 20px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                          background: styles[`card-${obj.id}`]?.imageUrl
                            ? `url(${styles[`card-${obj.id}`].imageUrl}) center/cover no-repeat`
                            : styles[`card-${obj.id}`]?.background || undefined,
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.3 }}
                        onClick={(e) => { if (editorMode) handleElementClick(`card-${obj.id}`, e); }}
                        data-testid={`card-objective-${i}`}
                      >
                        <div className="flex flex-col items-center text-center gap-3">
                          <motion.div
                            className={`rounded-xl flex items-center justify-center shrink-0 ${getEditableClass(`icon-${obj.id}`)}`}
                            style={{
                              background: styles[`icon-${obj.id}`]?.imageUrl ? "transparent" : obj.bg,
                              width: iSize + 24,
                              height: iSize + 24,
                            }}
                            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
                            onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`icon-${obj.id}`, e); }}}
                          >
                            {styles[`icon-${obj.id}`]?.imageUrl ? (
                              <img
                                src={styles[`icon-${obj.id}`].imageUrl}
                                alt=""
                                style={{ width: iSize, height: iSize, objectFit: "contain" }}
                                className="drop-shadow-md"
                              />
                            ) : (
                              <Icon style={{ color: obj.color, width: iSize, height: iSize }} />
                            )}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`text-sm font-bold text-gray-800 mb-1 ${getEditableClass(`title-${obj.id}`)}`}
                              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`title-${obj.id}`, e); }}}
                              style={{
                                fontSize: styles[`title-${obj.id}`]?.fontSize || 14,
                                color: styles[`title-${obj.id}`]?.textColor || "#1f2937",
                              }}
                            >
                              {styles[`title-${obj.id}`]?.buttonText || t(`aleer.${obj.titleKey}`)}
                            </h3>
                            <p
                              className={`text-xs text-gray-400 leading-relaxed ${getEditableClass(`desc-${obj.id}`)}`}
                              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(`desc-${obj.id}`, e); }}}
                              style={{
                                fontSize: styles[`desc-${obj.id}`]?.fontSize || 12,
                                color: styles[`desc-${obj.id}`]?.textColor || "#9ca3af",
                              }}
                            >
                              {styles[`desc-${obj.id}`]?.buttonText || t(`aleer.${obj.descKey}`)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => carouselApi?.scrollPrev()}
                className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 active:scale-95 transition-transform"
                data-testid="button-slide-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {objectivesMeta.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => carouselApi?.scrollTo(i)}
                    className="transition-all duration-300"
                    data-testid={`button-dot-${i}`}
                  >
                    <div
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: currentSlide === i ? 20 : 6,
                        height: 6,
                        background: currentSlide === i
                          ? "linear-gradient(135deg, #8b5cf6, #06b6d4)"
                          : "#d1d5db",
                      }}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => carouselApi?.scrollNext()}
                className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 active:scale-95 transition-transform"
                data-testid="button-slide-next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        <section
          className={`px-5 pb-12 ${getEditableClass("section-participar")}`}
          style={{ background: styles["section-participar"]?.background || undefined }}
          onClick={(e) => { if (editorMode) handleElementClick("section-participar", e); }}
        >
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-black text-gray-800 mb-3 leading-tight" data-testid="text-participar-title">
              {"\u00bfC\u00f3mo y Qui\u00e9nes pueden participar?"}
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
              Impulsamos el futuro educativo de Bolivia con un concurso de lectura que no solo cultiva el amor por los libros entre estudiantes, sino que tambi\u00e9n afina sus habilidades anal\u00edticas y de comprensi\u00f3n.
            </p>
          </motion.div>

          <motion.div
            className={`rounded-2xl overflow-hidden mb-6 ${getEditableClass("participar-image")}`}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("participar-image", e); } }}
          >
            <img
              src={styles["participar-image"]?.imageUrl || participarImg}
              alt="Estudiante leyendo"
              className="w-full h-48 object-cover rounded-2xl"
              style={{ height: styles["participar-image"]?.iconSize ? `${styles["participar-image"].iconSize * 2}px` : undefined }}
              data-testid="img-participar"
            />
          </motion.div>

          <div className="space-y-4">
            {participarItems.map((item, i) => {
              const Icon = item.icon;
              const cardKey = `pcard-${item.id}`;
              return (
                <motion.div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-xl p-3 ${getEditableClass(cardKey)}`}
                  style={{
                    background: styles[cardKey]?.background || undefined,
                    boxShadow: styles[cardKey]?.shadowBlur
                      ? `0 ${(styles[cardKey]?.shadowBlur || 6) / 2}px ${styles[cardKey]?.shadowBlur || 6}px ${styles[cardKey]?.shadowColor || "rgba(0,0,0,0.06)"}`
                      : undefined,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(cardKey, e); } }}
                  data-testid={`card-participar-${i}`}
                >
                  <motion.div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.4 }}
                  >
                    <CheckCheck className="w-4 h-4 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <motion.button
              className="px-10 py-3.5 rounded-xl text-white font-bold text-sm tracking-wide"
              style={{ background: "linear-gradient(135deg, #ea580c, #dc2626)", boxShadow: "0 4px 15px rgba(234,88,12,0.3)" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              data-testid="button-inscribete"
            >
              INSCR\u00cdBETE
            </motion.button>
          </motion.div>
        </section>
      </main>

      <BottomNavBar />

      {editorMode && (
        <EditorToolbar
          selectedElement={selectedElement}
          styles={styles}
          onStyleChange={handleStyleChange}
          onSave={() => saveStyles(styles)}
          onClose={handleEditorClose}
          onClearSelection={() => setSelectedElement(null)}
        />
      )}
    </div>
  );
}
