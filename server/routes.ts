import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { UAParser } from "ua-parser-js";

const ADMIN_USER = "CITEX";
const ADMIN_PASS = "GESTORCITEXBO2014";
const ADMIN_TOKEN_SECRET = "iq-admin-secret-" + Math.random().toString(36).substring(2);
let validAdminTokens = new Set<string>();

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
    const content = await storage.getReadingContent(req.params.categoria);
    res.json({ content });
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
