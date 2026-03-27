import { useState, useEffect, useCallback, type ComponentType } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { BookOpen, Lightbulb, Users, Award, Sparkles, Target, ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, CheckCheck, School, GraduationCap, Smartphone, BarChart3, ClipboardList, Building2, Handshake, UserRound, PlayCircle, X, FileDown, IdCard, Briefcase, Phone, Mail, FileText, MapPin, CalendarDays, Hash } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import { LanguageButton } from "@/components/LanguageButton";
import { useTranslation } from "react-i18next";
import { EditorToolbar, type PageStyles, type ElementStyle, type DeviceMode } from "@/components/EditorToolbar";
import { VideoBackground, isVideoUrl } from "@/components/VideoBackground";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import menuCurveImg from "@assets/menu_1769957804819.png";
import participarImg from "@assets/image_1770684494294.png";
import laxCyan from "@assets/laxcyan2_1771479429192.png";
import laxPurpura from "@assets/laxpurpura_1771479319056.png";
import laxBlanca from "@assets/laxblanca_1771479319056.png";
import laxVerde from "@assets/laxverde_1771479319057.png";
import aleerPremiosImg from "@assets/aleer-premios.jpg";
const LOGO_URL = "/api/images/6218ab21-88a5-4e44-9254-bd17fb7fb2bb";

const participarItems = [
  { id: "p1", icon: School, titleKey: "part1Title", descKey: "part1Desc" },
  { id: "p2", icon: GraduationCap, titleKey: "part2Title", descKey: "part2Desc" },
  { id: "p3", icon: Smartphone, titleKey: "part3Title", descKey: "part3Desc" },
  { id: "p4", icon: BarChart3, titleKey: "part4Title", descKey: "part4Desc" },
  { id: "p5", icon: ClipboardList, titleKey: "part5Title", descKey: "part5Desc" },
];

const objectivesMeta = [
  { id: "obj1", icon: Lightbulb, color: "#f59e0b", bg: "linear-gradient(135deg, #fef3c7, #fde68a)", titleKey: "obj1Title", descKey: "obj1Desc" },
  { id: "obj2", icon: BookOpen, color: "#8b5cf6", bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)", titleKey: "obj2Title", descKey: "obj2Desc" },
  { id: "obj3", icon: Users, color: "#06b6d4", bg: "linear-gradient(135deg, #cffafe, #a5f3fc)", titleKey: "obj3Title", descKey: "obj3Desc" },
  { id: "obj4", icon: Target, color: "#10b981", bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)", titleKey: "obj4Title", descKey: "obj4Desc" },
  { id: "obj5", icon: Award, color: "#f43f5e", bg: "linear-gradient(135deg, #ffe4e6, #fecdd3)", titleKey: "obj5Title", descKey: "obj5Desc" },
];

const schoolLogos = [
  { src: "/logos/colegios/adventista.png", alt: "Colegio Adventista Santa Cruz" },
  { src: "/logos/colegios/amadeus.png", alt: "Colegio Amadeus Mozart 1" },
  { src: "/logos/colegios/boliviano-japones.png", alt: "Colegio Boliviano Japones" },
  { src: "/logos/colegios/bp.jpg", alt: "Colegio Boliviano Paraguayo" },
  { src: "/logos/colegios/cardenal-cushing.png", alt: "Colegio Cardenal Cushing" },
  { src: "/logos/colegios/franco-boliviano.png", alt: "Colegio Franco Boliviano" },
  { src: "/logos/colegios/las-palmas.png", alt: "Colegio Las Palmas School" },
  { src: "/logos/colegios/latinoamericano.png", alt: "Colegio Latinoamericano" },
  { src: "/logos/colegios/maria-goretti.png", alt: "Colegio Maria Goretti" },
  { src: "/logos/colegios/oxford.png", alt: "Colegio Oxford English School" },
  { src: "/logos/colegios/peniel.png", alt: "Colegio Peniel" },
  { src: "/logos/colegios/rio-nuevo.png", alt: "Colegio Rio Nuevo" },
  { src: "/logos/colegios/santo-tomas.png", alt: "Colegio Santo Tomas de Aquino" },
  { src: "/logos/colegios/uboldi.png", alt: "Colegio Uboldi" },
  { src: "/logos/colegios/bautista-brasileno.png", alt: "Colegio Bautista Boliviano Brasileno" },
  { src: "/logos/colegios/proverbios.png", alt: "Colegio Proverbios" },
];

const sponsorLogos = [
  { src: "/logos/sponsors/250522223524_logocuadrado.jpg", name: "Sponsor 1" },
  { src: "/logos/sponsors/250528191832_logorectangulo.jpg", name: "Sponsor 2" },
  { src: "/logos/sponsors/17129606091190455667.jpg", name: "Sponsor 3" },
  { src: "/logos/sponsors/1715469284249250013.jpg", name: "Sponsor 4" },
  { src: "/logos/sponsors/1715471147212095531.jpg", name: "Sponsor 5" },
  { src: "/logos/sponsors/17173657221811979344.jpg", name: "Sponsor 6" },
];

type ModalFormInputProps = React.ComponentProps<typeof Input> & {
  icon: ComponentType<{ className?: string }>;
};

const MODAL_INPUT_CLASS =
  "h-11 bg-[#f8fbff] border-[#d8e2f0] text-gray-700 placeholder:text-gray-400 shadow-[0_4px_14px_rgba(15,23,42,0.06)] focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:border-cyan-400";

const ModalFormInput = ({
  icon: Icon,
  className = "",
  ...props
}: ModalFormInputProps) => (
  <div className="relative">
    <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    <Input {...props} className={`${MODAL_INPUT_CLASS} pl-10 ${className}`} />
  </div>
);

