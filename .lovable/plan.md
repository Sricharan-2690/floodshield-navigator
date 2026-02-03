
# AquaLens Map Page Beautification

## Overview

This plan enhances the Map page with premium glassmorphism styling, adds a recenter button, integrates the emergency call button, displays 24-hour rainfall data, and enables click-to-query functionality for flood scores from the GeoTIFF.

---

## Current State

The Map page currently has:
- Basic white panels with simple shadows
- Displays only "Normalized Rain" percentage
- No recenter button
- No emergency button
- No click interaction to query pixel values

---

## Changes Summary

| Feature | Current | After |
|---------|---------|-------|
| Info Panel | Plain white, basic shadow | Glassmorphism with fs-glass-strong |
| Legend Panel | Plain white, basic shadow | Glassmorphism with fs-glass-strong |
| Stats Displayed | Normalized Rain % only | + 24h Rain (mm), Max Rain (mm) |
| Recenter Button | Missing | Added (bottom-left, compass icon) |
| Emergency Button | Missing | Added (bottom-right, pulsing red) |
| Click Interaction | None | Click pixel to show flood score popup |
| Header | None | Minimal floating header with back link |

---

## Implementation Details

### 1. Enhanced Info Panel (Glassmorphism + More Stats)

```text
+-----------------------------------+
|  AquaLens Live                    |
|  -------------------------------- |
|  Rainfall Impact                  |
|  Normalized: 65%                  |
|  24h Total: 12.4 mm               |
|  Peak Hour: 8.2 mm                |
+-----------------------------------+
```

- Apply `fs-glass-strong` class for premium look
- Display three rain metrics:
  - Normalized rain factor (0-100%)
  - 24h cumulative rainfall (sum of hourly values)
  - Peak hourly rainfall (max value)
- Add subtle icons (CloudRain, Droplets)

### 2. Enhanced Legend Panel

- Apply `fs-glass-strong` styling
- Keep existing color ramp display
- Add subtle border radius and proper spacing

### 3. Recenter Button (Bottom-Left with text showing recenter like google maps)

```text
Position: fixed bottom-6 left-6
Style: Glass button with compass/locate icon
Behavior:
  - Stores user's geolocation on load (if granted)
  - On click: fly to stored location or default center
  - Subtle hover animation
```

### 4. Emergency Button Integration

- Import existing `EmergencyButton` component
- Place at fixed bottom-6 right-6 position
- Already has pulsing animation and tel:112 link

### 5. Click-to-Query Flood Score

When user clicks on the raster overlay:

```text
Behavior:
1. Get click coordinates (lat, lng)
2. Sample georaster at that point
3. Apply rain factor adjustment (same formula as rendering)
4. Show popup/tooltip with:
   - "Flood Risk Score: 0.73"
   - Risk level label (Low/Moderate/High/Severe)
   - Color indicator matching the ramp
```

Implementation:
- Store georaster reference in state after loading
- Add click handler to map
- Use `georaster.getValueAtPoint()` or calculate from pixel coordinates
- Display result in Leaflet popup or custom overlay

### 6. Minimal Floating Header

```text
+------------------------------------------+
|  ← Back   |   AquaLens Map               |
+------------------------------------------+
```

- Fixed top position, glassmorphism styling
- Back link to home page
- Subtle and doesn't obstruct map

---

## State Management

Track these values in the main component:

```text
- rainFactor: number (normalized 0-1)
- rain24h: number (cumulative mm)
- rainMax: number (peak hourly mm)
- georasterRef: any (for click queries)
- userLocation: [lat, lng] | null
- clickedScore: { lat, lng, score, level } | null
```

---

## File Changes

| File | Changes |
|------|---------|
| `src/pages/Map.tsx` | Major updates - styling, new features |

### Detailed Changes to Map.tsx

1. **Imports**: Add Lucide icons (CloudRain, Droplets, Compass, ArrowLeft), EmergencyButton component, Link from react-router-dom

2. **State additions**:
   - `rain24h` - total 24h rainfall in mm
   - `rainMax` - peak hourly rainfall in mm
   - `georasterRef` - reference to loaded georaster
   - `userLocation` - stored geolocation coordinates
   - `clickedFloodInfo` - clicked pixel flood score info

3. **FloodRasterLayer updates**:
   - Calculate and pass 24h sum and max values
   - Store georaster reference for click queries
   - Add map click handler for pixel querying

4. **New components**:
   - `RecenterButton` - glassmorphism button with Compass icon
   - `FloatingHeader` - minimal back link and title
   - `FloodScorePopup` - displays clicked pixel info

5. **InfoPanel updates**:
   - fs-glass-strong styling
   - Three rain statistics with icons
   - Better typography and layout

6. **LegendPanel updates**:
   - fs-glass-strong styling
   - Improved spacing and rounded corners

7. **Main component updates**:
   - Include EmergencyButton
   - Include RecenterButton
   - Include FloatingHeader
   - Geolocation request on mount

---

## Visual Layout

```text
+----------------------------------------------------------+
|  [← Back]  AquaLens Map                    (header bar)  |
+----------------------------------------------------------+
|                                                          |
|  +----------------+              +------------------+    |
|  | AquaLens Live  |              |    Flood Risk    |    |
|  | -------------- |              | ○ Low            |    |
|  | ☁ Normalized   |              | ○ Moderate       |    |
|  |   65%          |              | ○ High           |    |
|  | 💧 24h Rain    |              | ○ Severe         |    |
|  |   12.4 mm      |              +------------------+    |
|  | ⚡ Peak        |                                      |
|  |   8.2 mm       |                                      |
|  +----------------+                                      |
|                                                          |
|                    [Map Content]                         |
|                                                          |
|           +------------------------+                     |
|           | Flood Score: 0.73      | (click popup)      |
|           | Risk Level: High       |                     |
|           +------------------------+                     |
|                                                          |
|  +--------+                                   +-------+  |
|  |  ◎     |                                   |  📞   |  |
|  +--------+                                   +-------+  |
|  (recenter)                                  (emergency) |
+----------------------------------------------------------+
```

---

## Technical Notes

### Georaster Click Query

The georaster library provides methods to query pixel values:
- Use `georaster.toCanvas()` approach or
- Calculate pixel coordinates from lat/lng using georaster bounds
- Sample the raster values array directly

Formula to get pixel indices:
```
pixelX = (lng - xmin) / pixelWidth
pixelY = (ymax - lat) / pixelHeight
value = georaster.values[0][Math.floor(pixelY)][Math.floor(pixelX)]
```

### Geolocation Flow

1. On component mount, request geolocation
2. If granted, store coordinates in state
3. Optionally center map on user location
4. Recenter button uses stored location

### Rain Data Extraction

From Open-Meteo API response:
- `rain.hourly.rain` is array of 24 hourly values
- Sum all values for 24h total
- Max of array for peak value
- Current normalization stays (maxRain / 20, capped at 1)
