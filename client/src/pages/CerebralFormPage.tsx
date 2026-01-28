import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, User, Mail, MapPin, Phone, MessageSquare, Sparkles } from "lucide-react";

export default function CerebralFormPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ categoria: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    edad: "",
    ciudad: "",
    telefono: "",
    comentario: "",
  });

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
      
      // Calculate brain dominance
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

  const formFields = [
    { key: "nombre", type: "text", placeholder: "Tu nombre *", icon: User, required: true, inputMode: "text" as const },
    { key: "email", type: "email", placeholder: "Email (opcional)", icon: Mail, inputMode: "email" as const },
    { key: "edad", type: "text", placeholder: "Edad (opcional)", icon: User, inputMode: "numeric" as const },
    { key: "ciudad", type: "text", placeholder: "Ciudad (opcional)", icon: MapPin, inputMode: "text" as const },
    { key: "telefono", type: "tel", placeholder: "Teléfono (opcional)", icon: Phone, inputMode: "tel" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/20 rounded-full"
            initial={{ 
              x: Math.random() * 400, 
              y: Math.random() * 800 + 200,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, -200],
              opacity: [0.2, 0]
            }}
            transition={{ 
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-purple-300 text-xs uppercase tracking-widest font-medium mb-2">✦ Un paso más ✦</p>
          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            ¡Test Completado!
          </h1>
          <p className="text-white/60 mt-2 text-sm">Ingresa tus datos para ver tus resultados</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="bg-gradient-to-br from-white/95 to-white/90 rounded-3xl p-6 shadow-2xl shadow-purple-500/20 backdrop-blur-sm border border-white/50"
        >
          <div className="space-y-4">
            {formFields.map(({ key, type, placeholder, icon: Icon, required, inputMode }, idx) => (
              <motion.div 
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="relative group"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-focus-within:from-purple-200 group-focus-within:to-purple-100 transition-all">
                  <Icon className="w-5 h-5 text-purple-600" />
                </div>
                <Input
                  type={type}
                  inputMode={inputMode}
                  placeholder={placeholder}
                  value={formData[key as keyof typeof formData]}
                  onChange={(e) => setFormData(p => ({ ...p, [key]: e.target.value }))}
                  className="pl-16 pr-4 border-2 border-purple-100 focus:border-purple-400 bg-white hover:bg-purple-50/30 rounded-2xl h-14 transition-all text-gray-800 placeholder:text-gray-400 font-medium shadow-sm focus:shadow-md focus:shadow-purple-200/50"
                  required={required}
                  data-testid={`input-${key}`}
                />
              </motion.div>
            ))}
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="relative group"
            >
              <div className="absolute left-4 top-4 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-focus-within:from-purple-200 group-focus-within:to-purple-100 transition-all">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <textarea
                placeholder="Comentario (opcional)"
                value={formData.comentario}
                onChange={(e) => setFormData(p => ({ ...p, comentario: e.target.value }))}
                rows={3}
                className="w-full pl-16 pr-4 py-4 rounded-2xl border-2 border-purple-100 focus:border-purple-400 bg-white hover:bg-purple-50/30 resize-none text-sm transition-all outline-none text-gray-800 placeholder:text-gray-400 font-medium shadow-sm focus:shadow-md focus:shadow-purple-200/50"
                data-testid="input-comentario"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formData.nombre.trim()}
              className="w-full mt-6 py-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white shadow-xl shadow-purple-500/30 border-0 disabled:opacity-50"
              data-testid="button-submit-results"
            >
              {submitting ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </motion.span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <Sparkles className="w-5 h-5" />
                  Ver mis resultados
                </span>
              )}
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-400 text-xs mt-4"
          >
            * Campo obligatorio
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
