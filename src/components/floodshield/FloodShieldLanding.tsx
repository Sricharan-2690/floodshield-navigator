import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Bell, Layers, MapPin, Shield, Waves } from "lucide-react";
import { useMemo, useRef, type ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { useInViewOnce } from "@/hooks/useInViewOnce";

type Feature = {
  title: string;
  desc: string;
  icon: ReactNode;
};

function SectionTitle({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-medium tracking-wide text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">{desc}</p>
    </div>
  );
}

function useReducedMotion() {
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);
}

function BrandMark() {
  return (
    <div className="grid size-9 place-items-center rounded-xl bg-fs-panel shadow-float">
      <Waves className="size-5 text-foreground" />
    </div>
  );
}

function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">FloodShield</p>
            <p className="text-xs text-muted-foreground">Early warning, precise guidance</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a className="story-link" href="#map">
            Map Preview
          </a>
          <a className="story-link" href="#features">
            Features
          </a>
          <a className="story-link" href="#risk">
            Risk Score
          </a>
          <a className="story-link" href="#alerts">
            Alerts
          </a>
          <a className="story-link" href="#analytics">
            Analytics
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="glass" size="pill" className="hidden sm:inline-flex">
            <NavLink to="/prototype">Launch Prototype</NavLink>
          </Button>
          <Button asChild variant="hero" size="pill">
            <a href="#map" aria-label="How FloodShield works">
              How It Works <ArrowRight className="opacity-80" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      className="relative overflow-hidden bg-fs-hero fs-noise"
      onMouseMove={(e) => {
        if (reduced) return;
        const el = heroRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
      }}
    >
      <div ref={heroRef} className="relative">
        <div className="mx-auto grid min-h-[86vh] max-w-6xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-12 lg:pt-20">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground shadow-float">
              <span className="inline-flex size-2 rounded-full bg-primary" />
              Live risk scoring • satellite + rainfall + terrain
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              FloodShield — Predicting floods before they strike.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Real-time flood risk, satellite data intelligence, and safe-route guidance — all in one map.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="hero" size="pill" className="group">
                <NavLink to="/prototype">
                  Launch Dashboard
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </NavLink>
              </Button>
              <Button asChild variant="glass" size="pill">
                <a href="#risk">Risk model breakdown</a>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 max-w-xl">
              {["Next-hour forecast", "Zone heatmap", "Safe routes"].map((t) => (
                <div key={t} className="fs-glass rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground">Capability</p>
                  <p className="mt-1 text-sm font-medium">{t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <HeroOrb />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroOrb() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div className="absolute inset-0 rounded-[2.5rem] bg-fs-panel shadow-elev" />

      <div className="absolute inset-0 rounded-[2.5rem] border border-border/60" />

      {/* “3D earth / map” illusion */}
      <div className="absolute inset-6 rounded-[2rem] fs-glass-strong overflow-hidden">
        <div className="absolute inset-0 bg-fs-panel opacity-70" />

        <div className="absolute left-1/2 top-1/2 size-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/70 shadow-float" />
        <div className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/40" />

        {/* Continents */}
        <div className="absolute left-[28%] top-[32%] h-16 w-24 rounded-[999px] bg-primary/15 blur-[0.2px]" />
        <div className="absolute left-[48%] top-[52%] h-20 w-28 rotate-12 rounded-[999px] bg-[hsl(var(--brand-cyan)/0.18)] blur-[0.2px]" />
        <div className="absolute left-[36%] top-[58%] h-10 w-16 -rotate-6 rounded-[999px] bg-[hsl(var(--brand-lilac)/0.18)] blur-[0.2px]" />

        {/* Rain particles */}
        <div className="absolute inset-0 opacity-70">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="absolute h-8 w-[2px] rounded-full bg-foreground/10 animate-float-y-soft"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 17) % 100}%`,
                transform: `rotate(${(i % 2 ? 14 : -12)}deg)`,
                animationDuration: `${6 + (i % 5)}s`,
                animationDelay: `${(i % 7) * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Water ripple highlight */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 size-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/10 animate-pulse-soft" />
        </div>
      </div>

      {/* Floating cards */}
      <div className="absolute -left-4 top-10 w-48 animate-float-y">
        <div className="fs-glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Rainfall intensity</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">18 mm/hr</p>
          <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full w-[72%] rounded-full bg-primary" />
          </div>
        </div>
      </div>

      <div className="absolute -right-4 bottom-10 w-52 animate-float-y">
        <div className="fs-glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Risk score</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">82 / 100</p>
          <p className="mt-1 text-xs text-muted-foreground">Live alert • Red zone nearby</p>
        </div>
      </div>
    </div>
  );
}

function MapPreview() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  return (
    <section id="map" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Live Map Preview"
          title="A unified map for risk, rainfall, terrain and guidance."
          desc="A dashboard-style mockup that animates in layers: heat zones, rainfall, elevation shading, and a top information card."
        />

        <div ref={ref} className="mt-12">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-elev">
            <div className="absolute inset-0 bg-fs-panel opacity-50" />
            <div className="absolute inset-0 bg-fs-heat opacity-70" />

            {/* Elevation shading */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute left-[10%] top-[18%] h-40 w-60 rotate-[-18deg] rounded-[999px] bg-foreground/10 blur-2xl" />
              <div className="absolute left-[56%] top-[48%] h-44 w-72 rotate-[12deg] rounded-[999px] bg-foreground/10 blur-2xl" />
            </div>

            {/* Route lines */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1200 700"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M140 520 C 300 420, 420 520, 520 410 S 780 300, 1040 240"
                fill="none"
                stroke="hsl(var(--primary) / 0.65)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="12 14"
                style={{
                  opacity: inView ? 1 : 0,
                  transition: "opacity 900ms ease",
                }}
              />
              <path
                d="M160 560 C 340 520, 420 590, 560 530 S 820 470, 1040 360"
                fill="none"
                stroke="hsl(var(--brand-cyan) / 0.60)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="8 12"
                style={{
                  opacity: inView ? 1 : 0,
                  transition: "opacity 1200ms ease",
                }}
              />
            </svg>

            <div className="relative grid gap-6 p-6 sm:p-10 lg:grid-cols-12">
              <div
                className={
                  "lg:col-span-8 transition-all duration-700 " +
                  (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")
                }
              >
                <div className="aspect-[16/9] rounded-[1.5rem] fs-glass-strong overflow-hidden">
                  <div className="absolute inset-0" />
                  {/* location pin */}
                  <div className="relative h-full">
                    <div className="absolute left-[54%] top-[48%]">
                      <div className="relative">
                        <div className="absolute -inset-4 rounded-full border border-primary/40 animate-ripple" />
                        <div className="grid size-10 place-items-center rounded-full bg-background/70 border border-border/70 shadow-float">
                          <MapPin className="size-5 text-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={
                  "lg:col-span-4 transition-all duration-700 delay-150 " +
                  (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")
                }
              >
                <div className="fs-glass-strong rounded-[1.5rem] p-5">
                  <p className="text-xs font-medium text-muted-foreground">Top Info Card</p>
                  <div className="mt-4 space-y-3">
                    <Row label="Rainfall" value="18 mm/hr" />
                    <Row label="Risk score" value="82 / 100" />
                    <Row label="Live alert" value="Red zone nearby" />
                    <Row label="Forecast" value="Next hour +12%" />
                  </div>
                  <Button variant="glass" size="pill" className="mt-5 w-full">
                    View details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tracking-tight">{value}</span>
    </div>
  );
}

function Features() {
  const features: Feature[] = [
    { title: "Real-Time Flood Detection", desc: "Minute-by-minute risk updates based on live precipitation signals.", icon: <Shield /> },
    { title: "Rainfall Intelligence Engine", desc: "Continuous mm/hr updates with storm trajectory inference.", icon: <Waves /> },
    { title: "Elevation & Terrain Analysis", desc: "Slope, basins and flow paths from elevation models.", icon: <Layers /> },
    { title: "Water Body Proximity", desc: "Rivers, lakes and drainage adjacency weighting.", icon: <MapPin /> },
    { title: "Historical Hotspot Mapping", desc: "Learned flood patterns + seasonal clustering.", icon: <BarChart3 /> },
    { title: "Safe Route Planner", desc: "Avoid flood zones with real-time detours.", icon: <ArrowRight /> },
    { title: "Smart Alerts & Warnings", desc: "Push-ready alerts with confidence + severity.", icon: <Bell /> },
    { title: "Area Monitoring Dashboard", desc: "Home, work, school — track what matters.", icon: <Shield /> },
    { title: "City-Level Analytics Panel", desc: "Neighborhood insights and readiness planning.", icon: <BarChart3 /> },
  ];

  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  return (
    <section id="features" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Key Features"
          title="Everything needed to anticipate, act and stay safe."
          desc="Apple-style, glassy feature cards with soft hover depth and gentle entrance motion."
        />

        <div ref={ref} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className={
                "fs-glass rounded-[1.5rem] p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-elev " +
                (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")
              }
              style={{ transitionDelay: `${Math.min(idx * 40, 280)}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-fs-panel shadow-float">
                  <div className="text-foreground transition-transform duration-300 hover:rotate-6">{f.icon}</div>
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{f.title}</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RiskBreakdown() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const weights = [
    { name: "Rainfall", pct: 40 },
    { name: "Elevation & Slope", pct: 25 },
    { name: "Waterbody Distance", pct: 15 },
    { name: "Historical Flood Score", pct: 15 },
    { name: "Drainage Quality", pct: 5 },
  ];

  return (
    <section id="risk" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Deep Dive"
          title="Risk Score Breakdown"
          desc="A clear, weighted model that updates as new signals arrive — rainfall, terrain, water proximity and historic patterns."
        />

        <div ref={ref} className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 fs-glass-strong rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold tracking-tight">Live model weights</p>
              <p className="text-xs text-muted-foreground">Hover for details</p>
            </div>

            <div className="mt-6 space-y-4">
              {weights.map((w, i) => (
                <div key={w.name} className="group">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{w.name}</p>
                    <p className="text-sm font-medium tracking-tight">{w.pct}%</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-1000"
                      style={{ width: inView ? `${w.pct}%` : "0%", transitionDelay: `${i * 90}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 grid gap-4">
            <div className="fs-glass rounded-[2rem] p-6">
              <p className="text-xs text-muted-foreground">Current score</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">82</p>
              <p className="mt-2 text-sm text-muted-foreground">High confidence • localized rainfall spike</p>
            </div>
            <div className="fs-glass rounded-[2rem] p-6">
              <p className="text-xs text-muted-foreground">Explainability</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Model contributions are transparently surfaced per layer. Scores update smoothly as new satellite and rain signals
                land.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoutePlanner() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Safe Route Planner"
          title="Guidance that avoids risk zones in real time."
          desc="Two animated routes: a safe option (green) and a faster-but-risky alternative (yellow), with pulsing markers and a moving vehicle." 
        />

        <div ref={ref} className="mt-12 overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-elev">
          <div className="relative p-6 sm:p-10">
            <div className="absolute inset-0 bg-fs-panel opacity-55" />

            <div className="relative aspect-[16/9] rounded-[1.5rem] fs-glass-strong overflow-hidden">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 680" preserveAspectRatio="none" aria-hidden>
                {/* red risk zones */}
                <ellipse cx="860" cy="300" rx="150" ry="110" fill="hsl(0 85% 55% / 0.22)" />
                <ellipse cx="420" cy="420" rx="170" ry="120" fill="hsl(0 85% 55% / 0.14)" />

                {/* safe route */}
                <path
                  d="M120 560 C 280 430, 410 550, 560 420 S 840 260, 1100 210"
                  fill="none"
                  stroke="hsl(142 70% 45% / 0.9)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray="22 18"
                  style={{
                    opacity: inView ? 1 : 0,
                    transition: "opacity 900ms ease",
                  }}
                />

                {/* risky route */}
                <path
                  d="M150 600 C 320 550, 420 620, 590 560 S 900 500, 1120 340"
                  fill="none"
                  stroke="hsl(48 95% 55% / 0.85)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="14 14"
                  style={{
                    opacity: inView ? 1 : 0,
                    transition: "opacity 1200ms ease",
                  }}
                />
              </svg>

              {/* markers */}
              <div className="absolute left-[18%] top-[76%]">
                <Marker tone="primary" />
              </div>
              <div className="absolute left-[82%] top-[32%]">
                <Marker tone="cyan" />
              </div>
              <div className="absolute left-[70%] top-[44%]">
                <Marker tone="warn" />
              </div>

              {/* vehicle */}
              <div
                className="absolute left-[16%] top-[74%]"
                style={{
                  transform: inView ? "translate(560px, -210px)" : "translate(0px, 0px)",
                  transition: "transform 2600ms cubic-bezier(0.2,0.8,0.2,1)",
                }}
              >
                <div className="grid size-10 place-items-center rounded-full bg-background/70 border border-border/70 shadow-float">
                  <ArrowRight className="size-5" />
                </div>
              </div>
            </div>

            <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
              <Legend label="Safe route" color="hsl(142 70% 45% / 0.85)" />
              <Legend label="Faster (risky)" color="hsl(48 95% 55% / 0.85)" />
              <Legend label="Avoided zones" color="hsl(0 85% 55% / 0.50)" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <div className="fs-glass rounded-2xl px-4 py-3 flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="inline-flex h-2.5 w-10 rounded-full" style={{ background: color }} />
    </div>
  );
}

function Marker({ tone }: { tone: "primary" | "cyan" | "warn" }) {
  const bg =
    tone === "primary" ? "hsl(var(--primary) / 0.25)" : tone === "cyan" ? "hsl(var(--brand-cyan) / 0.25)" : "hsl(48 95% 55% / 0.25)";
  const ring =
    tone === "primary" ? "hsl(var(--primary) / 0.45)" : tone === "cyan" ? "hsl(var(--brand-cyan) / 0.45)" : "hsl(48 95% 55% / 0.45)";

  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-full" style={{ border: `1px solid ${ring}` }} />
      <div className="absolute -inset-5 rounded-full animate-pulse-soft" style={{ border: `1px solid ${ring}` }} />
      <div className="grid size-10 place-items-center rounded-full border border-border/70 bg-background/70 shadow-float">
        <span className="size-3 rounded-full" style={{ background: bg }} />
      </div>
    </div>
  );
}

function Alerts() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const alerts = [
    { title: "Heavy rainfall incoming", body: "Storm band detected. Prepare for rising water in 25–40 minutes." },
    { title: "Your area moved to Red Risk Zone", body: "Risk score increased due to terrain + rainfall convergence." },
    { title: "Avoid Route A, take Route B", body: "Flooding reported on low-lying roads near the river bend." },
  ];

  return (
    <section id="alerts" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Alert System"
          title="iOS-style alerts that feel immediate — not alarming."
          desc="Push-ready notifications with soft slide-in motion and clear severity cues."
        />

        <div ref={ref} className="mt-12 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6 fs-glass-strong rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-tight">Notification stream</p>
            <p className="mt-2 text-sm text-muted-foreground">Designed to be glanceable and actionable.</p>

            <div className="mt-6 space-y-3">
              {alerts.map((a, i) => (
                <div
                  key={a.title}
                  className={
                    "fs-glass rounded-[1.25rem] p-4 transition-all duration-700 " +
                    (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")
                  }
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl bg-fs-panel shadow-float">
                      <Bell className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-tight">{a.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 grid gap-4">
            <div className="fs-glass rounded-[2rem] p-6">
              <p className="text-xs text-muted-foreground">Delivery</p>
              <p className="mt-2 text-sm text-muted-foreground">Mobile push, SMS and dashboard banners share the same severity model.</p>
            </div>
            <div className="fs-glass rounded-[2rem] p-6">
              <p className="text-xs text-muted-foreground">Actions</p>
              <p className="mt-2 text-sm text-muted-foreground">One tap opens the relevant layer: risk breakdown, safe routes, or monitoring areas.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Analytics() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <section id="analytics" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Analytics"
          title="Premium charts for planning, not just monitoring."
          desc="Animated dashboard visuals: trends, correlation and clustering — presented with calm, Apple-like clarity."
        />

        <div ref={ref} className="mt-12 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7 fs-glass-strong rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-tight">Weekly flood risk trend</p>
            <div className="mt-6 h-44 rounded-[1.5rem] bg-background/50 border border-border/60 overflow-hidden">
              <div className="relative h-full">
                <div
                  className="absolute inset-y-0 left-0 w-[60%] bg-fs-panel"
                  style={{
                    transform: inView ? "translateX(0%)" : "translateX(-20%)",
                    opacity: inView ? 1 : 0,
                    transition: "transform 900ms ease, opacity 900ms ease",
                  }}
                />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden>
                  <path
                    d="M0 150 C 120 140, 160 90, 240 100 S 380 160, 460 120 S 560 40, 600 70"
                    fill="none"
                    stroke="hsl(var(--primary) / 0.85)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{
                      opacity: inView ? 1 : 0,
                      transition: "opacity 900ms ease 120ms",
                    }}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid gap-4">
            <div className="fs-glass rounded-[2rem] p-6">
              <p className="text-sm font-semibold tracking-tight">Rainfall vs elevation</p>
              <div className="mt-4 h-28 rounded-[1.25rem] border border-border/60 bg-background/50" />
            </div>
            <div className="fs-glass rounded-[2rem] p-6">
              <p className="text-sm font-semibold tracking-tight">City risk clustering</p>
              <div className="mt-4 h-28 rounded-[1.25rem] border border-border/60 bg-background/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tech() {
  const stack = [
    { name: "NASA DEM", note: "Elevation" },
    { name: "OpenWeather", note: "Rainfall" },
    { name: "HydroSHEDS", note: "Hydrology" },
    { name: "Sentinel-2", note: "Satellite" },
    { name: "Mapbox / Leaflet", note: "Mapping" },
  ];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="About the Technology"
          title="Built on trusted datasets. Tuned for real-time decisions."
          desc="A sleek, monochrome stack overview — designed to feel like a product spec sheet."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stack.map((s) => (
            <div key={s.name} className="fs-glass rounded-[1.5rem] p-6 text-center">
              <p className="text-sm font-semibold tracking-tight">{s.name}</p>
              <p className="mt-2 text-xs text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="fs-glass-strong rounded-[2.5rem] p-8 sm:p-12">
          <p className="text-sm font-medium text-muted-foreground">Real-world story</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">“FloodShield saved my home.”</h3>
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
            Ravi (Hyderabad) received an early warning as his neighborhood shifted into a Red Risk Zone. FloodShield guided him
            to a safer route, helped him move valuables, and avoid the lowest roads before the water rose.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="text-sm font-semibold">FloodShield</p>
              <p className="text-xs text-muted-foreground">Predict. Warn. Route.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-4">
            {[
              { h: "Product", a: ["Dashboard", "Alerts", "Safe Routes"] },
              { h: "Docs", a: ["API", "Data Sources", "Changelog"] },
              { h: "Contact", a: ["Sales", "Support", "Partnerships"] },
              { h: "Legal", a: ["Privacy", "Terms", "Security"] },
            ].map((col) => (
              <div key={col.h}>
                <p className="font-semibold tracking-tight">{col.h}</p>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  {col.a.map((x) => (
                    <li key={x}>
                      <a className="story-link" href="#">
                        {x}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">© {new Date().getFullYear()} FloodShield. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function FloodShieldLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <main>
        <Hero />
        <MapPreview />
        <Features />
        <RiskBreakdown />
        <RoutePlanner />
        <Alerts />
        <Analytics />
        <Tech />
        <Testimonial />
      </main>
      <Footer />
    </div>
  );
}
