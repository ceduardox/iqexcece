import { useEffect, useRef, useState } from "react";
import { AlertCircle, Bell, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void | Promise<void>>;
  }
}

const DISMISSED_KEY = "iqex-onesignal-permission-dismissed";
const SESSION_DISMISSED_KEY = "iqex-onesignal-permission-dismissed-session";
const REPAIR_COOLDOWN_MS = 10 * 60 * 1000;

type OneSignalState = {
  notificationPermission: string;
  secureContext: boolean;
  serviceWorkerSupported: boolean;
  origin: string;
  onesignalId: string | null;
  subscriptionId: string | null;
  optedIn: boolean | null;
};

function getNativePermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

function canShowNotificationPrompt() {
  return isStandaloneMode();
}

function readOneSignalState(OneSignal: any): OneSignalState {
  return {
    notificationPermission: getNativePermission(),
    secureContext: window.isSecureContext,
    serviceWorkerSupported: "serviceWorker" in navigator,
    origin: window.location.origin,
    onesignalId: OneSignal?.User?.onesignalId || null,
    subscriptionId: OneSignal?.User?.PushSubscription?.id || null,
    optedIn: typeof OneSignal?.User?.PushSubscription?.optedIn === "boolean"
      ? OneSignal.User.PushSubscription.optedIn
      : null,
  };
}

function hasHealthyPushSubscription(state: OneSignalState) {
  return Boolean(state.subscriptionId) && state.optedIn === true;
}

function logOneSignalState(label: string, OneSignal: any) {
  const state = readOneSignalState(OneSignal);
  console.info(`[onesignal-client] ${label}`, state);
  return state;
}

async function waitForOneSignalRegistration(OneSignal: any, timeoutMs = 18000) {
  const startedAt = Date.now();
  let state = logOneSignalState("waiting for subscription", OneSignal);

  while (!hasHealthyPushSubscription(state) && Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    state = logOneSignalState("subscription poll", OneSignal);
  }

  return state;
}

function getUnregisteredStatus(permission: string) {
  if (permission === "denied") {
    return "Las notificaciones estan bloqueadas. Activalas desde los permisos de la app o del navegador para recibir avisos.";
  }

  if (permission === "default") {
    return "Activa las notificaciones para recibir novedades, recordatorios y comunicados importantes.";
  }

  return "Permiso aceptado, pero OneSignal no devolvio subscriptionId.";
}

