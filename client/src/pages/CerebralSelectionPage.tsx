import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useUserData } from "@/lib/user-context";
import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CerebralTheme {
  temaNumero: number;
  title: string;
  exerciseType: string;
}

export default function CerebralSelectionPage() {
  const [, setLocation] = useLocation();
  const { userData } = useUserData();
  const [themes, setThemes] = useState<CerebralTheme[]>([]);
  const [loading, setLoading] = useState(true);

  const categoria = userData.ageGroup || "adolescentes";

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch(`/api/cerebral/${categoria}/themes`);
        const data = await res.json();
        if (data.themes) {
          setThemes(data.themes);
        }
      } catch (err) {
        console.error("Error fetching cerebral themes:", err);
      }
      setLoading(false);
    };
    fetchThemes();
  }, [categoria]);

  const getCategoryLabel = () => {
    switch (categoria) {
      case "preescolar": return "Pre-escolar";
      case "ninos": return "Niños";
      case "adolescentes": return "Adolescentes";
      case "universitarios": return "Universitarios";
      case "profesionales": return "Profesionales";
      case "adulto_mayor": return "Adulto Mayor";
      default: return categoria;
    }
  };

  const getExerciseTypeLabel = (type: string) => {
    switch (type) {
      case "bailarina": return "Dirección Visual";
      case "secuencia": return "Secuencia Numérica";
      case "memoria": return "Memoria Visual";
      case "patron": return "Patrón Visual";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/tests")}
            className="text-white hover:bg-white/10"
            data-testid="button-back-tests"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-400" />
              Test Cerebral
            </h1>
            <p className="text-white/60 text-sm">Categoría: {getCategoryLabel()}</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full" />
          </div>
        ) : themes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Zap className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No hay ejercicios disponibles para esta categoría.</p>
            <p className="text-white/40 text-sm mt-2">El administrador debe crear ejercicios primero.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {themes.map((theme, index) => (
              <motion.div
                key={theme.temaNumero}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => setLocation(`/cerebral/ejercicio/${categoria}/${theme.temaNumero}`)}
                  className="w-full p-4 h-auto bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/30 text-left justify-start"
                  data-testid={`button-cerebral-theme-${theme.temaNumero}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {theme.title || `Ejercicio ${String(theme.temaNumero).padStart(2, '0')}`}
                      </p>
                      <p className="text-sm text-white/60">{getExerciseTypeLabel(theme.exerciseType)}</p>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
