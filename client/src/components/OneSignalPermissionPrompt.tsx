import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void | Promise<void>>;
  }
}

const DISMISSED_KEY = "iqex-onesignal-permission-dismissed";

function getNativePermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export function OneSignalPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permission, setPermission] = useState<string>(() => getNativePermission());

  useEffect(() => {
    if (permission !== "default") return;
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;
    const timer = window.setTimeout(() => setVisible(true), 4500);
    return () => window.clearTimeout(timer);
  }, [permission]);

  const requestPermission = async () => {
    setBusy(true);
    const requestWithOneSignal = async (OneSignal: any) => {
      if (OneSignal?.Notifications?.requestPermission) {
        await OneSignal.Notifications.requestPermission();
      } else if ("Notification" in window) {
        await Notification.requestPermission();
      }

      if (OneSignal?.User?.PushSubscription?.optIn) {
        await OneSignal.User.PushSubscription.optIn();
      }
    };

    try {
      const loadedOneSignal = (window as any).OneSignal;
      if (loadedOneSignal) {
        await requestWithOneSignal(loadedOneSignal);
        setPermission(getNativePermission());
        setVisible(false);
        setBusy(false);
        return;
      }

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          await requestWithOneSignal(OneSignal);
        } finally {
          setPermission(getNativePermission());
          setVisible(false);
          setBusy(false);
        }
      });
    } catch {
      setPermission(getNativePermission());
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
