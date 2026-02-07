import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { 
  Waves, ArrowLeft, MapPin, Navigation, Clock, Route, 
  ShieldCheck, AlertTriangle, Locate, ArrowRight 
} from "lucide-react";
import { EmergencyButton } from "@/components/floodshield/EmergencyButton";

interface RouteOption {
  id: string;
  name: string;
  type: "safe" | "fast" | "alternative";
  duration: string;
  distance: string;
  riskLevel: "low" | "medium" | "high";
  benefits: string[];
}

const mockRoutes: RouteOption[] = [
  {
    id: "1",
    name: "Recommended Safe Route",
    type: "safe",
    duration: "28 min",
    distance: "14.2 km",
    riskLevel: "low",
    benefits: ["Avoids 3 flood zones", "Higher elevation path", "Well-drained roads"],
  },
  {
    id: "2",
    name: "Fastest Route",
    type: "fast",
    duration: "18 min",
    distance: "9.8 km",
    riskLevel: "high",
    benefits: ["Shortest distance"],
  },
  {
    id: "3",
    name: "Alternative Route",
    type: "alternative",
    duration: "24 min",
    distance: "12.1 km",
    riskLevel: "medium",
    benefits: ["Avoids 1 flood zone", "Moderate traffic"],
  },
];

function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  const config = {
    low: { bg: "bg-green-500/15", text: "text-green-600", label: "Low Risk" },
    medium: { bg: "bg-yellow-500/15", text: "text-yellow-600", label: "Medium Risk" },
    high: { bg: "bg-red-500/15", text: "text-red-600", label: "High Risk" },
  };
  const { bg, text, label } = config[level];
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}>
      <span className={`size-1.5 rounded-full ${level === "low" ? "bg-green-500" : level === "medium" ? "bg-yellow-500" : "bg-red-500"}`} />
      {label}
    </span>
  );
}

