import { Brain, Sparkles } from "lucide-react";

interface SurveyShape {
  profile: string;
  mainNeed: string;
  interestLevel: string;
  score?: number | null;
}

interface Props {
  survey: SurveyShape;
  accent?: "purple" | "cyan";
}

const needOptions = [
  "Procesar informacion mas rapido",
  "Comprender con mayor profundidad",
  "Concentrarme mejor",
  "Recordar con mayor facilidad",
  "Optimizar mi rendimiento mental integral",
];

function normalize(text: string) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSelectedNeed(mainNeed: string) {
  const text = normalize(mainNeed);
  if (text.includes("velocidad") || text.includes("procesamiento")) return needOptions[0];
  if (text.includes("comprension")) return needOptions[1];
  if (text.includes("concentr")) return needOptions[2];
  if (text.includes("memoria") || text.includes("retencion")) return needOptions[3];
  return needOptions[4];
}

function getStatus(profile: string, mainNeed: string, area: "concentration" | "retention" | "processing") {
  const normalizedProfile = normalize(profile);
  const normalizedNeed = normalize(mainNeed);
  const isMainNeed =
    (area === "concentration" && normalizedNeed.includes("concentr")) ||
    (area === "retention" && (normalizedNeed.includes("memoria") || normalizedNeed.includes("retencion"))) ||
    (area === "processing" && (normalizedNeed.includes("velocidad") || normalizedNeed.includes("procesamiento")));

  if (isMainNeed) {
    if (normalizedProfile.includes("avanzado")) return "Funcional";
    if (normalizedProfile.includes("potencial alto")) return "Moderada";
    if (normalizedProfile.includes("funcional")) return "Mejorable";
    return "En desarrollo";
  }

  if (normalizedProfile.includes("avanzado")) return "Alta";
  if (normalizedProfile.includes("potencial alto")) return "Buena";
  if (normalizedProfile.includes("funcional")) return "Moderada";
  return "En desarrollo";
}

function getMessage(profile: string, mainNeed: string) {
  const selectedNeed = getSelectedNeed(mainNeed);
  const normalizedProfile = normalize(profile);

  if (normalizedProfile.includes("avanzado")) {
    return `Tu perfil muestra una base cognitiva solida. Tu mejor oportunidad ahora esta en ${selectedNeed.toLowerCase()}.`;
  }

  if (normalizedProfile.includes("potencial alto")) {
    return `Tu mente tiene potencial alto, pero aun puede optimizarse. El siguiente salto esta en ${selectedNeed.toLowerCase()}.`;
  }

  if (normalizedProfile.includes("funcional")) {
    return `Tu mente tiene potencial, pero necesita optimizacion estrategica. Hoy tu principal oportunidad esta en ${selectedNeed.toLowerCase()}.`;
  }

  return `Tu perfil indica una base en desarrollo. Con entrenamiento adecuado puedes mejorar ${selectedNeed.toLowerCase()} y elevar tu rendimiento mental.`;
}

export function CognitiveResultSummary({ survey, accent = "purple" }: Props) {
  const selectedNeed = getSelectedNeed(survey.mainNeed);
  const concentration = getStatus(survey.profile, survey.mainNeed, "concentration");
  const retention = getStatus(survey.profile, survey.mainNeed, "retention");
  const processing = getStatus(survey.profile, survey.mainNeed, "processing");
  const message = getMessage(survey.profile, survey.mainNeed);
  const gradient =
    accent === "cyan"
      ? "linear-gradient(135deg, rgba(6,182,212,0.10) 0%, rgba(138,63,252,0.08) 100%)"
      : "linear-gradient(135deg, rgba(138,63,252,0.10) 0%, rgba(6,182,212,0.08) 100%)";

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: "rgba(138,63,252,0.14)",
        background: gradient,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-purple-600" />
        <p className="text-xs font-bold text-purple-600">Perfil Cognitivo IQX</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center mb-4">
        <div className="bg-white/80 rounded-xl p-3">
          <p className="text-[11px] text-gray-500 mb-1">Perfil</p>
          <p className="text-sm font-black text-gray-800">{survey.profile}</p>
        </div>
        <div className="bg-white/80 rounded-xl p-3">
          <p className="text-[11px] text-gray-500 mb-1">Area clave</p>
          <p className="text-sm font-black text-cyan-600">{survey.mainNeed}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-bold text-gray-700 mb-2">Despues de esta evaluacion, considero que necesito mejorar:</p>
        <div className="flex flex-wrap gap-2">
          {needOptions.map((need) => {
            const active = need === selectedNeed;
            return (
              <span
                key={need}
                className="px-3 py-2 rounded-full text-[11px] font-bold border"
                style={{
                  borderColor: active ? "rgba(138,63,252,0.28)" : "rgba(148,163,184,0.22)",
                  background: active ? "rgba(138,63,252,0.10)" : "rgba(255,255,255,0.78)",
                  color: active ? "#6d28d9" : "#475569",
                }}
              >
                {active ? "✓ " : ""}
                {need}
              </span>
            );
          })}
        </div>
      </div>

      <div className="bg-white/82 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <p className="text-sm font-black text-gray-900">Tu perfil indica:</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-600">Nivel de concentracion</span>
            <span className="font-black text-gray-900">{concentration}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-600">Retencion de informacion</span>
            <span className="font-black text-gray-900">{retention}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-600">Procesamiento mental</span>
            <span className="font-black text-gray-900">{processing}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/82 p-4">
        <p className="text-sm leading-relaxed text-gray-700">{message}</p>
        <p className="text-sm leading-relaxed text-gray-700 mt-2">
          La mayoria de las personas nunca entrenan sus procesos cognitivos fundamentales.
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Interes actual</p>
            <p className="text-sm font-bold text-yellow-600">{survey.interestLevel}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const text = encodeURIComponent("Quiero optimizar mi rendimiento con la Metodologia IQX.");
              window.open(`https://wa.me/59173600060?text=${text}`, "_blank");
            }}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-black text-white"
            style={{ background: "linear-gradient(90deg, #8a3ffc, #06b6d4)" }}
          >
            Quiero optimizar mi rendimiento
          </button>
        </div>
      </div>
    </div>
  );
}
