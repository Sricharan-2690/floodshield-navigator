import { useEffect, useMemo, useState } from "react";

export type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export function useNominatimSearch(query: string) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    let cancelled = false;
    if (q.length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("format", "json");
        url.searchParams.set("q", q);
        url.searchParams.set("limit", "6");
        url.searchParams.set("addressdetails", "1");

        // Bias results to India (more like Uber/Rapido behavior).
        // Nominatim supports restricting by countrycodes.
        url.searchParams.set("countrycodes", "in");
        // Optional: bounding box around India to reduce cross-country noise.
        url.searchParams.set("viewbox", "68.1,35.7,97.4,6.5"); // left,top,right,bottom
        url.searchParams.set("bounded", "1");

        const res = await fetch(url.toString(), {
          headers: {
            // best-effort courtesy header
            Accept: "application/json",
            "Accept-Language": "en-IN,en;q=0.9",
          },
        });

        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data = (await res.json()) as NominatimResult[];
        if (!cancelled) setResults(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Search failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  return { results, loading, error };
}
