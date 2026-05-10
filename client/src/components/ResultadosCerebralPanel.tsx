import { useMemo, useState } from "react";
import { Brain, Download, Filter, Search, X } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SurveyAnswer = { question: string; answer: string };

type CerebralResultLike = {
  id: string;
  nombre: string;
  email?: string | null;
  edad?: string | null;
  ciudad?: string | null;
  telefono?: string | null;
  comentario?: string | null;
  categoria?: string | null;
  grado?: string | null;
  institucion?: string | null;
  tipoEstudiante?: string | null;
  semestre?: string | null;
  profesion?: string | null;
  ocupacion?: string | null;
  lugarTrabajo?: string | null;
  pais?: string | null;
  estado?: string | null;
  lateralidadData?: string | null;
  preferenciaData?: string | null;
  leftPercent?: number | null;
  rightPercent?: number | null;
  dominantSide?: string | null;
  personalityTraits?: string | string[] | null;
  surveyAnswers?: string | null;
  surveyScore?: number | null;
  surveyProfile?: string | null;
  surveyMainNeed?: string | null;
  surveyInterest?: string | null;
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

function parseSurveyAnswers(value: string | null | undefined): SurveyAnswer[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => item?.question && item?.answer) : [];
  } catch {
    return [];
  }
}

function parseArray(value: string | null | undefined): any[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseTraits(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

export default function ResultadosCerebralPanel({ cerebralResults }: { cerebralResults: CerebralResultLike[] }) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [includeSurveyAnswersExport, setIncludeSurveyAnswersExport] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [institucionFilter, setInstitucionFilter] = useState("all");
  const [dominanceFilter, setDominanceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const uniqueInstituciones = useMemo(
    () => Array.from(new Set(cerebralResults.map((r) => r.institucion).filter(Boolean) as string[])).sort(),
    [cerebralResults]
  );

  const filteredResults = useMemo(() => {
    return cerebralResults.filter((r) => {
      if (categoryFilter !== "all" && r.categoria !== categoryFilter) return false;
      if (institucionFilter !== "all" && (r.institucion || "") !== institucionFilter) return false;
      if (dominanceFilter !== "all" && (r.dominantSide || "") !== dominanceFilter) return false;
      if (!matchesDateRange(r.createdAt, dateFrom, dateTo)) return false;

      const haystack = [
        r.nombre,
        r.email,
        r.telefono,
        r.institucion,
        r.grado,
        r.estado,
        r.pais,
        r.surveyProfile,
        r.surveyMainNeed,
        r.dominantSide,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchText.trim().toLowerCase());
    });
  }, [cerebralResults, categoryFilter, institucionFilter, dominanceFilter, dateFrom, dateTo, searchText]);

  const hasActiveFilters = categoryFilter !== "all" || institucionFilter !== "all" || dominanceFilter !== "all" || !!dateFrom || !!dateTo || !!searchText;

  const resetFilters = () => {
    setCategoryFilter("all");
    setInstitucionFilter("all");
    setDominanceFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearchText("");
  };

  const downloadExcel = () => {
    const headers = [
      "Nombre",
      "Categoria",
      "Dominancia",
      "Izquierdo %",
      "Derecho %",
      "Perfil IQX",
      "Area clave",
      "Interes",
      "Puntaje IQX",
      "Rasgos",
      "Respuestas lateralidad",
      "Respuestas preferencia",
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
        r.dominantSide || "-",
        r.leftPercent ?? "-",
        r.rightPercent ?? "-",
        r.surveyProfile || "-",
        r.surveyMainNeed || "-",
        r.surveyInterest || "-",
        r.surveyScore ?? "-",
        parseTraits(r.personalityTraits).join(" | ") || "-",
        parseArray(r.lateralidadData).join(" | ") || "-",
        parseArray(r.preferenciaData).map((p) => `${p.option || "-"}: ${p.meaning || "-"}`).join(" | ") || "-",
        r.email || "-",
        r.edad || "-",
        r.telefono || "-",
        r.pais || "-",
        r.estado || r.ciudad || "-",
        r.grado || "-",
        r.institucion || "-",
        r.tipoEstudiante || "-",
        r.semestre || "-",
        r.profesion || "-",
        r.ocupacion || "-",
        r.lugarTrabajo || "-",
        r.comentario || "-",
        r.isPwa ? "PWA" : "Web",
        formatDate(r.createdAt),
      ];
      if (!includeSurveyAnswersExport) return base;

      const answers = parseSurveyAnswers(r.surveyAnswers);
      for (let i = 0; i < 6; i++) {
        const answer = answers[i];
        base.push(answer?.question || "-");
        base.push(answer?.answer || "-");
      }
      return base;
    });

    const allHeaders = [...headers];
    if (includeSurveyAnswersExport) {
      for (let i = 1; i <= 6; i++) {
        allHeaders.push(`Encuesta P${i}`);
        allHeaders.push(`Respuesta P${i}`);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet([allHeaders, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados Cerebral");

    const infoWs = XLSX.utils.aoa_to_sheet([
      ["Filtros Aplicados"],
      ["Categoria", categoryFilter],
      ["Institucion", institucionFilter],
      ["Dominancia", dominanceFilter],
      ["Fecha desde", dateFrom || "-"],
      ["Fecha hasta", dateTo || "-"],
      ["Busqueda", searchText || "-"],
      ["Encuesta completa", includeSurveyAnswersExport ? "Si" : "No"],
    ]);
    XLSX.utils.book_append_sheet(wb, infoWs, "Info Filtros");

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `resultados_cerebral_${dateStr}.xlsx`);
  };

  return (
    <Card className="bg-black/40 border-purple-500/30">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-bold text-lg">Resultados Test Cerebral</h3>
            <span className="text-white/50 text-sm">({filteredResults.length})</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className={`border-cyan-500/30 text-cyan-400 gap-1 ${showFilters ? "bg-cyan-500/20" : ""}`}
              data-testid="button-toggle-filters-cerebral"
            >
              <Filter className="w-3 h-3" />
              Filtros
              {hasActiveFilters && <span className="bg-cyan-500 text-black rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{[categoryFilter !== "all", institucionFilter !== "all", dominanceFilter !== "all", !!dateFrom || !!dateTo, !!searchText].filter(Boolean).length}</span>}
            </Button>
            <label className="flex items-center gap-2 text-xs text-white/70 px-3 py-2 rounded-lg border border-white/10 bg-black/20">
              <input
                type="checkbox"
                checked={includeSurveyAnswersExport}
                onChange={(e) => setIncludeSurveyAnswersExport(e.target.checked)}
                className="rounded border-white/30 bg-black/40 text-green-500 focus:ring-green-500"
                data-testid="checkbox-include-survey-export-cerebral"
              />
              <span>Encuesta completa</span>
            </label>
            <Button
              onClick={downloadExcel}
              variant="outline"
              size="sm"
              className="border-green-500/30 text-green-400 gap-1"
              data-testid="button-download-excel-cerebral"
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
                <label className="text-white/50 text-xs mb-1 block">Dominancia</label>
                <select value={dominanceFilter} onChange={(e) => setDominanceFilter(e.target.value)} className="bg-black/60 border border-white/20 text-white text-xs rounded-lg px-3 py-2 w-full focus:border-cyan-400 focus:outline-none">
                  <option value="all">Todas</option>
                  <option value="izquierdo">Hemisferio izquierdo</option>
                  <option value="derecho">Hemisferio derecho</option>
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Fecha desde</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-black/60 border border-purple-500/40 text-white text-xs rounded-lg px-3 py-2.5 w-full focus:border-cyan-400 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert" />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Fecha hasta</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-black/60 border border-purple-500/40 text-white text-xs rounded-lg px-3 py-2.5 w-full focus:border-cyan-400 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert" />
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

        {filteredResults.length === 0 ? (
          <p className="text-white/60 text-center py-8">No hay resultados de Test Cerebral aun</p>
        ) : (
          <div className="space-y-3">
            {filteredResults.map((r) => {
              const isExpanded = expandedResult === r.id;
              const lateralidadAnswers = parseArray(r.lateralidadData);
              const preferenciaAnswers = parseArray(r.preferenciaData);
              const personalityTraits = parseTraits(r.personalityTraits);

              return (
                <div
                  key={r.id}
                  className={`bg-white/5 rounded-lg border transition-all cursor-pointer ${isExpanded ? "border-purple-400" : "border-purple-500/20 hover:border-purple-500/40"}`}
                  onClick={() => setExpandedResult(isExpanded ? null : r.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-medium text-lg">{r.nombre}</span>
                        <span className={`px-2 py-1 rounded text-xs ${r.dominantSide === "izquierdo" ? "bg-cyan-500/20 text-cyan-300" : "bg-purple-500/20 text-purple-300"}`}>
                          {r.dominantSide === "izquierdo" ? "Hemisferio Izquierdo" : "Hemisferio Derecho"}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${r.isPwa ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                          {r.isPwa ? "PWA" : "Web"}
                        </span>
                      </div>
                      <span className="text-white/40 text-xs">{formatDate(r.createdAt)}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 md:gap-8 items-center text-sm">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <span className="text-cyan-400 font-bold text-xl">{r.leftPercent ?? 0}%</span>
                          <p className="text-white/40 text-xs">Izquierdo</p>
                        </div>
                        <div className="text-center">
                          <span className="text-purple-400 font-bold text-xl">{r.rightPercent ?? 0}%</span>
                          <p className="text-white/40 text-xs">Derecho</p>
                        </div>
                      </div>
                      <div className="hidden md:flex gap-4 text-white/60 flex-wrap">
                        {r.email && <span>{r.email}</span>}
                        {r.edad && <span>{r.edad} anos</span>}
                        {r.institucion && <span>{r.institucion}</span>}
                        {r.grado && <span className="text-yellow-400">{r.grado}</span>}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-purple-500/20 p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-cyan-400 font-semibold mb-2">Respuestas de Lateralidad ({lateralidadAnswers.length})</h4>
                          {lateralidadAnswers.length > 0 ? (
                            <div className="space-y-1">
                              {lateralidadAnswers.map((answer: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span className="text-white/40 w-5">{i + 1}.</span>
                                  <span className={`px-2 py-0.5 rounded text-xs ${String(answer).toLowerCase().includes("izquierda") ? "bg-cyan-500/20 text-cyan-300" : "bg-purple-500/20 text-purple-300"}`}>
                                    {String(answer)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm">Sin respuestas registradas</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-purple-400 font-semibold mb-2">Rasgos de Personalidad ({personalityTraits.length})</h4>
                          {personalityTraits.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {personalityTraits.map((trait, i) => (
                                <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">{trait}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm">Sin rasgos registrados</p>
                          )}
                        </div>
                      </div>

                      {preferenciaAnswers.length > 0 && (
                        <div>
                          <h4 className="text-pink-400 font-semibold mb-2">Preferencias Visuales ({preferenciaAnswers.length})</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {preferenciaAnswers.map((pref: any, i: number) => (
                              <div key={i} className="bg-white/5 rounded p-2 text-center">
                                <span className="text-white/80 text-sm block">{pref.option || `Opcion ${i + 1}`}</span>
                                <span className="text-pink-300 text-xs">{pref.meaning || "-"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(r.surveyProfile || r.surveyMainNeed || r.surveyInterest) && (
                        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg p-4 border border-purple-500/20">
                          <h4 className="text-purple-300 font-bold mb-3 text-sm">Perfil Cognitivo IQX</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                            <div className="bg-black/30 rounded-lg p-2"><div className="text-purple-300 font-bold text-sm">{r.surveyProfile || "-"}</div><div className="text-white/50 text-xs">Perfil</div></div>
                            <div className="bg-black/30 rounded-lg p-2"><div className="text-cyan-300 font-bold text-sm">{r.surveyMainNeed || "-"}</div><div className="text-white/50 text-xs">Area clave</div></div>
                            <div className="bg-black/30 rounded-lg p-2"><div className="text-green-300 font-bold text-sm">{r.surveyScore ?? "-"}</div><div className="text-white/50 text-xs">Puntaje</div></div>
                            <div className="bg-black/30 rounded-lg p-2"><div className="text-yellow-300 font-bold text-sm">{r.surveyInterest || "-"}</div><div className="text-white/50 text-xs">Interes</div></div>
                          </div>
                          {parseSurveyAnswers(r.surveyAnswers).length > 0 && (
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {parseSurveyAnswers(r.surveyAnswers).map((answer, idx) => (
                                <div key={idx} className="bg-black/20 rounded px-3 py-2">
                                  <p className="text-white/50 text-[11px]">{idx + 1}. {answer.question}</p>
                                  <p className="text-white/85 text-xs font-semibold">{answer.answer}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><span className="text-white/60">Email:</span> <span className="text-white/80">{r.email || "-"}</span></div>
                        <div><span className="text-white/60">Edad:</span> <span className="text-white">{r.edad || "-"}</span></div>
                        <div><span className="text-white/60">Telefono:</span> <span className="text-white">{r.telefono || "-"}</span></div>
                        <div><span className="text-white/60">Pais:</span> <span className="text-cyan-400">{r.pais || "-"}</span></div>
                        <div><span className="text-white/60">Estado:</span> <span className="text-cyan-400">{r.estado || r.ciudad || "-"}</span></div>
                        <div><span className="text-white/60">Grado:</span> <span className="text-yellow-400">{r.grado || "-"}</span></div>
                        <div><span className="text-white/60">Institucion:</span> <span className="text-cyan-400">{r.institucion || "-"}</span></div>
                        {r.tipoEstudiante && <div><span className="text-white/60">Perfil:</span> <span className="text-purple-400">{r.tipoEstudiante}</span></div>}
                        {r.semestre && <div><span className="text-white/60">Semestre:</span> <span className="text-purple-400">{r.semestre}</span></div>}
                        {r.profesion && <div><span className="text-white/60">Profesion:</span> <span className="text-green-400">{r.profesion}</span></div>}
                        {r.ocupacion && <div><span className="text-white/60">Ocupacion:</span> <span className="text-green-400">{r.ocupacion}</span></div>}
                        {r.lugarTrabajo && <div><span className="text-white/60">Lugar trabajo:</span> <span className="text-green-400">{r.lugarTrabajo}</span></div>}
                        {r.comentario && <div className="col-span-2 md:col-span-4"><span className="text-white/60">Comentario:</span> <span className="text-white/80">{r.comentario}</span></div>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
