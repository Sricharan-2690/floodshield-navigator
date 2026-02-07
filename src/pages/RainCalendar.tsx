import { Link } from "react-router-dom";
import { ArrowLeft, CloudRain, Droplets, CloudSun } from "lucide-react";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { useRainForecast, type DayRain } from "@/hooks/useRainForecast";

/* ---------- Helpers ---------- */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getRainLevel(totalMm: number): {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: typeof CloudSun;
} {
  if (totalMm < 2.5) {
    return {
      label: "Low",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      text: "text-emerald-800 dark:text-emerald-200",
      border: "border-emerald-300/60 dark:border-emerald-700/60",
      icon: CloudSun,
    };
  }
  if (totalMm < 15) {
    return {
      label: "Moderate",
      bg: "bg-amber-100 dark:bg-amber-900/40",
      text: "text-amber-800 dark:text-amber-200",
      border: "border-amber-300/60 dark:border-amber-700/60",
      icon: Droplets,
    };
  }
  return {
    label: "Heavy",
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-300/60 dark:border-red-700/60",
    icon: CloudRain,
  };
}

/* ---------- Day Cell ---------- */

function DayCell({ day }: { day: DayRain }) {
  const level = getRainLevel(day.totalMm);
  const Icon = level.icon;
  const isToday =
    day.date.toDateString() === new Date().toDateString();

  return (
    <div
      className={`
        group relative flex flex-col items-center justify-between
        rounded-2xl border p-3 transition-all duration-200
        hover:scale-[1.04] hover:shadow-lg
        ${level.bg} ${level.border}
        ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
      `}
    >
      {/* Day of week */}
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {WEEKDAYS[day.date.getDay()]}
      </span>

      {/* Date number */}
      <span className={`text-2xl font-bold ${level.text}`}>
        {day.date.getDate()}
      </span>

      {/* Icon */}
      <Icon className={`size-5 ${level.text} opacity-70`} />

      {/* Rain total */}
      <span className={`mt-1 font-mono text-xs font-semibold ${level.text}`}>
        {day.totalMm.toFixed(1)} mm
      </span>

      {/* Label badge */}
      <span
        className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${level.text} ${level.bg}`}
      >
        {level.label}
      </span>

      {/* Today indicator */}
      {isToday && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
          Today
        </span>
      )}
    </div>
  );
}

/* ---------- Empty Cell (padding) ---------- */
function EmptyCell() {
  return <div className="rounded-2xl border border-transparent" />;
}

/* ---------- Legend ---------- */
function Legend() {
  const items = [
    { label: "Low (< 2.5 mm)", className: "bg-emerald-400" },
    { label: "Moderate (2.5–15 mm)", className: "bg-amber-400" },
    { label: "Heavy (> 15 mm)", className: "bg-red-400" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={`size-3 rounded-full ${item.className}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

/* ---------- Loading Skeleton ---------- */
function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-3">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="h-36 animate-pulse rounded-2xl border border-border bg-muted/50"
        />
      ))}
    </div>
  );
}

/* ============ MAIN PAGE ============ */
export default function RainCalendar() {
  const { days, loading, error } = useRainForecast();

  // Compute leading empty cells so the first date aligns with its weekday
  const leadingBlanks = days.length > 0 ? days[0].date.getDay() : 0;

  // Group days by month for the header
  const firstMonth = days.length > 0 ? days[0].date : new Date();
  const lastMonth = days.length > 0 ? days[days.length - 1].date : new Date();
  const monthLabel =
    firstMonth.getMonth() === lastMonth.getMonth()
      ? `${MONTHS[firstMonth.getMonth()]} ${firstMonth.getFullYear()}`
      : `${MONTHS[firstMonth.getMonth()]} – ${MONTHS[lastMonth.getMonth()]} ${lastMonth.getFullYear()}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <HamburgerMenu />
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Rain Forecast Calendar
            </h1>
            <p className="text-xs text-muted-foreground">
              Hyderabad · 16-day hourly rain forecast
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Legend */}
        <Legend />

        {/* Month label */}
        {!loading && !error && (
          <h2 className="text-center text-xl font-semibold text-foreground">
            {monthLabel}
          </h2>
        )}

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-3">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <CalendarSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center">
            <p className="font-medium text-destructive">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-3">
            {/* Leading blank cells */}
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <EmptyCell key={`blank-${i}`} />
            ))}

            {/* Day cells */}
            {days.map((day) => (
              <DayCell key={day.date.toISOString()} day={day} />
            ))}
          </div>
        )}

        {/* Summary stats */}
        {!loading && !error && days.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Rainfall",
                value: `${days.reduce((s, d) => s + d.totalMm, 0).toFixed(1)} mm`,
                icon: Droplets,
              },
              {
                label: "Heaviest Day",
                value: `${Math.max(...days.map((d) => d.totalMm)).toFixed(1)} mm`,
                icon: CloudRain,
              },
              {
                label: "Dry Days",
                value: `${days.filter((d) => d.totalMm < 0.5).length} of ${days.length}`,
                icon: CloudSun,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="fs-glass-strong rounded-2xl p-5 text-center"
                >
                  <Icon className="mx-auto mb-2 size-6 text-primary" />
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="mt-1 font-mono text-xl font-bold text-foreground">
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
