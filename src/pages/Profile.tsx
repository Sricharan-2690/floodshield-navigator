import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthProvider";
import { db } from "@/integrations/supabase/db";
import type { DangerAlert } from "@/types/danger-alerts";
import { Waves } from "lucide-react";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [myAlerts, setMyAlerts] = useState<DangerAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const email = user?.email ?? "";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await db.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
        if (mounted) setDisplayName(data?.display_name ?? "");
      } catch (_) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingAlerts(true);
      try {
        const { data, error } = await db
          .from("danger_alerts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (mounted) setMyAlerts((data ?? []) as DangerAlert[]);
      } catch (e: any) {
        toast({ variant: "destructive", title: "Failed to load your alerts", description: e?.message });
      } finally {
        if (mounted) setLoadingAlerts(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast, user?.id]);

  const activeCount = useMemo(() => {
    const now = Date.now();
    return myAlerts.filter((a) => new Date(a.expires_at).getTime() > now).length;
  }, [myAlerts]);

  async function saveProfile() {
    setSaving(true);
    try {
      const { error } = await db
        .from("profiles")
        .upsert({ user_id: user.id, display_name: displayName }, { onConflict: "user_id" });
      if (error) throw error;
      toast({ title: "Profile saved" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Could not save", description: e?.message ?? "Try again" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteAlert(alertId: string) {
    if (!confirm("Delete this alert?")) return;
    try {
      const { error } = await db.from("danger_alerts").delete().eq("id", alertId);
      if (error) throw error;
      setMyAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast({ title: "Alert deleted" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e?.message });
    }
  }

  async function logout() {
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-[1100] border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <HamburgerMenu />
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 shadow-float">
              <Waves className="size-5 text-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Profile</p>
              <p className="text-xs text-muted-foreground">{activeCount} active alerts</p>
            </div>
          </div>
          <Button variant="glass" size="pill" onClick={logout}>Logout</Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        <section className="fs-glass-strong rounded-[2rem] p-6 sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">Your details</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Display name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Vasavi Team" />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button variant="hero" size="pill" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </section>

        <section className="fs-glass rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">My danger alerts</h2>
            <Button variant="glass" size="pill" onClick={() => navigate("/danger-alerts")}>Go to feed</Button>
          </div>

          {loadingAlerts ? (
            <div className="mt-6 h-24 animate-pulse rounded-2xl bg-muted/50 border border-border" />
          ) : myAlerts.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">You haven’t created any alerts yet.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {myAlerts.map((a) => (
                <div key={a.id} className="fs-glass rounded-2xl p-4 border border-border/70">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold tracking-tight">{a.location_text}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Expires: {new Date(a.expires_at).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteAlert(a.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
