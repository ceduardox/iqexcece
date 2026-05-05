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
  let ip = String(value || "").trim().toLowerCase();
  if (!ip) return "";
  if (ip.startsWith("[") && ip.includes("]")) {
    ip = ip.slice(1, ip.indexOf("]"));
  }
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  if (ip === "::1") return "127.0.0.1";
  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(ip)) {
    return ip.slice(0, ip.lastIndexOf(":"));
  }
  return ip;
}

function getHeaderIps(req: Request, headerName: string): string[] {
  const value = req.headers[headerName];
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : String(value);
  return raw.split(",").map((ip) => normalizeIp(ip)).filter(Boolean);
}

export function getClientIpCandidates(req: Request): string[] {
  const candidates = [
    ...getHeaderIps(req, "cf-connecting-ip"),
    ...getHeaderIps(req, "true-client-ip"),
    ...getHeaderIps(req, "x-real-ip"),
    ...getHeaderIps(req, "x-client-ip"),
    ...getHeaderIps(req, "x-forwarded-for"),
    normalizeIp(req.ip),
    normalizeIp(req.socket.remoteAddress),
  ].filter(Boolean);

  return Array.from(new Set(candidates));
}

export function getClientIp(req: Request): string {
  return getClientIpCandidates(req)[0] || "";
}

export function loadSiteAccessSettings(): SiteAccessSettings {
  try {
    if (!fs.existsSync(SITE_ACCESS_FILE)) return defaultSettings;
    const parsed = JSON.parse(fs.readFileSync(SITE_ACCESS_FILE, "utf-8"));
    return {
      enabled: false,
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
    enabled: false,
    allowedIps: Array.from(new Set(settings.allowedIps.map((ip) => normalizeIp(ip)).filter(Boolean))),
    updatedAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(SITE_ACCESS_FILE), { recursive: true });
  fs.writeFileSync(SITE_ACCESS_FILE, JSON.stringify(next, null, 2), "utf-8");
  return next;
}

export function siteAccessMiddleware(req: Request, res: Response, next: NextFunction) {
  return next();
}
