import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthProvider";
import { db } from "@/integrations/supabase/db";
import { useNominatimSearch } from "@/hooks/useNominatimSearch";
import { useDangerAlertsRealtime } from "@/hooks/useDangerAlertsRealtime";
import { useNonExpired } from "@/lib/expiry";
import type { DangerAlert, DangerAlertComment, DangerAlertVote } from "@/types/danger-alerts";
import { useAlertStats } from "@/hooks/useAlertStats";
import { ArrowUp, ArrowDown, MessageCircle, Plus, LogIn, Waves } from "lucide-react";

type LocationPick = { label: string; lat: number; lng: number };

function formatAge(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DangerAlertsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { alerts: alertsRaw, loading: alertsLoading, error: alertsError, refresh } = useDangerAlertsRealtime();
  const alerts = useNonExpired(alertsRaw);

  const [votes, setVotes] = useState<DangerAlertVote[]>([]);
  const [comments, setComments] = useState<DangerAlertComment[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const enriched = useAlertStats(alerts, votes, comments);

  // --- Create form state (logged-in only)
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [picked, setPicked] = useState<LocationPick | null>(null);
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const { results, loading: nomLoading } = useNominatimSearch(locationQuery);

  const alertIds = useMemo(() => enriched.map((a) => a.id), [enriched]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStatsLoading(true);
      try {
        const [votesRes, commentsRes] = await Promise.all([
          db.from("danger_alert_votes").select("*").in("alert_id", alertIds.length ? alertIds : ["00000000-0000-0000-0000-000000000000"]),
          db.from("danger_alert_comments").select("*").in("alert_id", alertIds.length ? alertIds : ["00000000-0000-0000-0000-000000000000"]),
        ]);

        if (votesRes.error) throw votesRes.error;
        if (commentsRes.error) throw commentsRes.error;

        if (!mounted) return;
        setVotes((votesRes.data ?? []) as DangerAlertVote[]);
        setComments((commentsRes.data ?? []) as DangerAlertComment[]);
      } catch (e: any) {
        toast({ variant: "destructive", title: "Failed to load stats", description: e?.message });
      } finally {
        if (mounted) setStatsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast, alertIds.join(",")]);

  async function vote(alertId: string, value: -1 | 1) {
    if (!user) {
      toast({ variant: "destructive", title: "Login required", description: "Please login to vote." });
      return;
    }

    try {
      const { data, error } = await db
        .from("danger_alert_votes")
        .upsert(
          { alert_id: alertId, user_id: user.id, vote: value },
          { onConflict: "alert_id,user_id" },
        )
        .select("*")
        .single();
      if (error) throw error;

      setVotes((prev) => {
        const next = prev.filter((v) => !(v.alert_id === alertId && v.user_id === user.id));
        next.push(data as DangerAlertVote);
        return next;
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Vote failed", description: e?.message });
    }
  }

  async function addComment(alertId: string, text: string) {
    if (!user) {
      toast({ variant: "destructive", title: "Login required", description: "Please login to comment." });
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const { data, error } = await db
        .from("danger_alert_comments")
        .insert({ alert_id: alertId, user_id: user.id, comment: trimmed })
        .select("*")
        .single();
      if (error) throw error;
      setComments((prev) => [data as DangerAlertComment, ...prev]);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Comment failed", description: e?.message });
    }
  }

  async function deleteAlert(alertId: string) {
    if (!confirm("Delete this alert?")) return;
    try {
      const { error } = await db.from("danger_alerts").delete().eq("id", alertId);
      if (error) throw error;
      toast({ title: "Alert deleted" });
      refresh();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e?.message });
    }
  }

  async function uploadPhoto(userId: string, alertId: string, file: File) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${alertId}/${Date.now()}-${safeName}`;

    const uploadRes = await db.storage.from("danger-alert-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadRes.error) throw uploadRes.error;

    const pub = db.storage.from("danger-alert-photos").getPublicUrl(path);
    return pub.data.publicUrl as string;
  }

  async function createAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Login required", description: "Please login to create an alert." });
      return;
    }
    if (!picked) {
      toast({ variant: "destructive", title: "Pick a location", description: "Search and select a location." });
      return;
    }
    if (message.trim().length < 5) {
      toast({
        variant: "destructive",
        title: "Add more details",
        description: "Message should be at least 5 characters.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: created, error } = await db
        .from("danger_alerts")
        .insert({
          user_id: user.id,
          location_text: picked.label,
          lat: picked.lat,
          lng: picked.lng,
          message: message.trim(),
        })
        .select("*")
        .single();
      if (error) throw error;

      let photoUrl: string | null = null;
      if (photo) {
        photoUrl = await uploadPhoto(user.id, created.id, photo);
        const upd = await db.from("danger_alerts").update({ photo_url: photoUrl }).eq("id", created.id);
        if (upd.error) throw upd.error;
      }

      toast({ title: "Alert posted", description: "It will automatically expire after 36 hours." });
      setPicked(null);
      setLocationQuery("");
      setMessage("");
      setPhoto(null);
      setCreateOpen(false);
      refresh();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Create failed", description: e?.message ?? "Try again" });
    } finally {
      setSubmitting(false);
    }
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
              <p className="text-sm font-semibold tracking-tight">Danger Alerts</p>
              <p className="text-xs text-muted-foreground">Public community feed • posts expire in 36h</p>
            </div>
          </div>

          {user ? (
            <Button variant="hero" size="pill" className="gap-2" onClick={() => setCreateOpen((v) => !v)}>
              <Plus className="size-4" /> Create
            </Button>
          ) : (
            <Button
              variant="glass"
              size="pill"
              className="gap-2"
              onClick={() => navigate(`/auth?mode=login&redirect=${encodeURIComponent("/danger-alerts")}`)}
            >
              <LogIn className="size-4" /> Login to post
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        {user && createOpen && (
          <section className="fs-glass-strong rounded-[2rem] p-6 sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight">Create a danger alert</h2>
            <p className="mt-2 text-sm text-muted-foreground">Visible to everyone. Only you can delete it.</p>

            <form onSubmit={createAlert} className="mt-6 grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={picked?.label ?? locationQuery}
                  onChange={(e) => {
                    setPicked(null);
                    setLocationQuery(e.target.value);
                  }}
                  placeholder="Type a place like Google Maps…"
                />
                {!picked && locationQuery.trim().length >= 3 && (
                  <div className="fs-glass rounded-2xl border border-border/70 overflow-hidden">
                    <div className="max-h-56 overflow-auto">
                      {nomLoading ? (
                        <div className="p-3 text-sm text-muted-foreground">Searching…</div>
                      ) : results.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">No results</div>
                      ) : (
                        results.map((r) => (
                          <button
                            type="button"
                            key={`${r.lat}-${r.lon}`}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
                            onClick={() =>
                              setPicked({ label: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })
                            }
                          >
                            {r.display_name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What’s the issue / flood risk here?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Photo (optional)</label>
                <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
                <p className="text-xs text-muted-foreground">Max 20MB. Stored in Supabase Storage.</p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="hero" size="pill" disabled={submitting} className="gap-2">
                  {submitting ? "Posting…" : "Post alert"}
                </Button>
              </div>
            </form>
          </section>
        )}

        <section className="space-y-3">
          {alertsError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {alertsError}
            </div>
          )}

          {(alertsLoading || statsLoading) && (
            <div className="h-28 animate-pulse rounded-[2rem] bg-muted/50 border border-border" />
          )}

          {!alertsLoading && !statsLoading && enriched.length === 0 && (
            <div className="fs-glass rounded-[2rem] p-8 text-center">
              <p className="text-sm text-muted-foreground">No active danger alerts right now.</p>
            </div>
          )}

          {enriched.map((a) => (
            <AlertCard
              key={a.id}
              alert={a}
              isOwner={!!user && user.id === a.user_id}
              onVote={vote}
              onComment={addComment}
              onDelete={deleteAlert}
              comments={comments.filter((c) => c.alert_id === a.id).sort((x, y) => y.created_at.localeCompare(x.created_at))}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

function AlertCard({
  alert,
  isOwner,
  onVote,
  onComment,
  onDelete,
  comments,
}: {
  alert: DangerAlert & { score: number; commentCount: number };
  isOwner: boolean;
  onVote: (alertId: string, v: -1 | 1) => void;
  onComment: (alertId: string, text: string) => void;
  onDelete: (alertId: string) => void;
  comments: DangerAlertComment[];
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <article className="fs-glass rounded-[2rem] p-5 sm:p-6 border border-border/70">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{alert.location_text}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{alert.message}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {formatAge(alert.created_at)} • expires {new Date(alert.expires_at).toLocaleString()}
          </p>
        </div>
        {isOwner && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(alert.id)}>
            Delete
          </Button>
        )}
      </header>

      {alert.photo_url && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
          <img src={alert.photo_url} alt={`Danger alert photo for ${alert.location_text}`} className="w-full max-h-[360px] object-cover" loading="lazy" />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="glass" size="sm" className="gap-2" onClick={() => onVote(alert.id, 1)}>
          <ArrowUp className="size-4" /> Upvote
        </Button>
        <Button variant="glass" size="sm" className="gap-2" onClick={() => onVote(alert.id, -1)}>
          <ArrowDown className="size-4" /> Downvote
        </Button>

        <div className="ml-1 text-sm text-muted-foreground">
          Score <span className="font-mono font-semibold text-foreground">{alert.score}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="ml-auto gap-2"
          onClick={() => {
            setOpen((v) => !v);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <MessageCircle className="size-4" /> {alert.commentCount}
        </Button>
      </div>

      {open && (
        <section className="mt-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment…"
            />
            <Button
              variant="hero"
              size="sm"
              onClick={() => {
                onComment(alert.id, text);
                setText("");
              }}
            >
              Post
            </Button>
          </div>

          {comments.length > 0 && (
            <div className="mt-3 space-y-2">
              {comments.slice(0, 8).map((c) => (
                <div key={c.id} className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <p className="text-sm text-foreground/90">{c.comment}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatAge(c.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </article>
  );
}
