import { type User, type InsertUser, type UserSession, type InsertUserSession, type QuizResult, type InsertQuizResult, type ReadingContent, type InsertReadingContent, type RazonamientoContent, type InsertRazonamientoContent, type CerebralContent, type InsertCerebralContent, type CerebralResult, type InsertCerebralResult, type EntrenamientoCard, type InsertEntrenamientoCard, type EntrenamientoPage, type InsertEntrenamientoPage, type EntrenamientoItem, type InsertEntrenamientoItem, type VelocidadEjercicio, type InsertVelocidadEjercicio, type NumerosEjercicio, type InsertNumerosEjercicio, type AceleracionEjercicio, type InsertAceleracionEjercicio, type PageStyle, type InsertPageStyle, type TrainingResult, type InsertTrainingResult, type Institucion, type InsertInstitucion, type BlogCategory, type InsertBlogCategory, type BlogPost, type InsertBlogPost, users, userSessions, quizResults, readingContents, razonamientoContents, cerebralContents, cerebralIntros, cerebralResults, uploadedImages, entrenamientoCards, entrenamientoPages, entrenamientoItems, prepPages, categoriaPrepPage, velocidadEjercicios, numerosEjercicios, aceleracionEjercicios, pageStyles, trainingResults, instituciones, blogCategories, blogPosts } from "@shared/schema";

