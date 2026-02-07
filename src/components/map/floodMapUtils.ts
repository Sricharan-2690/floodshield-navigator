import type { HeatmapMode } from "./HeatmapModeSelector";

/* ---------------- Color helpers ---------------- */

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

const GREEN = [0, 200, 0];
const YELLOW = [255, 230, 0];
const ORANGE = [255, 140, 0];
const RED = [200, 0, 0];

export function floodColorRamp(value: number) {
  value = Math.max(0, Math.min(1, value));
  if (value <= 0.5) return rgbToCss(lerpColor(GREEN, YELLOW, value / 0.5));
  if (value <= 0.67) return rgbToCss(lerpColor(YELLOW, ORANGE, (value - 0.5) / (0.67 - 0.5)));
  return rgbToCss(lerpColor(ORANGE, RED, (value - 0.67) / (1 - 0.67)));
}

export function getRiskLevel(score: number): { label: string; color: string } {
  if (score <= 0.5) return { label: "Low", color: "rgb(0,200,0)" };
  if (score <= 0.67) return { label: "Moderate", color: "rgb(255,230,0)" };
  if (score <= 0.85) return { label: "High", color: "rgb(255,140,0)" };
  return { label: "Severe", color: "rgb(200,0,0)" };
}

/* ---------------- Types ---------------- */

export interface RainData {
  rainFactor: number;
  rain24h: number;
  rainMax: number;
}

export interface ClickedFloodInfo {
  lat: number;
  lng: number;
  score: number;
  level: string;
  color: string;
}

/* ---------------- Score computation ---------------- */

export function computeFloodScore(rawValue: number, rainFactor: number, mode: HeatmapMode): number {
  const p = Math.max(0, Math.min(rawValue, 1));
  if (p === 1) return 1;
  if (mode === "susceptibility") return p;
  const rainScale = Math.max(0.05, rainFactor);
  return Math.min(p * rainScale, 1);
}
