import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, CheckCircle2, BookOpen, Trophy, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

const search = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/roadmap")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "AI Roadmap · FuturePath AI" }, { name: "description", content: "Your AI-generated personalized career roadmap." }] }),
  component: RoadmapPage,
});

interface Phase {
  title: string;
  duration: string;
  objective: string;
  milestones: string[];
  skills_to_learn: string[];
  recommended_resources: { name: string; type: string; provider: string }[];
}
interface RoadmapContent {
  title: string;
  summary: string;
  duration_months?: number;
  phases: Phase[];
  key_opportunities?: { type: string; title: string; why: string }[];
}
interface RoadmapRow { id: string; title: string; goal: string; content: RoadmapContent; created_at: string }

function RoadmapPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [list, setList] = useState<RoadmapRow[]>([]);
  const [active, setActive] = useState<RoadmapRow | null>(null);
  const [generating, setGenerating] = useState(false);
  const [customGoal, setCustomGoal] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth", search: { mode: "signin" } }); return; }
    if (!profile?.onboarded) { navigate({ to: "/onboarding" }); return; }
    refresh();
  }, [user, profile, loading]);

  useEffect(() => {
    if (id && list.length) {
      const r = list.find((x) => x.id === id);
      if (r) setActive(r);
    } else if (list.length && !active) setActive(list[0]);
  }, [id, list]);

  const refresh = async () => {
    const { data } = await supabase.from("roadmaps").select("*").order("created_at", { ascending: false });
    setList((data as unknown as RoadmapRow[]) ?? []);
  };

  const generate = async () => {
    if (!user || !profile) return;
    setGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Please sign in again");
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ mode: "roadmap", goal: customGoal || profile.career_goal }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error ${res.status}`);
      }
      const content: RoadmapContent = await res.json();
      const { data, error } = await supabase.from("roadmaps").insert([{
        user_id: user.id,
        title: content.title || "My Roadmap",
        goal: customGoal || profile.career_goal || "Career growth",
        content: content as never,
      }]).select().single();
      if (error) throw error;
      toast.success("Your roadmap is ready ✨");
      setCustomGoal("");
      await refresh();
      setActive(data as unknown as RoadmapRow);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const remove = async (rid: string) => {
    await supabase.from("roadmaps").delete().eq("id", rid);
    if (active?.id === rid) setActive(null);
    await refresh();
    toast.success("Deleted");
  };

  if (loading || !profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 lg:py-14">
      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Your roadmaps</h1>
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <label className="text-xs text-muted-foreground">Refine your goal (optional)</label>
            <textarea value={customGoal} onChange={(e) => setCustomGoal(e.target.value)} rows={3} placeholder={profile.career_goal ?? "e.g. Become a senior ML engineer in 3 years"} className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <button onClick={generate} disabled={generating} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-hero text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 shadow-glow">
              {generating ? <><Loader2 className="size-4 animate-spin" /> Building…</> : <><Sparkles className="size-4" /> Generate roadmap</>}
            </button>
          </div>

          <ul className="mt-5 space-y-1.5">
            {list.map((r) => (
              <li key={r.id} className="group">
                <button onClick={() => setActive(r)} className={`w-full text-left rounded-xl p-3 transition-colors ${active?.id === r.id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary border border-transparent"}`}>
                  <div className="font-medium text-sm truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{new Date(r.created_at).toLocaleDateString()}</div>
                </button>
              </li>
            ))}
            {list.length === 0 && <p className="text-xs text-muted-foreground p-3">No roadmaps yet — generate your first one above.</p>}
          </ul>
        </aside>

        <main>
          {!active ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-mesh">
              <Sparkles className="size-10 mx-auto text-primary mb-4" />
              <h2 className="font-display text-2xl font-semibold">Generate your first AI roadmap</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">A personalized multi-phase plan toward your career goal — phases, milestones, skills and resources.</p>
            </div>
          ) : (
            <article>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Roadmap</div>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-1">{active.content.title}</h2>
                  <p className="text-muted-foreground mt-3 max-w-2xl">{active.content.summary}</p>
                  {active.content.duration_months && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-secondary"><Trophy className="size-3" /> {active.content.duration_months} months</div>
                  )}
                </div>
                <button onClick={() => remove(active.id)} className="text-muted-foreground hover:text-destructive p-2"><Trash2 className="size-4" /></button>
              </div>

              <div className="relative mt-10 space-y-5">
                <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent hidden sm:block" />
                {active.content.phases?.map((phase, i) => (
                  <div key={i} className="relative sm:pl-14">
                    <div className="hidden sm:flex absolute left-0 top-2 size-10 rounded-full bg-hero text-white items-center justify-center font-display text-sm shadow-glow">{i + 1}</div>
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-xl font-semibold">{phase.title}</h3>
                        <span className="text-xs text-muted-foreground">{phase.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{phase.objective}</p>

                      {phase.milestones?.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Milestones</div>
                          <ul className="space-y-1.5">
                            {phase.milestones.map((m, j) => (
                              <li key={j} className="flex gap-2 text-sm"><CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" /> {m}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {phase.skills_to_learn?.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills</div>
                          <div className="flex flex-wrap gap-1.5">
                            {phase.skills_to_learn.map((s, j) => (
                              <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-secondary">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {phase.recommended_resources?.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resources</div>
                          <ul className="space-y-1.5">
                            {phase.recommended_resources.map((r, j) => (
                              <li key={j} className="flex items-center gap-2 text-sm"><BookOpen className="size-4 text-primary" /> <span className="font-medium">{r.name}</span> <span className="text-muted-foreground text-xs">· {r.provider} · {r.type}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {active.content.key_opportunities && active.content.key_opportunities.length > 0 && (
                <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2"><ArrowRight className="size-4 text-primary" /> Key opportunities to pursue</h3>
                  <ul className="mt-3 grid sm:grid-cols-2 gap-3">
                    {active.content.key_opportunities.map((o, i) => (
                      <li key={i} className="rounded-xl border border-border p-3">
                        <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">{o.type}</div>
                        <div className="font-medium text-sm mt-0.5">{o.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{o.why}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
