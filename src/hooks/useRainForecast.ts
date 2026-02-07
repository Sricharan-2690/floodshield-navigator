import { useEffect, useState } from "react";
import { fetchWeatherApi } from "openmeteo";

export interface DayRain {
  date: Date;
  totalMm: number;
  peakMm: number;
}

export function useRainForecast() {
  const [days, setDays] = useState<DayRain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = {
          latitude: 17.384,
          longitude: 78.4564,
          hourly: ["temperature_2m", "rain"],
          forecast_days: 16,
        };

        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);
        if (cancelled) return;

        const response = responses[0];
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const hourly = response.hourly()!;

        const times = Array.from(
          { length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval() },
          (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000),
        );
        const rainValues = hourly.variables(1)!.valuesArray()!;

        // Group hourly rain by day
        const dayMap = new Map<string, { date: Date; hours: number[] }>();

        for (let i = 0; i < times.length; i++) {
          const d = times[i];
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          if (!dayMap.has(key)) {
            dayMap.set(key, { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), hours: [] });
          }
          dayMap.get(key)!.hours.push(rainValues[i]);
        }

        const result: DayRain[] = [];
        for (const [, v] of dayMap) {
          result.push({
            date: v.date,
            totalMm: v.hours.reduce((s, h) => s + h, 0),
            peakMm: Math.max(...v.hours),
          });
        }

        result.sort((a, b) => a.date.getTime() - b.date.getTime());
        if (!cancelled) {
          setDays(result);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || "Failed to fetch weather data");
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { days, loading, error };
}
