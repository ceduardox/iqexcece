import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import menuCurveImg from "@assets/menu_1769957804819.png";
import { LanguageButton } from "@/components/LanguageButton";
import { useIsMobile } from "@/hooks/use-mobile";

const LOGO_URL = "https://iqexponencial.app/api/images/6218ab21-88a5-4e44-9254-bd17fb7fb2bb";

interface CurvedHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  showLang?: boolean;
}

export function CurvedHeader({ showBack = false, onBack, rightElement, showLang = true }: CurvedHeaderProps) {
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setLocation("/");
    }
  };

  if (!isMobile) return null;

  return (
    <header className="sticky top-0 z-50 w-full" data-testid="curved-header">
      <div 
        className="relative pt-3 pb-2 px-5"
        style={{
          background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          {showBack ? (
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 2px 8px rgba(138, 63, 252, 0.15)",
              }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#8a3ffc" }} />
            </button>
          ) : (
            <div className="w-10" />
          )}
          
          <div className="flex items-center justify-center">
            <img 
              src={LOGO_URL} 
              alt="iQx" 
              className="h-10 w-auto object-contain"
              data-testid="header-logo-image"
            />
          </div>
          
          {rightElement ? (
            rightElement
          ) : showLang ? (
            <LanguageButton />
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>
      
      <div className="w-full" style={{ marginTop: -2, marginBottom: -12 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>
    </header>
  );
}
