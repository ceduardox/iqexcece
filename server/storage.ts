import { type User, type InsertUser, type UserSession, type InsertUserSession, type QuizResult, type InsertQuizResult, type ReadingContent, type InsertReadingContent, users, userSessions, quizResults, readingContents } from "@shared/schema";
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
  getReadingContent(categoria: string): Promise<ReadingContent | undefined>;
  saveReadingContent(content: InsertReadingContent): Promise<ReadingContent>;
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

  async getReadingContent(categoria: string): Promise<ReadingContent | undefined> {
    return this.readingContents.get(categoria);
  }

  async saveReadingContent(insertContent: InsertReadingContent): Promise<ReadingContent> {
    const existing = this.readingContents.get(insertContent.categoria);
    const content: ReadingContent = {
      id: existing?.id || randomUUID(),
      categoria: insertContent.categoria,
      title: insertContent.title,
      content: insertContent.content,
      imageUrl: insertContent.imageUrl || null,
      pageMainImage: insertContent.pageMainImage || null,
      pageSmallImage: insertContent.pageSmallImage || null,
      questions: insertContent.questions,
      updatedAt: new Date(),
    };
    this.readingContents.set(insertContent.categoria, content);
    return content;
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

  async getReadingContent(categoria: string): Promise<ReadingContent | undefined> {
    const [content] = await db.select().from(readingContents).where(eq(readingContents.categoria, categoria));
    return content;
  }

  async saveReadingContent(insertContent: InsertReadingContent): Promise<ReadingContent> {
    const existing = await this.getReadingContent(insertContent.categoria);
    
    if (existing) {
      const [updated] = await db.update(readingContents)
        .set({
          title: insertContent.title,
          content: insertContent.content,
          imageUrl: insertContent.imageUrl || null,
          pageMainImage: insertContent.pageMainImage || null,
          pageSmallImage: insertContent.pageSmallImage || null,
          questions: insertContent.questions,
          updatedAt: new Date(),
        })
        .where(eq(readingContents.categoria, insertContent.categoria))
        .returning();
      return updated;
    }

    const [created] = await db.insert(readingContents).values({
      categoria: insertContent.categoria,
      title: insertContent.title,
      content: insertContent.content,
      imageUrl: insertContent.imageUrl || null,
      pageMainImage: insertContent.pageMainImage || null,
      pageSmallImage: insertContent.pageSmallImage || null,
      questions: insertContent.questions,
    }).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
