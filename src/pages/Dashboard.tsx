import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  Waves,
  ArrowLeft,
  Bell,
  CloudRain,
  Droplets,
  CloudSun,
  Zap,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { EmergencyButton } from "@/components/floodshield/EmergencyButton";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useRainForecast, type DayRain } from "@/hooks/useRainForecast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

/* ---------- Helpers ---------- */

function SectionTitle({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-medium tracking-wide text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">{desc}</p>
    </div>
  );
}

function getBarColor(mm: number) {
  if (mm < 2.5) return "hsl(142, 70%, 45%)";
  if (mm < 15) return "hsl(38, 92%, 50%)";
  return "hsl(0, 84%, 60%)";
}

function getRiskScore(days: DayRain[]): number {
  if (days.length === 0) return 0;
  const totalRain = days.reduce((s, d) => s + d.totalMm, 0);
  const peakDay = Math.max(...days.map((d) => d.totalMm));
  const heavyDays = days.filter((d) => d.totalMm >= 15).length;
  // Weighted score: total matters, peak matters more, heavy day count matters
  const score = Math.min(Math.round((totalRain / days.length) * 8 + peakDay * 1.5 + heavyDays * 10), 100);
  return Math.max(score, 5);
}

function getRiskLabel(score: number) {
  if (score <= 30) return { label: "Low", color: "text-emerald-600 dark:text-emerald-400" };
  if (score <= 60) return { label: "Moderate", color: "text-amber-600 dark:text-amber-400" };
  if (score <= 80) return { label: "High", color: "text-orange-600 dark:text-orange-400" };
  return { label: "Severe", color: "text-red-600 dark:text-red-400" };
}

/* ---------- Skeleton ---------- */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 animate-pulse rounded-[2rem] bg-muted/50 border border-border" />
      ))}
    </div>
  );
}

/* ---------- Risk Breakdown ---------- */

