import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, Clock, Trophy, TrendingUp, Zap, BarChart3, Target, Timer, BookOpen, Eye, ChevronDown, Grid3X3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSounds } from "@/hooks/use-sounds";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import { useState } from "react";
import { LanguageButton } from "@/components/LanguageButton";

interface TrainingResult {
  id: string;
  categoria: string;
  tipoEjercicio: string;
  ejercicioTitulo: string | null;
  puntaje: number | null;
  nivelAlcanzado: number | null;
  tiempoSegundos: number | null;
  palabrasPorMinuto: number | null;
  respuestasCorrectas: number | null;
  respuestasTotales: number | null;
  datosExtra: string | null;
  createdAt: string | null;
}

interface Stats {
  totalSessions: number;
  byType: Record<string, { count: number; avgScore: number; bestScore: number }>;
  recentActivity: TrainingResult[];
  dailyActivity: Record<string, number>;
}

const exerciseTypeKeys: Record<string, string> = {
  velocidad: "progress.velocidadLectora",
  numeros: "progress.numerosLetras",
  aceleracion_golpe: "progress.golpeVista",
  aceleracion_desplazamiento: "progress.desplazamiento",
  reconocimiento_visual: "progress.reconocimientoVisual",
  neurosync: "progress.neuroSync",
  neurolink: "progress.neuroLink",
  memoryflash: "progress.memoryFlash"
};

const exerciseTypeColors: Record<string, string> = {
  velocidad: "#7c3aed",
  numeros: "#06b6d4",
  aceleracion_golpe: "#a855f7",
  aceleracion_desplazamiento: "#0891b2",
  reconocimiento_visual: "#ec4899",
  neurosync: "#0051ff",
  neurolink: "#0051ff",
  memoryflash: "#0051ff"
};

