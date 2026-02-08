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

  const title = useMemo(() => (mode === "login" ? "Welcome back" : "Create your account"), [mode]);

  async function ensureProfile(userId: string) {
    // Best-effort: create if missing.
    await db.from("profiles").upsert({ user_id: userId }, { onConflict: "user_id" });
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

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
