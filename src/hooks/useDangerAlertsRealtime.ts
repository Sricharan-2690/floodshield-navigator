import { useEffect, useState } from "react";
import { db } from "@/integrations/supabase/db";
import type { DangerAlert } from "@/types/danger-alerts";

export function useDangerAlertsRealtime() {
  const [alerts, setAlerts] = useState<DangerAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const { data, error } = await db
      .from("danger_alerts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setAlerts((data ?? []) as DangerAlert[]);
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await refresh();
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Failed to load alerts");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const channel = db
      .channel("danger-alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "danger_alerts" },
        () => {
          // Avoid heavy merge logic; just refresh.
          refresh().catch(() => {});
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      db.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { alerts, loading, error, refresh };
}
