
# FloodShield: Multi-Page Application Restructure

## Overview

This plan transforms the FloodShield site from a single-page showcase into a multi-page application with:

1. **Interactive Map Page** (`/map`) - Leaflet.js with OpenStreetMap data
2. **Route Guidance Page** (`/routes`) - Source/destination input with route options
3. **Authentication Page** (`/auth`) - Login/Sign Up with permissions
4. **Dashboard Page** (`/dashboard`) - Risk scores, alerts, and analytics (data-driven content)
5. **Updated Landing Page** - Generic showcase only, with compact previews
6. **Emergency Helpline Button** - Fixed SOS button on key pages

---

## What Stays on Landing Page (Showcase Only)

| Section | Status | Reason |
|---------|--------|--------|
| Hero | Keep | Brand introduction, taglines |
| Map Preview | Keep | Visual showcase (not real data) |
| Features | Keep | Product capabilities overview |
| Route Preview (NEW) | Replace RoutePlanner | Compact teaser with CTA to /routes |
| Tech Stack | Keep | Data sources info |
| Testimonial | Keep | Social proof |
| Footer | Keep | Navigation links |

## What Moves to Dashboard Page (Data-Dependent)

| Section | New Location | Reason |
|---------|--------------|--------|
| Risk Breakdown | `/dashboard` | Shows live model weights, needs real data |
| Alerts | `/dashboard` | Real-time notification stream |
| Analytics | `/dashboard` | Charts, trends, clustering data |

---

## New Dependencies

Install required packages for Leaflet map:
- `leaflet` - Core mapping library
- `react-leaflet` - React wrapper for Leaflet
- `@types/leaflet` - TypeScript definitions

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Map.tsx` | **Create** | Interactive Leaflet map with OSM |
| `src/pages/Routes.tsx` | **Create** | Route guidance with src/dest inputs |
| `src/pages/Auth.tsx` | **Create** | Login/Signup UI with permissions |
| `src/pages/Dashboard.tsx` | **Create** | Risk, Alerts, Analytics sections |
| `src/components/floodshield/EmergencyButton.tsx` | **Create** | Fixed SOS button |
| `src/components/floodshield/FloodShieldLanding.tsx` | **Modify** | Remove data sections, update nav, add compact route preview |
| `src/App.tsx` | **Modify** | Add new routes |
| `src/index.css` | **Modify** | Import Leaflet CSS |

---

## New Pages Detail

### 1. Map Page (`/map`)

Full-screen interactive map with Leaflet and OpenStreetMap:

```text
/map
+-- Minimal header (logo + back link)
+-- Full-screen Leaflet MapContainer
|   +-- OpenStreetMap TileLayer
|   +-- User location marker (pulsing, if geolocation granted)
|   +-- Optional risk zone overlays (future)
+-- Floating info panel (glassmorphism, top-left)
|   +-- Risk score
|   +-- Rainfall intensity
|   +-- Elevation data
+-- Recenter button (bottom-left)
+-- Emergency button (bottom-right, red)
```

**Location Permission Flow:**
- On page load, prompt for geolocation
- If granted: center map and show pulsing marker
- If denied: default to Hyderabad (17.385, 78.4867) with a toast

---

### 2. Route Guidance Page (`/routes`)

Dedicated page for planning safe routes:

```text
/routes
+-- Header (logo + back to home)
+-- Route Input Section
|   +-- Source input field (MapPin icon)
|   +-- "Use my location" button
|   +-- Destination input field
|   +-- "Find Safe Routes" primary button
+-- Results Section (appears after search)
|   +-- Route Options Cards (2-3 options)
|   |   +-- Recommended Safe Route (green badge)
|   |   |   +-- Duration, distance
|   |   |   +-- Risk level indicator
|   |   |   +-- "Start Guidance" button
|   |   +-- Fastest Route (yellow/red badge)
|   |       +-- Duration, distance
|   |       +-- Risk warnings
|   |       +-- "Start Guidance" button
|   +-- Route Comparison Summary
|   |   +-- Time difference
|   |   +-- Risk difference
|   |   +-- Avoided zones count
|   +-- Animated SVG Route Visualization
|       +-- Green (safe) and yellow (risky) paths
|       +-- Pulsing start/end markers
|       +-- Red risk zone overlays
+-- Emergency Button (bottom-right)
```

---

### 3. Authentication Page (`/auth`)

Premium Apple-style authentication:

```text
/auth
+-- FloodShield logo + tagline
+-- Tab toggle (Login | Sign Up)
+-- Form card (glassmorphism)
|   +-- Email input
|   +-- Password input
|   +-- [Sign Up only] Permission checkboxes
|   |   +-- Allow location access
|   |   +-- Receive push notifications
|   |   +-- Share anonymized data
|   +-- Submit button
+-- Link to switch modes
```

This is UI-ready; backend integration with Supabase can be added later.

---

### 4. Dashboard Page (`/dashboard`)

Consolidates all data-dependent sections moved from landing:

```text
/dashboard
+-- Header (with navigation back to home)
+-- Risk Breakdown section (from landing)
|   +-- Live model weights with animated bars
|   +-- Current score card
|   +-- Explainability card
+-- Alerts section (from landing)
|   +-- Notification stream
|   +-- Delivery/Actions info cards
+-- Analytics section (from landing)
|   +-- Weekly trend chart
|   +-- Rainfall vs elevation
|   +-- City clustering
+-- Emergency Button (bottom-right)
```

---

## Updated Landing Page

### Navigation (TopNav) Changes

| Current | After |
|---------|-------|
| Anchor links (#map, #features, #risk, #alerts, #analytics) | **Removed entirely** |
| "Launch Prototype" button | **Removed** |
| "How It Works" button | **Removed** |
| --- | **"Login"** button (links to `/auth?mode=login`) |
| --- | **"Sign Up"** button (links to `/auth`) |

### Hero Section Changes

| Current | After |
|---------|-------|
| "Launch Dashboard" links to `/prototype` | Links to `/map` |
| "Risk model breakdown" anchor link | Links to `/dashboard` |

### Route Planner Section Changes

Replace the full-screen `RoutePlanner` with a compact `RoutePreview`:

| Aspect | Before | After |
|--------|--------|-------|
| Height | Full section (~80vh) | Compact card (~300-400px) |
| Map Visualization | Large with full SVG routes | Smaller, simplified preview |
| Vehicle Animation | Full path animation | Removed |
| Legend | 3 separate cards | Inline compact legend |
| CTA | None | "Try Route Planner" button links to `/routes` |

**New RoutePreview Structure:**
```text
RoutePreview Section
+-- SectionTitle (adjusted copy)
+-- Glassmorphism Card Container
    +-- Grid Layout (2 columns on lg, 1 on mobile)
        +-- Left: Mini Route Animation
        |   +-- Simplified SVG with 2 route paths
        |   +-- Start/End markers
        |   +-- Subtle animation
        +-- Right: Description + CTA
            +-- Heading: "Plan Safe Routes"
            +-- Description text
            +-- Inline legend (colored dots + labels)
            +-- Button: "Try Route Planner" links to /routes
