import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/lib/user-context";
import { usePreloadAssets } from "@/hooks/use-preload";
import Home from "@/pages/Home";
import TestsPage from "@/pages/TestsPage";
import ReadingSelectionPage from "@/pages/ReadingSelectionPage";
import ReadingContentPage from "@/pages/ReadingContentPage";
import AdolescentePage from "@/pages/AdolescentePage";
import AdolescenteReadingPage from "@/pages/AdolescenteReadingPage";
import GestionPage from "@/pages/GestionPage";
import RazonamientoSelectionPage from "@/pages/RazonamientoSelectionPage";
import RazonamientoQuizPage from "@/pages/RazonamientoQuizPage";
import RazonamientoResultPage from "@/pages/RazonamientoResultPage";
import CerebralSelectionPage from "@/pages/CerebralSelectionPage";
import CerebralExercisePage from "@/pages/CerebralExercisePage";
import CerebralFormPage from "@/pages/CerebralFormPage";
import CerebralResultPage from "@/pages/CerebralResultPage";
import EntrenamientoSelectionPage from "@/pages/EntrenamientoSelectionPage";
import EntrenamientoCategoriaPage from "@/pages/EntrenamientoCategoriaPage";
import EntrenamientoPage from "@/pages/EntrenamientoPage";
import EntrenamientoPrepPage from "@/pages/EntrenamientoPrepPage";
import VelocidadPatronPage from "@/pages/VelocidadPatronPage";
import VelocidadExercisePage from "@/pages/VelocidadExercisePage";
import NumerosIntroPage from "@/pages/NumerosIntroPage";
import NumerosNivelesPage from "@/pages/NumerosNivelesPage";
import NumerosEjercicioPage from "@/pages/NumerosEjercicioPage";
import NumerosResultPage from "@/pages/NumerosResultPage";
import AgeSelectionPage from "@/pages/AgeSelectionPage";
import NotFound from "@/pages/not-found";

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
      <Route path="/entrenamiento-categoria/:tipo" component={EntrenamientoCategoriaPage}/>
      <Route path="/entrenamiento/:categoria" component={EntrenamientoPage}/>
      <Route path="/entrenamiento/:categoria/prep/:itemId" component={EntrenamientoPrepPage}/>
      <Route path="/velocidad/:categoria/:itemId" component={VelocidadPatronPage}/>
      <Route path="/velocidad/:categoria/:itemId/patron/:patron" component={VelocidadExercisePage}/>
      <Route path="/numeros/:categoria/:itemId" component={NumerosIntroPage}/>
      <Route path="/numeros/:categoria/:itemId/niveles" component={NumerosNivelesPage}/>
      <Route path="/numeros-ejercicio" component={NumerosEjercicioPage}/>
      <Route path="/numeros-resultado" component={NumerosResultPage}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  usePreloadAssets();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <Router />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
