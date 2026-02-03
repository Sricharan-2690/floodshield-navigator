import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { ArrowLeft, CloudRain, Droplets, Zap, Locate } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmergencyButton } from "@/components/floodshield/EmergencyButton";
import { Button } from "@/components/ui/button";

import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

/* ---------------- Color helpers ---------------- */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(c1: number[], c2: number[], t: number) {
  return [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))];
}

function rgbToCss([r, g, b]: number[]) {
  return `rgb(${r},${g},${b})`;
}

const GREEN = [0, 200, 0];
const YELLOW = [255, 230, 0];
const ORANGE = [255, 140, 0];
const RED = [200, 0, 0];

function floodColorRamp(value: number) {
  value = Math.max(0, Math.min(1, value));

  if (value <= 0.5) {
    return rgbToCss(lerpColor(GREEN, YELLOW, value / 0.5));
  }

  if (value <= 0.67) {
    return rgbToCss(lerpColor(YELLOW, ORANGE, (value - 0.5) / (0.67 - 0.5)));
  }

  return rgbToCss(lerpColor(ORANGE, RED, (value - 0.67) / (1 - 0.67)));
}

function getRiskLevel(score: number): { label: string; color: string } {
  if (score <= 0.5) return { label: "Low", color: "rgb(0,200,0)" };
  if (score <= 0.67) return { label: "Moderate", color: "rgb(255,230,0)" };
  if (score <= 0.85) return { label: "High", color: "rgb(255,140,0)" };
  return { label: "Severe", color: "rgb(200,0,0)" };
}

/* ---------------- Types ---------------- */

interface RainData {
  rainFactor: number;
  rain24h: number;
  rainMax: number;
}

interface ClickedFloodInfo {
  lat: number;
  lng: number;
  score: number;
  level: string;
  color: string;
}

/* ---------------- Map Click Handler ---------------- */

function MapClickHandler({
  georasterRef,
  rainFactor,
  onFloodClick,
}: {
  georasterRef: React.MutableRefObject<any>;
  rainFactor: number;
  onFloodClick: (info: ClickedFloodInfo | null) => void;
}) {
  useMapEvents({
    click(e) {
      const georaster = georasterRef.current;
      if (!georaster) return;

      const { lat, lng } = e.latlng;
      const { xmin, xmax, ymin, ymax, pixelWidth, pixelHeight, values } = georaster;

      // Check if click is within raster bounds
      if (lng < xmin || lng > xmax || lat < ymin || lat > ymax) {
        onFloodClick(null);
        return;
      }

      // Calculate pixel indices
      const pixelX = Math.floor((lng - xmin) / pixelWidth);
      const pixelY = Math.floor((ymax - lat) / pixelHeight);

      // Get raw value
      const rawValue = values?.[0]?.[pixelY]?.[pixelX];

      if (rawValue == null || rawValue === 0) {
        onFloodClick(null);
        return;
      }

      // Apply same formula as rendering
      const alpha = 0.8;
      const floodScore = Math.min(rawValue * (1 + alpha * rainFactor), 1);
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

/* ---------------- Recenter Control ---------------- */

function RecenterControl({ userLocation }: { userLocation: [number, number] | null }) {
  const map = useMap();
  const defaultCenter: [number, number] = [17.406, 78.477];

  const handleRecenter = () => {
    const target = userLocation || defaultCenter;
    map.flyTo(target, 13, { duration: 1 });
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
}: {
  setRainData: (data: RainData) => void;
  georasterRef: React.MutableRefObject<any>;
}) {
  const map = useMap();

  useEffect(() => {
    let layer: any;

    async function loadRaster() {
      /* GeoTIFF */
      const tif = await fetch("/data/partial_flood_score_250m.tif");
      const buffer = await tif.arrayBuffer();
      const georaster = await parseGeoraster(buffer);

      // Store reference for click queries
      georasterRef.current = georaster;

      /* Rain data */
      const rainRes = await fetch(
        "https://api.open-meteo.com/v1/forecast" +
          "?latitude=17.406" +
          "&longitude=78.477" +
          "&hourly=rain" +
          "&forecast_days=1",
      );

      const rain = await rainRes.json();
      const hourlyRain: number[] = rain.hourly?.rain ?? [];

      // Calculate rain stats
      const rain24h = hourlyRain.reduce((sum, val) => sum + val, 0);
      const rainMax = hourlyRain.length ? Math.max(...hourlyRain) : 0;
      const rainFactor = Math.min(rainMax / 20, 1); // 20mm cap
      const alpha = 0.8;

      setRainData({ rainFactor, rain24h, rainMax });

      layer = new GeoRasterLayer({
        georaster,
        opacity: 0.6,
        pixelValuesToColorFn: (values: number[]) => {
          const p = values[0];
          if (p == null) return null;

          const flood = Math.min(p * (1 + alpha * rainFactor), 1);
          return floodColorRamp(flood);
        },
      });

      layer.addTo(map);
      map.fitBounds(layer.getBounds());
    }

    loadRaster();

    return () => {
      if (layer) map.removeLayer(layer);
    };
  }, [map, setRainData, georasterRef]);

  return null;
}

/* ---------------- Floating Header ---------------- */

function FloatingHeader() {
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
        <span className="text-sm font-semibold text-foreground">AquaLens Map</span>
      </div>
    </div>
  );
}

/* ---------------- Panels ---------------- */

function LegendPanel() {
  return (
    <div className="absolute right-4 top-20 z-[1000] fs-glass-strong rounded-2xl p-4">
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
    <div className="absolute left-4 top-20 z-[1000] fs-glass-strong rounded-2xl p-4 min-w-[180px]">
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

/* ---------------- Main Map ---------------- */

export default function FloodMap() {
  const [rainData, setRainData] = useState<RainData>({
    rainFactor: 0,
    rain24h: 0,
    rainMax: 0,
  });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [clickedFloodInfo, setClickedFloodInfo] = useState<ClickedFloodInfo | null>(null);
  const georasterRef = useRef<any>(null);

  // Request geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // Silently fail, use default center
        },
      );
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="h-screen w-full relative">
        <MapContainer center={[17.406, 78.477]} zoom={11} zoomControl={false} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <FloodRasterLayer setRainData={setRainData} georasterRef={georasterRef} />

          <MapClickHandler
            georasterRef={georasterRef}
            rainFactor={rainData.rainFactor}
            onFloodClick={setClickedFloodInfo}
          />

          <RecenterControl userLocation={userLocation} />

          {clickedFloodInfo && <FloodScoreDisplay info={clickedFloodInfo} />}
        </MapContainer>

        <FloatingHeader />
        <InfoPanel rainData={rainData} />
        <LegendPanel />
        <EmergencyButton />
      </div>
    </TooltipProvider>
  );
}
