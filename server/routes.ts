import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { UAParser } from "ua-parser-js";

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
      const result = await storage.saveQuizResult(req.body);
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

  // Get reading content
  app.get("/api/reading/:categoria", async (req, res) => {
    const categoria = req.params.categoria;
    const temaNumero = parseInt(req.query.tema as string) || 1;
    const savedContent = await storage.getReadingContent(categoria, temaNumero);
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
    const savedContents = await storage.getReadingContentsByCategory(categoria);
    
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
    const content = await storage.getRazonamientoContent(categoria, temaNumero);
    res.json({ content: content || null });
  });

  app.get("/api/razonamiento/:categoria/themes", async (req, res) => {
    const categoria = req.params.categoria;
    const savedContents = await storage.getRazonamientoContentsByCategory(categoria);
    
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
    const content = await storage.getCerebralContent(categoria, temaNumero);
    res.json({ content: content || null });
  });

  app.get("/api/cerebral/:categoria/themes", async (req, res) => {
    const categoria = req.params.categoria;
    const savedContents = await storage.getCerebralContentsByCategory(categoria);
    
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
    const intro = await storage.getCerebralIntro(categoria);
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
    const card = await storage.getEntrenamientoCard(req.params.categoria);
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
    const page = await storage.getEntrenamientoPage(req.params.categoria);
    res.json({ page: page || {
      categoria: req.params.categoria,
      bannerText: "¡Disfruta ahora de ejercicios de entrenamiento gratuitos por tiempo limitado!",
      pageTitle: "Entrenamientos",
      pageDescription: "Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas"
    }});
  });

  // Get entrenamiento items (public)
  app.get("/api/entrenamiento/:categoria/items", async (req, res) => {
    const items = await storage.getEntrenamientoItems(req.params.categoria);
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
    const style = await storage.getPageStyle(req.params.pageName);
    res.json({ style });
  });

  app.post("/api/admin/page-styles", async (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    if (!token || !validAdminTokens.has(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { pageName, styles } = req.body;
    const style = await storage.savePageStyle(pageName, styles);
    res.json({ style });
  });

  return httpServer;
}