type CerebralIntro = typeof cerebralIntros.$inferSelect;
type InsertCerebralIntro = typeof cerebralIntros.$inferInsert;
import { randomUUID } from "crypto";
import { eq, desc, and, gt, count, sql, ilike, or } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSession(session: InsertUserSession): Promise<UserSession>;
  updateSession(sessionId: string, data: Partial<InsertUserSession>): Promise<void>;
  getSession(sessionId: string): Promise<UserSession | undefined>;
  getAllSessions(): Promise<UserSession[]>;
  getActiveSessions(): Promise<UserSession[]>;
  deactivateSession(sessionId: string): Promise<void>;
  
  // Quiz results
  saveQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getAllQuizResults(): Promise<QuizResult[]>;
  
  // Reading content
  getReadingContent(categoria: string, temaNumero?: number): Promise<ReadingContent | undefined>;
  getReadingContentsByCategory(categoria: string): Promise<ReadingContent[]>;
  saveReadingContent(content: InsertReadingContent): Promise<ReadingContent>;
  
  // Razonamiento content
  getRazonamientoContent(categoria: string, temaNumero?: number): Promise<RazonamientoContent | undefined>;
  getRazonamientoContentsByCategory(categoria: string): Promise<RazonamientoContent[]>;
  saveRazonamientoContent(content: InsertRazonamientoContent): Promise<RazonamientoContent>;
  
  // Cerebral content
  getCerebralContent(categoria: string, temaNumero?: number): Promise<CerebralContent | undefined>;
  getCerebralContentsByCategory(categoria: string): Promise<CerebralContent[]>;
  saveCerebralContent(content: InsertCerebralContent): Promise<CerebralContent>;
  
  // Cerebral intro
  getCerebralIntro(categoria: string): Promise<CerebralIntro | null>;
  saveCerebralIntro(intro: InsertCerebralIntro): Promise<CerebralIntro>;
  
  // Cerebral results
  saveCerebralResult(result: InsertCerebralResult): Promise<CerebralResult>;
  getCerebralResults(categoria?: string): Promise<CerebralResult[]>;
  
  // Entrenamiento
  getEntrenamientoCard(categoria: string, lang?: string): Promise<EntrenamientoCard | null>;
  getEntrenamientoCardExact(categoria: string, lang: string): Promise<EntrenamientoCard | null>;
  saveEntrenamientoCard(card: InsertEntrenamientoCard): Promise<EntrenamientoCard>;
  getEntrenamientoPage(categoria: string, lang?: string): Promise<EntrenamientoPage | null>;
  getEntrenamientoPageExact(categoria: string, lang: string): Promise<EntrenamientoPage | null>;
  saveEntrenamientoPage(page: InsertEntrenamientoPage): Promise<EntrenamientoPage>;
  getEntrenamientoItems(categoria: string, lang?: string): Promise<EntrenamientoItem[]>;
  getEntrenamientoItemsExact(categoria: string, lang: string): Promise<EntrenamientoItem[]>;
  getEntrenamientoItemById(id: string): Promise<EntrenamientoItem | null>;
  saveEntrenamientoItem(item: InsertEntrenamientoItem): Promise<EntrenamientoItem>;
  updateEntrenamientoItem(id: string, item: Partial<InsertEntrenamientoItem>): Promise<EntrenamientoItem | null>;
  deleteEntrenamientoItem(id: string): Promise<void>;
  
  // Prep pages
  getPrepPages(): Promise<any[]>;
  getPrepPageById(id: string): Promise<any | null>;
  savePrepPage(page: any): Promise<any>;
  updatePrepPage(id: string, page: any): Promise<any | null>;
  deletePrepPage(id: string): Promise<void>;
  getCategoriaPrepPage(categoria: string): Promise<any | null>;
  setCategoriaPrepPage(categoria: string, prepPageId: string | null): Promise<any>;
  
  // Velocidad exercises
  getVelocidadEjerciciosByItem(entrenamientoItemId: string): Promise<VelocidadEjercicio[]>;
  getVelocidadEjercicioById(id: string): Promise<VelocidadEjercicio | null>;
  saveVelocidadEjercicio(ejercicio: InsertVelocidadEjercicio): Promise<VelocidadEjercicio>;
  updateVelocidadEjercicio(id: string, ejercicio: Partial<InsertVelocidadEjercicio>): Promise<VelocidadEjercicio | null>;
  deleteVelocidadEjercicio(id: string): Promise<void>;
  
  // Numeros exercises intro page
  getNumerosIntroByItem(entrenamientoItemId: string): Promise<NumerosEjercicio | null>;
  saveNumerosIntro(data: InsertNumerosEjercicio): Promise<NumerosEjercicio>;
  updateNumerosIntro(id: string, data: Partial<InsertNumerosEjercicio>): Promise<NumerosEjercicio | null>;
  
  // Aceleracion de lectura exercises
  getAceleracionByItem(entrenamientoItemId: string): Promise<AceleracionEjercicio | null>;
  saveAceleracion(data: InsertAceleracionEjercicio): Promise<AceleracionEjercicio>;
  updateAceleracion(id: string, data: Partial<InsertAceleracionEjercicio>): Promise<AceleracionEjercicio | null>;
  
  // Page styles for visual editor
  getPageStyle(pageName: string, lang?: string): Promise<PageStyle | null>;
  savePageStyle(pageName: string, styles: string, lang?: string): Promise<PageStyle>;
  getAllPageStyles(): Promise<PageStyle[]>;
  
  // Training results
  saveTrainingResult(result: InsertTrainingResult): Promise<TrainingResult>;
  getTrainingResults(sessionId?: string, categoria?: string): Promise<TrainingResult[]>;
  getTrainingStats(sessionId?: string, categoria?: string): Promise<any>;

  // Instituciones
  getInstituciones(pais?: string, estado?: string, tipo?: string): Promise<Institucion[]>;
  saveInstitucion(inst: InsertInstitucion): Promise<Institucion>;
  deleteInstitucion(id: string): Promise<void>;

  // Blog
  getBlogCategories(): Promise<BlogCategory[]>;
  saveBlogCategory(cat: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: string, data: Partial<InsertBlogCategory>): Promise<BlogCategory | null>;
  deleteBlogCategory(id: string): Promise<void>;
  getBlogPosts(categoriaId?: string, estado?: string, page?: number, limit?: number, search?: string): Promise<{ posts: BlogPost[]; total: number }>;
  getBlogPost(id: string): Promise<BlogPost | null>;
  saveBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost | null>;
  deleteBlogPost(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, UserSession>;
  private quizResults: Map<string, QuizResult>;
  private readingContents: Map<string, ReadingContent>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.quizResults = new Map();
    this.readingContents = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSession(insertSession: InsertUserSession): Promise<UserSession> {
    const id = randomUUID();
    const session: UserSession = {
      id,
      sessionId: insertSession.sessionId,
      ip: insertSession.ip || null,
      userAgent: insertSession.userAgent || null,
      device: insertSession.device || null,
      browser: insertSession.browser || null,
      isPwa: insertSession.isPwa || false,
      ageGroup: insertSession.ageGroup || null,
      selectedProblems: insertSession.selectedProblems || null,
      isActive: insertSession.isActive ?? true,
      lastActivity: new Date(),
      createdAt: new Date(),
    };
    this.sessions.set(insertSession.sessionId, session);
    return session;
  }

  async updateSession(sessionId: string, data: Partial<InsertUserSession>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.set(sessionId, {
        ...session,
        ...data,
        lastActivity: new Date(),
      });
    }
  }

  async getSession(sessionId: string): Promise<UserSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async getAllSessions(): Promise<UserSession[]> {
    return Array.from(this.sessions.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getActiveSessions(): Promise<UserSession[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return Array.from(this.sessions.values()).filter(
      (s) => s.isActive && s.lastActivity && s.lastActivity > fiveMinutesAgo
    );
  }

  async deactivateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.set(sessionId, { ...session, isActive: false });
    }
  }

  async saveQuizResult(insertResult: InsertQuizResult): Promise<QuizResult> {
    const id = randomUUID();
    const result: QuizResult = {
      id,
      nombre: insertResult.nombre,
      email: insertResult.email || null,
      edad: insertResult.edad || null,
      ciudad: insertResult.ciudad || null,
      telefono: insertResult.telefono || null,
      comentario: insertResult.comentario || null,
      categoria: insertResult.categoria || "preescolar",
      testType: insertResult.testType || "lectura",
      nivelEducativo: insertResult.nivelEducativo || null,
      grado: insertResult.grado || null,
      institucion: insertResult.institucion || null,
      tipoEstudiante: insertResult.tipoEstudiante || null,
      semestre: insertResult.semestre || null,
      esProfesional: insertResult.esProfesional ?? null,
      profesion: insertResult.profesion || null,
      ocupacion: insertResult.ocupacion || null,
      lugarTrabajo: insertResult.lugarTrabajo || null,
      pais: insertResult.pais || null,
      codigoPais: insertResult.codigoPais || null,
      estado: insertResult.estado || null,
      tiempoLectura: insertResult.tiempoLectura || null,
      tiempoCuestionario: insertResult.tiempoCuestionario || null,
      respuestasCorrectas: insertResult.respuestasCorrectas ?? null,
      respuestasTotales: insertResult.respuestasTotales ?? null,
      comprension: insertResult.comprension ?? null,
      velocidadLectura: insertResult.velocidadLectura ?? null,
      velocidadMaxima: insertResult.velocidadMaxima ?? null,
      categoriaLector: insertResult.categoriaLector || null,
      isPwa: insertResult.isPwa || false,
      createdAt: new Date(),
    };
    this.quizResults.set(id, result);
    return result;
  }

  async getAllQuizResults(): Promise<QuizResult[]> {
    return Array.from(this.quizResults.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getReadingContent(categoria: string, temaNumero: number = 1): Promise<ReadingContent | undefined> {
    const key = `${categoria}_${temaNumero}`;
    return this.readingContents.get(key);
  }

  async getReadingContentsByCategory(categoria: string): Promise<ReadingContent[]> {
    return Array.from(this.readingContents.values())
      .filter(c => c.categoria === categoria)
      .sort((a, b) => (a.temaNumero || 1) - (b.temaNumero || 1));
  }

  async saveReadingContent(insertContent: InsertReadingContent): Promise<ReadingContent> {
    const temaNumero = insertContent.temaNumero || 1;
    const key = `${insertContent.categoria}_${temaNumero}`;
    const existing = this.readingContents.get(key);
    const content: ReadingContent = {
      id: existing?.id || randomUUID(),
      categoria: insertContent.categoria,
      temaNumero: temaNumero,
      title: insertContent.title,
      content: insertContent.content,
      imageUrl: insertContent.imageUrl || null,
      pageMainImage: insertContent.pageMainImage || null,
      pageSmallImage: insertContent.pageSmallImage || null,
      categoryImage: insertContent.categoryImage || null,
      questions: insertContent.questions,
      updatedAt: new Date(),
    };
    this.readingContents.set(key, content);
    return content;
  }

  async getRazonamientoContent(categoria: string, temaNumero: number = 1): Promise<RazonamientoContent | undefined> {
    return undefined;
  }

  async getRazonamientoContentsByCategory(categoria: string): Promise<RazonamientoContent[]> {
    return [];
  }

  async saveRazonamientoContent(insertContent: InsertRazonamientoContent): Promise<RazonamientoContent> {
    const content: RazonamientoContent = {
      id: randomUUID(),
      categoria: insertContent.categoria,
      temaNumero: insertContent.temaNumero || 1,
      title: insertContent.title,
      imageUrl: insertContent.imageUrl || null,
      imageSize: insertContent.imageSize || 100,
      questions: insertContent.questions,
      updatedAt: new Date(),
    };
    return content;
  }

  async getCerebralContent(categoria: string, temaNumero: number = 1): Promise<CerebralContent | undefined> {
    return undefined;
  }

  async getCerebralContentsByCategory(categoria: string): Promise<CerebralContent[]> {
    return [];
  }

  async saveCerebralContent(insertContent: InsertCerebralContent): Promise<CerebralContent> {
    const content: CerebralContent = {
      id: randomUUID(),
      categoria: insertContent.categoria,
      temaNumero: insertContent.temaNumero || 1,
      title: insertContent.title,
      exerciseType: insertContent.exerciseType,
      imageUrl: insertContent.imageUrl || null,
      imageSize: insertContent.imageSize || 100,
      exerciseData: insertContent.exerciseData,
      isActive: insertContent.isActive ?? true,
      updatedAt: new Date(),
    };
    return content;
  }

  async getCerebralIntro(categoria: string): Promise<CerebralIntro | null> {
    return null;
  }

  async saveCerebralIntro(intro: InsertCerebralIntro): Promise<CerebralIntro> {
    return {
      id: randomUUID(),
      categoria: intro.categoria,
      imageUrl: intro.imageUrl || null,
      title: intro.title || "¿Cuál lado de tu cerebro es más dominante?",
      subtitle: intro.subtitle || "El test tiene una duración de 30 segundos.",
      buttonText: intro.buttonText || "Empezar",
      updatedAt: new Date(),
    };
  }

  async saveCerebralResult(result: InsertCerebralResult): Promise<CerebralResult> {
    return {
      id: randomUUID(),
      ...result,
      createdAt: new Date(),
    } as CerebralResult;
  }

  async getCerebralResults(_categoria?: string): Promise<CerebralResult[]> {
    return [];
  }
  
  async getEntrenamientoCard(_categoria: string, _lang?: string): Promise<EntrenamientoCard | null> {
    return null;
  }
  async getEntrenamientoCardExact(_categoria: string, _lang: string): Promise<EntrenamientoCard | null> {
    return null;
  }
  async saveEntrenamientoCard(card: InsertEntrenamientoCard): Promise<EntrenamientoCard> {
    return { id: randomUUID(), ...card, lang: card.lang || 'es', updatedAt: new Date() } as EntrenamientoCard;
  }
  async getEntrenamientoPage(_categoria: string, _lang?: string): Promise<EntrenamientoPage | null> {
    return null;
  }
  async getEntrenamientoPageExact(_categoria: string, _lang: string): Promise<EntrenamientoPage | null> {
    return null;
  }
  async saveEntrenamientoPage(page: InsertEntrenamientoPage): Promise<EntrenamientoPage> {
    return { id: randomUUID(), ...page, lang: page.lang || 'es', updatedAt: new Date() } as EntrenamientoPage;
  }
  async getEntrenamientoItems(_categoria: string, _lang?: string): Promise<EntrenamientoItem[]> {
    return [];
  }
  async getEntrenamientoItemsExact(_categoria: string, _lang: string): Promise<EntrenamientoItem[]> {
    return [];
  }
  async getEntrenamientoItemById(_id: string): Promise<EntrenamientoItem | null> {
    return null;
  }
  async saveEntrenamientoItem(item: InsertEntrenamientoItem): Promise<EntrenamientoItem> {
    return { id: randomUUID(), ...item, updatedAt: new Date() } as EntrenamientoItem;
  }
  async updateEntrenamientoItem(_id: string, _item: Partial<InsertEntrenamientoItem>): Promise<EntrenamientoItem | null> {
    return null;
  }
  async deleteEntrenamientoItem(_id: string): Promise<void> {}
  
  // Prep pages stubs
  async getPrepPages(): Promise<any[]> { return []; }
  async getPrepPageById(_id: string): Promise<any | null> { return null; }
  async savePrepPage(page: any): Promise<any> { return { id: randomUUID(), ...page }; }
  async updatePrepPage(_id: string, _page: any): Promise<any | null> { return null; }
  async deletePrepPage(_id: string): Promise<void> {}
  async getCategoriaPrepPage(_categoria: string): Promise<any | null> { return null; }
  async setCategoriaPrepPage(_categoria: string, _prepPageId: string | null): Promise<any> { return {}; }
  
  // Velocidad exercises (stubs)
  async getVelocidadEjerciciosByItem(_entrenamientoItemId: string): Promise<VelocidadEjercicio[]> { return []; }
  async getVelocidadEjercicioById(_id: string): Promise<VelocidadEjercicio | null> { return null; }
  async saveVelocidadEjercicio(ejercicio: InsertVelocidadEjercicio): Promise<VelocidadEjercicio> {
    return { id: randomUUID(), ...ejercicio, isActive: true, createdAt: new Date(), updatedAt: new Date() } as VelocidadEjercicio;
  }
  async updateVelocidadEjercicio(_id: string, _ejercicio: Partial<InsertVelocidadEjercicio>): Promise<VelocidadEjercicio | null> { return null; }
  async deleteVelocidadEjercicio(_id: string): Promise<void> {}
  
  async getNumerosIntroByItem(_entrenamientoItemId: string): Promise<NumerosEjercicio | null> { return null; }
  async saveNumerosIntro(data: InsertNumerosEjercicio): Promise<NumerosEjercicio> {
    return { id: randomUUID(), ...data, isActive: true, createdAt: new Date(), updatedAt: new Date() } as NumerosEjercicio;
  }
  async updateNumerosIntro(_id: string, _data: Partial<InsertNumerosEjercicio>): Promise<NumerosEjercicio | null> { return null; }
  
  // Aceleracion stubs
  async getAceleracionByItem(_entrenamientoItemId: string): Promise<AceleracionEjercicio | null> { return null; }
  async saveAceleracion(data: InsertAceleracionEjercicio): Promise<AceleracionEjercicio> {
    return { id: randomUUID(), ...data, isActive: true, createdAt: new Date(), updatedAt: new Date() } as AceleracionEjercicio;
  }
  async updateAceleracion(_id: string, _data: Partial<InsertAceleracionEjercicio>): Promise<AceleracionEjercicio | null> { return null; }
  
  // Page styles stubs
  async getPageStyle(_pageName: string, _lang?: string): Promise<PageStyle | null> { return null; }
  async savePageStyle(pageName: string, styles: string, lang: string = 'es'): Promise<PageStyle> {
    return { id: randomUUID(), pageName, styles, lang, updatedAt: new Date() } as PageStyle;
  }
  async getAllPageStyles(): Promise<PageStyle[]> { return []; }
  
  // Training results stubs
  async saveTrainingResult(result: InsertTrainingResult): Promise<TrainingResult> {
    return { id: randomUUID(), ...result, createdAt: new Date() } as TrainingResult;
  }
  async getTrainingResults(_sessionId?: string, _categoria?: string): Promise<TrainingResult[]> { return []; }
  async getTrainingStats(_sessionId?: string, _categoria?: string): Promise<any> { return { totalSessions: 0, byType: {}, recentActivity: [], dailyActivity: {} }; }
  async getInstituciones(_pais?: string, _estado?: string, _tipo?: string): Promise<Institucion[]> { return []; }
  async saveInstitucion(inst: InsertInstitucion): Promise<Institucion> { return { id: randomUUID(), ...inst } as Institucion; }
  async deleteInstitucion(_id: string): Promise<void> {}
  async getBlogCategories(): Promise<BlogCategory[]> { return []; }
  async saveBlogCategory(cat: InsertBlogCategory): Promise<BlogCategory> { return { id: randomUUID(), ...cat } as BlogCategory; }
  async updateBlogCategory(_id: string, _data: Partial<InsertBlogCategory>): Promise<BlogCategory | null> { return null; }
  async deleteBlogCategory(_id: string): Promise<void> {}
  async getBlogPosts(): Promise<{ posts: BlogPost[]; total: number }> { return { posts: [], total: 0 }; }
  async getBlogPost(_id: string): Promise<BlogPost | null> { return null; }
  async saveBlogPost(post: InsertBlogPost): Promise<BlogPost> { return { id: randomUUID(), ...post, createdAt: new Date(), updatedAt: new Date() } as BlogPost; }
  async updateBlogPost(_id: string, _data: Partial<InsertBlogPost>): Promise<BlogPost | null> { return null; }
  async deleteBlogPost(_id: string): Promise<void> {}
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createSession(insertSession: InsertUserSession): Promise<UserSession> {
    const [session] = await db.insert(userSessions).values({
      sessionId: insertSession.sessionId,
      ip: insertSession.ip || null,
      userAgent: insertSession.userAgent || null,
      device: insertSession.device || null,
      browser: insertSession.browser || null,
      isPwa: insertSession.isPwa || false,
      ageGroup: insertSession.ageGroup || null,
      selectedProblems: insertSession.selectedProblems || null,
      isActive: insertSession.isActive ?? true,
    }).returning();
    return session;
  }

  async updateSession(sessionId: string, data: Partial<InsertUserSession>): Promise<void> {
    await db.update(userSessions)
      .set({ ...data, lastActivity: new Date() })
      .where(eq(userSessions.sessionId, sessionId));
  }

  async getSession(sessionId: string): Promise<UserSession | undefined> {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.sessionId, sessionId));
    return session;
  }

  async getAllSessions(): Promise<UserSession[]> {
    return db.select().from(userSessions).orderBy(desc(userSessions.createdAt));
  }

  async getActiveSessions(): Promise<UserSession[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return db.select().from(userSessions)
      .where(and(
        eq(userSessions.isActive, true),
        gt(userSessions.lastActivity, fiveMinutesAgo)
      ));
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await db.update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.sessionId, sessionId));
  }

  async saveQuizResult(insertResult: InsertQuizResult): Promise<QuizResult> {
    const [result] = await db.insert(quizResults).values({
      nombre: insertResult.nombre,
      email: insertResult.email || null,
      edad: insertResult.edad || null,
      ciudad: insertResult.ciudad || null,
      telefono: insertResult.telefono || null,
      comentario: insertResult.comentario || null,
      categoria: insertResult.categoria || "preescolar",
      testType: insertResult.testType || "lectura",
      grado: insertResult.grado || null,
      institucion: insertResult.institucion || null,
      tipoEstudiante: insertResult.tipoEstudiante || null,
      semestre: insertResult.semestre || null,
      esProfesional: insertResult.esProfesional ?? null,
      profesion: insertResult.profesion || null,
      ocupacion: insertResult.ocupacion || null,
      lugarTrabajo: insertResult.lugarTrabajo || null,
      pais: insertResult.pais || null,
      codigoPais: insertResult.codigoPais || null,
      estado: insertResult.estado || null,
      tiempoLectura: insertResult.tiempoLectura || null,
      tiempoCuestionario: insertResult.tiempoCuestionario || null,
      respuestasCorrectas: insertResult.respuestasCorrectas ?? null,
      respuestasTotales: insertResult.respuestasTotales ?? null,
      comprension: insertResult.comprension ?? null,
      velocidadLectura: insertResult.velocidadLectura ?? null,
      velocidadMaxima: insertResult.velocidadMaxima ?? null,
      categoriaLector: insertResult.categoriaLector || null,
      isPwa: insertResult.isPwa || false,
    }).returning();
    return result;
  }

  async getAllQuizResults(): Promise<QuizResult[]> {
    return db.select().from(quizResults).orderBy(desc(quizResults.createdAt));
  }

  async getReadingContent(categoria: string, temaNumero: number = 1): Promise<ReadingContent | undefined> {
    const [content] = await db.select().from(readingContents)
      .where(and(
        eq(readingContents.categoria, categoria),
        eq(readingContents.temaNumero, temaNumero)
      ));
    return content;
  }

  async getReadingContentsByCategory(categoria: string): Promise<ReadingContent[]> {
    return db.select().from(readingContents)
      .where(eq(readingContents.categoria, categoria))
      .orderBy(readingContents.temaNumero);
  }

  async saveReadingContent(insertContent: InsertReadingContent): Promise<ReadingContent> {
    const temaNumero = insertContent.temaNumero || 1;
    const existing = await this.getReadingContent(insertContent.categoria, temaNumero);
    
    if (existing) {
      const [updated] = await db.update(readingContents)
        .set({
          title: insertContent.title,
          content: insertContent.content,
          imageUrl: insertContent.imageUrl || null,
          pageMainImage: insertContent.pageMainImage || null,
          pageSmallImage: insertContent.pageSmallImage || null,
          categoryImage: insertContent.categoryImage || null,
          questions: insertContent.questions,
          updatedAt: new Date(),
        })
        .where(and(
          eq(readingContents.categoria, insertContent.categoria),
          eq(readingContents.temaNumero, temaNumero)
        ))
        .returning();
      return updated;
    }

    const [created] = await db.insert(readingContents).values({
      categoria: insertContent.categoria,
      temaNumero: temaNumero,
      title: insertContent.title,
      content: insertContent.content,
      imageUrl: insertContent.imageUrl || null,
      pageMainImage: insertContent.pageMainImage || null,
      pageSmallImage: insertContent.pageSmallImage || null,
      categoryImage: insertContent.categoryImage || null,
      questions: insertContent.questions,
    }).returning();
    return created;
  }

  async getRazonamientoContent(categoria: string, temaNumero: number = 1): Promise<RazonamientoContent | undefined> {
    const [content] = await db.select().from(razonamientoContents)
      .where(and(
        eq(razonamientoContents.categoria, categoria),
        eq(razonamientoContents.temaNumero, temaNumero)
      ));
    return content;
  }

  async getRazonamientoContentsByCategory(categoria: string): Promise<RazonamientoContent[]> {
    return db.select().from(razonamientoContents)
      .where(eq(razonamientoContents.categoria, categoria))
      .orderBy(razonamientoContents.temaNumero);
  }

  async saveRazonamientoContent(insertContent: InsertRazonamientoContent): Promise<RazonamientoContent> {
    const temaNumero = insertContent.temaNumero || 1;
    const existing = await this.getRazonamientoContent(insertContent.categoria, temaNumero);
    
    if (existing) {
      const [updated] = await db.update(razonamientoContents)
        .set({
          title: insertContent.title,
          imageUrl: insertContent.imageUrl || null,
          imageSize: insertContent.imageSize || 100,
          questions: insertContent.questions,
          updatedAt: new Date(),
        })
        .where(and(
          eq(razonamientoContents.categoria, insertContent.categoria),
          eq(razonamientoContents.temaNumero, temaNumero)
        ))
        .returning();
      return updated;
    }

    const [created] = await db.insert(razonamientoContents).values({
      categoria: insertContent.categoria,
      temaNumero: temaNumero,
      title: insertContent.title,
      imageUrl: insertContent.imageUrl || null,
      imageSize: insertContent.imageSize || 100,
      questions: insertContent.questions,
    }).returning();
    return created;
  }

  async getCerebralContent(categoria: string, temaNumero: number = 1): Promise<CerebralContent | undefined> {
    const [content] = await db.select().from(cerebralContents)
      .where(and(
        eq(cerebralContents.categoria, categoria),
        eq(cerebralContents.temaNumero, temaNumero)
      ));
    return content;
  }

  async getCerebralContentsByCategory(categoria: string): Promise<CerebralContent[]> {
    return db.select().from(cerebralContents)
      .where(eq(cerebralContents.categoria, categoria))
      .orderBy(cerebralContents.temaNumero);
  }

  async saveCerebralContent(insertContent: InsertCerebralContent): Promise<CerebralContent> {
    const temaNumero = insertContent.temaNumero || 1;
    const existing = await this.getCerebralContent(insertContent.categoria, temaNumero);
    
    if (existing) {
      const [updated] = await db.update(cerebralContents)
        .set({
          title: insertContent.title,
          exerciseType: insertContent.exerciseType,
          imageUrl: insertContent.imageUrl || null,
          imageSize: insertContent.imageSize || 100,
          exerciseData: insertContent.exerciseData,
          isActive: insertContent.isActive ?? true,
          updatedAt: new Date(),
        })
        .where(and(
          eq(cerebralContents.categoria, insertContent.categoria),
          eq(cerebralContents.temaNumero, temaNumero)
        ))
        .returning();
      return updated;
    }

    const [created] = await db.insert(cerebralContents).values({
      categoria: insertContent.categoria,
      temaNumero: temaNumero,
      title: insertContent.title,
      exerciseType: insertContent.exerciseType,
      imageUrl: insertContent.imageUrl || null,
      imageSize: insertContent.imageSize || 100,
      exerciseData: insertContent.exerciseData,
      isActive: insertContent.isActive ?? true,
    }).returning();
    return created;
  }

  // Cerebral intro
  async getCerebralIntro(categoria: string): Promise<CerebralIntro | null> {
    const [intro] = await db.select().from(cerebralIntros).where(eq(cerebralIntros.categoria, categoria));
    return intro || null;
  }

  async saveCerebralIntro(intro: InsertCerebralIntro): Promise<CerebralIntro> {
    const existing = await this.getCerebralIntro(intro.categoria);
    
    if (existing) {
      const [updated] = await db.update(cerebralIntros)
        .set({
          imageUrl: intro.imageUrl,
          title: intro.title,
          subtitle: intro.subtitle,
          buttonText: intro.buttonText,
          updatedAt: new Date(),
        })
        .where(eq(cerebralIntros.categoria, intro.categoria))
        .returning();
      return updated;
    }

    const [created] = await db.insert(cerebralIntros).values({
      categoria: intro.categoria,
      imageUrl: intro.imageUrl,
      title: intro.title,
      subtitle: intro.subtitle,
      buttonText: intro.buttonText,
    }).returning();
    return created;
  }

  // Uploaded images
  async saveImage(data: { name: string; data: string; originalSize?: number; compressedSize?: number; width?: number; height?: number }) {
    const [created] = await db.insert(uploadedImages).values(data).returning();
    return created;
  }

  async saveImageWithId(id: string, name: string, data: string, originalSize?: number, compressedSize?: number, width?: number, height?: number) {
    const [created] = await db.insert(uploadedImages).values({ id, name, data, originalSize, compressedSize, width, height }).returning();
    return created;
  }

  async getImages() {
    return db.select().from(uploadedImages).orderBy(uploadedImages.createdAt);
  }

  async getImageById(id: string) {
    const [image] = await db.select().from(uploadedImages).where(eq(uploadedImages.id, id));
    return image;
  }

  async deleteImage(id: string) {
    await db.delete(uploadedImages).where(eq(uploadedImages.id, id));
  }

  // Cerebral results
  async saveCerebralResult(result: InsertCerebralResult): Promise<CerebralResult> {
    const [created] = await db.insert(cerebralResults).values(result).returning();
    return created;
  }

  async getCerebralResults(categoria?: string): Promise<CerebralResult[]> {
    if (categoria) {
      return db.select().from(cerebralResults).where(eq(cerebralResults.categoria, categoria)).orderBy(desc(cerebralResults.createdAt));
    }
    return db.select().from(cerebralResults).orderBy(desc(cerebralResults.createdAt));
  }

  // Entrenamiento Card
  async getEntrenamientoCard(categoria: string, lang: string = 'es'): Promise<EntrenamientoCard | null> {
    const [card] = await db.select().from(entrenamientoCards)
      .where(and(eq(entrenamientoCards.categoria, categoria), eq(entrenamientoCards.lang, lang)));
    if (card) return card;
    if (lang !== 'es') {
      const [fallback] = await db.select().from(entrenamientoCards)
        .where(and(eq(entrenamientoCards.categoria, categoria), eq(entrenamientoCards.lang, 'es')));
      return fallback || null;
    }
    return null;
  }

  async getEntrenamientoCardExact(categoria: string, lang: string): Promise<EntrenamientoCard | null> {
    const [card] = await db.select().from(entrenamientoCards)
      .where(and(eq(entrenamientoCards.categoria, categoria), eq(entrenamientoCards.lang, lang)));
    return card || null;
  }

  async saveEntrenamientoCard(card: InsertEntrenamientoCard): Promise<EntrenamientoCard> {
    const cardLang = card.lang || 'es';
    const [existing] = await db.select().from(entrenamientoCards)
      .where(and(eq(entrenamientoCards.categoria, card.categoria), eq(entrenamientoCards.lang, cardLang)));
    if (existing) {
      const [updated] = await db.update(entrenamientoCards)
        .set({ ...card, lang: cardLang, updatedAt: new Date() })
        .where(and(eq(entrenamientoCards.categoria, card.categoria), eq(entrenamientoCards.lang, cardLang)))
        .returning();
      return updated;
    }
    const [created] = await db.insert(entrenamientoCards).values({ ...card, lang: cardLang }).returning();
    return created;
  }

  // Entrenamiento Page
  async getEntrenamientoPage(categoria: string, lang: string = 'es'): Promise<EntrenamientoPage | null> {
    const [page] = await db.select().from(entrenamientoPages)
      .where(and(eq(entrenamientoPages.categoria, categoria), eq(entrenamientoPages.lang, lang)));
    if (page) return page;
    if (lang !== 'es') {
      const [fallback] = await db.select().from(entrenamientoPages)
        .where(and(eq(entrenamientoPages.categoria, categoria), eq(entrenamientoPages.lang, 'es')));
      return fallback || null;
    }
    return null;
  }

  async getEntrenamientoPageExact(categoria: string, lang: string): Promise<EntrenamientoPage | null> {
    const [page] = await db.select().from(entrenamientoPages)
      .where(and(eq(entrenamientoPages.categoria, categoria), eq(entrenamientoPages.lang, lang)));
    return page || null;
  }

  async saveEntrenamientoPage(page: InsertEntrenamientoPage): Promise<EntrenamientoPage> {
    const pageLang = page.lang || 'es';
    const [existing] = await db.select().from(entrenamientoPages)
      .where(and(eq(entrenamientoPages.categoria, page.categoria), eq(entrenamientoPages.lang, pageLang)));
    if (existing) {
      const [updated] = await db.update(entrenamientoPages)
        .set({ ...page, lang: pageLang, updatedAt: new Date() })
        .where(and(eq(entrenamientoPages.categoria, page.categoria), eq(entrenamientoPages.lang, pageLang)))
        .returning();
      return updated;
    }
    const [created] = await db.insert(entrenamientoPages).values({ ...page, lang: pageLang }).returning();
    return created;
  }

  // Entrenamiento Items
  async getEntrenamientoItems(categoria: string, lang: string = 'es'): Promise<EntrenamientoItem[]> {
    const items = await db.select().from(entrenamientoItems)
      .where(and(eq(entrenamientoItems.categoria, categoria), eq(entrenamientoItems.lang, lang)))
      .orderBy(entrenamientoItems.sortOrder);
    if (items.length > 0) return items;
    if (lang !== 'es') {
      return db.select().from(entrenamientoItems)
        .where(and(eq(entrenamientoItems.categoria, categoria), eq(entrenamientoItems.lang, 'es')))
        .orderBy(entrenamientoItems.sortOrder);
    }
    return items;
  }

  async getEntrenamientoItemsExact(categoria: string, lang: string): Promise<EntrenamientoItem[]> {
    return db.select().from(entrenamientoItems)
      .where(and(eq(entrenamientoItems.categoria, categoria), eq(entrenamientoItems.lang, lang)))
      .orderBy(entrenamientoItems.sortOrder);
  }

  async getEntrenamientoItemById(id: string): Promise<EntrenamientoItem | null> {
    const [item] = await db.select().from(entrenamientoItems).where(eq(entrenamientoItems.id, id));
    return item || null;
  }

  async saveEntrenamientoItem(item: InsertEntrenamientoItem): Promise<EntrenamientoItem> {
    const [created] = await db.insert(entrenamientoItems).values(item).returning();
    return created;
  }

  async updateEntrenamientoItem(id: string, item: Partial<InsertEntrenamientoItem>): Promise<EntrenamientoItem | null> {
    const [updated] = await db.update(entrenamientoItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(entrenamientoItems.id, id))
      .returning();
    return updated || null;
  }

  async deleteEntrenamientoItem(id: string): Promise<void> {
    await db.delete(entrenamientoItems).where(eq(entrenamientoItems.id, id));
  }

  // Prep pages
  async getPrepPages(): Promise<any[]> {
    return await db.select().from(prepPages).orderBy(desc(prepPages.createdAt));
  }

  async getPrepPageById(id: string): Promise<any | null> {
    const [page] = await db.select().from(prepPages).where(eq(prepPages.id, id));
    return page || null;
  }

  async savePrepPage(page: any): Promise<any> {
    const [created] = await db.insert(prepPages).values(page).returning();
    return created;
  }

  async updatePrepPage(id: string, page: any): Promise<any | null> {
    const { id: _id, createdAt: _createdAt, ...updateData } = page;
    const [updated] = await db.update(prepPages)
      .set(updateData)
      .where(eq(prepPages.id, id))
      .returning();
    return updated || null;
  }

  async deletePrepPage(id: string): Promise<void> {
    await db.delete(prepPages).where(eq(prepPages.id, id));
  }

  async getCategoriaPrepPage(categoria: string): Promise<any | null> {
    const [mapping] = await db.select().from(categoriaPrepPage).where(eq(categoriaPrepPage.categoria, categoria));
    return mapping || null;
  }

  async setCategoriaPrepPage(categoria: string, prepPageId: string | null): Promise<any> {
    const existing = await this.getCategoriaPrepPage(categoria);
    if (existing) {
      const [updated] = await db.update(categoriaPrepPage)
        .set({ prepPageId })
        .where(eq(categoriaPrepPage.categoria, categoria))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(categoriaPrepPage).values({ categoria, prepPageId }).returning();
      return created;
    }
  }

  // Velocidad exercises
  async getVelocidadEjerciciosByItem(entrenamientoItemId: string): Promise<VelocidadEjercicio[]> {
    return await db.select().from(velocidadEjercicios).where(eq(velocidadEjercicios.entrenamientoItemId, entrenamientoItemId));
  }

  async getVelocidadEjercicioById(id: string): Promise<VelocidadEjercicio | null> {
    const [ejercicio] = await db.select().from(velocidadEjercicios).where(eq(velocidadEjercicios.id, id));
    return ejercicio || null;
  }

  async saveVelocidadEjercicio(ejercicio: InsertVelocidadEjercicio): Promise<VelocidadEjercicio> {
    const [created] = await db.insert(velocidadEjercicios).values(ejercicio).returning();
    return created;
  }

  async updateVelocidadEjercicio(id: string, ejercicio: Partial<InsertVelocidadEjercicio>): Promise<VelocidadEjercicio | null> {
    const [updated] = await db.update(velocidadEjercicios)
      .set({ ...ejercicio, updatedAt: new Date() })
      .where(eq(velocidadEjercicios.id, id))
      .returning();
    return updated || null;
  }

  async deleteVelocidadEjercicio(id: string): Promise<void> {
    await db.delete(velocidadEjercicios).where(eq(velocidadEjercicios.id, id));
  }

  async getNumerosIntroByItem(entrenamientoItemId: string): Promise<NumerosEjercicio | null> {
    const [intro] = await db.select().from(numerosEjercicios)
      .where(eq(numerosEjercicios.entrenamientoItemId, entrenamientoItemId));
    return intro || null;
  }

  async saveNumerosIntro(data: InsertNumerosEjercicio): Promise<NumerosEjercicio> {
    const [intro] = await db.insert(numerosEjercicios).values(data).returning();
    return intro;
  }

  async updateNumerosIntro(id: string, data: Partial<InsertNumerosEjercicio>): Promise<NumerosEjercicio | null> {
    const [updated] = await db.update(numerosEjercicios)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(numerosEjercicios.id, id))
      .returning();
    return updated || null;
  }

  // Aceleracion de lectura
  async getAceleracionByItem(entrenamientoItemId: string): Promise<AceleracionEjercicio | null> {
    const [ejercicio] = await db.select().from(aceleracionEjercicios)
      .where(eq(aceleracionEjercicios.entrenamientoItemId, entrenamientoItemId));
    return ejercicio || null;
  }

  async saveAceleracion(data: InsertAceleracionEjercicio): Promise<AceleracionEjercicio> {
    const [created] = await db.insert(aceleracionEjercicios).values(data).returning();
    return created;
  }

  async updateAceleracion(id: string, data: Partial<InsertAceleracionEjercicio>): Promise<AceleracionEjercicio | null> {
    const [updated] = await db.update(aceleracionEjercicios)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aceleracionEjercicios.id, id))
      .returning();
    return updated || null;
  }

  // Page styles for visual editor
  async getPageStyle(pageName: string, lang: string = 'es'): Promise<PageStyle | null> {
    const [style] = await db.select().from(pageStyles)
      .where(and(eq(pageStyles.pageName, pageName), eq(pageStyles.lang, lang)));
    if (style) return style;
    if (lang !== 'es') {
      const [fallback] = await db.select().from(pageStyles)
        .where(and(eq(pageStyles.pageName, pageName), eq(pageStyles.lang, 'es')));
      return fallback || null;
    }
    return null;
  }

  async savePageStyle(pageName: string, styles: string, lang: string = 'es'): Promise<PageStyle> {
    const [existing] = await db.select().from(pageStyles)
      .where(and(eq(pageStyles.pageName, pageName), eq(pageStyles.lang, lang)));
    if (existing) {
      const [updated] = await db.update(pageStyles)
        .set({ styles, updatedAt: new Date() })
        .where(and(eq(pageStyles.pageName, pageName), eq(pageStyles.lang, lang)))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(pageStyles).values({ pageName, styles, lang }).returning();
      return created;
    }
  }

  async getAllPageStyles(): Promise<PageStyle[]> {
    return db.select().from(pageStyles);
  }

  // Training results
  async saveTrainingResult(result: InsertTrainingResult): Promise<TrainingResult> {
    const [created] = await db.insert(trainingResults).values(result).returning();
    return created;
  }

  async getTrainingResults(sessionId?: string, categoria?: string): Promise<TrainingResult[]> {
    let query = db.select().from(trainingResults).orderBy(desc(trainingResults.createdAt));
    
    if (sessionId && categoria) {
      return db.select().from(trainingResults)
        .where(and(eq(trainingResults.sessionId, sessionId), eq(trainingResults.categoria, categoria)))
        .orderBy(desc(trainingResults.createdAt));
    } else if (sessionId) {
      return db.select().from(trainingResults)
        .where(eq(trainingResults.sessionId, sessionId))
        .orderBy(desc(trainingResults.createdAt));
    } else if (categoria) {
      return db.select().from(trainingResults)
        .where(eq(trainingResults.categoria, categoria))
        .orderBy(desc(trainingResults.createdAt));
    }
    
    return db.select().from(trainingResults).orderBy(desc(trainingResults.createdAt));
  }

  async getTrainingStats(sessionId?: string, categoria?: string): Promise<any> {
    const results = await this.getTrainingResults(sessionId, categoria);
    
    const stats = {
      totalSessions: results.length,
      byType: {} as Record<string, { count: number; avgScore: number; bestScore: number }>,
      recentActivity: results.slice(0, 10),
      dailyActivity: {} as Record<string, number>
    };
    
    for (const r of results) {
      const type = r.tipoEjercicio;
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, avgScore: 0, bestScore: 0 };
      }
      stats.byType[type].count++;
      stats.byType[type].avgScore += r.puntaje || 0;
      stats.byType[type].bestScore = Math.max(stats.byType[type].bestScore, r.puntaje || 0);
      
      // Daily activity
      if (r.createdAt) {
        const day = new Date(r.createdAt).toISOString().split('T')[0];
        stats.dailyActivity[day] = (stats.dailyActivity[day] || 0) + 1;
      }
    }
    
    // Calculate averages
    for (const type of Object.keys(stats.byType)) {
      stats.byType[type].avgScore = Math.round(stats.byType[type].avgScore / stats.byType[type].count);
    }
    
    return stats;
  }

  async getInstituciones(pais?: string, estado?: string, tipo?: string): Promise<Institucion[]> {
    const conditions = [];
    if (pais) conditions.push(eq(instituciones.pais, pais));
    if (estado) conditions.push(eq(instituciones.estado, estado));
    if (tipo) conditions.push(eq(instituciones.tipo, tipo));
    if (conditions.length > 0) {
      return db.select().from(instituciones).where(and(...conditions));
    }
    return db.select().from(instituciones);
  }

  async saveInstitucion(inst: InsertInstitucion): Promise<Institucion> {
    const [result] = await db.insert(instituciones).values(inst).returning();
    return result;
  }

  async deleteInstitucion(id: string): Promise<void> {
    await db.delete(instituciones).where(eq(instituciones.id, id));
  }

  async getBlogCategories(): Promise<BlogCategory[]> {
    return db.select().from(blogCategories).orderBy(blogCategories.orden);
  }

  async saveBlogCategory(cat: InsertBlogCategory): Promise<BlogCategory> {
    const [result] = await db.insert(blogCategories).values(cat).returning();
    return result;
  }

  async updateBlogCategory(id: string, data: Partial<InsertBlogCategory>): Promise<BlogCategory | null> {
    const [result] = await db.update(blogCategories).set(data).where(eq(blogCategories.id, id)).returning();
    return result || null;
  }

  async deleteBlogCategory(id: string): Promise<void> {
    await db.delete(blogCategories).where(eq(blogCategories.id, id));
  }

  async getBlogPosts(categoriaId?: string, estado?: string, page: number = 1, limit: number = 10, search?: string): Promise<{ posts: BlogPost[]; total: number }> {
    const conditions = [];
    if (categoriaId) conditions.push(eq(blogPosts.categoriaId, categoriaId));
    if (estado) conditions.push(eq(blogPosts.estado, estado));
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(or(ilike(blogPosts.titulo, searchPattern), ilike(blogPosts.descripcion, searchPattern))!);
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [countResult] = await db.select({ value: count() }).from(blogPosts).where(whereClause);
    const total = countResult?.value || 0;
    
    const offset = (page - 1) * limit;
    let posts: BlogPost[];
    if (whereClause) {
      posts = await db.select().from(blogPosts).where(whereClause).orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset);
    } else {
      posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset);
    }
    return { posts, total };
  }

  async getBlogPost(id: string): Promise<BlogPost | null> {
    const [result] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return result || null;
  }

  async saveBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [result] = await db.insert(blogPosts).values(post).returning();
    return result;
  }

  async updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost | null> {
    const [result] = await db.update(blogPosts).set({ ...data, updatedAt: new Date() }).where(eq(blogPosts.id, id)).returning();
    return result || null;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }
}

export const storage = new DatabaseStorage();
