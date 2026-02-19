import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Minus } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageButton } from "@/components/LanguageButton";
import { useUserData } from "@/lib/user-context";
import { EditorToolbar, type PageStyles, type ElementStyle, type DeviceMode, resolveStyle } from "@/components/EditorToolbar";
import { BottomNavBar } from "@/components/BottomNavBar";
import { useIsMobile } from "@/hooks/use-mobile";
import menuCurveImg from "@assets/menu_1769957804819.png";

function SpacerEl({ id, styles, isMobile, editorMode, getEditableClass, handleElementClick }: {
  id: string; styles: PageStyles; isMobile: boolean; editorMode: boolean;
  getEditableClass: (id: string) => string; handleElementClick: (id: string, e: React.MouseEvent) => void;
}) {
  const resolved = resolveStyle(styles, id, isMobile);
  const height = resolved.sectionHeight ?? resolved.spacerHeight ?? 20;
  const visible = resolved.visible !== false;
  if (!visible && !editorMode) return null;
  return (
    <div className={`w-full ${getEditableClass(id)} ${!visible && editorMode ? "opacity-40" : ""}`}
      onClick={(e) => handleElementClick(id, e)}
      style={{ height: visible ? height : 4, background: editorMode ? "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,217,255,0.08) 5px, rgba(0,217,255,0.08) 10px)" : "transparent", transition: "height 0.2s ease" }}
      data-testid={`spacer-${id}`}>
      {editorMode && <div className="flex items-center justify-center h-full"><span className="text-[9px] text-gray-400 bg-gray-900/60 px-2 py-0.5 rounded"><Minus className="w-3 h-3 inline mr-1" />{id} ({height}px) {!visible ? "[oculto]" : ""}</span></div>}
    </div>
  );
}

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const playCardSound = () => {
  const audio = new Audio('/card.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const ageCategories = [
  { 
    id: "preescolar", 
    labelKey: "age.preescolar",
    ageRange: "3-5", 
    ageGroup: "preescolar",
    descKey: "age.preescolarDesc",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588294.png",
    iconBg: "linear-gradient(135deg, #FFE082 0%, #FFB300 100%)"
  },
  { 
    id: "ninos", 
    labelKey: "age.ninos",
    ageRange: "6-11", 
    ageGroup: "ninos",
    descKey: "age.ninosDesc",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    iconBg: "linear-gradient(135deg, #CE93D8 0%, #9C27B0 100%)"
  },
  { 
    id: "adolescentes", 
    labelKey: "age.adolescentes",
    ageRange: "12-17", 
    ageGroup: "adolescentes",
    descKey: "age.adolescentesDesc",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588658.png",
    iconBg: "linear-gradient(135deg, #B39DDB 0%, #7E57C2 100%)"
  },
  { 
    id: "profesionales", 
    labelKey: "age.adultos",
    ageRange: "18-59", 
    ageGroup: "profesionales",
    descKey: "age.adultosDesc",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4213/4213958.png",
    iconBg: "linear-gradient(135deg, #90CAF9 0%, #1976D2 100%)"
  },
  { 
    id: "adulto_mayor", 
    labelKey: "age.adultoMayor",
    ageRange: "60+", 
    ageGroup: "adulto_mayor",
    descKey: "age.adultoMayorDesc",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3588/3588614.png",
    iconBg: "linear-gradient(135deg, #CE93D8 0%, #8E24AA 100%)"
  },
];

interface AgeCardProps {
  category: typeof ageCategories[0];
  index: number;
  onClick: () => void;
  editorMode: boolean;
  styles: PageStyles;
  isMobile: boolean;
  onElementClick: (id: string, e: React.MouseEvent) => void;
  getEditableClass: (id: string) => string;
}

function AgeCard({ category, index, onClick, editorMode, styles, isMobile, onElementClick, getEditableClass }: AgeCardProps) {
  const { t } = useTranslation();
  const cardId = `card-${category.id}`;
  const iconId = `icon-${category.id}`;
  const titleId = `title-${category.id}`;
  const descId = `desc-${category.id}`;
  
  const cardStyle = resolveStyle(styles, cardId, isMobile);
  const iconStyle = resolveStyle(styles, iconId, isMobile);
  const titleStyle = resolveStyle(styles, titleId, isMobile);
  const descStyle = resolveStyle(styles, descId, isMobile);
  const iconSize = iconStyle.iconSize || 40;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05, duration: 0.25 }}
      onClick={(e) => editorMode ? onElementClick(cardId, e) : onClick()}
      className={`cursor-pointer ${getEditableClass(cardId)}`}
      data-testid={`card-age-${category.id}`}
    >
      <motion.div
        className="relative overflow-visible rounded-2xl px-3 py-2.5 flex items-center gap-3 transition-all bg-white hover:shadow-md"
        style={{ 
          background: cardStyle.imageUrl 
            ? `url(${cardStyle.imageUrl}) center/cover no-repeat` 
            : cardStyle.background || "white",
          borderRadius: cardStyle.borderRadius || 16,
          boxShadow: cardStyle.shadowBlur 
            ? `0 ${cardStyle.shadowBlur / 2}px ${cardStyle.shadowBlur}px ${cardStyle.shadowColor || "rgba(0,0,0,0.08)"}` 
            : "0 1px 4px rgba(0,0,0,0.06)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <div 
          className={`flex-shrink-0 flex items-center justify-center rounded-xl ${getEditableClass(iconId)}`}
          onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(iconId, e); }}}
          style={{ 
            width: iconSize + 8, 
            height: iconSize + 8,
            background: iconStyle.background || category.iconBg,
            padding: 6
          }}
        >
          <img 
            src={iconStyle.imageUrl || category.iconUrl} 
            alt="" 
            className="drop-shadow-sm"
            style={{ width: iconSize - 6, height: iconSize - 6, objectFit: "contain" }} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 
            className={`font-semibold leading-tight ${getEditableClass(titleId)}`}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(titleId, e); }}}
            style={{
              fontSize: titleStyle.fontSize || 14,
              color: titleStyle.textColor || "#1f2937"
            }}
          >
            {titleStyle.buttonText || t(category.labelKey)} <span style={{ color: "#7c3aed", fontWeight: 600 }}>({category.ageRange})</span>
          </h3>
          <p 
            className={`leading-tight mt-0.5 ${getEditableClass(descId)}`}
            onClick={(e) => { if (editorMode) { e.stopPropagation(); onElementClick(descId, e); }}}
            style={{
              fontSize: descStyle.fontSize || 12,
              color: descStyle.textColor || "#9ca3af"
            }}
          >
            {descStyle.buttonText || t(category.descKey)}
          </p>
        </div>

        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function AgeSelectionPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'es';
  const [, setLocation] = useLocation();
  const params = useParams<{ testId: string }>();
  const testId = params.testId || "lectura";
  const { updateUserData } = useUserData();
  
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem("editorMode") === "true");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [styles, setStyles] = useState<PageStyles>({});
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
  const isMobile = useIsMobile();

  useEffect(() => {
    const stored = localStorage.getItem("editorMode");
    if (stored === "true") setEditorMode(true);
    
    const timeout = setTimeout(() => setStylesLoaded(true), 2000);
    
    fetch(`/api/page-styles/age-selection?lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        if (data.style?.styles) {
          try {
            setStyles(JSON.parse(data.style.styles));
          } catch (e) {
            console.log("No saved styles");
          }
        }
        clearTimeout(timeout);
        setStylesLoaded(true);
      })
      .catch(() => {
        clearTimeout(timeout);
        setStylesLoaded(true);
      });
    
    return () => clearTimeout(timeout);
  }, [lang]);

  const saveStyles = useCallback(async (newStyles: PageStyles) => {
    const authToken = localStorage.getItem("adminToken");
    if (!authToken) {
      alert(t("exercises.loginRequired"));
      return;
    }
    try {
      const stylesStr = JSON.stringify(newStyles);
      await Promise.all([
        fetch("/api/admin/page-styles", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
          body: JSON.stringify({ pageName: "age-selection", styles: stylesStr, lang })
        }),
        fetch("/api/admin/page-styles", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
          body: JSON.stringify({ pageName: "entrenamiento-edad", styles: stylesStr, lang })
        })
      ]);
    } catch (e) {
      console.error("Error saving styles:", e);
    }
  }, [lang]);

  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    if (!editorMode) return;
    e.stopPropagation();
    setSelectedElement(elementId);
  }, [editorMode]);

  const handleStyleChange = useCallback((elementId: string, newStyle: ElementStyle) => {
    setStyles(prev => {
      const updated = { ...prev, [elementId]: newStyle };
      return updated;
    });
  }, []);

  const handleEditorClose = useCallback(() => {
    setEditorMode(false);
  }, []);

  const getEditableClass = useCallback((elementId: string) => {
    if (!editorMode) return "";
    const base = "transition-all duration-200";
    return selectedElement === elementId
      ? `${base} ring-2 ring-purple-500 ring-offset-2`
      : `${base} hover:ring-2 hover:ring-purple-400 hover:ring-offset-1`;
  }, [editorMode, selectedElement]);

  const getElementStyle = useCallback((elementId: string, defaultBg?: string): React.CSSProperties => {
    const s = resolveStyle(styles, elementId, isMobile);
    if (!s || Object.keys(s).length === 0) return defaultBg ? { background: defaultBg } : {};
    
    const result: React.CSSProperties = {};
    
    if (s.imageUrl && s.backgroundType === "image") {
      result.backgroundImage = `url(${s.imageUrl})`;
      result.backgroundSize = s.imageSize ? `${s.imageSize}%` : "cover";
      result.backgroundPosition = "center";
      result.backgroundRepeat = "no-repeat";
    } else if (s.background) {
      result.background = s.background;
    } else if (defaultBg) {
      result.background = defaultBg;
    }

    if (s.sectionHeight) result.minHeight = s.sectionHeight;
    if (s.shadowBlur) result.boxShadow = `0 0 ${s.shadowBlur}px ${s.shadowColor || "rgba(0,0,0,0.3)"}`;
    if (s.borderRadius) result.borderRadius = s.borderRadius;
    
    return result;
  }, [styles, isMobile]);

  const handleBack = useCallback(() => {
    playButtonSound();
    setLocation("/tests");
  }, [setLocation]);

  const handleCardSelect = useCallback((category: typeof ageCategories[0]) => {
    playCardSound();
    
    updateUserData({ 
      ageGroup: category.ageGroup, 
      ageLabel: t(category.labelKey) 
    });
    
    if (testId === "lectura") {
      setLocation(`/reading-selection/${category.ageGroup}`);
    } else if (testId === "razonamiento") {
      setLocation(`/razonamiento-selection/${category.ageGroup}`);
    } else if (testId === "cerebral") {
      setLocation(`/cerebral-selection/${category.ageGroup}`);
    } else {
      setLocation(`/quiz/${category.ageGroup}/${testId}`);
    }
  }, [testId, setLocation, updateUserData, t]);

  if (!stylesLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header 
        className={`flex md:hidden items-center justify-center px-5 bg-white sticky top-0 z-50 ${getEditableClass("header")}`}
        onClick={(e) => { if (editorMode) handleElementClick("header", e); }}
        style={{
          paddingTop: resolveStyle(styles, "header", isMobile).paddingTop || 10,
          paddingBottom: resolveStyle(styles, "header", isMobile).paddingBottom || 10,
          ...getElementStyle("header", "white")
        }}
      >
        <button 
          onClick={handleBack}
          className="absolute left-5 p-2 text-purple-600"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div 
          className={`flex items-center justify-center ${getEditableClass("header-logo")}`}
          onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("header-logo", e); }}}
          data-testid="header-logo"
        >
          {resolveStyle(styles, "header-logo", isMobile).imageUrl ? (
            <img 
              src={resolveStyle(styles, "header-logo", isMobile).imageUrl} 
              alt="Logo" 
              style={{ 
                height: resolveStyle(styles, "header-logo", isMobile).imageSize ? `${resolveStyle(styles, "header-logo", isMobile).imageSize}px` : "36px",
                width: "auto"
              }}
            />
          ) : (
            <svg width="80" height="36" viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8a3ffc" />
                  <stop offset="100%" stopColor="#00d9ff" />
                </linearGradient>
              </defs>
              <text x="0" y="28" fontSize="32" fontWeight="900" fontFamily="Inter, sans-serif">
                <tspan fill="#8a3ffc">i</tspan>
                <tspan fill="#8a3ffc">Q</tspan>
                <tspan fill="url(#logoGradient)">x</tspan>
              </text>
            </svg>
          )}
        </div>
        
        <div className="absolute right-5">
          <LanguageButton />
        </div>
      </header>

      <div
        className={`w-full sticky z-40 md:hidden ${getEditableClass("menu-curve")}`}
        onClick={(e) => handleElementClick("menu-curve", e)}
        style={{
          top: (resolveStyle(styles, "header", isMobile).paddingTop || 10) + (resolveStyle(styles, "header", isMobile).paddingBottom || 10) + 36,
          marginTop: resolveStyle(styles, "menu-curve", isMobile).marginTop || -4,
          marginBottom: resolveStyle(styles, "menu-curve", isMobile).marginBottom || -20,
        }}
      >
        <img 
          src={menuCurveImg} 
          alt="" 
          className="w-full h-auto"
        />
      </div>

      <main className="flex-1 overflow-y-auto pb-0">
        <SpacerEl id="spacer-top" styles={styles} isMobile={isMobile} editorMode={editorMode} getEditableClass={getEditableClass} handleElementClick={handleElementClick} />

        <div 
          className={`w-full ${getEditableClass("hero-section")}`}
          onClick={(e) => handleElementClick("hero-section", e)}
          style={{
            paddingTop: "16px",
            position: "relative",
            ...getElementStyle("hero-section", "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)")
          }}
        >
          <motion.div
            className="px-5 pt-2 pb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
          >
            <h1 
              className={`font-bold mb-1 ${getEditableClass("main-title")}`}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("main-title", e); }}}
              style={{
                fontSize: resolveStyle(styles, "main-title", isMobile).fontSize || 22,
                color: resolveStyle(styles, "main-title", isMobile).textColor || "#5b21b6",
                fontWeight: 700
              }}
            >
              <span className="whitespace-pre-line">{resolveStyle(styles, "main-title", isMobile).buttonText || t("age.selectStage")}</span>
            </h1>
            <p 
              className={`leading-relaxed ${getEditableClass("main-subtitle")}`}
              onClick={(e) => { if (editorMode) { e.stopPropagation(); handleElementClick("main-subtitle", e); }}}
              style={{
                fontSize: resolveStyle(styles, "main-subtitle", isMobile).fontSize || 13,
                color: resolveStyle(styles, "main-subtitle", isMobile).textColor || "#9ca3af"
              }}
            >
              <span className="whitespace-pre-line">{resolveStyle(styles, "main-subtitle", isMobile).buttonText || t("age.adjustDesc")}</span>
            </p>
          </motion.div>

          <SpacerEl id="spacer-mid" styles={styles} isMobile={isMobile} editorMode={editorMode} getEditableClass={getEditableClass} handleElementClick={handleElementClick} />

          <div 
            className={`px-4 pb-4 space-y-2 ${getEditableClass("cards-section")}`}
            onClick={(e) => handleElementClick("cards-section", e)}
            style={{ ...getElementStyle("cards-section"), padding: "16px", borderRadius: resolveStyle(styles, "cards-section", isMobile).borderRadius || 0 }}
          >
            {ageCategories.map((category, index) => (
              <AgeCard
                key={category.id}
                category={category}
                index={index}
                onClick={() => handleCardSelect(category)}
                editorMode={editorMode}
                styles={styles}
                isMobile={isMobile}
                onElementClick={handleElementClick}
                getEditableClass={getEditableClass}
              />
            ))}
          </div>
        </div>
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
    </div>
  );
}
