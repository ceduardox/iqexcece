import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Monitor, Smartphone, Globe, Clock, LogOut, RefreshCw, FileText, BookOpen, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Session {
  id: string;
  sessionId: string;
  ip: string | null;
  device: string | null;
  browser: string | null;
  isPwa: boolean;
  ageGroup: string | null;
  selectedProblems: string[] | null;
  isActive: boolean;
  isCurrentlyActive: boolean;
  lastActivity: string | null;
  createdAt: string | null;
}

interface SessionsData {
  total: number;
  activeCount: number;
  sessions: Session[];
}

interface QuizResult {
  id: string;
  nombre: string;
  email: string | null;
  edad: string | null;
  ciudad: string | null;
  telefono: string | null;
  comentario: string | null;
  categoria: string | null;
  tiempoLectura: number | null;
  tiempoCuestionario: number | null;
  isPwa: boolean;
  createdAt: string | null;
}

export default function GestionPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem("adminUser") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("adminPass") || "");
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("adminUser"));
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [data, setData] = useState<SessionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"sesiones" | "resultados" | "contenido">("sesiones");
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [resultFilter, setResultFilter] = useState<"all" | "preescolar" | "ninos">("preescolar");
  const [contentCategory, setContentCategory] = useState<"preescolar" | "ninos">("preescolar");
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  
  const defaultPreescolar = {
    title: "Paseando con mi perrito",
    content: "Mariana tiene un perrito café llamado Pipo. Un día lo llevó al parque a pasear. Mientras jugaban, el perrito se escapó. Mariana lo buscó mucho. Al final, lo encontró escondido detrás del kiosco comiendo un helado que alguien había dejado.",
    imageUrl: "https://img.freepik.com/free-vector/cute-girl-walking-dog-cartoon-vector-icon-illustration_138676-2600.jpg",
    pageMainImage: "https://img.freepik.com/free-vector/happy-cute-kid-boy-ready-go-school_97632-4315.jpg",
    pageSmallImage: "https://img.freepik.com/free-vector/cute-book-reading-cartoon-vector-icon-illustration-education-object-icon-concept-isolated_138676-5765.jpg",
    categoryImage: "https://img.freepik.com/free-vector/happy-cute-kid-boy-girl-smile-with-book_97632-5631.jpg",
    questions: [
      { question: "¿qué se llamaba la niña?", options: ["Marcela", "Matilde", "Mariana"], correct: 2 },
      { question: "¿de que color es su perrito?", options: ["Negro", "Café", "Azul"], correct: 1 },
      { question: "¿Donde lo llevaba a pasear?", options: ["Parque", "Jardin", "Plaza"], correct: 0 },
      { question: "¿Dónde lo encontro al perrito?", options: ["Casa", "Calle", "Kiosco"], correct: 2 },
    ]
  };
  
  const defaultNinos = {
    title: "LA HISTORIA DEL CHOCOLATE - A Leer Bolivia 2025 - 6to. Primaria",
    content: "El chocolate es uno de los alimentos más populares del mundo. Su historia comenzó hace miles de años en las selvas de América Central y del Sur, donde los antiguos mayas y aztecas cultivaban el cacao. Los aztecas preparaban una bebida amarga llamada 'xocolatl' que consideraban sagrada. Cuando los españoles llegaron a América, llevaron el cacao a Europa donde le añadieron azúcar para hacerlo más dulce. Así nació el chocolate que conocemos hoy. Bolivia es uno de los países productores de cacao de alta calidad, especialmente en la región del Beni.",
    imageUrl: "https://img.freepik.com/free-vector/chocolate-bar-pieces-realistic-composition_1284-19023.jpg",
    pageMainImage: "https://img.freepik.com/free-vector/cute-girl-back-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
    pageSmallImage: "https://img.freepik.com/free-vector/cute-astronaut-reading-book-cartoon-vector-icon-illustration-science-education-icon-isolated_138676-5765.jpg",
    categoryImage: "https://img.freepik.com/free-vector/cute-girl-back-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
    questions: [
      { question: "¿Dónde comenzó la historia del chocolate?", options: ["Europa", "América Central y del Sur", "Asia"], correct: 1 },
      { question: "¿Cómo se llamaba la bebida azteca de cacao?", options: ["Chocolate", "Xocolatl", "Cacahuatl"], correct: 1 },
      { question: "¿Qué le añadieron los europeos al cacao?", options: ["Sal", "Azúcar", "Leche"], correct: 1 },
      { question: "¿En qué región de Bolivia se produce cacao de alta calidad?", options: ["La Paz", "Beni", "Potosí"], correct: 1 },
    ]
  };

  const [editContentPreescolar, setEditContentPreescolar] = useState(defaultPreescolar);
  const [editContentNinos, setEditContentNinos] = useState(defaultNinos);
  const [saving, setSaving] = useState(false);
  
  const currentEditContent = contentCategory === "preescolar" ? editContentPreescolar : editContentNinos;
  const setCurrentEditContent = contentCategory === "preescolar" ? setEditContentPreescolar : setEditContentNinos;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      if (res.ok) {
        const { token } = await res.json();
        setToken(token);
        setIsLoggedIn(true);
        localStorage.setItem("adminToken", token);
        if (rememberMe) {
          localStorage.setItem("adminUser", username);
          localStorage.setItem("adminPass", password);
        } else {
          localStorage.removeItem("adminUser");
          localStorage.removeItem("adminPass");
        }
      } else {
        setError("Credenciales incorrectas");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  const fetchSessions = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setData(data);
      }
    } catch {
      console.error("Error fetching sessions");
    }
    
    setLoading(false);
  };

  const fetchQuizResults = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/quiz-results", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { results } = await res.json();
        setQuizResults(results);
      }
    } catch {
      console.error("Error fetching quiz results");
    }
  };

  const handleSaveContent = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/reading", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          categoria: contentCategory,
          title: currentEditContent.title,
          content: currentEditContent.content,
          imageUrl: currentEditContent.imageUrl,
          pageMainImage: currentEditContent.pageMainImage,
          pageSmallImage: currentEditContent.pageSmallImage,
          categoryImage: currentEditContent.categoryImage,
          questions: JSON.stringify(currentEditContent.questions),
        }),
      });
      alert("Contenido guardado correctamente");
    } catch {
      alert("Error al guardar");
    }
    setSaving(false);
  };
  
  const filteredResults = quizResults.filter(r => {
    if (resultFilter === "all") return true;
    return r.categoria === resultFilter;
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken("");
    localStorage.removeItem("adminToken");
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchSessions();
      fetchQuizResults();
      const interval = setInterval(() => {
        fetchSessions();
        fetchQuizResults();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (isLoggedIn) {
      const loadContent = async () => {
        try {
          const [preescolarRes, ninosRes] = await Promise.all([
            fetch("/api/reading/preescolar"),
            fetch("/api/reading/ninos"),
          ]);
          const preescolarData = await preescolarRes.json();
          const ninosData = await ninosRes.json();
          
          if (preescolarData.content) {
            const c = preescolarData.content;
            setEditContentPreescolar({
              title: c.title || defaultPreescolar.title,
              content: c.content || defaultPreescolar.content,
              imageUrl: c.imageUrl || defaultPreescolar.imageUrl,
              pageMainImage: c.pageMainImage || defaultPreescolar.pageMainImage,
              pageSmallImage: c.pageSmallImage || defaultPreescolar.pageSmallImage,
              categoryImage: c.categoryImage || defaultPreescolar.categoryImage,
              questions: c.questions ? JSON.parse(c.questions) : defaultPreescolar.questions,
            });
          }
          if (ninosData.content) {
            const c = ninosData.content;
            setEditContentNinos({
              title: c.title || defaultNinos.title,
              content: c.content || defaultNinos.content,
              imageUrl: c.imageUrl || defaultNinos.imageUrl,
              pageMainImage: c.pageMainImage || defaultNinos.pageMainImage,
              pageSmallImage: c.pageSmallImage || defaultNinos.pageSmallImage,
              categoryImage: c.categoryImage || defaultNinos.categoryImage,
              questions: c.questions ? JSON.parse(c.questions) : defaultNinos.questions,
            });
          }
        } catch {}
      };
      loadContent();
    }
  }, [isLoggedIn]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("es-ES");
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getAgeLabel = (age: string | null) => {
    const labels: Record<string, string> = {
      ninos: "Niños",
      adolescentes: "Adolescentes",
      universitarios: "Universitarios",
      profesionales: "Profesionales",
      adulto_mayor: "Adulto Mayor",
    };
    return age ? labels[age] || age : "-";
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Panel de Gestión
              </CardTitle>
              <p className="text-cyan-400 text-sm">IQEXPONENCIAL</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  data-testid="input-admin-username"
                />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  data-testid="input-admin-password"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500"
                    data-testid="checkbox-remember-me"
                  />
                  <span className="text-white/70 text-sm">Guardar datos de acceso</span>
                </label>
                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  data-testid="button-admin-login"
                >
                  Ingresar
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <aside className="w-64 bg-black/40 border-r border-white/10 p-4 hidden md:flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Panel de Gestión</h1>
          <p className="text-cyan-400 text-sm">IQxponencial</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("sesiones")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "sesiones" ? "bg-cyan-600 text-white" : "text-cyan-400 hover:bg-white/10"
            }`}
            data-testid="sidebar-sesiones"
          >
            <Users className="w-5 h-5" />
            Sesiones
          </button>
          <button
            onClick={() => setActiveTab("resultados")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "resultados" ? "bg-green-600 text-white" : "text-green-400 hover:bg-white/10"
            }`}
            data-testid="sidebar-resultados"
          >
            <FileText className="w-5 h-5" />
            Resultados
          </button>
          <button
            onClick={() => setActiveTab("contenido")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "contenido" ? "bg-orange-600 text-white" : "text-orange-400 hover:bg-white/10"
            }`}
            data-testid="sidebar-contenido"
          >
            <BookOpen className="w-5 h-5" />
            Contenido
          </button>
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
          <Button
            onClick={() => { fetchSessions(); fetchQuizResults(); }}
            variant="outline"
            className="w-full border-cyan-500/30 text-cyan-400"
            disabled={loading}
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-500/30 text-red-400"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </aside>

      <div className="flex-1 p-4 overflow-auto">
        <div className="md:hidden flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-white">Panel de Gestión</h1>
            <p className="text-cyan-400 text-xs">IQxponencial</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => { fetchSessions(); fetchQuizResults(); }}
              variant="outline"
              size="icon"
              className="border-cyan-500/30 text-cyan-400"
              disabled={loading}
              data-testid="button-mobile-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="icon"
              className="border-red-500/30 text-red-400"
              data-testid="button-mobile-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            onClick={() => setActiveTab("sesiones")}
            variant={activeTab === "sesiones" ? "default" : "outline"}
            size="sm"
            className={activeTab === "sesiones" ? "bg-cyan-600" : "border-cyan-500/30 text-cyan-400"}
            data-testid="mobile-tab-sesiones"
          >
            <Users className="w-4 h-4 mr-1" />
            Sesiones
          </Button>
          <Button
            onClick={() => setActiveTab("resultados")}
            variant={activeTab === "resultados" ? "default" : "outline"}
            size="sm"
            className={activeTab === "resultados" ? "bg-green-600" : "border-green-500/30 text-green-400"}
            data-testid="mobile-tab-resultados"
          >
            <FileText className="w-4 h-4 mr-1" />
            Resultados
          </Button>
          <Button
            onClick={() => setActiveTab("contenido")}
            variant={activeTab === "contenido" ? "default" : "outline"}
            size="sm"
            className={activeTab === "contenido" ? "bg-orange-600" : "border-orange-500/30 text-orange-400"}
            data-testid="mobile-tab-contenido"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Contenido
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">

        {activeTab === "sesiones" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-black/40 border-green-500/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-400 text-2xl font-bold">{data?.activeCount || 0}</p>
                    <p className="text-white/60 text-xs">Usuarios Activos</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 border-cyan-500/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-cyan-400 text-2xl font-bold">{data?.total || 0}</p>
                    <p className="text-white/60 text-xs">Total Sesiones</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 border-purple-500/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-purple-400 text-2xl font-bold">
                      {data?.sessions.filter(s => s.isPwa).length || 0}
                    </p>
                    <p className="text-white/60 text-xs">Desde PWA</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 border-orange-500/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-orange-400 text-2xl font-bold">
                      {data?.sessions.filter(s => !s.isPwa).length || 0}
                    </p>
                    <p className="text-white/60 text-xs">Desde Navegador</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/40 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Sesiones de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/60 border-b border-white/10">
                        <th className="pb-3 px-2">Estado</th>
                        <th className="pb-3 px-2">IP</th>
                        <th className="pb-3 px-2">Dispositivo</th>
                        <th className="pb-3 px-2">Navegador</th>
                        <th className="pb-3 px-2">Tipo</th>
                        <th className="pb-3 px-2">Edad</th>
                        <th className="pb-3 px-2">Última Actividad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.sessions.map((session) => (
                        <tr key={session.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              session.isCurrentlyActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                session.isCurrentlyActive ? "bg-green-400 animate-pulse" : "bg-gray-400"
                              }`} />
                              {session.isCurrentlyActive ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-white/80 font-mono text-xs">{session.ip || "-"}</td>
                          <td className="py-3 px-2 text-white/80">{session.device || "-"}</td>
                          <td className="py-3 px-2 text-white/80">{session.browser || "-"}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              session.isPwa ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"
                            }`}>
                              {session.isPwa ? "PWA" : "Web"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-white/80">{getAgeLabel(session.ageGroup)}</td>
                          <td className="py-3 px-2 text-white/60 text-xs">{formatDate(session.lastActivity)}</td>
                        </tr>
                      ))}
                      {(!data?.sessions || data.sessions.length === 0) && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-white/40">
                            No hay sesiones registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-2">
                  {data?.sessions.map((session) => (
                    <div key={session.id} className="bg-white/5 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                        className="w-full p-3 flex items-center justify-between text-left"
                        data-testid={`button-expand-session-${session.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${session.isCurrentlyActive ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
                          <span className="text-white font-medium text-sm">{session.device || "Dispositivo"}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${session.isPwa ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                            {session.isPwa ? "PWA" : "Web"}
                          </span>
                        </div>
                        <svg className={`w-5 h-5 text-white/60 transition-transform ${expandedSession === session.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedSession === session.id && (
                        <div className="px-3 pb-3 space-y-1 text-sm border-t border-white/10">
                          <p className="text-white/60 pt-2">Estado: <span className={session.isCurrentlyActive ? "text-green-400" : "text-gray-400"}>{session.isCurrentlyActive ? "Activo" : "Inactivo"}</span></p>
                          <p className="text-white/60">IP: <span className="text-white/80 font-mono text-xs">{session.ip || "-"}</span></p>
                          <p className="text-white/60">Navegador: <span className="text-white/80">{session.browser || "-"}</span></p>
                          <p className="text-white/60">Edad: <span className="text-white/80">{getAgeLabel(session.ageGroup)}</span></p>
                          <p className="text-white/60">Última Actividad: <span className="text-white/60">{formatDate(session.lastActivity)}</span></p>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!data?.sessions || data.sessions.length === 0) && (
                    <div className="py-8 text-center text-white/40">
                      No hay sesiones registradas
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "resultados" && (
          <Card className="bg-black/40 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 flex-wrap">
                <FileText className="w-5 h-5 text-green-400" />
                Resultados de Tests ({filteredResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                  onClick={() => setResultFilter("preescolar")}
                  variant={resultFilter === "preescolar" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "preescolar" ? "bg-orange-600" : "border-orange-500/30 text-orange-400"}
                  data-testid="button-filter-preescolar"
                >
                  Pre-escolar
                </Button>
                <Button
                  onClick={() => setResultFilter("ninos")}
                  variant={resultFilter === "ninos" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "ninos" ? "bg-purple-600" : "border-purple-500/30 text-purple-400"}
                  data-testid="button-filter-ninos"
                >
                  Niños
                </Button>
                <Button
                  onClick={() => setResultFilter("all")}
                  variant={resultFilter === "all" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "all" ? "bg-cyan-600" : "border-cyan-500/30 text-cyan-400"}
                  data-testid="button-filter-all"
                >
                  Todos
                </Button>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-white/60 border-b border-white/10">
                      <th className="pb-3 px-2">Nombre</th>
                      <th className="pb-3 px-2">Email</th>
                      <th className="pb-3 px-2">Edad</th>
                      <th className="pb-3 px-2">Ciudad</th>
                      <th className="pb-3 px-2">Teléfono</th>
                      <th className="pb-3 px-2">T. Lectura</th>
                      <th className="pb-3 px-2">T. Test</th>
                      <th className="pb-3 px-2">Tipo</th>
                      <th className="pb-3 px-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2 text-white">{r.nombre}</td>
                        <td className="py-3 px-2 text-white/80">{r.email || "-"}</td>
                        <td className="py-3 px-2 text-white/80">{r.edad || "-"}</td>
                        <td className="py-3 px-2 text-white/80">{r.ciudad || "-"}</td>
                        <td className="py-3 px-2 text-white/80">{r.telefono || "-"}</td>
                        <td className="py-3 px-2 text-cyan-400">{formatTime(r.tiempoLectura)}</td>
                        <td className="py-3 px-2 text-purple-400">{formatTime(r.tiempoCuestionario)}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs ${r.isPwa ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                            {r.isPwa ? "PWA" : "Web"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-white/60 text-xs">{formatDate(r.createdAt)}</td>
                      </tr>
                    ))}
                    {filteredResults.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-white/40">
                          No hay resultados registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2">
                {filteredResults.map((r) => (
                  <div key={r.id} className="bg-white/5 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                      className="w-full p-3 flex items-center justify-between text-left"
                      data-testid={`button-expand-${r.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{r.nombre}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${r.isPwa ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                          {r.isPwa ? "PWA" : "Web"}
                        </span>
                      </div>
                      <svg className={`w-5 h-5 text-white/60 transition-transform ${expandedResult === r.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedResult === r.id && (
                      <div className="px-3 pb-3 space-y-1 text-sm border-t border-white/10">
                        <p className="text-white/60 pt-2">Email: <span className="text-white/80">{r.email || "-"}</span></p>
                        <p className="text-white/60">Edad: <span className="text-white/80">{r.edad || "-"}</span></p>
                        <p className="text-white/60">Ciudad: <span className="text-white/80">{r.ciudad || "-"}</span></p>
                        <p className="text-white/60">Teléfono: <span className="text-white/80">{r.telefono || "-"}</span></p>
                        <p className="text-white/60">T. Lectura: <span className="text-cyan-400">{formatTime(r.tiempoLectura)}</span></p>
                        <p className="text-white/60">T. Test: <span className="text-purple-400">{formatTime(r.tiempoCuestionario)}</span></p>
                        <p className="text-white/60">Fecha: <span className="text-white/60">{formatDate(r.createdAt)}</span></p>
                      </div>
                    )}
                  </div>
                ))}
                {filteredResults.length === 0 && (
                  <div className="py-8 text-center text-white/40">
                    No hay resultados registrados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "contenido" && (
          <Card className="bg-black/40 border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-400" />
                Editar Contenido de Lectura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setContentCategory("preescolar")}
                  variant={contentCategory === "preescolar" ? "default" : "outline"}
                  className={contentCategory === "preescolar" ? "bg-orange-600" : "border-orange-500/30 text-orange-400"}
                  data-testid="button-content-preescolar"
                >
                  Pre-escolar
                </Button>
                <Button
                  onClick={() => setContentCategory("ninos")}
                  variant={contentCategory === "ninos" ? "default" : "outline"}
                  className={contentCategory === "ninos" ? "bg-purple-600" : "border-purple-500/30 text-purple-400"}
                  data-testid="button-content-ninos"
                >
                  Niños
                </Button>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1 block">Título de la lectura</label>
                <Input
                  value={currentEditContent.title}
                  onChange={(e) => setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div>
                <label className="text-white/60 text-sm mb-1 block">Texto de la lectura</label>
                <textarea
                  value={currentEditContent.content}
                  onChange={(e) => setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, content: e.target.value }))}
                  rows={4}
                  className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white resize-none"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1 block">URL de imagen de lectura</label>
                <Input
                  value={currentEditContent.imageUrl}
                  onChange={(e) => setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, imageUrl: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="input-content-image"
                />
                {currentEditContent.imageUrl && (
                  <img src={currentEditContent.imageUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                )}
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-white font-semibold mb-3">Imágenes de página de selección</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Imagen principal (grande)</label>
                    <Input
                      value={currentEditContent.pageMainImage || ""}
                      onChange={(e) => setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, pageMainImage: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      data-testid="input-page-main-image"
                    />
                    {currentEditContent.pageMainImage && (
                      <img src={currentEditContent.pageMainImage} alt="Main" className="mt-2 w-24 h-24 object-cover rounded-lg" />
                    )}
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Imagen pequeña (flotante)</label>
                    <Input
                      value={currentEditContent.pageSmallImage || ""}
                      onChange={(e) => setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, pageSmallImage: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      data-testid="input-page-small-image"
                    />
                    {currentEditContent.pageSmallImage && (
                      <img src={currentEditContent.pageSmallImage} alt="Small" className="mt-2 w-16 h-16 object-cover rounded-lg" />
                    )}
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Imagen de categoría (selección)</label>
                    <Input
                      value={currentEditContent.categoryImage || ""}
                      onChange={(e) => setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, categoryImage: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Imagen que se muestra en la selección de categoría"
                      data-testid="input-category-image"
                    />
                    {currentEditContent.categoryImage && (
                      <img src={currentEditContent.categoryImage} alt="Category" className="mt-2 w-20 h-20 object-cover rounded-full" />
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-white font-semibold mb-3">Preguntas del cuestionario</h3>
                {currentEditContent.questions.map((q: { question: string; options: string[]; correct: number }, qi: number) => (
                  <div key={qi} className="mb-4 p-3 bg-white/5 rounded-lg">
                    <label className="text-orange-400 text-sm mb-1 block">Pregunta {qi + 1}</label>
                    <Input
                      value={q.question}
                      onChange={(e) => {
                        const newQ = [...currentEditContent.questions];
                        newQ[qi].question = e.target.value;
                        setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                      }}
                      className="bg-white/10 border-white/20 text-white mb-2"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {q.options.map((opt: string, oi: number) => (
                        <div key={oi}>
                          <label className="text-white/40 text-xs">Opción {oi + 1}</label>
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newQ = [...currentEditContent.questions];
                              newQ[qi].options[oi] = e.target.value;
                              setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                            }}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <label className="text-white/40 text-xs">Respuesta correcta (0, 1, 2)</label>
                      <Input
                        type="number"
                        min={0}
                        max={2}
                        value={q.correct}
                        onChange={(e) => {
                          const newQ = [...currentEditContent.questions];
                          newQ[qi].correct = parseInt(e.target.value) || 0;
                          setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                        }}
                        className="bg-white/10 border-white/20 text-white w-20"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveContent}
                disabled={saving}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : `Guardar ${contentCategory === "preescolar" ? "Pre-escolar" : "Niños"}`}
              </Button>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
