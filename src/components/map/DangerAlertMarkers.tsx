import type { CSSProperties } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import { useDangerAlertsRealtime } from "@/hooks/useDangerAlertsRealtime";
import { useNonExpired } from "@/lib/expiry";

function clamp2Style(): CSSProperties {
  return {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as any,
    WebkitLineClamp: 2,
    overflow: "hidden",
  };
}

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
          eventHandlers={{
            click: () => {
              // Use hard navigation (consistent with the map mode tabs) to avoid Leaflet caching quirks.
              window.location.href = `/danger-alerts?focus=${encodeURIComponent(a.id)}`;
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={1}>
            <div className="max-w-[240px]">
              <div
                className="text-xs font-semibold leading-snug"
                style={clamp2Style()}
                title={a.location_text}
              >
                {a.location_text}
              </div>
              <div
                className="mt-1 text-xs text-muted-foreground leading-snug"
                style={clamp2Style()}
                title={a.message}
              >
                {a.message}
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Click to open post</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

