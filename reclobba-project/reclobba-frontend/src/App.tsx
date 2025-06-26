import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Wardrobe from "@/pages/wardrobe";
import Outfits from "@/pages/outfits";
import Suggestions from "@/pages/suggestions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Wardrobe} />
      <Route path="/wardrobe" component={Wardrobe} />
      <Route path="/outfits" component={Outfits} />
      <Route path="/suggestions" component={Suggestions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
