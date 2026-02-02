import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Waves, ArrowLeft, Mail, Lock, MapPin, Bell, Share2 } from "lucide-react";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "login" ? "login" : "signup";
  
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState({
    location: true,
    notifications: true,
    anonymizedData: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Auth submit:", { mode, email, permissions });
    // Backend integration would go here
  };

  return (
    <div className="min-h-screen bg-fs-hero fs-noise flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
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
              <p className="text-sm font-semibold tracking-tight">FloodShield</p>
              <p className="text-xs text-muted-foreground">Secure access</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo & Tagline */}
          <div className="text-center mb-8">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 shadow-elev mb-4">
              <Waves className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to FloodShield</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login" 
                ? "Sign in to access your dashboard" 
                : "Create an account to start monitoring"}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex rounded-full p-1 bg-secondary/50 mb-6">
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${
                mode === "login" 
                  ? "bg-background shadow-float text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${
                mode === "signup" 
                  ? "bg-background shadow-float text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="fs-glass-strong rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="size-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="size-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-4 pt-2">
                <p className="text-sm font-medium text-muted-foreground">Permissions</p>
                
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="location"
                    checked={permissions.location}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, location: checked === true }))
                    }
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="location" className="flex items-center gap-2 text-sm cursor-pointer">
                      <MapPin className="size-4 text-primary" />
                      Allow location access
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Required for real-time risk monitoring at your location
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="notifications"
                    checked={permissions.notifications}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, notifications: checked === true }))
                    }
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="notifications" className="flex items-center gap-2 text-sm cursor-pointer">
                      <Bell className="size-4 text-primary" />
                      Receive push notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get instant alerts when flood risk changes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="anonymizedData"
                    checked={permissions.anonymizedData}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, anonymizedData: checked === true }))
                    }
                  />
                  <div className="grid gap-1">
                    <Label htmlFor="anonymizedData" className="flex items-center gap-2 text-sm cursor-pointer">
                      <Share2 className="size-4 text-muted-foreground" />
                      Share anonymized data
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Help improve predictions for everyone (optional)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" variant="hero" size="pill" className="w-full">
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>

            {mode === "login" && (
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button 
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </p>
            )}

            {mode === "signup" && (
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button 
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setMode("login")}
                >
                  Sign in
                </button>
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
