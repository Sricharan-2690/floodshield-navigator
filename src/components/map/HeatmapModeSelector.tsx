import { Layers, CloudRain, Map } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type HeatmapMode = "realtime" | "susceptibility";

interface HeatmapModeSelectorProps {
  mode: HeatmapMode;
  onModeChange: (mode: HeatmapMode) => void;
}

const modes = [
  {
    value: "realtime" as const,
    label: "Real-time Flood Risk",
    description: "Rain-adjusted live risk",
    icon: CloudRain,
  },
  {
    value: "susceptibility" as const,
    label: "Flood Susceptibility",
    description: "Base terrain vulnerability",
    icon: Map,
  },
];

export function HeatmapModeSelector({
  mode,
  onModeChange,
}: HeatmapModeSelectorProps) {
  const current = modes.find((m) => m.value === mode)!;

  return (
    <div
      className="fixed top-4 right-4 z-[1000]"
      style={{ marginTop: "3.5rem" }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="fs-glass-strong border-border/50 shadow-elev gap-2 bg-background/90 backdrop-blur-md"
          >
            <Layers className="size-4 text-primary" />
            <span className="text-sm font-medium">{current.label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[220px] bg-background/95 backdrop-blur-md border-border/50 shadow-elev z-[9999]"
        >
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = m.value === mode;
            return (
              <DropdownMenuItem
                key={m.value}
                onClick={() => onModeChange(m.value)}
                className={`flex items-start gap-3 p-3 cursor-pointer ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                <Icon
                  className={`size-4 mt-0.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
                <div>
                  <div
                    className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}
                  >
                    {m.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.description}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
