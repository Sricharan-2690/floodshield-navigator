import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, ChevronLeft, ChevronRight, MapPin, Search, ShieldCheck } from "lucide-react";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { useMemo, useState } from "react";

type StepId =
  | "splash"
  | "permission"
  | "dashboard"
  | "search"
  | "risk"
  | "route"
  | "alerts"
  | "analytics";

type Step = {
  id: StepId;
  title: string;
  subtitle: string;
};

const steps: Step[] = [
  {
    id: "splash",
    title: "FloodShield",
    subtitle: "Predicting floods before they strike.",
  },
  {
    id: "permission",
    title: "Location Permission",
    subtitle: "Enable location to personalize risk zones and route guidance.",
  },
  {
    id: "dashboard",
    title: "Main Map Dashboard",
    subtitle: "Live heatmap, elevation shading, and risk score in one view.",
  },
  {
    id: "search",
    title: "Area Search",
    subtitle: "Quickly jump to monitored locations and save areas.",
  },
  {
    id: "risk",
    title: "Risk Breakdown",
    subtitle: "Explainable model weights and live updates.",
  },
  {
    id: "route",
    title: "Safe Route Planner",
    subtitle: "Compare safe vs faster-but-risky routes.",
  },
  {
    id: "alerts",
    title: "Alerts",
    subtitle: "iOS-style notifications with clear actions.",
  },
  {
    id: "analytics",
    title: "Analytics",
    subtitle: "Trends, correlations, and city-level clustering.",
  },
];

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="rounded-[2.25rem] border border-border/60 bg-card shadow-elev overflow-hidden">
        <div className="h-7 bg-background/50 border-b border-border/50" />
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function StepDots({ index }: { index: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((s, i) => (
        <span
          key={s.id}
          className={cn(
            "h-1.5 w-6 rounded-full transition-colors",
            i === index ? "bg-primary" : "bg-secondary",
          )}
        />
      ))}
    </div>
  );
}

