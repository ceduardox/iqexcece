import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface CurvedHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function CurvedHeader({ showBack = false, onBack, rightElement }: CurvedHeaderProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setLocation("/");
    }
  };

  return (
    <header className="relative w-full" data-testid="curved-header">
      <div 
        className="relative pt-4 pb-8 px-5"
        style={{
          background: "linear-gradient(180deg, rgba(138, 63, 252, 0.12) 0%, rgba(0, 217, 255, 0.06) 60%, transparent 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          {showBack ? (
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
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
            <span 
              className="text-2xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              iQx
            </span>
          </div>
          
          {rightElement ? (
            rightElement
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>
      
      <svg 
        viewBox="0 0 400 30" 
        className="w-full absolute -bottom-1 left-0"
        preserveAspectRatio="none"
        style={{ height: "30px" }}
      >
        <path
          d="M0,0 L0,20 Q200,40 400,20 L400,0 Z"
          fill="white"
          style={{ transform: "scaleY(-1)", transformOrigin: "center" }}
        />
      </svg>
    </header>
  );
}