function RiskBreakdown({ days, loading }: { days: DayRain[]; loading: boolean }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  const totalRain = days.reduce((s, d) => s + d.totalMm, 0);
  const peakDay = days.length ? Math.max(...days.map((d) => d.totalMm)) : 0;
  const avgDaily = days.length ? totalRain / days.length : 0;
  const riskScore = getRiskScore(days);
  const risk = getRiskLabel(riskScore);

  const weights = [
    { name: "Rainfall Intensity", pct: Math.min(Math.round(peakDay * 3), 100) },
    { name: "Cumulative Volume", pct: Math.min(Math.round(totalRain / 2), 100) },
    { name: "Heavy Day Frequency", pct: Math.min(days.filter((d) => d.totalMm >= 15).length * 20, 100) },
    { name: "Storm Consistency", pct: Math.min(Math.round(avgDaily * 10), 100) },
    { name: "Peak Hour Severity", pct: Math.min(Math.round(Math.max(...days.map((d) => d.peakMm), 0) * 5), 100) },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Deep Dive"
          title="Risk Score Breakdown"
          desc="Live-computed from 16-day Open-Meteo forecast — rainfall intensity, volume, and storm patterns."
        />

        {loading ? (
          <div className="mt-12">
            <DashboardSkeleton />
          </div>
        ) : (
          <div ref={ref} className="mt-12 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 fs-glass-strong rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold tracking-tight">Live risk factors</p>
                <p className="text-xs text-muted-foreground">Computed from forecast</p>
              </div>

              <div className="mt-6 space-y-4">
                {weights.map((w, i) => (
                  <div key={w.name} className="group">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {w.name}
                      </p>
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
                <p className="text-xs text-muted-foreground">Composite Risk Score</p>
                <div className="mt-2 flex items-baseline gap-3">
                  <p className={`text-5xl font-bold tracking-tight ${risk.color}`}>{riskScore}</p>
                  <span className={`text-sm font-semibold ${risk.color}`}>{risk.label}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Based on {days.length}-day forecast • {totalRain.toFixed(1)} mm total
                </p>
              </div>
              <div className="fs-glass rounded-[2rem] p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Peak Day</p>
                    <p className="mt-1 font-mono text-lg font-bold text-foreground">{peakDay.toFixed(1)} mm</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Daily Avg</p>
                    <p className="mt-1 font-mono text-lg font-bold text-foreground">{avgDaily.toFixed(1)} mm</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dry Days</p>
                    <p className="mt-1 font-mono text-lg font-bold text-foreground">
                      {days.filter((d) => d.totalMm < 0.5).length}/{days.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Heavy Days</p>
                    <p className="mt-1 font-mono text-lg font-bold text-foreground">
                      {days.filter((d) => d.totalMm >= 15).length}/{days.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Alerts ---------- */

function generateAlerts(days: DayRain[]) {
  const alerts: { title: string; body: string; icon: typeof Bell; severity: "info" | "warn" | "danger" }[] = [];

  const heavyDays = days.filter((d) => d.totalMm >= 15);
  const moderateDays = days.filter((d) => d.totalMm >= 2.5 && d.totalMm < 15);
  const peakDay = days.length ? days.reduce((a, b) => (a.totalMm > b.totalMm ? a : b)) : null;
  const totalRain = days.reduce((s, d) => s + d.totalMm, 0);

  if (heavyDays.length > 0) {
    const nextHeavy = heavyDays[0];
    const dayName = nextHeavy.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    alerts.push({
      title: `Heavy rainfall expected on ${dayName}`,
      body: `${nextHeavy.totalMm.toFixed(1)} mm forecast. Prepare for potential waterlogging in low-lying areas.`,
      icon: ShieldAlert,
      severity: "danger",
    });
  }

  if (peakDay && peakDay.peakMm > 5) {
    alerts.push({
      title: `Intense hourly peak: ${peakDay.peakMm.toFixed(1)} mm/hr`,
      body: `Storm intensity detected. Short-duration flooding risk elevated for urban drainage zones.`,
      icon: Zap,
      severity: "danger",
    });
  }

  if (moderateDays.length >= 3) {
    alerts.push({
      title: `${moderateDays.length} days of sustained rainfall ahead`,
      body: `Cumulative saturation risk. Soil absorption capacity may reduce over the period.`,
      icon: AlertTriangle,
      severity: "warn",
    });
  }

  if (totalRain > 50) {
    alerts.push({
      title: `High cumulative rainfall: ${totalRain.toFixed(0)} mm over ${days.length} days`,
      body: `Consider alternate routes and monitor water levels near rivers and lakes.`,
      icon: CloudRain,
      severity: "warn",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      title: "No significant flood risk detected",
      body: `Rainfall remains low over the next ${days.length} days.`,
      icon: CloudSun,
      severity: "info",
    });
  }

  return alerts;
}

function Alerts({ days, loading }: { days: DayRain[]; loading: boolean }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const alerts = generateAlerts(days);

  const severityStyles = {
    info: "border-emerald-200/60 dark:border-emerald-800/40",
    warn: "border-amber-200/60 dark:border-amber-800/40",
    danger: "border-red-200/60 dark:border-red-800/40",
  };
  const iconStyles = {
    info: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    warn: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    danger: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Alert System"
          title="Data-driven alerts from live forecast"
          desc="Automatically generated from 16-day rainfall patterns — heavy rain, storm intensity, and cumulative risk."
        />

        {loading ? (
          <div className="mt-12">
            <DashboardSkeleton />
          </div>
        ) : (
          <div ref={ref} className="mt-12 grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7 fs-glass-strong rounded-[2rem] p-6 sm:p-8">
              <p className="text-sm font-semibold tracking-tight">Active alerts</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {alerts.length} alert{alerts.length !== 1 ? "s" : ""} based on current forecast
              </p>

              <div className="mt-6 space-y-3">
                {alerts.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <div
                      key={i}
                      className={
                        `fs-glass rounded-[1.25rem] p-4 border transition-all duration-700 ${severityStyles[a.severity]} ` +
                        (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")
                      }
                      style={{ transitionDelay: `${i * 120}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`grid size-10 shrink-0 place-items-center rounded-2xl ${iconStyles[a.severity]}`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold tracking-tight">{a.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 grid gap-4">
              <div className="fs-glass rounded-[2rem] p-6">
                <p className="text-xs text-muted-foreground">Forecast Window</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{days.length} days</p>
                <p className="mt-1 text-sm text-muted-foreground">Open-Meteo hourly data aggregated daily</p>
              </div>
              <div className="fs-glass rounded-[2rem] p-6">
                <p className="text-xs text-muted-foreground">Alert Sources</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Heavy rain thresholds, hourly peak intensity, multi-day saturation patterns, and cumulative volume
                  analysis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Shared tooltip style ---------- */

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "12px",
    fontSize: "12px",
    padding: "8px 12px",
    boxShadow: "0 8px 24px -8px rgba(0,0,0,0.15)",
  },
  labelStyle: { fontWeight: 600, marginBottom: 4 },
  cursor: { fill: "hsl(var(--muted) / 0.3)" },
};

/* ---------- Analytics Charts ---------- */

function Analytics({ days, loading }: { days: DayRain[]; loading: boolean }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  const chartData = days.map((d) => ({
    name: d.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    shortName: d.date.toLocaleDateString("en-US", { day: "numeric" }),
    rain: parseFloat(d.totalMm.toFixed(1)),
    peak: parseFloat(d.peakMm.toFixed(1)),
  }));

  // Compute y-axis domain with minimum so bars are visible even with low data
  const maxRain = Math.max(...chartData.map((d) => d.rain), 1);
  const maxPeak = Math.max(...chartData.map((d) => d.peak), 0.5);
  const rainDomain = [0, Math.ceil(maxRain * 1.3)];
  const peakDomain = [0, Math.ceil(maxPeak * 1.3)];

  // Cumulative chart
  let cumulative = 0;
  const cumulativeData = days.map((d) => {
    cumulative += d.totalMm;
    return {
      name: d.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: parseFloat(cumulative.toFixed(1)),
    };
  });
  const maxCumulative = Math.max(...cumulativeData.map((d) => d.total), 1);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Analytics"
          title="16-Day Rainfall Analytics"
          desc="Live charts from Open-Meteo forecast — daily totals, peak intensity, and cumulative trends."
        />

        {loading ? (
          <div className="mt-12">
            <DashboardSkeleton />
          </div>
        ) : (
          <div ref={ref} className="mt-12 space-y-6">
            {/* ---- Daily Rain Bar Chart (full width) ---- */}
            <div className="fs-glass-strong rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold tracking-tight">Daily Rainfall</p>
                  <p className="text-xs text-muted-foreground mt-1">Total precipitation per day (mm)</p>
                </div>
                <div className="flex items-center gap-3">
                  {[
                    { label: "Low", color: "bg-emerald-400" },
                    { label: "Moderate", color: "bg-amber-400" },
                    { label: "Heavy", color: "bg-red-400" },
                  ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className={`size-2 rounded-full ${l.color}`} /> {l.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-64" style={{ opacity: inView ? 1 : 0, transition: "opacity 800ms ease 200ms" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      domain={rainDomain}
                      tickFormatter={(v: number) => `${v}`}
                      label={{
                        value: "mm",
                        position: "insideTopLeft",
                        offset: -5,
                        style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
                      }}
                    />
                    <Tooltip {...tooltipStyle} formatter={(val: number) => [`${val} mm`, "Rainfall"]} />
                    <Bar dataKey="rain" radius={[6, 6, 0, 0]} name="Rain (mm)" maxBarSize={40}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={getBarColor(entry.rain)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ---- Two charts side by side ---- */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Cumulative area chart */}
              <div className="fs-glass-strong rounded-[2rem] p-6 sm:p-8">
                <div className="mb-6">
                  <p className="text-sm font-semibold tracking-tight">Cumulative Rainfall</p>
                  <p className="text-xs text-muted-foreground mt-1">Running total over the forecast window</p>
                </div>
                <div className="h-56" style={{ opacity: inView ? 1 : 0, transition: "opacity 800ms ease 400ms" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        interval={2}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                        domain={[0, Math.ceil(maxCumulative * 1.15)]}
                        label={{
                          value: "mm",
                          position: "insideTopLeft",
                          offset: -5,
                          style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
                        }}
                      />
                      <Tooltip {...tooltipStyle} formatter={(val: number) => [`${val} mm`, "Cumulative"]} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        fill="url(#cumGrad)"
                        name="Total (mm)"
                        dot={{ r: 2.5, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Peak intensity line chart */}
              <div className="fs-glass-strong rounded-[2rem] p-6 sm:p-8">
                <div className="mb-6">
                  <p className="text-sm font-semibold tracking-tight">Peak Hourly Intensity</p>
                  <p className="text-xs text-muted-foreground mt-1">Maximum rain rate per day (mm/hr)</p>
                </div>
                <div className="h-56" style={{ opacity: inView ? 1 : 0, transition: "opacity 800ms ease 600ms" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        interval={2}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                        domain={peakDomain}
                        label={{
                          value: "mm/hr",
                          position: "insideTopLeft",
                          offset: -5,
                          style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
                        }}
                      />
                      <Tooltip {...tooltipStyle} formatter={(val: number) => [`${val} mm/hr`, "Peak"]} />
                      <Line
                        type="monotone"
                        dataKey="peak"
                        stroke="hsl(0, 84%, 60%)"
                        strokeWidth={2.5}
                        name="Peak (mm/hr)"
                        dot={{ r: 3, fill: "hsl(0, 84%, 60%)", strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "hsl(0, 84%, 60%)", stroke: "white", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ MAIN ============ */

export default function Dashboard() {
  const { days, loading, error } = useRainForecast();

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
              <p className="text-sm font-semibold tracking-tight">AquaLens Dashboard</p>
              <p className="text-xs text-muted-foreground">Live forecast analytics • Hyderabad</p>
            </div>
          </div>

          {/* Quick stats pills */}
          {!loading && days.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs">
                <Droplets className="size-3 text-primary" />
                <span className="font-medium">{days.reduce((s, d) => s + d.totalMm, 0).toFixed(0)} mm</span>
                <span className="text-muted-foreground">total</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs">
                <TrendingUp className="size-3 text-primary" />
                <span className="font-medium">{days.length}</span>
                <span className="text-muted-foreground">days</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {error && (
          <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
              <p className="font-medium text-destructive">{error}</p>
            </div>
          </div>
        )}
        <RiskBreakdown days={days} loading={loading} />
        <Alerts days={days} loading={loading} />
        <Analytics days={days} loading={loading} />
      </main>

      <EmergencyButton />
    </div>
  );
}
