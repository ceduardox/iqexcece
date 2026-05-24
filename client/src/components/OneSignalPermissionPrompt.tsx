import { useEffect, useState } from "react";
import { AlertCircle, Bell, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void | Promise<void>>;
  }
}

const DISMISSED_KEY = "iqex-onesignal-permission-dismissed";

type OneSignalState = {
  notificationPermission: string;
  onesignalId: string | null;
  subscriptionId: string | null;
  optedIn: boolean | null;
};

function getNativePermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function readOneSignalState(OneSignal: any): OneSignalState {
  return {
    notificationPermission: getNativePermission(),
    onesignalId: OneSignal?.User?.onesignalId || null,
    subscriptionId: OneSignal?.User?.PushSubscription?.id || null,
    optedIn: typeof OneSignal?.User?.PushSubscription?.optedIn === "boolean"
      ? OneSignal.User.PushSubscription.optedIn
      : null,
  };
}

function logOneSignalState(label: string, OneSignal: any) {
  const state = readOneSignalState(OneSignal);
  console.info(`[onesignal-client] ${label}`, state);
  return state;
}

export function OneSignalPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permission, setPermission] = useState<string>(() => getNativePermission());
  const [status, setStatus] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

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
        if (initialState.notificationPermission === "granted" && !initialState.subscriptionId) {
          console.info("[onesignal-client] permission already granted, forcing optIn");
          await OneSignal.User.PushSubscription.optIn();
          const nextState = logOneSignalState("after automatic optIn", OneSignal);
          if (!nextState.subscriptionId) {
            setStatus("Permiso aceptado, pero OneSignal todavia no registro este dispositivo.");
            setDebugInfo(JSON.stringify(nextState, null, 2));
            setVisible(true);
          }
        }
      } catch (error: any) {
        console.error("[onesignal-client] init diagnostics failed", error);
      }
    });
  }, []);

  useEffect(() => {
    if (permission !== "default") return;
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;
    const timer = window.setTimeout(() => setVisible(true), 4500);
    return () => window.clearTimeout(timer);
  }, [permission]);

  const requestPermission = async () => {
    setBusy(true);
    setStatus("Abriendo permiso de notificaciones...");
    setDebugInfo("");
    const requestWithOneSignal = async (OneSignal: any) => {
      if (OneSignal?.Notifications?.requestPermission) {
        await OneSignal.Notifications.requestPermission();
      } else if ("Notification" in window) {
        await Notification.requestPermission();
      }

      if (OneSignal?.User?.PushSubscription?.optIn) {
        await OneSignal.User.PushSubscription.optIn();
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      return logOneSignalState("after manual permission", OneSignal);
    };

    try {
      const loadedOneSignal = (window as any).OneSignal;
      if (loadedOneSignal) {
        const state = await requestWithOneSignal(loadedOneSignal);
        const nextPermission = getNativePermission();
        setPermission(nextPermission);
        if (state?.subscriptionId) {
          setStatus("Dispositivo registrado para notificaciones.");
          setDebugInfo(JSON.stringify(state, null, 2));
          window.setTimeout(() => setVisible(false), 1400);
        } else {
          setStatus("Permiso aceptado, pero OneSignal no devolvio subscriptionId.");
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
          if (state?.subscriptionId) {
            setStatus("Dispositivo registrado para notificaciones.");
            setDebugInfo(JSON.stringify(state, null, 2));
            window.setTimeout(() => setVisible(false), 1400);
          } else {
            setStatus("Permiso aceptado, pero OneSignal no devolvio subscriptionId.");
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
    localStorage.setItem(DISMISSED_KEY, "true");
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
          {busy ? "Abriendo..." : "Permitir"}
        </Button>
      </div>
    </div>
  );
}
