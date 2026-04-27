import type { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";

const SITE_ACCESS_FILE = path.join("/tmp", "site_access.json");

export type SiteAccessSettings = {
  enabled: boolean;
  allowedIps: string[];
  updatedAt?: string;
};

const defaultSettings: SiteAccessSettings = {
  enabled: false,
  allowedIps: [],
};

function normalizeIp(value: string | undefined | null): string {
  const ip = String(value || "").trim();
  if (!ip) return "";
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  if (ip === "::1") return "127.0.0.1";
  return ip;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"]?.toString().split(",")[0];
  const realIp = req.headers["x-real-ip"]?.toString();
  return normalizeIp(forwarded || realIp || req.socket.remoteAddress || req.ip || "");
}

export function loadSiteAccessSettings(): SiteAccessSettings {
  try {
    if (!fs.existsSync(SITE_ACCESS_FILE)) return defaultSettings;
    const parsed = JSON.parse(fs.readFileSync(SITE_ACCESS_FILE, "utf-8"));
    return {
      enabled: Boolean(parsed?.enabled),
      allowedIps: Array.isArray(parsed?.allowedIps)
        ? parsed.allowedIps.map((ip: unknown) => normalizeIp(String(ip))).filter(Boolean)
        : [],
      updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSiteAccessSettings(settings: SiteAccessSettings): SiteAccessSettings {
  const next: SiteAccessSettings = {
    enabled: Boolean(settings.enabled),
    allowedIps: Array.from(new Set(settings.allowedIps.map((ip) => normalizeIp(ip)).filter(Boolean))),
    updatedAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(SITE_ACCESS_FILE), { recursive: true });
  fs.writeFileSync(SITE_ACCESS_FILE, JSON.stringify(next, null, 2), "utf-8");
  return next;
}

export function siteAccessMiddleware(req: Request, res: Response, next: NextFunction) {
  const settings = loadSiteAccessSettings();
  if (!settings.enabled) return next();

  const clientIp = getClientIp(req);
  if (settings.allowedIps.includes(clientIp)) return next();

  return res.status(403).type("html").send("");
}
