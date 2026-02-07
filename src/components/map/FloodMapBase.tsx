import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CloudRain, Droplets, Zap, Locate } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmergencyButton } from "@/components/floodshield/EmergencyButton";
import { Button } from "@/components/ui/button";
import type { HeatmapMode } from "./HeatmapModeSelector";
import {
  floodColorRamp,
  getRiskLevel,
  computeFloodScore,
  type RainData,
  type ClickedFloodInfo,
} from "./floodMapUtils";

import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

/* ---------------- Map Click Handler ---------------- */

function MapClickHandler({
  georasterRef,
  rainFactor,
  mode,
  onFloodClick,
}: {
  georasterRef: React.MutableRefObject<any>;
  rainFactor: number;
  mode: HeatmapMode;
  onFloodClick: (info: ClickedFloodInfo | null) => void;
}) {
  useMapEvents({
    click(e) {
      const georaster = georasterRef.current;
      if (!georaster) return;

      const { lat, lng } = e.latlng;
      const { xmin, xmax, ymin, ymax, pixelWidth, pixelHeight, values } = georaster;

      if (lng < xmin || lng > xmax || lat < ymin || lat > ymax) {
        onFloodClick(null);
        return;
      }

      const pixelX = Math.floor((lng - xmin) / pixelWidth);
      const pixelY = Math.floor((ymax - lat) / pixelHeight);
      const rawValue = values?.[0]?.[pixelY]?.[pixelX];

      if (rawValue == null || rawValue === 0) {
        onFloodClick(null);
        return;
      }

      const floodScore = computeFloodScore(rawValue, rainFactor, mode);
      const risk = getRiskLevel(floodScore);

      onFloodClick({
        lat,
        lng,
        score: floodScore,
        level: risk.label,
        color: risk.color,
      });
    },
  });

  return null;
}

/* ---------------- Current Location Marker ---------------- */

function CurrentLocationMarker({ position }: { position: [number, number] }) {
  return (
    <CircleMarker
      center={position}
      radius={10}
      pathOptions={{
        color: "white",
        fillColor: "hsl(217, 92%, 56%)",
        fillOpacity: 1,
        weight: 3,
        className: "animate-pulse",
      }}
    />
  );
}

/* ---------------- Auto Zoom to Location ---------------- */

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

/* ---------------- Recenter Control ---------------- */

function RecenterControl({ userLocation }: { userLocation: [number, number] | null }) {
  const map = useMap();
  const defaultCenter: [number, number] = [17.406, 78.477];

  const handleRecenter = () => {
    const target = userLocation || defaultCenter;
    map.flyTo(target, 14, { duration: 1 });
  };

  return (
    <Button
      onClick={handleRecenter}
      variant="glass-strong"
      className="fixed bottom-6 left-6 z-[1000] gap-2 shadow-elev"
    >
      <Locate className="size-4" />
      <span className="text-sm font-medium">Recenter</span>
    </Button>
  );
}

/* ---------------- Raster Layer ---------------- */

function FloodRasterLayer({
  setRainData,
  georasterRef,
  mode,
}: {
  setRainData: (data: RainData) => void;
  georasterRef: React.MutableRefObject<any>;
  mode: HeatmapMode;
}) {
  const map = useMap();
  const rainDataRef = useRef<RainData>({ rainFactor: 0, rain24h: 0, rainMax: 0 });
  const georasterDataRef = useRef<any>(null);
  const [dataReady, setDataReady] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const tif = await fetch("/data/partial_flood_score_250m.tif");
      const buffer = await tif.arrayBuffer();
      const georaster = await parseGeoraster(buffer);

      if (!isMounted) return;
      georasterDataRef.current = georaster;
      georasterRef.current = georaster;

      const rainRes = await fetch(
        "https://api.open-meteo.com/v1/forecast" +
          "?latitude=17.406" +
          "&longitude=78.477" +
          "&hourly=rain" +
          "&forecast_days=1",
      );
      const rain = await rainRes.json();
      const hourlyRain: number[] = rain.hourly?.rain ?? [];
      const rain24h = hourlyRain.reduce((sum, val) => sum + val, 0);
      const rainMax = hourlyRain.length ? Math.max(...hourlyRain) : 0;
      const rainFactor = Math.min(rainMax / 20, 1);

      if (!isMounted) return;
      rainDataRef.current = { rainFactor, rain24h, rainMax };
      setRainData({ rainFactor, rain24h, rainMax });
      setDataReady((n) => n + 1);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [setRainData, georasterRef]);

  useEffect(() => {
    const georaster = georasterDataRef.current;
    if (!georaster || !map || !map.getPane("overlayPane")) return;

    const { rainFactor } = rainDataRef.current;

    const layer = new GeoRasterLayer({
      georaster,
      opacity: 0.6,
      resolution: 512,
      pixelValuesToColorFn: (values: number[]) => {
        const p = values[0];
        if (p == null) return null;
        return floodColorRamp(computeFloodScore(p, rainFactor, mode));
      },
    });

    layer.addTo(map);

    return () => {
      try {
        map.removeLayer(layer);
      } catch (_) {}
    };
  }, [map, mode, dataReady]);

  return null;
}

