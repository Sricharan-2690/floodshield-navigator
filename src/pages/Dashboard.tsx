import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Waves, ArrowLeft, Bell } from "lucide-react";
import { EmergencyButton } from "@/components/floodshield/EmergencyButton";
import { useInViewOnce } from "@/hooks/useInViewOnce";

function SectionTitle({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-medium tracking-wide text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">{desc}</p>
    </div>
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
    <section className="py-16 sm:py-20">
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

function Alerts() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const alerts = [
    { title: "Heavy rainfall incoming", body: "Storm band detected. Prepare for rising water in 25–40 minutes." },
    { title: "Your area moved to Red Risk Zone", body: "Risk score increased due to terrain + rainfall convergence." },
    { title: "Avoid Route A, take Route B", body: "Flooding reported on low-lying roads near the river bend." },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Alert System"
          title="Alerts that feel immediate — not alarming."
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
                    <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 shadow-float">
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
    <section className="py-16 sm:py-20">
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
                  className="absolute inset-y-0 left-0 w-[60%] bg-primary/5"
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

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="mr-1">
              <NavLink to="/">
                <ArrowLeft className="size-5" />
              </NavLink>
            </Button>
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 shadow-float">
              <Waves className="size-5 text-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">FloodShield Dashboard</p>
              <p className="text-xs text-muted-foreground">Risk analytics & alerts</p>
            </div>
          </div>
        </div>
      </header>

      <main>
        <RiskBreakdown />
        <Alerts />
        <Analytics />
      </main>

      <EmergencyButton />
    </div>
  );
}
