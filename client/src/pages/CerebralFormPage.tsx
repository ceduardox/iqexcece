import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, User, Mail, MapPin, Phone, MessageSquare, Sparkles } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";
import menuCurveImg from "@assets/menu_1769957804819.png";

const playButtonSound = () => {
  const audio = new Audio('/iphone.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

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
    <div className="min-h-screen bg-white flex flex-col">
      <CurvedHeader showBack onBack={handleBack} />
      
      <div className="w-full sticky z-40" style={{ marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-24">
        <div 
          className="w-full"
          style={{
            background: "linear-gradient(180deg, rgba(138, 63, 252, 0.08) 0%, rgba(0, 217, 255, 0.04) 40%, rgba(255, 255, 255, 1) 100%)"
          }}
        >
          <div className="px-5 pt-4 pb-2 text-center">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold"
              style={{ color: "#8a3ffc" }}
            >
              Test Cerebral
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-xl font-bold"
              style={{ color: "#1f2937" }}
            >
              Completa tus datos
            </motion.h1>
          </div>
        </div>

        <div className="px-5 py-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="text-center mb-5">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-gray-500 text-sm">
                Ingresa tu información para ver tus resultados
              </p>
            </div>

            <div className="space-y-3">
              {formFields.map(({ key, type, placeholder, icon: Icon, inputMode }, index) => (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="relative"
                >
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#00d9ff" }} />
                  <Input
                    type={type}
                    inputMode={inputMode}
                    placeholder={placeholder}
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData(p => ({ ...p, [key]: e.target.value }))}
                    className="pl-10 py-5 bg-gray-50 border-gray-200 rounded-xl"
                    data-testid={`input-${key}`}
                  />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <MessageSquare className="absolute left-3 top-4 w-5 h-5" style={{ color: "#00d9ff" }} />
                <textarea
                  placeholder="Comentario (opcional)"
                  value={formData.comentario}
                  onChange={(e) => setFormData(p => ({ ...p, comentario: e.target.value }))}
                  className="w-full pl-10 py-3 pr-4 bg-gray-50 border border-gray-200 rounded-xl resize-none h-20 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  data-testid="input-comentario"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-5"
            >
              <Button
                onClick={handleSubmit}
                disabled={!formData.nombre.trim() || submitting}
                className="w-full py-6 text-lg font-bold rounded-xl"
                style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" }}
                data-testid="button-submit"
              >
                {submitting ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    Enviando...
                  </motion.span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <Sparkles className="w-5 h-5" />
                    Ver mis resultados
                  </span>
                )}
              </Button>
            </motion.div>

            <p className="text-center text-gray-400 text-xs mt-3">
              * Campo obligatorio
            </p>
          </motion.div>
        </div>
      </main>
      
      <BottomNavBar />
    </div>
  );
}
