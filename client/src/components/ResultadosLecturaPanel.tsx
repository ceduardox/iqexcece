import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Download, FileText, ChevronDown, Settings2, Calendar, Filter, X, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import * as XLSX from "xlsx";

interface QuizResult {
  id: string;
  nombre: string;
  email: string | null;
  edad: string | null;
  ciudad: string | null;
  telefono: string | null;
  comentario: string | null;
  categoria: string | null;
  testType: string | null;
  grado: string | null;
  institucion: string | null;
  tipoEstudiante: string | null;
  semestre: string | null;
  profesion: string | null;
  ocupacion: string | null;
  lugarTrabajo: string | null;
  pais: string | null;
  estado: string | null;
  comprension: number | null;
  velocidadLectura: number | null;
  respuestasCorrectas: number | null;
  respuestasTotales: number | null;
  categoriaLector: string | null;
  tiempoLectura: number | null;
  tiempoCuestionario: number | null;
  isPwa: boolean;
  createdAt: string | null;
}

interface Props {
  quizResults: any[];
}

const CATEGORY_COLORS: Record<string, string> = {
  all: "bg-cyan-600",
  preescolar: "bg-orange-600",
  ninos: "bg-purple-600",
  adolescentes: "bg-blue-600",
  universitarios: "bg-green-600",
  profesionales: "bg-amber-600",
  adulto_mayor: "bg-rose-600",
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "Todos",
  preescolar: "Pre-escolar",
  ninos: "Niños",
  adolescentes: "Adolescentes",
  universitarios: "Universitarios",
  profesionales: "Profesionales",
  adulto_mayor: "Adulto Mayor",
};

const LECTOR_COLORS: Record<string, string> = {
  "LECTOR COMPETENTE": "#22c55e",
  "LECTOR REGULAR": "#eab308",
  "LECTOR CON DIFICULTAD": "#f97316",
  "LECTOR CON DIFICULTAD SEVERA": "#ef4444",
};

const CHART_COLORS = ["#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];

const PIE_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

type ColumnKey = "nombre" | "comprension" | "velocidad" | "correctas" | "categoriaLector" | "grado" | "institucion" | "semestre" | "edad" | "email" | "telefono" | "pais" | "estado" | "fecha";

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "nombre", label: "Nombre" },
  { key: "comprension", label: "Comprensión %" },
  { key: "velocidad", label: "Velocidad" },
  { key: "correctas", label: "Correctas" },
  { key: "categoriaLector", label: "Cat. Lector" },
  { key: "grado", label: "Grado/Curso" },
  { key: "institucion", label: "Institución" },
  { key: "semestre", label: "Semestre" },
  { key: "edad", label: "Edad" },
  { key: "email", label: "Email" },
  { key: "telefono", label: "Teléfono" },
  { key: "pais", label: "País" },
  { key: "estado", label: "Estado" },
  { key: "fecha", label: "Fecha" },
];

const DEFAULT_VISIBLE: ColumnKey[] = ["nombre", "comprension", "velocidad", "correctas", "categoriaLector", "grado", "institucion", "fecha"];

