import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { motion } from "framer-motion";
import { Users, Monitor, Smartphone, Globe, Clock, LogOut, RefreshCw, FileText, BookOpen, Save, Plus, Trash2, X, Brain, Zap, ImageIcon, Upload, Copy, Check, ChevronDown, Pencil } from "lucide-react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
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
  const [editorModeEnabled, setEditorModeEnabled] = useState(() => localStorage.getItem("editorMode") === "true");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [data, setData] = useState<SessionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"sesiones" | "resultados" | "resultados-razonamiento" | "resultados-cerebral" | "resultados-entrenamiento" | "resultados-velocidad" | "contenido" | "imagenes" | "entrenamiento">("sesiones");
  const [trainingResults, setTrainingResults] = useState<any[]>([]);
  const [expandedTrainingResult, setExpandedTrainingResult] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [cerebralResults, setCerebralResults] = useState<any[]>([]);
  const [resultFilter, setResultFilter] = useState<"all" | "preescolar" | "ninos" | "adolescentes" | "universitarios" | "profesionales" | "adulto_mayor">("all");
  const [contentCategory, setContentCategory] = useState<"preescolar" | "ninos" | "adolescentes" | "universitarios" | "profesionales" | "adulto_mayor">("preescolar");
  const [selectedTema, setSelectedTema] = useState(1);
  const [availableThemes, setAvailableThemes] = useState<{temaNumero: number; title: string}[]>([]);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [expandedCerebralResult, setExpandedCerebralResult] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"lectura" | "razonamiento" | "cerebral">("lectura");
  const [sessionPage, setSessionPage] = useState(1);
  const SESSIONS_PER_PAGE = 20;
  
  // Images state
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [imageName, setImageName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
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
  
  // Cerebral intro content state
  const [cerebralIntro, setCerebralIntro] = useState({
    imageUrl: "",
    title: "¿Cuál lado de tu cerebro es más dominante?",
    subtitle: "El test tiene una duración de 30 segundos.",
    buttonText: "Empezar"
  });
  
  // Image picker state
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerCallback, setImagePickerCallback] = useState<((url: string) => void) | null>(null);
  
  // Entrenamiento state
  const [entrenamientoCategory, setEntrenamientoCategory] = useState<"ninos" | "adolescentes" | "universitarios" | "profesionales" | "adulto_mayor">("ninos");
  const [entrenamientoCard, setEntrenamientoCard] = useState({
    imageUrl: "",
    title: "Entrenamiento",
    description: "Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas",
    buttonText: "Comenzar"
  });
  const [entrenamientoPage, setEntrenamientoPage] = useState({
    bannerText: "¡Disfruta ahora de ejercicios de entrenamiento gratuitos por tiempo limitado!",
    pageTitle: "Entrenamientos",
    pageDescription: "Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas"
  });
  const [entrenamientoItems, setEntrenamientoItems] = useState<{id: string; title: string; description: string; imageUrl: string; linkUrl: string; sortOrder: number; isActive: boolean; tipoEjercicio?: string; prepImage?: string; prepTitle?: string; prepSubtitle?: string; prepInstructions?: string; prepButtonText?: string}[]>([]);
  const [editingEntrenamientoItem, setEditingEntrenamientoItem] = useState<string | null>(null);
  
  // Páginas de preparación
  const [prepPages, setPrepPages] = useState<{id: string; nombre: string; imagen?: string; titulo?: string; subtitulo?: string; instrucciones?: string; textoBoton?: string}[]>([]);
  const [selectedPrepPageId, setSelectedPrepPageId] = useState<string | null>(null);
  const [editingPrepPage, setEditingPrepPage] = useState<{id?: string; nombre: string; imagen?: string; titulo?: string; subtitulo?: string; instrucciones?: string; textoBoton?: string} | null>(null);
  
  // Ejercicios de velocidad
  type NivelConfig = { nivel: number; patron: string; velocidad: number; palabras: string; opciones: string; tipoPregunta: string };
  const [editingVelocidadItem, setEditingVelocidadItem] = useState<string | null>(null);
  const [velocidadEjercicio, setVelocidadEjercicio] = useState<{
    id?: string;
    entrenamientoItemId: string;
    titulo: string;
    descripcion: string;
    imagenCabecera: string;
    niveles: NivelConfig[];
    tiempoAnimacionInicial: number;
    velocidadAnimacion: number;
    isActive: boolean;
  } | null>(null);
  
  // Página de introducción de Números
  const [numerosIntroData, setNumerosIntroData] = useState<{
    id?: string;
    entrenamientoItemId: string;
    titulo: string;
    descripcion: string;
    subtitulo: string;
    imagenCabecera: string;
  } | null>(null);
  
  // Configuración de Aceleración de Lectura
  const [aceleracionData, setAceleracionData] = useState<{
    id?: string;
    entrenamientoItemId: string;
    imagenCabecera: string;
    titulo: string;
    velocidadPPM: number;
    modoGolpePorcentaje: number;
  } | null>(null);
  
  const EXERCISE_TYPES = [
    { value: "bailarina", label: "Bailarina (dirección visual)" },
    { value: "secuencia", label: "Secuencia numérica" },
    { value: "memoria", label: "Memoria visual" },
    { value: "patron", label: "Patrón visual" },
    { value: "stroop", label: "Test Stroop (color vs palabra)" },
    { value: "preferencia", label: "Preferencia visual (proyectivo)" },
    { value: "lateralidad", label: "Lateralidad (izquierda/derecha)" },
    { value: "aceleracion_lectura", label: "Aceleración de Lectura (PDF)" },
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

  const handleUnauthorized = async () => {
    const savedUser = localStorage.getItem("adminUser");
    const savedPass = localStorage.getItem("adminPass");
    if (savedUser && savedPass) {
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: savedUser, password: savedPass }),
        });
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("adminToken", data.token);
          return data.token;
        }
      } catch {}
    }
    setIsLoggedIn(false);
    setToken("");
    localStorage.removeItem("adminToken");
    return null;
  };

  const getValidToken = async (): Promise<string | null> => {
    if (token) {
      const testRes = await fetch("/api/admin/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (testRes.ok) return token;
    }
    return await handleUnauthorized();
  };

  const adminFetch = async (url: string, options: RequestInit = {}) => {
    let currentToken = token;
    const headers = { ...options.headers, Authorization: `Bearer ${currentToken}` };
    let res = await fetch(url, { ...options, headers });
    
    if (res.status === 401) {
      currentToken = await handleUnauthorized();
      if (currentToken) {
        headers.Authorization = `Bearer ${currentToken}`;
        res = await fetch(url, { ...options, headers });
      }
    }
    return res;
  };

  const fetchSessions = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        const newToken = await handleUnauthorized();
        if (newToken) {
          const retryRes = await fetch("/api/admin/sessions", {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          if (retryRes.ok) {
            const data = await retryRes.json();
            setData(data);
          }
        }
      } else if (res.ok) {
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
      
      // Also fetch cerebral results
      const cerebralRes = await fetch("/api/admin/cerebral-results", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cerebralRes.ok) {
        const cerebralData = await cerebralRes.json();
        setCerebralResults(cerebralData);
      }
      
      // Also fetch training results
      const trainingRes = await fetch("/api/training-results", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (trainingRes.ok) {
        const { results } = await trainingRes.json();
        setTrainingResults(results || []);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
    }
  };

  const fetchTrainingResultsOnly = async () => {
    if (!token) return;
    try {
      const trainingRes = await fetch("/api/training-results", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (trainingRes.ok) {
        const { results } = await trainingRes.json();
        setTrainingResults(results || []);
      }
    } catch {
      console.error("Error fetching training results");
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

  const handleSaveCerebralIntro = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cerebral/intro", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          categoria: contentCategory,
          ...cerebralIntro
        }),
      });
      if (res.ok) {
        alert("Intro de Test Cerebral guardado correctamente");
      } else {
        alert("Error al guardar intro");
      }
    } catch {
      alert("Error al guardar intro");
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
  
  const filteredLecturaResults = quizResults.filter(r => {
    const isLectura = (r as any).testType === "lectura" || !(r as any).testType;
    if (resultFilter === "all") return isLectura;
    return r.categoria === resultFilter && isLectura;
  });

  const filteredRazonamientoResults = quizResults.filter(r => {
    const isRazonamiento = (r as any).testType === "razonamiento";
    if (resultFilter === "all") return isRazonamiento;
    return r.categoria === resultFilter && isRazonamiento;
  });

  const filteredVelocidadResults = quizResults.filter(r => {
    const isVelocidad = (r as any).testType === "velocidad";
    if (resultFilter === "all") return isVelocidad;
    return r.categoria === resultFilter && isVelocidad;
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken("");
    localStorage.removeItem("adminToken");
  };

  useEffect(() => {
    // Try to auto-login with saved credentials (tokens expire on server restart)
    const savedUser = localStorage.getItem("adminUser");
    const savedPass = localStorage.getItem("adminPass");
    
    if (savedUser && savedPass) {
      // Auto-login to get fresh token
      fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: savedUser, password: savedPass }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            setToken(data.token);
            localStorage.setItem("adminToken", data.token);
            setIsLoggedIn(true);
          } else {
            // Clear invalid saved credentials
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            localStorage.removeItem("adminPass");
          }
        })
        .catch(() => {
          localStorage.removeItem("adminToken");
        });
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

  // Load cerebral themes and intro
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
        // Also load intro
        try {
          const introRes = await fetch(`/api/cerebral/${contentCategory}/intro`);
          const introData = await introRes.json();
          if (introData.intro) {
            setCerebralIntro({
              imageUrl: introData.intro.imageUrl || "",
              title: introData.intro.title || "¿Cuál lado de tu cerebro es más dominante?",
              subtitle: introData.intro.subtitle || "El test tiene una duración de 30 segundos.",
              buttonText: introData.intro.buttonText || "Empezar"
            });
          }
        } catch {}
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

  // Load uploaded images
  useEffect(() => {
    if (isLoggedIn && activeTab === "imagenes") {
      fetch("/api/images")
        .then(res => res.json())
        .then(data => setUploadedImages(data || []))
        .catch(() => setUploadedImages([]));
    }
  }, [isLoggedIn, activeTab]);

  // Image handling functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageName(file.name.replace(/\.[^/.]+$/, ""));
    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      compressImage(reader.result as string, compressionQuality);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = useCallback((src: string, quality: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Apply crop if set
      if (crop && crop.width && crop.height) {
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, crop.x || 0, crop.y || 0, crop.width, crop.height, 0, 0, crop.width, crop.height);
      } else {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
      }
      
      // Check if PNG (preserve transparency) or JPEG with compression
      const isPng = src.startsWith('data:image/png');
      const compressed = isPng 
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', quality / 100);
      
      // Calculate actual compressed size from base64
      const base64Length = compressed.split(',')[1]?.length || 0;
      const actualBytes = Math.round(base64Length * 0.75);
      setCompressedSize(actualBytes);
    };
    img.src = src;
  }, [crop]);

  useEffect(() => {
    if (imagePreview) {
      compressImage(imagePreview, compressionQuality);
    }
  }, [compressionQuality, crop, imagePreview, compressImage]);

  const saveImage = async () => {
    if (!imagePreview || !imageName) return;
    
    // Get token from state or localStorage
    const authToken = token || localStorage.getItem("adminToken");
    if (!authToken) {
      setError("No autorizado. Por favor inicia sesión de nuevo.");
      return;
    }
    
    setSaving(true);
    try {
      const img = new Image();
      img.src = imagePreview;
      await new Promise(resolve => img.onload = resolve);
      
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate crop in pixels based on displayed image dimensions
      if (crop && crop.width && crop.height && imgRef.current) {
        const scaleX = img.naturalWidth / imgRef.current.width;
        const scaleY = img.naturalHeight / imgRef.current.height;
        
        const cropX = (crop.x || 0) * scaleX;
        const cropY = (crop.y || 0) * scaleY;
        const cropW = crop.width * scaleX;
        const cropH = crop.height * scaleY;
        
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        width = Math.round(cropW);
        height = Math.round(cropH);
      } else {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
      }
      
      // Preserve PNG transparency, otherwise use JPEG
      const isPng = imagePreview.startsWith('data:image/png');
      const data = isPng 
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', compressionQuality / 100);
      
      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify({ 
          name: imageName, 
          data,
          originalSize,
          compressedSize,
          width,
          height
        }),
      });
      
      if (res.ok) {
        const newImage = await res.json();
        setUploadedImages(prev => [newImage, ...prev]);
        setImageFile(null);
        setImagePreview("");
        setCrop(undefined);
        setImageName("");
        alert("Imagen guardada correctamente. Usa el botón 'Copiar' para obtener el link.");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error al guardar: ${errData.error || res.statusText}. Intenta cerrar sesión y volver a entrar.`);
      }
    } catch (err) {
      alert("Error al guardar la imagen. Verifica tu conexión.");
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (id: string) => {
    const authToken = token || localStorage.getItem("adminToken");
    await fetch(`/api/admin/images/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${authToken}` },
    });
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const copyImageUrl = (id: string) => {
    // Use the short URL format that serves the actual image
    const url = `${window.location.origin}/api/images/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const formatTipoEstudiante = (tipo: string | null) => {
    if (!tipo) return "-";
    const map: Record<string, string> = {
      "universitario": "Universitario",
      "profesional": "Profesional",
      "ocupacion": "Ocupación",
      "estudiante": "Estudiante"
    };
    return map[tipo] || tipo;
  };

  // Load entrenamiento data when tab is activated
  useEffect(() => {
    if (isLoggedIn && activeTab === "entrenamiento") {
      const loadEntrenamientoData = async () => {
        const token = localStorage.getItem("admin_token") || "";
        const cat = entrenamientoCategory;
        try {
          const [cardRes, pageRes, itemsRes, prepPagesRes, catPrepRes] = await Promise.all([
            fetch(`/api/entrenamiento/${cat}/card`),
            fetch(`/api/entrenamiento/${cat}/page`),
            fetch(`/api/entrenamiento/${cat}/items`),
            fetch(`/api/admin/prep-pages`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`/api/admin/categoria-prep/${cat}`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          const cardData = await cardRes.json();
          const pageData = await pageRes.json();
          const itemsData = await itemsRes.json();
          const prepPagesData = await prepPagesRes.json();
          const catPrepData = await catPrepRes.json();
          if (cardData.card) setEntrenamientoCard(cardData.card);
          if (pageData.page) setEntrenamientoPage(pageData.page);
          setEntrenamientoItems(itemsData.items || []);
          setPrepPages(prepPagesData.pages || []);
          setSelectedPrepPageId(catPrepData.mapping?.prepPageId || null);
          
          // Cargar configuración de aceleración para items de tipo aceleracion_lectura
          const aceleracionItem = (itemsData.items || []).find((i: {tipoEjercicio?: string}) => i.tipoEjercicio === "aceleracion_lectura");
          if (aceleracionItem) {
            try {
              const accelRes = await fetch(`/api/aceleracion/${aceleracionItem.id}`);
              const accelData = await accelRes.json();
              if (accelData.ejercicio) {
                setAceleracionData({
                  id: accelData.ejercicio.id,
                  entrenamientoItemId: aceleracionItem.id,
                  imagenCabecera: accelData.ejercicio.imagenCabecera || "",
                  titulo: accelData.ejercicio.titulo || "Acelera al máximo tu Lectura",
                  velocidadPPM: accelData.ejercicio.velocidadPPM || 200,
                  modoGolpePorcentaje: accelData.ejercicio.modoGolpePorcentaje || 50
                });
              } else {
                setAceleracionData({
                  entrenamientoItemId: aceleracionItem.id,
                  imagenCabecera: "",
                  titulo: "Acelera al máximo tu Lectura",
                  velocidadPPM: 200,
                  modoGolpePorcentaje: 50
                });
              }
            } catch (e) { console.error(e); }
          }
        } catch (e) { console.error(e); }
      };
      loadEntrenamientoData();
    }
  }, [isLoggedIn, activeTab, entrenamientoCategory]);

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
            Resultados Lectura
          </button>
          <button
            onClick={() => setActiveTab("resultados-razonamiento")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "resultados-razonamiento" ? "bg-blue-600 text-white" : "text-blue-400 hover:bg-white/10"
            }`}
            data-testid="sidebar-resultados-razonamiento"
          >
            <Brain className="w-5 h-5" />
            Resultados Razonamiento
          </button>
          <button
            onClick={() => setActiveTab("resultados-cerebral")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "resultados-cerebral" ? "bg-purple-600 text-white" : "text-purple-400 hover:bg-white/10"
            }`}
            data-testid="sidebar-resultados-cerebral"
          >
            <Brain className="w-5 h-5" />
            Resultados Cerebral
          </button>
          <button
            onClick={() => { setActiveTab("resultados-entrenamiento"); fetchTrainingResultsOnly(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "resultados-entrenamiento" ? "bg-rose-600 text-white" : "text-rose-400 hover:bg-white/10"
            }`}
            data-testid="sidebar-resultados-entrenamiento"
          >
            <Zap className="w-5 h-5" />
            Resultados Entrenamiento
          </button>
          <button
            onClick={() => setActiveTab("resultados-velocidad")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "resultados-velocidad" ? "bg-cyan-600 text-white" : "text-cyan-400 hover:bg-white/10"
            }`}
            data-testid="sidebar-resultados-velocidad"
          >
            <Zap className="w-5 h-5" />
            Resultados Velocidad
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
          <button
            onClick={() => setActiveTab("imagenes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "imagenes" ? "bg-pink-600 text-white" : "text-pink-400 hover:bg-white/10"
            }`}
            data-testid="sidebar-imagenes"
          >
            <ImageIcon className="w-5 h-5" />
            Imágenes
          </button>
          <button
            onClick={() => setActiveTab("entrenamiento")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "entrenamiento" ? "bg-teal-600 text-white" : "text-teal-400 hover:bg-white/10"
            }`}
            data-testid="sidebar-entrenamiento"
          >
            <Zap className="w-5 h-5" />
            Entrenamiento
          </button>
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
          <Button
            onClick={() => {
              const newState = !editorModeEnabled;
              setEditorModeEnabled(newState);
              localStorage.setItem("editorMode", newState.toString());
            }}
            variant={editorModeEnabled ? "default" : "outline"}
            className={editorModeEnabled ? "w-full bg-purple-600 hover:bg-purple-700" : "w-full border-purple-500/30 text-purple-400"}
            data-testid="button-editor-toggle"
          >
            <Pencil className="w-4 h-4 mr-2" />
            {editorModeEnabled ? "Editor: ON" : "Editor: OFF"}
          </Button>
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
            Lectura
          </Button>
          <Button
            onClick={() => setActiveTab("resultados-razonamiento")}
            variant={activeTab === "resultados-razonamiento" ? "default" : "outline"}
            size="sm"
            className={activeTab === "resultados-razonamiento" ? "bg-blue-600" : "border-blue-500/30 text-blue-400"}
            data-testid="mobile-tab-resultados-razonamiento"
          >
            <Brain className="w-4 h-4 mr-1" />
            Razonamiento
          </Button>
          <Button
            onClick={() => setActiveTab("resultados-cerebral")}
            variant={activeTab === "resultados-cerebral" ? "default" : "outline"}
            size="sm"
            className={activeTab === "resultados-cerebral" ? "bg-purple-600" : "border-purple-500/30 text-purple-400"}
            data-testid="mobile-tab-resultados-cerebral"
          >
            <Brain className="w-4 h-4 mr-1" />
            Cerebral
          </Button>
          <Button
            onClick={() => { setActiveTab("resultados-entrenamiento"); fetchTrainingResultsOnly(); }}
            variant={activeTab === "resultados-entrenamiento" ? "default" : "outline"}
            size="sm"
            className={activeTab === "resultados-entrenamiento" ? "bg-rose-600" : "border-rose-500/30 text-rose-400"}
            data-testid="mobile-tab-resultados-entrenamiento"
          >
            <Zap className="w-4 h-4 mr-1" />
            Entrena
          </Button>
          <Button
            onClick={() => setActiveTab("resultados-velocidad")}
            variant={activeTab === "resultados-velocidad" ? "default" : "outline"}
            size="sm"
            className={activeTab === "resultados-velocidad" ? "bg-cyan-600" : "border-cyan-500/30 text-cyan-400"}
            data-testid="mobile-tab-resultados-velocidad"
          >
            <Zap className="w-4 h-4 mr-1" />
            Velocidad
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
          <Button
            onClick={() => setActiveTab("imagenes")}
            variant={activeTab === "imagenes" ? "default" : "outline"}
            size="sm"
            className={activeTab === "imagenes" ? "bg-pink-600" : "border-pink-500/30 text-pink-400"}
            data-testid="mobile-tab-imagenes"
          >
            <ImageIcon className="w-4 h-4 mr-1" />
            Imágenes
          </Button>
          <Button
            onClick={() => setActiveTab("entrenamiento")}
            variant={activeTab === "entrenamiento" ? "default" : "outline"}
            size="sm"
            className={activeTab === "entrenamiento" ? "bg-teal-600" : "border-teal-500/30 text-teal-400"}
            data-testid="mobile-tab-entrenamiento"
          >
            <Zap className="w-4 h-4 mr-1" />
            Entrena
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
                  {data?.sessions && data.sessions.length > 0 && (
                    <span className="text-sm font-normal text-white/60">
                      (Mostrando {Math.min(sessionPage * SESSIONS_PER_PAGE, data.sessions.length)} de {data.sessions.length})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const allSessions = data?.sessions || [];
                  const totalPages = Math.ceil(allSessions.length / SESSIONS_PER_PAGE);
                  const startIdx = (sessionPage - 1) * SESSIONS_PER_PAGE;
                  const paginatedSessions = allSessions.slice(startIdx, startIdx + SESSIONS_PER_PAGE);
                  
                  return (
                    <>
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
                            {paginatedSessions.map((session) => (
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
                            {paginatedSessions.length === 0 && (
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
                        {paginatedSessions.map((session) => (
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
                        {paginatedSessions.length === 0 && (
                          <div className="py-8 text-center text-white/40">
                            No hay sesiones registradas
                          </div>
                        )}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10">
                          <Button
                            onClick={() => setSessionPage(p => Math.max(1, p - 1))}
                            disabled={sessionPage === 1}
                            variant="outline"
                            size="sm"
                            className="border-cyan-500/30 text-cyan-400 disabled:opacity-30"
                            data-testid="button-sessions-prev"
                          >
                            Anterior
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                              Math.max(0, sessionPage - 3),
                              Math.min(totalPages, sessionPage + 2)
                            ).map(page => (
                              <Button
                                key={page}
                                onClick={() => setSessionPage(page)}
                                variant={page === sessionPage ? "default" : "outline"}
                                size="sm"
                                className={page === sessionPage ? "bg-cyan-600" : "border-cyan-500/30 text-cyan-400"}
                                data-testid={`button-sessions-page-${page}`}
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            onClick={() => setSessionPage(p => Math.min(totalPages, p + 1))}
                            disabled={sessionPage === totalPages}
                            variant="outline"
                            size="sm"
                            className="border-cyan-500/30 text-cyan-400 disabled:opacity-30"
                            data-testid="button-sessions-next"
                          >
                            Siguiente
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "resultados" && (
          <Card className="bg-black/40 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 flex-wrap">
                <FileText className="w-5 h-5 text-green-400" />
                Resultados de Tests ({filteredLecturaResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                  onClick={() => setResultFilter("all")}
                  variant={resultFilter === "all" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "all" ? "bg-cyan-600" : "border-cyan-500/30 text-cyan-400"}
                  data-testid="button-filter-all"
                >
                  Todos
                </Button>
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
                  onClick={() => setResultFilter("adolescentes")}
                  variant={resultFilter === "adolescentes" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "adolescentes" ? "bg-blue-600" : "border-blue-500/30 text-blue-400"}
                  data-testid="button-filter-adolescentes"
                >
                  Adolescentes
                </Button>
                <Button
                  onClick={() => setResultFilter("universitarios")}
                  variant={resultFilter === "universitarios" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "universitarios" ? "bg-green-600" : "border-green-500/30 text-green-400"}
                  data-testid="button-filter-universitarios"
                >
                  Universitarios
                </Button>
                <Button
                  onClick={() => setResultFilter("profesionales")}
                  variant={resultFilter === "profesionales" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "profesionales" ? "bg-amber-600" : "border-amber-500/30 text-amber-400"}
                  data-testid="button-filter-profesionales"
                >
                  Profesionales
                </Button>
                <Button
                  onClick={() => setResultFilter("adulto_mayor")}
                  variant={resultFilter === "adulto_mayor" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "adulto_mayor" ? "bg-rose-600" : "border-rose-500/30 text-rose-400"}
                  data-testid="button-filter-adulto-mayor"
                >
                  Adulto Mayor
                </Button>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-white/60 border-b border-white/10">
                      <th className="pb-3 px-2"></th>
                      <th className="pb-3 px-2">Nombre</th>
                      <th className="pb-3 px-2">Categoría</th>
                      <th className="pb-3 px-2">Comprensión</th>
                      <th className="pb-3 px-2">Velocidad</th>
                      <th className="pb-3 px-2">Tipo</th>
                      <th className="pb-3 px-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLecturaResults.map((r) => (
                      <Fragment key={r.id}>
                        <tr 
                          onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                          className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                          data-testid={`row-result-${r.id}`}
                        >
                          <td className="py-3 px-2">
                            <svg className={`w-4 h-4 text-white/60 transition-transform ${expandedResult === r.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </td>
                          <td className="py-3 px-2 text-white">{r.nombre}</td>
                          <td className="py-3 px-2 text-purple-400">{r.categoria || "-"}</td>
                          <td className="py-3 px-2">
                            {(r as any).comprension !== null ? (
                              <span className="text-cyan-400 font-bold">{(r as any).comprension}%</span>
                            ) : "-"}
                          </td>
                          <td className="py-3 px-2">
                            {(r as any).velocidadLectura ? (
                              <span className="text-purple-400 font-bold">{(r as any).velocidadLectura} p/m</span>
                            ) : "-"}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded text-xs ${r.isPwa ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                              {r.isPwa ? "PWA" : "Web"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-white/60 text-xs">{formatDate(r.createdAt)}</td>
                        </tr>
                        {expandedResult === r.id && (
                          <tr key={`${r.id}-details`} className="bg-white/5">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 mb-4 border border-cyan-500/20">
                                <h4 className="text-cyan-400 font-bold mb-3 text-sm">📊 Resultados del Test</h4>
                                <div className="grid grid-cols-6 gap-3 text-center">
                                  <div className="bg-black/30 rounded-lg p-2">
                                    <div className="text-cyan-400 font-bold text-lg">{(r as any).comprension !== null ? `${(r as any).comprension}%` : "-"}</div>
                                    <div className="text-white/50 text-xs">Comprensión</div>
                                  </div>
                                  <div className="bg-black/30 rounded-lg p-2">
                                    <div className="text-green-400 font-bold text-lg">{(r as any).respuestasCorrectas ?? "-"}/{(r as any).respuestasTotales ?? "-"}</div>
                                    <div className="text-white/50 text-xs">Correctas</div>
                                  </div>
                                  <div className="bg-black/30 rounded-lg p-2">
                                    <div className="text-purple-400 font-bold text-lg">{(r as any).velocidadLectura ?? "-"}</div>
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
                                    <div className={`font-bold text-xs leading-tight ${(r as any).categoriaLector?.includes("COMPETENTE") ? "text-green-400" : (r as any).categoriaLector?.includes("REGULAR") ? "text-yellow-400" : (r as any).categoriaLector?.includes("SEVERA") ? "text-red-400" : "text-orange-400"}`}>{(r as any).categoriaLector || "-"}</div>
                                    <div className="text-white/50 text-[10px] mt-1">Categoría</div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div><span className="text-white/60">Email:</span> <span className="text-white/80">{r.email || "-"}</span></div>
                                <div><span className="text-white/60">Edad:</span> <span className="text-white">{r.edad || "-"}</span></div>
                                <div><span className="text-white/60">Teléfono:</span> <span className="text-white">{r.telefono || "-"}</span></div>
                                <div><span className="text-white/60">País:</span> <span className="text-cyan-400">{(r as any).pais || "-"}</span></div>
                                <div><span className="text-white/60">Estado:</span> <span className="text-cyan-400">{(r as any).estado || r.ciudad || "-"}</span></div>
                                <div><span className="text-white/60">Grado:</span> <span className="text-yellow-400">{(r as any).grado || "-"}</span></div>
                                <div><span className="text-white/60">Institución:</span> <span className="text-cyan-400">{(r as any).institucion || "-"}</span></div>
                                {(r as any).tipoEstudiante && <div><span className="text-white/60">Perfil:</span> <span className="text-purple-400">{formatTipoEstudiante((r as any).tipoEstudiante)}</span></div>}
                                {(r as any).semestre && <div><span className="text-white/60">Semestre:</span> <span className="text-purple-400">{(r as any).semestre}</span></div>}
                                {(r as any).profesion && <div><span className="text-white/60">Profesión:</span> <span className="text-green-400">{(r as any).profesion}</span></div>}
                                {(r as any).ocupacion && <div><span className="text-white/60">Ocupación:</span> <span className="text-green-400">{(r as any).ocupacion}</span></div>}
                                {(r as any).lugarTrabajo && <div><span className="text-white/60">Lugar Trabajo:</span> <span className="text-green-400">{(r as any).lugarTrabajo}</span></div>}
                                {(r as any).comentario && <div className="col-span-2 md:col-span-4"><span className="text-white/60">Comentario:</span> <span className="text-white/80">{(r as any).comentario}</span></div>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                    {filteredLecturaResults.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-white/40">
                          No hay resultados registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2">
                {filteredLecturaResults.map((r) => (
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
                      <div className="px-3 pb-3 space-y-2 text-sm border-t border-white/10">
                        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-3 mt-2 border border-cyan-500/20">
                          <h4 className="text-cyan-400 font-bold mb-2 text-xs">📊 Resultados del Test</h4>
                          <div className="grid grid-cols-3 gap-2 text-center mb-2">
                            <div className="bg-black/30 rounded p-2">
                              <div className="text-cyan-400 font-bold text-sm">{(r as any).comprension !== null ? `${(r as any).comprension}%` : "-"}</div>
                              <div className="text-white/50 text-[10px]">Comprensión</div>
                            </div>
                            <div className="bg-black/30 rounded p-2">
                              <div className="text-green-400 font-bold text-sm">{(r as any).respuestasCorrectas ?? "-"}/{(r as any).respuestasTotales ?? "-"}</div>
                              <div className="text-white/50 text-[10px]">Correctas</div>
                            </div>
                            <div className="bg-black/30 rounded p-2">
                              <div className="text-purple-400 font-bold text-sm">{(r as any).velocidadLectura ?? "-"}</div>
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
                            <div className={`font-bold text-xs leading-tight ${(r as any).categoriaLector?.includes("COMPETENTE") ? "text-green-400" : (r as any).categoriaLector?.includes("REGULAR") ? "text-yellow-400" : (r as any).categoriaLector?.includes("SEVERA") ? "text-red-400" : "text-orange-400"}`}>{(r as any).categoriaLector || "-"}</div>
                            <div className="text-white/50 text-[10px] mt-1">Categoría Lector</div>
                          </div>
                        </div>
                        <p className="text-white/60 pt-1">Email: <span className="text-white/80">{r.email || "-"}</span></p>
                        <p className="text-white/60">Edad: <span className="text-white/80">{r.edad || "-"}</span></p>
                        <p className="text-white/60">Teléfono: <span className="text-white/80">{r.telefono || "-"}</span></p>
                        <p className="text-white/60">País: <span className="text-white/80">{(r as any).pais || "-"}</span></p>
                        <p className="text-white/60">Estado/Dpto: <span className="text-white/80">{(r as any).estado || r.ciudad || "-"}</span></p>
                        <p className="text-white/60">Grado: <span className="text-yellow-400">{(r as any).grado || "-"}</span></p>
                        <p className="text-white/60">Institución: <span className="text-cyan-400">{(r as any).institucion || "-"}</span></p>
                        {(r as any).tipoEstudiante && <p className="text-white/60">Perfil: <span className="text-purple-400">{formatTipoEstudiante((r as any).tipoEstudiante)}</span></p>}
                        {(r as any).semestre && <p className="text-white/60">Semestre: <span className="text-purple-400">{(r as any).semestre}</span></p>}
                        {(r as any).profesion && <p className="text-white/60">Profesión: <span className="text-green-400">{(r as any).profesion}</span></p>}
                        {(r as any).ocupacion && <p className="text-white/60">Ocupación: <span className="text-green-400">{(r as any).ocupacion}</span></p>}
                        {(r as any).lugarTrabajo && <p className="text-white/60">Lugar trabajo: <span className="text-green-400">{(r as any).lugarTrabajo}</span></p>}
                        {(r as any).comentario && <p className="text-white/60">Comentario: <span className="text-white/80">{(r as any).comentario}</span></p>}
                        <p className="text-white/60">Fecha: <span className="text-white/60">{formatDate(r.createdAt)}</span></p>
                      </div>
                    )}
                  </div>
                ))}
                {filteredLecturaResults.length === 0 && (
                  <div className="py-8 text-center text-white/40">
                    No hay resultados registrados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "resultados-razonamiento" && (
          <Card className="bg-black/40 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 flex-wrap">
                <Brain className="w-5 h-5 text-blue-400" />
                Resultados de Razonamiento ({filteredRazonamientoResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                  onClick={() => setResultFilter("all")}
                  variant={resultFilter === "all" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "all" ? "bg-cyan-600" : "border-cyan-500/30 text-cyan-400"}
                >
                  Todos
                </Button>
                <Button
                  onClick={() => setResultFilter("preescolar")}
                  variant={resultFilter === "preescolar" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "preescolar" ? "bg-orange-600" : "border-orange-500/30 text-orange-400"}
                >
                  Pre-escolar
                </Button>
                <Button
                  onClick={() => setResultFilter("ninos")}
                  variant={resultFilter === "ninos" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "ninos" ? "bg-purple-600" : "border-purple-500/30 text-purple-400"}
                >
                  Niños
                </Button>
                <Button
                  onClick={() => setResultFilter("adolescentes")}
                  variant={resultFilter === "adolescentes" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "adolescentes" ? "bg-blue-600" : "border-blue-500/30 text-blue-400"}
                >
                  Adolescentes
                </Button>
                <Button
                  onClick={() => setResultFilter("universitarios")}
                  variant={resultFilter === "universitarios" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "universitarios" ? "bg-green-600" : "border-green-500/30 text-green-400"}
                >
                  Universitarios
                </Button>
                <Button
                  onClick={() => setResultFilter("profesionales")}
                  variant={resultFilter === "profesionales" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "profesionales" ? "bg-amber-600" : "border-amber-500/30 text-amber-400"}
                >
                  Profesionales
                </Button>
                <Button
                  onClick={() => setResultFilter("adulto_mayor")}
                  variant={resultFilter === "adulto_mayor" ? "default" : "outline"}
                  size="sm"
                  className={resultFilter === "adulto_mayor" ? "bg-rose-600" : "border-rose-500/30 text-rose-400"}
                >
                  Adulto Mayor
                </Button>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-white/60 border-b border-white/10">
                      <th className="pb-3 px-2"></th>
                      <th className="pb-3 px-2">Nombre</th>
                      <th className="pb-3 px-2">Categoría</th>
                      <th className="pb-3 px-2">Comprensión</th>
                      <th className="pb-3 px-2">Correctas</th>
                      <th className="pb-3 px-2">Tipo</th>
                      <th className="pb-3 px-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRazonamientoResults.map((r) => (
                      <Fragment key={r.id}>
                        <tr 
                          onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                          className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                        >
                          <td className="py-3 px-2">
                            <svg className={`w-4 h-4 text-white/60 transition-transform ${expandedResult === r.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </td>
                          <td className="py-3 px-2 text-white">{r.nombre}</td>
                          <td className="py-3 px-2 text-blue-400">{r.categoria || "-"}</td>
                          <td className="py-3 px-2">
                            {(r as any).comprension !== null ? (
                              <span className="text-cyan-400 font-bold">{(r as any).comprension}%</span>
                            ) : "-"}
                          </td>
                          <td className="py-3 px-2">
                            {(r as any).respuestasCorrectas !== null && (r as any).respuestasTotales ? (
                              <span className="text-green-400 font-bold">{(r as any).respuestasCorrectas}/{(r as any).respuestasTotales}</span>
                            ) : "-"}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded text-xs ${r.isPwa ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                              {r.isPwa ? "PWA" : "Web"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-white/60 text-xs">{formatDate(r.createdAt)}</td>
                        </tr>
                        {expandedResult === r.id && (
                          <tr className="bg-white/5">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 mb-4 border border-blue-500/20">
                                <h4 className="text-blue-400 font-bold mb-3 text-sm">📊 Resultados del Test</h4>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                  <div className="bg-black/30 rounded-lg p-2">
                                    <div className="text-cyan-400 font-bold text-lg">{(r as any).comprension !== null ? `${(r as any).comprension}%` : "-"}</div>
                                    <div className="text-white/50 text-xs">Comprensión</div>
                                  </div>
                                  <div className="bg-black/30 rounded-lg p-2">
                                    <div className="text-green-400 font-bold text-lg">{(r as any).respuestasCorrectas ?? "-"}/{(r as any).respuestasTotales ?? "-"}</div>
                                    <div className="text-white/50 text-xs">Correctas</div>
                                  </div>
                                  <div className="bg-black/30 rounded-lg p-2">
                                    <div className="text-purple-400 font-bold text-lg">{formatTime(r.tiempoCuestionario)}</div>
                                    <div className="text-white/50 text-xs">Tiempo</div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div><span className="text-white/60">Email:</span> <span className="text-white/80">{r.email || "-"}</span></div>
                                <div><span className="text-white/60">Edad:</span> <span className="text-white">{r.edad || "-"}</span></div>
                                <div><span className="text-white/60">Teléfono:</span> <span className="text-white">{r.telefono || "-"}</span></div>
                                <div><span className="text-white/60">País:</span> <span className="text-cyan-400">{(r as any).pais || "-"}</span></div>
                                <div><span className="text-white/60">Estado:</span> <span className="text-cyan-400">{(r as any).estado || r.ciudad || "-"}</span></div>
                                <div><span className="text-white/60">Grado:</span> <span className="text-yellow-400">{(r as any).grado || "-"}</span></div>
                                <div><span className="text-white/60">Institución:</span> <span className="text-cyan-400">{(r as any).institucion || "-"}</span></div>
                                {(r as any).tipoEstudiante && <div><span className="text-white/60">Perfil:</span> <span className="text-purple-400">{formatTipoEstudiante((r as any).tipoEstudiante)}</span></div>}
                                {(r as any).semestre && <div><span className="text-white/60">Semestre:</span> <span className="text-purple-400">{(r as any).semestre}</span></div>}
                                {(r as any).profesion && <div><span className="text-white/60">Profesión:</span> <span className="text-green-400">{(r as any).profesion}</span></div>}
                                {(r as any).ocupacion && <div><span className="text-white/60">Ocupación:</span> <span className="text-green-400">{(r as any).ocupacion}</span></div>}
                                {(r as any).lugarTrabajo && <div><span className="text-white/60">Lugar Trabajo:</span> <span className="text-green-400">{(r as any).lugarTrabajo}</span></div>}
                                {(r as any).comentario && <div className="col-span-2 md:col-span-4"><span className="text-white/60">Comentario:</span> <span className="text-white/80">{(r as any).comentario}</span></div>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                    {filteredRazonamientoResults.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-white/40">
                          No hay resultados de Razonamiento registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2">
                {filteredRazonamientoResults.map((r) => (
                  <div key={r.id} className="bg-white/5 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                      className="w-full p-3 flex items-center justify-between text-left"
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
                      <div className="px-3 pb-3 space-y-2 text-sm border-t border-white/10">
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 mt-2 border border-blue-500/20">
                          <h4 className="text-blue-400 font-bold mb-2 text-xs">📊 Resultados del Test</h4>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-black/30 rounded p-2">
                              <div className="text-cyan-400 font-bold">{(r as any).comprension !== null ? `${(r as any).comprension}%` : "-"}</div>
                              <div className="text-white/50 text-xs">Comprensión</div>
                            </div>
                            <div className="bg-black/30 rounded p-2">
                              <div className="text-green-400 font-bold">{(r as any).respuestasCorrectas ?? "-"}/{(r as any).respuestasTotales ?? "-"}</div>
                              <div className="text-white/50 text-xs">Correctas</div>
                            </div>
                            <div className="bg-black/30 rounded p-2">
                              <div className="text-purple-400 font-bold">{formatTime(r.tiempoCuestionario)}</div>
                              <div className="text-white/50 text-xs">Tiempo</div>
                            </div>
                          </div>
                        </div>
                        <p className="text-white/60 pt-1">Email: <span className="text-white/80">{r.email || "-"}</span></p>
                        <p className="text-white/60">Edad: <span className="text-white/80">{r.edad || "-"}</span></p>
                        <p className="text-white/60">Teléfono: <span className="text-white/80">{r.telefono || "-"}</span></p>
                        <p className="text-white/60">País: <span className="text-white/80">{(r as any).pais || "-"}</span></p>
                        <p className="text-white/60">Estado/Dpto: <span className="text-white/80">{(r as any).estado || r.ciudad || "-"}</span></p>
                        <p className="text-white/60">Grado: <span className="text-yellow-400">{(r as any).grado || "-"}</span></p>
                        <p className="text-white/60">Institución: <span className="text-cyan-400">{(r as any).institucion || "-"}</span></p>
                        {(r as any).tipoEstudiante && <p className="text-white/60">Perfil: <span className="text-purple-400">{formatTipoEstudiante((r as any).tipoEstudiante)}</span></p>}
                        {(r as any).semestre && <p className="text-white/60">Semestre: <span className="text-purple-400">{(r as any).semestre}</span></p>}
                        {(r as any).profesion && <p className="text-white/60">Profesión: <span className="text-green-400">{(r as any).profesion}</span></p>}
                        {(r as any).ocupacion && <p className="text-white/60">Ocupación: <span className="text-green-400">{(r as any).ocupacion}</span></p>}
                        {(r as any).lugarTrabajo && <p className="text-white/60">Lugar trabajo: <span className="text-green-400">{(r as any).lugarTrabajo}</span></p>}
                        {(r as any).comentario && <p className="text-white/60">Comentario: <span className="text-white/80">{(r as any).comentario}</span></p>}
                        <p className="text-white/60">Fecha: <span className="text-white/60">{formatDate(r.createdAt)}</span></p>
                      </div>
                    )}
                  </div>
                ))}
                {filteredRazonamientoResults.length === 0 && (
                  <div className="py-8 text-center text-white/40">
                    No hay resultados de Razonamiento registrados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "resultados-cerebral" && (
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Resultados Test Cerebral ({cerebralResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cerebralResults.length === 0 ? (
                <p className="text-white/60 text-center py-8">No hay resultados de Test Cerebral aún</p>
              ) : (
                <div className="space-y-3">
                  {cerebralResults.map((r) => {
                    const isExpanded = expandedCerebralResult === r.id;
                    const lateralidadAnswers = r.lateralidadData ? JSON.parse(r.lateralidadData) : [];
                    const preferenciaAnswers = r.preferenciaData ? JSON.parse(r.preferenciaData) : [];
                    const personalityTraits = r.personalityTraits ? (typeof r.personalityTraits === 'string' ? JSON.parse(r.personalityTraits) : r.personalityTraits) : [];
                    
                    return (
                      <div 
                        key={r.id} 
                        className={`bg-white/5 rounded-lg border transition-all cursor-pointer ${isExpanded ? 'border-purple-400' : 'border-purple-500/20 hover:border-purple-500/40'}`}
                        onClick={() => setExpandedCerebralResult(isExpanded ? null : r.id)}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-medium text-lg">{r.nombre}</span>
                              <span className={`px-2 py-1 rounded text-xs ${r.dominantSide === 'izquierdo' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                {r.dominantSide === 'izquierdo' ? 'Hemisferio Izquierdo' : 'Hemisferio Derecho'}
                              </span>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                          
                          <div className="flex flex-wrap gap-4 md:gap-8 items-center text-sm">
                            <div className="flex gap-4">
                              <div className="text-center">
                                <span className="text-cyan-400 font-bold text-xl">{r.leftPercent}%</span>
                                <p className="text-white/40 text-xs">Izquierdo</p>
                              </div>
                              <div className="text-center">
                                <span className="text-purple-400 font-bold text-xl">{r.rightPercent}%</span>
                                <p className="text-white/40 text-xs">Derecho</p>
                              </div>
                            </div>
                            <div className="hidden md:flex gap-4 text-white/60">
                              {r.email && <span>📧 {r.email}</span>}
                              {r.edad && <span>🎂 {r.edad} años</span>}
                              {r.ciudad && <span>📍 {r.ciudad}</span>}
                              {(r as any).grado && <span className="text-yellow-400">🎓 {(r as any).grado}</span>}
                            </div>
                            <span className="text-white/40 text-xs ml-auto">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                            </span>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="border-t border-purple-500/20 p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="md:hidden text-sm text-white/60 space-y-1">
                                {r.email && <p>📧 {r.email}</p>}
                                {r.edad && <p>🎂 {r.edad} años</p>}
                                {r.ciudad && <p>📍 {r.ciudad}</p>}
                                {r.telefono && <p>📱 {r.telefono}</p>}
                                {(r as any).grado && <p className="text-yellow-400">🎓 {(r as any).grado}</p>}
                              </div>
                              
                              <div>
                                <h4 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                  Respuestas de Lateralidad ({lateralidadAnswers.length})
                                </h4>
                                {lateralidadAnswers.length > 0 ? (
                                  <div className="space-y-1">
                                    {lateralidadAnswers.map((answer: string, i: number) => (
                                      <div key={i} className="flex items-center gap-2 text-sm">
                                        <span className="text-white/40 w-5">{i + 1}.</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${answer.toLowerCase().includes('izquierda') ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                          {answer}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-white/40 text-sm">Sin respuestas registradas</p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                  Rasgos de Personalidad ({personalityTraits.length})
                                </h4>
                                {personalityTraits.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {personalityTraits.map((trait: string, i: number) => (
                                      <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                        {trait}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-white/40 text-sm">Sin rasgos registrados</p>
                                )}
                              </div>
                            </div>
                            
                            {preferenciaAnswers.length > 0 && (
                              <div>
                                <h4 className="text-pink-400 font-semibold mb-2 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                                  Preferencias Visuales ({preferenciaAnswers.length})
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {preferenciaAnswers.map((pref: { option: string; meaning: string }, i: number) => (
                                    <div key={i} className="bg-white/5 rounded p-2 text-center">
                                      <span className="text-white/80 text-sm block">{pref.option || `Opción ${i + 1}`}</span>
                                      <span className="text-pink-300 text-xs">{pref.meaning}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {r.comentario && (
                              <div className="bg-white/5 rounded p-3">
                                <h4 className="text-white/60 text-xs mb-1">Comentario:</h4>
                                <p className="text-white/80 text-sm">{r.comentario}</p>
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center pt-2 border-t border-white/10">
                              <span className="text-white/40 text-xs">ID: {r.id}</span>
                              <span className="text-white/40 text-xs">PWA: {r.isPwa ? 'Sí' : 'No'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "resultados-entrenamiento" && (
          <Card className="bg-black/40 border-rose-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-400" />
                Resultados de Entrenamiento ({trainingResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainingResults.length === 0 ? (
                <p className="text-white/60 text-center py-8">No hay resultados de entrenamiento aún</p>
              ) : (
                <div className="space-y-3">
                  {trainingResults.map((r: any) => {
                    const isExpanded = expandedTrainingResult === r.id;
                    const datosExtra = r.datosExtra ? JSON.parse(r.datosExtra) : {};
                    const tipoLabels: Record<string, string> = {
                      velocidad: "Velocidad",
                      numeros: "Números y Letras",
                      aceleracion_golpe: "Golpe de Vista",
                      aceleracion_desplazamiento: "Desplazamiento",
                      reconocimiento_visual: "Reconocimiento Visual"
                    };
                    const categoriaLabels: Record<string, string> = {
                      preescolar: "Pre-escolar",
                      ninos: "Niños",
                      adolescentes: "Adolescentes",
                      universitarios: "Universitarios",
                      profesionales: "Profesionales",
                      adulto_mayor: "Adulto Mayor",
                      adultos: "Adultos"
                    };
                    
                    return (
                      <div 
                        key={r.id} 
                        className={`bg-white/5 rounded-lg border transition-all cursor-pointer ${isExpanded ? 'border-rose-400' : 'border-rose-500/20 hover:border-rose-500/40'}`}
                        onClick={() => setExpandedTrainingResult(isExpanded ? null : r.id)}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="px-2 py-1 rounded text-xs bg-rose-500/20 text-rose-300">
                                {tipoLabels[r.tipoEjercicio] || r.tipoEjercicio}
                              </span>
                              <span className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-300">
                                {categoriaLabels[r.categoria] || r.categoria}
                              </span>
                              {r.ejercicioTitulo && (
                                <span className="text-white font-medium text-sm">{r.ejercicioTitulo}</span>
                              )}
                            </div>
                            <ChevronDown className={`w-5 h-5 text-rose-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                          
                          <div className="flex flex-wrap gap-4 md:gap-8 items-center text-sm">
                            <div className="flex gap-4">
                              <div className="text-center">
                                <span className="text-green-400 font-bold text-xl">{r.puntaje || 0}%</span>
                                <p className="text-white/40 text-xs">Puntaje</p>
                              </div>
                              {r.respuestasCorrectas !== null && (
                                <div className="text-center">
                                  <span className="text-cyan-400 font-bold text-xl">{r.respuestasCorrectas}/{r.respuestasTotales || 0}</span>
                                  <p className="text-white/40 text-xs">Respuestas</p>
                                </div>
                              )}
                              {r.palabrasPorMinuto && (
                                <div className="text-center">
                                  <span className="text-purple-400 font-bold text-xl">{r.palabrasPorMinuto}</span>
                                  <p className="text-white/40 text-xs">PPM</p>
                                </div>
                              )}
                            </div>
                            <span className="text-white/40 text-xs ml-auto">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
                            </span>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="border-t border-rose-500/20 p-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <p className="text-white/60">Session ID: <span className="text-white/80 font-mono text-xs">{r.sessionId || 'N/A'}</span></p>
                                <p className="text-white/60">Nivel: <span className="text-cyan-400 font-bold">{r.nivelAlcanzado || 1}</span></p>
                                <p className="text-white/60">Tiempo: <span className="text-purple-400">{r.tiempoSegundos || 0}s</span></p>
                                <p className="text-white/60">PWA: <span className={r.isPwa ? "text-green-400" : "text-red-400"}>{r.isPwa ? "Sí" : "No"}</span></p>
                              </div>
                              {Object.keys(datosExtra).length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-rose-400 font-semibold">Datos Extra:</p>
                                  {Object.entries(datosExtra).map(([key, value]) => (
                                    <p key={key} className="text-white/60">{key}: <span className="text-white/80">{String(value)}</span></p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "resultados-velocidad" && (
          <Card className="bg-black/40 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Resultados Velocidad de Lectura ({filteredVelocidadResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredVelocidadResults.length === 0 ? (
                <p className="text-white/60 text-center py-8">No hay resultados de velocidad registrados</p>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-velocidad-results">
                      <thead>
                        <tr className="text-left text-white/60 border-b border-white/10">
                          <th className="pb-3 px-2"></th>
                          <th className="pb-3 px-2">Nombre</th>
                          <th className="pb-3 px-2">Categoria</th>
                          <th className="pb-3 px-2">Comprension</th>
                          <th className="pb-3 px-2">Vel. Maxima</th>
                          <th className="pb-3 px-2">Correctas</th>
                          <th className="pb-3 px-2">Modo</th>
                          <th className="pb-3 px-2">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVelocidadResults.map((r) => (
                          <Fragment key={r.id}>
                            <tr
                              onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                              className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                              data-testid={`row-velocidad-${r.id}`}
                            >
                              <td className="py-3 px-2">
                                <svg className={`w-4 h-4 text-white/60 transition-transform ${expandedResult === r.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </td>
                              <td className="py-3 px-2 text-white">{r.nombre}</td>
                              <td className="py-3 px-2 text-purple-400">{r.categoria || "-"}</td>
                              <td className="py-3 px-2">
                                {(r as any).comprension !== null ? (
                                  <span className="text-cyan-400 font-bold">{(r as any).comprension}%</span>
                                ) : "-"}
                              </td>
                              <td className="py-3 px-2">
                                {(r as any).velocidadMaxima ? (
                                  <span className="text-green-400 font-bold">{(r as any).velocidadMaxima} p/m</span>
                                ) : "-"}
                              </td>
                              <td className="py-3 px-2">
                                <span className="text-cyan-400">{(r as any).respuestasCorrectas ?? 0}/{(r as any).respuestasTotales ?? 0}</span>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-1 rounded text-xs ${r.isPwa ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                                  {r.isPwa ? "PWA" : "Web"}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-white/60 text-xs">{formatDate(r.createdAt)}</td>
                            </tr>
                            {expandedResult === r.id && (
                              <tr key={`${r.id}-details`} className="bg-white/5">
                                <td colSpan={8} className="px-4 py-4">
                                  <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 border border-cyan-500/20">
                                    <h4 className="text-cyan-400 font-bold mb-3 text-sm">Detalles de Velocidad</h4>
                                    <div className="grid grid-cols-4 gap-3 text-center">
                                      <div className="bg-black/30 rounded-lg p-2">
                                        <div className="text-green-400 font-bold text-lg">{(r as any).velocidadMaxima ?? "-"}</div>
                                        <div className="text-white/50 text-xs">Vel. Maxima (p/m)</div>
                                      </div>
                                      <div className="bg-black/30 rounded-lg p-2">
                                        <div className="text-cyan-400 font-bold text-lg">{(r as any).comprension !== null ? `${(r as any).comprension}%` : "-"}</div>
                                        <div className="text-white/50 text-xs">Comprension</div>
                                      </div>
                                      <div className="bg-black/30 rounded-lg p-2">
                                        <div className="text-green-400 font-bold text-lg">{(r as any).respuestasCorrectas ?? 0}</div>
                                        <div className="text-white/50 text-xs">Correctas</div>
                                      </div>
                                      <div className="bg-black/30 rounded-lg p-2">
                                        <div className="text-red-400 font-bold text-lg">{((r as any).respuestasTotales ?? 0) - ((r as any).respuestasCorrectas ?? 0)}</div>
                                        <div className="text-white/50 text-xs">Incorrectas</div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden space-y-3">
                    {filteredVelocidadResults.map((r) => (
                      <div
                        key={r.id}
                        className={`bg-white/5 rounded-lg border transition-all cursor-pointer ${expandedResult === r.id ? 'border-cyan-400' : 'border-cyan-500/20 hover:border-cyan-500/40'}`}
                        onClick={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                        data-testid={`card-velocidad-${r.id}`}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-300">Velocidad</span>
                              <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">{r.categoria || "-"}</span>
                              <span className="text-white font-medium text-sm">{r.nombre}</span>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform ${expandedResult === r.id ? 'rotate-180' : ''}`} />
                          </div>
                          <div className="flex flex-wrap gap-4 items-center text-sm">
                            <div className="text-center">
                              <span className="text-green-400 font-bold text-xl">{(r as any).velocidadMaxima ?? "-"}</span>
                              <p className="text-white/40 text-xs">Vel. Max (p/m)</p>
                            </div>
                            <div className="text-center">
                              <span className="text-cyan-400 font-bold text-xl">{(r as any).comprension !== null ? `${(r as any).comprension}%` : "-"}</span>
                              <p className="text-white/40 text-xs">Comprension</p>
                            </div>
                            <div className="text-center">
                              <span className="text-purple-400 font-bold text-xl">{(r as any).respuestasCorrectas ?? 0}/{(r as any).respuestasTotales ?? 0}</span>
                              <p className="text-white/40 text-xs">Correctas</p>
                            </div>
                            <span className="text-white/40 text-xs ml-auto">{formatDate(r.createdAt)}</span>
                          </div>
                        </div>
                        {expandedResult === r.id && (
                          <div className="border-t border-cyan-500/20 p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div className="bg-black/30 rounded-lg p-2">
                                <div className="text-green-400 font-bold">{(r as any).velocidadMaxima ?? "-"}</div>
                                <div className="text-white/50 text-xs">Vel. Max</div>
                              </div>
                              <div className="bg-black/30 rounded-lg p-2">
                                <div className="text-cyan-400 font-bold">{(r as any).comprension !== null ? `${(r as any).comprension}%` : "-"}</div>
                                <div className="text-white/50 text-xs">Comprension</div>
                              </div>
                              <div className="bg-black/30 rounded-lg p-2">
                                <div className="text-green-400 font-bold">{(r as any).respuestasCorrectas ?? 0}</div>
                                <div className="text-white/50 text-xs">Correctas</div>
                              </div>
                              <div className="bg-black/30 rounded-lg p-2">
                                <div className="text-red-400 font-bold">{((r as any).respuestasTotales ?? 0) - ((r as any).respuestasCorrectas ?? 0)}</div>
                                <div className="text-white/50 text-xs">Incorrectas</div>
                              </div>
                            </div>
                            <div className="mt-2 flex justify-between items-center text-xs text-white/40">
                              <span>ID: {r.id}</span>
                              <span>{r.isPwa ? "PWA" : "Web"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
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
                      className="bg-white/10 border-white/20 text-white mb-2"
                      data-testid={`input-question-${qi}`}
                    />
                    <div className="mb-3">
                      <label className="text-white/40 text-xs mb-1 block">URL de imagen (opcional)</label>
                      <Input
                        value={(q as any).imageUrl || ""}
                        onChange={(e) => {
                          const newQ = [...currentEditContent.questions];
                          (newQ[qi] as any).imageUrl = e.target.value;
                          setCurrentEditContent((p: typeof currentEditContent) => ({ ...p, questions: newQ }));
                        }}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="bg-white/10 border-white/20 text-white text-xs"
                        data-testid={`input-question-image-${qi}`}
                      />
                      {(q as any).imageUrl && (
                        <div className="mt-2 p-2 bg-black/30 rounded-lg">
                          <img 
                            src={(q as any).imageUrl} 
                            alt="Vista previa" 
                            className="max-h-24 mx-auto rounded object-contain"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      )}
                    </div>
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
                      className="bg-white/10 border-white/20 text-white mb-2"
                      data-testid={`input-razonamiento-question-${qi}`}
                    />
                    <div className="mb-3">
                      <label className="text-white/40 text-xs mb-1 block">URL de imagen (opcional)</label>
                      <Input
                        value={(q as any).imageUrl || ""}
                        onChange={(e) => {
                          const newQ = [...razonamientoContent.questions];
                          (newQ[qi] as any).imageUrl = e.target.value;
                          setRazonamientoContent(p => ({ ...p, questions: newQ }));
                        }}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="bg-white/10 border-white/20 text-white text-xs"
                        data-testid={`input-razonamiento-question-image-${qi}`}
                      />
                      {(q as any).imageUrl && (
                        <div className="mt-2 p-2 bg-black/30 rounded-lg">
                          <img 
                            src={(q as any).imageUrl} 
                            alt="Vista previa" 
                            className="max-h-24 mx-auto rounded object-contain"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      )}
                    </div>
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
              {/* Intro Screen Configuration */}
              <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-900/20 space-y-4 mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Pantalla de Introducción
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1 block">Imagen del cerebro (URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cerebralIntro.imageUrl}
                        onChange={(e) => setCerebralIntro(p => ({ ...p, imageUrl: e.target.value }))}
                        placeholder="URL de imagen del cerebro"
                        className="flex-1 p-2 rounded-md bg-white/10 border border-white/20 text-white text-sm"
                        data-testid="input-cerebral-intro-image"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          setImagePickerCallback((url: string) => {
                            setCerebralIntro(p => ({ ...p, imageUrl: url }));
                          });
                          setShowImagePicker(true);
                        }}
                        variant="outline"
                        className="border-purple-500/30 text-purple-400"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    {cerebralIntro.imageUrl && (
                      <img src={cerebralIntro.imageUrl} alt="Intro preview" className="mt-2 w-24 h-24 object-contain rounded-lg border border-white/20" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Título</label>
                      <input
                        type="text"
                        value={cerebralIntro.title}
                        onChange={(e) => setCerebralIntro(p => ({ ...p, title: e.target.value }))}
                        placeholder="¿Cuál lado de tu cerebro es más dominante?"
                        className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white text-sm"
                        data-testid="input-cerebral-intro-title"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Subtítulo</label>
                      <input
                        type="text"
                        value={cerebralIntro.subtitle}
                        onChange={(e) => setCerebralIntro(p => ({ ...p, subtitle: e.target.value }))}
                        placeholder="El test tiene una duración de 30 segundos."
                        className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white text-sm"
                        data-testid="input-cerebral-intro-subtitle"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Texto del botón</label>
                      <input
                        type="text"
                        value={cerebralIntro.buttonText}
                        onChange={(e) => setCerebralIntro(p => ({ ...p, buttonText: e.target.value }))}
                        placeholder="Empezar"
                        className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white text-sm"
                        data-testid="input-cerebral-intro-button"
                      />
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleSaveCerebralIntro}
                  disabled={saving}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-teal-500"
                  data-testid="button-save-cerebral-intro"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Introducción
                </Button>
              </div>
              
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
                  {cerebralContent.exerciseType === "lateralidad" && "Usuario responde qué mano usó (izquierda o derecha)"}
                  {cerebralContent.exerciseType === "stroop" && "Usuario elige el COLOR del texto, no la palabra escrita"}
                  {cerebralContent.exerciseType === "preferencia" && "Test proyectivo: usuario elige imagen que le atrae, revela personalidad"}
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
                    <button
                      type="button"
                      onClick={() => {
                        const STROOP_COLORS = [
                          { nombre: "Rojo", css: "red" },
                          { nombre: "Azul", css: "blue" },
                          { nombre: "Verde", css: "green" },
                          { nombre: "Amarillo", css: "#DAA520" },
                          { nombre: "Naranja", css: "orange" },
                          { nombre: "Morado", css: "purple" }
                        ];
                        const palabraIdx = Math.floor(Math.random() * STROOP_COLORS.length);
                        let colorIdx = Math.floor(Math.random() * STROOP_COLORS.length);
                        while (colorIdx === palabraIdx) {
                          colorIdx = Math.floor(Math.random() * STROOP_COLORS.length);
                        }
                        const palabra = STROOP_COLORS[palabraIdx].nombre;
                        const colorTexto = STROOP_COLORS[colorIdx];
                        const opciones = STROOP_COLORS.map(c => c.nombre);
                        setCerebralContent(p => ({
                          ...p,
                          exerciseData: {
                            ...p.exerciseData,
                            stroopWord: palabra,
                            stroopColor: colorTexto.css,
                            stroopOptions: opciones,
                            correctAnswer: colorTexto.nombre
                          }
                        }));
                      }}
                      className="w-full py-3 px-4 rounded-lg font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
                    >
                      Generar Ejercicio Automático
                    </button>
                    
                    <p className="text-white/40 text-xs text-center">
                      El botón genera: palabra, color diferente, opciones y respuesta correcta sincronizados
                    </p>

                    {cerebralContent.exerciseData.stroopWord && (
                      <div className="p-4 bg-white/5 rounded-lg space-y-3">
                        <div className="text-center">
                          <p className="text-white/60 text-xs mb-2">Vista previa del ejercicio:</p>
                          <div 
                            className="inline-block px-8 py-4 bg-white rounded-lg font-bold text-3xl"
                            style={{ color: cerebralContent.exerciseData.stroopColor }}
                          >
                            {cerebralContent.exerciseData.stroopWord}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-white/60">Palabra:</div>
                          <div className="text-white font-medium">{cerebralContent.exerciseData.stroopWord}</div>
                          <div className="text-white/60">Color del texto:</div>
                          <div className="text-white font-medium">{cerebralContent.exerciseData.stroopColor}</div>
                          <div className="text-white/60">Opciones:</div>
                          <div className="text-white font-medium">{(cerebralContent.exerciseData.stroopOptions || []).join(", ")}</div>
                          <div className="text-white/60">Respuesta correcta:</div>
                          <div className="text-green-400 font-bold">{cerebralContent.exerciseData.correctAnswer}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {cerebralContent.exerciseType === "preferencia" && (
                  <div className="space-y-4">
                    <p className="text-white/40 text-xs">Agrega imágenes. Cada una representa un rasgo de personalidad. No hay respuesta correcta.</p>
                    
                    {/* Editable instruction texts */}
                    <div className="space-y-2">
                      <label className="text-white/60 text-sm">Texto superior</label>
                      <Input
                        value={cerebralContent.exerciseData.prefTitle1 || "De los siguientes dibujos"}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, prefTitle1: e.target.value } 
                        }))}
                        placeholder="De los siguientes dibujos"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-sm">Texto principal (pregunta)</label>
                      <Input
                        value={cerebralContent.exerciseData.prefTitle2 || "¿cuál te atrae más?"}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, prefTitle2: e.target.value } 
                        }))}
                        placeholder="¿cuál te atrae más?"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    
                    {/* Dynamic image options */}
                    {(cerebralContent.exerciseData.prefOptions || [{ imageUrl: "", meaning: "" }]).map((opt: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-sm">Opción {idx + 1}</span>
                          {idx > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 h-6 px-2"
                              onClick={() => {
                                const opts = [...(cerebralContent.exerciseData.prefOptions || [])];
                                opts.splice(idx, 1);
                                setCerebralContent(p => ({ ...p, exerciseData: { ...p.exerciseData, prefOptions: opts } }));
                              }}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                        <Input
                          value={opt.imageUrl || ""}
                          onChange={(e) => {
                            const opts = [...(cerebralContent.exerciseData.prefOptions || [{ imageUrl: "", meaning: "" }])];
                            opts[idx] = { ...opts[idx], imageUrl: e.target.value };
                            setCerebralContent(p => ({ ...p, exerciseData: { ...p.exerciseData, prefOptions: opts } }));
                          }}
                          placeholder="URL de la imagen..."
                          className="bg-white/10 border-white/20 text-white"
                        />
                        <Input
                          value={opt.meaning || ""}
                          onChange={(e) => {
                            const opts = [...(cerebralContent.exerciseData.prefOptions || [{ imageUrl: "", meaning: "" }])];
                            opts[idx] = { ...opts[idx], meaning: e.target.value };
                            setCerebralContent(p => ({ ...p, exerciseData: { ...p.exerciseData, prefOptions: opts } }));
                          }}
                          placeholder="Significado (ej: Creatividad, Armonía, Dinamismo...)"
                          className="bg-white/10 border-white/20 text-white"
                        />
                        {opt.imageUrl && (
                          <img src={opt.imageUrl} alt={`Opción ${idx + 1}`} className="w-16 h-16 object-contain rounded bg-white/10" />
                        )}
                      </div>
                    ))}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 text-green-400"
                      onClick={() => {
                        const opts = [...(cerebralContent.exerciseData.prefOptions || [{ imageUrl: "", meaning: "" }])];
                        opts.push({ imageUrl: "", meaning: "" });
                        setCerebralContent(p => ({ ...p, exerciseData: { ...p.exerciseData, prefOptions: opts } }));
                      }}
                    >
                      + Agregar opción
                    </Button>
                  </div>
                )}

                {cerebralContent.exerciseType === "lateralidad" && (
                  <div className="space-y-4">
                    <p className="text-white/40 text-xs">Test de lateralidad: el usuario realiza una acción y responde qué mano usó.</p>
                    
                    <div className="space-y-2">
                      <label className="text-white/60 text-sm">Instrucción (acción a realizar)</label>
                      <Input
                        value={cerebralContent.exerciseData.latInstruction || "Coloca una mano sobre tu cabeza."}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, latInstruction: e.target.value } 
                        }))}
                        placeholder="Coloca una mano sobre tu cabeza."
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-sm">Pregunta</label>
                      <Input
                        value={cerebralContent.exerciseData.latQuestion || "¿Qué mano has utilizado?"}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, latQuestion: e.target.value } 
                        }))}
                        placeholder="¿Qué mano has utilizado?"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-sm">Opción izquierda</label>
                      <Input
                        value={cerebralContent.exerciseData.latLeft || "Izquierda"}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, latLeft: e.target.value } 
                        }))}
                        placeholder="Izquierda"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-sm">Opción derecha</label>
                      <Input
                        value={cerebralContent.exerciseData.latRight || "Derecha"}
                        onChange={(e) => setCerebralContent(p => ({ 
                          ...p, 
                          exerciseData: { ...p.exerciseData, latRight: e.target.value } 
                        }))}
                        placeholder="Derecha"
                        className="bg-white/10 border-white/20 text-white"
                      />
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

        {/* Images Panel */}
        {activeTab === "imagenes" && (
          <Card className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 border-pink-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Gestor de Imágenes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sync Styles Section */}
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-3">
                <p className="text-purple-400 text-sm mb-2 font-medium">Sincronizar ESTILOS (page_styles) entre Dev y Prod:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/admin/page-styles/export", {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        const data = await res.json();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `styles_export_${new Date().toISOString().split("T")[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        alert(`Exportados ${data.styles?.length || 0} estilos de página`);
                      } catch (e) {
                        alert("Error al exportar estilos");
                      }
                    }}
                    data-testid="button-export-styles"
                  >
                    Exportar Estilos (JSON)
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    id="import-styles"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const text = await file.text();
                        const data = JSON.parse(text);
                        const res = await fetch("/api/admin/page-styles/import", {
                          method: "POST",
                          headers: { 
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}` 
                          },
                          body: JSON.stringify({ styles: data.styles })
                        });
                        const result = await res.json();
                        alert(`Estilos importados: ${result.imported}`);
                      } catch (err) {
                        alert("Error al importar estilos: " + (err as Error).message);
                      }
                      e.target.value = "";
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                    onClick={() => document.getElementById("import-styles")?.click()}
                    data-testid="button-import-styles"
                  >
                    Importar Estilos (JSON)
                  </Button>
                </div>
              </div>
              
              {/* Sync Images Section */}
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm mb-2 font-medium">Sincronizar IMÁGENES entre Dev y Prod:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/admin/images/export", {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        const data = await res.json();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `images_export_${new Date().toISOString().split("T")[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        alert(`Exportadas ${data.images?.length || 0} imágenes`);
                      } catch (e) {
                        alert("Error al exportar");
                      }
                    }}
                    data-testid="button-export-images"
                  >
                    Exportar Imágenes (JSON)
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    id="import-images"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const text = await file.text();
                        const data = JSON.parse(text);
                        const res = await fetch("/api/admin/images/import", {
                          method: "POST",
                          headers: { 
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}` 
                          },
                          body: JSON.stringify({ images: data.images })
                        });
                        const result = await res.json();
                        alert(`Importadas: ${result.imported}, Omitidas (ya existían): ${result.skipped}`);
                        fetch("/api/images").then(r => r.json()).then(d => setUploadedImages(d || []));
                      } catch (err) {
                        alert("Error al importar: " + (err as Error).message);
                      }
                      e.target.value = "";
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                    onClick={() => document.getElementById("import-images")?.click()}
                    data-testid="button-import-images"
                  >
                    Importar Imágenes (JSON)
                  </Button>
                </div>
              </div>
              
              {/* Upload Section */}
              <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-white/60" />
                  <span className="text-white/60 text-sm">Subir imagen</span>
                </label>
              </div>

              {/* Image Editor */}
              {imagePreview && (
                <div className="space-y-4 p-4 bg-black/30 rounded-lg">
                  <Input
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    placeholder="Nombre de la imagen..."
                    className="bg-white/10 border-white/20 text-white"
                  />
                  
                  {/* Crop Area */}
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="text-xs border-white/20 text-white/80" onClick={() => setCrop(undefined)}>
                        Sin recorte
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs border-white/20 text-white/80" onClick={() => setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 })}>
                        Recortar centro
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs border-white/20 text-white/80" onClick={() => setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 })}>
                        Toda la imagen
                      </Button>
                    </div>
                    <p className="text-white/40 text-xs">Arrastra las esquinas o bordes para ajustar el recorte</p>
                    <div className="max-h-64 overflow-auto bg-gray-900 rounded p-2">
                      <ReactCrop 
                        crop={crop} 
                        onChange={c => setCrop(c)}
                        ruleOfThirds
                      >
                        <img ref={imgRef} src={imagePreview} alt="Preview" className="max-w-full" />
                      </ReactCrop>
                    </div>
                  </div>
                  
                  {/* Compression */}
                  <div>
                    <div className="flex justify-between text-white/60 text-sm mb-1">
                      <span>Compresión: {compressionQuality}%</span>
                      <span className="text-cyan-400">
                        {(originalSize / 1024).toFixed(1)}KB → {(compressedSize / 1024).toFixed(1)}KB
                        {originalSize > 0 && compressedSize < originalSize && ` (${Math.round((1 - compressedSize / originalSize) * 100)}% menos)`}
                      </span>
                    </div>
                    {imagePreview?.startsWith('data:image/png') && (
                      <p className="text-yellow-400/80 text-xs mb-2">PNG: preserva transparencia, sin compresión con pérdida</p>
                    )}
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={compressionQuality}
                      onChange={(e) => setCompressionQuality(Number(e.target.value))}
                      className="w-full"
                      disabled={imagePreview?.startsWith('data:image/png')}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveImage} disabled={saving} className="flex-1 bg-green-600">
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => { setImagePreview(""); setImageFile(null); setCrop(undefined); }}
                      className="border-red-500/30 text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Gallery */}
              <div className="space-y-2">
                <h3 className="text-white/80 font-semibold">Imágenes guardadas ({uploadedImages.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="bg-white/10 rounded-lg p-2 space-y-2">
                      <img src={img.data} alt={img.name} className="w-full h-20 object-cover rounded" />
                      <p className="text-white/60 text-xs truncate">{img.name}</p>
                      <p className="text-white/40 text-xs">{img.width}x{img.height} • {(img.compressedSize / 1024).toFixed(1)}KB</p>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs border-cyan-500/30 text-cyan-400"
                          onClick={() => copyImageUrl(img.id)}
                        >
                          {copiedId === img.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-red-500/30 text-red-400"
                          onClick={() => deleteImage(img.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "entrenamiento" && (
          <Card className="bg-black/40 border-teal-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-400" />
                Gestión de Entrenamientos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {(["ninos", "adolescentes", "universitarios", "profesionales", "adulto_mayor"] as const).map((cat) => (
                  <Button
                    key={cat}
                    onClick={async () => {
                      setEntrenamientoCategory(cat);
                      try {
                        const [cardRes, pageRes, itemsRes, prepPagesRes, catPrepRes] = await Promise.all([
                          fetch(`/api/entrenamiento/${cat}/card`),
                          fetch(`/api/entrenamiento/${cat}/page`),
                          fetch(`/api/entrenamiento/${cat}/items`),
                          fetch(`/api/admin/prep-pages`, { headers: { Authorization: `Bearer ${token}` } }),
                          fetch(`/api/admin/categoria-prep/${cat}`, { headers: { Authorization: `Bearer ${token}` } })
                        ]);
                        const cardData = await cardRes.json();
                        const pageData = await pageRes.json();
                        const itemsData = await itemsRes.json();
                        const prepPagesData = await prepPagesRes.json();
                        const catPrepData = await catPrepRes.json();
                        if (cardData.card) setEntrenamientoCard(cardData.card);
                        if (pageData.page) setEntrenamientoPage(pageData.page);
                        setEntrenamientoItems(itemsData.items || []);
                        setPrepPages(prepPagesData.pages || []);
                        setSelectedPrepPageId(catPrepData.mapping?.prepPageId || null);
                      } catch (e) { console.error(e); }
                    }}
                    variant={entrenamientoCategory === cat ? "default" : "outline"}
                    size="sm"
                    className={entrenamientoCategory === cat ? "bg-teal-600" : "border-teal-500/30 text-teal-400"}
                  >
                    {cat === "ninos" ? "Niños" : cat === "adolescentes" ? "Adolescentes" : cat === "universitarios" ? "Universitarios" : cat === "profesionales" ? "Profesionales" : "Adulto Mayor"}
                  </Button>
                ))}
              </div>

              {/* Página de Preparación */}
              <div className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <span>📋</span> Página de Preparación
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setEditingPrepPage({ nombre: "", titulo: "", subtitulo: "", instrucciones: "", textoBoton: "Empezar" })}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    + Nueva Página
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <label className="text-white/70 text-sm">Página asignada a esta categoría:</label>
                  <select
                    value={selectedPrepPageId || ""}
                    onChange={async (e) => {
                      const newPrepPageId = e.target.value || null;
                      setSelectedPrepPageId(newPrepPageId);
                      await fetch(`/api/admin/categoria-prep/${entrenamientoCategory}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ prepPageId: newPrepPageId })
                      });
                    }}
                    className="bg-white/10 border border-purple-500/30 text-white rounded-md px-3 py-2"
                  >
                    <option value="" className="bg-gray-800">Sin página de preparación</option>
                    {prepPages.map(p => (
                      <option key={p.id} value={p.id} className="bg-gray-800">{p.nombre}</option>
                    ))}
                  </select>
                </div>

                {prepPages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {prepPages.map(p => (
                      <div
                        key={p.id}
                        className={`px-3 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-2 ${selectedPrepPageId === p.id ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70'}`}
                        onClick={() => setEditingPrepPage(p)}
                      >
                        {p.nombre}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("¿Eliminar esta página de preparación?")) {
                              await fetch(`/api/admin/prep-pages/${p.id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              setPrepPages(prepPages.filter(pp => pp.id !== p.id));
                              if (selectedPrepPageId === p.id) setSelectedPrepPageId(null);
                            }
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {editingPrepPage && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-purple-500/20">
                    <h4 className="text-white font-medium mb-3">{editingPrepPage.id ? "Editar" : "Nueva"} Página de Preparación</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-xs">Nombre (interno)</label>
                        <Input
                          value={editingPrepPage.nombre}
                          onChange={(e) => setEditingPrepPage({...editingPrepPage, nombre: e.target.value})}
                          className="bg-white/10 border-purple-500/30 text-white"
                          placeholder="Ej: Preparación Lectura Rápida"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs">Imagen</label>
                        <div className="flex gap-2">
                          <Input
                            value={editingPrepPage.imagen || ""}
                            onChange={(e) => setEditingPrepPage({...editingPrepPage, imagen: e.target.value})}
                            className="bg-white/10 border-purple-500/30 text-white"
                            placeholder="URL de imagen"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-500/30 text-purple-400"
                            onClick={() => {
                              setImagePickerCallback(() => (url: string) => {
                                setEditingPrepPage({...editingPrepPage!, imagen: url});
                                setShowImagePicker(false);
                              });
                              setShowImagePicker(true);
                            }}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-white/60 text-xs">Título</label>
                        <Input
                          value={editingPrepPage.titulo || ""}
                          onChange={(e) => setEditingPrepPage({...editingPrepPage, titulo: e.target.value})}
                          className="bg-white/10 border-purple-500/30 text-white"
                          placeholder="Ej: Mejora tu Velocidad de Lectura"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs">Subtítulo</label>
                        <Input
                          value={editingPrepPage.subtitulo || ""}
                          onChange={(e) => setEditingPrepPage({...editingPrepPage, subtitulo: e.target.value})}
                          className="bg-white/10 border-purple-500/30 text-white"
                          placeholder="Ej: ¡Mejora tu lectura rápidamente!"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-white/60 text-xs">Instrucciones</label>
                        <textarea
                          value={editingPrepPage.instrucciones || ""}
                          onChange={(e) => setEditingPrepPage({...editingPrepPage, instrucciones: e.target.value})}
                          className="w-full bg-gray-700 border border-purple-500/30 text-white rounded-md p-2"
                          placeholder="Ej: Observa las palabras sin leer en voz alta..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs">Texto del Botón</label>
                        <Input
                          value={editingPrepPage.textoBoton || ""}
                          onChange={(e) => setEditingPrepPage({...editingPrepPage, textoBoton: e.target.value})}
                          className="bg-white/10 border-purple-500/30 text-white"
                          placeholder="Empezar"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={async () => {
                          try {
                            if (editingPrepPage.id) {
                              const res = await fetch(`/api/admin/prep-pages/${editingPrepPage.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify(editingPrepPage)
                              });
                              const data = await res.json();
                              setPrepPages(prepPages.map(p => p.id === data.page.id ? data.page : p));
                            } else {
                              const res = await fetch(`/api/admin/prep-pages`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify(editingPrepPage)
                              });
                              const data = await res.json();
                              setPrepPages([data.page, ...prepPages]);
                            }
                            setEditingPrepPage(null);
                            alert("Página guardada");
                          } catch (e) { alert("Error al guardar"); }
                        }}
                        className="bg-purple-600"
                      >
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={() => setEditingPrepPage(null)} className="border-white/20 text-white">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-white/5 rounded-xl">
                  <h3 className="text-white font-semibold">Card Principal (Página de Selección)</h3>
                  <div>
                    <label className="text-white/60 text-sm">Imagen</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={entrenamientoCard.imageUrl}
                        onChange={(e) => setEntrenamientoCard({...entrenamientoCard, imageUrl: e.target.value})}
                        className="bg-white/10 border-teal-500/30 text-white"
                        placeholder="URL de imagen"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-teal-500/30 text-teal-400"
                        onClick={() => {
                          setImagePickerCallback(() => (url: string) => {
                            setEntrenamientoCard({...entrenamientoCard, imageUrl: url});
                            setShowImagePicker(false);
                          });
                          setShowImagePicker(true);
                        }}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    {entrenamientoCard.imageUrl && (
                      <img src={entrenamientoCard.imageUrl} alt="" className="w-20 h-20 object-cover rounded mt-2" />
                    )}
                  </div>
                  <div>
                    <label className="text-white/60 text-sm">Título</label>
                    <Input
                      value={entrenamientoCard.title}
                      onChange={(e) => setEntrenamientoCard({...entrenamientoCard, title: e.target.value})}
                      className="bg-white/10 border-teal-500/30 text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm">Descripción</label>
                    <textarea
                      value={entrenamientoCard.description}
                      onChange={(e) => setEntrenamientoCard({...entrenamientoCard, description: e.target.value})}
                      className="w-full bg-gray-700 border border-teal-500/30 text-white rounded-md p-2 mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm">Texto del Botón</label>
                    <Input
                      value={entrenamientoCard.buttonText}
                      onChange={(e) => setEntrenamientoCard({...entrenamientoCard, buttonText: e.target.value})}
                      className="bg-white/10 border-teal-500/30 text-white mt-1"
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        const res = await adminFetch("/api/admin/entrenamiento/card", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...entrenamientoCard, categoria: entrenamientoCategory })
                        });
                        if (res.ok) {
                          alert("Card guardado");
                        } else {
                          alert("Error: Token inválido o sesión expirada");
                        }
                      } catch (e) { alert("Error al guardar"); }
                    }}
                    className="w-full bg-teal-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Card
                  </Button>
                </div>

                <div className="space-y-4 p-4 bg-white/5 rounded-xl">
                  <h3 className="text-white font-semibold">Configuración de Página</h3>
                  <div>
                    <label className="text-white/60 text-sm">Banner (texto superior)</label>
                    <Input
                      value={entrenamientoPage.bannerText}
                      onChange={(e) => setEntrenamientoPage({...entrenamientoPage, bannerText: e.target.value})}
                      className="bg-white/10 border-teal-500/30 text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm">Título de Página</label>
                    <Input
                      value={entrenamientoPage.pageTitle}
                      onChange={(e) => setEntrenamientoPage({...entrenamientoPage, pageTitle: e.target.value})}
                      className="bg-white/10 border-teal-500/30 text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm">Descripción</label>
                    <textarea
                      value={entrenamientoPage.pageDescription}
                      onChange={(e) => setEntrenamientoPage({...entrenamientoPage, pageDescription: e.target.value})}
                      className="w-full bg-gray-700 border border-teal-500/30 text-white rounded-md p-2 mt-1"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        const res = await adminFetch("/api/admin/entrenamiento/page", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...entrenamientoPage, categoria: entrenamientoCategory })
                        });
                        if (res.ok) {
                          alert("Página guardada");
                        } else {
                          alert("Error: Token inválido o sesión expirada");
                        }
                      } catch (e) { alert("Error al guardar"); }
                    }}
                    className="w-full bg-teal-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Página
                  </Button>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Secciones de Entrenamiento</h3>
                    <p className="text-white/50 text-sm">Cada sección aparecerá como una tarjeta en la app</p>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        const res = await adminFetch("/api/admin/entrenamiento/item", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            categoria: entrenamientoCategory,
                            title: "Nueva Sección",
                            description: "Descripción de la sección",
                            imageUrl: "",
                            linkUrl: "",
                            sortOrder: entrenamientoItems.length,
                            isActive: true
                          })
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setEntrenamientoItems([...entrenamientoItems, data.item]);
                        } else {
                          alert("Error: Token inválido o sesión expirada");
                        }
                      } catch (e) { alert("Error al crear"); }
                    }}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Sección
                  </Button>
                </div>

                {entrenamientoItems.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-xl">
                    <Zap className="w-12 h-12 text-teal-400/50 mx-auto mb-3" />
                    <p className="text-white/60 mb-2">No hay secciones creadas</p>
                    <p className="text-white/40 text-sm">Haz clic en "Nueva Sección" para agregar una</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entrenamientoItems.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className={`rounded-2xl p-5 border-2 transition-all ${
                          item.isActive 
                            ? "bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border-teal-500/50" 
                            : "bg-black/30 border-white/10 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded">
                              #{idx + 1}
                            </span>
                            <span className="text-white/60 text-sm">
                              {item.isActive ? "Visible en la app" : "Oculto"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className={item.isActive ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}
                              onClick={() => {
                                const updated = [...entrenamientoItems];
                                updated[idx].isActive = !updated[idx].isActive;
                                setEntrenamientoItems(updated);
                              }}
                            >
                              {item.isActive ? "Activo" : "Inactivo"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400"
                              onClick={async () => {
                                if (confirm("¿Eliminar esta sección?")) {
                                  const res = await adminFetch(`/api/admin/entrenamiento/item/${item.id}`, {
                                    method: "DELETE"
                                  });
                                  if (res.ok) {
                                    setEntrenamientoItems(entrenamientoItems.filter(i => i.id !== item.id));
                                  } else {
                                    alert("Error: Token inválido o sesión expirada");
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex-shrink-0 space-y-2">
                            <p className="text-white/60 text-xs text-center">Imagen</p>
                            <div 
                              className="w-24 h-24 bg-white/10 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-white/30 flex items-center justify-center"
                              onClick={() => {
                                setImagePickerCallback(() => (url: string) => {
                                  const updated = [...entrenamientoItems];
                                  updated[idx].imageUrl = url;
                                  setEntrenamientoItems(updated);
                                  setShowImagePicker(false);
                                });
                                setShowImagePicker(true);
                              }}
                            >
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center">
                                  <ImageIcon className="w-8 h-8 text-white/30 mx-auto" />
                                  <span className="text-white/40 text-xs">Galería</span>
                                </div>
                              )}
                            </div>
                            <Input
                              value={item.imageUrl || ""}
                              onChange={(e) => {
                                const updated = [...entrenamientoItems];
                                updated[idx].imageUrl = e.target.value;
                                setEntrenamientoItems(updated);
                              }}
                              className="w-24 bg-white/10 border-teal-500/30 text-white text-xs p-1"
                              placeholder="URL..."
                            />
                          </div>

                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="text-white/60 text-xs mb-1 block">Título de la sección</label>
                              <Input
                                value={item.title}
                                onChange={(e) => {
                                  const updated = [...entrenamientoItems];
                                  updated[idx].title = e.target.value;
                                  setEntrenamientoItems(updated);
                                }}
                                className="bg-white/10 border-teal-500/30 text-white font-semibold"
                                placeholder="Ej: Mejora tu Velocidad de Lectura"
                              />
                            </div>
                            <div>
                              <label className="text-white/60 text-xs mb-1 block">Descripción breve</label>
                              <Input
                                value={item.description || ""}
                                onChange={(e) => {
                                  const updated = [...entrenamientoItems];
                                  updated[idx].description = e.target.value;
                                  setEntrenamientoItems(updated);
                                }}
                                className="bg-white/10 border-teal-500/30 text-white/80"
                                placeholder="Ej: Para procesar palabras rápidamente"
                              />
                            </div>
                            <div>
                              <label className="text-white/60 text-xs mb-1 block">Tipo de ejercicio</label>
                              <select
                                value={item.tipoEjercicio || "velocidad"}
                                onChange={(e) => {
                                  const updated = [...entrenamientoItems];
                                  updated[idx].tipoEjercicio = e.target.value;
                                  setEntrenamientoItems(updated);
                                }}
                                className="w-full bg-gray-700 border border-teal-500/30 text-white rounded-md p-2 text-sm"
                              >
                                <option value="velocidad" className="bg-gray-700 text-white">Velocidad de lectura</option>
                                <option value="numeros" className="bg-gray-700 text-white">Identifica Números y Letras</option>
                                <option value="aceleracion_lectura" className="bg-gray-700 text-white">Aceleración de Lectura</option>
                                <option value="lectura" className="bg-gray-700 text-white">Test de lectura</option>
                                <option value="memoria" className="bg-gray-700 text-white">Ejercicio de memoria</option>
                                <option value="reconocimiento_visual" className="bg-gray-700 text-white">Reconocimiento Visual</option>
                                <option value="otro" className="bg-gray-700 text-white">Otro (enlace externo)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Sección específica para tipo numeros */}
                        {item.tipoEjercicio === "numeros" && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="mb-4">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <span className="text-lg">🔢</span>
                                Página de Introducción
                                <span className="text-white/40 text-xs font-normal">(Identifica Números y Letras)</span>
                              </h4>
                              <div className="grid md:grid-cols-2 gap-4 bg-teal-900/30 p-4 rounded-xl border border-teal-500/30">
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-white/60 text-xs mb-1 block">Imagen de cabecera</label>
                                    <div className="flex gap-2">
                                      <Input
                                        value={numerosIntroData?.entrenamientoItemId === item.id ? (numerosIntroData?.imagenCabecera || "") : ""}
                                        onChange={(e) => {
                                          setNumerosIntroData(prev => ({
                                            ...prev,
                                            entrenamientoItemId: item.id,
                                            titulo: prev?.titulo || "Identifica rápidamente\nNúmeros y Letras",
                                            descripcion: prev?.descripcion || "¡Haz más fuerte tu vista jugando!",
                                            subtitulo: prev?.subtitulo || "Identifica el número o letra para ver el mundo más grande",
                                            imagenCabecera: e.target.value
                                          }));
                                        }}
                                        className="bg-white/10 border-teal-500/30 text-white text-sm"
                                        placeholder="URL de imagen..."
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-teal-500/30 text-teal-400 px-2"
                                        onClick={() => {
                                          setImagePickerCallback(() => (url: string) => {
                                            setNumerosIntroData(prev => ({
                                              ...prev,
                                              entrenamientoItemId: item.id,
                                              titulo: prev?.titulo || "Identifica rápidamente\nNúmeros y Letras",
                                              descripcion: prev?.descripcion || "¡Haz más fuerte tu vista jugando!",
                                              subtitulo: prev?.subtitulo || "Identifica el número o letra para ver el mundo más grande",
                                              imagenCabecera: url
                                            }));
                                            setShowImagePicker(false);
                                          });
                                          setShowImagePicker(true);
                                        }}
                                      >
                                        <ImageIcon className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    {(numerosIntroData?.entrenamientoItemId === item.id && numerosIntroData?.imagenCabecera) && (
                                      <img src={numerosIntroData.imagenCabecera} alt="" className="w-20 h-20 object-contain mt-2 rounded bg-white/10" />
                                    )}
                                  </div>
                                  <div>
                                    <label className="text-white/60 text-xs mb-1 block">Título principal</label>
                                    <textarea
                                      value={numerosIntroData?.entrenamientoItemId === item.id ? (numerosIntroData?.titulo || "") : "Identifica rápidamente\nNúmeros y Letras"}
                                      onChange={(e) => {
                                        setNumerosIntroData(prev => ({
                                          ...prev,
                                          entrenamientoItemId: item.id,
                                          titulo: e.target.value,
                                          descripcion: prev?.descripcion || "¡Haz más fuerte tu vista jugando!",
                                          subtitulo: prev?.subtitulo || "Identifica el número o letra para ver el mundo más grande",
                                          imagenCabecera: prev?.imagenCabecera || ""
                                        }));
                                      }}
                                      className="w-full bg-gray-700 border border-teal-500/30 text-white rounded-md p-2 text-sm"
                                      placeholder="Ej: Identifica rápidamente\nNúmeros y Letras"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-white/60 text-xs mb-1 block">Subtítulo destacado</label>
                                    <Input
                                      value={numerosIntroData?.entrenamientoItemId === item.id ? (numerosIntroData?.descripcion || "") : "¡Haz más fuerte tu vista jugando!"}
                                      onChange={(e) => {
                                        setNumerosIntroData(prev => ({
                                          ...prev,
                                          entrenamientoItemId: item.id,
                                          titulo: prev?.titulo || "Identifica rápidamente\nNúmeros y Letras",
                                          descripcion: e.target.value,
                                          subtitulo: prev?.subtitulo || "Identifica el número o letra para ver el mundo más grande",
                                          imagenCabecera: prev?.imagenCabecera || ""
                                        }));
                                      }}
                                      className="bg-white/10 border-teal-500/30 text-white"
                                      placeholder="Ej: ¡Haz más fuerte tu vista jugando!"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-white/60 text-xs mb-1 block">Instrucciones</label>
                                    <Input
                                      value={numerosIntroData?.entrenamientoItemId === item.id ? (numerosIntroData?.subtitulo || "") : "Identifica el número o letra para ver el mundo más grande"}
                                      onChange={(e) => {
                                        setNumerosIntroData(prev => ({
                                          ...prev,
                                          entrenamientoItemId: item.id,
                                          titulo: prev?.titulo || "Identifica rápidamente\nNúmeros y Letras",
                                          descripcion: prev?.descripcion || "¡Haz más fuerte tu vista jugando!",
                                          subtitulo: e.target.value,
                                          imagenCabecera: prev?.imagenCabecera || ""
                                        }));
                                      }}
                                      className="bg-white/10 border-teal-500/30 text-white"
                                      placeholder="Ej: Identifica el número o letra..."
                                    />
                                  </div>
                                  <div className="flex justify-end pt-2">
                                    <Button
                                      onClick={async () => {
                                        const dataToSave = (numerosIntroData && numerosIntroData.entrenamientoItemId === item.id) 
                                          ? numerosIntroData 
                                          : {
                                              entrenamientoItemId: item.id,
                                              titulo: "Identifica rápidamente\nNúmeros y Letras",
                                              descripcion: "¡Haz más fuerte tu vista jugando!",
                                              subtitulo: "Identifica el número o letra para ver el mundo más grande",
                                              imagenCabecera: ""
                                            };
                                        try {
                                          // Primero guardar el item con el tipo de ejercicio actualizado
                                          await adminFetch(`/api/admin/entrenamiento/item/${item.id}`, {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ ...item, tipoEjercicio: "numeros" })
                                          });
                                          
                                          const existing = await fetch(`/api/numeros-intro/${item.id}`);
                                          const existingData = await existing.json();
                                          
                                          if (existingData.intro?.id) {
                                            const res = await adminFetch(`/api/admin/numeros-intro/${existingData.intro.id}`, {
                                              method: "PUT",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                titulo: dataToSave.titulo,
                                                descripcion: dataToSave.descripcion,
                                                subtitulo: dataToSave.subtitulo,
                                                imagenCabecera: dataToSave.imagenCabecera
                                              })
                                            });
                                            if (res.ok) {
                                              alert("Página guardada correctamente");
                                            } else {
                                              alert("Error al guardar");
                                            }
                                          } else {
                                            const res = await adminFetch("/api/admin/numeros-intro", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                entrenamientoItemId: item.id,
                                                titulo: dataToSave.titulo,
                                                descripcion: dataToSave.descripcion,
                                                subtitulo: dataToSave.subtitulo,
                                                imagenCabecera: dataToSave.imagenCabecera,
                                                niveles: "[]"
                                              })
                                            });
                                            if (res.ok) {
                                              alert("Página guardada correctamente");
                                            } else {
                                              alert("Error al guardar");
                                            }
                                          }
                                        } catch (e) { console.error(e); alert("Error al guardar"); }
                                      }}
                                      className="bg-teal-600 hover:bg-teal-700 text-white"
                                    >
                                      Guardar Página
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sección específica para tipo aceleracion_lectura */}
                        {item.tipoEjercicio === "aceleracion_lectura" && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="mb-4">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <span className="text-lg">⚡</span>
                                Configuración de Aceleración
                                <span className="text-white/40 text-xs font-normal">(Golpe de Vista / Desplazamiento)</span>
                              </h4>
                              <div className="grid md:grid-cols-2 gap-4 bg-cyan-900/30 p-4 rounded-xl border border-cyan-500/30">
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-white/60 text-xs mb-1 block">Imagen de cabecera</label>
                                    <div className="flex gap-2">
                                      <Input
                                        value={aceleracionData?.entrenamientoItemId === item.id ? (aceleracionData?.imagenCabecera || "") : ""}
                                        onChange={(e) => {
                                          setAceleracionData(prev => ({
                                            ...prev,
                                            entrenamientoItemId: item.id,
                                            titulo: prev?.titulo || "Acelera al máximo tu Lectura",
                                            velocidadPPM: prev?.velocidadPPM || 200,
                                            modoGolpePorcentaje: prev?.modoGolpePorcentaje || 50,
                                            imagenCabecera: e.target.value
                                          }));
                                        }}
                                        className="bg-white/10 border-cyan-500/30 text-white text-sm"
                                        placeholder="URL de imagen..."
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-cyan-500/30 text-cyan-400 px-2"
                                        onClick={() => {
                                          setImagePickerCallback(() => (url: string) => {
                                            setAceleracionData(prev => ({
                                              ...prev,
                                              entrenamientoItemId: item.id,
                                              titulo: prev?.titulo || "Acelera al máximo tu Lectura",
                                              velocidadPPM: prev?.velocidadPPM || 200,
                                              modoGolpePorcentaje: prev?.modoGolpePorcentaje || 50,
                                              imagenCabecera: url
                                            }));
                                            setShowImagePicker(false);
                                          });
                                          setShowImagePicker(true);
                                        }}
                                      >
                                        <ImageIcon className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    {(aceleracionData?.entrenamientoItemId === item.id && aceleracionData?.imagenCabecera) && (
                                      <img src={aceleracionData.imagenCabecera} alt="" className="w-20 h-20 object-contain mt-2 rounded bg-white/10" />
                                    )}
                                  </div>
                                  <div>
                                    <label className="text-white/60 text-xs mb-1 block">Título</label>
                                    <Input
                                      value={aceleracionData?.entrenamientoItemId === item.id ? (aceleracionData?.titulo || "") : "Acelera al máximo tu Lectura"}
                                      onChange={(e) => {
                                        setAceleracionData(prev => ({
                                          ...prev,
                                          entrenamientoItemId: item.id,
                                          titulo: e.target.value,
                                          velocidadPPM: prev?.velocidadPPM || 200,
                                          modoGolpePorcentaje: prev?.modoGolpePorcentaje || 50,
                                          imagenCabecera: prev?.imagenCabecera || ""
                                        }));
                                      }}
                                      className="bg-white/10 border-cyan-500/30 text-white text-sm"
                                      placeholder="Acelera al máximo tu Lectura"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-white/60 text-xs mb-1 block">Velocidad PPM (palabras por minuto)</label>
                                    <Input
                                      type="number"
                                      value={aceleracionData?.entrenamientoItemId === item.id ? (aceleracionData?.velocidadPPM || 200) : 200}
                                      onChange={(e) => {
                                        setAceleracionData(prev => ({
                                          ...prev,
                                          entrenamientoItemId: item.id,
                                          titulo: prev?.titulo || "Acelera al máximo tu Lectura",
                                          velocidadPPM: parseInt(e.target.value) || 200,
                                          modoGolpePorcentaje: prev?.modoGolpePorcentaje || 50,
                                          imagenCabecera: prev?.imagenCabecera || ""
                                        }));
                                      }}
                                      className="bg-white/10 border-cyan-500/30 text-white text-sm"
                                      min={50}
                                      max={1000}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-white/60 text-xs mb-1 block">Modo Golpe % (porcentaje visible)</label>
                                    <Input
                                      type="number"
                                      value={aceleracionData?.entrenamientoItemId === item.id ? (aceleracionData?.modoGolpePorcentaje || 50) : 50}
                                      onChange={(e) => {
                                        setAceleracionData(prev => ({
                                          ...prev,
                                          entrenamientoItemId: item.id,
                                          titulo: prev?.titulo || "Acelera al máximo tu Lectura",
                                          velocidadPPM: prev?.velocidadPPM || 200,
                                          modoGolpePorcentaje: parseInt(e.target.value) || 50,
                                          imagenCabecera: prev?.imagenCabecera || ""
                                        }));
                                      }}
                                      className="bg-white/10 border-cyan-500/30 text-white text-sm"
                                      min={10}
                                      max={100}
                                    />
                                  </div>
                                  <div className="flex justify-end pt-2">
                                    <Button
                                      onClick={async () => {
                                        const dataToSave = (aceleracionData && aceleracionData.entrenamientoItemId === item.id) 
                                          ? aceleracionData 
                                          : {
                                              entrenamientoItemId: item.id,
                                              titulo: "Acelera tu Lectura",
                                              imagenCabecera: "",
                                              velocidadPPM: 200,
                                              modoGolpePorcentaje: 50
                                            };
                                        try {
                                          // Primero guardar el item con el tipo de ejercicio actualizado
                                          await adminFetch(`/api/admin/entrenamiento/item/${item.id}`, {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ ...item, tipoEjercicio: "aceleracion_lectura" })
                                          });
                                          
                                          const existing = await fetch(`/api/aceleracion/${item.id}`);
                                          const existingData = await existing.json();
                                          
                                          if (existingData.ejercicio?.id) {
                                            const res = await adminFetch(`/api/admin/aceleracion/${existingData.ejercicio.id}`, {
                                              method: "PUT",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                titulo: dataToSave.titulo,
                                                imagenCabecera: dataToSave.imagenCabecera,
                                                velocidadPPM: dataToSave.velocidadPPM,
                                                modoGolpePorcentaje: dataToSave.modoGolpePorcentaje
                                              })
                                            });
                                            if (res.ok) {
                                              setAceleracionData(prev => prev ? { ...prev, id: existingData.ejercicio.id } : prev);
                                              alert("Configuración guardada correctamente");
                                            } else {
                                              alert("Error al guardar");
                                            }
                                          } else {
                                            const res = await adminFetch("/api/admin/aceleracion", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                entrenamientoItemId: item.id,
                                                titulo: dataToSave.titulo,
                                                imagenCabecera: dataToSave.imagenCabecera,
                                                velocidadPPM: dataToSave.velocidadPPM,
                                                modoGolpePorcentaje: dataToSave.modoGolpePorcentaje
                                              })
                                            });
                                            if (res.ok) {
                                              const newData = await res.json();
                                              if (newData.ejercicio?.id) {
                                                setAceleracionData(prev => prev ? { ...prev, id: newData.ejercicio.id } : prev);
                                              }
                                              alert("Configuración guardada correctamente");
                                            } else {
                                              alert("Error al guardar");
                                            }
                                          }
                                        } catch (e) { console.error(e); alert("Error al guardar"); }
                                      }}
                                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                                    >
                                      Guardar Configuración
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sección Página de Preparación (para otros tipos) */}
                        {item.tipoEjercicio !== "numeros" && item.tipoEjercicio !== "aceleracion_lectura" && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="mb-4">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <span className="text-lg">📋</span>
                              Página de Preparación
                              <span className="text-white/40 text-xs font-normal">(antes de empezar ejercicios)</span>
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl">
                              <div className="space-y-3">
                                <div>
                                  <label className="text-white/60 text-xs mb-1 block">Imagen de preparación</label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={item.prepImage || ""}
                                      onChange={(e) => {
                                        const updated = [...entrenamientoItems];
                                        updated[idx].prepImage = e.target.value;
                                        setEntrenamientoItems(updated);
                                      }}
                                      className="bg-white/10 border-purple-500/30 text-white text-sm"
                                      placeholder="URL de imagen..."
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-purple-500/30 text-purple-400 px-2"
                                      onClick={() => {
                                        setImagePickerCallback(() => (url: string) => {
                                          const updated = [...entrenamientoItems];
                                          updated[idx].prepImage = url;
                                          setEntrenamientoItems(updated);
                                          setShowImagePicker(false);
                                        });
                                        setShowImagePicker(true);
                                      }}
                                    >
                                      <ImageIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  {item.prepImage && (
                                    <img src={item.prepImage} alt="" className="w-16 h-16 object-contain mt-2 rounded bg-white/10" />
                                  )}
                                </div>
                                <div>
                                  <label className="text-white/60 text-xs mb-1 block">Título</label>
                                  <Input
                                    value={item.prepTitle || ""}
                                    onChange={(e) => {
                                      const updated = [...entrenamientoItems];
                                      updated[idx].prepTitle = e.target.value;
                                      setEntrenamientoItems(updated);
                                    }}
                                    className="bg-white/10 border-purple-500/30 text-white"
                                    placeholder="Ej: Mejora tu Velocidad de Lectura"
                                  />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-white/60 text-xs mb-1 block">Subtítulo destacado</label>
                                  <Input
                                    value={item.prepSubtitle || ""}
                                    onChange={(e) => {
                                      const updated = [...entrenamientoItems];
                                      updated[idx].prepSubtitle = e.target.value;
                                      setEntrenamientoItems(updated);
                                    }}
                                    className="bg-white/10 border-purple-500/30 text-white"
                                    placeholder="Ej: ¡Mejora tu lectura rápidamente!"
                                  />
                                </div>
                                <div>
                                  <label className="text-white/60 text-xs mb-1 block">Instrucciones</label>
                                  <textarea
                                    value={item.prepInstructions || ""}
                                    onChange={(e) => {
                                      const updated = [...entrenamientoItems];
                                      updated[idx].prepInstructions = e.target.value;
                                      setEntrenamientoItems(updated);
                                    }}
                                    className="w-full bg-gray-700 border border-purple-500/30 text-white rounded-md p-2 text-sm"
                                    placeholder="Ej: Observa las palabras sin leer en voz alta..."
                                    rows={2}
                                  />
                                </div>
                                <div>
                                  <label className="text-white/60 text-xs mb-1 block">Texto del botón</label>
                                  <Input
                                    value={item.prepButtonText || ""}
                                    onChange={(e) => {
                                      const updated = [...entrenamientoItems];
                                      updated[idx].prepButtonText = e.target.value;
                                      setEntrenamientoItems(updated);
                                    }}
                                    className="bg-white/10 border-purple-500/30 text-white"
                                    placeholder="Empezar"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={async () => {
                                setEditingVelocidadItem(item.id);
                                try {
                                  const res = await fetch(`/api/admin/velocidad/${item.id}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  const data = await res.json();
                                  if (data.ejercicios && data.ejercicios.length > 0) {
                                    const ej = data.ejercicios[0];
                                    setVelocidadEjercicio({
                                      id: ej.id,
                                      entrenamientoItemId: item.id,
                                      titulo: ej.titulo || "Mejora tu Velocidad",
                                      descripcion: ej.descripcion || "",
                                      imagenCabecera: ej.imagenCabecera || "",
                                      niveles: ej.niveles ? JSON.parse(ej.niveles) : [
                                        { nivel: 1, patron: "2x3", velocidad: 1500, contenido: ["A", "B", "C", "D", "E", "F"] },
                                        { nivel: 2, patron: "3x3", velocidad: 1200, contenido: ["A", "B", "C", "D", "E", "F", "G", "H", "I"] },
                                        { nivel: 3, patron: "1x3", velocidad: 1000, contenido: ["AB", "CD", "EF"] },
                                        { nivel: 4, patron: "2x2", velocidad: 800, contenido: ["AB", "CD", "EF", "GH"] }
                                      ],
                                      tiempoAnimacionInicial: ej.tiempoAnimacionInicial || 3,
                                      velocidadAnimacion: ej.velocidadAnimacion || 5,
                                      isActive: ej.isActive ?? true
                                    });
                                  } else {
                                    setVelocidadEjercicio({
                                      entrenamientoItemId: item.id,
                                      titulo: "Mejora tu Velocidad",
                                      descripcion: "",
                                      imagenCabecera: "",
                                      niveles: [
                                        { nivel: 1, patron: "3x2", velocidad: 150, palabras: "vista, atomo, iglesia, olvido, orar, opaco, casa, perro, gato, sol", opciones: "atomo, olvido, orar, vista, iglesia, opaco", tipoPregunta: "ultima" },
                                        { nivel: 2, patron: "3x2", velocidad: 200, palabras: "luna, estrella, cielo, mar, rio, lago, monte, flor, arbol, nube", opciones: "luna, mar, lago, cielo, flor, nube", tipoPregunta: "primera" },
                                        { nivel: 3, patron: "3x3", velocidad: 250, palabras: "amor, paz, luz, vida, alma, mente, cuerpo, mundo, tiempo, espacio", opciones: "amor, paz, vida, mente, mundo, espacio", tipoPregunta: "primera" }
                                      ],
                                      tiempoAnimacionInicial: 3,
                                      velocidadAnimacion: 5,
                                      isActive: true
                                    });
                                  }
                                } catch (e) { console.error(e); }
                              }}
                              variant="outline"
                              className="border-purple-500/50 text-purple-400"
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Ejercicios
                            </Button>
                            <Button
                              onClick={async () => {
                                try {
                                  const res = await adminFetch(`/api/admin/entrenamiento/item/${item.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(item)
                                  });
                                  if (res.ok) {
                                    alert("Sección guardada correctamente");
                                  } else {
                                    alert("Error: Token inválido o sesión expirada");
                                  }
                                } catch (e) { alert("Error al guardar"); }
                              }}
                              className="bg-gradient-to-r from-teal-500 to-cyan-500"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Guardar Sección
                            </Button>
                          </div>
                        </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
          
        {/* Modal de Ejercicios de Velocidad */}
          {editingVelocidadItem && velocidadEjercicio && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-gradient-to-b from-slate-900 to-purple-900/50 rounded-2xl border border-purple-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-purple-500/30 flex items-center justify-between sticky top-0 bg-slate-900/95 z-10">
                  <h2 className="text-xl font-bold text-white">Ejercicios de Velocidad</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditingVelocidadItem(null); setVelocidadEjercicio(null); }}
                    className="text-white/60 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Título del ejercicio</label>
                      <Input
                        value={velocidadEjercicio.titulo}
                        onChange={(e) => setVelocidadEjercicio({...velocidadEjercicio, titulo: e.target.value})}
                        className="bg-white/10 border-purple-500/30 text-white"
                        placeholder="Mejora tu Velocidad de Lectura"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Descripción (opcional)</label>
                      <textarea
                        value={velocidadEjercicio.descripcion}
                        onChange={(e) => setVelocidadEjercicio({...velocidadEjercicio, descripcion: e.target.value})}
                        className="w-full bg-gray-700 border border-purple-500/30 text-white rounded-md p-2 text-sm"
                        rows={2}
                        placeholder="Ejercita tu capacidad de percepción visual..."
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">Imagen de cabecera</label>
                      <div className="flex gap-2 items-center">
                        <div 
                          className="w-20 h-20 bg-white/10 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-purple-500/30 flex items-center justify-center"
                          onClick={() => {
                            setImagePickerCallback(() => (url: string) => {
                              setVelocidadEjercicio({...velocidadEjercicio, imagenCabecera: url});
                            });
                            setShowImagePicker(true);
                          }}
                        >
                          {velocidadEjercicio.imagenCabecera ? (
                            <img src={velocidadEjercicio.imagenCabecera} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Plus className="w-6 h-6 text-purple-400" />
                          )}
                        </div>
                        <span className="text-white/40 text-sm">Clic para seleccionar imagen</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm mb-1 block">Duración animación (segundos)</label>
                        <p className="text-white/40 text-xs mb-2">Cuánto tiempo dura la animación del círculo</p>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={velocidadEjercicio.tiempoAnimacionInicial}
                          onChange={(e) => setVelocidadEjercicio({...velocidadEjercicio, tiempoAnimacionInicial: parseInt(e.target.value) || 3})}
                          className="w-24 bg-white/10 border-purple-500/30 text-white rounded-md p-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-1 block">Velocidad del círculo (1-10)</label>
                        <p className="text-white/40 text-xs mb-2">1=Lento, 5=Normal, 10=Rápido</p>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={velocidadEjercicio.velocidadAnimacion}
                          onChange={(e) => setVelocidadEjercicio({...velocidadEjercicio, velocidadAnimacion: Math.min(10, Math.max(1, parseInt(e.target.value) || 5))})}
                          className="w-24 bg-white/10 border-purple-500/30 text-white rounded-md p-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-purple-500/30 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">Niveles de Dificultad</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          const newNivel = velocidadEjercicio.niveles.length + 1;
                          setVelocidadEjercicio({
                            ...velocidadEjercicio,
                            niveles: [{ 
                              nivel: newNivel, 
                              patron: "3x2", 
                              velocidad: 150, 
                              palabras: "vista, atomo, iglesia, olvido, orar, opaco",
                              opciones: "atomo, olvido, orar, vista, iglesia, opaco",
                              tipoPregunta: "ultima"
                            }, ...velocidadEjercicio.niveles]
                          });
                        }}
                        className="bg-purple-600"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Crear Ejercicio
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {velocidadEjercicio.niveles.map((nivel, nivelIdx) => (
                        <div key={nivelIdx} className="bg-black/30 rounded-xl p-4 border border-purple-500/20">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-purple-400 font-semibold">Ejercicio {nivel.nivel}</span>
                            {velocidadEjercicio.niveles.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400 h-6"
                                onClick={() => {
                                  const updated = velocidadEjercicio.niveles.filter((_, i) => i !== nivelIdx);
                                  setVelocidadEjercicio({...velocidadEjercicio, niveles: updated});
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <label className="text-white/60 text-xs mb-1 block">Patrón</label>
                              <select
                                value={nivel.patron || "3x2"}
                                onChange={(e) => {
                                  const updated = [...velocidadEjercicio.niveles];
                                  updated[nivelIdx].patron = e.target.value;
                                  setVelocidadEjercicio({...velocidadEjercicio, niveles: updated});
                                }}
                                className="w-full bg-gray-700 border border-purple-500/30 text-white rounded-md p-2 text-sm"
                              >
                                <option value="2x2" className="bg-gray-700 text-white">Nivel 1 - 2x2 (4)</option>
                                <option value="2x3" className="bg-gray-700 text-white">Nivel 2 - 2x3 (6)</option>
                                <option value="3x2" className="bg-gray-700 text-white">Nivel 2 - 3x2 (6)</option>
                                <option value="2x4" className="bg-gray-700 text-white">Nivel 3 - 2x4 (8)</option>
                                <option value="3x3" className="bg-gray-700 text-white">Nivel 4 - 3x3 (9)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-white/60 text-xs mb-1 block">Palabras/min</label>
                              <Input
                                type="number"
                                value={nivel.velocidad || 150}
                                onChange={(e) => {
                                  const updated = [...velocidadEjercicio.niveles];
                                  updated[nivelIdx].velocidad = parseInt(e.target.value) || 150;
                                  setVelocidadEjercicio({...velocidadEjercicio, niveles: updated});
                                }}
                                className="bg-white/10 border-purple-500/30 text-white"
                                min={50}
                                step={10}
                              />
                            </div>
                            <div>
                              <label className="text-white/60 text-xs mb-1 block">¿Qué posición preguntar?</label>
                              <select
                                value={nivel.tipoPregunta || "primera"}
                                onChange={(e) => {
                                  const updated = [...velocidadEjercicio.niveles];
                                  updated[nivelIdx].tipoPregunta = e.target.value;
                                  setVelocidadEjercicio({...velocidadEjercicio, niveles: updated});
                                }}
                                className="w-full bg-gray-700 border border-purple-500/30 text-white rounded-md p-2 text-sm"
                              >
                                <option value="primera" className="bg-gray-700 text-white">Primera palabra</option>
                                <option value="ultima" className="bg-gray-700 text-white">Última palabra</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <label className="text-white/60 text-xs mb-1 block">
                              Palabras (separadas por comas) 
                              <span className="text-purple-300/60 ml-1">- Rotarán por las {nivel.patron ? nivel.patron.split('x').reduce((a: number, b: string) => a * parseInt(b), 1) : 6} posiciones del patrón</span>
                            </label>
                            <textarea
                              value={nivel.palabras || ""}
                              onChange={(e) => {
                                const updated = [...velocidadEjercicio.niveles];
                                updated[nivelIdx].palabras = e.target.value;
                                setVelocidadEjercicio({...velocidadEjercicio, niveles: updated});
                              }}
                              className="w-full bg-gray-700 border border-purple-500/30 text-white rounded-md p-2 text-sm"
                              rows={2}
                              placeholder="vista, atomo, iglesia, olvido, orar, opaco, casa, perro, gato..."
                            />
                            <span className="text-white/40 text-xs">
                              {(nivel.palabras || "").split(",").filter((p: string) => p.trim()).length} palabras configuradas
                            </span>
                          </div>
                          
                          <div>
                            <label className="text-white/60 text-xs mb-1 block">Opciones de respuesta (distractores)</label>
                            <p className="text-purple-300/60 text-xs mb-2">
                              Las palabras se mezclan aleatoriamente. La respuesta correcta se agrega automáticamente si no está en las opciones.
                            </p>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-white/50 text-xs">Cantidad de opciones:</span>
                              <select
                                value={(nivel.opciones || "").split(",").filter((p: string) => p.trim()).length || 6}
                                onChange={(e) => {
                                  const count = parseInt(e.target.value);
                                  const palabrasArr = (nivel.palabras || "").split(",").map((p: string) => p.trim()).filter(Boolean);
                                  const selected = palabrasArr.slice(0, count).join(", ");
                                  const updated = [...velocidadEjercicio.niveles];
                                  updated[nivelIdx].opciones = selected;
                                  setVelocidadEjercicio({...velocidadEjercicio, niveles: updated});
                                }}
                                className="bg-gray-700 border border-purple-500/30 text-white rounded-md px-2 py-1 text-sm"
                              >
                                {[4, 5, 6, 7, 8, 9, 10].map(n => (
                                  <option key={n} value={n} className="bg-gray-700 text-white">{n}</option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-purple-400 text-xs h-7"
                                onClick={() => {
                                  const palabrasArr = (nivel.palabras || "").split(",").map((p: string) => p.trim()).filter(Boolean);
                                  const currentCount = (nivel.opciones || "").split(",").filter((p: string) => p.trim()).length || 6;
                                  const selected = palabrasArr.slice(0, currentCount).join(", ");
                                  const updated = [...velocidadEjercicio.niveles];
                                  updated[nivelIdx].opciones = selected;
                                  setVelocidadEjercicio({...velocidadEjercicio, niveles: updated});
                                }}
                              >
                                Generar de palabras
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {(nivel.palabras || "").split(",").map((palabra: string, pIdx: number) => {
                                const p = palabra.trim();
                                if (!p) return null;
                                const opcionesArr = (nivel.opciones || "").split(",").map((o: string) => o.trim());
                                const isSelected = opcionesArr.includes(p);
                                return (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => {
                                      let newOpciones: string[];
                                      if (isSelected) {
                                        newOpciones = opcionesArr.filter(o => o !== p);
                                      } else {
                                        newOpciones = [...opcionesArr.filter(Boolean), p];
                                      }
                                      const updated = [...velocidadEjercicio.niveles];
                                      updated[nivelIdx].opciones = newOpciones.join(", ");
                                      setVelocidadEjercicio({...velocidadEjercicio, niveles: updated});
                                    }}
                                    className={`px-2 py-1 rounded text-xs transition-all ${
                                      isSelected 
                                        ? "bg-purple-600 text-white" 
                                        : "bg-white/10 text-white/60 hover:bg-white/20"
                                    }`}
                                  >
                                    {p}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="text-white/40 text-xs">
                              Seleccionadas: {(nivel.opciones || "").split(",").filter((p: string) => p.trim()).length} | 
                              <span className="text-purple-300 ml-1">{nivel.opciones || "ninguna"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-purple-500/30 flex justify-end gap-3 sticky bottom-0 bg-slate-900/95">
                  <Button
                    variant="outline"
                    onClick={() => { setEditingVelocidadItem(null); setVelocidadEjercicio(null); }}
                    className="border-white/20 text-white/60"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const payload = {
                          ...velocidadEjercicio,
                          niveles: JSON.stringify(velocidadEjercicio.niveles)
                        };
                        if (velocidadEjercicio.id) {
                          await fetch(`/api/admin/velocidad/${velocidadEjercicio.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify(payload)
                          });
                        } else {
                          await fetch("/api/admin/velocidad", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify(payload)
                          });
                        }
                        alert("Ejercicio guardado correctamente");
                        setEditingVelocidadItem(null);
                        setVelocidadEjercicio(null);
                      } catch (e) { alert("Error al guardar"); }
                    }}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Ejercicio
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
