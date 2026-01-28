import { createContext, useContext, useState, ReactNode } from "react";

interface RazonamientoResults {
  correct: number;
  total: number;
  time: number;
  categoria: string;
  title: string;
}

interface UserData {
  ageGroup: string | null;
  ageLabel: string | null;
  selectedProblems: string[];
  selectedTest: string | null;
  childCategory: string | null;
  selectedTema: number | null;
  selectedRazonamientoTest: number | null;
  selectedRazonamientoTitle: string | null;
  razonamientoResults?: RazonamientoResults;
}

interface UserContextType {
  userData: UserData;
  setUserData: (data: Partial<UserData>) => void;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
}

const defaultUserData: UserData = {
  ageGroup: null,
  ageLabel: null,
  selectedProblems: [],
  selectedTest: null,
  childCategory: null,
  selectedTema: null,
  selectedRazonamientoTest: null,
  selectedRazonamientoTitle: null,
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserDataState] = useState<UserData>(() => {
    try {
      const saved = sessionStorage.getItem("iq_user_data");
      return saved ? JSON.parse(saved) : defaultUserData;
    } catch {
      return defaultUserData;
    }
  });

  const setUserData = (data: Partial<UserData>) => {
    const newData = { ...userData, ...data };
    setUserDataState(newData);
    sessionStorage.setItem("iq_user_data", JSON.stringify(newData));
  };

  const updateUserData = setUserData;

  const clearUserData = () => {
    setUserDataState(defaultUserData);
    sessionStorage.removeItem("iq_user_data");
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, updateUserData, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within UserProvider");
  }
  return context;
}

export function getAgeTestContent(ageGroup: string | null) {
  const content: Record<string, { 
    lectura: { title: string; description: string; levels: string[] };
    razonamiento: { title: string; description: string; levels: string[] };
    cerebral: { title: string; description: string; levels: string[] };
    iq: { title: string; description: string; levels: string[] };
  }> = {
    ninos: {
      lectura: {
        title: "Lectura para Niños",
        description: "Ejercicios de lectura adaptados para niños de 6-12 años",
        levels: ["Cuentos cortos", "Comprensión básica", "Vocabulario infantil"]
      },
      razonamiento: {
        title: "Razonamiento Infantil",
        description: "Puzzles y juegos lógicos para mentes jóvenes",
        levels: ["Patrones simples", "Secuencias", "Figuras geométricas"]
      },
      cerebral: {
        title: "Test Cerebral Kids",
        description: "Descubre cómo piensa tu cerebro",
        levels: ["Visual vs Auditivo", "Creatividad", "Memoria"]
      },
      iq: {
        title: "IQ Junior",
        description: "Mide tu inteligencia de forma divertida",
        levels: ["Básico", "Intermedio", "Avanzado"]
      }
    },
    adolescentes: {
      lectura: {
        title: "Lectura Adolescente",
        description: "Mejora tu velocidad y comprensión lectora",
        levels: ["Textos académicos", "Análisis crítico", "Lectura rápida"]
      },
      razonamiento: {
        title: "Razonamiento Lógico",
        description: "Desarrolla tu pensamiento analítico",
        levels: ["Lógica proposicional", "Análisis de datos", "Resolución de problemas"]
      },
      cerebral: {
        title: "Test Cerebral Teen",
        description: "Conoce tu estilo de aprendizaje",
        levels: ["Hemisferio dominante", "Inteligencias múltiples", "Estilos cognitivos"]
      },
      iq: {
        title: "Test IQ Estándar",
        description: "Evaluación de coeficiente intelectual",
        levels: ["Verbal", "Numérico", "Espacial"]
      }
    },
    universitarios: {
      lectura: {
        title: "Lectura Universitaria",
        description: "Optimiza tu lectura académica y científica",
        levels: ["Papers científicos", "Síntesis de información", "Lectura crítica avanzada"]
      },
      razonamiento: {
        title: "Razonamiento Avanzado",
        description: "Prepárate para exámenes de admisión",
        levels: ["Razonamiento abstracto", "Análisis cuantitativo", "Pensamiento crítico"]
      },
      cerebral: {
        title: "Test Neurológico",
        description: "Análisis completo de funciones cerebrales",
        levels: ["Funciones ejecutivas", "Memoria de trabajo", "Flexibilidad cognitiva"]
      },
      iq: {
        title: "Test IQ Profesional",
        description: "Evaluación completa de inteligencia",
        levels: ["Wechsler adaptado", "Matrices progresivas", "Razonamiento fluido"]
      }
    },
    profesionales: {
      lectura: {
        title: "Lectura Ejecutiva",
        description: "Maximiza tu eficiencia en lectura de negocios",
        levels: ["Informes ejecutivos", "Documentos legales", "Speed reading"]
      },
      razonamiento: {
        title: "Razonamiento Estratégico",
        description: "Mejora tu toma de decisiones",
        levels: ["Análisis de escenarios", "Pensamiento sistémico", "Resolución creativa"]
      },
      cerebral: {
        title: "Test Cognitivo Pro",
        description: "Evaluación de rendimiento mental",
        levels: ["Productividad mental", "Gestión del estrés", "Optimización cognitiva"]
      },
      iq: {
        title: "Test IQ Ejecutivo",
        description: "Mide tu potencial de liderazgo",
        levels: ["Inteligencia emocional", "IQ tradicional", "Creatividad empresarial"]
      }
    },
    adulto_mayor: {
      lectura: {
        title: "Lectura Activa",
        description: "Mantén tu mente ágil con la lectura",
        levels: ["Lectura recreativa", "Memoria de textos", "Vocabulario"]
      },
      razonamiento: {
        title: "Gimnasia Mental",
        description: "Ejercicios para mantener la mente activa",
        levels: ["Sudoku adaptado", "Crucigramas", "Juegos de memoria"]
      },
      cerebral: {
        title: "Salud Cerebral",
        description: "Monitorea tu bienestar cognitivo",
        levels: ["Memoria", "Atención", "Orientación"]
      },
      iq: {
        title: "Test Cognitivo Senior",
        description: "Evaluación adaptada para adultos mayores",
        levels: ["Funciones básicas", "Memoria episódica", "Velocidad de procesamiento"]
      }
    }
  };

  return content[ageGroup || "universitarios"] || content.universitarios;
}