export default function ALeerBoliviaPage() {
  // Toggle para desactivar temporalmente estilos remotos del Navigator en esta página.
  // Cuando quieras reactivarlo, cambia a `true`.
  const USE_REMOTE_PAGE_STYLES = false;
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "es";
  const [editorMode, setEditorMode] = useState(() => USE_REMOTE_PAGE_STYLES && localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [motivationalIndex, setMotivationalIndex] = useState(0);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
  const [joinModalType, setJoinModalType] = useState<"schools" | "sponsors" | "independent" | null>(null);
  const [joinStartedAt, setJoinStartedAt] = useState<number>(0);
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string>("");
  const [sponsorsTab, setSponsorsTab] = useState<"types" | "register">("types");
  const [openSponsorTier, setOpenSponsorTier] = useState<"gran" | "mediano" | "pequeno" | null>("gran");
  const [joinForm, setJoinForm] = useState({
    responsableNombre: "",
    responsableCi: "",
    responsableCargo: "",
    responsableProfesion: "",
    responsableTelefono: "",
    responsableEmail: "",
    institucionNombre: "",
    institucionRazonSocial: "",
    institucionNit: "",
    institucionDireccion: "",
    institucionTelefonos: "",
    institucionEmail: "",
    colaboradorNombre: "",
    colaboradorCi: "",
    colaboradorCargo: "",
    colaboradorProfesion: "",
    colaboradorTelefono: "",
    colaboradorEmail: "",
    website: "",
  });

  useEffect(() => {
    if (!USE_REMOTE_PAGE_STYLES) {
      setEditorMode(false);
      localStorage.setItem("editorMode", "false");
      return;
    }
    const handleStorageChange = () => {
      setEditorMode(localStorage.getItem("editorMode") === "true");
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 500);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [USE_REMOTE_PAGE_STYLES]);

  useEffect(() => {
    if (!USE_REMOTE_PAGE_STYLES) {
      setStyles({});
      setStylesLoaded(true);
      return;
    }
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
  }, [lang, USE_REMOTE_PAGE_STYLES]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    onSelect();
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  const saveStyles = useCallback(async (newStyles: PageStyles) => {
    if (!USE_REMOTE_PAGE_STYLES) return;
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) return;
    try {
      await fetch("/api/admin/page-styles", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ pageName: "aleer-page", styles: JSON.stringify(newStyles), lang })
      });
    } catch {}
  }, [lang, USE_REMOTE_PAGE_STYLES]);

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

  const motivationalVideos = [
    {
      id: 1,
      title: t("aleer.video1Title"),
      desc: t("aleer.video1Desc"),
      source: t("aleer.video1Source"),
    },
    {
      id: 2,
      title: t("aleer.video2Title"),
      desc: t("aleer.video2Desc"),
      source: t("aleer.video2Source"),
    },
    {
      id: 3,
      title: t("aleer.video3Title"),
      desc: t("aleer.video3Desc"),
      source: t("aleer.video3Source"),
    },
  ];
  const activeVideo = motivationalVideos[motivationalIndex];
  const schoolLogosLoop = [...schoolLogos, ...schoolLogos];
  const sponsorLogosLoop = [...sponsorLogos, ...sponsorLogos];
  const joinModalTitleMap = {
    schools: "Inscripcion de Colegios",
    sponsors: "Inscripcion de Auspiciadores",
    independent: "Inscripcion de Estudiantes Independientes",
  } as const;
  const sponsorTiers = [
    {
      id: "gran" as const,
      title: "GRAN AUSPICIADOR",
      subtitle: "Lidera el cambio en la educacion y la cultura lectora",
      benefits: [
        {
          title: "Convocatoria impresa al Intercolegial",
          desc: "Su marca estara presente en el documento de convocatoria que sera entregado en cada colegio participante",
        },
        {
          title: "Marca en el banner del Intercolegial",
          desc: "Su logotipo sera destacado en el banner ubicado en el lugar donde se celebrara la gran final",
        },
        {
          title: "Marca en los videos de redes sociales",
          desc: "Su marca sera promocionada en los videos difundidos en los canales oficiales de IQExponencial, llegando a una amplia audiencia",
        },
        {
          title: "Activaciones en los colegios",
          desc: "Tendra la oportunidad de realizar activaciones y promociones de su marca en los colegios participantes, generando un mayor impacto",
        },
        {
          title: "Presencia de la marca en la final",
          desc: "Su marca estara presente promocional durante la emocionante final del Intercolegial",
        },
        {
          title: "Presencia de la marca en la gala final",
          desc: "Su producto o servicio sera exhibido y promocionado en la gala final del Intercolegial, generando visibilidad y reconocimiento",
        },
        {
          title: "Video con el ganador y el producto o servicio",
          desc: "Se realizara un video promocional con el ganador del concurso y su producto o servicio, brindandole una mayor exposicion",
        },
        {
          title: "Exclusividad del producto o servicio",
          desc: "Su marca gozara de exclusividad en su categoria de producto o servicio dentro del evento",
        },
      ],
    },
    {
      id: "mediano" as const,
      title: "MEDIANO AUSPICIADOR",
      subtitle: "Fortalece tu presencia, inspira a la comunidad",
      benefits: [
        {
          title: "Convocatoria impresa al Intercolegial",
          desc: "Su marca estara presente en el documento de convocatoria que sera entregado en cada colegio participante",
        },
        {
          title: "Marca en el banner del Intercolegial",
          desc: "Su logotipo sera destacado en el banner ubicado en el lugar donde se celebrara la gran final",
        },
        {
          title: "Marca en los videos de redes sociales",
          desc: "Su marca sera promocionada en los videos difundidos en los canales oficiales de IQExponencial, llegando a una amplia audiencia",
        },
        {
          title: "Activaciones en los colegios",
          desc: "Tendra la oportunidad de realizar activaciones y promociones de su marca en los colegios participantes, generando un mayor impacto",
        },
        {
          title: "Exclusividad del producto o servicio",
          desc: "Su marca gozara de exclusividad en su categoria de producto o servicio dentro del evento",
        },
      ],
    },
    {
      id: "pequeno" as const,
      title: "PEQUENO AUSPICIADOR",
      subtitle: "Haz que tu marca cuente, apoya el progreso educativo",
      benefits: [
        {
          title: "Convocatoria impresa al Intercolegial",
          desc: "Su marca estara presente en el documento de convocatoria que sera entregado en cada colegio participante",
        },
        {
          title: "Marca en el banner del Intercolegial",
          desc: "Su logotipo sera destacado en el banner ubicado en el lugar donde se celebrara la gran final",
        },
        {
          title: "Marca en los videos de redes sociales",
          desc: "Su marca sera promocionada en los videos difundidos en los canales oficiales de IQExponencial, llegando a una amplia audiencia",
        },
        {
          title: "Exclusividad del producto o servicio",
          desc: "Su marca gozara de exclusividad en su categoria de producto o servicio dentro del evento",
        },
      ],
    },
  ];

  const openJoinModal = (type: "schools" | "sponsors" | "independent") => {
    setJoinModalType(type);
    setJoinStartedAt(Date.now());
    setJoinMessage("");
    setSponsorsTab(type === "sponsors" ? "types" : "register");
    setOpenSponsorTier("gran");
  };

  const closeJoinModal = () => {
    setJoinModalType(null);
    setJoinMessage("");
    setJoinSubmitting(false);
  };

  const updateJoinField = (key: keyof typeof joinForm, value: string) => {
    setJoinForm(prev => ({ ...prev, [key]: value }));
  };

  const submitJoinForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinModalType) return;
    if (joinModalType === "independent") {
      if (!joinForm.responsableNombre.trim() || !joinForm.responsableTelefono.trim() || !joinForm.institucionNombre.trim()) {
        setJoinMessage("Completa datos de tutor y estudiante.");
        return;
      }
    } else if (!joinForm.responsableNombre.trim() || !joinForm.responsableTelefono.trim() || !joinForm.institucionNombre.trim()) {
      setJoinMessage("Completa nombre, telefono e institucion.");
      return;
    }
    setJoinSubmitting(true);
    setJoinMessage("");
    try {
      const res = await fetch("/api/aleer/inscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: joinModalType,
          startedAt: joinStartedAt,
          ...joinForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinMessage(data?.error || "No se pudo enviar el formulario.");
        setJoinSubmitting(false);
        return;
      }
      setJoinMessage("Registro enviado correctamente.");
      setJoinForm({
        responsableNombre: "",
        responsableCi: "",
        responsableCargo: "",
        responsableProfesion: "",
        responsableTelefono: "",
        responsableEmail: "",
        institucionNombre: "",
        institucionRazonSocial: "",
        institucionNit: "",
        institucionDireccion: "",
        institucionTelefonos: "",
        institucionEmail: "",
        colaboradorNombre: "",
        colaboradorCi: "",
        colaboradorCargo: "",
        colaboradorProfesion: "",
        colaboradorTelefono: "",
        colaboradorEmail: "",
        website: "",
      });
      setTimeout(() => closeJoinModal(), 700);
    } catch {
      setJoinMessage("Error de conexion.");
      setJoinSubmitting(false);
    }
  };

  useEffect(() => {
    if (motivationalVideos.length <= 1) return;
    let direction = 1;
    const id = window.setInterval(() => {
      setMotivationalIndex((prev) => {
        let next = prev + direction;
        if (next >= motivationalVideos.length) {
          direction = -1;
          next = motivationalVideos.length - 2;
        } else if (next < 0) {
          direction = 1;
          next = 1;
        }
        return next;
      });
    }, 5200);
    return () => window.clearInterval(id);
  }, [motivationalVideos.length]);

  if (!stylesLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const iconSize = (objId: string) => styles[`icon-${objId}`]?.iconSize || 24;

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.img src={laxCyan} alt="" className="absolute opacity-[0.07] w-[260px] md:w-[480px]" style={{ top: "5%", right: "-60px" }} animate={{ rotate: [0, 10, -6, 0], scale: [1, 1.07, 0.96, 1] }} transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }} />
        <motion.img src={laxPurpura} alt="" className="absolute opacity-[0.05] w-[190px] md:w-[340px]" style={{ top: "32%", left: "-55px" }} animate={{ rotate: [0, -7, 5, 0], y: [0, 18, -12, 0] }} transition={{ duration: 23, repeat: Infinity, ease: "easeInOut", delay: 3 }} />
        <motion.img src={laxVerde} alt="" className="absolute opacity-[0.06] w-[210px] md:w-[370px]" style={{ bottom: "12%", right: "3%" }} animate={{ rotate: [0, 6, -9, 0], x: [0, -18, 14, 0] }} transition={{ duration: 21, repeat: Infinity, ease: "easeInOut", delay: 5 }} />
        <motion.img src={laxBlanca} alt="" className="absolute opacity-[0.04] w-[170px] md:w-[290px]" style={{ top: "58%", left: "28%" }} animate={{ rotate: [0, -9, 7, 0], scale: [1, 1.09, 0.94, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 8 }} />
      </div>
      <motion.header
        className={`flex items-center justify-center px-5 bg-white sticky top-0 z-50 md:hidden ${getEditableClass("header")}`}
        style={{ paddingTop: 10, paddingBottom: 10 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={(e) => { if (editorMode) handleElementClick("header", e); }}
      >
        <button onClick={() => setLocation("/")} className="absolute left-5 p-2 text-gray-400" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img
          src={LOGO_URL}
          alt="iQx"
          className="h-10 w-auto object-contain"
          data-testid="header-logo-image"
        />
        <div className="absolute right-5">
          <LanguageButton />
        </div>
      </motion.header>

      <motion.div
        className="w-full sticky z-40 md:hidden"
        style={{ top: 56, marginTop: -4, marginBottom: -20 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </motion.div>

      <main className="flex-1 overflow-y-auto pb-28">
        <motion.section
          className={`relative px-5 pt-8 pb-10 ${getEditableClass("section-hero")}`}
          style={{
            background: (styles["section-hero"]?.imageUrl && !isVideoUrl(styles["section-hero"]?.imageUrl))
              ? `url(${styles["section-hero"].imageUrl}) center/cover no-repeat`
              : styles["section-hero"]?.background || "linear-gradient(135deg, #66c7cd 0%, #5ec3cc 55%, #6ed2cf 100%)",
          }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          onClick={(e) => { if (editorMode) handleElementClick("section-hero", e); }}
        >
          {isVideoUrl(styles["section-hero"]?.imageUrl) && (
            <VideoBackground src={styles["section-hero"]!.imageUrl!} imageSize={styles["section-hero"]?.imageSize} />
          )}
          {editorMode && (
            <div
              className="absolute top-2 right-2 z-20 bg-purple-600/80 text-white text-[9px] px-2 py-0.5 rounded-full cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleElementClick("section-hero", e); }}
              data-testid="badge-edit-hero-bg"
            >
              {t("aleer.editHeroBg")}
            </div>
          )}
          {!styles["section-hero"]?.background && !styles["section-hero"]?.imageUrl && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-28 -right-28 w-[420px] h-[420px]">
                <div className="absolute inset-0 rotate-45 rounded-2xl bg-violet-700/75" />
                <div className="absolute inset-0 -rotate-45 rounded-2xl bg-violet-600/65" />
              </div>
              <div className="absolute -bottom-28 -left-36 w-[420px] h-[420px] opacity-45">
                <div className="absolute inset-0 rotate-45 rounded-2xl bg-cyan-300/55" />
                <div className="absolute inset-0 -rotate-45 rounded-2xl bg-white/30" />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_28%,rgba(255,255,255,0.18),transparent_42%),radial-gradient(circle_at_78%_72%,rgba(124,58,237,0.16),transparent_48%)]" />
            </div>
          )}

          <motion.div
            className="relative z-10 max-w-6xl mx-auto md:grid md:grid-cols-[0.95fr_1.25fr] gap-8 items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-left">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 bg-white/20 border border-white/35 backdrop-blur-[2px]"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-xs font-extrabold text-white tracking-wide">{t("aleer.badge")}</span>
              </motion.div>

              <h1
                className={`text-[36px] sm:text-[46px] md:text-[56px] font-black mb-2 leading-[0.95] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)] ${getEditableClass("hero-title")}`}
                style={{
                  fontSize: styles["hero-title"]?.fontSize || undefined,
                  color: styles["hero-title"]?.textColor || "#ffffff",
                }}
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("hero-title", e); } }}
                data-testid="text-welcome-title"
              >
                {t("aleer.welcome")}
              </h1>
            </div>

            <div className="text-left md:pt-8">
              <h2
                className={`text-xl md:text-3xl font-black mb-2 text-[#0b1828] ${getEditableClass("hero-subtitle1")}`}
                style={{
                  color: styles["hero-subtitle1"]?.textColor || "#0b1828",
                  fontSize: styles["hero-subtitle1"]?.fontSize || undefined,
                }}
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("hero-subtitle1", e); } }}
              >
                {t("aleer.subtitle1")}
              </h2>
              <h3
                className={`text-base md:text-xl font-bold mb-3 text-[#11263e] ${getEditableClass("hero-subtitle2")}`}
                style={{
                  color: styles["hero-subtitle2"]?.textColor || "#11263e",
                  fontSize: styles["hero-subtitle2"]?.fontSize || undefined,
                }}
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("hero-subtitle2", e); } }}
              >
                {t("aleer.subtitle2")}
              </h3>
              <p
                className={`text-sm md:text-lg leading-relaxed max-w-2xl text-black/95 ${getEditableClass("hero-desc")}`}
                style={{
                  color: styles["hero-desc"]?.textColor || "rgba(0,0,0,0.95)",
                  fontSize: styles["hero-desc"]?.fontSize || undefined,
                }}
                onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("hero-desc", e); } }}
              >
                {t("aleer.description")}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="mt-8 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div
              className={`w-full h-52 md:h-[460px] lg:h-[520px] rounded-2xl flex items-center justify-center overflow-hidden ${getEditableClass("hero-image")}`}
              style={{
                height: styles["hero-image"]?.iconSize ? `${styles["hero-image"].iconSize * 2}px` : undefined,
                background: styles["hero-image"]?.imageUrl
                  ? undefined
                  : styles["hero-image"]?.background || "linear-gradient(135deg, #ede9fe 0%, #e0f2fe 50%, #f3e8ff 100%)",
              }}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("hero-image", e); } }}
              data-testid="img-placeholder"
            >
              {styles["hero-image"]?.imageUrl ? (
                <img
                  src={styles["hero-image"].imageUrl}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={aleerPremiosImg}
                    alt="Ganadores A Leer Bolivia"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold text-white bg-cyan-600/85 border border-cyan-200/60 shadow-md">
                      A Leer Bolivia
                    </span>
                    <span className="text-[10px] sm:text-xs text-white/95 font-semibold drop-shadow">
                      Intercolegial de Lectura
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          className={`px-5 pb-10 relative ${getEditableClass("section-objectives")}`}
          style={{
            background: (styles["section-objectives"]?.imageUrl && !isVideoUrl(styles["section-objectives"]?.imageUrl))
              ? `url(${styles["section-objectives"].imageUrl}) center/cover no-repeat`
              : styles["section-objectives"]?.background || undefined,
          }}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          onClick={(e) => { if (editorMode) handleElementClick("section-objectives", e); }}
        >
          {isVideoUrl(styles["section-objectives"]?.imageUrl) && (
            <VideoBackground src={styles["section-objectives"]!.imageUrl!} imageSize={styles["section-objectives"]?.imageSize} />
          )}
          {editorMode && (
            <div
              className="absolute top-2 right-2 z-20 bg-cyan-600/80 text-white text-[9px] px-2 py-0.5 rounded-full cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleElementClick("section-objectives", e); }}
              data-testid="badge-edit-objectives-bg"
            >
              {t("aleer.editObjectivesBg")}
            </div>
          )}
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
        </motion.section>

        <motion.section
          className={`px-5 pb-12 pt-8 relative ${getEditableClass("section-participar")}`}
          style={{
            background: (styles["section-participar"]?.imageUrl && !isVideoUrl(styles["section-participar"]?.imageUrl))
              ? `url(${styles["section-participar"].imageUrl}) center/cover no-repeat`
              : styles["section-participar"]?.background || undefined,
          }}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          onClick={(e) => { if (editorMode) handleElementClick("section-participar", e); }}
        >
          {isVideoUrl(styles["section-participar"]?.imageUrl) && (
            <VideoBackground src={styles["section-participar"]!.imageUrl!} imageSize={styles["section-participar"]?.imageSize} />
          )}
          {editorMode && (
            <div
              className="absolute top-2 right-2 z-20 bg-orange-600/80 text-white text-[9px] px-2 py-0.5 rounded-full cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleElementClick("section-participar", e); }}
              data-testid="badge-edit-participar-bg"
            >
              {t("aleer.editParticiparBg")}
            </div>
          )}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
              style={{ background: "linear-gradient(135deg, #fff7ed, #fed7aa)" }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-orange-700">{t("aleer.participationBadge")}</span>
            </motion.div>
            <h2
              className={`text-xl font-black mb-3 leading-tight ${getEditableClass("participar-title")}`}
              style={{
                color: styles["participar-title"]?.textColor || "#1f2937",
                fontSize: styles["participar-title"]?.fontSize || undefined,
              }}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("participar-title", e); } }}
              data-testid="text-participar-title"
            >
              {t("aleer.participarTitle")}
            </h2>
            <p
              className={`text-xs leading-relaxed max-w-sm mx-auto ${getEditableClass("participar-desc")}`}
              style={{
                color: styles["participar-desc"]?.textColor || "#9ca3af",
                fontSize: styles["participar-desc"]?.fontSize || undefined,
              }}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("participar-desc", e); } }}
            >
              {t("aleer.participarDesc")}
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            <motion.div
              className={`md:w-1/2 rounded-2xl overflow-hidden ${getEditableClass("participar-image")}`}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("participar-image", e); } }}
            >
              <img
                src={styles["participar-image"]?.imageUrl || "/api/images/0ac59e05-5b57-4642-9b78-9f50eca502f1"}
                alt="Estudiante leyendo"
                className="w-full h-56 md:h-full object-cover rounded-2xl"
                style={{ height: styles["participar-image"]?.iconSize ? `${styles["participar-image"].iconSize * 2}px` : undefined }}
                data-testid="img-participar"
              />
            </motion.div>

            <div className="md:w-1/2 hidden md:flex flex-col gap-3">
              {participarItems.map((item, i) => {
                const cardKey = `pcard-${item.id}`;
                return (
                  <motion.div
                    key={item.id}
                    className={`flex items-start gap-3 rounded-xl p-3 ${getEditableClass(cardKey)}`}
                    style={{
                      background: styles[cardKey]?.imageUrl
                        ? `url(${styles[cardKey].imageUrl}) center/cover no-repeat`
                        : styles[cardKey]?.background || undefined,
                      boxShadow: styles[cardKey]?.shadowBlur
                        ? `0 ${(styles[cardKey]?.shadowBlur || 6) / 2}px ${styles[cardKey]?.shadowBlur || 6}px ${styles[cardKey]?.shadowColor || "rgba(0,0,0,0.06)"}`
                        : undefined,
                    }}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(cardKey, e); } }}
                    data-testid={`card-participar-${i}`}
                  >
                    <motion.div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.3 }}
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-800 mb-0.5">{t(`aleer.${item.titleKey}`)}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{t(`aleer.${item.descKey}`)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="md:hidden">
              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent className="-ml-2">
                  {participarItems.map((item, i) => {
                    const cardKey = `pcard-${item.id}`;
                    return (
                      <CarouselItem key={item.id} className="pl-2 basis-[85%]">
                        <motion.div
                          className={`rounded-2xl p-4 h-full ${getEditableClass(cardKey)}`}
                          style={{
                            background: styles[cardKey]?.imageUrl
                              ? `url(${styles[cardKey].imageUrl}) center/cover no-repeat`
                              : styles[cardKey]?.background || "linear-gradient(145deg, #fff7ed, #ffffff)",
                            boxShadow: styles[cardKey]?.shadowBlur
                              ? `0 ${(styles[cardKey]?.shadowBlur || 8) / 2}px ${styles[cardKey]?.shadowBlur || 8}px ${styles[cardKey]?.shadowColor || "rgba(234,88,12,0.1)"}`
                              : "0 4px 20px rgba(234,88,12,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08, duration: 0.3 }}
                          onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick(cardKey, e); } }}
                          data-testid={`card-participar-${i}`}
                        >
                          <div className="flex items-start gap-3">
                            <motion.div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}
                              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                              transition={{ repeat: Infinity, duration: 3, delay: i * 0.4 }}
                            >
                              <CheckCheck className="w-4 h-4 text-white" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-gray-800 mb-1">{t(`aleer.${item.titleKey}`)}</h3>
                              <p className="text-xs text-gray-400 leading-relaxed">{t(`aleer.${item.descKey}`)}</p>
                            </div>
                          </div>
                        </motion.div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
              </Carousel>
            </div>
          </div>

        </motion.section>

        <motion.section
          className="px-5 pb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          data-testid="section-inscribete-videos"
        >
          <div
            className="rounded-3xl overflow-hidden border border-violet-300/50"
            style={{ boxShadow: "0 18px 40px rgba(109,40,217,0.22), 0 6px 14px rgba(0,0,0,0.08)" }}
          >
            <div className="relative px-5 pt-8 pb-8 text-center overflow-hidden" style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 45%, #4c1d95 100%)" }}>
              <img src={laxPurpura} alt="" className="absolute -top-8 -left-8 w-52 md:w-72 opacity-18 pointer-events-none" />
              <img src={laxCyan} alt="" className="absolute -bottom-10 -right-8 w-56 md:w-80 opacity-20 pointer-events-none" />
              <motion.div
                className="absolute -top-16 left-[20%] w-64 h-64 rounded-full opacity-25 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(34,211,238,0.9) 0%, transparent 68%)" }}
                animate={{ scale: [1, 1.08, 0.96, 1], rotate: [0, 12, -8, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -bottom-20 right-[10%] w-72 h-72 rounded-full opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(167,139,250,0.95) 0%, transparent 70%)" }}
                animate={{ scale: [1, 0.94, 1.06, 1], rotate: [0, -10, 7, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              />

              <h3 className="relative z-10 text-3xl md:text-4xl font-black text-cyan-200 mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">{t("aleer.joinTitle")}</h3>
              <p className="relative z-10 text-sm md:text-base text-white/95 max-w-2xl mx-auto leading-relaxed">
                {t("aleer.joinDesc")}
              </p>

              <div className="relative z-10 mt-6 grid gap-3 md:grid-cols-3">
                {[
                  { key: "schools", icon: Building2, label: t("aleer.joinSchools") },
                  { key: "sponsors", icon: Handshake, label: t("aleer.joinSponsors") },
                  { key: "independent", icon: UserRound, label: t("aleer.joinIndependent") },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.key}
                      type="button"
                      className="w-full rounded-2xl px-4 py-4 text-left flex items-center gap-3 border border-cyan-200/55"
                      style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 45%, #0284c7 100%)", boxShadow: "0 10px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.18)" }}
                      initial={{ opacity: 0, y: 16, scale: 0.96 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.06 * i, duration: 0.28 }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openJoinModal(item.key as "schools" | "sponsors" | "independent")}
                      data-testid={`button-join-${item.key}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_1px_2px_rgba(76,29,149,0.48)]">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="relative px-5 py-8 text-center overflow-hidden" style={{ background: "linear-gradient(135deg, #22d3ee 0%, #34d399 100%)" }}>
              <img src={laxBlanca} alt="" className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-72 md:w-[520px] opacity-35 pointer-events-none" />
              <h3
                className="relative z-10 font-sans text-3xl md:text-4xl font-black mb-2 text-black tracking-tight drop-shadow-[0_2px_0_rgba(255,255,255,0.25)]"
                style={{ textShadow: "0 0 18px rgba(34,211,238,0.28)" }}
              >
                {t("aleer.videosTitle")}
              </h3>
              <div className="relative z-10 mx-auto mb-3 h-1.5 w-36 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-300 to-violet-400" />
              <p className="relative z-10 font-sans text-sm md:text-base text-black max-w-3xl mx-auto leading-relaxed">
                {t("aleer.videosDesc")}
              </p>

              <div className="relative z-10 mt-6 md:hidden">
                <motion.div
                  key={`mobile-video-${activeVideo.id}`}
                  className="rounded-2xl border border-violet-200/80 bg-white/90 backdrop-blur-sm p-3 text-left"
                  style={{ boxShadow: "0 8px 22px rgba(109,40,217,0.14), 0 2px 6px rgba(0,0,0,0.05)" }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28 }}
                  data-testid={`card-video-motivador-${activeVideo.id}`}
                >
                  <div className="grid grid-cols-1 gap-3 items-stretch">
                    <div
                      className="relative w-full rounded-xl border border-violet-200/80 bg-white/70 overflow-hidden"
                      style={{
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.65)",
                        minHeight: 136,
                      }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,40,217,0.32),transparent_46%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.28),transparent_50%)]" />
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="w-11 h-11 rounded-full bg-white/85 border border-violet-200 flex items-center justify-center shadow-md">
                          <PlayCircle className="w-6 h-6 text-violet-600" />
                        </div>
                      </motion.div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-start gap-2">
                        <span className="text-5xl leading-none text-violet-200 font-black">&ldquo;</span>
                        <p
                          className="font-sans text-xs text-black leading-relaxed pt-1"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 7,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "7.2em",
                          }}
                        >
                          {activeVideo.desc}
                        </p>
                      </div>
                      <p className="font-sans text-[11px] text-black mt-2 pl-8">- {activeVideo.source}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      className="px-3 py-2 rounded-full text-xs font-bold text-white bg-violet-600 active:scale-95 transition-transform"
                      onClick={() => setMotivationalIndex((prev) => (prev === 0 ? motivationalVideos.length - 1 : prev - 1))}
                      data-testid="button-video-prev-mobile"
                    >
                      <span className="inline-flex items-center gap-1">
                        <ChevronLeft className="w-3 h-3" />
                        {t("tests.previous")}
                      </span>
                    </button>
                    <button
                      className="px-3 py-2 rounded-full text-xs font-bold text-white bg-cyan-600 active:scale-95 transition-transform"
                      onClick={() => setMotivationalIndex((prev) => (prev + 1) % motivationalVideos.length)}
                      data-testid="button-video-next-mobile"
                    >
                      <span className="inline-flex items-center gap-1">
                        {t("tests.next")}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                    <div className="ml-auto flex items-center gap-1.5">
                      {motivationalVideos.map((item, idx) => (
                        <button
                          key={`mobile-dot-${item.id}`}
                          onClick={() => setMotivationalIndex(idx)}
                          className="transition-all"
                          data-testid={`button-video-dot-mobile-${idx}`}
                        >
                          <div
                            className="rounded-full"
                            style={{
                              width: motivationalIndex === idx ? 16 : 6,
                              height: 6,
                              background: motivationalIndex === idx
                                ? "linear-gradient(135deg, #7c3aed, #06b6d4)"
                                : "#cbd5e1",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              <div
                className="relative z-10 mt-7 hidden md:grid md:grid-cols-[1fr_1.55fr] rounded-2xl overflow-hidden border border-cyan-200/70"
                style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.16), rgba(255,255,255,0.9))" }}
                data-testid="desktop-video-split"
              >
                <div className="p-5 text-left border-r border-cyan-200/70">
                  <motion.div
                    key={`quote-${activeVideo.id}`}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-[88px] leading-[0.7] text-violet-200 font-black">&ldquo;</span>
                    <p className="text-[20px] text-black leading-relaxed min-h-[170px] pt-2">
                      {activeVideo.desc}
                    </p>
                  </motion.div>
                  <p className="text-xs text-black mt-2">- {activeVideo.source}</p>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      className="px-3 py-2 rounded-full text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors"
                      onClick={() => setMotivationalIndex((prev) => (prev === 0 ? motivationalVideos.length - 1 : prev - 1))}
                      data-testid="button-video-prev"
                    >
                      <span className="inline-flex items-center gap-1">
                        <ChevronLeft className="w-3 h-3" />
                        {t("tests.previous")}
                      </span>
                    </button>
                    <button
                      className="px-3 py-2 rounded-full text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-colors"
                      onClick={() => setMotivationalIndex((prev) => (prev + 1) % motivationalVideos.length)}
                      data-testid="button-video-next"
                    >
                      <span className="inline-flex items-center gap-1">
                        {t("tests.next")}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                    <div className="ml-auto flex items-center gap-1.5">
                      {motivationalVideos.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => setMotivationalIndex(idx)}
                          className="transition-all"
                          data-testid={`button-video-dot-${idx}`}
                        >
                          <div
                            className="rounded-full"
                            style={{
                              width: motivationalIndex === idx ? 16 : 6,
                              height: 6,
                              background: motivationalIndex === idx
                                ? "linear-gradient(135deg, #7c3aed, #06b6d4)"
                                : "#cbd5e1",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative p-4 flex items-center justify-center">
                  <div
                    className="relative w-full aspect-video rounded-xl overflow-hidden border border-violet-200/70"
                    style={{
                      background: "linear-gradient(135deg, rgba(109,40,217,0.26), rgba(6,182,212,0.22)), url(" + laxCyan + ") center/cover no-repeat",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-14 h-14 rounded-full bg-white/85 border border-white/70 flex items-center justify-center shadow-lg"
                      >
                        <PlayCircle className="w-8 h-8 text-violet-600" />
                      </motion.div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 text-left px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm">
                      <p className="text-xs font-bold text-violet-700 truncate">{activeVideo.source}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="px-5 pb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          data-testid="section-colegios-carousel"
        >
          <div
            className="rounded-3xl border border-cyan-200/70 bg-white/85 backdrop-blur-sm p-5 md:p-6"
            style={{ boxShadow: "0 14px 36px rgba(6,182,212,0.14), 0 4px 14px rgba(109,40,217,0.08)" }}
          >
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-black text-violet-700">{t("aleer.schoolsTitle")}</h3>
              <p className="text-sm md:text-base text-gray-700 mt-2 max-w-3xl mx-auto">{t("aleer.schoolsDesc")}</p>
            </div>

            <div className="mt-5 relative overflow-hidden rounded-2xl border border-violet-200/70 bg-white/75">
              <motion.div
                className="flex w-max items-center gap-4 py-4 px-2"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
              >
                {schoolLogosLoop.map((logo, idx) => (
                  <div
                    key={`${logo.src}-${idx}`}
                    className="w-[92px] h-[92px] sm:w-[102px] sm:h-[102px] md:w-[112px] md:h-[112px] rounded-2xl bg-white border border-cyan-100 shadow-sm p-2 shrink-0 flex items-center justify-center"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      loading="lazy"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="px-5 pb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          data-testid="section-sponsors-carousel"
        >
          <div
            className="rounded-3xl border border-violet-200/70 bg-white/85 backdrop-blur-sm p-5 md:p-6"
            style={{ boxShadow: "0 14px 36px rgba(109,40,217,0.14), 0 4px 14px rgba(6,182,212,0.08)" }}
          >
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-black text-cyan-700">{t("aleer.sponsorsTitle")}</h3>
              <p className="text-sm md:text-base text-gray-700 mt-2 max-w-3xl mx-auto">{t("aleer.sponsorsDesc")}</p>
            </div>

            <div className="mt-5 relative overflow-hidden rounded-2xl border border-cyan-200/70 bg-white/75">
              <motion.div
                className="flex w-max items-center gap-4 py-4 px-2"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
              >
                {sponsorLogosLoop.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="w-[112px] h-[112px] sm:w-[124px] sm:h-[124px] md:w-[132px] md:h-[132px] rounded-2xl bg-white border border-violet-100 shadow-sm p-2 shrink-0 flex items-center justify-center"
                    title={item.name}
                  >
                    <img
                      src={item.src}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = "none";
                        const parent = img.parentElement as HTMLElement | null;
                        if (parent && !parent.querySelector(".sponsor-fallback")) {
                          const span = document.createElement("span");
                          span.className = "sponsor-fallback text-[10px] leading-tight text-center font-bold text-violet-700 px-1";
                          span.textContent = item.name;
                          parent.appendChild(span);
                        }
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>
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
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
        />
      )}

      {joinModalType && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-cyan-300/40 bg-white shadow-2xl"
          >
            <div
              className={`sticky top-0 z-10 text-white px-4 py-3 flex items-center justify-between ${
                joinModalType === "sponsors"
                  ? "bg-[#3A8E27]"
                  : joinModalType === "independent"
                    ? "bg-[#D8510D]"
                    : "bg-[#1f4a8f]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full border border-white/70 flex items-center justify-center shrink-0 bg-white/10">
                  {joinModalType === "sponsors" ? (
                    <Handshake className="w-6 h-6" />
                  ) : joinModalType === "independent" ? (
                    <BookOpen className="w-6 h-6" />
                  ) : (
                    <Building2 className="w-6 h-6" />
                  )}
                </div>
                <div className="min-w-0">
                  {joinModalType === "independent" ? (
                    <>
                      <h3 className="text-lg sm:text-[36px] font-black leading-[0.9] uppercase">Inscripcion de Estudiantes</h3>
                      <p className="text-[11px] sm:text-sm uppercase font-bold tracking-[0.02em] text-orange-100 mt-1">
                        ¡Hola, Joven Explorador del Conocimiento!
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] uppercase tracking-[0.08em] text-cyan-100">Formulario Oficial</p>
                      <h3 className="text-lg sm:text-xl font-black leading-tight truncate">{joinModalTitleMap[joinModalType]}</h3>
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                onClick={closeJoinModal}
                data-testid="button-close-join-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {joinModalType === "schools" && (
              <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600">Completa el formulario para iniciar el registro.</p>
                <a
                  href="/docs/concursodelectura.pdf"
                  download="convocatoria-a-leer-bolivia.pdf"
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-800 transition-colors"
                  data-testid="button-download-convocatoria"
                >
                  <FileDown className="w-4 h-4" />
                  DESCARGA CONVOCATORIA
                </a>
              </div>
            )}

            {joinModalType === "independent" && (
              <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2 border-b border-gray-100">
                <p className="text-center text-gray-700 text-sm sm:text-base leading-relaxed max-w-4xl mx-auto">
                  Preparate para sumergirte en historias que despierten tu imaginacion, descubrir conocimientos que alimenten tu mente
                  y participar en desafios que fortalezcan tu espiritu. Estamos emocionados de verte crecer y evolucionar en este viaje.
                </p>
                <p className="text-center text-gray-800 font-semibold text-sm sm:text-base mt-3">
                  Completa el formulario y se parte de esta gran aventura lectora.
                </p>
              </div>
            )}

            {joinModalType === "sponsors" && (
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  Estimado(a) Auspiciador, te invitamos a ser parte de un movimiento que transforma la educacion y la cultura lectora en Bolivia.
                  Este evento intercolegial impulsa impacto real y ofrece niveles de auspicio para maximizar visibilidad y resultados de marca.
                </p>
                <div className="mt-4 grid grid-cols-2 border border-blue-300 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSponsorsTab("types")}
                    className={`py-2.5 text-sm font-semibold transition-colors ${sponsorsTab === "types" ? "bg-[#2C72AC] text-white" : "bg-white text-gray-700"}`}
                    data-testid="button-sponsors-types"
                  >
                    Tipos de Auspicio
                  </button>
                  <button
                    type="button"
                    onClick={() => setSponsorsTab("register")}
                    className={`py-2.5 text-sm font-semibold transition-colors ${sponsorsTab === "register" ? "bg-[#2C72AC] text-white" : "bg-white text-gray-700"}`}
                    data-testid="button-sponsors-register"
                  >
                    Solicitar Registro
                  </button>
                </div>
              </div>
            )}

            {joinModalType === "sponsors" && sponsorsTab === "types" && (
              <div className="p-4 sm:p-6 space-y-3">
                {sponsorTiers.map((tier) => {
                  const isOpen = openSponsorTier === tier.id;
                  return (
                    <div key={tier.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenSponsorTier(isOpen ? null : tier.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-white hover:bg-gray-50"
                        data-testid={`button-sponsor-tier-${tier.id}`}
                      >
                        <div>
                          <p className="font-bold text-gray-800 text-sm sm:text-base">{tier.title}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{tier.subtitle}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="p-3 sm:p-4 bg-[#f3f3f3]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tier.benefits.map((benefit, idx) => {
                              const shouldCenter =
                                tier.id === "mediano" &&
                                tier.benefits.length % 2 === 1 &&
                                idx === tier.benefits.length - 1;
                              return (
                                <div
                                  key={`${tier.id}-${benefit.title}`}
                                  className={`bg-white rounded-md border border-gray-200 px-4 py-4 text-center ${shouldCenter ? "md:col-span-2 md:max-w-[48%] md:mx-auto" : ""}`}
                                >
                                  <p className="font-semibold text-gray-800 text-[15px] leading-tight">{benefit.title}</p>
                                  <p className="mt-2 text-[13px] text-gray-600 leading-snug">{benefit.desc}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="pt-2 text-center">
                  <p className="text-sm text-gray-700 max-w-2xl mx-auto">
                    Potencie su marca con un auspicio y contribuya significativamente a la educacion y lectura.
                  </p>
                  <Button
                    type="button"
                    className="mt-4 bg-[#2C72AC] hover:bg-[#245d8d] text-white px-8"
                    onClick={() => setSponsorsTab("register")}
                    data-testid="button-sponsors-contactar"
                  >
                    CONTACTAR
                  </Button>
                </div>
              </div>
            )}

            <form className={`p-4 sm:p-5 space-y-5 ${joinModalType === "sponsors" && sponsorsTab === "types" ? "hidden" : ""}`} onSubmit={submitJoinForm} data-testid="form-join-inscripcion">
              <input
                type="text"
                autoComplete="off"
                tabIndex={-1}
                value={joinForm.website}
                onChange={(e) => updateJoinField("website", e.target.value)}
                className="hidden"
                aria-hidden="true"
              />

              {joinModalType === "independent" ? (
                <>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.04em] uppercase text-gray-500 border-b border-gray-200 pb-1 mb-3">Identificacion del padre/madre o tutor</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <ModalFormInput icon={UserRound} placeholder="Nombre completo" value={joinForm.responsableNombre} onChange={(e) => updateJoinField("responsableNombre", e.target.value)} />
                      </div>
                      <ModalFormInput icon={Handshake} placeholder="Parentesco" value={joinForm.responsableCargo} onChange={(e) => updateJoinField("responsableCargo", e.target.value)} />
                      <ModalFormInput icon={IdCard} placeholder="C.I." value={joinForm.responsableCi} onChange={(e) => updateJoinField("responsableCi", e.target.value)} />
                      <ModalFormInput icon={Phone} placeholder="Telefonos" value={joinForm.responsableTelefono} onChange={(e) => updateJoinField("responsableTelefono", e.target.value)} />
                      <ModalFormInput icon={Mail} type="email" placeholder="Email" value={joinForm.responsableEmail} onChange={(e) => updateJoinField("responsableEmail", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold tracking-[0.04em] uppercase text-gray-500 border-b border-gray-200 pb-1 mb-3">Informacion del estudiante</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <ModalFormInput icon={UserRound} placeholder="Nombre completo" value={joinForm.institucionNombre} onChange={(e) => updateJoinField("institucionNombre", e.target.value)} />
                      </div>
                      <ModalFormInput icon={CalendarDays} placeholder="Fecha de nacimiento" value={joinForm.institucionRazonSocial} onChange={(e) => updateJoinField("institucionRazonSocial", e.target.value)} />
                      <ModalFormInput icon={Hash} placeholder="Edad" value={joinForm.institucionNit} onChange={(e) => updateJoinField("institucionNit", e.target.value)} />
                      <ModalFormInput icon={School} placeholder="Colegio" value={joinForm.institucionDireccion} onChange={(e) => updateJoinField("institucionDireccion", e.target.value)} />
                      <ModalFormInput icon={GraduationCap} placeholder="Grado" value={joinForm.institucionTelefonos} onChange={(e) => updateJoinField("institucionTelefonos", e.target.value)} />
                      <ModalFormInput icon={Phone} placeholder="Telefono" value={joinForm.colaboradorTelefono} onChange={(e) => updateJoinField("colaboradorTelefono", e.target.value)} />
                      <ModalFormInput icon={Mail} type="email" placeholder="Email" value={joinForm.institucionEmail} onChange={(e) => updateJoinField("institucionEmail", e.target.value)} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.04em] uppercase text-gray-500 border-b border-gray-200 pb-1 mb-3">Responsable del Evento</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ModalFormInput icon={UserRound} placeholder="Nombre completo" value={joinForm.responsableNombre} onChange={(e) => updateJoinField("responsableNombre", e.target.value)} />
                      <ModalFormInput icon={IdCard} placeholder="C.I." value={joinForm.responsableCi} onChange={(e) => updateJoinField("responsableCi", e.target.value)} />
                      <ModalFormInput icon={Briefcase} placeholder="Cargo en la institucion" value={joinForm.responsableCargo} onChange={(e) => updateJoinField("responsableCargo", e.target.value)} />
                      <ModalFormInput icon={FileText} placeholder="Profesion o actividad" value={joinForm.responsableProfesion} onChange={(e) => updateJoinField("responsableProfesion", e.target.value)} />
                      <ModalFormInput icon={Phone} placeholder="Telefono" value={joinForm.responsableTelefono} onChange={(e) => updateJoinField("responsableTelefono", e.target.value)} />
                      <ModalFormInput icon={Mail} type="email" placeholder="Email" value={joinForm.responsableEmail} onChange={(e) => updateJoinField("responsableEmail", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold tracking-[0.04em] uppercase text-gray-500 border-b border-gray-200 pb-1 mb-3">Datos de la Institucion</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <ModalFormInput icon={Building2} placeholder="Nombre de la institucion" value={joinForm.institucionNombre} onChange={(e) => updateJoinField("institucionNombre", e.target.value)} />
                      </div>
                      <ModalFormInput icon={FileText} placeholder="Razon social" value={joinForm.institucionRazonSocial} onChange={(e) => updateJoinField("institucionRazonSocial", e.target.value)} />
                      <ModalFormInput icon={Hash} placeholder="NIT" value={joinForm.institucionNit} onChange={(e) => updateJoinField("institucionNit", e.target.value)} />
                      <div className="sm:col-span-2">
                        <ModalFormInput icon={MapPin} placeholder="Direccion" value={joinForm.institucionDireccion} onChange={(e) => updateJoinField("institucionDireccion", e.target.value)} />
                      </div>
                      <ModalFormInput icon={Phone} placeholder="Telefonos" value={joinForm.institucionTelefonos} onChange={(e) => updateJoinField("institucionTelefonos", e.target.value)} />
                      <ModalFormInput icon={Mail} type="email" placeholder="Email" value={joinForm.institucionEmail} onChange={(e) => updateJoinField("institucionEmail", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold tracking-[0.04em] uppercase text-gray-500 border-b border-gray-200 pb-1 mb-3">Colaborador Asignado</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ModalFormInput icon={UserRound} placeholder="Nombre completo" value={joinForm.colaboradorNombre} onChange={(e) => updateJoinField("colaboradorNombre", e.target.value)} />
                      <ModalFormInput icon={IdCard} placeholder="C.I." value={joinForm.colaboradorCi} onChange={(e) => updateJoinField("colaboradorCi", e.target.value)} />
                      <ModalFormInput icon={Briefcase} placeholder="Cargo en la institucion" value={joinForm.colaboradorCargo} onChange={(e) => updateJoinField("colaboradorCargo", e.target.value)} />
                      <ModalFormInput icon={FileText} placeholder="Profesion o actividad" value={joinForm.colaboradorProfesion} onChange={(e) => updateJoinField("colaboradorProfesion", e.target.value)} />
                      <ModalFormInput icon={Phone} placeholder="Telefono" value={joinForm.colaboradorTelefono} onChange={(e) => updateJoinField("colaboradorTelefono", e.target.value)} />
                      <ModalFormInput icon={Mail} type="email" placeholder="Email" value={joinForm.colaboradorEmail} onChange={(e) => updateJoinField("colaboradorEmail", e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-xs text-gray-500">Seguridad activa: filtro anti-spam sin captcha de Google.</p>
                <Button
                  type="submit"
                  disabled={joinSubmitting}
                  className="bg-[#1f4a8f] hover:bg-[#193d75] text-white px-5"
                  data-testid="button-submit-join-form"
                >
                  {joinSubmitting ? "Enviando..." : "SOLICITAR REGISTRO"}
                </Button>
              </div>
              {joinMessage && (
                <p className={`text-sm ${joinMessage.includes("correctamente") ? "text-emerald-600" : "text-red-500"}`} data-testid="text-join-form-message">
                  {joinMessage}
                </p>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
