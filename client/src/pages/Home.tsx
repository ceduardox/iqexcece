import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SelectionScreen } from "@/components/SelectionScreen";
import { Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionTracking } from "@/hooks/use-session";

type AppState = "loading" | "selection" | "complete";

interface UserSelection {
  ageGroup: string;
  ageLabel: string;
  problems: string[];
  problemTitles: string[];
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [selection, setSelection] = useState<UserSelection | null>(null);
  
  const { updateSession } = useSessionTracking(selection?.ageGroup, selection?.problems);

  const handleLoadingComplete = useCallback(() => {
    setAppState("selection");
  }, []);

  const handleSelectionComplete = useCallback((userSelection: UserSelection) => {
    setSelection(userSelection);
    setAppState("complete");
    updateSession({ ageGroup: userSelection.ageGroup, selectedProblems: userSelection.problems });
  }, [updateSession]);

  const handleRestart = useCallback(() => {
    setAppState("loading");
    setSelection(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {appState === "loading" && (
          <LoadingScreen 
            key="loading" 
            onComplete={handleLoadingComplete} 
            duration={3500}
          />
        )}

        {appState === "selection" && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SelectionScreen onComplete={handleSelectionComplete} />
          </motion.div>
        )}

        {appState === "complete" && selection && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-background flex items-center justify-center p-4"
            data-testid="complete-screen"
          >
            <div className="max-w-md w-full text-center space-y-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mx-auto w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="w-10 h-10 text-accent" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Perfecto!
                </h1>
                <p className="text-muted-foreground">
                  Hemos registrado tus preferencias
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-card/50 rounded-xl p-6 border border-border/50 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="text-foreground">
                    Grupo: <span className="text-accent font-semibold">{selection.ageLabel}</span>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-secondary mt-0.5" />
                  <div className="text-left">
                    <span className="text-foreground">Desafios seleccionados:</span>
                    <ul className="mt-2 space-y-1">
                      {selection.problemTitles.map((title, idx) => (
                        <li key={idx} className="text-secondary text-sm">
                          {title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  data-testid="button-restart"
                >
                  Volver a empezar
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
