import { useState, useMemo, useRef, useEffect, Fragment } from "react";
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

              <div>
                <label className="text-white/50 text-xs mb-1 block">Desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className={selectClass}
                  data-testid="input-date-from"
                />
              </div>

              <div>
                <label className="text-white/50 text-xs mb-1 block">Hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className={selectClass}
                  data-testid="input-date-to"
                />
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
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                    formatter={(value: number, _name: string, entry: any) => [`${value}%`, entry.payload.fullName]}
                    labelFormatter={() => ""}
                  />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]} maxBarSize={40}>
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
                    contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
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

        <div className="hidden md:block relative">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" style={{ maxWidth: "100%" }}>
            <table className="text-sm min-w-max" data-testid="table-lectura-results">
              <thead>
                <tr className="text-left text-white/60 border-b border-white/10">
                  <th className="pb-3 px-2 w-6 sticky left-0 bg-[#0f0a1e] z-10"></th>
                  {visibleColumns.map((col, i) => (
                    <th key={col} className={`pb-3 px-3 text-xs whitespace-nowrap ${i === 0 ? "sticky left-6 bg-[#0f0a1e] z-10" : ""}`}>
                      {ALL_COLUMNS.find(c => c.key === col)?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(r => (
                  <Fragment key={r.id}>
                    <tr
                      onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                      data-testid={`row-result-${r.id}`}
                    >
                      <td className="py-3 px-2 sticky left-0 bg-inherit z-10">
                        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${expandedResult === r.id ? "rotate-180" : ""}`} />
                      </td>
                      {visibleColumns.map((col, i) => (
                        <td key={col} className={`py-3 px-3 text-xs whitespace-nowrap ${i === 0 ? "sticky left-6 bg-inherit z-10" : ""} ${col === "categoriaLector" ? getLectorClass(r.categoriaLector) : col === "comprension" ? "text-cyan-400 font-bold" : col === "velocidad" ? "text-purple-400 font-bold" : "text-white/80"}`}>
                          {getCellValue(r, col)}
                        </td>
                      ))}
                    </tr>
                    {expandedResult === r.id && (
                      <tr key={`${r.id}-detail`} className="bg-white/5">
                        <td colSpan={visibleColumns.length + 1} className="px-4 py-4">
                          {(() => {
                            const statCards: { value: string; label: string; color: string; border?: boolean }[] = [];
                            if (!visibleColumns.includes("comprension"))
                              statCards.push({ value: r.comprension !== null ? `${r.comprension}%` : "-", label: "Comprensión", color: "text-cyan-400" });
                            if (!visibleColumns.includes("correctas"))
                              statCards.push({ value: `${r.respuestasCorrectas ?? "-"}/${r.respuestasTotales ?? "-"}`, label: "Correctas", color: "text-green-400" });
                            if (!visibleColumns.includes("velocidad"))
                              statCards.push({ value: r.velocidadLectura ? `${r.velocidadLectura}` : "-", label: "Palabras/min", color: "text-purple-400" });
                            statCards.push({ value: formatTime(r.tiempoLectura), label: "T. Lectura", color: "text-cyan-400" });
                            statCards.push({ value: formatTime(r.tiempoCuestionario), label: "T. Preguntas", color: "text-purple-400" });
                            if (!visibleColumns.includes("categoriaLector"))
                              statCards.push({ value: r.categoriaLector || "-", label: "Categoría", color: getLectorClass(r.categoriaLector), border: true });

                            const detailFields: { label: string; value: string | null; color: string; colKey?: ColumnKey }[] = [
                              { label: "Email", value: r.email, color: "text-white/80", colKey: "email" },
                              { label: "Edad", value: r.edad, color: "text-white/80", colKey: "edad" },
                              { label: "Teléfono", value: r.telefono, color: "text-white/80", colKey: "telefono" },
                              { label: "País", value: r.pais, color: "text-cyan-400", colKey: "pais" },
                              { label: "Estado", value: r.estado || r.ciudad, color: "text-cyan-400", colKey: "estado" },
                              { label: "Grado", value: r.grado, color: "text-yellow-400", colKey: "grado" },
                              { label: "Institución", value: r.institucion, color: "text-cyan-400", colKey: "institucion" },
                            ];
                            const hiddenDetails = detailFields.filter(f => !f.colKey || !visibleColumns.includes(f.colKey));

                            const extraFields: { label: string; value: string | null; color: string }[] = [];
                            if (r.tipoEstudiante) extraFields.push({ label: "Perfil", value: r.tipoEstudiante, color: "text-purple-400" });
                            if (r.semestre && !visibleColumns.includes("semestre")) extraFields.push({ label: "Semestre", value: r.semestre, color: "text-purple-400" });
                            if (r.profesion) extraFields.push({ label: "Profesión", value: r.profesion, color: "text-green-400" });
                            if (r.ocupacion) extraFields.push({ label: "Ocupación", value: r.ocupacion, color: "text-green-400" });
                            if (r.lugarTrabajo) extraFields.push({ label: "Lugar Trabajo", value: r.lugarTrabajo, color: "text-green-400" });

                            const allDetails = [...hiddenDetails, ...extraFields];

                            return (
                              <>
                                {statCards.length > 0 && (
                                  <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 mb-3 border border-cyan-500/20">
                                    <div className={`grid gap-3 text-center`} style={{ gridTemplateColumns: `repeat(${Math.min(statCards.length, 6)}, 1fr)` }}>
                                      {statCards.map((card, idx) => (
                                        <div key={idx} className={`bg-black/30 rounded-lg p-2 ${card.border ? "border border-yellow-500/30" : ""}`}>
                                          <div className={`font-bold ${card.border ? "text-xs leading-tight" : "text-lg"} ${card.color}`}>{card.value}</div>
                                          <div className="text-white/50 text-xs mt-1">{card.label}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {(allDetails.length > 0 || r.comentario) && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    {allDetails.map((f, idx) => (
                                      <div key={idx}><span className="text-white/50">{f.label}:</span> <span className={f.color}>{f.value || "-"}</span></div>
                                    ))}
                                    {r.comentario && <div className="col-span-2 md:col-span-4"><span className="text-white/50">Comentario:</span> <span className="text-white/80">{r.comentario}</span></div>}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {filteredResults.length === 0 && (
                  <tr><td colSpan={visibleColumns.length + 1} className="py-8 text-center text-white/40">No hay resultados {hasActiveFilters ? "con los filtros aplicados" : "registrados"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {visibleColumns.length > 8 && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0f0a1e] to-transparent pointer-events-none z-20" />
          )}
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
