import { type User, type InsertUser, type UserSession, type InsertUserSession, type QuizResult, type InsertQuizResult, type ReadingContent, type InsertReadingContent } from "@shared/schema";
import { randomUUID } from "crypto";

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
      questions: insertContent.questions,
      updatedAt: new Date(),
    };
    this.readingContents.set(insertContent.categoria, content);
    return content;
  }
}

export const storage = new MemStorage();
