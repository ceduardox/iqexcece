import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, RefreshCw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_DISMISSED_AT_KEY = "pwa-install-dismissed-at";
const INSTALL_SNOOZE_MS = 24 * 60 * 60 * 1000;

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

function isAndroidDevice() {
  return /Android/i.test(window.navigator.userAgent || "");
}

function canShowInstallBanner() {
  if (isStandaloneMode()) return false;
  if (!isAndroidDevice()) return false;

  const dismissedAt = Number(localStorage.getItem(INSTALL_DISMISSED_AT_KEY) || 0);
  if (!dismissedAt) return true;

  return Date.now() - dismissedAt > INSTALL_SNOOZE_MS;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    let installTimer: number | undefined;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      if (canShowInstallBanner()) {
        installTimer = window.setTimeout(() => {
          if (canShowInstallBanner()) setShowInstall(true);
        }, 3500);
      }
    };

    const handleAppInstalled = () => {
      localStorage.removeItem(INSTALL_DISMISSED_AT_KEY);
      setShowInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        setRegistration(reg);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    return () => {
      if (installTimer) window.clearTimeout(installTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstall(false);
      localStorage.removeItem(INSTALL_DISMISSED_AT_KEY);
    } else {
      localStorage.setItem(INSTALL_DISMISSED_AT_KEY, String(Date.now()));
    }
    setDeferredPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstall(false);
    localStorage.setItem(INSTALL_DISMISSED_AT_KEY, String(Date.now()));
  };

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage("skipWaiting");
    }
    setShowUpdate(false);
  };

  return (
    <>
      <AnimatePresence>
        {showInstall && (
          <motion.div
            initial={{ opacity: 0, y: 120, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 120, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed inset-x-3 bottom-4 z-[65] mx-auto max-w-md sm:bottom-6"
          >
            <div
              className="relative overflow-hidden rounded-2xl border border-cyan-200/25 bg-slate-950 text-white shadow-2xl"
              style={{ boxShadow: "0 18px 48px rgba(8, 145, 178, 0.32)" }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400" />
              <button
                onClick={handleDismissInstall}
                className="absolute right-2 top-2 rounded-full p-2 text-white/55 hover:bg-white/10 hover:text-white"
                aria-label="Cerrar banner de instalacion"
                data-testid="button-dismiss-pwa-install"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-3 p-4 pr-12">
                <div
                  className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white"
                  style={{ boxShadow: "0 10px 28px rgba(34, 211, 238, 0.22)" }}
                >
                  <img src="/iqxponencial-icon-192.png" alt="" className="h-10 w-10 rounded-xl object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-1.5 text-cyan-200">
                    <Smartphone className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">App Android</span>
                  </div>
                  <h3 className="text-base font-extrabold leading-tight">Instala IQeXponencial</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/66">
                    Abrela mas rapido desde tu pantalla de inicio y usala como una app.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 border-t border-white/10 bg-white/[0.03] p-3">
                <Button
                  onClick={handleDismissInstall}
                  variant="outline"
                  size="sm"
                  className="h-10 flex-1 border-white/15 bg-transparent text-white/75 hover:bg-white/10 hover:text-white"
                >
                  Ahora no
                </Button>
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="h-10 flex-1 bg-cyan-500 font-bold text-slate-950 hover:bg-cyan-300"
                  data-testid="button-install-pwa"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar app
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpdate && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-4 right-4 z-50"
          >
            <div
              className="bg-white rounded-2xl p-4 shadow-2xl border border-cyan-100"
              style={{ boxShadow: "0 8px 32px rgba(6, 182, 212, 0.25)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #06b6d4 0%, #8a3ffc 100%)" }}
                >
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm">Nueva version disponible</h3>
                  <p className="text-gray-500 text-xs">Actualiza para obtener las mejoras</p>
                </div>
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="text-white"
                  style={{ background: "linear-gradient(135deg, #06b6d4 0%, #8a3ffc 100%)" }}
                >
                  Actualizar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
