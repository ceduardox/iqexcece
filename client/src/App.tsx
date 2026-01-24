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
import GestionPage from "@/pages/GestionPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/tests" component={TestsPage}/>
      <Route path="/child-category" component={ChildCategoryPage}/>
      <Route path="/reading-selection" component={ReadingSelectionPage}/>
      <Route path="/lectura-contenido" component={ReadingContentPage}/>
      <Route path="/gestion" component={GestionPage}/>
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
