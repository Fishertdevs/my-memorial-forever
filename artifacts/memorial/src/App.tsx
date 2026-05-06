import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRealtimeAll } from "@/hooks/use-realtime";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Personas from "@/pages/Personas";
import PersonaDetail from "@/pages/PersonaDetail";
import Velas from "@/pages/Velas";
import Recuerdos from "@/pages/Recuerdos";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5000, refetchOnWindowFocus: true },
  },
});

// Component to enable realtime subscriptions
function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtimeAll(true);
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/personas" component={Personas} />
      <Route path="/personas/:id" component={PersonaDetail} />
      <Route path="/velas" component={Velas} />
      <Route path="/galeria" component={Recuerdos} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </RealtimeProvider>
    </QueryClientProvider>
  );
}

export default App;
