import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

/* ---------------- Color helpers (UNCHANGED) ---------------- */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(c1: number[], c2: number[], t: number) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

function rgbToCss([r, g, b]: number[]) {
  return `rgb(${r},${g},${b})`;
}

function floodColorRamp(value: number) {
  value = Math.max(0, Math.min(1, value));

  const GREEN = [0, 200, 0];
  const YELLOW = [255, 230, 0];
  const ORANGE = [255, 140, 0];
  const RED = [200, 0, 0];

  if (value <= 0.5) {
    return rgbToCss(lerpColor(GREEN, YELLOW, value / 0.5));
  }

  if (value <= 0.67) {
    return rgbToCss(
      lerpColor(YELLOW, ORANGE, (value - 0.5) / (0.67 - 0.5))
    );
  }

  return rgbToCss(
    lerpColor(ORANGE, RED, (value - 0.67) / (1 - 0.67))
  );
}

/* ---------------- Raster Layer ---------------- */

function FloodRasterLayer({
  setRainFactor,
}: {
  setRainFactor: (v: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    let layer: any;

    async function loadRaster() {
      /* GeoTIFF */
      const tif = await fetch("/data/partial_flood_score_250m.tif");
      const buffer = await tif.arrayBuffer();
      const georaster = await parseGeoraster(buffer);

      /* Rain data */
      const rainRes = await fetch(
        "https://api.open-meteo.com/v1/forecast" +
          "?latitude=17.406" +
          "&longitude=78.477" +
          "&hourly=rain" +
          "&forecast_days=1"
      );

      const rain = await rainRes.json();
      const hourlyRain: number[] = rain.hourly?.rain ?? [];

      // normalize rain → 0–1
      const maxRain = hourlyRain.length
        ? Math.max(...hourlyRain)
        : 0;

      const rain_factor = Math.min(maxRain / 20, 1); // 20mm cap
      const alpha = 0.8;

      setRainFactor(rain_factor);

      layer = new GeoRasterLayer({
        georaster,
        opacity: 0.6,
        pixelValuesToColorFn: (values: number[]) => {
          const p = values[0];
          if (p == null) return null;

          const flood = Math.min(
            p * (1 + alpha * rain_factor),
            1
          );

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
  }, [map, setRainFactor]);

  return null;
}

/* ---------------- Panels ---------------- */

function LegendPanel() {
  return (
    <div className="absolute right-4 top-4 z-[1000] rounded bg-white p-3 shadow">
      <div className="font-semibold mb-2">Flood Risk</div>
      {[
        ["Low", "rgb(0,200,0)"],
        ["Moderate", "rgb(255,230,0)"],
        ["High", "rgb(255,140,0)"],
        ["Severe", "rgb(200,0,0)"],
      ].map(([label, color]) => (
        <div key={label} className="flex items-center gap-2 text-sm">
          <span
            className="h-3 w-6 rounded"
            style={{ background: color }}
          />
          {label}
        </div>
      ))}
    </div>
  );
}

function InfoPanel({ rainFactor }: { rainFactor: number }) {
  return (
    <div className="absolute left-4 top-4 z-[1000] rounded bg-white p-3 shadow">
      <div className="font-semibold">Rain Impact</div>
      <div className="text-sm">
        Normalized Rain:{" "}
        <span className="font-mono">
          {(rainFactor * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

/* ---------------- Main Map ---------------- */

export default function FloodMap() {
  const [rainFactor, setRainFactor] = useState(0);

  return (
    <div className="h-screen w-full relative">
      <MapContainer
        center={[17.406, 78.477]}
        zoom={11}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <FloodRasterLayer setRainFactor={setRainFactor} />
      </MapContainer>

      <InfoPanel rainFactor={rainFactor} />
      <LegendPanel />
    </div>
  );
}
