import { Fragment, useMemo, useRef, useState, useEffect } from "react";
import { Brain, Download, Filter, Search, Settings2, X } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateFilterInput } from "@/components/DateFilterInput";

type QuizResultLike = {
  id: string;
  nombre: string;
  email?: string | null;
  edad?: string | null;
  ciudad?: string | null;
  telefono?: string | null;
  comentario?: string | null;
  categoria?: string | null;
  testType?: string | null;
  grado?: string | null;
  institucion?: string | null;
  tipoEstudiante?: string | null;
  semestre?: string | null;
  profesion?: string | null;
  ocupacion?: string | null;
  lugarTrabajo?: string | null;
  pais?: string | null;
  estado?: string | null;
  tiempoCuestionario?: number | null;
  respuestasCorrectas?: number | null;
  respuestasTotales?: number | null;
  comprension?: number | null;
  isPwa?: boolean;
  createdAt?: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "Todos",
  preescolar: "Pre-escolar",
  ninos: "Ninos",
  adolescentes: "Adolescentes",
  universitarios: "Universitarios",
  profesionales: "Profesionales",
  adulto_mayor: "Adulto Mayor",
};

const CATEGORY_COLORS: Record<string, string> = {
  all: "bg-cyan-600",
  preescolar: "bg-orange-600",
  ninos: "bg-purple-600",
  adolescentes: "bg-blue-600",
  universitarios: "bg-green-600",
  profesionales: "bg-amber-600",
  adulto_mayor: "bg-rose-600",
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return "-";
  }
}

