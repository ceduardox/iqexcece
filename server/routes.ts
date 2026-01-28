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
      title: "EL VIAJE DE LA MARIPOSA MONARCA",
      content: "Cada año, millones de mariposas monarca realizan uno de los viajes más increíbles de la naturaleza. Estas pequeñas viajeras recorren hasta 4,500 kilómetros desde Canadá y Estados Unidos hasta los bosques de oyamel en México, donde pasan el invierno.\n\nLas mariposas monarca son fáciles de reconocer por sus hermosas alas de color naranja con rayas negras y puntos blancos. Pero lo que las hace realmente especiales es su asombrosa capacidad de navegación. Aunque nunca han hecho el viaje antes, saben exactamente hacia dónde ir, guiándose por el sol y el campo magnético de la Tierra.\n\nEl viaje comienza en otoño, cuando el clima se vuelve frío en el norte. Las mariposas vuelan durante el día y descansan en grupos por la noche, colgándose de los árboles como racimos de hojas naranjas. Cuando llegan a México, se agrupan en los árboles por millones, creando un espectáculo impresionante.\n\nEn primavera, las mariposas comienzan su viaje de regreso al norte. Pero aquí hay algo curioso: ninguna mariposa completa todo el viaje de ida y vuelta. Son sus hijos, nietos y bisnietos quienes continúan la migración, generación tras generación, siguiendo la misma ruta que sus ancestros.\n\nLamentablemente, las mariposas monarca enfrentan peligros como la pérdida de su hábitat y el cambio climático. Por eso, muchas personas plantan flores de algodoncillo, la única planta donde las monarca ponen sus huevos, para ayudarlas a sobrevivir.",
      imageUrl: "https://img.freepik.com/free-vector/hand-drawn-butterfly-outline-illustration_23-2149935912.jpg",
      pageMainImage: "https://img.freepik.com/free-vector/cute-girl-back-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated_138676-5125.jpg",
      pageSmallImage: "https://img.freepik.com/free-vector/cute-astronaut-reading-book-cartoon-vector-icon-illustration-science-education-icon-isolated_138676-5765.jpg",
      categoryImage: "https://img.freepik.com/free-vector/hand-drawn-butterfly-outline-illustration_23-2149935912.jpg",
      questions: JSON.stringify([
        { question: "¿Cuántos kilómetros pueden recorrer las mariposas monarca en su migración?", options: ["1,000 kilómetros", "2,500 kilómetros", "4,500 kilómetros", "10,000 kilómetros"], correct: 2 },
        { question: "¿Cómo se orientan las mariposas monarca durante su viaje?", options: ["Siguiendo a otras mariposas más viejas", "Por el sol y el campo magnético de la Tierra", "Por el olor de las flores", "Por la temperatura del aire"], correct: 1 },
        { question: "¿A qué país viajan las mariposas monarca para pasar el invierno?", options: ["Brasil", "México", "Guatemala", "Argentina"], correct: 1 },
        { question: "¿Por qué es importante el algodoncillo para las mariposas monarca?", options: ["Es su alimento principal cuando son adultas", "Es donde ponen sus huevos", "Les da protección del frío", "Lo usan para construir sus nidos"], correct: 1 },
        { question: "¿Qué ocurre con las mariposas durante su viaje de regreso?", options: ["Todas regresan al mismo lugar donde nacieron", "Ninguna mariposa completa todo el viaje de ida y vuelta", "Viajan más rápido que en el viaje de ida", "Se quedan en México para siempre"], correct: 1 },
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
    const defaultContent = defaultReadingContent[categoria]?.[temaNumero] || defaultReadingContent[categoria]?.[1] || null;
    const content = savedContent || defaultContent;
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

  return httpServer;
}
