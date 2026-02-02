import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Waves, ArrowLeft, Locate, Droplets, Mountain, AlertTriangle } from "lucide-react";
import { EmergencyButton } from "@/components/floodshield/EmergencyButton";
import { toast } from "@/components/ui/use-toast";

// Fix for default marker icons in bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom pulsing marker icon
const pulsingIcon = L.divIcon({
  className: "pulsing-marker",
  html: `
    <div class="relative">
      <div class="absolute -inset-3 rounded-full border-2 border-primary/50 animate-ping"></div>
      <div class="size-4 rounded-full bg-primary border-2 border-background shadow-lg"></div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Default coordinates (Hyderabad, India)
const DEFAULT_COORDS: [number, number] = [17.385, 78.4867];
const DEFAULT_ZOOM = 13;

function RecenterButton({ position }: { position: [number, number] }) {
  const map = useMap();
  
  const handleRecenter = () => {
    map.flyTo(position, DEFAULT_ZOOM, { duration: 1.5 });
  };

  return (
    <Button
      variant="glass-strong"
      size="icon"
      className="absolute bottom-6 left-6 z-[1000] size-12 rounded-full"
      onClick={handleRecenter}
      aria-label="Recenter map"
    >
      <Locate className="size-5" />
    </Button>
  );
}

function InfoPanel() {
  return (
    <div className="absolute top-4 left-4 z-[1000] w-64 fs-glass-strong rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/10">
          <AlertTriangle className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Risk Score</p>
          <p className="text-lg font-semibold tracking-tight">72 / 100</p>
        </div>
      </div>
      
      <div className="h-px bg-border" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Rainfall</span>
        </div>
        <span className="text-sm font-medium">12 mm/hr</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mountain className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Elevation</span>
        </div>
        <span className="text-sm font-medium">542 m</span>
      </div>
    </div>
  );
}

export default function Map() {
  const [position, setPosition] = useState<[number, number]>(DEFAULT_COORDS);
  const [locationGranted, setLocationGranted] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Using default location (Hyderabad)",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setLocationGranted(true);
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], DEFAULT_ZOOM);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        toast({
          title: "Location access denied",
          description: "Showing default location (Hyderabad). Enable location for personalized risk data.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Minimal header */}
      <header className="sticky top-0 z-[1001] border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="mr-1">
              <NavLink to="/">
                <ArrowLeft className="size-5" />
              </NavLink>
            </Button>
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 shadow-float">
              <Waves className="size-5 text-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">FloodShield Map</p>
              <p className="text-xs text-muted-foreground">
                {locationGranted ? "Live location active" : "Using default location"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen map */}
      <div className="relative flex-1">
        <MapContainer
          center={position}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {locationGranted && (
            <Marker position={position} icon={pulsingIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Your Location</p>
                  <p className="text-sm text-muted-foreground">Real-time flood monitoring active</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          <RecenterButton position={position} />
        </MapContainer>

        <InfoPanel />
        <EmergencyButton />
      </div>
    </div>
  );
}
