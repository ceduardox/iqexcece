import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Monitor, Smartphone, Globe, Clock, LogOut, RefreshCw } from "lucide-react";
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

export default function GestionPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [data, setData] = useState<SessionsData | null>(null);
  const [loading, setLoading] = useState(false);

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
      const interval = setInterval(fetchSessions, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, token]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("es-ES");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Gestión</h1>
            <p className="text-cyan-400 text-sm">IQEXPONENCIAL</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchSessions}
              variant="outline"
              size="icon"
              className="border-cyan-500/30 text-cyan-400"
              disabled={loading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/30 text-red-400"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Sessions Table */}
        <Card className="bg-black/40 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Sesiones de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                    <tr 
                      key={session.id} 
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-3 px-2">
                        <span 
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            session.isCurrentlyActive 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            session.isCurrentlyActive ? "bg-green-400 animate-pulse" : "bg-gray-400"
                          }`} />
                          {session.isCurrentlyActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-white/80 font-mono text-xs">
                        {session.ip || "-"}
                      </td>
                      <td className="py-3 px-2 text-white/80">
                        {session.device || "-"}
                      </td>
                      <td className="py-3 px-2 text-white/80">
                        {session.browser || "-"}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.isPwa 
                            ? "bg-purple-500/20 text-purple-400" 
                            : "bg-cyan-500/20 text-cyan-400"
                        }`}>
                          {session.isPwa ? "PWA" : "Web"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-white/80">
                        {getAgeLabel(session.ageGroup)}
                      </td>
                      <td className="py-3 px-2 text-white/60 text-xs">
                        {formatDate(session.lastActivity)}
                      </td>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