function Screen({ step }: { step: Step }) {
  switch (step.id) {
    case "splash":
      return (
        <div className="text-center py-12">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-fs-panel shadow-float">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{step.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{step.subtitle}</p>
        </div>
      );
    case "permission":
      return (
        <div className="py-6">
          <div className="fs-glass-strong rounded-[1.5rem] p-5">
            <div className="flex items-start gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-fs-panel shadow-float">
                <MapPin className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">Allow location access</p>
                <p className="mt-1 text-sm text-muted-foreground">To show risk around you and plan safe routes.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Button variant="hero" size="pill">
                Allow While Using App
              </Button>
              <Button variant="glass" size="pill">
                Not Now
              </Button>
            </div>
          </div>
        </div>
      );
    case "dashboard":
      return (
        <div className="space-y-4">
          <div className="fs-glass-strong rounded-[1.5rem] p-4">
            <p className="text-xs text-muted-foreground">Risk score</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">82 / 100</p>
            <p className="mt-1 text-xs text-muted-foreground">Red zone nearby • next hour +12%</p>
          </div>
          <div className="aspect-[16/11] rounded-[1.5rem] fs-glass-strong overflow-hidden">
            <div className="h-full w-full bg-fs-heat opacity-80" />
          </div>
        </div>
      );
    case "search":
      return (
        <div className="space-y-4">
          <div className="fs-glass-strong rounded-[1.25rem] p-3 flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search an area…"
              aria-label="Search"
            />
          </div>
          <div className="space-y-2">
            {["Home — Jubilee Hills", "Work — HITEC City", "School — Banjara Hills"].map((x) => (
              <div key={x} className="fs-glass rounded-[1.25rem] p-4">
                <p className="text-sm font-medium">{x}</p>
                <p className="mt-1 text-xs text-muted-foreground">Monitoring • tap to open map</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "risk":
      return (
        <div className="space-y-3">
          {[
            ["Rainfall", 40],
            ["Elevation & Slope", 25],
            ["Waterbody Distance", 15],
            ["Historical Flood", 15],
            ["Drainage", 5],
          ].map(([name, pct]) => (
            <div key={String(name)} className="fs-glass rounded-[1.25rem] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{name}</p>
                <p className="text-sm font-semibold">{pct}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      );
    case "route":
      return (
        <div className="space-y-4">
          <div className="aspect-[16/10] rounded-[1.5rem] fs-glass-strong overflow-hidden relative">
            <div className="absolute inset-0 bg-fs-panel opacity-40" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 360" preserveAspectRatio="none" aria-hidden>
              <path
                d="M60 300 C 160 220, 220 320, 300 240 S 420 140, 540 110"
                fill="none"
                stroke="hsl(142 70% 45% / 0.9)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="14 12"
              />
              <path
                d="M70 320 C 170 300, 220 340, 320 300 S 460 270, 560 190"
                fill="none"
                stroke="hsl(48 95% 55% / 0.85)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="10 10"
              />
            </svg>
          </div>
          <div className="grid gap-2">
            <Button variant="hero" size="pill">
              Start guidance
            </Button>
            <Button variant="glass" size="pill">
              Compare routes
            </Button>
          </div>
        </div>
      );
    case "alerts":
      return (
        <div className="space-y-3">
          {[
            "Heavy rainfall incoming",
            "Moved to Red Risk Zone",
            "Avoid Route A, take Route B",
          ].map((t) => (
            <div key={t} className="fs-glass rounded-[1.25rem] p-4 flex items-start gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-fs-panel shadow-float">
                <Bell className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">Tap to view the affected layer.</p>
              </div>
            </div>
          ))}
        </div>
      );
    case "analytics":
      return (
        <div className="space-y-4">
          <div className="fs-glass-strong rounded-[1.5rem] p-4">
            <p className="text-sm font-semibold tracking-tight">Weekly trend</p>
            <div className="mt-3 h-24 rounded-[1.25rem] border border-border/60 bg-background/50" />
          </div>
          <div className="fs-glass rounded-[1.5rem] p-4">
            <p className="text-sm font-semibold tracking-tight">City clustering</p>
            <div className="mt-3 h-24 rounded-[1.25rem] border border-border/60 bg-background/50" />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function Prototype() {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const canPrev = index > 0;
  const canNext = index < steps.length - 1;

  const pill = useMemo(() => `${index + 1} / ${steps.length}`, [index]);

  return (
    <div className="min-h-screen bg-fs-hero fs-noise">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HamburgerMenu />
            <div>
              <p className="text-sm font-semibold tracking-tight">FloodShield Prototype</p>
              <p className="text-xs text-muted-foreground">Splash → Permissions → Dashboard → Search → Risk → Route → Alerts → Analytics</p>
            </div>
          </div>
          <div className="fs-glass rounded-full px-3 py-1 text-xs text-muted-foreground">{pill}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h1 className="text-3xl font-semibold tracking-tight">{step.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{step.subtitle}</p>

            <div className="mt-8 flex items-center gap-2">
              <Button
                variant="glass"
                size="pill"
                onClick={() => setIndex((v) => Math.max(0, v - 1))}
                disabled={!canPrev}
              >
                <ChevronLeft />
                Back
              </Button>
              <Button
                variant="hero"
                size="pill"
                onClick={() => setIndex((v) => Math.min(steps.length - 1, v + 1))}
                disabled={!canNext}
              >
                Next
                <ChevronRight />
              </Button>
            </div>

            <div className="mt-8 fs-glass rounded-[1.5rem] p-5">
              <p className="text-xs font-medium text-muted-foreground">Prototype note</p>
              <p className="mt-2 text-sm text-muted-foreground">
                This is a UI-flow prototype (no backend). Next we can wire real data, location, and alerts via a backend.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <PhoneShell>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{step.title}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4" />
                  <Bell className="size-4" />
                </div>
              </div>

              <div className="mt-4">
                <Screen step={step} />
              </div>

              <div className="mt-6">
                <StepDots index={index} />
              </div>
            </PhoneShell>
          </div>
        </div>
      </main>
    </div>
  );
}
