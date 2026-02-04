import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setShowInstall(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

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
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstall(false);
    localStorage.setItem("pwa-install-dismissed", "true");
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
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <div 
              className="bg-white rounded-2xl p-4 shadow-2xl border border-purple-100"
              style={{ boxShadow: "0 8px 32px rgba(124, 58, 237, 0.25)" }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
                >
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm">Instalar IQeXponencial</h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Accede más rápido desde tu pantalla de inicio
                  </p>
                </div>
                <button
                  onClick={handleDismissInstall}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleDismissInstall}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-200"
                >
                  Ahora no
                </Button>
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="flex-1 text-white"
                  style={{ background: "linear-gradient(135deg, #8a3ffc 0%, #06b6d4 100%)" }}
                >
                  Instalar
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
                  <h3 className="font-bold text-gray-800 text-sm">Nueva versión disponible</h3>
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