```

### Sections Removed from Landing

- **RiskBreakdown** - moved to `/dashboard`
- **Alerts** - moved to `/dashboard`
- **Analytics** - moved to `/dashboard`

---

## Emergency Button Component

A fixed floating button for all key pages:

| Aspect | Details |
|--------|---------|
| Design | Circular red button, phone icon, pulse animation |
| Styling | Glassmorphism with red accent background |
| Behavior | On click triggers `tel:112` (configurable helpline) |
| Tooltip | Shows "Emergency Helpline" on hover |
| Placement | Map, Routes, Dashboard pages (bottom-right corner) |

---

## Routing Updates (App.tsx)

Add new routes:

```text
/         -> Index (landing page)
/map      -> Map (interactive Leaflet map)
/routes   -> Routes (route guidance page)
/auth     -> Auth (login/signup page)
/dashboard -> Dashboard (risk, alerts, analytics)
/prototype -> Prototype (existing, kept but unlinked)
*         -> NotFound
```

---

## CSS Updates (index.css)

Import Leaflet styles at top of file:

```css
@import "leaflet/dist/leaflet.css";
```

Also include fix for Leaflet's default marker icon issue in bundlers.

---

## Implementation Order

1. Install `leaflet`, `react-leaflet`, `@types/leaflet`
2. Import Leaflet CSS in `src/index.css`
3. Create `EmergencyButton.tsx` component
4. Create `Dashboard.tsx` page (move Risk, Alerts, Analytics from landing)
5. Create `Map.tsx` page with Leaflet integration + geolocation
6. Create `Routes.tsx` page with input section and mock route results
7. Create `Auth.tsx` page with login/signup UI and permission checkboxes
8. Update `FloodShieldLanding.tsx`:
   - Remove Risk Breakdown, Alerts, Analytics sections
   - Remove all anchor links from TopNav
   - Add Login/Sign Up buttons to TopNav
   - Update Hero CTA links (/map and /dashboard)
   - Replace `RoutePlanner` with compact `RoutePreview`
9. Update `App.tsx` with new routes

---

## Technical Notes

- **Leaflet Marker Icons**: Will include bundler workaround for default marker icons
- **Geolocation API**: Uses `navigator.geolocation.getCurrentPosition()` with proper error handling and fallback
- **Dashboard Components**: Sections moved as-is from landing, can be enhanced with real data later
- **Prototype Route**: `/prototype` remains accessible but unlinked from navigation
- **Emergency Tel Link**: Works natively on mobile, may show system dialog on desktop
- **State Management**: Route inputs use React useState; can add react-hook-form later
- **Animations**: Reuse existing useInViewOnce hook and CSS transitions
- **Styling**: Consistent with existing fs-glass, fs-glass-strong classes
