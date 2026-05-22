import { BookOpen, ChevronRight, Mail, Newspaper, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NavMoreMenuProps {
  onNavigate: (path: string) => void;
}

export function NavMoreMenu({ onNavigate }: NavMoreMenuProps) {
  const { t } = useTranslation();

  const items = [
    {
      path: "/blog",
      label: t("nav.blog"),
      testId: "dropdown-item-blog",
      icon: Newspaper,
      iconClass: "text-purple-500",
      bg: "linear-gradient(135deg, #f3e8ff, #e0f2fe)",
    },
    {
      path: "/metodo-x",
      label: t("home.metodoX"),
      testId: "dropdown-item-metodox",
      icon: Zap,
      iconClass: "text-purple-500",
      bg: "linear-gradient(135deg, #ede9fe, #e0e7ff)",
    },
    {
      path: "/a-leer-bolivia",
      label: t("nav.aleerBolivia"),
      testId: "dropdown-item-aleer",
      icon: BookOpen,
      iconClass: "text-emerald-500",
      bg: "linear-gradient(135deg, #d1fae5, #cffafe)",
    },
    {
      path: "/contacto",
      label: t("nav.contacto"),
      testId: "dropdown-item-contacto",
      icon: Mail,
      iconClass: "text-amber-600",
      bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
    },
  ];

  return (
    <div
      className="absolute bottom-full right-0 mb-3 w-56 bg-white rounded-2xl z-[9999]"
      style={{ boxShadow: "0 8px 30px rgba(124,58,237,0.15), 0 2px 8px rgba(0,0,0,0.06)" }}
      data-testid="dropdown-mas"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 active:bg-purple-50 ${
              index === 0 ? "rounded-t-2xl" : ""
            } ${index === items.length - 1 ? "rounded-b-2xl" : ""}`}
            data-testid={item.testId}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
              <Icon className={`w-4 h-4 ${item.iconClass}`} />
            </div>
            <span className="text-sm font-semibold text-gray-700">{item.label}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto" />
          </button>
        );
      })}
    </div>
  );
}