/* ---------------- Floating Header ---------------- */

function FloatingHeader({ title }: { title: string }) {
  return (
    <div className="fixed top-4 left-4 right-4 z-[1000] flex items-center gap-4">
      <Link
        to="/"
        className="fs-glass-strong flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:shadow-elev"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <div className="fs-glass-strong rounded-xl px-5 py-2.5">
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
    </div>
  );
}

/* ---------------- Mode Navigation Tabs ---------------- */

function ModeNavTabs({ currentMode }: { currentMode: HeatmapMode }) {
  const navigate = useNavigate();

  const tabs = [
    { mode: "realtime" as const, label: "Real-time Risk", path: "/map/risk", icon: CloudRain },
    { mode: "susceptibility" as const, label: "Susceptibility", path: "/map/susceptibility", icon: Droplets },
  ];

  return (
    <div className="fixed top-4 right-4 z-[1004]" style={{ marginTop: "3.5rem" }}>
      <div className="fs-glass-strong rounded-xl p-1 flex gap-1 shadow-elev">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.mode === currentMode;
          return (
            <button
              key={tab.mode}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Panels ---------------- */

function LegendPanel() {
  return (
    <div className="absolute right-4 top-56 z-[1000] fs-glass-strong rounded-2xl p-4">
      <div className="font-semibold text-foreground mb-3">Flood Risk</div>
      <div className="space-y-2">
        {[
          ["Low", "rgb(0,200,0)"],
          ["Moderate", "rgb(255,230,0)"],
          ["High", "rgb(255,140,0)"],
          ["Severe", "rgb(200,0,0)"],
        ].map(([label, color]) => (
          <div key={label} className="flex items-center gap-3 text-sm text-foreground/80">
            <span className="h-3 w-6 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoPanel({ rainData }: { rainData: RainData }) {
  return (
    <div className="absolute left-4 top-40 z-[1000] fs-glass-strong rounded-2xl p-4 min-w-[180px]">
      <div className="font-semibold text-foreground mb-1">AquaLens Live</div>
      <div className="text-xs text-muted-foreground mb-3">Rainfall Impact</div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <CloudRain className="size-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Normalized</div>
            <div className="font-mono text-sm font-semibold text-foreground">
              {(rainData.rainFactor * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Droplets className="size-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">24h Rain</div>
            <div className="font-mono text-sm font-semibold text-foreground">{rainData.rain24h.toFixed(1)} mm</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="size-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Peak Hour</div>
            <div className="font-mono text-sm font-semibold text-foreground">{rainData.rainMax.toFixed(1)} mm</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Flood Score Popup ---------------- */

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
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: info.color, color: info.level === "Low" ? "#000" : "#fff" }}
          >
            {info.level}
          </span>
        </div>
      </div>
    </Popup>
  );
}

/* ---------------- Main Base Component ---------------- */

interface FloodMapBaseProps {
  mode: HeatmapMode;
  title: string;
}

export default function FloodMapBase({ mode, title }: FloodMapBaseProps) {
  const [rainData, setRainData] = useState<RainData>({
    rainFactor: 0,
    rain24h: 0,
    rainMax: 0,
  });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [clickedFloodInfo, setClickedFloodInfo] = useState<ClickedFloodInfo | null>(null);
  const georasterRef = useRef<any>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
      );
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="h-screen w-full relative">
        <MapContainer
          center={[17.406, 78.477]}
          zoom={11}
          zoomControl={false}
          className="h-full w-full"
          minZoom={10}
          maxZoom={16}
          zoomSnap={1}
          zoomDelta={1}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <FloodRasterLayer setRainData={setRainData} georasterRef={georasterRef} mode={mode} />

          <MapClickHandler
            georasterRef={georasterRef}
            rainFactor={rainData.rainFactor}
            mode={mode}
            onFloodClick={setClickedFloodInfo}
          />

          <AutoZoomToLocation userLocation={userLocation} />

          {userLocation && <CurrentLocationMarker position={userLocation} />}

          <RecenterControl userLocation={userLocation} />

          {clickedFloodInfo && <FloodScoreDisplay info={clickedFloodInfo} />}
        </MapContainer>

        <FloatingHeader title={title} />
        {mode === "realtime" && <InfoPanel rainData={rainData} />}
        <ModeNavTabs currentMode={mode} />
        <LegendPanel />
        <EmergencyButton />
      </div>
    </TooltipProvider>
  );
}
