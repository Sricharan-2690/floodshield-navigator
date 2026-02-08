import { CircleMarker, Tooltip } from "react-leaflet";
import { useDangerAlertsRealtime } from "@/hooks/useDangerAlertsRealtime";
import { useNonExpired } from "@/lib/expiry";

export default function DangerAlertMarkers() {
  const { alerts } = useDangerAlertsRealtime();
  const active = useNonExpired(alerts);

  return (
    <>
      {active.map((a) => (
        <CircleMarker
          key={a.id}
          center={[a.lat, a.lng]}
          radius={9}
          pathOptions={{
            color: "hsl(var(--destructive))",
            fillColor: "hsl(var(--destructive))",
            fillOpacity: 0.75,
            weight: 2,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={1}>
            <div className="max-w-[220px]">
              <div className="text-xs font-semibold">{a.location_text}</div>
              <div className="text-xs text-muted-foreground mt-1">{a.message}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
