import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/integrations/supabase/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Waves } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";

function GoogleLogo(props: React.SVGProps<SVGSVGElement>) {
  // Simple inline Google “G” mark (brand colors). Kept as SVG to avoid extra assets.
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" {...props}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.18 1.53 7.59 2.81l5.52-5.52C33.95 3.86 29.44 2 24 2 14.73 2 6.76 7.3 3.09 15.07l6.46 5.02C11.41 13.72 17.16 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.2-.43-4.7H24v9.01h12.62c-.55 2.96-2.2 5.46-4.69 7.14l7.19 5.57C43.18 37.61 46.5 31.61 46.5 24.5z" />
      <path fill="#FBBC05" d="M9.55 28.58A14.5 14.5 0 0 1 8.75 24c0-1.59.28-3.13.8-4.58l-6.46-5.02A23.95 23.95 0 0 0 1.5 24c0 3.87.93 7.53 2.59 10.78l6.46-5.02z" />
      <path fill="#34A853" d="M24 46c6.48 0 11.92-2.14 15.9-5.78l-7.19-5.57c-2 1.35-4.56 2.15-8.71 2.15-6.84 0-12.59-4.22-14.45-10.09l-6.46 5.02C6.76 40.7 14.73 46 24 46z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthPage() {
  const [params] = useSearchParams();
  const initialMode = (params.get("mode") ?? "signup") as "login" | "signup";
  const redirectTo = params.get("redirect") ?? "/";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate(redirectTo, { replace: true });
  }, [user, loading, navigate, redirectTo]);

  const title = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create your account"),
    [mode],
  );

  async function ensureProfile(userId: string) {
    // Best-effort: create if missing.
    await db.from("profiles").upsert({ user_id: userId }, { onConflict: "user_id" });
  }

  function getOAuthRedirectUrl() {
    // Supabase expects an absolute URL.
    // We keep the existing redirect param behavior by using the same redirectTo target.
    const target = redirectTo?.startsWith("http") ? redirectTo : `${window.location.origin}${redirectTo}`;
    return target;
  }

  async function onGoogle() {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getOAuthRedirectUrl(),
        },
      });
      if (error) throw error;
      // On success, Supabase will redirect away to Google.
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Google sign-in failed",
        description: err?.message ?? "Try again",
      });
      setSubmitting(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ variant: "destructive", title: "Invalid input", description: parsed.error.issues[0]?.message });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Logged in", description: "You’re now signed in." });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;

        if (data.user?.id) await ensureProfile(data.user.id);

        toast({
          title: "Account created",
          description: "If email confirmation is enabled, check your inbox. Otherwise you can log in now.",
        });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Authentication failed", description: err?.message ?? "Try again" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-fs-hero fs-noise">
      <header className="sticky top-0 z-[1100] border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 shadow-float">
              <Waves className="size-5 text-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">AquaLens</p>
              <p className="text-xs text-muted-foreground">Sign in to create danger alerts</p>
            </div>
          </div>
          <Button variant="glass" size="pill" onClick={() => navigate("/")}>Back</Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="fs-glass-strong rounded-[2rem] p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Login to continue." : "Sign up to start posting danger alerts."}
          </p>

          <div className="mt-6 space-y-4">
            <Button
              type="button"
              variant="glass-strong"
              size="pill"
              className="w-full gap-2"
              disabled={submitting}
              onClick={onGoogle}
            >
              <GoogleLogo className="size-4" /> Continue with Google
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center">
                <span className="fs-glass px-3 text-xs text-muted-foreground">or</span>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <Button type="submit" variant="hero" size="pill" className="w-full" disabled={submitting}>
              {submitting ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="story-link"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "Sign up" : "Login"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
