import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Bell, Layers, MapPin, Shield, Waves } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { NavLink } from "@/components/NavLink";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import floodMapImage from "@/assets/flood-map-hyderabad.png";
import floodMapPreview from "@/assets/flood-map-preview.png";
import routeMapPreview from "@/assets/route-map-preview.png";

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
    <div className="grid size-9 place-items-center rounded-xl bg-primary/10 shadow-float">
      <Waves className="size-5 text-foreground" />
    </div>
  );
}

function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <HamburgerMenu />
          <BrandMark />
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">AquaLens</p>
            <p className="text-xs text-muted-foreground">Early warning, precise guidance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="glass" size="pill" className="hidden sm:inline-flex">
            <NavLink to="/auth?mode=login">Login</NavLink>
          </Button>
          <Button asChild variant="hero" size="pill">
            <NavLink to="/auth">
              Sign Up <ArrowRight className="opacity-80" />
            </NavLink>
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
              AquaLens — Predicting floods before they strike.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Real-time flood risk, satellite data intelligence, and safe-route guidance — all in one map.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="hero" size="pill" className="group">
                <NavLink to="/map">
                  Launch Map
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </NavLink>
              </Button>
              <Button asChild variant="glass" size="pill">
                <NavLink to="/dashboard">View Dashboard</NavLink>
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
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      ref={cardRef}
      className="relative mx-auto aspect-square w-full max-w-[520px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full h-full transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-primary/5 shadow-elev" />
        <div className="absolute inset-0 rounded-[2.5rem] border border-border/60" />

        {/* Main glass card with flood map */}
        <div className="absolute inset-6 rounded-[2rem] fs-glass-strong overflow-hidden">
          {/* Flood map image */}
          <img
            src={floodMapImage}
            alt="Hyderabad Flood Risk Map"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />

          {/* Glass overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-transparent to-background/30" />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px),
                               linear-gradient(90deg, hsl(var(--foreground) / 0.05) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60" />
        </div>

        {/* Floating cards with enhanced glass effect */}
        <div className="absolute -left-4 top-10 w-48 animate-float-y" style={{ transform: "translateZ(40px)" }}>
          <div className="fs-glass-strong rounded-2xl p-4 backdrop-blur-xl border border-white/20 shadow-elev">
            <p className="text-xs text-muted-foreground">Rainfall intensity</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">18 mm/hr</p>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-[72%] rounded-full bg-primary transition-all duration-500" />
            </div>
          </div>
        </div>

        <div
          className="absolute -right-4 bottom-10 w-52 animate-float-y"
          style={{ transform: "translateZ(60px)", animationDelay: "0.5s" }}
        >
          <div className="fs-glass-strong rounded-2xl p-4 backdrop-blur-xl border border-white/20 shadow-elev">
            <p className="text-xs text-muted-foreground">Risk score</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">82 / 100</p>
            <p className="mt-1 text-xs text-muted-foreground">Live alert • Red zone nearby</p>
          </div>
        </div>

        {/* Additional floating element for depth */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-40 animate-float-y-soft"
          style={{ transform: "translateX(-50%) translateZ(30px)", animationDelay: "1s" }}
        >
          <div className="fs-glass rounded-xl p-3 backdrop-blur-lg border border-white/15">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-medium">Live monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPreview() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <section id="map" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Live Map Preview"
          title="A unified map for risk, rainfall, terrain and guidance."
          desc="A dashboard-style mockup that animates in layers: heat zones, rainfall, elevation shading, and a top information card."
        />

        <div ref={ref} className="mt-12">
          <div
            ref={cardRef}
            className="relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: "1200px" }}
          >
            <div
              className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-elev transition-transform duration-200 ease-out"
              style={{
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div className="relative grid gap-6 p-6 sm:p-10 lg:grid-cols-12">
                <div
                  className={
                    "lg:col-span-8 transition-all duration-700 " +
                    (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")
                  }
                >
                  <div className="aspect-[16/9] rounded-[1.5rem] fs-glass-strong overflow-hidden relative">
                    {/* Flood map image */}
                    <img
                      src={floodMapPreview}
                      alt="Hyderabad Flood Risk Map"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-transparent to-background/20" />

                    {/* Subtle grid overlay */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.08) 1px, transparent 1px),
                                         linear-gradient(90deg, hsl(var(--foreground) / 0.08) 1px, transparent 1px)`,
                        backgroundSize: "50px 50px",
                      }}
                    />

                    {/* Location pin */}
                    <div className="absolute left-[54%] top-[48%]" style={{ transform: "translateZ(30px)" }}>
                      <div className="relative">
                        <div className="absolute -inset-6 rounded-full border-2 border-primary/50 animate-ripple" />
                        <div
                          className="absolute -inset-4 rounded-full border border-primary/30 animate-ripple"
                          style={{ animationDelay: "0.3s" }}
                        />
                        <div className="grid size-12 place-items-center rounded-full bg-background/80 border-2 border-primary/60 shadow-elev backdrop-blur-sm">
                          <MapPin className="size-6 text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                  </div>
                </div>

                <div
                  className={
                    "lg:col-span-4 transition-all duration-700 delay-150 " +
                    (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")
                  }
                  style={{ transform: "translateZ(20px)" }}
                >
                  <div className="fs-glass-strong rounded-[1.5rem] p-5 backdrop-blur-xl border border-white/20">
                    <p className="text-xs font-medium text-muted-foreground">Top Info Card</p>
                    <div className="mt-4 space-y-3">
                      <Row label="Rainfall" value="18 mm/hr" />
                      <Row label="Risk score" value="82 / 100" />
                      <Row label="Live alert" value="Red zone nearby" />
                      <Row label="Forecast" value="Next hour +12%" />
                    </div>
                    <Button asChild variant="glass" size="pill" className="mt-5 w-full">
                      <NavLink to="/map">Open Interactive Map</NavLink>
                    </Button>
                  </div>
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
    {
      title: "Real-Time Flood Detection",
      desc: "Minute-by-minute risk updates based on live precipitation signals.",
      icon: <Shield />,
    },
    {
      title: "Rainfall Intelligence Engine",
      desc: "Continuous mm/hr updates with storm trajectory inference.",
      icon: <Waves />,
    },
    {
      title: "Elevation & Terrain Analysis",
      desc: "Slope, basins and flow paths from elevation models.",
      icon: <Layers />,
    },
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
                <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 shadow-float">
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

function RoutePreview() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Safe Route Planner"
          title="Plan routes that avoid flood zones."
          desc="Real-time guidance to find safer paths, with risk-aware navigation that adapts as conditions change."
        />

        <div ref={ref} className="mt-12">
          <div
            ref={cardRef}
            className="relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: "1200px" }}
          >
            <div
              className="fs-glass-strong rounded-[2rem] p-6 sm:p-8 transition-transform duration-200 ease-out"
              style={{
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                {/* Route map image */}
                <div
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/60 shadow-elev"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <img
                    src={routeMapPreview}
                    alt="Route Planning Map"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-transparent to-background/15" />

                  {/* Subtle grid overlay */}
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.1) 1px, transparent 1px),
                                       linear-gradient(90deg, hsl(var(--foreground) / 0.1) 1px, transparent 1px)`,
                      backgroundSize: "40px 40px",
                    }}
                  />

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                </div>

                {/* Description + CTA */}
                <div className="space-y-8" style={{ transform: "translateZ(10px)" }}>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold tracking-tight">Navigate with confidence</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Enter your source and destination to get multiple route options with real-time risk assessment.
                      Our algorithm compares flood zones, elevation, and drainage quality to recommend the safest path.
                    </p>
                  </div>

                  {/* Inline legend */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-1 w-5 rounded-full bg-[hsl(142_70%_45%)]" />
                      <span className="text-muted-foreground">Safe route</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1 w-5 rounded-full bg-[hsl(48_95%_55%)]" />
                      <span className="text-muted-foreground">Faster (risky)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-red-500/25" />
                      <span className="text-muted-foreground">Flood zone</span>
                    </div>
                  </div>

                  <Button asChild variant="hero" size="pill" className="group">
                    <NavLink to="/routes">
                      Try Route Planner
                      <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                    </NavLink>
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
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">"FloodShield saved my home."</h3>
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
            Ravi (Hyderabad) received an early warning as his neighborhood shifted into a Red Risk Zone. FloodShield
            guided him to a safer route, helped him move valuables, and avoid the lowest roads before the water rose.
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
              {
                h: "Product",
                a: [
                  { label: "Map", to: "/map" },
                  { label: "Routes", to: "/routes" },
                  { label: "Dashboard", to: "/dashboard" },
                ],
              },
              {
                h: "Account",
                a: [
                  { label: "Login", to: "/auth?mode=login" },
                  { label: "Sign Up", to: "/auth" },
                ],
              },
              {
                h: "Contact",
                a: [
                  { label: "Sales", to: "#" },
                  { label: "Support", to: "#" },
                ],
              },
              {
                h: "Legal",
                a: [
                  { label: "Privacy", to: "#" },
                  { label: "Terms", to: "#" },
                ],
              },
            ].map((col) => (
              <div key={col.h}>
                <p className="font-semibold tracking-tight">{col.h}</p>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  {col.a.map((x) => (
                    <li key={x.label}>
                      <NavLink className="story-link" to={x.to}>
                        {x.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} FloodShield. All rights reserved.
        </p>
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
        <RoutePreview />
        <Tech />
        {/* <Testimonial /> */}
      </main>
      <Footer />
    </div>
  );
}
