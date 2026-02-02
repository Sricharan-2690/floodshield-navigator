
# FloodShield: Route Guidance Page and Landing Page Refinement

## Overview

This plan creates a new dedicated Route Guidance page where users can input source and destination to get safe routing options, and updates the landing page to have a compact, showcase-style route preview section instead of the current full-screen visualization.

---

## New Route Guidance Page (`/routes`)

### Page Structure

```text
/routes
├── Header (minimal - logo + back to home)
├── Route Input Section
│   ├── Source input field (with autocomplete/location picker)
│   ├── Destination input field (with autocomplete/location picker)
│   ├── "Find Safe Routes" button
│   └── Optional: "Use Current Location" for source
├── Results Section (appears after search)
│   ├── Route Options Cards
│   │   ├── Recommended Safe Route (green)
│   │   │   ├── Duration, distance
│   │   │   ├── Risk level indicator
│   │   │   └── "Start Navigation" button
│   │   ├── Fastest Route (yellow/warn)
│   │   │   ├── Duration, distance
│   │   │   ├── Risk warnings
│   │   │   └── "Start Navigation" button
│   │   └── Alternative Route (if applicable)
│   ├── Route Comparison Summary
│   │   ├── Time difference
│   │   ├── Risk difference
│   │   └── Avoided zones count
│   └── Visual Map Preview (animated route lines)
└── Emergency Button (bottom-right, fixed)
```

### Features

| Feature | Description |
|---------|-------------|
| **Source/Destination Inputs** | Clean glassmorphism input fields with MapPin icons |
| **Location Detection** | Optional button to use current GPS location as source |
| **Route Cards** | Premium cards showing each route option with risk assessment |
| **Visual Comparison** | Animated SVG showing safe vs risky routes |
| **Risk Indicators** | Color-coded badges (green/yellow/red) for each route segment |
| **Action Buttons** | "Start Guidance" and "Compare Details" per route |

### UI Design

- Apple-style glassmorphism cards
- Consistent with landing page aesthetic
- Animated entrance for route results
- Pulsing markers on route visualization
- Clear visual hierarchy: inputs at top, results below

---

## Updated Landing Page Route Preview

### Current State (Full Section)
The current `RoutePlanner` component takes up a full section with:
- Large animated map visualization
- SVG route paths
- Animated vehicle icon
- Legend cards

### New State (Compact Showcase)

Replace the full `RoutePlanner` section with a compact, showcase-style preview:

```text
Route Planner Preview Section
├── Section Title (same eyebrow/title/desc pattern)
├── Compact Preview Card
│   ├── Left: Small animated route illustration (simplified)
│   ├── Right: Description + CTA
│   │   ├── "Plan your safest route"
│   │   ├── Brief 1-2 sentence description
│   │   └── "Try Route Planner" button → /routes
│   └── Optional: Mini legend (inline, not cards)
```

