import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { UAParser } from "ua-parser-js";
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import { eq, and } from "drizzle-orm";
import { readingContents, razonamientoContents, cerebralContents, quizResults, userSessions, users, blogPosts, blogCategories, pageStyles, instituciones, trainingResults, quizResultsNumeros, quizResultsVelocidad, quizResultsReconocimiento, quizResultsAceleracion } from "@shared/schema";
import { agentMessages, cerebralIntros, insertCerebralIntroSchema } from "@shared/schema";
import { db } from "./db";

const ADMIN_USER = "CITEX";
const ADMIN_PASS = "GESTORCITEXBO2014";
const ADMIN_TOKEN_SECRET = "iq-admin-secret-" + Math.random().toString(36).substring(2);
let validAdminTokens = new Set<string>();

const defaultReadingContent: Record<string, Record<number, any>> = {
  preescolar: {
    1: {
      temaNumero: 1,
      title: "Paseando con mi perrito",
      content: "Mariana tiene un perrito café llamado Pipo. Un día lo llevó al parque a pasear. Mientras jugaban, el perrito se escapó. Mariana lo buscó mucho. Al final, lo encontró escondido detrás del kiosco comiendo un helado que alguien había dejado.",
      imageUrl: "https://img.freepik.com/free-vector/cute-girl-walking-dog-cartoon-vector-icon-illustration_138676-2600.jpg",
      pageMainImage: "https://img.freepik.com/free-vector/happy-cute-kid-boy-ready-go-school_97632-4315.jpg",
      pageSmallImage: "https://img.freepik.com/free-vector/cute-book-reading-cartoon-vector-icon-illustration-education-object-icon-concept-isolated_138676-5765.jpg",
      categoryImage: "https://img.freepik.com/free-vector/happy-cute-kid-boy-girl-smile-with-book_97632-5631.jpg",
      questions: JSON.stringify([
        { question: "¿qué se llamaba la niña?", options: ["Marcela", "Matilde", "Mariana"], correct: 2 },
        { question: "¿de que color es su perrito?", options: ["Negro", "Café", "Azul"], correct: 1 },
        { question: "¿Donde lo llevaba a pasear?", options: ["Parque", "Jardin", "Plaza"], correct: 0 },
        { question: "¿Dónde lo encontro al perrito?", options: ["Casa", "Calle", "Kiosco"], correct: 2 },
      ])
    }
  },
  ninos: {
    1: {
      temaNumero: 1,
      title: "LA HISTORIA DEL CHOCOLATE - A Leer Bolivia 2025 - 6to. Primaria",
      content: "Hace muchos años, antes de que existieran las tabletas y los bombones como los conocemos hoy, el cacao era considerado un tesoro muy valioso. Los antiguos mayas y aztecas, civilizaciones que vivieron en América Central, fueron de los primeros en cultivarlo. No usaban el cacao para hacer dulces, sino como una bebida especial. Preparaban una mezcla de granos de cacao molidos con agua, chile y algunas especias. Esta bebida era amarga, pero la consideraban un regalo de los dioses. Los aztecas valoraban tanto el cacao que incluso usaban sus granos como moneda: por ejemplo, se podía comprar un tomate con un grano de cacao, o un conejo con 30 granos. Además, solo las personas importantes, como guerreros y nobles, podían tomar esa bebida.\n\nCuando los conquistadores españoles llegaron a América en el siglo XVI, llevaron el cacao a Europa. Allí, las personas comenzaron a mezclarlo con azúcar y leche, creando una bebida caliente más dulce y agradable. Con el tiempo, los chocolateros inventaron nuevas formas de disfrutar el cacao, como las tabletas y los bombones que conocemos hoy.\n\nActualmente, el chocolate se produce en muchas partes del mundo, pero el cacao sigue creciendo principalmente en países tropicales como Costa de Marfil, Ghana, Ecuador y Brasil. Y además de ser delicioso, el chocolate puede tener beneficios, como mejorar el estado de ánimo y aportar energía, siempre que se consuma con moderación.",
      imageUrl: "https://img.freepik.com/free-vector/chocolate-bar-pieces-realistic-composition_1284-19023.jpg",
      pageMainImage: "https://img.freepik.com/free-vector/cute-girl-back-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
      pageSmallImage: "https://img.freepik.com/free-vector/cute-astronaut-reading-book-cartoon-vector-icon-illustration-science-education-icon-isolated_138676-5765.jpg",
      categoryImage: "https://img.freepik.com/free-vector/cute-girl-back-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
      questions: JSON.stringify([
        { question: "¿Qué civilizaciones fueron las primeras en cultivar el cacao?", options: ["Mayas y Aztecas.", "Quechuas y Aymaras.", "Andinos.", "Europeos."], correct: 0 },
        { question: "¿Cómo preparaban la bebida de cacao los antiguos mayas y aztecas?", options: ["Cocinaban hasta derretir el cacao.", "una mezcla de granos de cacao molidos con agua, chile.", "Lo colocaban en hornos de barros.", "Lo colocaban al sol hasta derretir"], correct: 1 },
        { question: "¿Para qué usaban los aztecas los granos de cacao, además de preparar bebidas?", options: ["Intercambio.", "Moneda.", "Licor.", "Medicina natural."], correct: 1 },
        { question: "¿Qué cambios hizo Europa en la forma de consumir el cacao?", options: ["Comercializaron.", "Mezclaron con azúcar y leche.", "Usaban como bebida caliente.", "Lo intercambiaron."], correct: 1 },
        { question: "Menciona dos países actuales donde se cultiva el cacao.", options: ["Europa y África.", "Centro América y el caribe.", "Ecuador y Ghana.", "Brasil y Bolivia."], correct: 2 },
      ])
    },
    2: {
      temaNumero: 2,
      title: "LA MEMORIA - A Leer Bolivia 2025 - 6to. Primaria",
      content: "La Memoria es la capacidad mental de codificar, almacenar y recuperar información. Es una función del cerebro que nos permite recordar experiencias, ideas, imágenes, sentimientos, entre otros. Hay dos tipos de memoria a largo y corto plazo.\n\nA Corto plazo recibe ese nombre en función del tiempo que es retenida, promedio de 15 a 20 segundos, reducida cantidad de información disponible, facilidad para su alteración, por ejemplo si nos dictan un número de teléfono para marcar, empezamos a marcar y olvidamos los últimos dígitos. La prueba que generalmente recurren los psicólogos para evaluar este tipo de memoria es a medir el tiempo que transcurre entre la presentación de un estímulo y su evocación del mismo después de ser retirado del campo perceptivo.\n\nMemoria a largo plazo.- Es conservada en parte y en parte también es retenida indefinidamente, la capacidad de almacenar la información aquí es ilimitada.\n\nEn relación a la memoria hablamos de Recuerdo y Olvido. Hablamos de recuerdo cuando ellos sobrevienen autónomamente y llamamos reminiscencias a lo que tenemos que extraer de nuestra mente con esfuerzo y con intencionalidad.\n\nEl olvido se produce por el tiempo, la edad, el cansancio.. El olvido se distingue de la amnesia, porque esta última se trata de una laguna cuya causa puede ser Psicológico debido por ejemplo a un trauma, a una enfermedad o accidente; la primera es recuperable mientras la segunda ya no.\n\nLos tipos de memoria también se distinguen a partir del órgano perceptivo o sentido que interviene, así tenemos: memoria visual, memoria auditiva, etc.\n\nLa memoria de acuerdo a las investigaciones realizadas, tiene estrategias que la desarrollan más, por ejemplo cuando los datos están organizados en estructuras, o están conectados con anteriores, están integrados en un conjunto, son significativos, hacen que la evocación de la información sea más fácil.",
      imageUrl: "https://img.freepik.com/free-vector/brain-concept-illustration_114360-2815.jpg",
      pageMainImage: "https://img.freepik.com/free-vector/cute-girl-back-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
      pageSmallImage: "https://img.freepik.com/free-vector/cute-astronaut-reading-book-cartoon-vector-icon-illustration-science-education-icon-isolated_138676-5765.jpg",
      categoryImage: "https://img.freepik.com/free-vector/brain-concept-illustration_114360-2815.jpg",
      questions: JSON.stringify([
        { question: "¿Cuánto tiempo aproximadamente retiene la memoria a corto plazo la información?", options: ["1 a 5 segundos", "15 a 20 segundos", "1 a 2 minutos", "5 a 10 minutos"], correct: 1 },
        { question: "¿Cuál es la diferencia entre recuerdo y reminiscencia?", options: ["El recuerdo es involuntario y la reminiscencia requiere esfuerzo", "Son lo mismo", "El recuerdo es a largo plazo y la reminiscencia a corto plazo", "La reminiscencia es involuntaria y el recuerdo requiere esfuerzo"], correct: 0 },
        { question: "¿Qué distingue al olvido de la amnesia?", options: ["El olvido es permanente y la amnesia es temporal", "El olvido es recuperable y la amnesia no", "Son exactamente lo mismo", "La amnesia es por cansancio y el olvido por trauma"], correct: 1 },
        { question: "¿Cuál es la capacidad de almacenamiento de la memoria a largo plazo?", options: ["Limitada a 100 recuerdos", "Aproximadamente 1000 datos", "Ilimitada", "Solo 50 recuerdos importantes"], correct: 2 },
        { question: "¿Qué estrategias ayudan a mejorar la memoria según el texto?", options: ["Datos desorganizados y sin conexión", "Datos organizados, conectados y significativos", "Memorizar sin entender", "Repetir sin parar"], correct: 1 },
      ])
    }
  },
  adolescentes: {
    1: {
      temaNumero: 1,
      title: "EUTANASIA",
      content: `El término eutanasia es todo acto u omisión cuya responsabilidad recae en personal médico o en individuos cercanos al enfermo, y que ocasiona la muerte inmediata de éste. La palabra deriva del griego: eu ("bueno") y thanatos ("muerte").

Quienes defienden la eutanasia sostienen que la finalidad del acto es evitarle sufrimientos insoportables o la prolongación artificial de la vida a un enfermo, presentando tales situaciones como "contrarias a la dignidad". También sus defensores sostienen que, para que la eutanasia sea considerada como tal, el enfermo ha de padecer, necesariamente, una enfermedad terminal o incurable y, en segundo lugar, el personal sanitario ha de contar expresamente con el consentimiento del enfermo.

Otros, en cambio, creen que los programas de eutanasia están en contraposición con los ideales con los que se defiende su implementación. Por ejemplo, se menciona que los médicos durante el régimen nazi hacían propaganda en favor de la eutanasia con argumentos como la indignidad de ciertas vidas, que por tanto eran, según aquella propaganda, merecedoras de compasión, para conseguir así una opinión pública favorable a la eliminación que se estaba haciendo de enfermos, considerados minusválidos o débiles según criterios nazis.

Actualmente, en muy pocos países (por ejemplo, Holanda y Bélgica) se ha despenalizado la eutanasia, y en ellos todavía permanece tipificado como homicidio, por ejemplo como homicidio o bien como asistencia al suicidio. Según los datos oficiales, los supuestos arriba mencionados no son cumplidos: en una tasa creciente, a miles de personas se les aplica la eutanasia en contra de su voluntad y las restricciones para aplicar la eutanasia han ido disminuyendo; por ejemplo, actualmente se la aplica a menores de edad en dichos países.`,
      imageUrl: "https://img.freepik.com/free-vector/medical-ethics-concept-illustration_114360-8456.jpg",
      pageMainImage: "https://img.freepik.com/free-vector/young-man-with-glasses_24877-82111.jpg",
      pageSmallImage: "https://img.freepik.com/free-vector/cute-robot-reading-book-cartoon-vector-icon-illustration-science-education-icon-isolated_138676-5165.jpg",
      categoryImage: "https://img.freepik.com/free-vector/young-man-with-glasses_24877-82111.jpg",
      questions: JSON.stringify([
        { question: "Pregunta 1 - pendiente", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correct: 0 },
        { question: "Pregunta 2 - pendiente", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correct: 0 },
        { question: "Pregunta 3 - pendiente", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correct: 0 },
        { question: "Pregunta 4 - pendiente", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correct: 0 },
      ])
    }
  },
  universitarios: {
    1: {
      temaNumero: 1,
      title: "LECTURA UNIVERSITARIA - Tema 01",
      content: "Contenido de lectura para estudiantes universitarios. Este es un tema de ejemplo que puede ser editado desde el panel de administración.",
      imageUrl: "https://img.freepik.com/free-vector/university-student-concept-illustration_114360-9055.jpg",
      pageMainImage: "https://img.freepik.com/free-vector/college-students-concept-illustration_114360-10205.jpg",
      pageSmallImage: "https://img.freepik.com/free-vector/book-reading-concept-illustration_114360-4528.jpg",
      categoryImage: "https://img.freepik.com/free-vector/university-student-concept-illustration_114360-9055.jpg",
      questions: JSON.stringify([
        { question: "Pregunta de ejemplo - editar desde admin", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correct: 0 },
      ])
    }
  },
  profesionales: {
    1: {
      temaNumero: 1,
      title: "LECTURA PROFESIONAL - Tema 01",
      content: "Contenido de lectura para profesionales. Este es un tema de ejemplo que puede ser editado desde el panel de administración.",
      imageUrl: "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg",
      pageMainImage: "https://img.freepik.com/free-vector/office-workers-concept-illustration_114360-2244.jpg",
      pageSmallImage: "https://img.freepik.com/free-vector/business-team-concept-illustration_114360-3628.jpg",
      categoryImage: "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg",
      questions: JSON.stringify([
        { question: "Pregunta de ejemplo - editar desde admin", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correct: 0 },
      ])
    }
  },
  adulto_mayor: {
    1: {
      temaNumero: 1,
      title: "LECTURA ADULTO MAYOR - Tema 01",
      content: "Contenido de lectura para adultos mayores. Este es un tema de ejemplo que puede ser editado desde el panel de administración.",
      imageUrl: "https://img.freepik.com/free-vector/grandparents-concept-illustration_114360-5638.jpg",
      pageMainImage: "https://img.freepik.com/free-vector/elderly-people-concept-illustration_114360-4195.jpg",
      pageSmallImage: "https://img.freepik.com/free-vector/reading-glasses-concept-illustration_114360-4890.jpg",
      categoryImage: "https://img.freepik.com/free-vector/grandparents-concept-illustration_114360-5638.jpg",
      questions: JSON.stringify([
        { question: "Pregunta de ejemplo - editar desde admin", options: ["Opción A", "Opción B", "Opción C", "Opción D"], correct: 0 },
      ])
    }
  }
};

