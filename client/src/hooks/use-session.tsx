import { useEffect, useRef } from "react";

const SESSION_KEY = "iq_session_id";

function generateSessionId(): string {
  return "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getSessionId(): string {
  // Check localStorage first (persists across sessions), then sessionStorage
  let sessionId = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
  }
  // Store in both for compatibility
  localStorage.setItem(SESSION_KEY, sessionId);
  sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

function isPwa(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://");
}

export function useSessionTracking(ageGroup?: string | null, selectedProblems?: string[]) {
  const sessionId = useRef(getSessionId());
  const started = useRef(false);

  useEffect(() => {
    const startSession = async () => {
      if (started.current) return;
      started.current = true;

      try {
        await fetch("/api/session/start", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-PWA": isPwa() ? "true" : "false"
          },
          body: JSON.stringify({
            sessionId: sessionId.current,
            ageGroup,
            selectedProblems,
          }),
        });
      } catch (e) {
        console.error("Failed to start session", e);
      }
    };

    startSession();

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(async () => {
      try {
        await fetch("/api/session/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId.current }),
        });
      } catch (e) {}
    }, 30000);

    // End session on page unload
    const handleUnload = () => {
      navigator.sendBeacon(
        "/api/session/end",
        JSON.stringify({ sessionId: sessionId.current })
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [ageGroup, selectedProblems]);

  const updateSession = async (data: { ageGroup?: string; selectedProblems?: string[] }) => {
    try {
      await fetch("/api/session/start", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-PWA": isPwa() ? "true" : "false"
        },
        body: JSON.stringify({
          sessionId: sessionId.current,
          ...data,
        }),
      });
    } catch (e) {}
  };

  return { sessionId: sessionId.current, updateSession };
}
