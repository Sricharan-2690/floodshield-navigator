import { Phone } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EmergencyButtonProps {
  helplineNumber?: string;
}

export function EmergencyButton({ helplineNumber = "112" }: EmergencyButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={`tel:${helplineNumber}`}
          className="fixed bottom-6 right-6 z-[1000] grid size-14 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-elev transition-transform hover:scale-105 active:scale-95"
          aria-label="Emergency Helpline"
        >
          <Phone className="size-6" />
          {/* Pulse animation rings */}
          <span className="absolute inset-0 rounded-full border-2 border-destructive/50 animate-ping" />
          <span className="absolute inset-0 rounded-full border border-destructive/30" />
        </a>
      </TooltipTrigger>
      <TooltipContent side="left" className="bg-destructive text-destructive-foreground border-destructive">
        Emergency Helpline
      </TooltipContent>
    </Tooltip>
  );
}