function RouteCard({ route, onSelect }: { route: RouteOption; onSelect: () => void }) {
  const Icon = route.type === "safe" ? ShieldCheck : route.type === "fast" ? Navigation : Route;
  
  return (
    <div className="fs-glass rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-elev">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`grid size-11 place-items-center rounded-xl shadow-float ${
            route.type === "safe" ? "bg-green-500/10" : route.type === "fast" ? "bg-yellow-500/10" : "bg-primary/10"
          }`}>
            <Icon className={`size-5 ${
              route.type === "safe" ? "text-green-600" : route.type === "fast" ? "text-yellow-600" : "text-primary"
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">{route.name}</h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> {route.duration}
              </span>
              <span className="flex items-center gap-1">
                <Route className="size-3" /> {route.distance}
              </span>
            </div>
          </div>
        </div>
        <RiskBadge level={route.riskLevel} />
      </div>
      
      <div className="mt-4 space-y-1.5">
        {route.benefits.map((benefit) => (
          <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-1 rounded-full bg-primary/50" />
            {benefit}
          </div>
        ))}
      </div>
      
      <Button variant="hero" size="pill" className="mt-4 w-full group" onClick={onSelect}>
        Start Guidance
        <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
      </Button>
    </div>
  );
}

function RouteVisualization({ showRoutes }: { showRoutes: boolean }) {
  return (
    <div className="relative aspect-video rounded-2xl fs-glass-strong overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 450" preserveAspectRatio="none" aria-hidden>
        {/* Risk zones */}
        <ellipse cx="550" cy="200" rx="100" ry="70" fill="hsl(0 85% 55% / 0.18)" />
        <ellipse cx="280" cy="280" rx="110" ry="80" fill="hsl(0 85% 55% / 0.12)" />
        
        {/* Safe route (green) */}
        <path
          d="M80 370 C 180 280, 280 350, 380 270 S 560 170, 720 140"
          fill="none"
          stroke="hsl(142 70% 45% / 0.9)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="16 12"
          style={{
            opacity: showRoutes ? 1 : 0,
            transition: "opacity 800ms ease",
          }}
        />
        
        {/* Fast route (yellow/risky) */}
        <path
          d="M100 400 C 220 360, 280 390, 400 330 S 620 290, 740 200"
          fill="none"
          stroke="hsl(48 95% 55% / 0.85)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="10 10"
          style={{
            opacity: showRoutes ? 1 : 0,
            transition: "opacity 1100ms ease",
          }}
        />
      </svg>
      
      {/* Start marker */}
      <div 
        className="absolute left-[8%] top-[78%]"
        style={{
          opacity: showRoutes ? 1 : 0,
          transition: "opacity 600ms ease",
        }}
      >
        <div className="relative">
          <div className="absolute -inset-2 rounded-full border border-green-500/40 animate-ping" />
          <div className="grid size-8 place-items-center rounded-full bg-green-500 text-white shadow-lg">
            <MapPin className="size-4" />
          </div>
        </div>
      </div>
      
      {/* End marker */}
      <div 
        className="absolute left-[88%] top-[28%]"
        style={{
          opacity: showRoutes ? 1 : 0,
          transition: "opacity 900ms ease",
        }}
      >
        <div className="relative">
          <div className="absolute -inset-2 rounded-full border border-primary/40 animate-ping" />
          <div className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Navigation className="size-4" />
          </div>
        </div>
      </div>
      
      {/* Warning marker in risk zone */}
      <div 
        className="absolute left-[66%] top-[42%]"
        style={{
          opacity: showRoutes ? 1 : 0,
          transition: "opacity 1200ms ease",
        }}
      >
        <div className="grid size-7 place-items-center rounded-full bg-red-500/20 border border-red-500/40">
          <AlertTriangle className="size-3.5 text-red-500" />
        </div>
      </div>
    </div>
  );
}

export default function Routes() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleFindRoutes = () => {
    if (source && destination) {
      setShowResults(true);
    }
  };

  const handleUseLocation = () => {
    setSource("Current Location");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-[1100] border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <HamburgerMenu />
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 shadow-float">
              <Waves className="size-5 text-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">AquaLens Routes</p>
              <p className="text-xs text-muted-foreground">Find the safest path</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Input Section */}
        <div className="fs-glass-strong rounded-2xl p-6 sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">Plan Your Safe Route</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your starting point and destination to find flood-safe routes
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="size-4 text-green-500" />
                Starting Point
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter location or address..."
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="flex-1"
                />
                <Button variant="glass" size="icon" onClick={handleUseLocation} aria-label="Use current location">
                  <Locate className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Navigation className="size-4 text-primary" />
                Destination
              </label>
              <Input
                placeholder="Enter destination..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <Button 
              variant="hero" 
              size="pill" 
              className="w-full group" 
              onClick={handleFindRoutes}
              disabled={!source || !destination}
            >
              Find Safe Routes
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="mt-8 space-y-6 animate-fade-in">
            <h2 className="text-lg font-semibold tracking-tight">Route Options</h2>
            
            <div className="grid gap-4 lg:grid-cols-3">
              {mockRoutes.map((route) => (
                <RouteCard 
                  key={route.id} 
                  route={route} 
                  onSelect={() => console.log("Selected route:", route.id)}
                />
              ))}
            </div>

            {/* Route Comparison */}
            <div className="fs-glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold tracking-tight">Route Comparison</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-green-600">+10 min</p>
                  <p className="text-xs text-muted-foreground">Safer route adds</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-primary">3 zones</p>
                  <p className="text-xs text-muted-foreground">Flood areas avoided</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">85%</p>
                  <p className="text-xs text-muted-foreground">Risk reduction</p>
                </div>
              </div>
            </div>

            {/* Route Visualization */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-tight">Route Visualization</h3>
              <RouteVisualization showRoutes={showResults} />
              
              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-1 w-6 rounded-full bg-[hsl(142_70%_45%)]" />
                  <span className="text-muted-foreground">Safe route</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1 w-6 rounded-full bg-[hsl(48_95%_55%)]" />
                  <span className="text-muted-foreground">Faster (risky)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-500/30" />
                  <span className="text-muted-foreground">Flood zones</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <EmergencyButton />
    </div>
  );
}
