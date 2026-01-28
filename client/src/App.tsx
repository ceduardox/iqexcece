import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/lib/user-context";
import Home from "@/pages/Home";
import TestsPage from "@/pages/TestsPage";
import ChildCategoryPage from "@/pages/ChildCategoryPage";
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
import CerebralResultPage from "@/pages/CerebralResultPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/tests" component={TestsPage}/>
      <Route path="/child-category" component={ChildCategoryPage}/>
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
      <Route path="/cerebral/ejercicio/:categoria/:tema" component={CerebralExercisePage}/>
      <Route path="/cerebral/resultado/:categoria" component={CerebralResultPage}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
