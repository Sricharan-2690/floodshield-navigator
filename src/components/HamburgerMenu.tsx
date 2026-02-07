import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Waves,
  Map,
  BarChart3,
  Navigation,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", to: "/", icon: Waves },
  { label: "Flood Map", to: "/map/risk", icon: Map },
  { label: "Dashboard", to: "/dashboard", icon: BarChart3 },
  { label: "Routes", to: "/routes", icon: Navigation },
  { label: "Rain Calendar", to: "/rain", icon: Calendar },
];

interface HamburgerMenuProps {
  /** Use "light" on dark/map backgrounds for white icon */
  variant?: "default" | "light";
}

export function HamburgerMenu({ variant = "default" }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "shrink-0",
            variant === "light" && "text-foreground hover:bg-white/10"
          )}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10">
              <Waves className="size-5 text-foreground" />
            </div>
            <SheetTitle className="text-sm font-semibold tracking-tight">
              AquaLens
            </SheetTitle>
          </div>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border px-5 py-4">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} AquaLens
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
