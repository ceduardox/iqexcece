import { useState, useMemo, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { Search, Download, FileText, ChevronDown, Settings2, Filter, X, BarChart3, UserRound, CalendarDays, BadgeInfo, BookOpen, Gauge, Clock3, Bolt, CheckCircle2, TrendingUp, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import * as XLSX from "xlsx";
import { DateFilterInput } from "@/components/DateFilterInput";

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
  readingTitle?: string | null;
  readingWordCount?: number | null;
  readingTemaNumero?: number | null;
  readingLang?: string | null;
  readingContent?: string | null;
  surveyAnswers?: string | null;
  surveyScore?: number | null;
  surveyProfile?: string | null;
  surveyMainNeed?: string | null;
  surveyInterest?: string | null;
  tiempoLectura: number | null;
  tiempoCuestionario: number | null;
  isPwa: boolean;
  createdAt: string | null;
  created_at?: string | null;
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
const REPORT_LOGO_URL = "/logo.png";

const BOLIVIA_REFERENCE = [
  { label: "7 años", min: 60, max: 90, description: "Capacidad de comprender textos simples y cortos" },
  { label: "8 años", min: 70, max: 110, description: "Comprende textos más complejos con apoyo y contexto" },
  { label: "9 años", min: 80, max: 120, description: "Capacidad de extraer información detallada de los textos" },
  { label: "10 años", min: 90, max: 140, description: "Comprende textos narrativos y expositivos con fluidez" },
  { label: "11 años", min: 100, max: 150, description: "Habilidad para analizar y sintetizar información leída" },
  { label: "12 años", min: 110, max: 160, description: "Comprensión profunda de textos variados y extensos" },
  { label: "13 a 14 años", min: 150, max: 170, description: "Habilidad para analizar y sintetizar información leída" },
  { label: "15 a 17 años", min: 150, max: 200, description: "Comprensión profunda de textos variados y extensos" },
  { label: "18 años en adelante", min: 200, max: null, description: "Comprensión profunda de textos variados y extensos" },
];

const UNESCO_REFERENCE = [
  { label: "7 años", min: 90, max: 110, description: "Capacidad de comprender textos simples y cortos" },
  { label: "8 y 9 años", min: 110, max: 150, description: "Comprende textos más complejos con apoyo y contexto" },
  { label: "10 y 11 años", min: 150, max: 200, description: "Capacidad de extraer información detallada de los textos" },
  { label: "12 y 13 años", min: 200, max: 250, description: "Comprende textos narrativos y expositivos con fluidez" },
  { label: "13 y 14 años", min: 250, max: 300, description: "Habilidad para analizar y sintetizar información leída" },
  { label: "15 años en adelante", min: 300, max: null, description: "Comprensión profunda de textos variados y extensos" },
];

type ColumnKey = "nombre" | "readingTitle" | "readingWordCount" | "readingTemaNumero" | "comprension" | "velocidad" | "correctas" | "categoriaLector" | "surveyProfile" | "surveyMainNeed" | "surveyInterest" | "surveyScore" | "grado" | "institucion" | "semestre" | "edad" | "email" | "telefono" | "pais" | "estado" | "fecha";

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "nombre", label: "Nombre" },
  { key: "readingTitle", label: "Texto leido" },
  { key: "readingWordCount", label: "Palabras" },
  { key: "readingTemaNumero", label: "Tema" },
  { key: "comprension", label: "Comprensión %" },
  { key: "velocidad", label: "Velocidad" },
  { key: "correctas", label: "Correctas" },
  { key: "categoriaLector", label: "Cat. Lector" },
  { key: "surveyProfile", label: "Perfil IQX" },
  { key: "surveyMainNeed", label: "Area clave" },
  { key: "surveyInterest", label: "Interes" },
  { key: "surveyScore", label: "Puntaje IQX" },
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

const DEFAULT_VISIBLE: ColumnKey[] = ["nombre", "readingTitle", "readingWordCount", "comprension", "velocidad", "correctas", "categoriaLector", "surveyProfile", "surveyMainNeed", "surveyScore", "grado", "institucion", "fecha"];

function getCreatedAt(result: QuizResult): string | Date | null {
  return result.createdAt || result.created_at || null;
}

function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "-";
  const date = parseDate(d);
  if (!date) return "-";
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

function parseSurveyAnswers(value: string | null | undefined): { question: string; answer: string }[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseAge(value: string | null | undefined): number | null {
  if (!value) return null;
  const age = Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(age) ? age : null;
}

function getBoliviaReferenceByAge(age: number | null) {
  if (age === null) return null;
  if (age <= 7) return BOLIVIA_REFERENCE[0];
  if (age === 8) return BOLIVIA_REFERENCE[1];
  if (age === 9) return BOLIVIA_REFERENCE[2];
  if (age === 10) return BOLIVIA_REFERENCE[3];
  if (age === 11) return BOLIVIA_REFERENCE[4];
  if (age === 12) return BOLIVIA_REFERENCE[5];
  if (age <= 14) return BOLIVIA_REFERENCE[6];
  if (age <= 17) return BOLIVIA_REFERENCE[7];
  return BOLIVIA_REFERENCE[8];
}

function getUnescoReferenceByAge(age: number | null) {
  if (age === null) return null;
  if (age <= 7) return UNESCO_REFERENCE[0];
  if (age <= 9) return UNESCO_REFERENCE[1];
  if (age <= 11) return UNESCO_REFERENCE[2];
  if (age <= 13) return UNESCO_REFERENCE[3];
  if (age <= 14) return UNESCO_REFERENCE[4];
  return UNESCO_REFERENCE[5];
}

function getEvaluationId(result: QuizResult) {
  const date = parseDate(getCreatedAt(result)) || new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const raw = String(result.id || "").replace(/\D/g, "");
  const suffix = raw ? raw.slice(-3).padStart(3, "0") : "001";
  return `IQX-${yy}${mm}${dd}-${suffix}`;
}

function getProfileDescription(category: string | null, speed: number | null) {
  if (!category) return "Resultado en proceso de interpretación.";
  if (category === "LECTOR COMPETENTE") return `Buen nivel de comprensión y velocidad lectora${speed ? "." : ""}`;
  if (category === "LECTOR REGULAR") return "Comprensión funcional con margen claro para elevar la velocidad y consistencia.";
  if (category === "LECTOR CON DIFICULTAD") return "Necesita reforzar comprensión y técnica lectora para ganar precisión.";
  return "Requiere apoyo prioritario en comprensión y base lectora.";
}

function getNationalComparison(result: QuizResult) {
  const age = parseAge(result.edad);
  const ref = getBoliviaReferenceByAge(age);
  const speed = result.velocidadLectura ?? 0;
  if (!ref || !speed) return "Sin datos suficientes para comparar con el parámetro nacional.";
  if (speed < ref.min) {
    return `Su velocidad lectora (${speed} PPM) está por debajo del rango esperado para ${ref.label} (${ref.min}${ref.max ? ` - ${ref.max}` : "+"} PPM).`;
  }
  if (ref.max !== null && speed > ref.max) {
    return `Su velocidad lectora (${speed} PPM) está por encima del rango esperado para ${ref.label} (${ref.min} - ${ref.max} PPM).`;
  }
  return `Su velocidad lectora (${speed} PPM) se encuentra dentro del rango esperado para ${ref.label} (${ref.min}${ref.max ? ` - ${ref.max}` : "+"} PPM).`;
}

function getInternationalComparison(result: QuizResult) {
  const age = parseAge(result.edad);
  const ref = getUnescoReferenceByAge(age);
  const speed = result.velocidadLectura ?? 0;
  if (!ref || !speed) return "Sin datos suficientes para comparar con el parámetro internacional.";
  if (speed < ref.min) {
    return `Su velocidad lectora (${speed} PPM) se encuentra por debajo del estándar internacional para ${ref.label} (${ref.min}${ref.max ? ` - ${ref.max}` : "+"} PPM). Existen oportunidades para mejorar.`;
  }
  if (ref.max !== null && speed > ref.max) {
    return `Su velocidad lectora (${speed} PPM) supera el estándar internacional de referencia para ${ref.label} (${ref.min} - ${ref.max} PPM).`;
  }
  return `Su velocidad lectora (${speed} PPM) se encuentra dentro del estándar internacional para ${ref.label} (${ref.min}${ref.max ? ` - ${ref.max}` : "+"} PPM).`;
}

function getIqxLevel(result: QuizResult) {
  const comp = result.comprension ?? 0;
  const speed = result.velocidadLectura ?? 0;
  const unesco = getUnescoReferenceByAge(parseAge(result.edad));
  if (result.categoriaLector === "LECTOR CON DIFICULTAD SEVERA") return 1;
  if (result.categoriaLector === "LECTOR CON DIFICULTAD") return 2;
  if (result.categoriaLector === "LECTOR REGULAR") return comp >= 70 ? 3 : 2;
  if (result.categoriaLector === "LECTOR COMPETENTE" && unesco && speed >= unesco.min) return 5;
  if (result.categoriaLector === "LECTOR COMPETENTE") return 4;
  return 3;
}

function getStrengths(result: QuizResult) {
  const strengths: string[] = [];
  const comp = result.comprension ?? 0;
  const speed = result.velocidadLectura ?? 0;
  if (comp >= 80) strengths.push("Buena comprensión general del texto.");
  if (speed >= 150) strengths.push("Velocidad lectora adecuada para su nivel.");
  if ((result.respuestasCorrectas ?? 0) >= Math.max(1, Math.ceil((result.respuestasTotales ?? 0) * 0.8))) strengths.push("Respuestas precisas y consistentes.");
  if ((result.tiempoCuestionario ?? 0) <= 45) strengths.push("Tiempo de respuesta ágil.");
  if (result.surveyProfile) strengths.push(`Perfil cognitivo identificado: ${result.surveyProfile}.`);
  return strengths.slice(0, 5);
}

function getOpportunities(result: QuizResult) {
  const opportunities: string[] = [];
  const comp = result.comprension ?? 0;
  const speed = result.velocidadLectura ?? 0;
  const national = getBoliviaReferenceByAge(parseAge(result.edad));
  if (comp < 80) opportunities.push("Profundizar la comprensión antes de aumentar velocidad.");
  if (national && speed < national.min) opportunities.push("Elevar la velocidad lectora hasta el rango esperado para su edad.");
  if ((result.tiempoCuestionario ?? 0) > 60) opportunities.push("Mejorar la rapidez de análisis al responder.");
  if (result.surveyMainNeed) opportunities.push(`Trabajar el área clave detectada: ${result.surveyMainNeed}.`);
  opportunities.push("Desarrollar hábitos de lectura con mayor constancia.");
  return Array.from(new Set(opportunities)).slice(0, 5);
}

function getProjection(result: QuizResult) {
  const focus = result.surveyMainNeed || "Optimizar mi rendimiento mental integral";
  const base = [
    { label: "Comprensión profunda", value: "+30%" },
    { label: "Velocidad lectora", value: "+40%" },
    { label: "Retención de información", value: "+35%" },
    { label: "Análisis y pensamiento crítico", value: "+35%" },
  ];
  if (focus.toLowerCase().includes("concentr")) {
    base[2] = { label: "Concentración sostenida", value: "+35%" };
  }
  if (focus.toLowerCase().includes("record")) {
    base[2] = { label: "Retención de información", value: "+40%" };
  }
  return base;
}

function ProgressRing({ value }: { value: number }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
      <circle cx="80" cy="80" r={radius} fill="none" stroke="#dbeafe" strokeWidth="10" />
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke="url(#iqxGradient)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 80 80)"
      />
      <defs>
        <linearGradient id="iqxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16c6b4" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StudentIQXReport({ result }: { result: QuizResult }) {
  const age = parseAge(result.edad);
  const bolivia = getBoliviaReferenceByAge(age);
  const unesco = getUnescoReferenceByAge(age);
  const iqxLevel = getIqxLevel(result);
  const strengths = getStrengths(result);
  const opportunities = getOpportunities(result);
  const projection = getProjection(result);
  const surveyAnswers = parseSurveyAnswers(result.surveyAnswers);
  const profileDescription = getProfileDescription(result.categoriaLector, result.velocidadLectura);
  const formattedDate = (() => {
    const date = parseDate(getCreatedAt(result));
    return date ? date.toLocaleDateString("es-ES") : "-";
  })();
  const profileTitle = (result.categoriaLector?.replaceAll("LECTOR ", "") || "SIN PERFIL").trim();
  const profileTitleWords = profileTitle.split(/\s+/).filter(Boolean);
  const profileTitleDisplay = profileTitleWords.length >= 2
    ? `${profileTitleWords[0]}\n${profileTitleWords.slice(1).join(" ")}`
    : profileTitle;

  return (
    <div className="w-[1240px] bg-white text-slate-900 p-8 font-sans">
      <div className="rounded-[28px] overflow-hidden border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
        <div className="grid grid-cols-[340px_1fr] bg-white">
          <div className="min-h-[208px] bg-white px-10 py-6 flex flex-col justify-center">
            <img src={REPORT_LOGO_URL} alt="IQX" className="h-28 w-auto object-contain mb-4" />
            <p className="text-[16px] tracking-[0.22em] text-slate-700 font-semibold">INTELIGENCIA EXPONENCIAL</p>
            <div className="w-[220px] h-[3px] bg-cyan-500 mt-4 mb-3" />
            <p className="text-[12px] tracking-[0.18em] text-slate-500 font-semibold">METODO X - NEUROACELERACION COGNITIVA</p>
          </div>
          <div className="bg-white">
            <div className="relative min-h-[110px] overflow-hidden bg-[#071a3d] px-12 py-6 text-white">
              <div className="absolute left-[-34px] top-[-18px] h-[160px] w-[48px] -skew-x-[12deg] bg-gradient-to-b from-cyan-400 to-blue-500" />
              <div className="absolute left-[-12px] top-[-18px] h-[160px] w-[18px] -skew-x-[12deg] bg-white/95" />
              <div className="pl-10">
                <p className="text-[50px] font-black tracking-wide leading-none">REPORTE DE RESULTADOS IQX</p>
                <p className="text-[22px] font-semibold mt-2 tracking-wide text-white">EVALUACION DE COMPRENSION LECTORA</p>
              </div>
            </div>
            <div className="border-b border-slate-200 bg-white px-10 py-4">
              <div className="grid grid-cols-4 gap-5">
                {[
                  { icon: UserRound, label: "Alumno", value: result.nombre || "-" },
                  { icon: UserRound, label: "Edad", value: result.edad ? `${result.edad} anos` : "-" },
                  { icon: CalendarDays, label: "Fecha del Test", value: formattedDate },
                  { icon: BadgeInfo, label: "ID Evaluacion", value: getEvaluationId(result) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-sm shrink-0">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-700">{item.label}:</p>
                      <p className="text-[18px] font-semibold text-slate-900 leading-tight">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 bg-slate-50">
          <div className="grid grid-cols-[360px_1fr] gap-6">
            <div className="rounded-[28px] bg-white border border-slate-200 p-6 flex gap-5 items-center shadow-sm">
              <div className="w-32 h-32 rounded-full border-[6px] border-cyan-300 flex items-center justify-center text-slate-700 bg-white shadow-inner">
                <UserRound className="w-16 h-16" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide text-slate-500">PERFIL OBTENIDO</p>
                <p className={`mt-3 font-black leading-[0.95] whitespace-pre-line ${profileTitleWords.length >= 2 ? "text-[42px]" : "text-5xl"} ${result.categoriaLector?.includes("COMPETENTE") ? "text-green-600" : result.categoriaLector?.includes("REGULAR") ? "text-yellow-500" : result.categoriaLector?.includes("SEVERA") ? "text-red-500" : "text-orange-500"}`}>
                  {profileTitleDisplay}
                </p>
                <p className="text-slate-700 text-xl leading-relaxed mt-5">
                  {profileDescription}.
                  {result.categoriaLector === "LECTOR COMPETENTE" ? " Potencial para alcanzar niveles superiores." : " Hay espacio claro de mejora estructurada."}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
              <div className="inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold px-5 py-2 mb-5">
                RESULTADOS GENERALES
              </div>
              <div className="grid grid-cols-4 divide-x divide-slate-200">
                {[
                  { icon: BookOpen, label: "COMPRENSIÓN LECTORA", value: `${result.comprension ?? 0}%`, sub: `${result.respuestasCorrectas ?? 0} de ${result.respuestasTotales ?? 0}` },
                  { icon: Gauge, label: "VELOCIDAD LECTORA", value: `${result.velocidadLectura ?? 0}`, sub: "PPM" },
                  { icon: Clock3, label: "TIEMPO DE LECTURA", value: formatTime(result.tiempoLectura), sub: "min" },
                  { icon: Bolt, label: "TIEMPO DE RESPUESTA", value: formatTime(result.tiempoCuestionario), sub: "seg" },
                ].map((item) => (
                  <div key={item.label} className="px-5 text-center">
                    <item.icon className="w-11 h-11 mx-auto text-cyan-500 mb-3" />
                    <p className="text-[15px] font-black leading-tight min-h-[42px]">{item.label}</p>
                    <p className="text-5xl font-black mt-4">{item.value}</p>
                    <p className="text-base text-slate-500 font-medium mt-2">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 my-7">
            <div className="h-px flex-1 bg-slate-300" />
            <p className="text-2xl font-black text-slate-700 tracking-wide">COMPARATIVO CON PARÁMETROS DE REFERENCIA</p>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-[24px] overflow-hidden border border-green-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-5 py-3 text-lg font-black">PARÁMETRO NACIONAL - BOLIVIA</div>
              <table className="w-full text-[15px]">
                <thead className="bg-green-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Rango de edad</th>
                    <th className="px-4 py-3 text-left">Velocidad lectora (PPM)</th>
                    <th className="px-4 py-3 text-left">Nivel de comprensión</th>
                  </tr>
                </thead>
                <tbody>
                  {BOLIVIA_REFERENCE.map((row) => (
                    <tr key={row.label} className={`border-t border-slate-200 ${bolivia?.label === row.label ? "bg-green-50/80" : ""}`}>
                      <td className="px-4 py-3 font-medium">{row.label}</td>
                      <td className="px-4 py-3">{row.min}{row.max ? ` - ${row.max}` : " en adelante"}</td>
                      <td className="px-4 py-3 text-slate-600">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="m-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-center justify-between gap-4">
                <p className="text-green-900 font-medium text-lg leading-relaxed">{getNationalComparison(result)}</p>
                <CheckCircle2 className="w-10 h-10 text-green-600 shrink-0" />
              </div>
            </div>

            <div className="rounded-[24px] overflow-hidden border border-blue-200 bg-white shadow-sm">
              <div className="bg-[#0b3a72] text-white px-5 py-3 text-lg font-black">PARÁMETRO INTERNACIONAL (UNESCO)</div>
              <table className="w-full text-[15px]">
                <thead className="bg-blue-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Rango de edad</th>
                    <th className="px-4 py-3 text-left">Velocidad lectora (PPM)</th>
                    <th className="px-4 py-3 text-left">Nivel de comprensión</th>
                  </tr>
                </thead>
                <tbody>
                  {UNESCO_REFERENCE.map((row) => (
                    <tr key={row.label} className={`border-t border-slate-200 ${unesco?.label === row.label ? "bg-blue-50/80" : ""}`}>
                      <td className="px-4 py-3 font-medium">{row.label}</td>
                      <td className="px-4 py-3">{row.min}{row.max ? ` - ${row.max}` : " en adelante"}</td>
                      <td className="px-4 py-3 text-slate-600">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="m-4 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 flex items-center justify-between gap-4">
                <p className="text-blue-900 font-medium text-lg leading-relaxed">{getInternationalComparison(result)}</p>
                <TrendingUp className="w-10 h-10 text-blue-600 shrink-0" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1.1fr_0.8fr_1fr] gap-6 mt-6">
            <div className="rounded-[24px] bg-white border border-slate-200 p-6 shadow-sm">
              <p className="text-2xl font-black mb-4">ANÁLISIS IQX</p>
              <div className="mb-5">
                <p className="text-green-600 font-black text-lg mb-2">FORTALEZAS</p>
                <ul className="space-y-2 text-[16px] text-slate-700">
                  {strengths.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-1 text-green-500 shrink-0" /><span>{item}</span></li>)}
                </ul>
              </div>
              <div>
                <p className="text-amber-500 font-black text-lg mb-2">ÁREAS DE OPORTUNIDAD</p>
                <ul className="space-y-2 text-[16px] text-slate-700">
                  {opportunities.map((item) => <li key={item} className="flex gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 mt-2.5 shrink-0" /><span>{item}</span></li>)}
                </ul>
              </div>
            </div>

            <div className="rounded-[24px] bg-white border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-black mb-4">NIVEL IQX</p>
              <div className="relative flex items-center justify-center">
                <ProgressRing value={iqxLevel * 20} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <div className="text-6xl leading-none font-black text-cyan-600">{iqxLevel}</div>
                  <div className="text-lg leading-none font-bold text-slate-500 mt-1">DE 5</div>
                </div>
              </div>
              <p className="text-emerald-600 text-2xl font-black mt-4">
                {iqxLevel >= 4 ? "POTENCIAL ALTO" : iqxLevel === 3 ? "POTENCIAL MEDIO" : "EN DESARROLLO"}
              </p>
              <p className="text-slate-600 text-lg mt-2">
                {iqxLevel >= 4 ? "Buen desempeño con capacidad para alcanzar niveles superiores." : "Desempeño con oportunidad clara de mejora estructurada."}
              </p>
            </div>

            <div className="rounded-[24px] bg-white border border-slate-200 p-6 shadow-sm">
              <p className="text-2xl font-black mb-4">PROYECCIÓN DE MEJORA</p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Con un entrenamiento cognitivo estructurado y constante, en las áreas clave de IQX, podrás mejorar:
              </p>
              <div className="space-y-3 mt-5">
                {projection.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-cyan-600" />
                      </div>
                      <span className="font-semibold text-lg">{item.label}</span>
                    </div>
                    <span className="text-3xl font-black text-emerald-500">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-[#0b2e63] text-white px-8 py-5 flex items-center justify-between gap-6">
            <div>
              <p className="text-2xl font-black">Entrenar tu cerebro es aprender más rápido, comprender mejor y alcanzar tu máximo potencial.</p>
              <p className="text-lg text-cyan-100 mt-1">En IQX te ayudamos a lograrlo.</p>
            </div>
            {surveyAnswers.length > 0 && (
              <div className="min-w-[420px] rounded-2xl bg-white/10 border border-white/15 p-4">
                <p className="font-black text-lg mb-2">Perfil Cognitivo IQX</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-white/60">Perfil:</span> <span className="font-semibold">{result.surveyProfile || "-"}</span></div>
                  <div><span className="text-white/60">Área clave:</span> <span className="font-semibold">{result.surveyMainNeed || "-"}</span></div>
                  <div><span className="text-white/60">Interés:</span> <span className="font-semibold">{result.surveyInterest || "-"}</span></div>
                  <div><span className="text-white/60">Puntaje:</span> <span className="font-semibold">{result.surveyScore ?? "-"}</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-[1fr_280px] gap-6 mt-6">
            <div className="rounded-[24px] bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-8 h-8 text-cyan-600" />
                <p className="text-2xl font-black">RECOMENDACIÓN IQX</p>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                Tu perfil muestra {result.categoriaLector === "LECTOR COMPETENTE" ? "un excelente potencial" : "oportunidades claras de crecimiento"}. Con entrenamiento cognitivo personalizado podrás mejorar tu comprensión, velocidad lectora y rendimiento académico o profesional.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-slate-500">Texto leído</p>
                  <p className="font-semibold mt-1">{result.readingTitle || "-"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-slate-500">Palabras</p>
                  <p className="font-semibold mt-1">{result.readingWordCount ?? "-"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-slate-500">Institución</p>
                  <p className="font-semibold mt-1">{result.institucion || "-"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] bg-white border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-40 h-40 rounded-2xl border-8 border-slate-200 bg-[linear-gradient(45deg,#0f172a_25%,transparent_25%,transparent_75%,#0f172a_75%,#0f172a),linear-gradient(45deg,#0f172a_25%,transparent_25%,transparent_75%,#0f172a_75%,#0f172a)] bg-[length:24px_24px] bg-[position:0_0,12px_12px]" />
              <p className="font-black text-lg mt-4">ESCANEA PARA CONOCER NUESTROS PROGRAMAS DE ENTRENAMIENTO</p>
              <p className="text-slate-500 text-sm mt-2">QR referencial para la versión visual del reporte.</p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] overflow-hidden bg-[#081735] text-white">
            <div className="grid grid-cols-[220px_1fr_220px] items-center">
              <div className="h-full bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.35),_transparent_60%)] p-6 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-cyan-300/50 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-cyan-300" />
                </div>
              </div>
              <div className="px-6 py-5 text-center">
                <p className="text-3xl font-black tracking-wide">TU MENTE TIENE UN POTENCIAL ILIMITADO.</p>
                <p className="text-3xl font-black text-cyan-300 mt-1">ENTRÉNALA. ACELÉRALA. TRANSFORMA TU FUTURO.</p>
                <div className="grid grid-cols-4 gap-3 mt-5 text-sm">
                  {["Neurociencia aplicada", "Entrenamiento cognitivo", "Resultados medibles", "Método X comprobado"].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 py-3 px-2 font-semibold">{item}</div>
                  ))}
                </div>
              </div>
              <div className="p-6 flex items-center justify-center">
                <img src={REPORT_LOGO_URL} alt="IQX" className="h-24 w-auto object-contain" />
              </div>
            </div>
            <div className="bg-white text-slate-700 px-8 py-4 flex items-center justify-between text-lg font-semibold">
              <span>www.iqexponencial.com</span>
              <span>SÍGUENOS EN REDES SOCIALES @iqexponencial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LECTOR_ORDER = ["LECTOR COMPETENTE", "LECTOR REGULAR", "LECTOR CON DIFICULTAD", "LECTOR CON DIFICULTAD SEVERA"];
const LECTOR_TEXT_COLORS: Record<string, string> = {
  "LECTOR COMPETENTE": "text-green-400",
  "LECTOR REGULAR": "text-yellow-400",
  "LECTOR CON DIFICULTAD": "text-orange-400",
  "LECTOR CON DIFICULTAD SEVERA": "text-red-400",
};

function GradoLectorReport({ filteredResults }: { filteredResults: QuizResult[] }) {
  const [expandedGrados, setExpandedGrados] = useState<Set<string>>(new Set());

  const { gradoData, totals, grandTotal } = useMemo(() => {
    const byGrado: Record<string, Record<string, number>> = {};
    const tots: Record<string, number> = {};
    let total = 0;

    filteredResults.forEach(r => {
      const grado = r.grado || "Sin grado";
      const cat = r.categoriaLector || "Sin clasificar";
      if (!byGrado[grado]) byGrado[grado] = {};
      byGrado[grado][cat] = (byGrado[grado][cat] || 0) + 1;
      tots[cat] = (tots[cat] || 0) + 1;
      total++;
    });

    const sorted = Object.entries(byGrado)
      .map(([grado, cats]) => ({
        grado,
        total: Object.values(cats).reduce((a, b) => a + b, 0),
        categories: cats,
      }))
      .sort((a, b) => b.total - a.total);

    return { gradoData: sorted, totals: tots, grandTotal: total };
  }, [filteredResults]);

  const toggleGrado = (grado: string) => {
    setExpandedGrados(prev => {
      const next = new Set(prev);
      if (next.has(grado)) next.delete(grado); else next.add(grado);
      return next;
    });
  };

  if (filteredResults.length === 0) return null;

  return (
    <div className="md:col-span-2 bg-black/30 rounded-xl p-4 border border-white/10" data-testid="panel-grado-lector-report">
      <h4 className="text-white font-bold text-sm mb-3">Reporte por Grado / Categoría Lector</h4>
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {gradoData.map(({ grado, total, categories }) => (
          <div key={grado}>
            <button
              onClick={() => toggleGrado(grado)}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
              data-testid={`button-toggle-grado-${grado}`}
            >
              <div className="flex items-center gap-2">
                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${expandedGrados.has(grado) ? "rotate-0" : "-rotate-90"}`} />
                <span className="text-white text-xs font-bold">{grado}</span>
              </div>
              <span className="text-cyan-400 font-bold text-xs">{total}</span>
            </button>
            {expandedGrados.has(grado) && (
              <div className="ml-6 mt-0.5 space-y-0.5">
                {LECTOR_ORDER.filter(cat => categories[cat]).map(cat => (
                  <div key={cat} className="flex justify-between px-3 py-1 rounded bg-black/20">
                    <span className={`text-[11px] ${LECTOR_TEXT_COLORS[cat] || "text-white/60"}`}>{cat.replace("LECTOR ", "")}</span>
                    <span className={`text-[11px] font-bold ${LECTOR_TEXT_COLORS[cat] || "text-white/60"}`}>{categories[cat]}</span>
                  </div>
                ))}
                {categories["Sin clasificar"] && (
                  <div className="flex justify-between px-3 py-1 rounded bg-black/20">
                    <span className="text-[11px] text-white/40">Sin clasificar</span>
                    <span className="text-[11px] font-bold text-white/40">{categories["Sin clasificar"]}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="flex justify-between px-3 py-1.5 bg-cyan-500/10 rounded-lg mb-1">
          <span className="text-white font-bold text-xs">Total general</span>
          <span className="text-cyan-400 font-bold text-xs">{grandTotal}</span>
        </div>
        <div className="space-y-0.5">
          {LECTOR_ORDER.filter(cat => totals[cat]).map(cat => (
            <div key={cat} className="flex justify-between px-3 py-1">
              <span className={`text-[11px] ${LECTOR_TEXT_COLORS[cat]}`}>{cat.replace("LECTOR ", "")}</span>
              <span className={`text-[11px] font-bold ${LECTOR_TEXT_COLORS[cat]}`}>{totals[cat]}</span>
            </div>
          ))}
          {totals["Sin clasificar"] && (
            <div className="flex justify-between px-3 py-1">
              <span className="text-[11px] text-white/40">Sin clasificar</span>
              <span className="text-[11px] font-bold text-white/40">{totals["Sin clasificar"]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  const [includeSurveyAnswersExport, setIncludeSurveyAnswersExport] = useState(false);
  const [includeReadingContentExport, setIncludeReadingContentExport] = useState(false);
  const [reportExportTarget, setReportExportTarget] = useState<QuizResult | null>(null);
  const [reportExportingId, setReportExportingId] = useState<string | null>(null);
  const columnSelectorRef = useRef<HTMLDivElement>(null);
  const reportCaptureRef = useRef<HTMLDivElement>(null);

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
        const created = parseDate(getCreatedAt(r));
        if (!created) return false;
        const createdDateStr = `${created.getFullYear()}-${String(created.getMonth()+1).padStart(2,"0")}-${String(created.getDate()).padStart(2,"0")}`;
        if (createdDateStr < dateFrom) return false;
      }
      if (dateTo) {
        const created = parseDate(getCreatedAt(r));
        if (!created) return false;
        const createdDateStr = `${created.getFullYear()}-${String(created.getMonth()+1).padStart(2,"0")}-${String(created.getDate()).padStart(2,"0")}`;
        if (createdDateStr > dateTo) return false;
      }

      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const fields = [r.nombre, r.email, r.institucion, r.grado, r.pais, r.estado, r.telefono, r.edad, r.profesion, r.ocupacion, r.semestre, r.readingTitle, r.readingContent, r.readingWordCount, r.readingTemaNumero];
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
      case "readingTitle": return r.readingTitle || "-";
      case "readingWordCount": return r.readingWordCount !== null && r.readingWordCount !== undefined ? String(r.readingWordCount) : "-";
      case "readingTemaNumero": return r.readingTemaNumero !== null && r.readingTemaNumero !== undefined ? String(r.readingTemaNumero) : "-";
      case "comprension": return r.comprension !== null ? `${r.comprension}%` : "-";
      case "velocidad": return r.velocidadLectura ? `${r.velocidadLectura} p/m` : "-";
      case "correctas": return `${r.respuestasCorrectas ?? "-"}/${r.respuestasTotales ?? "-"}`;
      case "categoriaLector": return r.categoriaLector || "-";
      case "surveyProfile": return r.surveyProfile || "-";
      case "surveyMainNeed": return r.surveyMainNeed || "-";
      case "surveyInterest": return r.surveyInterest || "-";
      case "surveyScore": return r.surveyScore !== null && r.surveyScore !== undefined ? String(r.surveyScore) : "-";
      case "grado": return r.grado || "-";
      case "institucion": return r.institucion || "-";
      case "semestre": return r.semestre || "-";
      case "edad": return r.edad || "-";
      case "email": return r.email || "-";
      case "telefono": return r.telefono || "-";
      case "pais": return r.pais || "-";
      case "estado": return r.estado || "-";
      case "fecha": return formatDate(getCreatedAt(r));
      default: return "-";
    }
  };

  const downloadExcel = () => {
    const exportColumns = Array.from(new Set<ColumnKey>([
      ...visibleColumns,
      "readingTitle",
      "readingWordCount",
      "readingTemaNumero",
      "surveyProfile",
      "surveyMainNeed",
      "surveyInterest",
      "surveyScore",
    ]));
    const surveyAnswerCount = includeSurveyAnswersExport
      ? Math.max(6, ...filteredResults.map((r) => parseSurveyAnswers(r.surveyAnswers).length), 0)
      : 0;
    const headers = exportColumns.map(c => ALL_COLUMNS.find(ac => ac.key === c)?.label || c);
    const surveyHeaders = includeSurveyAnswersExport
      ? Array.from({ length: surveyAnswerCount }, (_, idx) => [`Encuesta P${idx + 1}`, `Respuesta P${idx + 1}`]).flat()
      : [];
    const readingContentHeaders = includeReadingContentExport ? ["Texto completo leido"] : [];
    const rows = filteredResults.map(r => {
      const baseRow = exportColumns.map(c => getCellValue(r, c));
      if (!includeSurveyAnswersExport && !includeReadingContentExport) return baseRow;
      const answers = parseSurveyAnswers(r.surveyAnswers);
      const surveyRow = Array.from({ length: surveyAnswerCount }, (_, idx) => {
        const answer = answers[idx];
        return [answer?.question || "-", answer?.answer || "-"];
      }).flat();
      const readingContentRow = includeReadingContentExport ? [r.readingContent || "-"] : [];
      return [...baseRow, ...surveyRow, ...readingContentRow];
    });
    const allHeaders = [...headers, ...surveyHeaders, ...readingContentHeaders];
    const ws = XLSX.utils.aoa_to_sheet([allHeaders, ...rows]);

    const colWidths = allHeaders.map((h, i) => {
      const maxLen = Math.max(h.length, ...rows.map(row => String(row[i] || "").length));
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

    filterInfo.push(`Encuesta completa: ${includeSurveyAnswersExport ? "Si" : "No"}`);
    filterInfo.push(`Texto completo: ${includeReadingContentExport ? "Si" : "No"}`);

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

  const downloadStudentReport = async (result: QuizResult) => {
    try {
      setReportExportingId(result.id);
      setReportExportTarget(result);
      await new Promise((resolve) => setTimeout(resolve, 80));
      const node = reportCaptureRef.current;
      if (!node) throw new Error("No se pudo preparar el reporte.");
      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1);
      link.download = `reporte-iqx-${(result.nombre || "alumno").replace(/\s+/g, "-").toLowerCase()}.png`;
      link.click();
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo generar el reporte.");
    } finally {
      setReportExportingId(null);
    }
  };

  const selectClass = "bg-black/60 border border-white/20 text-white text-xs rounded-lg px-3 py-2 w-full focus:border-cyan-400 focus:outline-none appearance-none";

  return (
    <Card className="bg-black/40 border-green-500/30" data-testid="card-resultados-lectura">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-bold text-lg">Resultados de Lectura</h3>
            <span className="text-white/50 text-sm">({filteredResults.length})</span>
          </div>
          <div className="flex items-start gap-3 flex-wrap justify-end">
            <div className="flex items-center gap-2 flex-wrap rounded-xl border border-white/10 bg-black/20 px-2 py-2">
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
                Graficos
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
            </div>

            <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-green-300/80">Exportacion</span>
                <Button
                  onClick={downloadExcel}
                  variant="outline"
                  size="sm"
                  className="border-green-500/30 text-green-400 gap-1"
                  data-testid="button-download-excel"
                >
                  <Download className="w-3 h-3" />
                  Exportar Excel
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="flex items-center gap-2 text-xs text-white/80 px-3 py-2 rounded-lg border border-white/10 bg-black/20 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeSurveyAnswersExport}
                          onChange={(e) => setIncludeSurveyAnswersExport(e.target.checked)}
                          className="rounded border-white/30 bg-black/40 text-green-500 focus:ring-green-500"
                          data-testid="checkbox-include-survey-export"
                        />
                        <span>Encuesta completa</span>
                      </label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs border-white/10 bg-slate-900 text-white">
                      Agrega las preguntas y respuestas de la encuesta al archivo exportado.
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="flex items-center gap-2 text-xs text-white/80 px-3 py-2 rounded-lg border border-white/10 bg-black/20 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeReadingContentExport}
                          onChange={(e) => setIncludeReadingContentExport(e.target.checked)}
                          className="rounded border-white/30 bg-black/40 text-green-500 focus:ring-green-500"
                          data-testid="checkbox-include-reading-content-export"
                        />
                        <span>Texto leido completo</span>
                      </label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs border-white/10 bg-slate-900 text-white">
                      Agrega el contenido completo del texto leido dentro del Excel exportado.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
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
                    <DateFilterInput
                      label="Fecha desde"
                      value={dateFrom}
                      onChange={setDateFrom}
                      inputTestId="input-date-from"
                    />
                  </div>
                  <span className="text-white/30 text-xs font-medium">a</span>
                  <div className="relative flex-1">
                    <DateFilterInput
                      label="Fecha hasta"
                      value={dateTo}
                      onChange={setDateTo}
                      inputTestId="input-date-to"
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
                  <RechartsTooltip
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
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value, cx, cy, midAngle, outerRadius: oR }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = oR + 18;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill="#ffffffcc" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={9}>
                          {`${name}: ${value}`}
                        </text>
                      );
                    }}
                  >
                    {chartPieData.map((_entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#0e7490", border: "1px solid rgba(6,182,212,0.4)", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="md:col-span-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 text-center">
                <div className="bg-black/30 rounded-lg p-2 md:p-3">
                  <div className="text-cyan-400 font-bold text-lg md:text-2xl">
                    {filteredResults.length > 0
                      ? Math.round(filteredResults.reduce((s, r) => s + (r.comprension || 0), 0) / filteredResults.filter(r => r.comprension !== null).length || 0)
                      : 0}%
                  </div>
                  <div className="text-white/50 text-[10px] md:text-xs">Comprensión</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 md:p-3">
                  <div className="text-purple-400 font-bold text-lg md:text-2xl">
                    {filteredResults.length > 0
                      ? Math.round(filteredResults.reduce((s, r) => s + (r.velocidadLectura || 0), 0) / filteredResults.filter(r => r.velocidadLectura !== null).length || 0)
                      : 0}
                  </div>
                  <div className="text-white/50 text-[10px] md:text-xs">Velocidad</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 md:p-3">
                  <div className="text-green-400 font-bold text-lg md:text-2xl">
                    {filteredResults.filter(r => r.categoriaLector === "LECTOR COMPETENTE").length}
                  </div>
                  <div className="text-white/50 text-[10px] md:text-xs">Competente</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 md:p-3">
                  <div className="text-blue-400 font-bold text-lg md:text-2xl">
                    {filteredResults.filter(r => r.categoriaLector === "LECTOR REGULAR").length}
                  </div>
                  <div className="text-white/50 text-[10px] md:text-xs">Regular</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 md:p-3">
                  <div className="text-yellow-400 font-bold text-lg md:text-2xl">
                    {filteredResults.filter(r => r.categoriaLector === "LECTOR CON DIFICULTAD").length}
                  </div>
                  <div className="text-white/50 text-[10px] md:text-xs">Dificultad</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 md:p-3">
                  <div className="text-red-400 font-bold text-lg md:text-2xl">
                    {filteredResults.filter(r => r.categoriaLector === "LECTOR CON DIFICULTAD SEVERA").length}
                  </div>
                  <div className="text-white/50 text-[10px] md:text-xs">Dif. Severa</div>
                </div>
              </div>
            </div>

            <GradoLectorReport filteredResults={filteredResults} />
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
                        {(r.surveyProfile || r.surveyMainNeed || r.surveyAnswers) && (
                          <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg p-4 mb-3 border border-purple-500/20">
                            <h4 className="text-purple-300 font-bold mb-3 text-sm">Perfil Cognitivo IQX</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-center">
                              <div className="bg-black/30 rounded-lg p-2">
                                <div className="text-purple-300 font-bold text-sm">{r.surveyProfile || "-"}</div>
                                <div className="text-white/50 text-xs">Perfil</div>
                              </div>
                              <div className="bg-black/30 rounded-lg p-2">
                                <div className="text-cyan-300 font-bold text-sm">{r.surveyMainNeed || "-"}</div>
                                <div className="text-white/50 text-xs">Area clave</div>
                              </div>
                              <div className="bg-black/30 rounded-lg p-2">
                                <div className="text-green-300 font-bold text-sm">{r.surveyScore ?? "-"}</div>
                                <div className="text-white/50 text-xs">Puntaje</div>
                              </div>
                              <div className="bg-black/30 rounded-lg p-2">
                                <div className="text-yellow-300 font-bold text-sm">{r.surveyInterest || "-"}</div>
                                <div className="text-white/50 text-xs">Interes</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {parseSurveyAnswers(r.surveyAnswers).map((answer, idx) => (
                                <div key={idx} className="bg-black/20 rounded px-3 py-2">
                                  <p className="text-white/50 text-[11px]">{idx + 1}. {answer.question}</p>
                                  <p className="text-white/85 text-xs font-semibold">{answer.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div className="col-span-2 md:col-span-4"><span className="text-white/50">Texto leido:</span> <span className="text-cyan-300">{r.readingTitle || "-"}</span></div>
                          <div><span className="text-white/50">Tema:</span> <span className="text-white/80">{r.readingTemaNumero ?? "-"}</span></div>
                          <div><span className="text-white/50">Palabras:</span> <span className="text-white/80">{r.readingWordCount ?? "-"}</span></div>
                          <div><span className="text-white/50">Idioma:</span> <span className="text-white/80">{r.readingLang || "-"}</span></div>
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
                          {r.readingContent && <div className="col-span-2 md:col-span-4"><span className="text-white/50">Contenido leido:</span> <span className="text-white/80 whitespace-pre-line">{r.readingContent}</span></div>}
                          {r.comentario && <div className="col-span-2 md:col-span-4"><span className="text-white/50">Comentario:</span> <span className="text-white/80">{r.comentario}</span></div>}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadStudentReport(r);
                            }}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                            {reportExportingId === r.id ? "Generando reporte..." : "Descargar reporte IQX"}
                          </Button>
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
                  <p className="text-white/50">Texto leido: <span className="text-cyan-300">{r.readingTitle || "-"}</span></p>
                  <p className="text-white/50">Tema: <span className="text-white/80">{r.readingTemaNumero ?? "-"}</span></p>
                  <p className="text-white/50">Palabras: <span className="text-white/80">{r.readingWordCount ?? "-"}</span></p>
                  <p className="text-white/50">Idioma: <span className="text-white/80">{r.readingLang || "-"}</span></p>
                  <p className="text-white/50">Email: <span className="text-white/80">{r.email || "-"}</span></p>
                  <p className="text-white/50">Edad: <span className="text-white/80">{r.edad || "-"}</span></p>
                  <p className="text-white/50">Teléfono: <span className="text-white/80">{r.telefono || "-"}</span></p>
                  <p className="text-white/50">País: <span className="text-white/80">{r.pais || "-"}</span></p>
                  <p className="text-white/50">Estado: <span className="text-white/80">{r.estado || r.ciudad || "-"}</span></p>
                  <p className="text-white/50">Grado: <span className="text-yellow-400">{r.grado || "-"}</span></p>
                  <p className="text-white/50">Institución: <span className="text-cyan-400">{r.institucion || "-"}</span></p>
                  {(r.surveyProfile || r.surveyMainNeed || r.surveyAnswers) && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg p-3 border border-purple-500/20">
                      <p className="text-purple-300 font-bold text-xs mb-2">Perfil Cognitivo IQX</p>
                      <div className="grid grid-cols-2 gap-2 text-center mb-2">
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-purple-300 font-bold text-xs">{r.surveyProfile || "-"}</div>
                          <div className="text-white/50 text-[10px]">Perfil</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-cyan-300 font-bold text-xs">{r.surveyMainNeed || "-"}</div>
                          <div className="text-white/50 text-[10px]">Area clave</div>
                        </div>
                      </div>
                      <p className="text-white/60 text-xs">Interes: <span className="text-yellow-300">{r.surveyInterest || "-"}</span></p>
                    </div>
                  )}
                  {r.semestre && <p className="text-white/50">Semestre: <span className="text-purple-400">{r.semestre}</span></p>}
                  {r.profesion && <p className="text-white/50">Profesión: <span className="text-green-400">{r.profesion}</span></p>}
                  {r.ocupacion && <p className="text-white/50">Ocupación: <span className="text-green-400">{r.ocupacion}</span></p>}
                  {r.lugarTrabajo && <p className="text-white/50">Lugar Trabajo: <span className="text-green-400">{r.lugarTrabajo}</span></p>}
                  {r.readingContent && <p className="text-white/50">Contenido leido: <span className="text-white/80 whitespace-pre-line">{r.readingContent}</span></p>}
                  {r.comentario && <p className="text-white/50">Comentario: <span className="text-white/80">{r.comentario}</span></p>}
                  <p className="text-white/50">Fecha: <span className="text-white/60">{formatDate(getCreatedAt(r))}</span></p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadStudentReport(r);
                    }}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-2"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                    {reportExportingId === r.id ? "Generando reporte..." : "Descargar reporte IQX"}
                  </Button>
                </div>
              )}
            </div>
          ))}
          {filteredResults.length === 0 && (
            <div className="py-8 text-center text-white/40">No hay resultados {hasActiveFilters ? "con los filtros aplicados" : "registrados"}</div>
          )}
        </div>
        {reportExportTarget && (
          <div className="fixed -left-[99999px] top-0 pointer-events-none" aria-hidden="true">
            <div ref={reportCaptureRef}>
              <StudentIQXReport result={reportExportTarget} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