### Design Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Height** | Full viewport section (~80vh) | Compact card (~300-400px) |
| **Map Visualization** | Large with full SVG routes | Smaller, simplified preview |
| **Vehicle Animation** | Full path animation | Removed or subtle |
| **Legend** | 3 separate cards | Inline compact legend |
| **CTA** | None | "Try Route Planner" → /routes |
| **Focus** | Full demo | Teaser + link to full page |

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Routes.tsx` | **Create** | New route guidance page with src/dest inputs |
| `src/components/floodshield/FloodShieldLanding.tsx` | **Modify** | Replace full RoutePlanner with compact preview |
| `src/App.tsx` | **Modify** | Add `/routes` route |

---

## Detailed Implementation

### 1. Routes Page (`src/pages/Routes.tsx`)

The page will include:

**Header Section:**
- Minimal header with FloodShield branding
- Back to home link

**Input Section:**
- Two glassmorphism input fields with MapPin icons
- Labels: "Starting Point" and "Destination"
- "Use my location" button for source field
- "Find Safe Routes" primary button

**Results Section (after search):**
- Grid of route option cards (2-3 options)
- Each card shows:
  - Route name (e.g., "Recommended Safe Route")
  - Estimated time and distance
  - Risk level badge (Low/Medium/High)
  - Key warnings (if any)
  - "Select Route" or "Start Guidance" button

**Comparison Panel:**
- Side-by-side comparison of key metrics
- Animated bar charts for risk levels
- List of avoided flood zones

**Route Visualization:**
- Animated SVG map similar to current landing page
- Green (safe) and yellow (faster but risky) route lines
- Pulsing markers for start/end points
- Optional: Risk zone overlays (red ellipses)

### 2. Landing Page Update

**Replace `RoutePlanner` function with `RoutePreview`:**

```text
RoutePreview Component Structure:
├── SectionTitle (same pattern, slightly adjusted copy)
├── Glassmorphism Card Container
│   ├── Grid Layout (2 columns on lg, 1 on mobile)
│   │   ├── Left Column: Mini Route Animation
│   │   │   ├── Simplified SVG with 2 route paths
│   │   │   ├── Start/End markers
│   │   │   └── Subtle animation
│   │   └── Right Column: Description + CTA
│   │       ├── Heading: "Plan Safe Routes"
│   │       ├── Description text
│   │       ├── Inline legend (colored dots + labels)
│   │       └── Button: "Try Route Planner" → /routes
```

**Key differences from current:**
- Aspect ratio changes from 16:9 to more compact
- Vehicle animation removed
- Fewer visual elements
- Clear call-to-action to the dedicated page
- Positioned as a "feature preview" not a "full demo"

### 3. App.tsx Route Addition

Add the new route to the router:

```text
Routes:
  / → Index (landing page)
  /prototype → Prototype
  /routes → Routes (NEW)
  * → NotFound
```

---

## Component Details

### Route Input Card Component

```text
┌─────────────────────────────────────────────┐
│  📍 Starting Point                          │
│  ┌─────────────────────────────────────┐    │
│  │ Enter location or address...         │    │
│  └─────────────────────────────────────┘    │
│  [📍 Use my current location]               │
│                                             │
│  📍 Destination                             │
│  ┌─────────────────────────────────────┐    │
│  │ Enter destination...                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │       🔍 Find Safe Routes            │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Route Option Card Component

```text
┌─────────────────────────────────────────────┐
│  Recommended Safe Route          🟢 Low Risk │
├─────────────────────────────────────────────┤
│  ⏱️ 25 min  •  📏 12.4 km                    │
│                                             │
│  ✓ Avoids 3 flood zones                     │
│  ✓ Higher elevation path                    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │       Start Guidance →               │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## Animation Details

### Routes Page Animations
- Input fields: fade-in on mount
- Route cards: staggered slide-up when results appear
- Route lines: draw-in animation (stroke-dashoffset)
- Markers: pulse animation
- Risk bars: fill animation with delay

### Landing Page Preview Animations
- Card: scale-in on viewport enter
- Route lines: subtle fade-in
- Markers: gentle pulse
- Simpler than full page to maintain performance

---

## Navigation Flow

```text
Landing Page (/)
    │
    ├── Hero "Launch Dashboard" → /map (future)
    │
    ├── Route Preview Section
    │       └── "Try Route Planner" → /routes
    │
    └── TopNav updates (future: Login/Signup)

Routes Page (/routes)
    │
    ├── Input source + destination
    │
    ├── View route options
    │
    └── Select route → (future: start guidance on /map)
```

---

## Technical Notes

- **State Management**: Route inputs and results will use React useState
- **Form Handling**: Simple controlled inputs, can add react-hook-form later
- **Animations**: Use existing useInViewOnce hook and CSS transitions
- **Styling**: Consistent with existing fs-glass, fs-glass-strong classes
- **Responsive**: Mobile-first, cards stack vertically on small screens
- **Accessibility**: Proper labels, keyboard navigation for inputs

---

## Implementation Order

1. Create `src/pages/Routes.tsx` with input section and mock results
2. Add route visualization with animated SVG paths
3. Add route option cards with risk indicators
4. Update `src/App.tsx` to include `/routes` route
5. Modify `src/components/floodshield/FloodShieldLanding.tsx`:
   - Replace `RoutePlanner` with compact `RoutePreview`
   - Update CTA to link to `/routes`
6. Test navigation flow and animations
