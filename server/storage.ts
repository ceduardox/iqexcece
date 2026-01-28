import { type User, type InsertUser, type UserSession, type InsertUserSession, type QuizResult, type InsertQuizResult, type ReadingContent, type InsertReadingContent, type RazonamientoContent, type InsertRazonamientoContent, type CerebralContent, type InsertCerebralContent, type CerebralResult, type InsertCerebralResult, users, userSessions, quizResults, readingContents, razonamientoContents, cerebralContents, cerebralIntros, cerebralResults, uploadedImages } from "@shared/schema";

type CerebralIntro = typeof cerebralIntros.$inferSelect;
type InsertCerebralIntro = typeof cerebralIntros.$inferInsert;
import { randomUUID } from "crypto";
import { eq, desc, and, gt } from "drizzle-orm";
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
      tiempoLectura: insertResult.tiempoLectura || null,
      tiempoCuestionario: insertResult.tiempoCuestionario || null,
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
      tiempoLectura: insertResult.tiempoLectura || null,
      tiempoCuestionario: insertResult.tiempoCuestionario || null,
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
}

export const storage = new DatabaseStorage();
