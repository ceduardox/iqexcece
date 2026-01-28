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
  categoria: text("categoria").notNull(),
  temaNumero: integer("tema_numero").default(1),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  pageMainImage: text("page_main_image"),
  pageSmallImage: text("page_small_image"),
  categoryImage: text("category_image"),
  questions: text("questions").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Razonamiento content table
export const razonamientoContents = pgTable("razonamiento_contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoria: text("categoria").notNull(),
  temaNumero: integer("tema_numero").default(1),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  imageSize: integer("image_size").default(100),
  questions: text("questions").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cerebral test content table
export const cerebralContents = pgTable("cerebral_contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoria: text("categoria").notNull(),
  temaNumero: integer("tema_numero").default(1),
  title: text("title").notNull(),
  exerciseType: text("exercise_type").notNull(), // "bailarina", "secuencia", "memoria", etc.
  imageUrl: text("image_url"),
  imageSize: integer("image_size").default(100),
  exerciseData: text("exercise_data").notNull(), // JSON string with exercise-specific data
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cerebral intro screen configuration
export const cerebralIntros = pgTable("cerebral_intros", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoria: text("categoria").notNull().unique(),
  imageUrl: text("image_url"),
  title: text("title").default("¿Cuál lado de tu cerebro es más dominante?"),
  subtitle: text("subtitle").default("El test tiene una duración de 30 segundos."),
  buttonText: text("button_text").default("Empezar"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({ id: true, createdAt: true });
export const insertReadingContentSchema = createInsertSchema(readingContents).omit({ id: true, updatedAt: true });
export const insertRazonamientoContentSchema = createInsertSchema(razonamientoContents).omit({ id: true, updatedAt: true });
export const insertCerebralContentSchema = createInsertSchema(cerebralContents).omit({ id: true, updatedAt: true });
export const insertCerebralIntroSchema = createInsertSchema(cerebralIntros).omit({ id: true, updatedAt: true });

// Cerebral results table
export const cerebralResults = pgTable("cerebral_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  email: text("email"),
  edad: text("edad"),
  ciudad: text("ciudad"),
  telefono: text("telefono"),
  comentario: text("comentario"),
  categoria: text("categoria").notNull(),
  lateralidadData: text("lateralidad_data"), // JSON string of answers
  preferenciaData: text("preferencia_data"), // JSON string of answers
  leftPercent: integer("left_percent"),
  rightPercent: integer("right_percent"),
  dominantSide: text("dominant_side"),
  personalityTraits: text("personality_traits"), // JSON array of traits
  isPwa: boolean("is_pwa").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCerebralResultSchema = createInsertSchema(cerebralResults).omit({ id: true, createdAt: true });

// Uploaded images table
export const uploadedImages = pgTable("uploaded_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  data: text("data").notNull(), // base64 data
  originalSize: integer("original_size"),
  compressedSize: integer("compressed_size"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUploadedImageSchema = createInsertSchema(uploadedImages).omit({ id: true, createdAt: true });

// Entrenamiento card (for main selection page)
export const entrenamientoCards = pgTable("entrenamiento_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoria: text("categoria").notNull().unique(),
  imageUrl: text("image_url"),
  title: text("title").default("Entrenamiento"),
  description: text("description").default("Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas"),
  buttonText: text("button_text").default("Comenzar"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Entrenamiento page config (banner and title)
export const entrenamientoPages = pgTable("entrenamiento_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoria: text("categoria").notNull().unique(),
  bannerText: text("banner_text").default("¡Disfruta ahora de ejercicios de entrenamiento gratuitos por tiempo limitado!"),
  pageTitle: text("page_title").default("Entrenamientos"),
  pageDescription: text("page_description").default("Mejora tu velocidad de percepción visual y fortalece tus habilidades cognitivas"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Entrenamiento items (list of training options)
export const entrenamientoItems = pgTable("entrenamiento_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoria: text("categoria").notNull(),
  imageUrl: text("image_url"),
  title: text("title").notNull(),
  description: text("description"),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEntrenamientoCardSchema = createInsertSchema(entrenamientoCards).omit({ id: true, updatedAt: true });
export const insertEntrenamientoPageSchema = createInsertSchema(entrenamientoPages).omit({ id: true, updatedAt: true });
export const insertEntrenamientoItemSchema = createInsertSchema(entrenamientoItems).omit({ id: true, updatedAt: true });

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type ReadingContent = typeof readingContents.$inferSelect;
export type InsertReadingContent = z.infer<typeof insertReadingContentSchema>;
export type RazonamientoContent = typeof razonamientoContents.$inferSelect;
export type InsertRazonamientoContent = z.infer<typeof insertRazonamientoContentSchema>;
export type CerebralContent = typeof cerebralContents.$inferSelect;
export type InsertCerebralContent = z.infer<typeof insertCerebralContentSchema>;
export type CerebralResult = typeof cerebralResults.$inferSelect;
export type InsertCerebralResult = z.infer<typeof insertCerebralResultSchema>;
export type UploadedImage = typeof uploadedImages.$inferSelect;
export type InsertUploadedImage = z.infer<typeof insertUploadedImageSchema>;
export type EntrenamientoCard = typeof entrenamientoCards.$inferSelect;
export type InsertEntrenamientoCard = z.infer<typeof insertEntrenamientoCardSchema>;
export type EntrenamientoPage = typeof entrenamientoPages.$inferSelect;
export type InsertEntrenamientoPage = z.infer<typeof insertEntrenamientoPageSchema>;
export type EntrenamientoItem = typeof entrenamientoItems.$inferSelect;
export type InsertEntrenamientoItem = z.infer<typeof insertEntrenamientoItemSchema>;
