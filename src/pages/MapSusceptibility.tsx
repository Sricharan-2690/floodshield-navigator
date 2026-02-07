import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CloudRain, Droplets, Locate } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmergencyButton } from "@/components/floodshield/EmergencyButton";
import { Button } from "@/components/ui/button";
import {
  floodColorRamp,
  getRiskLevel,
  computeFloodScore,
  type ClickedFloodInfo,
} from "@/components/map/floodMapUtils";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

/* ---------- Map Click Handler ---------- */
function SusceptibilityMapClickHandler({
  georasterRef,
  onFloodClick,
}: {
  georasterRef: React.MutableRefObject<any>;
  onFloodClick: (info: ClickedFloodInfo | null) => void;
}) {
  useMapEvents({
    click(e) {
      const georaster = georasterRef.current;
      if (!georaster) return;
      const { lat, lng } = e.latlng;
      const { xmin, xmax, ymin, ymax, pixelWidth, pixelHeight, values } = georaster;
      if (lng < xmin || lng > xmax || lat < ymin || lat > ymax) { onFloodClick(null); return; }
      const pixelX = Math.floor((lng - xmin) / pixelWidth);
      const pixelY = Math.floor((ymax - lat) / pixelHeight);
      const rawValue = values?.[0]?.[pixelY]?.[pixelX];
      if (rawValue == null || rawValue === 0) { onFloodClick(null); return; }
      const floodScore = computeFloodScore(rawValue, 0, "susceptibility");
      const risk = getRiskLevel(floodScore);
      onFloodClick({ lat, lng, score: floodScore, level: risk.label, color: risk.color });
    },
  });
  return null;
}

/* ---------- Raster Layer ---------- */
function SusceptibilityRasterLayer({
  georasterRef,
}: {
  georasterRef: React.MutableRefObject<any>;
}) {
  const map = useMap();
  const [dataReady, setDataReady] = useState(0);
  const georasterDataRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const tif = await fetch("/data/partial_flood_score_250m.tif");
      const buffer = await tif.arrayBuffer();
      const georaster = await parseGeoraster(buffer);
      if (!isMounted) return;
      georasterDataRef.current = georaster;
      georasterRef.current = georaster;
      setDataReady((n) => n + 1);
    }
    loadData();
    return () => { isMounted = false; };
  }, [georasterRef]);

  useEffect(() => {
    const georaster = georasterDataRef.current;
    if (!georaster || !map || !map.getPane("overlayPane")) return;
    const layer = new GeoRasterLayer({
      georaster,
      opacity: 0.6,
      resolution: 512,
      pixelValuesToColorFn: (values: number[]) => {
        const p = values[0];
        if (p == null) return null;
        return floodColorRamp(computeFloodScore(p, 0, "susceptibility"));
      },
    });
    layer.addTo(map);
    return () => { try { map.removeLayer(layer); } catch (_) {} };
  }, [map, dataReady]);

  return null;
}

/* ---------- Shared small components ---------- */
function CurrentLocationMarker({ position }: { position: [number, number] }) {
  return (
    <CircleMarker center={position} radius={10}
      pathOptions={{ color: "white", fillColor: "hsl(217, 92%, 56%)", fillOpacity: 1, weight: 3, className: "animate-pulse" }}
    />
  );
}

function AutoZoomToLocation({ userLocation }: { userLocation: [number, number] | null }) {
  const map = useMap();
  const hasZoomed = useRef(false);
  useEffect(() => {
    if (userLocation && !hasZoomed.current) {
      hasZoomed.current = true;
      map.flyTo(userLocation, 14, { duration: 1.5 });
    }
  }, [userLocation, map]);
  return null;
}

function RecenterControl({ userLocation }: { userLocation: [number, number] | null }) {
  const map = useMap();
  const defaultCenter: [number, number] = [17.406, 78.477];
  return (
    <Button onClick={() => map.flyTo(userLocation || defaultCenter, 14, { duration: 1 })}
      variant="glass-strong" className="fixed bottom-6 left-6 z-[1000] gap-2 shadow-elev">
      <Locate className="size-4" />
      <span className="text-sm font-medium">Recenter</span>
    </Button>
  );
}

function FloodScoreDisplay({ info }: { info: ClickedFloodInfo }) {
  return (
    <Popup position={[info.lat, info.lng]} closeButton={true}>
      <div className="p-1 min-w-[140px]">
        <div className="text-xs text-muted-foreground mb-1">Flood Risk Score</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="size-3 rounded-full" style={{ background: info.color }} />
          <span className="font-mono text-lg font-bold">{info.score.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Risk Level:</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: info.color, color: info.level === "Low" ? "#000" : "#fff" }}>
            {info.level}
          </span>
        </div>
      </div>
    </Popup>
  );
}

/* ---------- Nav Tabs ---------- */
function ModeNavTabs() {
  const navigate = useNavigate();
  return (
    <div className="fixed top-4 right-4 z-[1004]" style={{ marginTop: "3.5rem" }}>
      <div className="fs-glass-strong rounded-xl p-1 flex gap-1 shadow-elev">
        <button onClick={() => navigate("/map/risk")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50">
          <CloudRain className="size-4" /> Real-time Risk
        </button>
        <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-primary text-primary-foreground shadow-sm">
          <Droplets className="size-4" /> Susceptibility
        </button>
      </div>
    </div>
  );
}

/* ---------- Panels ---------- */
function LegendPanel() {
  return (
    <div className="absolute right-4 top-56 z-[1000] fs-glass-strong rounded-2xl p-4">
      <div className="font-semibold text-foreground mb-3">Flood Risk</div>
      <div className="space-y-2">
        {([["Low","rgb(0,200,0)"],["Moderate","rgb(255,230,0)"],["High","rgb(255,140,0)"],["Severe","rgb(200,0,0)"]] as const).map(([label, color]) => (
          <div key={label} className="flex items-center gap-3 text-sm text-foreground/80">
            <span className="h-3 w-6 rounded-full" style={{ background: color }} /> {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingHeader() {
  return (
    <div className="fixed top-4 left-4 right-4 z-[1000] flex items-center gap-4">
      <Link to="/" className="fs-glass-strong flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:shadow-elev">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="fs-glass-strong rounded-xl px-5 py-2.5">
        <span className="text-sm font-semibold text-foreground">AquaLens — Susceptibility</span>
      </div>
    </div>
  );
}

/* ============ MAIN PAGE ============ */
export default function MapSusceptibility() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [clickedFloodInfo, setClickedFloodInfo] = useState<ClickedFloodInfo | null>(null);
  const georasterRef = useRef<any>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      }, () => {});
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="h-screen w-full relative">
        <MapContainer center={[17.406, 78.477]} zoom={11} zoomControl={false}
          className="h-full w-full" minZoom={10} maxZoom={16} zoomSnap={1} zoomDelta={1}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          <SusceptibilityRasterLayer georasterRef={georasterRef} />
          <SusceptibilityMapClickHandler georasterRef={georasterRef} onFloodClick={setClickedFloodInfo} />
          <AutoZoomToLocation userLocation={userLocation} />
          {userLocation && <CurrentLocationMarker position={userLocation} />}
          <RecenterControl userLocation={userLocation} />
          {clickedFloodInfo && <FloodScoreDisplay info={clickedFloodInfo} />}
        </MapContainer>
        <FloatingHeader />
        <ModeNavTabs />
        <LegendPanel />
        <EmergencyButton />
      </div>
    </TooltipProvider>
  );
}
