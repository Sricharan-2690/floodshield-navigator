import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Prototype from "./pages/Prototype";
import MapRedirect from "./pages/Map";
import { lazy, Suspense } from "react";

const MapRisk = lazy(() => import("./pages/MapRisk"));
const MapSusceptibility = lazy(() => import("./pages/MapSusceptibility"));
import RoutesPage from "./pages/Routes";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/map" element={<MapRedirect />} />
          <Route path="/map/risk" element={<Suspense fallback={null}><MapRisk /></Suspense>} />
          <Route path="/map/susceptibility" element={<Suspense fallback={null}><MapSusceptibility /></Suspense>} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prototype" element={<Prototype />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