const exerciseTypeIcons: Record<string, typeof Zap> = {
  velocidad: Zap,
  numeros: Target,
  aceleracion_golpe: BookOpen,
  aceleracion_desplazamiento: BookOpen,
  reconocimiento_visual: Eye,
  neurosync: Zap,
  neurolink: Target,
  memoryflash: Grid3X3
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function formatSeconds(seconds: number | null): string {
  if (!seconds) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

function MiniBarChart({ data }: { data: Record<string, number> }) {
  const { t } = useTranslation();
  const entries = Object.entries(data).slice(-7);
  const maxValue = Math.max(...entries.map(([, v]) => v), 1);
  
  if (entries.length === 0) {
    return (
      <div className="text-center text-gray-400 text-xs py-4">
        {t("progress.noRecentActivity")}
      </div>
    );
  }
  
  return (
    <div className="flex items-end justify-between gap-1 h-20 px-2">
      {entries.map(([date, value]) => (
        <div key={date} className="flex flex-col items-center gap-1 flex-1">
          <div 
            className="w-full rounded-t-sm transition-all duration-300"
            style={{ 
              height: `${(value / maxValue) * 100}%`,
              minHeight: value > 0 ? "4px" : "0",
              background: "linear-gradient(180deg, #7c3aed 0%, #a855f7 100%)"
            }}
          />
          <span className="text-[8px] text-gray-400">
            {new Date(date).toLocaleDateString("es-ES", { day: "2-digit" })}
          </span>
        </div>
      ))}
    </div>
  );
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= stars ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function StatBox({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function ResultDetailCard({ result, index }: { result: TrainingResult; index: number }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const color = exerciseTypeColors[result.tipoEjercicio] || "#7c3aed";
  const IconComp = exerciseTypeIcons[result.tipoEjercicio] || Zap;
  let datosExtra: Record<string, any> = {};
  try { if (result.datosExtra) datosExtra = JSON.parse(result.datosExtra); } catch { /* ignore */ }
  const puntaje = result.puntaje ?? 0;

  const renderDetails = () => {
    switch (result.tipoEjercicio) {
      case "velocidad":
        return (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatBox value={result.respuestasCorrectas ?? 0} label={t("progress.correct")} color="#22c55e" />
            <StatBox value={datosExtra.incorrectos ?? ((result.respuestasTotales ?? 0) - (result.respuestasCorrectas ?? 0))} label={t("progress.incorrect")} color="#ef4444" />
            <StatBox value={`${result.palabrasPorMinuto ?? datosExtra.velocidadMax ?? 0}`} label={t("progress.maxSpeed")} color="#7c3aed" />
          </div>
        );
      case "numeros":
        return (
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500">{t("progress.level")}:</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{datosExtra.nivel || t("progress.numerosLetras")}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatBox value={result.respuestasCorrectas ?? 0} label={t("progress.correct")} color="#22c55e" />
              <StatBox value={datosExtra.incorrectas ?? 0} label={t("progress.incorrect")} color="#ef4444" />
              <StatBox value={datosExtra.sinResponder ?? 0} label={t("progress.noAnswer")} color="#9ca3af" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <StatBox value={formatSeconds(result.tiempoSegundos)} label={t("progress.time")} color="#06b6d4" />
            </div>
          </div>
        );
      case "aceleracion_golpe":
      case "aceleracion_desplazamiento":
        return (
          <div className="space-y-2 mt-3">
            <div className="grid grid-cols-3 gap-2">
              <StatBox value={datosExtra.palabras ?? result.respuestasCorrectas ?? 0} label={t("progress.words")} color="#7c3aed" />
              <StatBox value={`${datosExtra.ppm ?? result.palabrasPorMinuto ?? 0}`} label="PPM" color="#0891b2" />
              <StatBox value={formatSeconds(result.tiempoSegundos)} label={t("progress.time")} color="#06b6d4" />
            </div>
            {datosExtra.estrellas && <StarRating stars={datosExtra.estrellas} />}
          </div>
        );
      case "reconocimiento_visual":
        return (
          <div className="space-y-2 mt-3">
            {datosExtra.nivel && (
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500">{t("progress.level")}:</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{datosExtra.nivel}</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <StatBox value={result.respuestasCorrectas ?? 0} label={t("progress.correct")} color="#22c55e" />
              <StatBox value={(result.respuestasTotales ?? 0) - (result.respuestasCorrectas ?? 0)} label={t("progress.incorrect")} color="#ef4444" />
              <StatBox value={datosExtra.skippedCount ?? 0} label={t("progress.noAnswer")} color="#9ca3af" />
            </div>
          </div>
        );
      case "neurosync":
        return (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatBox value={result.puntaje ?? 0} label={t("neurosync.score")} color="#0051ff" />
            <StatBox value={`${datosExtra.accuracy ?? 0}%`} label={t("neurosync.accuracy")} color="#06b6d4" />
            <StatBox value={result.nivelAlcanzado ?? 1} label={t("neurosync.level")} color="#8a3ffc" />
          </div>
        );
      case "neurolink":
        return (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatBox value={result.puntaje ?? 0} label={t("neurolink.score")} color="#0051ff" />
            <StatBox value={result.nivelAlcanzado ?? 1} label={t("neurolink.level")} color="#8a3ffc" />
            <StatBox value={result.respuestasCorrectas ?? 0} label={t("neurolink.correct")} color="#22c55e" />
          </div>
        );
      case "memoryflash":
        return (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatBox value={result.puntaje ?? 0} label={t("memoryflash.score")} color="#0051ff" />
            <StatBox value={result.nivelAlcanzado ?? 1} label={t("memoryflash.level")} color="#8a3ffc" />
            <StatBox value={result.respuestasCorrectas ?? 0} label={t("memoryflash.hits")} color="#22c55e" />
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <StatBox value={result.respuestasCorrectas ?? 0} label={t("progress.correct")} color="#22c55e" />
            <StatBox value={(result.respuestasTotales ?? 0) - (result.respuestasCorrectas ?? 0)} label={t("progress.incorrect")} color="#ef4444" />
          </div>
        );
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-sm"
      style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.06)" }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.04 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3"
        data-testid={`button-expand-result-${result.id}`}
      >
        <div 
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}12` }}
        >
          <IconComp className="w-5 h-5" style={{ color }} />
        </div>
        
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {result.ejercicioTitulo || (exerciseTypeKeys[result.tipoEjercicio] ? t(exerciseTypeKeys[result.tipoEjercicio]) : result.tipoEjercicio)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {formatDate(result.createdAt)}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {formatTime(result.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-11 h-11">
            <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" stroke="#e5e7eb" strokeWidth="3" fill="none" />
              <circle
                cx="22" cy="22" r="18"
                stroke={color}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(puntaje / 100) * 113} 113`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-700">{puntaje}%</span>
            </div>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-4 border-t border-gray-100"
        >
          {renderDetails()}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ProgresoPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const params = useParams<{ categoria: string }>();
  const categoria = params.categoria || "ninos";
  const { playSound } = useSounds();

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("iq_session_id") : null;

  const { data: statsData, isLoading } = useQuery<{ stats: Stats }>({
    queryKey: ["/api/training-results/stats", sessionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionId) params.append("sessionId", sessionId);
      const res = await fetch(`/api/training-results/stats?${params}`);
      return res.json();
    },
    enabled: !!sessionId
  });

  const stats = statsData?.stats;

  const handleBack = () => {
    playSound("iphone");
    window.history.back();
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 30%, #ffffff 70%, #f0fdff 100%)"
      }}
    >
      <header className="relative px-4 py-4 flex items-center justify-between md:hidden">
        <motion.button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          style={{ boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-800">{t("progress.title")}</h1>
        <LanguageButton />
      </header>

      <main className="flex-1 px-4 pb-28">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-3 border-purple-100 border-t-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-4">
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ 
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)",
                  border: "1px solid rgba(124, 58, 237, 0.2)"
                }}
              >
                <span 
                  className="text-sm font-semibold"
                  style={{ color: "#7c3aed" }}
                  data-testid="text-categoria"
                >
                  {t("progress.allExercises")}
                </span>
              </div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div 
                className="bg-white rounded-2xl p-4 shadow-sm"
                style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124, 58, 237, 0.1)" }}>
                    <Trophy className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-500">{t("progress.sessions")}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800" data-testid="text-total-sessions">{stats?.totalSessions || 0}</p>
              </div>

              <div 
                className="bg-white rounded-2xl p-4 shadow-sm"
                style={{ boxShadow: "0 2px 12px rgba(6, 182, 212, 0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(6, 182, 212, 0.1)" }}>
                    <Zap className="w-4 h-4 text-cyan-600" />
                  </div>
                  <span className="text-xs text-gray-500">{t("progress.exercises")}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800" data-testid="text-exercise-types">{Object.keys(stats?.byType || {}).length}</p>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl p-4 shadow-sm"
              style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.08)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">{t("progress.weeklyActivity")}</span>
              </div>
              <MiniBarChart data={stats?.dailyActivity || {}} />
            </motion.div>

            {stats && Object.keys(stats.byType).length > 0 && (
              <motion.div 
                className="bg-white rounded-2xl p-4 shadow-sm"
                style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.08)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t("progress.summaryByExercise")}</h3>
                <div className="space-y-3">
                  {Object.entries(stats.byType).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: exerciseTypeColors[type] || "#7c3aed" }}
                        />
                        <span className="text-xs text-gray-600">{exerciseTypeKeys[type] ? t(exerciseTypeKeys[type]) : type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400">{data.count}x</span>
                        <span className="text-[10px] text-gray-400">{t("progress.average")}: {data.avgScore}%</span>
                        <span className="text-xs font-semibold" style={{ color: exerciseTypeColors[type] || "#7c3aed" }}>
                          {t("progress.best")}: {data.bestScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-medium text-gray-700 mb-3 px-1">{t("progress.resultHistory")}</h3>
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentActivity.map((result, index) => (
                    <ResultDetailCard key={result.id} result={result} index={index} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center" style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.08)" }}>
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">{t("progress.noData")}</p>
                  <p className="text-gray-300 text-xs mt-1">{t("progress.noDataDesc")}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>

      <TrainingNavBar activePage="progreso" categoria={categoria} />
    </div>
  );
}
