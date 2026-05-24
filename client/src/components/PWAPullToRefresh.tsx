import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

const PULL_THRESHOLD = 82;
const MAX_PULL = 132;

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

async function refreshApp() {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration("/");
    if (registration) {
      await registration.update();
      if (registration.waiting) {
        registration.waiting.postMessage("skipWaiting");
        return;
      }
    }
  }

  window.location.reload();
}

export function PWAPullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);

  useEffect(() => {
    if (!isTouchDevice()) return;
    if (!isStandaloneMode()) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (refreshing) return;
      if (window.scrollY > 0) return;
      if (isEditableTarget(event.target)) return;

      startYRef.current = event.touches[0]?.clientY || 0;
      pullingRef.current = true;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!pullingRef.current || refreshing) return;
      if (window.scrollY > 0) {
        pullingRef.current = false;
        setPullDistance(0);
        return;
      }

      const currentY = event.touches[0]?.clientY || 0;
      const delta = currentY - startYRef.current;
      if (delta <= 0) {
        setPullDistance(0);
        return;
      }

      if (delta > 8) event.preventDefault();
      setPullDistance(Math.min(MAX_PULL, delta * 0.62));
    };

    const handleTouchEnd = () => {
      if (!pullingRef.current) return;
      const shouldRefresh = pullDistance >= PULL_THRESHOLD;
      pullingRef.current = false;

      if (!shouldRefresh) {
        setPullDistance(0);
        return;
      }

      setRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      refreshApp().catch(() => window.location.reload());
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [pullDistance, refreshing]);

  const visible = pullDistance > 4 || refreshing;
  const ready = pullDistance >= PULL_THRESHOLD || refreshing;
  const progress = Math.min(1, pullDistance / PULL_THRESHOLD);
  const standalone = typeof window !== "undefined" && isStandaloneMode();

  if (!standalone) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -64, scale: 0.96 }}
          animate={{ opacity: 1, y: Math.min(26, pullDistance * 0.18), scale: 1 }}
          exit={{ opacity: 0, y: -64, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="fixed inset-x-0 top-3 z-[80] flex justify-center pointer-events-none"
        >
          <div className="flex items-center gap-3 rounded-full border border-cyan-200/25 bg-slate-950/92 px-4 py-2 text-white shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-200">
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                style={!refreshing ? { transform: `rotate(${Math.round(progress * 180)}deg)` } : undefined}
              />
              <span
                className="absolute inset-0 rounded-full border border-cyan-300/40"
                style={{ transform: `scale(${0.72 + progress * 0.28})`, opacity: 0.3 + progress * 0.6 }}
              />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold">{refreshing ? "Actualizando..." : ready ? "Suelta para actualizar" : "Desliza para actualizar"}</p>
              <p className="text-[10px] text-white/50">Buscando la version mas reciente</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