export function OneSignalPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permission, setPermission] = useState<string>(() => getNativePermission());
  const [status, setStatus] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const repairingRef = useRef(false);
  const lastRepairAttemptRef = useRef(0);

  const repairGrantedSubscription = async (OneSignal: any, showFeedback = canShowNotificationPrompt(), force = false) => {
    if (repairingRef.current) return readOneSignalState(OneSignal);

    const currentState = logOneSignalState("repair check", OneSignal);
    setPermission(currentState.notificationPermission);
    if (currentState.notificationPermission !== "granted" || hasHealthyPushSubscription(currentState)) {
      return currentState;
    }

    const now = Date.now();
    if (!force && now - lastRepairAttemptRef.current < REPAIR_COOLDOWN_MS) {
      return currentState;
    }
    lastRepairAttemptRef.current = now;
    repairingRef.current = true;
    if (showFeedback) {
      setStatus("Registrando este dispositivo en OneSignal...");
      setVisible(true);
    }

    try {
      await OneSignal?.User?.PushSubscription?.optIn?.();
      const nextState = await waitForOneSignalRegistration(OneSignal);
      setPermission(nextState.notificationPermission);

      if (hasHealthyPushSubscription(nextState)) {
        if (showFeedback) {
          setStatus("Dispositivo registrado para notificaciones.");
          setDebugInfo(JSON.stringify(nextState, null, 2));
          window.setTimeout(() => setVisible(false), 1400);
        }
      } else if (showFeedback) {
        setStatus(getUnregisteredStatus(nextState.notificationPermission));
        setDebugInfo(JSON.stringify(nextState, null, 2));
        setVisible(true);
      }

      return nextState;
    } finally {
      repairingRef.current = false;
    }
  };

  useEffect(() => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        OneSignal?.Debug?.setLogLevel?.("debug");
        OneSignal?.User?.addEventListener?.("change", (event: unknown) => {
          console.info("[onesignal-client] user change", event, readOneSignalState(OneSignal));
        });
        OneSignal?.User?.PushSubscription?.addEventListener?.("change", (event: unknown) => {
          console.info("[onesignal-client] push subscription change", event, readOneSignalState(OneSignal));
        });

        const initialState = logOneSignalState("ready", OneSignal);
        if (initialState.notificationPermission === "granted" && !hasHealthyPushSubscription(initialState)) {
          console.info("[onesignal-client] permission already granted, repairing optIn");
          await repairGrantedSubscription(OneSignal, canShowNotificationPrompt(), true);
        } else if (initialState.notificationPermission === "denied" && canShowNotificationPrompt() && !sessionStorage.getItem(SESSION_DISMISSED_KEY)) {
          setStatus(getUnregisteredStatus("denied"));
          setDebugInfo(JSON.stringify(initialState, null, 2));
          setVisible(true);
        }
      } catch (error: any) {
        console.error("[onesignal-client] init diagnostics failed", error);
      }
    });
  }, []);

  useEffect(() => {
    const repairIfNeeded = () => {
      const loadedOneSignal = (window as any).OneSignal;
      if (!loadedOneSignal) return;
      if (getNativePermission() === "granted") {
        void repairGrantedSubscription(loadedOneSignal, canShowNotificationPrompt());
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") repairIfNeeded();
    };

    window.addEventListener("focus", repairIfNeeded);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", repairIfNeeded);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (permission === "granted" || permission === "unsupported") return;
    if (sessionStorage.getItem(SESSION_DISMISSED_KEY) === "true") return;
    if (!canShowNotificationPrompt()) return;

    localStorage.removeItem(DISMISSED_KEY);
    const timer = window.setTimeout(() => setVisible(true), 4500);
    return () => window.clearTimeout(timer);
  }, [permission]);

  const requestPermission = async () => {
    setBusy(true);
    setStatus("Abriendo permiso de notificaciones...");
    setDebugInfo("");
    const requestWithOneSignal = async (OneSignal: any) => {
      if (!window.isSecureContext) {
        const state = readOneSignalState(OneSignal);
        setStatus("OneSignal necesita HTTPS para registrar este dispositivo. Abre la app desde el dominio seguro, no desde IP con http.");
        setDebugInfo(JSON.stringify(state, null, 2));
        return state;
      }

      if (!("serviceWorker" in navigator)) {
        const state = readOneSignalState(OneSignal);
        setStatus("Este navegador no tiene service worker disponible para Web Push.");
        setDebugInfo(JSON.stringify(state, null, 2));
        return state;
      }

      if (OneSignal?.Notifications?.requestPermission) {
        await OneSignal.Notifications.requestPermission({ fallbackToSettings: true });
      } else if ("Notification" in window) {
        await Notification.requestPermission();
      }

      if (OneSignal?.User?.PushSubscription?.optIn) {
        await OneSignal.User.PushSubscription.optIn();
      }

      setStatus("Registrando este dispositivo en OneSignal...");
      return waitForOneSignalRegistration(OneSignal);
    };

    try {
      const loadedOneSignal = (window as any).OneSignal;
      if (loadedOneSignal) {
        const state = await requestWithOneSignal(loadedOneSignal);
        const nextPermission = getNativePermission();
        setPermission(nextPermission);
        if (state && hasHealthyPushSubscription(state)) {
          setStatus("Dispositivo registrado para notificaciones.");
          setDebugInfo(JSON.stringify(state, null, 2));
          window.setTimeout(() => setVisible(false), 1400);
        } else if (!state?.secureContext) {
          setStatus("OneSignal necesita HTTPS para registrar este dispositivo. Abre la app desde el dominio seguro, no desde IP con http.");
          setDebugInfo(JSON.stringify(state || { notificationPermission: nextPermission }, null, 2));
        } else {
          setStatus(getUnregisteredStatus(nextPermission));
          setDebugInfo(JSON.stringify(state || { notificationPermission: nextPermission }, null, 2));
          setVisible(true);
        }
        setBusy(false);
        return;
      }

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          const state = await requestWithOneSignal(OneSignal);
          const nextPermission = getNativePermission();
          setPermission(nextPermission);
          if (state && hasHealthyPushSubscription(state)) {
            setStatus("Dispositivo registrado para notificaciones.");
            setDebugInfo(JSON.stringify(state, null, 2));
            window.setTimeout(() => setVisible(false), 1400);
          } else if (!state?.secureContext) {
            setStatus("OneSignal necesita HTTPS para registrar este dispositivo. Abre la app desde el dominio seguro, no desde IP con http.");
            setDebugInfo(JSON.stringify(state || { notificationPermission: nextPermission }, null, 2));
          } else {
            setStatus(getUnregisteredStatus(nextPermission));
            setDebugInfo(JSON.stringify(state || { notificationPermission: nextPermission }, null, 2));
            setVisible(true);
          }
        } finally {
          setBusy(false);
        }
      });
    } catch (error: any) {
      setPermission(getNativePermission());
      setStatus("No se pudo registrar el dispositivo en OneSignal.");
      setDebugInfo(JSON.stringify({ error: error?.message || String(error), permission: getNativePermission() }, null, 2));
      setVisible(true);
      setBusy(false);
    }
  };

  const dismiss = () => {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, "true");
    localStorage.removeItem(DISMISSED_KEY);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed left-4 right-4 bottom-4 z-[70] mx-auto max-w-md rounded-lg border border-cyan-200/30 bg-slate-950/95 p-4 text-white shadow-2xl shadow-cyan-950/40">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-200">
          <Bell className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Recibir notificaciones</p>
          <p className="mt-1 text-xs text-white/65">
            Activa avisos de IQeXponencial para novedades, recordatorios y comunicados importantes.
          </p>
          {status && (
            <div className="mt-2 rounded-md border border-white/10 bg-white/5 p-2">
              <div className="flex items-start gap-2 text-xs text-white/75">
                {debugInfo.includes("subscriptionId") && !debugInfo.includes('"subscriptionId": null')
                  ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  : <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />}
                <span>{status}</span>
              </div>
              {debugInfo && (
                <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-black/30 p-2 text-[10px] leading-relaxed text-white/55">
                  {debugInfo}
                </pre>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1 text-white/45 hover:bg-white/10 hover:text-white"
          aria-label="Cerrar solicitud de notificaciones"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={dismiss} className="border-white/15 text-white/75">
          Ahora no
        </Button>
        <Button type="button" size="sm" onClick={requestPermission} disabled={busy} className="bg-cyan-600 hover:bg-cyan-500">
          {busy ? "Abriendo..." : permission === "denied" ? "Activar" : "Permitir"}
        </Button>
      </div>
    </div>
  );
}
