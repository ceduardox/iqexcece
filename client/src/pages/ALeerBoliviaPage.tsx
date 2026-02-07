import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { BookOpen, Lightbulb, Users, Award, Star, Sparkles, Target, ArrowLeft } from "lucide-react";
import { BottomNavBar } from "@/components/BottomNavBar";
import menuCurveImg from "@assets/menu_1769957804819.png";

const objectives = [
  {
    icon: Lightbulb,
    color: "#f59e0b",
    bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
    title: "Encendiendo la Chispa del Conocimiento",
    desc: "Impulsamos la pasión por la lectura y la comprensión lectora entre los estudiantes de primaria y secundaria, abriendo puertas a mundos de conocimiento y aventura."
  },
  {
    icon: BookOpen,
    color: "#8b5cf6",
    bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
    title: "Desarrollando Maestros de la Interpretación",
    desc: "Nuestra iniciativa se centra en enriquecer las habilidades de interpretación y análisis textual, preparando a los estudiantes para explorar y comprender las profundidades de la literatura y más allá."
  },
  {
    icon: Users,
    color: "#06b6d4",
    bg: "linear-gradient(135deg, #cffafe, #a5f3fc)",
    title: "Tejer Redes de Conocimiento",
    desc: "Promovemos un ambiente donde compartir y confiar se convierte en la base para una rica experiencia de aprendizaje, enriqueciendo la jornada educativa de cada estudiante."
  },
  {
    icon: Target,
    color: "#10b981",
    bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    title: "Descubrir y Desarrollar Talentos",
    desc: "Mediante nuestro concurso, identificamos las fortalezas y áreas de mejora en cada estudiante, guiándolos hacia su máximo potencial académico."
  },
  {
    icon: Award,
    color: "#f43f5e",
    bg: "linear-gradient(135deg, #ffe4e6, #fecdd3)",
    title: "Celebrar el Éxito Académico",
    desc: "Reconocemos y premiamos la excelencia en la lectura, destacando los logros de los estudiantes en un evento especial que inspira a toda la comunidad educativa."
  },
];

export default function ALeerBoliviaPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-center px-5 bg-white sticky top-0 z-50" style={{ paddingTop: 10, paddingBottom: 10 }}>
        <button onClick={() => setLocation("/")} className="absolute left-5 p-2 text-gray-400" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <svg width="80" height="36" viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8a3ffc" />
              <stop offset="100%" stopColor="#00d9ff" />
            </linearGradient>
          </defs>
          <text x="0" y="28" fontSize="32" fontWeight="900" fontFamily="Inter, sans-serif">
            <tspan fill="#8a3ffc">i</tspan>
            <tspan fill="#8a3ffc">Q</tspan>
            <tspan fill="url(#logoGrad)">x</tspan>
          </text>
        </svg>
      </header>

      <div className="w-full sticky z-40" style={{ top: 56, marginTop: -4, marginBottom: -20 }}>
        <img src={menuCurveImg} alt="" className="w-full h-auto" />
      </div>

      <main className="flex-1 overflow-y-auto pb-28">
        <section className="relative px-5 pt-8 pb-10">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
          </div>

          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: "linear-gradient(135deg, #f3e8ff, #e0f2fe)" }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-purple-600">INICIATIVA EDUCATIVA</span>
            </motion.div>

            <h1 className="text-2xl font-black text-gray-800 mb-2 leading-tight" data-testid="text-welcome-title">
              ¡Bienvenidos!
            </h1>
            <h2 className="text-lg font-bold mb-1" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Al Amanecer de una Nueva Era Educativa
            </h2>
            <h3 className="text-base font-bold text-purple-600 mb-4">
              ¡Transforma el Futuro con la Lectura!
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              Únete a nuestra revolucionaria iniciativa que busca encender la pasión por la lectura en los corazones de los estudiantes de Bolivia. A través de un concurso intercolegial, inspiramos a los estudiantes a explorar mundos de conocimiento y creatividad. Este es tu momento para contribuir a un cambio educativo significativo. ¡Descubre cómo!
            </p>
          </motion.div>

          <motion.div
            className="mt-8 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div
              className="w-full h-48 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ede9fe 0%, #e0f2fe 50%, #f3e8ff 100%)" }}
              data-testid="img-placeholder"
            >
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-purple-300 mx-auto mb-2" />
                <span className="text-sm text-purple-400 font-medium">A Leer Bolivia</span>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="px-5 pb-10">
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl font-black text-gray-800 mb-2" data-testid="text-objectives-title">Objetivos</h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
              Impulsamos el futuro educativo de Bolivia con un concurso de lectura que no solo cultiva el amor por los libros entre estudiantes de primaria, sino que también afina sus habilidades analíticas y de comprensión.
            </p>
          </motion.div>

          <div className="space-y-4">
            {objectives.map((obj, i) => {
              const Icon = obj.icon;
              return (
                <motion.div
                  key={i}
                  className="bg-white rounded-2xl p-4 flex items-start gap-4"
                  style={{ boxShadow: "0 4px 20px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.04)" }}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  data-testid={`card-objective-${i}`}
                >
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: obj.bg }}
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
                  >
                    <Icon className="w-6 h-6" style={{ color: obj.color }} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-800 mb-1">{obj.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{obj.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
