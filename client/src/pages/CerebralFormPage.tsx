import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

export default function CerebralFormPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ categoria: string }>();
  const categoria = params.categoria || "adolescentes";
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    edad: "",
    ciudad: "",
    telefono: "+591 ",
    comentario: "",
    grado: "",
  });

  const handleBack = () => {
    playButtonSound();
    window.history.back();
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) return;
    setSubmitting(true);
    
    try {
      const isPwa = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      
      const lateralidadAnswers = sessionStorage.getItem('lateralidadAnswers');
      const preferenciaAnswers = sessionStorage.getItem('preferenciaAnswers');
      
      const latAnswers: string[] = lateralidadAnswers ? JSON.parse(lateralidadAnswers) : [];
      const prefAnswers: { meaning: string }[] = preferenciaAnswers ? JSON.parse(preferenciaAnswers) : [];
      
      const leftCount = latAnswers.filter(a => a.toLowerCase().includes('izquierda')).length;
      const rightCount = latAnswers.filter(a => a.toLowerCase().includes('derecha')).length;
      const total = leftCount + rightCount || 1;
      const leftPercent = Math.round((leftCount / total) * 100);
      const rightPercent = 100 - leftPercent;
      const dominantSide = leftPercent >= rightPercent ? 'izquierdo' : 'derecho';
      const personalityTraits = prefAnswers.map(a => a.meaning).filter(Boolean);
      
      await fetch("/api/cerebral-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email || null,
          edad: formData.edad || null,
          ciudad: formData.ciudad || null,
          telefono: formData.telefono || null,
          comentario: formData.comentario || null,
          grado: formData.grado || null,
          categoria: params.categoria,
          lateralidadData: lateralidadAnswers || null,
          preferenciaData: preferenciaAnswers || null,
          leftPercent,
          rightPercent,
          dominantSide,
          personalityTraits: JSON.stringify(personalityTraits),
          isPwa: isPwa,
        }),
      });
    } catch (error) {
      console.error("Error submitting:", error);
    }
    
    setLocation(`/cerebral/resultado/${params.categoria}`);
  };

  const isNinos = categoria === "ninos" || categoria === "preescolar";
  const isAdolescentes = categoria === "adolescentes";
  
  const gradosPrimaria = ["1ero Primaria", "2do Primaria", "3ero Primaria", "4to Primaria", "5to Primaria", "6to Primaria"];
  const gradosSecundaria = ["1ero Secundaria", "2do Secundaria", "3ero Secundaria", "4to Secundaria", "5to Secundaria", "6to Secundaria", "Universitario"];

  const handleFormChange = (field: string, value: string) => {
    setFormData(p => ({ ...p, [field]: value }));
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #c4b5fd 0%, #ddd6fe 40%, #f5f3ff 100%)" }}
    >
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col items-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2a9 9 0 0 1 9 9c0 3.5-2 6.5-5 8v2a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2c-3-1.5-5-4.5-5-8a9 9 0 0 1 9-9z"/>
              <path d="M9 22h6"/>
              <path d="M12 6v4"/>
              <path d="M8 10h8"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Test Cerebral</h1>
          <p className="text-sm text-gray-600 text-center">Completa tus datos para ver tu resultado.</p>
        </div>

        <div 
          className="rounded-2xl p-5 space-y-4"
          style={{ backgroundColor: "rgba(255,255,255,0.85)", boxShadow: "0 4px 20px rgba(124, 58, 237, 0.15)" }}
        >
          <div>
            <label className="text-xs font-semibold text-purple-700 mb-1 block">Nombre completo</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7c3aed" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={(e) => handleFormChange("nombre", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ backgroundColor: "#ede9fe" }}
                data-testid="input-nombre"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-purple-700 mb-1 block">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7c3aed" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <input
                type="email"
                placeholder="nombre@email.com"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ backgroundColor: "#ede9fe" }}
                data-testid="input-email"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-purple-700 mb-1 block">Teléfono (Bolivia)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-700 font-medium text-sm">
                <span>BO +591</span>
              </div>
              <input
                type="tel"
                placeholder="71234567"
                value={formData.telefono}
                onChange={(e) => handleFormChange("telefono", e.target.value)}
                className="w-full pl-20 pr-10 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ backgroundColor: "#ede9fe" }}
                data-testid="input-telefono"
              />
              {formData.telefono.length > 5 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-purple-700 mb-1 block">Edad</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#0891b2" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <input
                type="number"
                placeholder="Ej: 15"
                value={formData.edad}
                onChange={(e) => handleFormChange("edad", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ backgroundColor: "#ede9fe" }}
                data-testid="input-edad"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-purple-700 mb-1 block">Ciudad</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#0891b2" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Ej: La Paz"
                value={formData.ciudad}
                onChange={(e) => handleFormChange("ciudad", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ backgroundColor: "#ede9fe" }}
                data-testid="input-ciudad"
              />
            </div>
          </div>
        </div>

        {(isNinos || isAdolescentes) && (
          <div 
            className="rounded-2xl p-5 mt-4 space-y-3"
            style={{ backgroundColor: "rgba(255,255,255,0.85)", boxShadow: "0 4px 20px rgba(124, 58, 237, 0.15)" }}
          >
            <label className="text-xs font-semibold text-purple-700 block">Perfil educativo</label>
            
            <select
              value={formData.grado}
              onChange={(e) => handleFormChange("grado", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-no-repeat"
              style={{ 
                backgroundColor: "#e5e7eb",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 12px center",
                backgroundSize: "20px"
              }}
              data-testid="select-grado"
            >
              <option value="">Selecciona grado</option>
              {(isNinos ? gradosPrimaria : gradosSecundaria).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        )}

        <div 
          className="rounded-2xl p-5 mt-4"
          style={{ backgroundColor: "rgba(255,255,255,0.85)", boxShadow: "0 4px 20px rgba(124, 58, 237, 0.15)" }}
        >
          <label className="text-xs font-semibold text-purple-700 mb-1 block">Comentario (opcional)</label>
          <textarea
            placeholder="Mensaje adicional..."
            value={formData.comentario}
            onChange={(e) => handleFormChange("comentario", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-0 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            style={{ backgroundColor: "#ede9fe", minHeight: "60px" }}
            data-testid="input-comentario"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting || !formData.nombre.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-lg text-white font-bold shadow-lg disabled:opacity-50 mt-6"
          style={{ background: "linear-gradient(90deg, #7c3aed 0%, #5b21b6 50%, #0891b2 100%)" }}
          data-testid="button-submit"
        >
          {submitting ? "Enviando..." : "Ver mis resultados"}
        </motion.button>
        
        <p className="text-xs text-gray-400 text-center mt-3">
          Tus datos se usan solo para mostrar resultados y recomendaciones.
        </p>
      </main>
    </div>
  );
}
