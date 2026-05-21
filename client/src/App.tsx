import { Switch, Route } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/lib/user-context";
import { usePreloadAssets } from "@/hooks/use-preload";
import { waitForRenderedImages } from "@/lib/image-preload";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import "@/lib/i18n";
import Home from "@/pages/Home";

const loadTestsPage = () => import("@/pages/TestsPage");
const loadEntrenamientoSelectionPage = () => import("@/pages/EntrenamientoSelectionPage");
const loadProgresoPage = () => import("@/pages/ProgresoPage");

const TestsPage = lazy(loadTestsPage);
const ReadingSelectionPage = lazy(() => import("@/pages/ReadingSelectionPage"));
const ReadingContentPage = lazy(() => import("@/pages/ReadingContentPage"));
const AdolescentePage = lazy(() => import("@/pages/AdolescentePage"));
const AdolescenteReadingPage = lazy(() => import("@/pages/AdolescenteReadingPage"));
const GestionPage = lazy(() => import("@/pages/GestionPage"));
const RazonamientoSelectionPage = lazy(() => import("@/pages/RazonamientoSelectionPage"));
const RazonamientoQuizPage = lazy(() => import("@/pages/RazonamientoQuizPage"));
const RazonamientoResultPage = lazy(() => import("@/pages/RazonamientoResultPage"));
const CerebralSelectionPage = lazy(() => import("@/pages/CerebralSelectionPage"));
const CerebralExercisePage = lazy(() => import("@/pages/CerebralExercisePage"));
const CerebralFormPage = lazy(() => import("@/pages/CerebralFormPage"));
const CerebralResultPage = lazy(() => import("@/pages/CerebralResultPage"));
const EntrenamientoSelectionPage = lazy(loadEntrenamientoSelectionPage);
const EntrenamientoEdadPage = lazy(() => import("@/pages/EntrenamientoEdadPage"));
const EntrenamientoPage = lazy(() => import("@/pages/EntrenamientoPage"));
const EntrenamientoPrepPage = lazy(() => import("@/pages/EntrenamientoPrepPage"));
const VelocidadPatronPage = lazy(() => import("@/pages/VelocidadPatronPage"));
const VelocidadExercisePage = lazy(() => import("@/pages/VelocidadExercisePage"));
const NumerosIntroPage = lazy(() => import("@/pages/NumerosIntroPage"));
const NumerosNivelesPage = lazy(() => import("@/pages/NumerosNivelesPage"));
const NumerosEjercicioPage = lazy(() => import("@/pages/NumerosEjercicioPage"));
const NumerosResultPage = lazy(() => import("@/pages/NumerosResultPage"));
const AgeSelectionPage = lazy(() => import("@/pages/AgeSelectionPage"));
const AceleracionSelectionPage = lazy(() => import("@/pages/AceleracionSelectionPage"));
const AceleracionExercisePage = lazy(() => import("@/pages/AceleracionExercisePage"));
const ReconocimientoSelectionPage = lazy(() => import("@/pages/ReconocimientoSelectionPage"));
const ReconocimientoExercisePage = lazy(() => import("@/pages/ReconocimientoExercisePage"));
const NeuroSyncPage = lazy(() => import("@/pages/NeuroSyncPage"));
const NeuroLinkPage = lazy(() => import("@/pages/NeuroLinkPage"));
const MemoryFlashPage = lazy(() => import("@/pages/MemoryFlashPage"));
const NeuroLectorPage = lazy(() => import("@/pages/NeuroLectorPage"));
const ProgresoPage = lazy(loadProgresoPage);
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const ALeerBoliviaPage = lazy(() => import("@/pages/ALeerBoliviaPage"));
const MetodoXPage = lazy(() => import("@/pages/MetodoXPage"));
const ContactoPage = lazy(() => import("@/pages/ContactoPage"));
const MindMapsPage = lazy(() => import("@/pages/MindMapsPage"));
const ChatWidgetPage = lazy(() => import("@/pages/ChatWidgetPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

function warmCommonRoutes() {
  const warm = () => {
    loadTestsPage();
    loadEntrenamientoSelectionPage();
    loadProgresoPage();
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(warm, { timeout: 3500 });
    return;
  }

  globalThis.setTimeout(warm, 2500);
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/tests" component={TestsPage}/>
      <Route path="/age-selection/:testId" component={AgeSelectionPage}/>
      <Route path="/reading-selection" component={ReadingSelectionPage}/>
      <Route path="/reading-selection/:category" component={ReadingSelectionPage}/>
      <Route path="/lectura-contenido" component={ReadingContentPage}/>
      <Route path="/adolescente" component={AdolescentePage}/>
      <Route path="/adolescente-reading" component={AdolescenteReadingPage}/>
      <Route path="/gestion" component={GestionPage}/>
      <Route path="/razonamiento-selection" component={RazonamientoSelectionPage}/>
      <Route path="/razonamiento-selection/:category" component={RazonamientoSelectionPage}/>
      <Route path="/razonamiento-quiz/:category/:tema" component={RazonamientoQuizPage}/>
      <Route path="/razonamiento-result/:category" component={RazonamientoResultPage}/>
      <Route path="/cerebral/seleccion" component={CerebralSelectionPage}/>
      <Route path="/cerebral-selection/:categoria" component={CerebralSelectionPage}/>
      <Route path="/cerebral/ejercicio/:categoria/:tema" component={CerebralExercisePage}/>
      <Route path="/cerebral/formulario/:categoria" component={CerebralFormPage}/>
      <Route path="/cerebral/resultado/:categoria" component={CerebralResultPage}/>
      <Route path="/entrenamiento" component={EntrenamientoSelectionPage}/>
      <Route path="/entrenamiento-edad/:itemId" component={EntrenamientoEdadPage}/>
      <Route path="/entrenamiento/:categoria" component={EntrenamientoPage}/>
      <Route path="/entrenamiento/:categoria/prep/:itemId" component={EntrenamientoPrepPage}/>
      <Route path="/velocidad/:categoria/:itemId" component={VelocidadPatronPage}/>
      <Route path="/velocidad/:categoria/:itemId/patron/:patron" component={VelocidadExercisePage}/>
      <Route path="/numeros/:categoria/:itemId" component={NumerosIntroPage}/>
      <Route path="/numeros/:categoria/:itemId/niveles" component={NumerosNivelesPage}/>
      <Route path="/numeros-ejercicio" component={NumerosEjercicioPage}/>
      <Route path="/numeros-resultado" component={NumerosResultPage}/>
      <Route path="/aceleracion/:categoria/:itemId" component={AceleracionSelectionPage}/>
      <Route path="/aceleracion/:categoria/:itemId/:modo" component={AceleracionExercisePage}/>
      <Route path="/reconocimiento/:categoria/:itemId" component={ReconocimientoSelectionPage}/>
      <Route path="/reconocimiento/:categoria/:itemId/ejercicio/:nivel" component={ReconocimientoExercisePage}/>
      <Route path="/neurosync/:categoria/:itemId" component={NeuroSyncPage}/>
      <Route path="/neurolink/:categoria/:itemId" component={NeuroLinkPage}/>
      <Route path="/memoryflash/:categoria/:itemId" component={MemoryFlashPage}/>
      <Route path="/neurolector/:categoria/:itemId" component={NeuroLectorPage}/>
      <Route path="/progreso" component={ProgresoPage}/>
      <Route path="/progreso/:categoria" component={ProgresoPage}/>
      <Route path="/blog" component={BlogPage}/>
      <Route path="/blog/:id" component={BlogPostPage}/>
      <Route path="/a-leer-bolivia" component={ALeerBoliviaPage}/>
      <Route path="/metodo-x" component={MetodoXPage}/>
      <Route path="/contacto" component={ContactoPage}/>
      <Route path="/mapas-mentales" component={MindMapsPage}/>
      <Route path="/mapas-mentales/share/:token" component={MindMapsPage}/>
      <Route path="/widget/chat" component={ChatWidgetPage}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  usePreloadAssets();

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const timer = window.setTimeout(warmCommonRoutes, 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/") return;

    let cancelled = false;

    waitForRenderedImages(1800).finally(() => {
      if (!cancelled) {
        window.dispatchEvent(new Event("iqex-app-ready"));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <Suspense fallback={null}>
            <Router />
          </Suspense>
          <PWAInstallPrompt />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
