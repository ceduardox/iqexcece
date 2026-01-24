import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  device: text("device"),
  browser: text("browser"),
  isPwa: boolean("is_pwa").default(false),
  ageGroup: text("age_group"),
  selectedProblems: text("selected_problems").array(),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

// Quiz results table
export const quizResults = pgTable("quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  email: text("email"),
  edad: text("edad"),
  ciudad: text("ciudad"),
  telefono: text("telefono"),
  comentario: text("comentario"),
  categoria: text("categoria").default("preescolar"),
  tiempoLectura: integer("tiempo_lectura"),
  tiempoCuestionario: integer("tiempo_cuestionario"),
  isPwa: boolean("is_pwa").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reading content table
export const readingContents = pgTable("reading_contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoria: text("categoria").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  pageMainImage: text("page_main_image"),
  pageSmallImage: text("page_small_image"),
  categoryImage: text("category_image"), // Image for category selection card
  questions: text("questions").notNull(), // JSON string
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({ id: true, createdAt: true });
export const insertReadingContentSchema = createInsertSchema(readingContents).omit({ id: true, updatedAt: true });

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type ReadingContent = typeof readingContents.$inferSelect;
export type InsertReadingContent = z.infer<typeof insertReadingContentSchema>;