function getClientInfo(req: Request) {
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();
  
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || 
             req.headers["x-real-ip"]?.toString() || 
             req.socket.remoteAddress || 
             "unknown";
  
  const isPwa = req.headers["x-pwa"] === "true" || 
                req.query.pwa === "true" ||
                (req.headers["sec-fetch-mode"] === "navigate" && req.headers["sec-fetch-dest"] === "document");

  return {
    ip,
    userAgent: req.headers["user-agent"] || "unknown",
    device: `${result.device.vendor || ""} ${result.device.model || result.device.type || "Desktop"}`.trim() || "Desktop",
    browser: `${result.browser.name || "Unknown"} ${result.browser.version || ""}`.trim(),
    isPwa,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Track session
  app.post("/api/session/start", async (req, res) => {
    try {
      const { sessionId, ageGroup, selectedProblems } = req.body;
      const clientInfo = getClientInfo(req);
      
      const existing = await storage.getSession(sessionId);
      if (existing) {
        await storage.updateSession(sessionId, {
          ...clientInfo,
          ageGroup,
          selectedProblems,
          isActive: true,
        });
        res.json({ success: true, session: existing });
      } else {
        const session = await storage.createSession({
          sessionId,
          ...clientInfo,
          ageGroup,
          selectedProblems,
          isActive: true,
          lastActivity: new Date(),
        });
        res.json({ success: true, session });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Heartbeat to keep session active
  app.post("/api/session/heartbeat", async (req, res) => {
    try {
      const { sessionId } = req.body;
      await storage.updateSession(sessionId, { isActive: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // End session
  app.post("/api/session/end", async (req, res) => {
    try {
      const { sessionId } = req.body;
      await storage.deactivateSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  // Admin login
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = ADMIN_TOKEN_SECRET + "-" + Date.now();
      validAdminTokens.add(token);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Get all sessions (admin only)
  app.get("/api/admin/sessions", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const sessions = await storage.getAllSessions();
    const activeSessions = await storage.getActiveSessions();
    
    res.json({
      total: sessions.length,
      activeCount: activeSessions.length,
      sessions: sessions.map(s => ({
        ...s,
        isCurrentlyActive: activeSessions.some(a => a.sessionId === s.sessionId)
      }))
    });
  });

  // Get active count (public for display)
  app.get("/api/stats/active", async (req, res) => {
    const activeSessions = await storage.getActiveSessions();
    res.json({ activeCount: activeSessions.length });
  });

  // Save quiz result
  app.post("/api/quiz/submit", async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.testType === "lectura" || !data.testType) {
        const comprensionPct = data.comprension ?? 0;
        const wpm = data.velocidadLectura ?? 0;
        const tiempoLecturaSeg = data.tiempoLectura ?? 0;
        const tiempoPreguntasSeg = data.tiempoCuestionario ?? 0;
        const lecturaValida = tiempoLecturaSeg >= 10 && wpm <= 600;

        let cat = "LECTOR CON DIFICULTAD";
        if (
          comprensionPct < 50 ||
          (!lecturaValida && comprensionPct < 70) ||
          (wpm < 140 && tiempoPreguntasSeg > 90 && comprensionPct < 70)
        ) {
          cat = "LECTOR CON DIFICULTAD SEVERA";
        } else if (
          (comprensionPct >= 50 && comprensionPct < 70) ||
          (comprensionPct >= 70 && (wpm < 140 || tiempoPreguntasSeg > 90))
        ) {
          cat = "LECTOR CON DIFICULTAD";
        } else if (
          lecturaValida && comprensionPct >= 85 && wpm >= 180 && tiempoPreguntasSeg <= 90
        ) {
          cat = "LECTOR COMPETENTE";
        } else if (
          lecturaValida && comprensionPct >= 70 && comprensionPct < 85 && wpm >= 140 && wpm < 200
        ) {
          cat = "LECTOR REGULAR";
        } else if (lecturaValida && comprensionPct >= 70) {
          cat = "LECTOR REGULAR";
        }

        data.categoriaLector = cat;
      }
      const result = await storage.saveQuizResult(data);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: "Failed to save result" });
    }
  });

  // Get all quiz results (admin)
  app.get("/api/admin/quiz-results", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const results = await storage.getAllQuizResults();
    res.json({ results });
  });

  // Instituciones - public endpoint for form autocomplete
  app.get("/api/instituciones", async (req, res) => {
    const pais = req.query.pais as string | undefined;
    const estado = req.query.estado as string | undefined;
    const tipo = req.query.tipo as string | undefined;
    const results = await storage.getInstituciones(pais, estado, tipo);
    res.json({ instituciones: results });
  });

  // Instituciones - admin create
  app.post("/api/admin/instituciones", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { nombre, pais, estado, tipo } = req.body;
      if (!nombre || !pais || !estado) {
        return res.status(400).json({ error: "nombre, pais, estado required" });
      }
      const result = await storage.saveInstitucion({ nombre, pais, estado, tipo: tipo || "colegio" });
      res.json({ success: true, institucion: result });
    } catch (error) {
      res.status(500).json({ error: "Failed to save" });
    }
  });

  // Instituciones - admin delete
  app.delete("/api/admin/instituciones/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      await storage.deleteInstitucion(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete" });
    }
  });

  // Get reading content
  app.get("/api/reading/:categoria", async (req, res) => {
    const categoria = req.params.categoria;
    const temaNumero = parseInt(req.query.tema as string) || 1;
    const lang = (req.query.lang as string) || "es";
    let savedContent = await storage.getReadingContent(categoria, temaNumero, lang);
    if (!savedContent && lang !== "es") {
      savedContent = await storage.getReadingContent(categoria, temaNumero, "es");
    }
    const defaultContent = defaultReadingContent[categoria]?.[temaNumero] || null;
    const content = savedContent || defaultContent;
    if (!content) {
      res.json({ content: null });
      return;
    }
    res.json({ content });
  });

  app.get("/api/reading/:categoria/themes", async (req, res) => {
    const categoria = req.params.categoria;
    const lang = (req.query.lang as string) || 'es';
    const savedContents = await storage.getReadingContentsByCategory(categoria, lang);
    
    const defaultThemes = defaultReadingContent[categoria] 
      ? Object.values(defaultReadingContent[categoria]).map((c: any) => ({
          temaNumero: c.temaNumero,
          title: c.title,
          categoryImage: c.categoryImage || c.imageUrl
        }))
      : [];
    
    const savedThemes = savedContents.map(c => ({
      temaNumero: c.temaNumero,
      title: c.title,
      categoryImage: c.categoryImage || c.imageUrl
    }));
    
    const allThemes = [...savedThemes];
    defaultThemes.forEach((dt: any) => {
      if (!allThemes.find(st => st.temaNumero === dt.temaNumero)) {
        allThemes.push(dt);
      }
    });
    
    allThemes.sort((a, b) => (a.temaNumero || 1) - (b.temaNumero || 1));
    
    res.json({ themes: allThemes });
  });

  // Save reading content (admin)
  app.post("/api/admin/reading", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const content = await storage.saveReadingContent(req.body);
      res.json({ success: true, content });
    } catch (error) {
      res.status(500).json({ error: "Failed to save content" });
    }
  });

  // Razonamiento content endpoints
  app.get("/api/razonamiento/:categoria", async (req, res) => {
    const categoria = req.params.categoria;
    const temaNumero = parseInt(req.query.tema as string) || 1;
    const lang = (req.query.lang as string) || "es";
    let content = await storage.getRazonamientoContent(categoria, temaNumero, lang);
    if (!content && lang !== "es") {
      content = await storage.getRazonamientoContent(categoria, temaNumero, "es");
    }
    res.json({ content: content || null });
  });

  app.get("/api/razonamiento/:categoria/themes", async (req, res) => {
    const categoria = req.params.categoria;
    const lang = (req.query.lang as string) || 'es';
    const savedContents = await storage.getRazonamientoContentsByCategory(categoria, lang);
    
    const savedThemes = savedContents.map(c => ({
      temaNumero: c.temaNumero,
      title: c.title
    }));
    
    res.json({ themes: savedThemes });
  });

  // Save razonamiento content (admin)
  app.post("/api/admin/razonamiento", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const content = await storage.saveRazonamientoContent(req.body);
      res.json({ success: true, content });
    } catch (error) {
      res.status(500).json({ error: "Failed to save razonamiento content" });
    }
  });

  // Cerebral content endpoints
  app.get("/api/cerebral/:categoria", async (req, res) => {
    const categoria = req.params.categoria;
    const temaNumero = parseInt(req.query.tema as string) || 1;
    const lang = (req.query.lang as string) || "es";
    const content = await storage.getCerebralContent(categoria, temaNumero, lang);
    res.json({ content: content || null });
  });

  app.get("/api/cerebral/:categoria/themes", async (req, res) => {
    const categoria = req.params.categoria;
    const lang = (req.query.lang as string) || "es";
    const savedContents = await storage.getCerebralContentsByCategory(categoria, lang);
    
    const savedThemes = savedContents.map(c => ({
      temaNumero: c.temaNumero,
      title: c.title,
      exerciseType: c.exerciseType,
      isActive: c.isActive
    }));
    
    res.json({ themes: savedThemes });
  });

  // Get cerebral intro for category
  app.get("/api/cerebral/:categoria/intro", async (req, res) => {
    const categoria = req.params.categoria;
    const lang = (req.query.lang as string) || "es";
    const intro = await storage.getCerebralIntro(categoria, lang);
    res.json({ intro });
  });

  // Save cerebral intro (admin)
  app.post("/api/admin/cerebral/intro", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const intro = await storage.saveCerebralIntro(req.body);
      res.json({ success: true, intro });
    } catch (error) {
      res.status(500).json({ error: "Failed to save cerebral intro" });
    }
  });

  // Save cerebral content (admin)
  app.post("/api/admin/cerebral", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const content = await storage.saveCerebralContent(req.body);
      res.json({ success: true, content });
    } catch (error) {
      res.status(500).json({ error: "Failed to save cerebral content" });
    }
  });

  // Cerebral results endpoints
  app.post("/api/cerebral-result", async (req, res) => {
    try {
      const result = await storage.saveCerebralResult(req.body);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: "Failed to save cerebral result" });
    }
  });

  app.get("/api/admin/cerebral-results", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const categoria = req.query.categoria as string | undefined;
    const results = await storage.getCerebralResults(categoria);
    res.json(results);
  });

  // Image upload endpoints
  app.get("/api/images", async (req, res) => {
    const images = await storage.getImages();
    res.json(images);
  });

  // Serve image by ID - returns actual image file
  app.get("/api/images/:id", async (req, res) => {
    const image = await storage.getImageById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    
    // Extract base64 data and convert to buffer
    const matches = image.data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return res.status(500).json({ error: "Invalid image data" });
    }
    
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    res.set('Content-Type', mimeType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(buffer);
  });

  app.post("/api/admin/images", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { name, data, originalSize, compressedSize, width, height } = req.body;
    const image = await storage.saveImage({ name, data, originalSize, compressedSize, width, height });
    res.json(image);
  });

  app.delete("/api/admin/images/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await storage.deleteImage(req.params.id);
    res.json({ success: true });
  });

  // Export all images for sync between environments
  app.get("/api/admin/images/export", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const images = await storage.getImages();
    res.json({ images, exportedAt: new Date().toISOString() });
  });

  // Import images from another environment
  app.post("/api/admin/images/import", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { images } = req.body;
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: "Invalid images data" });
    }
    let imported = 0;
    let skipped = 0;
    for (const img of images) {
      try {
        const existing = await storage.getImageById(img.id);
        if (!existing) {
          await storage.saveImageWithId(img.id, img.name, img.data, img.originalSize, img.compressedSize, img.width, img.height);
          imported++;
        } else {
          skipped++;
        }
      } catch (e) {
        skipped++;
      }
    }
    res.json({ success: true, imported, skipped });
  });

  // Export all page styles for sync between environments
  app.get("/api/admin/page-styles/export", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const styles = await storage.getAllPageStyles();
    res.json({ styles, exportedAt: new Date().toISOString() });
  });

  // Import page styles from another environment
  app.post("/api/admin/page-styles/import", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { styles } = req.body;
    if (!styles || !Array.isArray(styles)) {
      return res.status(400).json({ error: "Invalid styles data" });
    }
    let imported = 0;
    for (const style of styles) {
      try {
        await storage.savePageStyle(style.pageName, style.styles);
        imported++;
      } catch (e) {
        console.error("Error importing style:", e);
      }
    }
    res.json({ success: true, imported });
  });

  // ===========================================
  // ENTRENAMIENTO ENDPOINTS
  // ===========================================
  
  // Get entrenamiento card for category (public)
  app.get("/api/entrenamiento/:categoria/card", async (req, res) => {
    const lang = (req.query.lang as string) || 'es';
    const noFallback = req.query.fallback === 'false';
    const card = noFallback
      ? await storage.getEntrenamientoCardExact(req.params.categoria, lang)
      : await storage.getEntrenamientoCard(req.params.categoria, lang);
    res.json({ card: card || {
      categoria: req.params.categoria,
      title: "Entrenamiento",
      description: "Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas",
      buttonText: "Comenzar",
      imageUrl: null
    }});
  });

  // Get entrenamiento page config (public)
  app.get("/api/entrenamiento/:categoria/page", async (req, res) => {
    const lang = (req.query.lang as string) || 'es';
    const noFallback = req.query.fallback === 'false';
    const page = noFallback
      ? await storage.getEntrenamientoPageExact(req.params.categoria, lang)
      : await storage.getEntrenamientoPage(req.params.categoria, lang);
    res.json({ page: page || {
      categoria: req.params.categoria,
      bannerText: "¡Disfruta ahora de ejercicios de entrenamiento gratuitos por tiempo limitado!",
      pageTitle: "Entrenamientos",
      pageDescription: "Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas"
    }});
  });

  // Get entrenamiento items (public)
  app.get("/api/entrenamiento/:categoria/items", async (req, res) => {
    const lang = (req.query.lang as string) || 'es';
    const noFallback = req.query.fallback === 'false';
    const items = noFallback
      ? await storage.getEntrenamientoItemsExact(req.params.categoria, lang)
      : await storage.getEntrenamientoItems(req.params.categoria, lang);
    res.json({ items });
  });

  // Get single entrenamiento item by ID (public)
  app.get("/api/entrenamiento/item/:id", async (req, res) => {
    const item = await storage.getEntrenamientoItemById(req.params.id);
    res.json({ item });
  });

  // Save entrenamiento card (admin)
  app.post("/api/admin/entrenamiento/card", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const card = await storage.saveEntrenamientoCard(req.body);
    res.json({ card });
  });

  // Save entrenamiento page config (admin)
  app.post("/api/admin/entrenamiento/page", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const page = await storage.saveEntrenamientoPage(req.body);
    res.json({ page });
  });

  // Create entrenamiento item (admin)
  app.post("/api/admin/entrenamiento/item", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const item = await storage.saveEntrenamientoItem(req.body);
    res.json({ item });
  });

  // Update entrenamiento item (admin)
  app.put("/api/admin/entrenamiento/item/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const item = await storage.updateEntrenamientoItem(req.params.id, req.body);
    res.json({ item });
  });

  // Delete entrenamiento item (admin)
  app.delete("/api/admin/entrenamiento/item/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await storage.deleteEntrenamientoItem(req.params.id);
    res.json({ success: true });
  });

  // ============ PREP PAGES (Páginas de Preparación) ============
  
  // Get all prep pages (admin)
  app.get("/api/admin/prep-pages", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const pages = await storage.getPrepPages();
    res.json({ pages });
  });

  // Create prep page (admin)
  app.post("/api/admin/prep-pages", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const page = await storage.savePrepPage(req.body);
    res.json({ page });
  });

  // Update prep page (admin)
  app.put("/api/admin/prep-pages/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const page = await storage.updatePrepPage(req.params.id, req.body);
    res.json({ page });
  });

  // Delete prep page (admin)
  app.delete("/api/admin/prep-pages/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await storage.deletePrepPage(req.params.id);
    res.json({ success: true });
  });

  // Get categoria prep page mapping (admin)
  app.get("/api/admin/categoria-prep/:categoria", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mapping = await storage.getCategoriaPrepPage(req.params.categoria);
    res.json({ mapping });
  });

  // Set categoria prep page mapping (admin)
  app.put("/api/admin/categoria-prep/:categoria", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mapping = await storage.setCategoriaPrepPage(req.params.categoria, req.body.prepPageId);
    res.json({ mapping });
  });

  // Public: Get prep page for a categoria (for user-facing app)
  app.get("/api/prep-page/:categoria", async (req, res) => {
    const mapping = await storage.getCategoriaPrepPage(req.params.categoria);
    if (!mapping?.prepPageId) {
      return res.json({ page: null });
    }
    const page = await storage.getPrepPageById(mapping.prepPageId);
    res.json({ page });
  });

  // Velocidad exercises endpoints
  // Get all exercises for an entrenamiento item (admin)
  app.get("/api/admin/velocidad/:entrenamientoItemId", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const ejercicios = await storage.getVelocidadEjerciciosByItem(req.params.entrenamientoItemId);
    res.json({ ejercicios });
  });

  // Create velocidad exercise (admin)
  app.post("/api/admin/velocidad", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const ejercicio = await storage.saveVelocidadEjercicio(req.body);
    res.json({ ejercicio });
  });

  // Update velocidad exercise (admin)
  app.put("/api/admin/velocidad/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const ejercicio = await storage.updateVelocidadEjercicio(req.params.id, req.body);
    res.json({ ejercicio });
  });

  // Delete velocidad exercise (admin)
  app.delete("/api/admin/velocidad/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await storage.deleteVelocidadEjercicio(req.params.id);
    res.json({ success: true });
  });

  // Public: Get velocidad exercise for an entrenamiento item
  app.get("/api/velocidad/:entrenamientoItemId", async (req, res) => {
    const ejercicios = await storage.getVelocidadEjerciciosByItem(req.params.entrenamientoItemId);
    const activeEjercicio = ejercicios.find(e => e.isActive);
    res.json({ ejercicio: activeEjercicio || null });
  });

  // Public: Get velocidad exercise by id
  app.get("/api/velocidad/ejercicio/:id", async (req, res) => {
    const ejercicio = await storage.getVelocidadEjercicioById(req.params.id);
    res.json({ ejercicio });
  });

  // Numeros intro page endpoints
  app.get("/api/numeros-intro/:entrenamientoItemId", async (req, res) => {
    const intro = await storage.getNumerosIntroByItem(req.params.entrenamientoItemId);
    res.json({ intro });
  });

  app.post("/api/admin/numeros-intro", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const intro = await storage.saveNumerosIntro(req.body);
    res.json({ intro });
  });

  app.put("/api/admin/numeros-intro/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const intro = await storage.updateNumerosIntro(req.params.id, req.body);
    res.json({ intro });
  });

  // Aceleracion de lectura endpoints
  app.get("/api/aceleracion/:entrenamientoItemId", async (req, res) => {
    const ejercicio = await storage.getAceleracionByItem(req.params.entrenamientoItemId);
    res.json({ ejercicio });
  });

  app.post("/api/admin/aceleracion", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const ejercicio = await storage.saveAceleracion(req.body);
    res.json({ ejercicio });
  });

  app.put("/api/admin/aceleracion/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const ejercicio = await storage.updateAceleracion(req.params.id, req.body);
    res.json({ ejercicio });
  });

  // Training results endpoints
  app.post("/api/training-results", async (req, res) => {
    const result = await storage.saveTrainingResult(req.body);
    res.json({ result });
  });

  app.get("/api/training-results", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const categoria = req.query.categoria as string;
    const results = await storage.getTrainingResults(sessionId, categoria);
    res.json({ results });
  });

  app.get("/api/training-results/stats", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const categoria = req.query.categoria as string;
    const stats = await storage.getTrainingStats(sessionId, categoria);
    res.json({ stats });
  });

  // Page styles for visual editor
  app.get("/api/page-styles/:pageName", async (req, res) => {
    const lang = (req.query.lang as string) || 'es';
    const style = await storage.getPageStyle(req.params.pageName, lang);
    res.json({ style });
  });

  app.post("/api/admin/page-styles", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { pageName, styles, lang } = req.body;
    const style = await storage.savePageStyle(pageName, styles, lang || 'es');
    res.json({ style });
  });

  // Blog categories (public)
  app.get("/api/blog-categories", async (req, res) => {
    const categories = await storage.getBlogCategories();
    res.json({ categories: categories.filter(c => c.isActive) });
  });

  // Blog posts (public - only published)
  app.get("/api/blog-posts", async (req, res) => {
    const categoriaId = req.query.categoriaId as string;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { posts, total } = await storage.getBlogPosts(categoriaId || undefined, "publicado", page, limit, search || undefined);
    res.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  });

  app.get("/api/blog-posts/:id", async (req, res) => {
    const post = await storage.getBlogPost(req.params.id);
    if (!post || post.estado !== "publicado") return res.status(404).json({ error: "Post not found" });
    res.json({ post });
  });

  // Admin blog categories
  app.get("/api/admin/blog-categories", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const categories = await storage.getBlogCategories();
    res.json({ categories });
  });

  app.post("/api/admin/blog-categories", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const result = await storage.saveBlogCategory(req.body);
    res.json({ success: true, category: result });
  });

  app.put("/api/admin/blog-categories/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const result = await storage.updateBlogCategory(req.params.id, req.body);
    res.json({ success: true, category: result });
  });

  app.delete("/api/admin/blog-categories/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    await storage.deleteBlogCategory(req.params.id);
    res.json({ success: true });
  });

  // Admin blog posts
  app.get("/api/admin/blog-posts", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const categoriaId = req.query.categoriaId as string;
    const estado = req.query.estado as string;
    const page = parseInt(req.query.page as string) || 1;
    const { posts, total } = await storage.getBlogPosts(categoriaId || undefined, estado || undefined, page, 50);
    res.json({ posts, total });
  });

  app.post("/api/admin/blog-posts", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const result = await storage.saveBlogPost(req.body);
    res.json({ success: true, post: result });
  });

  app.put("/api/admin/blog-posts/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const result = await storage.updateBlogPost(req.params.id, req.body);
    res.json({ success: true, post: result });
  });

  app.delete("/api/admin/blog-posts/:id", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    await storage.deleteBlogPost(req.params.id);
    res.json({ success: true });
  });

  // ====== AI Agent Endpoints ======
  const PROJECT_ROOT = path.resolve(".");

  function isPathSafe(filePath: string): boolean {
    const resolved = path.resolve(filePath);
    return resolved.startsWith(PROJECT_ROOT) && !resolved.includes("node_modules") && !resolved.includes(".git");
  }

  function getProjectTree(dir: string, prefix = "", depth = 0): string {
    if (depth > 4) return "";
    const skip = ["node_modules", ".git", "dist", ".cache", ".local", "attached_assets"];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });
      let tree = "";
      for (const e of entries) {
        if (skip.includes(e.name) || e.name.startsWith(".")) continue;
        const rel = path.relative(PROJECT_ROOT, path.join(dir, e.name));
        if (e.isDirectory()) {
          tree += `${prefix}${rel}/\n`;
          tree += getProjectTree(path.join(dir, e.name), prefix, depth + 1);
        } else {
          tree += `${prefix}${rel}\n`;
        }
      }
      return tree;
    } catch { return ""; }
  }

  app.get("/api/admin/agent/files", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const dir = (req.query.dir as string) || ".";
    if (!isPathSafe(dir)) return res.status(403).json({ error: "Access denied" });
    try {
      const entries = fs.readdirSync(path.resolve(dir), { withFileTypes: true });
      const result = entries
        .filter(e => !["node_modules", ".git"].includes(e.name))
        .map(e => ({
          name: e.name,
          type: e.isDirectory() ? "dir" : "file",
          path: path.join(dir, e.name),
        }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/agent/file", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const filePath = req.query.path as string;
    if (!filePath || !isPathSafe(filePath)) return res.status(403).json({ error: "Access denied" });
    try {
      const content = fs.readFileSync(path.resolve(filePath), "utf-8");
      res.json({ content, path: filePath });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/agent/file", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const { filePath, content } = req.body;
    if (!filePath || content === undefined || !isPathSafe(filePath)) {
      return res.status(403).json({ error: "Access denied or invalid path" });
    }
    try {
      const dir = path.dirname(path.resolve(filePath));
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.resolve(filePath), content, "utf-8");
      console.log(`[AGENT AUDIT] File written: ${filePath} (${content.length} bytes) at ${new Date().toISOString()}`);
      res.json({ success: true, path: filePath });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const fileBackups = new Map<string, string>();

  interface AgentStep {
    type: string;
    description: string;
    status: "running" | "success" | "error" | "warning";
    detail?: string;
  }

  async function executeAgentAction(action: any, steps: AgentStep[], filesReadInSession?: Set<string>): Promise<{ result: string; fileModified?: string }> {
    if (action.action === "readFile" && action.path && isPathSafe(action.path)) {
      const startLine = action.startLine ? Math.max(1, parseInt(action.startLine)) : undefined;
      const endLine = action.endLine ? parseInt(action.endLine) : undefined;
      const rangeLabel = startLine ? ` (lines ${startLine}-${endLine || 'end'})` : '';
      steps.push({ type: "readFile", description: `Leyendo ${action.path}${rangeLabel}`, status: "running" });
      try {
        const fileContent = fs.readFileSync(path.resolve(action.path), "utf-8");
        let output = fileContent;
        const totalLines = fileContent.split('\n').length;
        if (startLine) {
          const lines = fileContent.split('\n');
          const end = endLine ? Math.min(endLine, lines.length) : lines.length;
          output = lines.slice(startLine - 1, end).map((l, i) => `${startLine + i}: ${l}`).join('\n');
        } else if (fileContent.length > 10000) {
          const lines = fileContent.split('\n');
          const head = lines.slice(0, 80).join('\n');
          const tail = lines.slice(-30).join('\n');
          output = `${head}\n\n... [TRUNCATED: ${totalLines} total lines, ${fileContent.length} chars. Use readFile with startLine/endLine to read specific sections, e.g. {"action":"readFile","path":"${action.path}","startLine":80,"endLine":160}] ...\n\n${tail}`;
        }
        const truncated = output.length > 12000 ? output.substring(0, 12000) + '\n... (truncated)' : output;
        steps[steps.length - 1].status = "success";
        steps[steps.length - 1].detail = startLine ? `líneas ${startLine}-${endLine || totalLines}` : `${totalLines} líneas (${fileContent.length} chars)`;
        if (filesReadInSession) filesReadInSession.add(action.path);
        return { result: `📄 **${action.path}** (${totalLines} lines, ${fileContent.length} chars)${rangeLabel}:\n\`\`\`\n${truncated}\n\`\`\`` };
      } catch (e: any) {
        steps[steps.length - 1].status = "error";
        steps[steps.length - 1].detail = e.message;
        return { result: `❌ Error reading ${action.path}: ${e.message}` };
      }
    } else if (action.action === "searchFiles" && action.pattern) {
      steps.push({ type: "searchFiles", description: `Buscando "${action.pattern}"`, status: "running" });
      try {
        const dir = action.dir && isPathSafe(action.dir) ? action.dir : ".";
        const args: string[] = ["-rn"];
        if (action.glob) {
          args.push("--include", action.glob);
        } else {
          args.push("--exclude-dir=node_modules", "--exclude-dir=.git", "--exclude-dir=dist", "--exclude-dir=.cache");
        }
        args.push(action.pattern, dir);
        const output = execFileSync("grep", args, { encoding: "utf-8", timeout: 5000, maxBuffer: 1024 * 100 }).trim();
        const lines = output.split("\n").slice(0, 30).join("\n");
        const count = lines ? lines.split("\n").length : 0;
        steps[steps.length - 1].status = "success";
        steps[steps.length - 1].detail = `${count} resultados`;
        return { result: lines ? `🔍 Search results for "${action.pattern}":\n\`\`\`\n${lines}\n\`\`\`` : `🔍 No results found for "${action.pattern}"` };
      } catch (e: any) {
        if (e.status === 1) {
          steps[steps.length - 1].status = "warning";
          steps[steps.length - 1].detail = "Sin resultados";
          return { result: `🔍 No results found for "${action.pattern}"` };
        }
        steps[steps.length - 1].status = "error";
        steps[steps.length - 1].detail = e.message;
        return { result: `❌ Search error: ${e.message}` };
      }
    } else if (action.action === "writeFile" && action.path && action.content && isPathSafe(action.path)) {
      steps.push({ type: "writeFile", description: `Creando ${action.path}`, status: "running" });
      try {
        if (fs.existsSync(path.resolve(action.path))) {
          fileBackups.set(action.path, fs.readFileSync(path.resolve(action.path), "utf-8"));
        }
        const dir = path.dirname(path.resolve(action.path));
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.resolve(action.path), action.content, "utf-8");
        console.log(`[AGENT AUDIT] File written: ${action.path} (${action.content.length} bytes) at ${new Date().toISOString()}`);
        steps[steps.length - 1].status = "success";
        steps[steps.length - 1].detail = `${action.content.length} bytes`;
        return { result: `✅ File written: ${action.path}`, fileModified: action.path };
      } catch (e: any) {
        steps[steps.length - 1].status = "error";
        steps[steps.length - 1].detail = e.message;
        return { result: `❌ Error writing ${action.path}: ${e.message}` };
      }
    } else if (action.action === "editFile" && action.path && action.oldText && action.newText !== undefined && isPathSafe(action.path)) {
      steps.push({ type: "editFile", description: `Editando ${action.path}`, status: "running" });
      if (filesReadInSession && !filesReadInSession.has(action.path)) {
        filesReadInSession.add(action.path);
      }
      try {
        const filePath = path.resolve(action.path);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        fileBackups.set(action.path, fileContent);
        const occurrences = fileContent.split(action.oldText).length - 1;
        if (occurrences === 0) {
          steps[steps.length - 1].status = "error";
          steps[steps.length - 1].detail = "Texto no encontrado";
          return { result: `❌ editFile failed: Could not find the specified text in ${action.path}. TIPS: 1) Use readFile to see the current content and copy the EXACT text. 2) Check for extra spaces, tabs, or line breaks. 3) The file may have changed since you last read it - read it again. 4) Try a shorter, more unique snippet of text.` };
        } else if (occurrences > 1 && !action.replaceAll) {
          steps[steps.length - 1].status = "warning";
          steps[steps.length - 1].detail = `${occurrences} ocurrencias`;
          return { result: `⚠️ editFile: Found ${occurrences} occurrences in ${action.path}. Provide more context to match exactly one location, or add "replaceAll": true.` };
        } else {
          const newContent = action.replaceAll ? fileContent.split(action.oldText).join(action.newText) : fileContent.replace(action.oldText, action.newText);
          fs.writeFileSync(filePath, newContent, "utf-8");
          console.log(`[AGENT AUDIT] File edited: ${action.path} (replaced ${occurrences} occurrence(s)) at ${new Date().toISOString()}`);
          steps[steps.length - 1].status = "success";
          steps[steps.length - 1].detail = `${occurrences} cambio(s)`;
          return { result: `✅ File edited: ${action.path} (${occurrences} change${occurrences > 1 ? 's' : ''})`, fileModified: action.path };
        }
      } catch (e: any) {
        steps[steps.length - 1].status = "error";
        steps[steps.length - 1].detail = e.message;
        return { result: `❌ Error editing ${action.path}: ${e.message}` };
      }
    } else if (action.action === "listFiles" && action.dir) {
      if (isPathSafe(action.dir)) {
        steps.push({ type: "listFiles", description: `Listando ${action.dir}`, status: "running" });
        try {
          const entries = fs.readdirSync(path.resolve(action.dir), { withFileTypes: true });
          const list = entries.filter(e => !["node_modules", ".git"].includes(e.name)).map(e => `${e.isDirectory() ? '📁' : '📄'} ${e.name}`).join('\n');
          steps[steps.length - 1].status = "success";
          steps[steps.length - 1].detail = `${entries.length} items`;
          return { result: `📁 **${action.dir}**:\n${list}` };
        } catch (e: any) {
          steps[steps.length - 1].status = "error";
          steps[steps.length - 1].detail = e.message;
          return { result: `❌ Error listing ${action.dir}: ${e.message}` };
        }
      }
    } else if (action.action === "httpRequest" && action.url) {
      steps.push({ type: "httpRequest", description: `HTTP ${action.method || "GET"} ${action.url}`, status: "running" });
      try {
        const method = (action.method || "GET").toUpperCase();
        if (!action.url.startsWith("/api/")) {
          steps[steps.length - 1].status = "error";
          steps[steps.length - 1].detail = "Solo rutas /api/ permitidas";
          return { result: `❌ httpRequest only allows /api/ paths for safety.` };
        }
        const url = `http://localhost:5000${action.url}`;
        const fetchOpts: any = { method, headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(10000) };
        if (action.body && method !== "GET") fetchOpts.body = JSON.stringify(action.body);
        const startTime = Date.now();
        const resp = await fetch(url, fetchOpts);
        const elapsed = Date.now() - startTime;
        const text = await resp.text();
        const truncBody = text.length > 2000 ? text.substring(0, 2000) + "... (truncated)" : text;
        steps[steps.length - 1].status = resp.ok ? "success" : "error";
        steps[steps.length - 1].detail = `${resp.status} (${elapsed}ms)`;
        return { result: `🌐 HTTP ${method} ${action.url} → ${resp.status} (${elapsed}ms):\n\`\`\`\n${truncBody}\n\`\`\`` };
      } catch (e: any) {
        steps[steps.length - 1].status = "error";
        steps[steps.length - 1].detail = e.message;
        return { result: `❌ HTTP error: ${e.message}` };
      }
    } else if (action.action === "dbQuery" && action.sql) {
      steps.push({ type: "dbQuery", description: `DB: ${action.sql.substring(0, 60)}...`, status: "running" });
      try {
        const sqlLower = action.sql.trim().toLowerCase().replace(/\s+/g, " ");
        const forbidden = ["insert", "update", "delete", "drop", "alter", "create", "truncate", "grant", "revoke", "exec", "execute", "into"];
        const hasForbidden = forbidden.some(kw => {
          const regex = new RegExp(`\\b${kw}\\b`, "i");
          return regex.test(sqlLower);
        });
        if (!sqlLower.startsWith("select") || hasForbidden) {
          steps[steps.length - 1].status = "error";
          steps[steps.length - 1].detail = "Solo SELECT permitido";
          return { result: `❌ dbQuery only allows safe SELECT queries. No INSERT/UPDATE/DELETE/DROP/ALTER allowed.` };
        }
        if (sqlLower.includes(";")) {
          steps[steps.length - 1].status = "error";
          steps[steps.length - 1].detail = "Multi-statement no permitido";
          return { result: `❌ dbQuery does not allow multiple statements (no semicolons except at end).` };
        }
        const limitedSql = /\blimit\b/i.test(action.sql) ? action.sql : `${action.sql} LIMIT 50`;
        const { rows } = await db.execute(limitedSql);
        const truncRows = JSON.stringify(rows, null, 2);
        const truncResult = truncRows.length > 3000 ? truncRows.substring(0, 3000) + "... (truncated)" : truncRows;
        steps[steps.length - 1].status = "success";
        steps[steps.length - 1].detail = `${(rows as any[]).length} filas`;
        return { result: `🗄️ Query result (${(rows as any[]).length} rows):\n\`\`\`json\n${truncResult}\n\`\`\`` };
      } catch (e: any) {
        steps[steps.length - 1].status = "error";
        steps[steps.length - 1].detail = e.message;
        return { result: `❌ DB error: ${e.message}` };
      }
    } else if (action.action === "undoEdit" && action.path) {
      steps.push({ type: "undoEdit", description: `Deshaciendo ${action.path}`, status: "running" });
      const backup = fileBackups.get(action.path);
      if (backup) {
        try {
          fs.writeFileSync(path.resolve(action.path), backup, "utf-8");
          fileBackups.delete(action.path);
          steps[steps.length - 1].status = "success";
          steps[steps.length - 1].detail = "Restaurado";
          return { result: `↩️ Reverted ${action.path} to previous version`, fileModified: action.path };
        } catch (e: any) {
          steps[steps.length - 1].status = "error";
          steps[steps.length - 1].detail = e.message;
          return { result: `❌ Error reverting ${action.path}: ${e.message}` };
        }
      } else {
        steps[steps.length - 1].status = "warning";
        steps[steps.length - 1].detail = "Sin backup";
        return { result: `⚠️ No backup found for ${action.path}. Can only undo edits from this session.` };
      }
    } else if (action.action === "readLogs") {
      steps.push({ type: "readLogs", description: "Leyendo logs del servidor", status: "running" });
      try {
        const logPath = path.resolve("/tmp/agent-server.log");
        if (fs.existsSync(logPath)) {
          const logContent = fs.readFileSync(logPath, "utf-8");
          const lastLines = logContent.split("\n").slice(-50).join("\n");
          steps[steps.length - 1].status = "success";
          steps[steps.length - 1].detail = "Logs leidos";
          return { result: `📋 Server logs (last 50 lines):\n\`\`\`\n${lastLines}\n\`\`\`` };
        } else {
          steps[steps.length - 1].status = "warning";
          steps[steps.length - 1].detail = "No hay logs disponibles";
          return { result: `📋 No server log file found at /tmp/agent-server.log. Server output goes to stdout.` };
        }
      } catch (e: any) {
        steps[steps.length - 1].status = "error";
        steps[steps.length - 1].detail = e.message;
        return { result: `❌ Error reading logs: ${e.message}` };
      }
    } else if (action.action === "scanStructure" && action.path && isPathSafe(action.path)) {
      steps.push({ type: "scanStructure", description: `Escaneando estructura de ${action.path}`, status: "running" });
      try {
        const fileContent = fs.readFileSync(path.resolve(action.path), "utf-8");
        const lines = fileContent.split('\n');
        const entries: string[] = [];
        const braceStack: { name: string; startLine: number; depth: number }[] = [];
        let depth = 0;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();
          if (/^(export\s+)?(const|let|function|class|interface|type|enum)\s/.test(trimmed) ||
              /^(export\s+)?default\s+(function|class)\s/.test(trimmed)) {
            const nameMatch = trimmed.match(/(?:export\s+)?(?:default\s+)?(?:const|let|function|class|interface|type|enum)\s+(\w+)/);
            const name = nameMatch ? nameMatch[1] : trimmed.substring(0, 60);
            braceStack.push({ name, startLine: i + 1, depth });
          }
          for (const ch of line) {
            if (ch === '{') depth++;
            if (ch === '}') {
              depth--;
              const top = braceStack[braceStack.length - 1];
              if (top && depth <= top.depth) {
                entries.push(`L${top.startLine}-${i + 1}: ${lines[top.startLine - 1].trim().substring(0, 80)}`);
                braceStack.pop();
              }
            }
          }
        }
        for (const remaining of braceStack) {
          entries.push(`L${remaining.startLine}-?: ${lines[remaining.startLine - 1].trim().substring(0, 80)}`);
        }
        const result = entries.join('\n') || 'No definitions found';
        const truncResult = result.length > 8000 ? result.substring(0, 8000) + '\n... (truncated)' : result;
        steps[steps.length - 1].status = "success";
        steps[steps.length - 1].detail = `${entries.length} definiciones`;
        if (filesReadInSession) filesReadInSession.add(action.path);
        return { result: `🗺️ **Structure of ${action.path}** (${lines.length} lines, ${entries.length} definitions):\n\`\`\`\n${truncResult}\n\`\`\`` };
      } catch (e: any) {
        steps[steps.length - 1].status = "error";
        steps[steps.length - 1].detail = e.message;
        return { result: `❌ Error scanning ${action.path}: ${e.message}` };
      }
    } else if (action.action === "validateCode") {
      steps.push({ type: "validateCode", description: "Validando TypeScript...", status: "running" });
      try {
        execFileSync("npx", ["tsc", "--noEmit", "--pretty", "false"], { encoding: "utf-8", timeout: 30000, cwd: PROJECT_ROOT });
        steps[steps.length - 1].status = "success";
        steps[steps.length - 1].detail = "Sin errores";
        return { result: `✅ TypeScript validation passed - no errors found.` };
      } catch (e: any) {
        const stdout = (e.stdout || "").toString();
        const stderr = (e.stderr || "").toString();
        const output = stdout + "\n" + stderr;
        const allErrors = output.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 20);
        const errorCount = allErrors.filter((l: string) => l.includes('error')).length;
        const truncOutput = allErrors.join('\n');
        steps[steps.length - 1].status = errorCount > 0 ? "error" : "warning";
        steps[steps.length - 1].detail = `${errorCount} error(es)`;
        return { result: `⚠️ TypeScript validation found ${errorCount} error(s):\n\`\`\`\n${truncOutput}\n\`\`\`` };
      }
    }
    return { result: "" };
  }

  // Helper: call Gemini API with retry across models
  async function callGemini(apiKey: string, systemPrompt: string, contents: any[]): Promise<string | null> {
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { temperature: 0.3, maxOutputTokens: 16384 }
          })
        });
        const data = await response.json() as any;
        if (data?.error?.status === 'RESOURCE_EXHAUSTED') continue;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      } catch { continue; }
    }
    return null;
  }

  app.post("/api/admin/agent/chat", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });

    const { message, history, image } = req.body;
    if (!message && !image) return res.status(400).json({ error: "message or image required" });

    const useSSE = (req.headers.accept || '').includes('text/event-stream');

    if (useSSE) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
    }

    const sendSSE = (event: string, data: any) => {
      if (useSSE) {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        if (useSSE) {
          sendSSE('error', { error: "GEMINI_API_KEY not configured" });
          res.write('event: done\ndata: {}\n\n');
          return res.end();
        }
        return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
      }

      const schemaContent = fs.readFileSync(path.resolve("shared/schema.ts"), "utf-8");
      const projectTree = getProjectTree(PROJECT_ROOT);
      let replitMd = "";
      try { replitMd = fs.readFileSync(path.resolve("replit.md"), "utf-8"); } catch {}

      const systemPrompt = `You are an expert AI development agent for the IQEXPONENCIAL web application. You have FULL ACCESS to the entire project. You work autonomously with testing and verification capabilities.

PROJECT KNOWLEDGE BASE (replit.md):
${replitMd.substring(0, 6000)}

PROJECT FILE STRUCTURE:
${projectTree}

CAPABILITIES (wrap each in a \`\`\`json code block):

Read a file (full or by line range):
\`\`\`json
{"action": "readFile", "path": "client/src/pages/Home.tsx"}
\`\`\`
Read specific lines of a large file (IMPORTANT for files > 200 lines):
\`\`\`json
{"action": "readFile", "path": "client/src/pages/GestionPage.tsx", "startLine": 100, "endLine": 200}
\`\`\`

Search across files (grep):
\`\`\`json
{"action": "searchFiles", "pattern": "className.*hero", "dir": "client/src", "glob": "*.tsx"}
\`\`\`

Edit part of a file (PREFERRED for changes):
\`\`\`json
{"action": "editFile", "path": "client/src/pages/Home.tsx", "oldText": "exact text to find", "newText": "replacement text"}
\`\`\`

Write new file:
\`\`\`json
{"action": "writeFile", "path": "client/src/components/New.tsx", "content": "..."}
\`\`\`

List directory:
\`\`\`json
{"action": "listFiles", "dir": "client/src/pages"}
\`\`\`

Test an API endpoint (HTTP request):
\`\`\`json
{"action": "httpRequest", "url": "/api/some-endpoint", "method": "GET"}
\`\`\`
\`\`\`json
{"action": "httpRequest", "url": "/api/some-endpoint", "method": "POST", "body": {"key": "value"}}
\`\`\`

Query database (SELECT only):
\`\`\`json
{"action": "dbQuery", "sql": "SELECT * FROM users LIMIT 5"}
\`\`\`

Undo a file edit (revert to version before edit):
\`\`\`json
{"action": "undoEdit", "path": "client/src/pages/Home.tsx"}
\`\`\`

Read server logs:
\`\`\`json
{"action": "readLogs"}
\`\`\`

Scan file structure (get function/class definitions with line ranges - USE THIS for large files before editing):
\`\`\`json
{"action": "scanStructure", "path": "client/src/pages/GestionPage.tsx"}
\`\`\`

Validate TypeScript after edits (checks for compilation errors):
\`\`\`json
{"action": "validateCode"}
\`\`\`

AGENTIC WORKFLOW:
You work in an AUTOMATIC LOOP with up to 8 rounds. When you use readFile, searchFiles, listFiles, httpRequest, dbQuery, or readLogs, the system executes them and feeds the results back to you automatically.

WORKFLOW PATTERN - Follow this when making changes:
1. ANALYZE: Use scanStructure for large files (>200 lines) to get a map, then readFile specific sections
2. PLAN: Identify what files need to change and what might break
3. IMPLEMENT: Make the edits using editFile
4. VALIDATE: Run validateCode after edits to check for TypeScript errors
5. FIX: If validation fails, analyze the NEW errors and fix them. If 3 fixes fail, use undoEdit to revert.
6. VERIFY: Use httpRequest to test API endpoints, dbQuery to check data
7. CONFIRM: Do a final verification to ensure everything works

IMPACT ANALYSIS - Before editing:
- Search for imports/usages of the file you're changing to see what depends on it
- If changing a function signature, find all callers first
- If changing a component, check where it's used
- NEVER make a change that could break existing functionality without checking

WHEN TO USE WHICH ACTION:
- readFile: To see file content. For large files (>200 lines), the system truncates showing first 80 + last 30 lines. Use startLine/endLine to read the specific section you need to edit.
- searchFiles: When you need to find WHERE something is used/defined across the project. Also use this to find the EXACT line numbers of text before editing.
- editFile: To change specific parts of existing files. The oldText MUST match EXACTLY character-for-character.
- writeFile: Only for creating brand NEW files
- httpRequest: To TEST an endpoint after changes (GET, POST, PUT, DELETE)
- dbQuery: To VERIFY data in the database (SELECT queries only)
- undoEdit: To REVERT a file to its state before your edit if something went wrong
- readLogs: To check server logs for errors

CODE CONVENTIONS & FORBIDDEN CHANGES:
- NEVER modify: vite.config.ts, server/vite.ts, drizzle.config.ts, package.json
- Use path aliases: @/* for client/src/*, @shared/* for shared/*
- Use existing UI libraries: shadcn/ui, Radix UI, lucide-react, Framer Motion
- Before creating a new component, read existing components to copy their style
- Use Wouter for routing, TanStack Query for data fetching, Drizzle ORM for DB
- Use editFile (not writeFile) for existing files. writeFile only for NEW files
- Frontend imports: never import React explicitly (auto-injected by Vite)
- Environment variables on frontend: use import.meta.env.VITE_* (not process.env)

CLARIFICATION BEHAVIOR:
- If the user's request is vague (e.g. "mejora esto", "arregla eso"), FIRST ask what specifically they want before making changes
- If the user asks something unclear, ask ONE clarifying question instead of guessing
- Only act autonomously when the task is clear and specific

CHAIN OF THOUGHT - MANDATORY:
Before EVERY action, write a brief "PENSAMIENTO:" block explaining:
1. What you understand the user wants
2. Which files are likely involved (use PROJECT KNOWLEDGE BASE)
3. What you'll do and in what order
4. What could go wrong
This forces you to plan before acting and reduces errors significantly.

Example:
PENSAMIENTO: El usuario quiere cambiar el título de la página principal. Según el knowledge base, las páginas están en client/src/pages/. Primero leeré el archivo para encontrar el título actual, luego lo editaré.

FILE LOCATION MAP (quick reference):
- Pages: client/src/pages/ (React page components)
- Components: client/src/components/ (reusable UI)
- API routes: server/routes.ts (all backend endpoints)
- Database schema: shared/schema.ts (Drizzle tables)
- Styles: client/src/index.css (global CSS variables)
- Hooks: client/src/hooks/ (custom React hooks)
- Admin panel: client/src/pages/GestionPage.tsx
- Storage layer: server/storage.ts (DB access methods)

LARGE FILE EDITING STRATEGY (CRITICAL):
When editing files with >200 lines:
1. First searchFiles to find the EXACT line where the text you want to change is located
2. Then readFile with startLine/endLine to read ONLY that section (±20 lines around the target)
3. Copy the EXACT text from the readFile output for your oldText
4. Keep oldText SHORT but UNIQUE (2-5 lines max, not whole functions)
5. If editFile fails with "not found", re-read the file section immediately and try again with exact content

IMPORTANT RULES:
1. ALWAYS read files before editing them. Never guess content.
2. Respond in the SAME LANGUAGE the user writes (Spanish/English/Portuguese)
3. Make MINIMAL changes. Use editFile, not writeFile, for existing files.
4. Preserve existing code style, imports, and conventions.
5. When done with all changes, end with a brief summary of what was changed.
6. If a readFile or searchFiles returns results, analyze them and decide next steps.
7. Project stack: React, TypeScript, Tailwind CSS, shadcn/ui, Wouter, TanStack Query, Drizzle ORM, Express.
8. After making edits, VERIFY they work using httpRequest or dbQuery when applicable.
9. If verification fails, FIX the issue or undoEdit to revert. Do NOT leave broken code.
10. Use the PROJECT KNOWLEDGE BASE above to understand architecture, recent changes, and project conventions BEFORE starting work.
11. When editFile fails, ALWAYS re-read the exact section of the file before retrying. Never retry with the same oldText that already failed.

DATABASE SCHEMA SUMMARY (shared/schema.ts):
\`\`\`typescript
${schemaContent.substring(0, 3000)}
\`\`\``;

      // Build conversation history - include full content from previous messages
      const conversationHistory = (history || []).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      // Add user message with optional image
      const userParts: any[] = [];
      if (message) userParts.push({ text: message });
      if (image) {
        const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          userParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }
      if (userParts.length === 0) userParts.push({ text: "Analiza esta imagen" });
      conversationHistory.push({ role: "user", parts: userParts });

      const MAX_LOOPS = 8;
      let finalResponse = "";
      const allFilesModified: string[] = [];
      const allSteps: AgentStep[] = [];
      let loopCount = 0;
      fileBackups.clear();
      const filesReadInSession = new Set<string>();

      sendSSE('loop', { loop: 1, total: MAX_LOOPS });

      for (let i = 0; i < MAX_LOOPS; i++) {
        loopCount = i + 1;
        sendSSE('thinking', { loop: loopCount });
        const responseText = await callGemini(apiKey, systemPrompt, conversationHistory);
        if (!responseText) {
          if (i === 0) {
            if (useSSE) {
              sendSSE('error', { error: "API limit reached. Try again shortly." });
              res.write('event: done\ndata: {}\n\n');
              return res.end();
            }
            return res.status(429).json({ error: "API limit reached. Try again shortly." });
          }
          break;
        }

        const jsonBlocks = responseText.match(/```json\s*\n([\s\S]*?)\n```/g) || [];
        let hasContinuableActions = false;
        let actionResults = "";

        for (const block of jsonBlocks) {
          try {
            const jsonStr = block.replace(/```json\s*\n?/g, '').replace(/```\s*\n?/g, '').trim();
            const action = JSON.parse(jsonStr);
            const stepIndex = allSteps.length;
            const { result, fileModified } = await executeAgentAction(action, allSteps, filesReadInSession);
            const newStep = allSteps[stepIndex];
            if (newStep) sendSSE('step', newStep);
            if (result) actionResults += "\n\n" + result;
            if (fileModified) allFilesModified.push(fileModified);
            const continuableActions = ["readFile", "searchFiles", "listFiles", "httpRequest", "dbQuery", "readLogs", "scanStructure", "validateCode"];
            if (continuableActions.includes(action.action)) {
              hasContinuableActions = true;
            }
          } catch {}
        }

        let cleanResponse = responseText;
        for (const block of jsonBlocks) {
          try {
            const jsonStr = block.replace(/```json\s*\n?/g, '').replace(/```\s*\n?/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            if (parsed.action) {
              cleanResponse = cleanResponse.replace(block, "");
            }
          } catch {}
        }
        cleanResponse = cleanResponse.replace(/\n{3,}/g, "\n\n").trim();

        if (hasContinuableActions && i < MAX_LOOPS - 1) {
          conversationHistory.push({
            role: "model",
            parts: [{ text: responseText }]
          });
          conversationHistory.push({
            role: "user",
            parts: [{ text: `[SYSTEM] Action results:\n${actionResults}\n\nAnalyze these results and proceed. Use editFile to make changes, httpRequest to test endpoints, dbQuery to verify data. When done, provide your final summary.` }]
          });
          if (cleanResponse) {
            finalResponse += (finalResponse ? "\n\n" : "") + cleanResponse;
          }
          sendSSE('loop', { loop: loopCount + 1, total: MAX_LOOPS });
        } else {
          if (cleanResponse) {
            finalResponse += (finalResponse ? "\n\n" : "") + cleanResponse;
          }
          if (actionResults) {
            finalResponse += actionResults;
          }
          break;
        }
      }

      if (!finalResponse) finalResponse = "No pude generar una respuesta. Intenta de nuevo.";

      if (loopCount > 1) {
        finalResponse = `🔄 *${loopCount} pasos de razonamiento*\n\n` + finalResponse;
      }

      await db.insert(agentMessages).values({ role: "user", content: message || "(imagen)" });
      await db.insert(agentMessages).values({
        role: "assistant",
        content: finalResponse,
        filesModified: allFilesModified.length > 0 ? allFilesModified : null,
      });

      if (useSSE) {
        sendSSE('result', { response: finalResponse, filesModified: allFilesModified, loops: loopCount, steps: allSteps });
        res.write('event: done\ndata: {}\n\n');
        return res.end();
      }
      res.json({ response: finalResponse, filesModified: allFilesModified, loops: loopCount, steps: allSteps });
    } catch (err: any) {
      if (useSSE) {
        sendSSE('error', { error: err.message || "Agent error" });
        res.write('event: done\ndata: {}\n\n');
        return res.end();
      }
      res.status(500).json({ error: err.message || "Agent error" });
    }
  });

  app.get("/api/admin/agent/history", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    try {
      const messages = await db.select().from(agentMessages).orderBy(agentMessages.createdAt);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/agent/history", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    try {
      await db.delete(agentMessages);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/translate-bulk", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const { data, targetLang } = req.body;
    if (!data || !targetLang) return res.status(400).json({ error: "data and targetLang required" });
    const langName = targetLang === 'en' ? 'English' : targetLang === 'pt' ? 'Portuguese' : 'Spanish';
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
      const prompt = `Translate the following JSON from Spanish to ${langName}. Return ONLY the translated JSON with the exact same structure. Do not add explanations or markdown. Keep any empty strings as empty strings. Only translate text values, not keys.\n\n${JSON.stringify(data)}`;
      const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
      let translated = null;
      for (const model of models) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const rdata = await response.json() as any;
        if (rdata?.error?.status === 'RESOURCE_EXHAUSTED') continue;
        const raw = rdata?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (raw) {
          const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          translated = JSON.parse(cleaned);
          break;
        }
      }
      if (!translated) return res.status(429).json({ error: "Límite de API alcanzado. Intenta de nuevo en unos segundos." });
      res.json({ translated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Translation error" });
    }
  });

  app.post("/api/admin/translate", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const { text, targetLang } = req.body;
    if (!text || !targetLang) return res.status(400).json({ error: "text and targetLang required" });
    const langName = targetLang === 'en' ? 'English' : targetLang === 'pt' ? 'Portuguese' : 'Spanish';
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
      const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
      let translated = null;
      for (const model of models) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Translate the following text from Spanish to ${langName}. Return ONLY the translated text, nothing else. No quotes, no explanations.\n\n${text}` }] }]
          })
        });
        const data = await response.json() as any;
        if (data?.error?.status === 'RESOURCE_EXHAUSTED') continue;
        translated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (translated) break;
      }
      if (!translated) return res.status(429).json({ error: "Límite de API alcanzado. Intenta de nuevo en unos segundos." });
      res.json({ translated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Translation error" });
    }
  });

  return httpServer;
}
