import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Monitor, Smartphone, Globe, Clock, LogOut, RefreshCw, FileText, BookOpen, Save, Plus, Trash2, X, Brain, Zap } from "lucide-react";
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
  const [contentCategory, setContentCategory] = useState<"preescolar" | "ninos" | "adolescentes" | "universitarios" | "profesionales" | "adulto_mayor">("preescolar");
  const [selectedTema, setSelectedTema] = useState(1);
  const [availableThemes, setAvailableThemes] = useState<{temaNumero: number; title: string}[]>([]);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"lectura" | "razonamiento" | "cerebral">("lectura");
  
  // Razonamiento state
  const [razonamientoThemes, setRazonamientoThemes] = useState<{temaNumero: number; title: string}[]>([]);
  const [selectedRazonamientoTema, setSelectedRazonamientoTema] = useState(1);
  const [razonamientoContent, setRazonamientoContent] = useState<{title: string; imageUrl: string; imageSize: number; questions: {question: string; options: string[]; correct: number}[]}>({
    title: "",
    imageUrl: "",
    imageSize: 100,
    questions: []
  });
  
  // Cerebral state
  const [cerebralThemes, setCerebralThemes] = useState<{temaNumero: number; title: string; exerciseType: string}[]>([]);
  const [selectedCerebralTema, setSelectedCerebralTema] = useState(1);
  const DEFAULT_BAILARINA_OPTIONS = [
    { id: "1", label: "Izquierda", value: "izquierda", position: 0 },
    { id: "2", label: "Derecha", value: "derecha", position: 1 },
    { id: "3", label: "Ambos", value: "ambos", position: 2 }
  ];
  
  const [cerebralContent, setCerebralContent] = useState<{
    title: string; 
    exerciseType: string; 
    imageUrl: string; 
    imageSize: number; 
    exerciseData: any;
    isActive: boolean;
  }>({
    title: "",
    exerciseType: "bailarina",
    imageUrl: "",
    imageSize: 100,
    exerciseData: { instruction: "", correctAnswer: "", answerOptions: DEFAULT_BAILARINA_OPTIONS },
    isActive: true
  });
  
  const EXERCISE_TYPES = [
    { value: "bailarina", label: "Bailarina (dirección visual)" },
    { value: "secuencia", label: "Secuencia numérica" },
    { value: "memoria", label: "Memoria visual" },
    { value: "patron", label: "Patrón visual" },
    { value: "stroop", label: "Test Stroop (color vs palabra)" },
  ];
  
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
    content: "Hace muchos años, antes de que existieran las tabletas y los bombones como los conocemos hoy, el cacao era considerado un tesoro muy valioso. Los antiguos mayas y aztecas, civilizaciones que vivieron en América Central, fueron de los primeros en cultivarlo. No usaban el cacao para hacer dulces, sino como una bebida especial. Preparaban una mezcla de granos de cacao molidos con agua, chile y algunas especias. Esta bebida era amarga, pero la consideraban un regalo de los dioses. Los aztecas valoraban tanto el cacao que incluso usaban sus granos como moneda: por ejemplo, se podía comprar un tomate con un grano de cacao, o un conejo con 30 granos. Además, solo las personas importantes, como guerreros y nobles, podían tomar esa bebida.\n\nCuando los conquistadores españoles llegaron a América en el siglo XVI, llevaron el cacao a Europa. Allí, las personas comenzaron a mezclarlo con azúcar y leche, creando una bebida caliente más dulce y agradable. Con el tiempo, los chocolateros inventaron nuevas formas de disfrutar el cacao, como las tabletas y los bombones que conocemos hoy.\n\nActualmente, el chocolate se produce en muchas partes del mundo, pero el cacao sigue creciendo principalmente en países tropicales como Costa de Marfil, Ghana, Ecuador y Brasil. Y además de ser delicioso, el chocolate puede tener beneficios, como mejorar el estado de ánimo y aportar energía, siempre que se consuma con moderación.",
    imageUrl: "https://img.freepik.com/free-vector/chocolate-bar-pieces-realistic-composition_1284-19023.jpg",
    pageMainImage: "https://img.freepik.com/free-vector/cute-girl-back-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
    pageSmallImage: "https://img.freepik.com/free-vector/cute-astronaut-reading-book-cartoon-vector-icon-illustration-science-education-icon-isolated_138676-5765.jpg",
    categoryImage: "https://img.freepik.com/free-vector/cute-girl-back-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
    questions: [
      { question: "¿Qué civilizaciones fueron las primeras en cultivar el cacao?", options: ["Mayas y Aztecas.", "Quechuas y Aymaras.", "Andinos.", "Europeos."], correct: 0 },
      { question: "¿Cómo preparaban la bebida de cacao los antiguos mayas y aztecas?", options: ["Cocinaban hasta derretir el cacao.", "una mezcla de granos de cacao molidos con agua, chile.", "Lo colocaban en hornos de barros.", "Lo colocaban al sol hasta derretir"], correct: 1 },
      { question: "¿Para qué usaban los aztecas los granos de cacao, además de preparar bebidas?", options: ["Intercambio.", "Moneda.", "Licor.", "Medicina natural."], correct: 1 },
      { question: "¿Qué cambios hizo Europa en la forma de consumir el cacao?", options: ["Comercializaron.", "Mezclaron con azúcar y leche.", "Usaban como bebida caliente.", "Lo intercambiaron."], correct: 1 },
      { question: "Menciona dos países actuales donde se cultiva el cacao.", options: ["Europa y África.", "Centro América y el caribe.", "Ecuador y Ghana.", "Brasil y Bolivia."], correct: 2 },
    ]
  };

  const defaultAdolescentes = {
    title: "EUTANASIA",
    content: `El término eutanasia es todo acto u omisión cuya responsabilidad recae en personal médico o en individuos cercanos al enfermo, y que ocasiona la muerte inmediata de éste. La palabra deriva del griego: eu ("bueno") y thanatos ("muerte").

Quienes defienden la eutanasia sostienen que la finalidad del acto es evitarle sufrimientos insoportables o la prolongación artificial de la vida a un enfermo, presentando tales situaciones como "contrarias a la dignidad". También sus defensores sostienen que, para que la eutanasia sea considerada como tal, el enfermo ha de padecer, necesariamente, una enfermedad terminal o incurable y, en segundo lugar, el personal sanitario ha de contar expresamente con el consentimiento del enfermo.

Otros, en cambio, creen que los programas de eutanasia están en contraposición con los ideales con los que se defiende su implementación. Por ejemplo, se menciona que los médicos durante el régimen nazi hacían propaganda en favor de la eutanasia con argumentos como la indignidad de ciertas vidas, que por tanto eran, según aquella propaganda, merecedoras de compasión, para conseguir así una opinión pública favorable a la eliminación que se estaba haciendo de enfermos, considerados minusválidos o débiles según criterios nazis.

Actualmente, en muy pocos países (por ejemplo, Holanda y Bélgica) se ha despenalizado la eutanasia, y en ellos todavía permanece tipificado como homicidio, por ejemplo como homicidio o bien como asistencia al suicidio. Según los datos oficiales, los supuestos arriba mencionados no son cumplidos: en una tasa creciente, a miles de personas se les aplica la eutanasia en contra de su voluntad y las restricciones para aplicar la eutanasia han ido disminuyendo; por ejemplo, actualmente se la aplica a menores de edad en dichos países.`,
    imageUrl: "https://img.freepik.com/free-vector/teenager-student-concept-illustration_114360-1395.jpg",
    pageMainImage: "https://img.freepik.com/free-vector/student-with-laptop-studying-online-course_74855-5293.jpg",
    pageSmallImage: "https://img.freepik.com/free-vector/reading-book-concept-illustration_114360-8503.jpg",
    categoryImage: "https://img.freepik.com/free-vector/teenager-student-concept-illustration_114360-1395.jpg",
    questions: [
      { question: "¿Qué es la eutanasia?", options: ["Es aquello que considera lo bueno y lo malo", "Es quitarse la vida para evitar el sufrimiento", "Es todo acto u omisión cuya responsabilidad recae en el medico y/o familiares"], correct: 2 },
      { question: "¿Dónde surge la propaganda de realizar la eutanasia?", options: ["E.E.U.U.", "Alemania", "Rusia"], correct: 1 },
      { question: "¿En qué países se ha despenalizado la eutanasia?", options: ["Alemania - Italia", "Bélgica - Holanda", "España - Inglaterra"], correct: 1 },
      { question: "¿Quién fue juzgado como asesino por practicar la eutanasia en el gobierno nazi?", options: ["Arthun", "Nuberg", "Vemberth"], correct: 0 },
    ]
  };

  const [editContentPreescolar, setEditContentPreescolar] = useState(defaultPreescolar);
  const [editContentNinos, setEditContentNinos] = useState(defaultNinos);
  const [editContentAdolescentes, setEditContentAdolescentes] = useState(defaultAdolescentes);
  
  const defaultUniversitarios = {
    title: "LECTURA UNIVERSITARIA - Tema 01",
    content: "Contenido de lectura para estudiantes universitarios. Este es un tema de ejemplo que puede ser editado desde el panel de administración.",
    imageUrl: "https://img.freepik.com/free-vector/university-student-concept-illustration_114360-9055.jpg",
    pageMainImage: "https://img.freepik.com/free-vector/college-students-concept-illustration_114360-10205.jpg",
    pageSmallImage: "https://img.freepik.com/free-vector/book-reading-concept-illustration_114360-4528.jpg",
    categoryImage: "https://img.freepik.com/free-vector/university-student-concept-illustration_114360-9055.jpg",
    questions: [{ question: "Pregunta de ejemplo - editar desde admin", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correct: 0 }],
  };
  const [editContentUniversitarios, setEditContentUniversitarios] = useState(defaultUniversitarios);
  
  const defaultProfesionales = {
    title: "LECTURA PROFESIONAL - Tema 01",
    content: "Contenido de lectura para profesionales. Este es un tema de ejemplo que puede ser editado desde el panel de administración.",
    imageUrl: "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg",
    pageMainImage: "https://img.freepik.com/free-vector/office-workers-concept-illustration_114360-2244.jpg",
    pageSmallImage: "https://img.freepik.com/free-vector/business-team-concept-illustration_114360-3628.jpg",
    categoryImage: "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg",
    questions: [{ question: "Pregunta de ejemplo - editar desde admin", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correct: 0 }],
  };
  const [editContentProfesionales, setEditContentProfesionales] = useState(defaultProfesionales);
  
  const defaultAdultoMayor = {
    title: "LECTURA ADULTO MAYOR - Tema 01",
    content: "Contenido de lectura para adultos mayores. Este es un tema de ejemplo que puede ser editado desde el panel de administración.",
    imageUrl: "https://img.freepik.com/free-vector/grandparents-concept-illustration_114360-5638.jpg",
    pageMainImage: "https://img.freepik.com/free-vector/elderly-people-concept-illustration_114360-4195.jpg",
    pageSmallImage: "https://img.freepik.com/free-vector/reading-glasses-concept-illustration_114360-4890.jpg",
    categoryImage: "https://img.freepik.com/free-vector/grandparents-concept-illustration_114360-5638.jpg",
    questions: [{ question: "Pregunta de ejemplo - editar desde admin", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correct: 0 }],
  };
  const [editContentAdultoMayor, setEditContentAdultoMayor] = useState(defaultAdultoMayor);
  
  const [saving, setSaving] = useState(false);
  
  const currentEditContent = contentCategory === "preescolar" 
    ? editContentPreescolar 
    : contentCategory === "ninos" 
      ? editContentNinos 
      : contentCategory === "adolescentes"
        ? editContentAdolescentes
        : contentCategory === "universitarios"
          ? editContentUniversitarios
          : contentCategory === "profesionales"
            ? editContentProfesionales
            : editContentAdultoMayor;
  const setCurrentEditContent = contentCategory === "preescolar" 
    ? setEditContentPreescolar 
    : contentCategory === "ninos" 
      ? setEditContentNinos 
      : contentCategory === "adolescentes"
        ? setEditContentAdolescentes
        : contentCategory === "universitarios"
          ? setEditContentUniversitarios
          : contentCategory === "profesionales"
            ? setEditContentProfesionales
            : setEditContentAdultoMayor;

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
          temaNumero: selectedTema,
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
      loadThemes();
    } catch {
      alert("Error al guardar");
    }
    setSaving(false);
  };

  const handleSaveRazonamiento = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/razonamiento", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          categoria: contentCategory,
          temaNumero: selectedRazonamientoTema,
          title: razonamientoContent.title,
          imageUrl: razonamientoContent.imageUrl || null,
          imageSize: razonamientoContent.imageSize || 100,
          questions: JSON.stringify(razonamientoContent.questions),
        }),
      });
      if (res.ok) {
        alert("Razonamiento guardado correctamente");
        const themesRes = await fetch(`/api/razonamiento/${contentCategory}/themes`);
        const themesData = await themesRes.json();
        if (themesData.themes) {
          setRazonamientoThemes(themesData.themes);
        }
      } else {
        alert("Error al guardar");
      }
    } catch {
      alert("Error al guardar");
    }
    setSaving(false);
  };

  const handleSaveCerebral = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cerebral", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          categoria: contentCategory,
          temaNumero: selectedCerebralTema,
          title: cerebralContent.title,
          exerciseType: cerebralContent.exerciseType,
          imageUrl: cerebralContent.imageUrl || null,
          imageSize: cerebralContent.imageSize || 100,
          exerciseData: JSON.stringify(cerebralContent.exerciseData),
          isActive: cerebralContent.isActive,
        }),
      });
      if (res.ok) {
        alert("Test Cerebral guardado correctamente");
        const themesRes = await fetch(`/api/cerebral/${contentCategory}/themes`);
        const themesData = await themesRes.json();
        if (themesData.themes) {
          setCerebralThemes(themesData.themes);
        }
      } else {
        alert("Error al guardar");
      }
    } catch {
      alert("Error al guardar");
    }
    setSaving(false);
  };

  const loadThemes = async () => {
    try {
      const res = await fetch(`/api/reading/${contentCategory}/themes`);
      const data = await res.json();
      if (data.themes && data.themes.length > 0) {
        setAvailableThemes(data.themes);
        const themeNumbers = data.themes.map((t: {temaNumero: number}) => t.temaNumero);
        if (!themeNumbers.includes(selectedTema)) {
          setSelectedTema(data.themes[0].temaNumero);
        }
      } else {
        setAvailableThemes([{ temaNumero: 1, title: "Nuevo tema" }]);
        setSelectedTema(1);
      }
    } catch {
      setAvailableThemes([{ temaNumero: 1, title: "Tema 1" }]);
      setSelectedTema(1);
    }
  };

  const loadContentForTema = async (categoria: string, tema: number) => {
    const emptyContent = {
      title: "",
      content: "",
      imageUrl: "",
      pageMainImage: "",
      pageSmallImage: "",
      categoryImage: "",
      questions: [],
    };
    
    const setContentByCategory = (content: typeof emptyContent) => {
      switch (categoria) {
        case "preescolar": setEditContentPreescolar(content); break;
        case "ninos": setEditContentNinos(content); break;
        case "adolescentes": setEditContentAdolescentes(content); break;
        case "universitarios": setEditContentUniversitarios(content); break;
        case "profesionales": setEditContentProfesionales(content); break;
        case "adulto_mayor": setEditContentAdultoMayor(content); break;
      }
    };
    
    try {
      const res = await fetch(`/api/reading/${categoria}?tema=${tema}`);
      if (!res.ok) {
        setContentByCategory(emptyContent);
        return;
      }
      const data = await res.json();
      if (data.content && data.content.temaNumero === tema) {
        const c = data.content;
        const questions = typeof c.questions === 'string' ? JSON.parse(c.questions) : c.questions;
        const newContent = {
          title: c.title || "",
          content: c.content || "",
          imageUrl: c.imageUrl || "",
          pageMainImage: c.pageMainImage || "",
          pageSmallImage: c.pageSmallImage || "",
          categoryImage: c.categoryImage || "",
          questions: questions || [],
        };
        setContentByCategory(newContent);
      } else {
        setContentByCategory(emptyContent);
      }
    } catch {
      setContentByCategory(emptyContent);
    }
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
    if (isLoggedIn && contentType === "lectura") {
      loadThemes();
    }
  }, [isLoggedIn, contentCategory, contentType]);

  useEffect(() => {
    if (isLoggedIn && contentType === "lectura") {
      loadContentForTema(contentCategory, selectedTema);
    }
  }, [isLoggedIn, contentCategory, selectedTema, contentType]);

  // Load razonamiento themes
  useEffect(() => {
    if (isLoggedIn && contentType === "razonamiento") {
      const loadRazonamientoThemes = async () => {
        try {
          const res = await fetch(`/api/razonamiento/${contentCategory}/themes`);
          const data = await res.json();
          if (data.themes && data.themes.length > 0) {
            setRazonamientoThemes(data.themes);
            setSelectedRazonamientoTema(data.themes[0].temaNumero);
          } else {
            setRazonamientoThemes([]);
            setSelectedRazonamientoTema(1);
            setRazonamientoContent({ title: "", imageUrl: "", imageSize: 100, questions: [] });
          }
        } catch {
          setRazonamientoThemes([]);
        }
      };
      loadRazonamientoThemes();
    }
  }, [isLoggedIn, contentCategory, contentType]);

  // Load razonamiento content for selected theme
  useEffect(() => {
    if (isLoggedIn && contentType === "razonamiento") {
      const loadRazonamientoContent = async () => {
        try {
          const res = await fetch(`/api/razonamiento/${contentCategory}?tema=${selectedRazonamientoTema}`);
          const data = await res.json();
          if (data.content) {
            const questions = typeof data.content.questions === "string" 
              ? JSON.parse(data.content.questions) 
              : data.content.questions || [];
            setRazonamientoContent({
              title: data.content.title || "",
              imageUrl: data.content.imageUrl || "",
              imageSize: data.content.imageSize || 100,
              questions: questions,
            });
          } else {
            setRazonamientoContent({ title: "", imageUrl: "", imageSize: 100, questions: [] });
          }
        } catch {
          setRazonamientoContent({ title: "", imageUrl: "", imageSize: 100, questions: [] });
        }
      };
      loadRazonamientoContent();
    }
  }, [isLoggedIn, contentCategory, selectedRazonamientoTema, contentType]);

  // Load cerebral themes
  useEffect(() => {
    if (isLoggedIn && contentType === "cerebral") {
      const loadCerebralThemes = async () => {
        try {
          const res = await fetch(`/api/cerebral/${contentCategory}/themes`);
          const data = await res.json();
          if (data.themes && data.themes.length > 0) {
            setCerebralThemes(data.themes);
            setSelectedCerebralTema(data.themes[0].temaNumero);
          } else {
            setCerebralThemes([]);
            setSelectedCerebralTema(1);
            setCerebralContent({ 
              title: "", exerciseType: "bailarina", imageUrl: "", imageSize: 100, 
              exerciseData: { instruction: "", correctAnswer: "" }, isActive: true 
            });
          }
        } catch {
          setCerebralThemes([]);
        }
      };
      loadCerebralThemes();
    }
  }, [isLoggedIn, contentCategory, contentType]);

  // Load cerebral content for selected theme
  useEffect(() => {
    if (isLoggedIn && contentType === "cerebral") {
      const loadCerebralContent = async () => {
        try {
          const res = await fetch(`/api/cerebral/${contentCategory}?tema=${selectedCerebralTema}`);
          const data = await res.json();
          if (data.content) {
            const exerciseData = typeof data.content.exerciseData === "string" 
              ? JSON.parse(data.content.exerciseData) 
              : data.content.exerciseData || {};
            setCerebralContent({
              title: data.content.title || "",
              exerciseType: data.content.exerciseType || "bailarina",
              imageUrl: data.content.imageUrl || "",
              imageSize: data.content.imageSize || 100,
              exerciseData: exerciseData,
              isActive: data.content.isActive ?? true,
            });
          } else {
            setCerebralContent({ 
              title: "", exerciseType: "bailarina", imageUrl: "", imageSize: 100, 
              exerciseData: { instruction: "", correctAnswer: "" }, isActive: true 
            });
          }
        } catch {
          setCerebralContent({ 
            title: "", exerciseType: "bailarina", imageUrl: "", imageSize: 100, 
            exerciseData: { instruction: "", correctAnswer: "" }, isActive: true 
          });
        }
      };
      loadCerebralContent();
    }
  }, [isLoggedIn, contentCategory, selectedCerebralTema, contentType]);

  useEffect(() => {
    if (isLoggedIn) {
      const loadContent = async () => {
        try {
          const [preescolarRes, ninosRes, adolescentesRes] = await Promise.all([
            fetch("/api/reading/preescolar?tema=1"),
            fetch("/api/reading/ninos?tema=1"),
            fetch("/api/reading/adolescentes?tema=1"),
          ]);
          const preescolarData = await preescolarRes.json();
          const ninosData = await ninosRes.json();
          const adolescentesData = await adolescentesRes.json();
          
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
          if (adolescentesData.content) {
            const c = adolescentesData.content;
            setEditContentAdolescentes({
              title: c.title || defaultAdolescentes.title,
              content: c.content || defaultAdolescentes.content,
              imageUrl: c.imageUrl || defaultAdolescentes.imageUrl,
              pageMainImage: c.pageMainImage || defaultAdolescentes.pageMainImage,
              pageSmallImage: c.pageSmallImage || defaultAdolescentes.pageSmallImage,
              categoryImage: c.categoryImage || defaultAdolescentes.categoryImage,
              questions: c.questions ? JSON.parse(c.questions) : defaultAdolescentes.questions,
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
                {contentType === "lectura" ? (
                  <BookOpen className="w-5 h-5 text-orange-400" />
                ) : contentType === "razonamiento" ? (
                  <Brain className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Zap className="w-5 h-5 text-purple-400" />
                )}
                Editar Contenido de {contentType === "lectura" ? "Lectura" : contentType === "razonamiento" ? "Razonamiento" : "Test Cerebral"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4 border-b border-white/10 pb-4">
                <Button
                  onClick={() => setContentType("lectura")}
                  variant={contentType === "lectura" ? "default" : "outline"}
                  className={contentType === "lectura" ? "bg-orange-600" : "border-orange-500/30 text-orange-400"}
                  data-testid="button-content-type-lectura"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Lectura
                </Button>
                <Button
                  onClick={() => setContentType("razonamiento")}
                  variant={contentType === "razonamiento" ? "default" : "outline"}
                  className={contentType === "razonamiento" ? "bg-cyan-600" : "border-cyan-500/30 text-cyan-400"}
                  data-testid="button-content-type-razonamiento"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Razonamiento
                </Button>
                <Button
                  onClick={() => setContentType("cerebral")}
                  variant={contentType === "cerebral" ? "default" : "outline"}
                  className={contentType === "cerebral" ? "bg-purple-600" : "border-purple-500/30 text-purple-400"}
                  data-testid="button-content-type-cerebral"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Test Cerebral
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  onClick={() => { setContentCategory("preescolar"); setSelectedTema(1); }}
                  variant={contentCategory === "preescolar" ? "default" : "outline"}
                  className={contentCategory === "preescolar" ? "bg-orange-600" : "border-orange-500/30 text-orange-400"}
                  data-testid="button-content-preescolar"
                >
                  Pre-escolar
                </Button>
                <Button
                  onClick={() => { setContentCategory("ninos"); setSelectedTema(1); }}
                  variant={contentCategory === "ninos" ? "default" : "outline"}
                  className={contentCategory === "ninos" ? "bg-purple-600" : "border-purple-500/30 text-purple-400"}
                  data-testid="button-content-ninos"
                >
                  Niños
                </Button>
                <Button
                  onClick={() => { setContentCategory("adolescentes"); setSelectedTema(1); }}
                  variant={contentCategory === "adolescentes" ? "default" : "outline"}
                  className={contentCategory === "adolescentes" ? "bg-violet-600" : "border-violet-500/30 text-violet-400"}
                  data-testid="button-content-adolescentes"
                >
                  Adolescentes
                </Button>
                <Button
                  onClick={() => { setContentCategory("universitarios"); setSelectedTema(1); }}
                  variant={contentCategory === "universitarios" ? "default" : "outline"}
                  className={contentCategory === "universitarios" ? "bg-blue-600" : "border-blue-500/30 text-blue-400"}
                  data-testid="button-content-universitarios"
                >
                  Universitarios
                </Button>
                <Button
                  onClick={() => { setContentCategory("profesionales"); setSelectedTema(1); }}
                  variant={contentCategory === "profesionales" ? "default" : "outline"}
                  className={contentCategory === "profesionales" ? "bg-teal-600" : "border-teal-500/30 text-teal-400"}
                  data-testid="button-content-profesionales"
                >
                  Profesionales
                </Button>
                <Button
                  onClick={() => { setContentCategory("adulto_mayor"); setSelectedTema(1); }}
                  variant={contentCategory === "adulto_mayor" ? "default" : "outline"}
                  className={contentCategory === "adulto_mayor" ? "bg-amber-600" : "border-amber-500/30 text-amber-400"}
                  data-testid="button-content-adulto-mayor"
                >
                  Adulto Mayor
                </Button>
              </div>

              {contentType === "lectura" && (
              <>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Tema de lectura</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {availableThemes.map((theme) => (
                    <Button
                      key={theme.temaNumero}
                      size="sm"
                      onClick={() => setSelectedTema(theme.temaNumero)}
                      variant={selectedTema === theme.temaNumero ? "default" : "outline"}
                      className={selectedTema === theme.temaNumero ? "bg-teal-600" : "border-teal-500/30 text-teal-400"}
                      data-testid={`button-tema-${theme.temaNumero}`}
                    >
                      Tema {String(theme.temaNumero).padStart(2, '0')}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => {
                      const maxTema = Math.max(...availableThemes.map(t => t.temaNumero), 0);
                      setSelectedTema(maxTema + 1);
                      setCurrentEditContent({
                        title: "",
                        content: "",
                        imageUrl: "",
                        pageMainImage: "",
                        pageSmallImage: "",
                        categoryImage: "",
                        questions: [],
                      });
                    }}
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                    data-testid="button-add-tema"
                  >
                    + Nuevo Tema
                  </Button>
                </div>
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
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                  <h3 className="text-white font-semibold">Preguntas del cuestionario ({currentEditContent.questions.length})</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      const newQ = [...currentEditContent.questions, { question: "", options: ["", "", ""], correct: 0 }];
                      setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                    }}
                    data-testid="button-add-question"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Agregar Pregunta
                  </Button>
                </div>
                {currentEditContent.questions.length === 0 && (
                  <p className="text-white/40 text-sm text-center py-4">No hay preguntas. Haz clic en "Agregar Pregunta" para crear una.</p>
                )}
                {currentEditContent.questions.map((q: { question: string; options: string[]; correct: number }, qi: number) => (
                  <div key={qi} className="mb-4 p-3 bg-white/5 rounded-lg relative">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <label className="text-orange-400 text-sm">Pregunta {qi + 1}</label>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const newQ = currentEditContent.questions.filter((_: any, i: number) => i !== qi);
                          setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                        }}
                        data-testid={`button-delete-question-${qi}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      value={q.question}
                      onChange={(e) => {
                        const newQ = [...currentEditContent.questions];
                        newQ[qi].question = e.target.value;
                        setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                      }}
                      placeholder="Escribe la pregunta..."
                      className="bg-white/10 border-white/20 text-white mb-3"
                      data-testid={`input-question-${qi}`}
                    />
                    <label className="text-white/40 text-xs mb-2 block">Opciones (haz clic en la correcta):</label>
                    <div className="space-y-2">
                      {q.options.map((opt: string, oi: number) => (
                        <div key={oi} className="flex flex-wrap gap-2 items-center">
                          <Button
                            size="sm"
                            variant={q.correct === oi ? "default" : "outline"}
                            onClick={() => {
                              const newQ = [...currentEditContent.questions];
                              newQ[qi].correct = oi;
                              setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                            }}
                            className={q.correct === oi ? "toggle-elevate toggle-elevated" : "toggle-elevate"}
                            data-testid={`button-correct-${qi}-${oi}`}
                          >
                            {oi + 1}
                          </Button>
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newQ = [...currentEditContent.questions];
                              newQ[qi].options[oi] = e.target.value;
                              setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                            }}
                            placeholder={`Opción ${oi + 1}...`}
                            className="bg-white/10 border-white/20 text-white flex-1"
                            data-testid={`input-option-${qi}-${oi}`}
                          />
                          {q.options.length > 2 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const newQ = [...currentEditContent.questions];
                                newQ[qi].options = newQ[qi].options.filter((_: string, i: number) => i !== oi);
                                if (newQ[qi].correct >= newQ[qi].options.length) {
                                  newQ[qi].correct = newQ[qi].options.length - 1;
                                }
                                setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                              }}
                              data-testid={`button-delete-option-${qi}-${oi}`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {q.options.length < 5 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newQ = [...currentEditContent.questions];
                          newQ[qi].options.push("");
                          setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                        }}
                        className="mt-2"
                        data-testid={`button-add-option-${qi}`}
                      >
                        + Agregar opción
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveContent}
                disabled={saving}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600"
                data-testid="button-save-lectura"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : `Guardar ${
                  contentCategory === "preescolar" ? "Pre-escolar" : 
                  contentCategory === "ninos" ? "Niños" : 
                  contentCategory === "adolescentes" ? "Adolescentes" :
                  contentCategory === "universitarios" ? "Universitarios" :
                  contentCategory === "profesionales" ? "Profesionales" : "Adulto Mayor"
                }`}
              </Button>
              </>
              )}

              {contentType === "razonamiento" && (
              <>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Tema de razonamiento</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {razonamientoThemes.map((theme) => (
                    <Button
                      key={theme.temaNumero}
                      size="sm"
                      onClick={() => setSelectedRazonamientoTema(theme.temaNumero)}
                      variant={selectedRazonamientoTema === theme.temaNumero ? "default" : "outline"}
                      className={selectedRazonamientoTema === theme.temaNumero ? "bg-cyan-600" : "border-cyan-500/30 text-cyan-400"}
                      data-testid={`button-razonamiento-tema-${theme.temaNumero}`}
                    >
                      Tema {String(theme.temaNumero).padStart(2, '0')}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => {
                      const maxTema = Math.max(...razonamientoThemes.map(t => t.temaNumero), 0);
                      setSelectedRazonamientoTema(maxTema + 1);
                      setRazonamientoContent({ title: "", imageUrl: "", imageSize: 100, questions: [] });
                    }}
                    variant="outline"
                    className="border-green-500/30 text-green-400"
                    data-testid="button-add-razonamiento-tema"
                  >
                    + Nuevo Tema
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1 block">Título del test</label>
                <Input
                  value={razonamientoContent.title}
                  onChange={(e) => setRazonamientoContent(p => ({ ...p, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="input-razonamiento-title"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1 block">URL de imagen (opcional)</label>
                <Input
                  value={razonamientoContent.imageUrl}
                  onChange={(e) => setRazonamientoContent(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="input-razonamiento-image-url"
                />
              </div>

              {razonamientoContent.imageUrl && (
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Tamaño de imagen: {razonamientoContent.imageSize}%</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={razonamientoContent.imageSize}
                    onChange={(e) => setRazonamientoContent(p => ({ ...p, imageSize: parseInt(e.target.value) }))}
                    className="w-full"
                    data-testid="slider-razonamiento-image-size"
                  />
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={razonamientoContent.imageUrl} 
                      alt="Vista previa" 
                      style={{ width: `${razonamientoContent.imageSize}%`, maxWidth: '300px' }}
                      className="rounded-lg border border-white/20"
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Preguntas de razonamiento</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      setRazonamientoContent(p => ({
                        ...p,
                        questions: [...p.questions, { question: "", options: ["", ""], correct: 0 }]
                      }));
                    }}
                    className="bg-cyan-600"
                    data-testid="button-add-razonamiento-question"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar pregunta
                  </Button>
                </div>
                {razonamientoContent.questions.map((q, qi) => (
                  <div key={qi} className="bg-white/5 rounded-lg p-4 mb-3">
                    <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
                      <span className="text-cyan-400 font-medium">Pregunta {qi + 1}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const newQ = razonamientoContent.questions.filter((_, i) => i !== qi);
                          setRazonamientoContent(p => ({ ...p, questions: newQ }));
                        }}
                        data-testid={`button-delete-razonamiento-question-${qi}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      value={q.question}
                      onChange={(e) => {
                        const newQ = [...razonamientoContent.questions];
                        newQ[qi].question = e.target.value;
                        setRazonamientoContent(p => ({ ...p, questions: newQ }));
                      }}
                      placeholder="Escribe la pregunta..."
                      className="bg-white/10 border-white/20 text-white mb-3"
                      data-testid={`input-razonamiento-question-${qi}`}
                    />
                    <label className="text-white/40 text-xs mb-2 block">Opciones (haz clic en la correcta):</label>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex flex-wrap gap-2 items-center">
                          <Button
                            size="sm"
                            variant={q.correct === oi ? "default" : "outline"}
                            onClick={() => {
                              const newQ = [...razonamientoContent.questions];
                              newQ[qi].correct = oi;
                              setRazonamientoContent(p => ({ ...p, questions: newQ }));
                            }}
                            className={q.correct === oi ? "toggle-elevate toggle-elevated" : "toggle-elevate"}
                            data-testid={`button-razonamiento-correct-${qi}-${oi}`}
                          >
                            {oi + 1}
                          </Button>
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newQ = [...razonamientoContent.questions];
                              newQ[qi].options[oi] = e.target.value;
                              setRazonamientoContent(p => ({ ...p, questions: newQ }));
                            }}
                            placeholder={`Opción ${oi + 1}...`}
                            className="bg-white/10 border-white/20 text-white flex-1"
                            data-testid={`input-razonamiento-option-${qi}-${oi}`}
                          />
                          {q.options.length > 2 && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const newQ = [...razonamientoContent.questions];
                                newQ[qi].options = newQ[qi].options.filter((_, i) => i !== oi);
                                if (newQ[qi].correct >= newQ[qi].options.length) {
                                  newQ[qi].correct = newQ[qi].options.length - 1;
                                }
                                setRazonamientoContent(p => ({ ...p, questions: newQ }));
                              }}
                              data-testid={`button-delete-razonamiento-option-${qi}-${oi}`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {q.options.length < 5 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newQ = [...razonamientoContent.questions];
                          newQ[qi].options.push("");
                          setRazonamientoContent(p => ({ ...p, questions: newQ }));
                        }}
                        className="mt-2"
                        data-testid={`button-add-razonamiento-option-${qi}`}
                      >
                        + Agregar opción
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveRazonamiento}
                disabled={saving}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600"
                data-testid="button-save-razonamiento"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : `Guardar Razonamiento ${
                  contentCategory === "preescolar" ? "Pre-escolar" : 
                  contentCategory === "ninos" ? "Niños" : 
                  contentCategory === "adolescentes" ? "Adolescentes" :
                  contentCategory === "universitarios" ? "Universitarios" :
                  contentCategory === "profesionales" ? "Profesionales" : "Adulto Mayor"
                }`}
              </Button>
              </>
              )}

              {contentType === "cerebral" && (
              <>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Ejercicio de Test Cerebral</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {cerebralThemes.map((theme) => (
                    <Button
                      key={theme.temaNumero}
                      size="sm"
                      onClick={() => setSelectedCerebralTema(theme.temaNumero)}
                      variant={selectedCerebralTema === theme.temaNumero ? "default" : "outline"}
                      className={selectedCerebralTema === theme.temaNumero ? "bg-purple-600" : "border-purple-500/30 text-purple-400"}
                      data-testid={`button-cerebral-tema-${theme.temaNumero}`}
                    >
                      Ejercicio {String(theme.temaNumero).padStart(2, '0')}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => {
                      const maxTema = Math.max(...cerebralThemes.map(t => t.temaNumero), 0);
                      setSelectedCerebralTema(maxTema + 1);
                      setCerebralContent({ 
                        title: "", exerciseType: "bailarina", imageUrl: "", imageSize: 100, 
                        exerciseData: { instruction: "", correctAnswer: "", answerOptions: DEFAULT_BAILARINA_OPTIONS }, isActive: true 
                      });
                    }}
                    variant="outline"
                    className="border-green-500/30 text-green-400"
                    data-testid="button-add-cerebral-tema"
                  >
                    + Nuevo Ejercicio
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1 block">Tipo de ejercicio</label>
                <select
                  value={cerebralContent.exerciseType}
                  onChange={(e) => setCerebralContent(p => ({ ...p, exerciseType: e.target.value }))}
                  className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white"
                  data-testid="select-cerebral-type"
                >
                  {EXERCISE_TYPES.map(type => (
                    <option key={type.value} value={type.value} className="bg-gray-800">
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-white/40 text-xs mt-1">
                  {cerebralContent.exerciseType === "bailarina" && "Usuario indica dirección (izq/der) de una imagen"}
                  {cerebralContent.exerciseType === "secuencia" && "Usuario completa el número faltante en una serie"}
                  {cerebralContent.exerciseType === "memoria" && "Usuario memoriza y recuerda elementos visuales"}
                  {cerebralContent.exerciseType === "patron" && "Usuario identifica el patrón en una secuencia visual"}
                  {cerebralContent.exerciseType === "stroop" && "Usuario elige el COLOR del texto, no la palabra escrita"}
                </p>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1 block">Título del ejercicio</label>
                <Input
                  value={cerebralContent.title}
                  onChange={(e) => setCerebralContent(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ej: Ejercicio de Bailarina - Nivel 1"
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="input-cerebral-title"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1 block">URL de imagen</label>
                <Input
                  value={cerebralContent.imageUrl}
                  onChange={(e) => setCerebralContent(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://ejemplo.com/bailarina.jpg"
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="input-cerebral-image-url"
                />
              </div>

              {cerebralContent.imageUrl && (
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Tamaño de imagen: {cerebralContent.imageSize}%</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={cerebralContent.imageSize}
                    onChange={(e) => setCerebralContent(p => ({ ...p, imageSize: parseInt(e.target.value) }))}
                    className="w-full"
                    data-testid="slider-cerebral-image-size"
                  />
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={cerebralContent.imageUrl} 
                      alt="Vista previa" 
                      style={{ width: `${cerebralContent.imageSize}%`, maxWidth: '300px' }}
                      className="rounded-lg border border-white/20"
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 p-3 rounded-md bg-white/5 border border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cerebralContent.exerciseData.timerEnabled || false}
                    onChange={(e) => setCerebralContent(p => ({
                      ...p,
                      exerciseData: { ...p.exerciseData, timerEnabled: e.target.checked }
                    }))}
                    className="w-4 h-4"
                  />
                  <span className="text-white/80 text-sm">Límite de tiempo</span>
                </label>
                {cerebralContent.exerciseData.timerEnabled && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={cerebralContent.exerciseData.timerSeconds || 30}
                      onChange={(e) => setCerebralContent(p => ({
                        ...p,
                        exerciseData: { ...p.exerciseData, timerSeconds: parseInt(e.target.value) || 30 }
                      }))}
                      className="w-20 bg-white/10 border-white/20 text-white text-center"
                      min={5}
                      max={300}
                    />
                    <span className="text-white/60 text-sm">segundos</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-white font-semibold mb-3">Datos del ejercicio ({cerebralContent.exerciseType})</h3>
                
                {cerebralContent.exerciseType === "bailarina" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Instrucción</label>
                      <Input
                        value={cerebralContent.exerciseData.instruction || ""}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, instruction: e.target.value } 
                        }))}
                        placeholder="Ej: ¿Hacia dónde gira la bailarina?"
                        className="bg-white/10 border-white/20 text-white"
                        data-testid="input-cerebral-instruction"
                      />
                    </div>
                    
                    {/* Custom Answer Options */}
                    <div className="border border-white/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-white/60 text-sm">Opciones de respuesta</label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const options = cerebralContent.exerciseData.answerOptions || [];
                            const newId = String(Date.now());
                            setCerebralContent(p => ({
                              ...p,
                              exerciseData: {
                                ...p.exerciseData,
                                answerOptions: [...options, { id: newId, label: "", value: "", position: options.length }]
                              }
                            }));
                          }}
                          className="border-cyan-500/50 text-cyan-400"
                          data-testid="button-add-option"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Agregar opción
                        </Button>
                      </div>
                      
                      {(!cerebralContent.exerciseData.answerOptions || cerebralContent.exerciseData.answerOptions.length === 0) && (
                        <p className="text-white/40 text-sm text-center py-2">
                          Sin opciones personalizadas. Se usarán: Izquierda, Derecha, Ambos
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        {(cerebralContent.exerciseData.answerOptions || []).map((opt: {id: string; label: string; value: string; position: number}, idx: number) => (
                          <div key={opt.id} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                            <div className="flex flex-col gap-1 flex-1">
                              <Input
                                value={opt.label}
                                onChange={(e) => {
                                  const options = [...(cerebralContent.exerciseData.answerOptions || [])];
                                  options[idx] = { ...opt, label: e.target.value };
                                  setCerebralContent(p => ({
                                    ...p,
                                    exerciseData: { ...p.exerciseData, answerOptions: options }
                                  }));
                                }}
                                placeholder="Etiqueta visible (ej: Izquierda)"
                                className="bg-white/10 border-white/20 text-white text-sm"
                                data-testid={`input-option-label-${idx}`}
                              />
                              <Input
                                value={opt.value}
                                onChange={(e) => {
                                  const options = [...(cerebralContent.exerciseData.answerOptions || [])];
                                  options[idx] = { ...opt, value: e.target.value };
                                  setCerebralContent(p => ({
                                    ...p,
                                    exerciseData: { ...p.exerciseData, answerOptions: options }
                                  }));
                                }}
                                placeholder="Valor interno (ej: izquierda)"
                                className="bg-white/10 border-white/20 text-white text-sm"
                                data-testid={`input-option-value-${idx}`}
                              />
                            </div>
                            <div className="flex flex-col gap-1 items-center">
                              <span className="text-white/40 text-xs">Pos.</span>
                              <Input
                                type="number"
                                min={0}
                                value={opt.position}
                                onChange={(e) => {
                                  const options = [...(cerebralContent.exerciseData.answerOptions || [])];
                                  options[idx] = { ...opt, position: parseInt(e.target.value) || 0 };
                                  setCerebralContent(p => ({
                                    ...p,
                                    exerciseData: { ...p.exerciseData, answerOptions: options }
                                  }));
                                }}
                                className="w-14 bg-white/10 border-white/20 text-white text-center text-sm"
                                data-testid={`input-option-position-${idx}`}
                              />
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const options = (cerebralContent.exerciseData.answerOptions || []).filter((_: any, i: number) => i !== idx);
                                setCerebralContent(p => ({
                                  ...p,
                                  exerciseData: { ...p.exerciseData, answerOptions: options }
                                }));
                              }}
                              className="text-red-400"
                              data-testid={`button-delete-option-${idx}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Respuesta correcta (valor interno)</label>
                      {(cerebralContent.exerciseData.answerOptions && cerebralContent.exerciseData.answerOptions.length > 0) ? (
                        <select
                          value={cerebralContent.exerciseData.correctAnswer || ""}
                          onChange={(e) => setCerebralContent(p => ({ 
                            ...p, 
                            exerciseData: { ...p.exerciseData, correctAnswer: e.target.value } 
                          }))}
                          className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white"
                          data-testid="select-cerebral-answer"
                        >
                          <option value="" className="bg-gray-800">Seleccionar...</option>
                          {(cerebralContent.exerciseData.answerOptions || []).map((opt: {id: string; label: string; value: string}) => (
                            <option key={opt.id} value={opt.value} className="bg-gray-800">
                              {opt.label} ({opt.value})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={cerebralContent.exerciseData.correctAnswer || ""}
                          onChange={(e) => setCerebralContent(p => ({ 
                            ...p, 
                            exerciseData: { ...p.exerciseData, correctAnswer: e.target.value } 
                          }))}
                          className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white"
                          data-testid="select-cerebral-answer"
                        >
                          <option value="" className="bg-gray-800">Seleccionar...</option>
                          <option value="izquierda" className="bg-gray-800">Izquierda</option>
                          <option value="derecha" className="bg-gray-800">Derecha</option>
                          <option value="ambos" className="bg-gray-800">Ambos lados</option>
                        </select>
                      )}
                    </div>
                  </div>
                )}

                {cerebralContent.exerciseType === "secuencia" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Secuencia a mostrar</label>
                      <Input
                        value={cerebralContent.exerciseData.sequence || ""}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, sequence: e.target.value } 
                        }))}
                        placeholder="Ej: 2, 4, 6, 8, ?"
                        className="bg-white/10 border-white/20 text-white"
                        data-testid="input-cerebral-sequence"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Opciones de respuesta (separadas por coma)</label>
                      <Input
                        value={(cerebralContent.exerciseData.sequenceOptions || []).join(", ")}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, sequenceOptions: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) } 
                        }))}
                        placeholder="Ej: 8, 10, 12, 14"
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <p className="text-white/40 text-xs mt-1">Deja vacío para entrada de texto libre</p>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Respuesta correcta</label>
                      {(cerebralContent.exerciseData.sequenceOptions?.length > 0) ? (
                        <select
                          value={cerebralContent.exerciseData.correctAnswer || ""}
                          onChange={(e) => setCerebralContent(p => ({ 
                            ...p, 
                            exerciseData: { ...p.exerciseData, correctAnswer: e.target.value } 
                          }))}
                          className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white"
                        >
                          <option value="" className="bg-gray-800">Seleccionar...</option>
                          {(cerebralContent.exerciseData.sequenceOptions || []).map((opt: string) => (
                            <option key={opt} value={opt} className="bg-gray-800">{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={cerebralContent.exerciseData.correctAnswer || ""}
                          onChange={(e) => setCerebralContent(p => ({ 
                            ...p, 
                            exerciseData: { ...p.exerciseData, correctAnswer: e.target.value } 
                          }))}
                          placeholder="Ej: 10"
                          className="bg-white/10 border-white/20 text-white"
                          data-testid="input-cerebral-sequence-answer"
                        />
                      )}
                    </div>
                  </div>
                )}

                {cerebralContent.exerciseType === "memoria" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Elementos a memorizar (emojis o texto, separados por coma)</label>
                      <Input
                        value={(cerebralContent.exerciseData.memoriaItems || []).join(", ")}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, memoriaItems: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) } 
                        }))}
                        placeholder="Ej: 🍎, 🍊, 🍋, 🍇"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Opciones totales (incluye distractores)</label>
                      <Input
                        value={(cerebralContent.exerciseData.memoriaOptions || []).join(", ")}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, memoriaOptions: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) } 
                        }))}
                        placeholder="Ej: 🍎, 🍊, 🍋, 🍇, 🍓, 🍑, 🥝, 🍒"
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <p className="text-white/40 text-xs mt-1">Incluye los correctos + algunos extras para confundir</p>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Tiempo para memorizar: {cerebralContent.exerciseData.memorizeTime || 5}s</label>
                      <input
                        type="range"
                        min={3}
                        max={15}
                        value={cerebralContent.exerciseData.memorizeTime || 5}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, memorizeTime: parseInt(e.target.value) } 
                        }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {cerebralContent.exerciseType === "patron" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Secuencia del patrón (emojis o texto, separados por coma)</label>
                      <Input
                        value={(cerebralContent.exerciseData.patronSequence || []).join(", ")}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, patronSequence: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) } 
                        }))}
                        placeholder="Ej: 🔴, 🔵, 🔴, 🔵, ?"
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <p className="text-white/40 text-xs mt-1">Usa ? para indicar dónde va la respuesta</p>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Opciones de respuesta (separadas por coma)</label>
                      <Input
                        value={(cerebralContent.exerciseData.patronOptions || []).join(", ")}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, patronOptions: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) } 
                        }))}
                        placeholder="Ej: 🔴, 🔵, 🟢, 🟡"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Respuesta correcta</label>
                      {(cerebralContent.exerciseData.patronOptions?.length > 0) ? (
                        <select
                          value={cerebralContent.exerciseData.correctAnswer || ""}
                          onChange={(e) => setCerebralContent(p => ({ 
                            ...p, 
                            exerciseData: { ...p.exerciseData, correctAnswer: e.target.value } 
                          }))}
                          className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white"
                        >
                          <option value="" className="bg-gray-800">Seleccionar...</option>
                          {(cerebralContent.exerciseData.patronOptions || []).map((opt: string) => (
                            <option key={opt} value={opt} className="bg-gray-800">{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={cerebralContent.exerciseData.correctAnswer || ""}
                          onChange={(e) => setCerebralContent(p => ({ 
                            ...p, 
                            exerciseData: { ...p.exerciseData, correctAnswer: e.target.value } 
                          }))}
                          placeholder="Respuesta esperada..."
                          className="bg-white/10 border-white/20 text-white"
                        />
                      )}
                    </div>
                  </div>
                )}

                {cerebralContent.exerciseType === "stroop" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Palabra a mostrar</label>
                      <Input
                        value={cerebralContent.exerciseData.stroopWord || ""}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, stroopWord: e.target.value } 
                        }))}
                        placeholder="Ej: Rojo, Azul, Verde..."
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Color del texto (hex o nombre)</label>
                      <div className="flex gap-2">
                        <Input
                          value={cerebralContent.exerciseData.stroopColor || ""}
                          onChange={(e) => setCerebralContent(p => ({ 
                            ...p, 
                            exerciseData: { ...p.exerciseData, stroopColor: e.target.value } 
                          }))}
                          placeholder="Ej: red, blue, #FF0000..."
                          className="bg-white/10 border-white/20 text-white flex-1"
                        />
                        {cerebralContent.exerciseData.stroopWord && cerebralContent.exerciseData.stroopColor && (
                          <div 
                            className="px-4 py-2 bg-white rounded-md font-bold text-xl"
                            style={{ color: cerebralContent.exerciseData.stroopColor }}
                          >
                            {cerebralContent.exerciseData.stroopWord}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Opciones de respuesta (separadas por coma)</label>
                      <Input
                        value={(cerebralContent.exerciseData.stroopOptions || []).join(", ")}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, stroopOptions: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) } 
                        }))}
                        placeholder="Ej: Rojo, Azul, Verde, Amarillo"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Respuesta correcta (el COLOR, no la palabra)</label>
                      {(cerebralContent.exerciseData.stroopOptions?.length > 0) ? (
                        <select
                          value={cerebralContent.exerciseData.correctAnswer || ""}
                          onChange={(e) => setCerebralContent(p => ({ 
                            ...p, 
                            exerciseData: { ...p.exerciseData, correctAnswer: e.target.value } 
                          }))}
                          className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white"
                        >
                          <option value="" className="bg-gray-800">Seleccionar...</option>
                          {(cerebralContent.exerciseData.stroopOptions || []).map((opt: string) => (
                            <option key={opt} value={opt} className="bg-gray-800">{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={cerebralContent.exerciseData.correctAnswer || ""}
                          onChange={(e) => setCerebralContent(p => ({ 
                            ...p, 
                            exerciseData: { ...p.exerciseData, correctAnswer: e.target.value } 
                          }))}
                          placeholder="Respuesta esperada..."
                          className="bg-white/10 border-white/20 text-white"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 py-2">
                <label className="text-white/60 text-sm">Estado del ejercicio:</label>
                <Button
                  size="sm"
                  onClick={() => setCerebralContent(p => ({ ...p, isActive: !p.isActive }))}
                  variant={cerebralContent.isActive ? "default" : "outline"}
                  className={cerebralContent.isActive ? "bg-green-600" : "border-red-500/30 text-red-400"}
                  data-testid="button-toggle-cerebral-active"
                >
                  {cerebralContent.isActive ? "Activo" : "Inactivo"}
                </Button>
              </div>

              <Button
                onClick={handleSaveCerebral}
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                data-testid="button-save-cerebral"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : `Guardar Test Cerebral ${
                  contentCategory === "preescolar" ? "Pre-escolar" : 
                  contentCategory === "ninos" ? "Niños" : 
                  contentCategory === "adolescentes" ? "Adolescentes" :
                  contentCategory === "universitarios" ? "Universitarios" :
                  contentCategory === "profesionales" ? "Profesionales" : "Adulto Mayor"
                }`}
              </Button>
              </>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