function formatDate(d: string | null) {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function formatTime(seconds: number | null) {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function detectNivel(grado: string | null): string | null {
  if (!grado) return null;
  const lower = grado.toLowerCase();
  if (lower.includes("primaria")) return "Primaria";
  if (lower.includes("secundaria")) return "Secundaria";
  return null;
}

function getLectorClass(cat: string | null): string {
  if (!cat) return "text-white/40";
  if (cat.includes("COMPETENTE")) return "text-green-400";
  if (cat.includes("REGULAR")) return "text-yellow-400";
  if (cat.includes("SEVERA")) return "text-red-400";
  if (cat.includes("DIFICULTAD")) return "text-orange-400";
  return "text-white/40";
}

export default function ResultadosLecturaPanel({ quizResults }: Props) {
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [institucionFilter, setInstitucionFilter] = useState("all");
  const [nivelFilter, setNivelFilter] = useState("all");
  const [gradoFilter, setGradoFilter] = useState("all");
  const [semestreFilter, setSemestreFilter] = useState("all");
  const [lectorFilter, setLectorFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const columnSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (columnSelectorRef.current && !columnSelectorRef.current.contains(e.target as Node)) {
        setShowColumnSelector(false);
      }
    }
    if (showColumnSelector) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showColumnSelector]);

  const lecturaResults: QuizResult[] = useMemo(() => {
    return quizResults.filter((r: any) => {
      const t = r.testType || r.test_type;
      return t === "lectura" || !t;
    }) as QuizResult[];
  }, [quizResults]);

  const uniqueInstituciones = useMemo(() => {
    const set = new Set<string>();
    lecturaResults.forEach(r => {
      if (r.institucion) set.add(r.institucion);
    });
    return Array.from(set).sort();
  }, [lecturaResults]);

  const uniqueGrados = useMemo(() => {
    const set = new Set<string>();
    lecturaResults.forEach(r => {
      if (r.grado) {
        if (categoryFilter !== "all" && r.categoria !== categoryFilter) return;
        if (institucionFilter !== "all" && r.institucion !== institucionFilter) return;
        if (nivelFilter !== "all" && detectNivel(r.grado) !== nivelFilter) return;
        set.add(r.grado);
      }
    });
    return Array.from(set).sort();
  }, [lecturaResults, categoryFilter, institucionFilter, nivelFilter]);

  const uniqueSemestres = useMemo(() => {
    const set = new Set<string>();
    lecturaResults.forEach(r => {
      if (r.semestre) {
        if (categoryFilter !== "all" && r.categoria !== categoryFilter) return;
        set.add(r.semestre);
      }
    });
    return Array.from(set).sort();
  }, [lecturaResults, categoryFilter]);

  const uniqueLectorCats = useMemo(() => {
    const set = new Set<string>();
    lecturaResults.forEach(r => {
      if (r.categoriaLector) set.add(r.categoriaLector);
    });
    return Array.from(set).sort();
  }, [lecturaResults]);

  const filteredResults = useMemo(() => {
    return lecturaResults.filter(r => {
      if (categoryFilter !== "all" && r.categoria !== categoryFilter) return false;
      if (institucionFilter !== "all" && r.institucion !== institucionFilter) return false;
      if (nivelFilter !== "all" && detectNivel(r.grado) !== nivelFilter) return false;
      if (gradoFilter !== "all" && r.grado !== gradoFilter) return false;
      if (semestreFilter !== "all" && r.semestre !== semestreFilter) return false;
      if (lectorFilter !== "all" && r.categoriaLector !== lectorFilter) return false;

      if (dateFrom) {
        const from = new Date(dateFrom);
        const created = r.createdAt ? new Date(r.createdAt) : null;
        if (!created || created < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        const created = r.createdAt ? new Date(r.createdAt) : null;
        if (!created || created > to) return false;
      }

      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const fields = [r.nombre, r.email, r.institucion, r.grado, r.pais, r.estado, r.telefono, r.edad, r.profesion, r.ocupacion, r.semestre];
        return fields.some(f => f && String(f).toLowerCase().includes(q));
      }

      return true;
    });
  }, [lecturaResults, categoryFilter, institucionFilter, nivelFilter, gradoFilter, semestreFilter, lectorFilter, dateFrom, dateTo, searchText]);

  const chartBarData = useMemo(() => {
    const groups: Record<string, { total: number; count: number }> = {};
    filteredResults.forEach(r => {
      const key = r.grado || r.institucion || r.categoria || "Sin dato";
      if (!groups[key]) groups[key] = { total: 0, count: 0 };
      if (r.comprension !== null) {
        groups[key].total += r.comprension;
        groups[key].count += 1;
      }
    });
    return Object.entries(groups)
      .map(([name, { total, count }]) => ({
        name: name.length > 15 ? name.slice(0, 15) + "..." : name,
        fullName: name,
        promedio: count > 0 ? Math.round(total / count) : 0,
      }))
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 10);
  }, [filteredResults]);

  const chartPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredResults.forEach(r => {
      const cat = r.categoriaLector || "Sin clasificar";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const order = ["LECTOR COMPETENTE", "LECTOR REGULAR", "LECTOR CON DIFICULTAD", "LECTOR CON DIFICULTAD SEVERA", "Sin clasificar"];
    return order
      .filter(k => counts[k])
      .map(name => ({ name: name.replace("LECTOR ", "").replace("CON ", ""), value: counts[name], fullName: name }));
  }, [filteredResults]);

  const toggleColumn = (col: ColumnKey) => {
    if (col === "nombre") return;
    setVisibleColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const clearFilters = () => {
    setCategoryFilter("all");
    setInstitucionFilter("all");
    setNivelFilter("all");
    setGradoFilter("all");
    setSemestreFilter("all");
    setLectorFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearchText("");
  };

  const hasActiveFilters = categoryFilter !== "all" || institucionFilter !== "all" || nivelFilter !== "all" || gradoFilter !== "all" || semestreFilter !== "all" || lectorFilter !== "all" || dateFrom || dateTo || searchText;

  const getCellValue = (r: QuizResult, col: ColumnKey): string => {
    switch (col) {
      case "nombre": return r.nombre || "-";
      case "comprension": return r.comprension !== null ? `${r.comprension}%` : "-";
      case "velocidad": return r.velocidadLectura ? `${r.velocidadLectura} p/m` : "-";
      case "correctas": return `${r.respuestasCorrectas ?? "-"}/${r.respuestasTotales ?? "-"}`;
      case "categoriaLector": return r.categoriaLector || "-";
      case "grado": return r.grado || "-";
      case "institucion": return r.institucion || "-";
      case "semestre": return r.semestre || "-";
      case "edad": return r.edad || "-";
      case "email": return r.email || "-";
      case "telefono": return r.telefono || "-";
      case "pais": return r.pais || "-";
      case "estado": return r.estado || "-";
      case "fecha": return formatDate(r.createdAt);
      default: return "-";
    }
  };

  const downloadExcel = () => {
    const headers = visibleColumns.map(c => ALL_COLUMNS.find(ac => ac.key === c)?.label || c);
    const rows = filteredResults.map(r => visibleColumns.map(c => getCellValue(r, c)));
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    const colWidths = headers.map((h, i) => {
      const maxLen = Math.max(h.length, ...rows.map(row => (row[i] || "").length));
      return { wch: Math.min(maxLen + 2, 40) };
    });
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados Lectura");
    const filterInfo: string[] = [];
    if (categoryFilter !== "all") filterInfo.push(`Categoría: ${CATEGORY_LABELS[categoryFilter]}`);
    if (institucionFilter !== "all") filterInfo.push(`Institución: ${institucionFilter}`);
    if (nivelFilter !== "all") filterInfo.push(`Nivel: ${nivelFilter}`);
    if (gradoFilter !== "all") filterInfo.push(`Grado: ${gradoFilter}`);
    if (semestreFilter !== "all") filterInfo.push(`Semestre: ${semestreFilter}`);
    if (lectorFilter !== "all") filterInfo.push(`Cat. Lector: ${lectorFilter}`);
    if (dateFrom || dateTo) filterInfo.push(`Fecha: ${dateFrom || "..."} a ${dateTo || "..."}`);
    if (searchText) filterInfo.push(`Búsqueda: ${searchText}`);

    if (filterInfo.length > 0) {
      const infoWs = XLSX.utils.aoa_to_sheet([
        ["Filtros Aplicados"],
        ...filterInfo.map(f => [f]),
        [],
        [`Total resultados: ${filteredResults.length}`],
      ]);
      XLSX.utils.book_append_sheet(wb, infoWs, "Info Filtros");
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `resultados_lectura_${dateStr}.xlsx`);
  };

  const selectClass = "bg-black/60 border border-white/20 text-white text-xs rounded-lg px-3 py-2 w-full focus:border-cyan-400 focus:outline-none appearance-none";

  return (
    <Card className="bg-black/40 border-green-500/30" data-testid="card-resultados-lectura">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-bold text-lg">Resultados de Lectura</h3>
            <span className="text-white/50 text-sm">({filteredResults.length})</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className={`border-cyan-500/30 text-cyan-400 gap-1 ${showFilters ? "bg-cyan-500/20" : ""}`}
              data-testid="button-toggle-filters"
            >
              <Filter className="w-3 h-3" />
              Filtros
              {hasActiveFilters && <span className="bg-cyan-500 text-black rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{[categoryFilter !== "all", institucionFilter !== "all", nivelFilter !== "all", gradoFilter !== "all", semestreFilter !== "all", lectorFilter !== "all", !!dateFrom || !!dateTo, !!searchText].filter(Boolean).length}</span>}
            </Button>
            <Button
              onClick={() => setShowCharts(!showCharts)}
              variant="outline"
              size="sm"
              className={`border-purple-500/30 text-purple-400 gap-1 ${showCharts ? "bg-purple-500/20" : ""}`}
              data-testid="button-toggle-charts"
            >
              <BarChart3 className="w-3 h-3" />
              Gráficos
            </Button>
            <div className="relative" ref={columnSelectorRef}>
              <Button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white/60 gap-1"
                data-testid="button-toggle-columns"
              >
                <Settings2 className="w-3 h-3" />
                Columnas
              </Button>
              {showColumnSelector && (
                <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-white/20 rounded-lg p-3 z-50 min-w-[180px] shadow-xl">
                  {ALL_COLUMNS.map(col => (
                    <label key={col.key} className="flex items-center gap-2 py-1 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        disabled={col.key === "nombre"}
                        className="rounded border-white/30 bg-black/40 text-cyan-500 focus:ring-cyan-500"
                        data-testid={`checkbox-col-${col.key}`}
                      />
                      <span className={`${visibleColumns.includes(col.key) ? "text-white" : "text-white/40"} ${col.key === "nombre" ? "text-white/60" : ""}`}>
                        {col.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={downloadExcel}
              variant="outline"
              size="sm"
              className="border-green-500/30 text-green-400 gap-1"
              data-testid="button-download-excel"
            >
              <Download className="w-3 h-3" />
              Excel
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-black/30 rounded-xl p-4 border border-white/10 space-y-3" data-testid="panel-filters">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, institución, teléfono..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="bg-black/60 border border-white/20 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 w-full focus:border-cyan-400 focus:outline-none placeholder-white/30"
                data-testid="input-search"
              />
              {searchText && (
                <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white" data-testid="button-clear-search">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  onClick={() => {
                    setCategoryFilter(key);
                    setGradoFilter("all");
                    setSemestreFilter("all");
                    setInstitucionFilter("all");
                    setNivelFilter("all");
                  }}
                  variant={categoryFilter === key ? "default" : "outline"}
                  size="sm"
                  className={categoryFilter === key ? CATEGORY_COLORS[key] : "border-white/20 text-white/60"}
                  data-testid={`button-cat-${key}`}
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Institución</label>
                <select
                  value={institucionFilter}
                  onChange={e => { setInstitucionFilter(e.target.value); setGradoFilter("all"); }}
                  className={selectClass}
                  data-testid="select-institucion"
                >
                  <option value="all">Todas</option>
                  {uniqueInstituciones.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/50 text-xs mb-1 block">Nivel</label>
                <select
                  value={nivelFilter}
                  onChange={e => { setNivelFilter(e.target.value); setGradoFilter("all"); }}
                  className={selectClass}
                  data-testid="select-nivel"
                >
                  <option value="all">Todos</option>
                  <option value="Primaria">Primaria</option>
                  <option value="Secundaria">Secundaria</option>
                </select>
              </div>

              <div>
                <label className="text-white/50 text-xs mb-1 block">
                  {categoryFilter === "universitarios" ? "Semestre" : "Grado/Curso"}
                </label>
                {categoryFilter === "universitarios" ? (
                  <select
                    value={semestreFilter}
                    onChange={e => setSemestreFilter(e.target.value)}
                    className={selectClass}
                    data-testid="select-semestre"
                  >
                    <option value="all">Todos</option>
                    {uniqueSemestres.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={gradoFilter}
                    onChange={e => setGradoFilter(e.target.value)}
                    className={selectClass}
                    data-testid="select-grado"
                  >
                    <option value="all">Todos</option>
                    {uniqueGrados.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-white/50 text-xs mb-1 block">Categoría Lector</label>
                <select
                  value={lectorFilter}
                  onChange={e => setLectorFilter(e.target.value)}
                  className={selectClass}
                  data-testid="select-lector"
                >
                  <option value="all">Todos</option>
                  {uniqueLectorCats.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 md:col-span-3">
                <label className="text-white/50 text-xs mb-1 block">Rango de Fecha</label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {[
                    { label: "Hoy", days: 0 },
                    { label: "7 días", days: 7 },
                    { label: "30 días", days: 30 },
                    { label: "90 días", days: 90 },
                    { label: "Este año", days: -1 },
                  ].map(opt => {
                    const isActive = (() => {
                      if (!dateFrom && !dateTo) return false;
                      const today = new Date();
                      const todayStr = today.toISOString().split("T")[0];
                      if (opt.days === 0) return dateFrom === todayStr && dateTo === todayStr;
                      if (opt.days === -1) {
                        const yearStart = `${today.getFullYear()}-01-01`;
                        return dateFrom === yearStart && dateTo === todayStr;
                      }
                      const from = new Date(today);
                      from.setDate(from.getDate() - opt.days);
                      return dateFrom === from.toISOString().split("T")[0] && dateTo === todayStr;
                    })();
                    return (
                      <button
                        key={opt.label}
                        onClick={() => {
                          const today = new Date();
                          const todayStr = today.toISOString().split("T")[0];
                          if (isActive) { setDateFrom(""); setDateTo(""); return; }
                          if (opt.days === 0) { setDateFrom(todayStr); setDateTo(todayStr); }
                          else if (opt.days === -1) { setDateFrom(`${today.getFullYear()}-01-01`); setDateTo(todayStr); }
                          else { const from = new Date(today); from.setDate(from.getDate() - opt.days); setDateFrom(from.toISOString().split("T")[0]); setDateTo(todayStr); }
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${isActive ? "bg-cyan-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}
                        data-testid={`button-date-${opt.days}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="bg-black/60 border border-purple-500/40 text-white text-xs rounded-lg px-3 py-2.5 w-full focus:border-cyan-400 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      data-testid="input-date-from"
                    />
                  </div>
                  <span className="text-white/30 text-xs font-medium">a</span>
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="bg-black/60 border border-purple-500/40 text-white text-xs rounded-lg px-3 py-2.5 w-full focus:border-cyan-400 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      data-testid="input-date-to"
                    />
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end col-span-2 md:col-span-2">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 gap-1 w-full"
                    data-testid="button-clear-filters"
                  >
                    <X className="w-3 h-3" />
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {showCharts && filteredResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="panel-charts">
            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-bold text-sm mb-3">Comprensión Promedio</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartBarData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#ffffff80", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#ffffff80", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0e7490", border: "1px solid rgba(6,182,212,0.4)", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value: number, _name: string, entry: any) => [`${value}%`, entry.payload.fullName]}
                    labelFormatter={() => ""}
                    cursor={{ fill: "rgba(6,182,212,0.1)" }}
                  />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]} maxBarSize={40} activeBar={false}>
                    {chartBarData.map((_entry, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-bold text-sm mb-3">Distribución Categoría Lector</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartPieData.map((_entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0e7490", border: "1px solid rgba(6,182,212,0.4)", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="md:col-span-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-cyan-400 font-bold text-2xl">
                    {filteredResults.length > 0
                      ? Math.round(filteredResults.reduce((s, r) => s + (r.comprension || 0), 0) / filteredResults.filter(r => r.comprension !== null).length || 0)
                      : 0}%
                  </div>
                  <div className="text-white/50 text-xs">Comprensión Prom.</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-purple-400 font-bold text-2xl">
                    {filteredResults.length > 0
                      ? Math.round(filteredResults.reduce((s, r) => s + (r.velocidadLectura || 0), 0) / filteredResults.filter(r => r.velocidadLectura !== null).length || 0)
                      : 0}
                  </div>
                  <div className="text-white/50 text-xs">Velocidad Prom. (p/m)</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-green-400 font-bold text-2xl">
                    {filteredResults.filter(r => r.categoriaLector?.includes("COMPETENTE")).length}
                  </div>
                  <div className="text-white/50 text-xs">Competentes</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-red-400 font-bold text-2xl">
                    {filteredResults.filter(r => r.categoriaLector?.includes("SEVERA")).length}
                  </div>
                  <div className="text-white/50 text-xs">Dificultad Severa</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-lectura-results">
            <thead>
              <tr className="text-left text-white/60 border-b border-white/10">
                <th className="pb-3 px-2 w-6"></th>
                {visibleColumns.map(col => (
                  <th key={col} className="pb-3 px-2 text-xs">{ALL_COLUMNS.find(c => c.key === col)?.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(r => (
                <>
                  <tr
                    key={r.id}
                    onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    data-testid={`row-result-${r.id}`}
                  >
                    <td className="py-3 px-2">
                      <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${expandedResult === r.id ? "rotate-180" : ""}`} />
                    </td>
                    {visibleColumns.map(col => (
                      <td key={col} className={`py-3 px-2 text-xs ${col === "categoriaLector" ? getLectorClass(r.categoriaLector) : col === "comprension" ? "text-cyan-400 font-bold" : col === "velocidad" ? "text-purple-400 font-bold" : "text-white/80"}`}>
                        {getCellValue(r, col)}
                      </td>
                    ))}
                  </tr>
                  {expandedResult === r.id && (
                    <tr key={`${r.id}-detail`} className="bg-white/5">
                      <td colSpan={visibleColumns.length + 1} className="px-4 py-4">
                        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 mb-3 border border-cyan-500/20">
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
                            <div className="bg-black/30 rounded-lg p-2">
                              <div className="text-cyan-400 font-bold text-lg">{r.comprension !== null ? `${r.comprension}%` : "-"}</div>
                              <div className="text-white/50 text-xs">Comprensión</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2">
                              <div className="text-green-400 font-bold text-lg">{r.respuestasCorrectas ?? "-"}/{r.respuestasTotales ?? "-"}</div>
                              <div className="text-white/50 text-xs">Correctas</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2">
                              <div className="text-purple-400 font-bold text-lg">{r.velocidadLectura ?? "-"}</div>
                              <div className="text-white/50 text-xs">Palabras/min</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2">
                              <div className="text-cyan-400 font-bold text-lg">{formatTime(r.tiempoLectura)}</div>
                              <div className="text-white/50 text-xs">T. Lectura</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2">
                              <div className="text-purple-400 font-bold text-lg">{formatTime(r.tiempoCuestionario)}</div>
                              <div className="text-white/50 text-xs">T. Preguntas</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 border border-yellow-500/30">
                              <div className={`font-bold text-xs leading-tight ${getLectorClass(r.categoriaLector)}`}>{r.categoriaLector || "-"}</div>
                              <div className="text-white/50 text-[10px] mt-1">Categoría</div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div><span className="text-white/50">Email:</span> <span className="text-white/80">{r.email || "-"}</span></div>
                          <div><span className="text-white/50">Edad:</span> <span className="text-white/80">{r.edad || "-"}</span></div>
                          <div><span className="text-white/50">Teléfono:</span> <span className="text-white/80">{r.telefono || "-"}</span></div>
                          <div><span className="text-white/50">País:</span> <span className="text-cyan-400">{r.pais || "-"}</span></div>
                          <div><span className="text-white/50">Estado:</span> <span className="text-cyan-400">{r.estado || r.ciudad || "-"}</span></div>
                          <div><span className="text-white/50">Grado:</span> <span className="text-yellow-400">{r.grado || "-"}</span></div>
                          <div><span className="text-white/50">Institución:</span> <span className="text-cyan-400">{r.institucion || "-"}</span></div>
                          {r.tipoEstudiante && <div><span className="text-white/50">Perfil:</span> <span className="text-purple-400">{r.tipoEstudiante}</span></div>}
                          {r.semestre && <div><span className="text-white/50">Semestre:</span> <span className="text-purple-400">{r.semestre}</span></div>}
                          {r.profesion && <div><span className="text-white/50">Profesión:</span> <span className="text-green-400">{r.profesion}</span></div>}
                          {r.ocupacion && <div><span className="text-white/50">Ocupación:</span> <span className="text-green-400">{r.ocupacion}</span></div>}
                          {r.lugarTrabajo && <div><span className="text-white/50">Lugar Trabajo:</span> <span className="text-green-400">{r.lugarTrabajo}</span></div>}
                          {r.comentario && <div className="col-span-2 md:col-span-4"><span className="text-white/50">Comentario:</span> <span className="text-white/80">{r.comentario}</span></div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filteredResults.length === 0 && (
                <tr><td colSpan={visibleColumns.length + 1} className="py-8 text-center text-white/40">No hay resultados {hasActiveFilters ? "con los filtros aplicados" : "registrados"}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-2">
          {filteredResults.map(r => (
            <div key={r.id} className="bg-white/5 rounded-lg overflow-hidden" data-testid={`card-result-mobile-${r.id}`}>
              <button
                onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm truncate">{r.nombre}</span>
                    {r.categoriaLector && (
                      <span className={`text-[10px] font-bold ${getLectorClass(r.categoriaLector)}`}>
                        {r.categoriaLector.replace("LECTOR ", "")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {r.comprension !== null && <span className="text-cyan-400 text-xs font-bold">{r.comprension}%</span>}
                    {r.velocidadLectura && <span className="text-purple-400 text-xs">{r.velocidadLectura} p/m</span>}
                    {r.institucion && <span className="text-white/40 text-xs truncate">{r.institucion}</span>}
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-white/40 transition-transform flex-shrink-0 ${expandedResult === r.id ? "rotate-180" : ""}`} />
              </button>
              {expandedResult === r.id && (
                <div className="px-3 pb-3 space-y-2 text-sm border-t border-white/10">
                  <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-3 mt-2 border border-cyan-500/20">
                    <div className="grid grid-cols-3 gap-2 text-center mb-2">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-cyan-400 font-bold text-sm">{r.comprension !== null ? `${r.comprension}%` : "-"}</div>
                        <div className="text-white/50 text-[10px]">Comprensión</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-green-400 font-bold text-sm">{r.respuestasCorrectas ?? "-"}/{r.respuestasTotales ?? "-"}</div>
                        <div className="text-white/50 text-[10px]">Correctas</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-purple-400 font-bold text-sm">{r.velocidadLectura ?? "-"}</div>
                        <div className="text-white/50 text-[10px]">Palabras/min</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center mb-2">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-cyan-400 font-bold text-sm">{formatTime(r.tiempoLectura)}</div>
                        <div className="text-white/50 text-[10px]">T. Lectura</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-purple-400 font-bold text-sm">{formatTime(r.tiempoCuestionario)}</div>
                        <div className="text-white/50 text-[10px]">T. Preguntas</div>
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-2 text-center border border-yellow-500/30">
                      <div className={`font-bold text-xs ${getLectorClass(r.categoriaLector)}`}>{r.categoriaLector || "-"}</div>
                      <div className="text-white/50 text-[10px] mt-1">Categoría Lector</div>
                    </div>
                  </div>
                  <p className="text-white/50">Email: <span className="text-white/80">{r.email || "-"}</span></p>
                  <p className="text-white/50">Edad: <span className="text-white/80">{r.edad || "-"}</span></p>
                  <p className="text-white/50">Teléfono: <span className="text-white/80">{r.telefono || "-"}</span></p>
                  <p className="text-white/50">País: <span className="text-white/80">{r.pais || "-"}</span></p>
                  <p className="text-white/50">Estado: <span className="text-white/80">{r.estado || r.ciudad || "-"}</span></p>
                  <p className="text-white/50">Grado: <span className="text-yellow-400">{r.grado || "-"}</span></p>
                  <p className="text-white/50">Institución: <span className="text-cyan-400">{r.institucion || "-"}</span></p>
                  {r.semestre && <p className="text-white/50">Semestre: <span className="text-purple-400">{r.semestre}</span></p>}
                  {r.profesion && <p className="text-white/50">Profesión: <span className="text-green-400">{r.profesion}</span></p>}
                  {r.ocupacion && <p className="text-white/50">Ocupación: <span className="text-green-400">{r.ocupacion}</span></p>}
                  {r.lugarTrabajo && <p className="text-white/50">Lugar Trabajo: <span className="text-green-400">{r.lugarTrabajo}</span></p>}
                  {r.comentario && <p className="text-white/50">Comentario: <span className="text-white/80">{r.comentario}</span></p>}
                  <p className="text-white/50">Fecha: <span className="text-white/60">{formatDate(r.createdAt)}</span></p>
                </div>
              )}
            </div>
          ))}
          {filteredResults.length === 0 && (
            <div className="py-8 text-center text-white/40">No hay resultados {hasActiveFilters ? "con los filtros aplicados" : "registrados"}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
