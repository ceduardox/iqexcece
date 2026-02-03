import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Home, Brain, BarChart3, Dumbbell, Calendar, Clock, Trophy, TrendingUp, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSounds } from "@/hooks/use-sounds";

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
  createdAt: string | null;
}

interface Stats {
  totalSessions: number;
  byType: Record<string, { count: number; avgScore: number; bestScore: number }>;
  recentActivity: TrainingResult[];
  dailyActivity: Record<string, number>;
}

const exerciseTypeLabels: Record<string, string> = {
  velocidad: "Velocidad",
  numeros: "Números y Letras",
  aceleracion_golpe: "Golpe de Vista",
  aceleracion_desplazamiento: "Desplazamiento"
};

const exerciseTypeColors: Record<string, string> = {
  velocidad: "#7c3aed",
  numeros: "#06b6d4",
  aceleracion_golpe: "#a855f7",
  aceleracion_desplazamiento: "#0891b2"
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

function MiniBarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).slice(-7); // Last 7 days
  const maxValue = Math.max(...entries.map(([, v]) => v), 1);
  
  if (entries.length === 0) {
    return (
      <div className="text-center text-gray-400 text-xs py-4">
        Sin actividad reciente
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

export default function ProgresoPage() {
  const [, navigate] = useLocation();
  const params = useParams<{ categoria: string }>();
  const categoria = params.categoria || "ninos";
  const { playSound } = useSounds();

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("iq_session_id") : null;

  const { data: statsData, isLoading } = useQuery<{ stats: Stats }>({
    queryKey: ["/api/training-results/stats", sessionId, categoria],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionId) params.append("sessionId", sessionId);
      if (categoria) params.append("categoria", categoria);
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

  const handleNavClick = (path: string) => {
    playSound("iphone");
    navigate(path);
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 30%, #ffffff 70%, #f0fdff 100%)"
      }}
    >
      {/* Header */}
      <header className="relative px-4 py-4 flex items-center justify-between">
        <motion.button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          style={{ boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-800">Mi Progreso</h1>
        <div className="w-10" />
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-28">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-3 border-purple-100 border-t-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-4">
            {/* Summary cards */}
            <motion.div 
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Total sessions */}
              <div 
                className="bg-white rounded-2xl p-4 shadow-sm"
                style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124, 58, 237, 0.1)" }}>
                    <Trophy className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-500">Sesiones</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats?.totalSessions || 0}</p>
              </div>

              {/* Types practiced */}
              <div 
                className="bg-white rounded-2xl p-4 shadow-sm"
                style={{ boxShadow: "0 2px 12px rgba(6, 182, 212, 0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(6, 182, 212, 0.1)" }}>
                    <Zap className="w-4 h-4 text-cyan-600" />
                  </div>
                  <span className="text-xs text-gray-500">Ejercicios</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{Object.keys(stats?.byType || {}).length}</p>
              </div>
            </motion.div>

            {/* Activity chart */}
            <motion.div 
              className="bg-white rounded-2xl p-4 shadow-sm"
              style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.08)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Actividad semanal</span>
              </div>
              <MiniBarChart data={stats?.dailyActivity || {}} />
            </motion.div>

            {/* Stats by type */}
            {stats && Object.keys(stats.byType).length > 0 && (
              <motion.div 
                className="bg-white rounded-2xl p-4 shadow-sm"
                style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.08)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm font-medium text-gray-700 mb-3">Por tipo de ejercicio</h3>
                <div className="space-y-3">
                  {Object.entries(stats.byType).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ background: exerciseTypeColors[type] || "#7c3aed" }}
                        />
                        <span className="text-xs text-gray-600">{exerciseTypeLabels[type] || type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400">{data.count} veces</span>
                        <span className="text-xs font-semibold text-purple-600">Mejor: {data.bestScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent activity */}
            <motion.div 
              className="bg-white rounded-2xl p-4 shadow-sm"
              style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.08)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-medium text-gray-700 mb-3">Historial reciente</h3>
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentActivity.map((result, index) => (
                    <motion.div 
                      key={result.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${exerciseTypeColors[result.tipoEjercicio] || "#7c3aed"}15` }}
                        >
                          {result.tipoEjercicio.includes("aceleracion") ? (
                            <BarChart3 className="w-5 h-5" style={{ color: exerciseTypeColors[result.tipoEjercicio] }} />
                          ) : (
                            <Zap className="w-5 h-5" style={{ color: exerciseTypeColors[result.tipoEjercicio] }} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">
                            {exerciseTypeLabels[result.tipoEjercicio] || result.tipoEjercicio}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(result.createdAt)}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(result.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {result.puntaje !== null && (
                          <p className="text-sm font-bold text-purple-600">{result.puntaje}</p>
                        )}
                        {result.palabrasPorMinuto && (
                          <p className="text-[10px] text-gray-400">{result.palabrasPorMinuto} PPM</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">Sin resultados aún</p>
                  <p className="text-gray-300 text-xs mt-1">Completa ejercicios para ver tu progreso</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-purple-50 px-4 py-2 z-50"
      >
        <div className="max-w-md mx-auto flex justify-around items-center">
          <motion.button
            onClick={() => handleNavClick("/")}
            className="flex flex-col items-center gap-0.5 p-2 text-gray-400"
            whileTap={{ scale: 0.9 }}
            data-testid="nav-home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Inicio</span>
          </motion.button>
          <motion.button
            onClick={() => handleNavClick(`/reading-selection/${categoria}`)}
            className="flex flex-col items-center gap-0.5 p-2 text-gray-400"
            whileTap={{ scale: 0.9 }}
            data-testid="nav-diagnostico"
          >
            <Brain className="w-5 h-5" />
            <span className="text-[10px]">Diagnóstico</span>
          </motion.button>
          <motion.button
            onClick={() => handleNavClick(`/entrenamiento`)}
            className="flex flex-col items-center gap-0.5 p-2 text-gray-400"
            whileTap={{ scale: 0.9 }}
            data-testid="nav-entrenar"
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px]">Entrenar</span>
          </motion.button>
          <motion.button
            onClick={() => handleNavClick(`/progreso/${categoria}`)}
            className="flex flex-col items-center gap-0.5 p-2 text-purple-600"
            whileTap={{ scale: 0.9 }}
            data-testid="nav-progreso"
          >
            <div 
              className="w-11 h-11 -mt-6 rounded-2xl flex items-center justify-center"
              style={{ 
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)"
              }}
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-medium mt-1">Progreso</span>
          </motion.button>
        </div>
      </nav>
    </div>
  );
}