function formatTime(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatTipoEstudiante(tipo: string | null | undefined) {
  if (!tipo) return "-";
  if (tipo === "universitario") return "Universitario";
  if (tipo === "profesional") return "Profesional";
  if (tipo === "ocupacion") return "Ocupacion";
  return tipo;
}

function matchesDateRange(dateStr: string | null | undefined, from: string, to: string) {
  if (!from && !to) return true;
  if (!dateStr) return false;
  const normalized = new Date(dateStr);
  if (Number.isNaN(normalized.getTime())) return false;
  const value = normalized.toISOString().slice(0, 10);
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

export default function ResultadosRazonamientoPanel({ quizResults }: { quizResults: QuizResultLike[] }) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [institucionFilter, setInstitucionFilter] = useState("all");
  const [perfilFilter, setPerfilFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const columnSelectorRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Array<"nombre" | "categoria" | "comprension" | "correctas" | "tipo" | "fecha">>([
    "nombre",
    "categoria",
    "comprension",
    "correctas",
    "tipo",
    "fecha",
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target as Node)) {
        setShowColumnSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allResults = useMemo(
    () => quizResults.filter((r) => r.testType === "razonamiento"),
    [quizResults]
  );

  const uniqueInstituciones = useMemo(
    () => Array.from(new Set(allResults.map((r) => r.institucion).filter(Boolean) as string[])).sort(),
    [allResults]
  );

  const filteredResults = useMemo(() => {
    return allResults.filter((r) => {
      if (categoryFilter !== "all" && r.categoria !== categoryFilter) return false;
      if (institucionFilter !== "all" && (r.institucion || "") !== institucionFilter) return false;
      if (perfilFilter !== "all" && (r.tipoEstudiante || "sin_perfil") !== perfilFilter) return false;
      if (!matchesDateRange(r.createdAt, dateFrom, dateTo)) return false;

      const haystack = [
        r.nombre,
        r.email,
        r.telefono,
        r.institucion,
        r.grado,
        r.estado,
        r.pais,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchText.trim().toLowerCase());
    });
  }, [allResults, categoryFilter, institucionFilter, perfilFilter, dateFrom, dateTo, searchText]);

  const hasActiveFilters = categoryFilter !== "all" || institucionFilter !== "all" || perfilFilter !== "all" || !!dateFrom || !!dateTo || !!searchText;

  const toggleColumn = (column: (typeof visibleColumns)[number]) => {
    setVisibleColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]));
  };

  const resetFilters = () => {
    setCategoryFilter("all");
    setInstitucionFilter("all");
    setPerfilFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearchText("");
  };

  const downloadExcel = () => {
    const headers = [
      "Nombre",
      "Categoria",
      "Comprension",
      "Correctas",
      "Tiempo",
      "Email",
      "Edad",
      "Telefono",
      "Pais",
      "Estado",
      "Grado",
      "Institucion",
      "Perfil form",
      "Semestre",
      "Profesion",
      "Ocupacion",
      "Lugar trabajo",
      "Comentario",
      "Tipo acceso",
      "Fecha",
    ];

    const rows = filteredResults.map((r) => {
      const base = [
        r.nombre || "-",
        r.categoria || "-",
        r.comprension !== null && r.comprension !== undefined ? `${r.comprension}%` : "-",
        r.respuestasCorrectas !== null && r.respuestasTotales ? `${r.respuestasCorrectas}/${r.respuestasTotales}` : "-",
        formatTime(r.tiempoCuestionario),
        r.email || "-",
        r.edad || "-",
        r.telefono || "-",
        r.pais || "-",
        r.estado || r.ciudad || "-",
        r.grado || "-",
        r.institucion || "-",
        formatTipoEstudiante(r.tipoEstudiante),
        r.semestre || "-",
        r.profesion || "-",
        r.ocupacion || "-",
        r.lugarTrabajo || "-",
        r.comentario || "-",
        r.isPwa ? "PWA" : "Web",
        formatDate(r.createdAt),
      ];
      return base;
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados Razonamiento");

    const infoWs = XLSX.utils.aoa_to_sheet([
      ["Filtros Aplicados"],
      ["Categoria", categoryFilter],
      ["Institucion", institucionFilter],
      ["Perfil", perfilFilter],
      ["Fecha desde", dateFrom || "-"],
      ["Fecha hasta", dateTo || "-"],
      ["Busqueda", searchText || "-"],
    ]);
    XLSX.utils.book_append_sheet(wb, infoWs, "Info Filtros");

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `resultados_razonamiento_${dateStr}.xlsx`);
  };

  const columnLabels: Record<(typeof visibleColumns)[number], string> = {
    nombre: "Nombre",
    categoria: "Categoria",
    comprension: "Comprension",
    correctas: "Correctas",
    tipo: "Tipo",
    fecha: "Fecha",
  };

  return (
    <Card className="bg-black/40 border-blue-500/30">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-bold text-lg">Resultados de Razonamiento</h3>
            <span className="text-white/50 text-sm">({filteredResults.length})</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className={`border-cyan-500/30 text-cyan-400 gap-1 ${showFilters ? "bg-cyan-500/20" : ""}`}
              data-testid="button-toggle-filters-razonamiento"
            >
              <Filter className="w-3 h-3" />
              Filtros
              {hasActiveFilters && <span className="bg-cyan-500 text-black rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{[categoryFilter !== "all", institucionFilter !== "all", perfilFilter !== "all", !!dateFrom || !!dateTo, !!searchText].filter(Boolean).length}</span>}
            </Button>
            <div className="relative" ref={columnSelectorRef}>
              <Button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white/60 gap-1"
                data-testid="button-toggle-columns-razonamiento"
              >
                <Settings2 className="w-3 h-3" />
                Columnas
              </Button>
              {showColumnSelector && (
                <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-white/20 rounded-lg p-3 z-50 min-w-[180px] shadow-xl">
                  {Object.entries(columnLabels).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 py-1 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(key as (typeof visibleColumns)[number])}
                        onChange={() => toggleColumn(key as (typeof visibleColumns)[number])}
                        disabled={key === "nombre"}
                        className="rounded border-white/30 bg-black/40 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-white">{label}</span>
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
              data-testid="button-download-excel-razonamiento"
            >
              <Download className="w-3 h-3" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-black/30 rounded-xl p-4 border border-white/10 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, institucion, telefono..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="bg-black/60 border border-white/20 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 w-full focus:border-cyan-400 focus:outline-none placeholder-white/30"
              />
              {searchText && (
                <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  variant={categoryFilter === key ? "default" : "outline"}
                  size="sm"
                  className={categoryFilter === key ? CATEGORY_COLORS[key] : "border-white/20 text-white/60"}
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Institucion</label>
                <select value={institucionFilter} onChange={(e) => setInstitucionFilter(e.target.value)} className="bg-black/60 border border-white/20 text-white text-xs rounded-lg px-3 py-2 w-full focus:border-cyan-400 focus:outline-none">
                  <option value="all">Todas</option>
                  {uniqueInstituciones.map((inst) => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Perfil</label>
                <select value={perfilFilter} onChange={(e) => setPerfilFilter(e.target.value)} className="bg-black/60 border border-white/20 text-white text-xs rounded-lg px-3 py-2 w-full focus:border-cyan-400 focus:outline-none">
                  <option value="all">Todos</option>
                  <option value="sin_perfil">Sin perfil</option>
                  <option value="universitario">Universitario</option>
                  <option value="profesional">Profesional</option>
                  <option value="ocupacion">Ocupacion</option>
                </select>
              </div>
              <div>
                <DateFilterInput label="Fecha desde" value={dateFrom} onChange={setDateFrom} />
              </div>
              <div>
                <DateFilterInput label="Fecha hasta" value={dateTo} onChange={setDateTo} />
              </div>
            </div>

            {hasActiveFilters && (
              <Button onClick={resetFilters} variant="outline" size="sm" className="border-red-500/30 text-red-400 gap-1 w-full md:w-auto">
                <X className="w-3 h-3" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        )}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/60 border-b border-white/10">
                <th className="pb-3 px-2"></th>
                {visibleColumns.map((col) => (
                  <th key={col} className="pb-3 px-2">{columnLabels[col]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r) => (
                <Fragment key={r.id}>
                  <tr onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)} className="border-b border-white/5 hover:bg-white/5 cursor-pointer">
                    <td className="py-3 px-2">
                      <svg className={`w-4 h-4 text-white/60 transition-transform ${expandedResult === r.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </td>
                    {visibleColumns.includes("nombre") && <td className="py-3 px-2 text-white">{r.nombre}</td>}
                    {visibleColumns.includes("categoria") && <td className="py-3 px-2 text-blue-400">{r.categoria || "-"}</td>}
                    {visibleColumns.includes("comprension") && <td className="py-3 px-2 text-cyan-400 font-bold">{r.comprension !== null && r.comprension !== undefined ? `${r.comprension}%` : "-"}</td>}
                    {visibleColumns.includes("correctas") && <td className="py-3 px-2 text-green-400 font-bold">{r.respuestasCorrectas !== null && r.respuestasTotales ? `${r.respuestasCorrectas}/${r.respuestasTotales}` : "-"}</td>}
                    {visibleColumns.includes("tipo") && <td className="py-3 px-2"><span className={`px-2 py-1 rounded text-xs ${r.isPwa ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>{r.isPwa ? "PWA" : "Web"}</span></td>}
                    {visibleColumns.includes("fecha") && <td className="py-3 px-2 text-white/60 text-xs">{formatDate(r.createdAt)}</td>}
                  </tr>
                  {expandedResult === r.id && (
                    <tr className="bg-white/5">
                      <td colSpan={visibleColumns.length + 1} className="px-4 py-4">
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 mb-4 border border-blue-500/20">
                          <h4 className="text-blue-400 font-bold mb-3 text-sm">Resultados del Test</h4>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-black/30 rounded-lg p-2">
                              <div className="text-cyan-400 font-bold text-lg">{r.comprension !== null && r.comprension !== undefined ? `${r.comprension}%` : "-"}</div>
                              <div className="text-white/50 text-xs">Comprension</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2">
                              <div className="text-green-400 font-bold text-lg">{r.respuestasCorrectas ?? "-"}/{r.respuestasTotales ?? "-"}</div>
                              <div className="text-white/50 text-xs">Correctas</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2">
                              <div className="text-purple-400 font-bold text-lg">{formatTime(r.tiempoCuestionario)}</div>
                              <div className="text-white/50 text-xs">Tiempo</div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div><span className="text-white/60">Email:</span> <span className="text-white/80">{r.email || "-"}</span></div>
                          <div><span className="text-white/60">Edad:</span> <span className="text-white">{r.edad || "-"}</span></div>
                          <div><span className="text-white/60">Telefono:</span> <span className="text-white">{r.telefono || "-"}</span></div>
                          <div><span className="text-white/60">Pais:</span> <span className="text-cyan-400">{r.pais || "-"}</span></div>
                          <div><span className="text-white/60">Estado:</span> <span className="text-cyan-400">{r.estado || r.ciudad || "-"}</span></div>
                          <div><span className="text-white/60">Grado:</span> <span className="text-yellow-400">{r.grado || "-"}</span></div>
                          <div><span className="text-white/60">Institucion:</span> <span className="text-cyan-400">{r.institucion || "-"}</span></div>
                          {r.tipoEstudiante && <div><span className="text-white/60">Perfil:</span> <span className="text-purple-400">{formatTipoEstudiante(r.tipoEstudiante)}</span></div>}
                          {r.semestre && <div><span className="text-white/60">Semestre:</span> <span className="text-purple-400">{r.semestre}</span></div>}
                          {r.profesion && <div><span className="text-white/60">Profesion:</span> <span className="text-green-400">{r.profesion}</span></div>}
                          {r.ocupacion && <div><span className="text-white/60">Ocupacion:</span> <span className="text-green-400">{r.ocupacion}</span></div>}
                          {r.lugarTrabajo && <div><span className="text-white/60">Lugar trabajo:</span> <span className="text-green-400">{r.lugarTrabajo}</span></div>}
                          {r.comentario && <div className="col-span-2 md:col-span-4"><span className="text-white/60">Comentario:</span> <span className="text-white/80">{r.comentario}</span></div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="py-8 text-center text-white/40">
                    No hay resultados de Razonamiento registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-2">
          {filteredResults.map((r) => (
            <div key={r.id} className="bg-white/5 rounded-lg overflow-hidden">
              <button onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)} className="w-full p-3 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{r.nombre}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${r.isPwa ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>{r.isPwa ? "PWA" : "Web"}</span>
                </div>
                <span className="text-white/40 text-xs">{formatDate(r.createdAt)}</span>
              </button>
              {expandedResult === r.id && (
                <div className="px-3 pb-3 space-y-2 text-sm border-t border-white/10">
                  <p className="text-white/60">Categoria: <span className="text-blue-400">{r.categoria || "-"}</span></p>
                  <p className="text-white/60">Comprension: <span className="text-cyan-400 font-bold">{r.comprension !== null && r.comprension !== undefined ? `${r.comprension}%` : "-"}</span></p>
                  <p className="text-white/60">Correctas: <span className="text-green-400 font-bold">{r.respuestasCorrectas ?? "-"}/{r.respuestasTotales ?? "-"}</span></p>
                  <p className="text-white/60">Tiempo: <span className="text-purple-400">{formatTime(r.tiempoCuestionario)}</span></p>
                  <p className="text-white/60">Institucion: <span className="text-cyan-400">{r.institucion || "-"}</span></p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
