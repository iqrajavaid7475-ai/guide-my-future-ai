import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { recommendOpportunities } from "@/data/opportunities";
import { OpportunityCard } from "@/components/OpportunityCard";
import { ArrowRight, Sparkles, Compass, Bot, Bookmark, GraduationCap, Briefcase, BookOpen, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · FuturePath AI" }, { name: "description", content: "Your personalized AI dashboard." }] }),
  component: Dashboard,
});

interface RoadmapRow { id: string; title: string; goal: string; created_at: string }
interface BookmarkRow { id: string; opportunity_id: string; title: string; opportunity_type: string }

function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<RoadmapRow[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth", search: { mode: "signin" } }); return; }
    if (!profile?.onboarded) { navigate({ to: "/onboarding" }); return; }
    (async () => {
      const [{ data: r }, { data: b }] = await Promise.all([
        supabase.from("roadmaps").select("id,title,goal,created_at").order("created_at", { ascending: false }),
        supabase.from("bookmarks").select("id,opportunity_id,title,opportunity_type").order("created_at", { ascending: false }),
      ]);
      setRoadmaps((r as RoadmapRow[]) ?? []);
      setBookmarks((b as BookmarkRow[]) ?? []);
    })();
  }, [user, profile, loading, navigate]);

  if (loading || !profile) {
    return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Loading your future…</div>;
  }

  const recs = recommendOpportunities(profile, 6);
  const firstName = (profile.full_name ?? "there").split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 lg:py-14">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-1">Hello, {firstName} 👋</h1>
          <p className="text-muted-foreground mt-2 max-w-lg">Here's what FuturePath AI has lined up for your goal: <span className="text-foreground font-medium">{profile.career_goal}</span></p>
        </div>
        <div className="flex gap-2">
          <Link to="/roadmap" className="inline-flex items-center gap-2 rounded-full bg-hero text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 shadow-glow">
            <Sparkles className="size-4" /> Generate roadmap
          </Link>
          <Link to="/mentor" className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary">
            <Bot className="size-4" /> Ask mentor
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: GraduationCap, label: "Field", value: profile.field_of_interest ?? "—" },
          { icon: Briefcase, label: "Education", value: profile.education_level ?? "—" },
          { icon: BookOpen, label: "Skills", value: `${profile.skills?.length ?? 0} tracked` },
          { icon: Compass, label: "Roadmaps", value: `${roadmaps.length}` },
        ].map(({ icon: I, label, value }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><I className="size-4" /> {label}</div>
            <div className="font-display text-xl mt-2 truncate">{value}</div>
          </div>
        ))}
      </div>

      {/* Recommended */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Recommended for you</h2>
            <p className="text-sm text-muted-foreground mt-1">Matched to your skills, field and goal.</p>
          </div>
          <Link to="/opportunities" className="text-sm text-primary inline-flex items-center gap-1 hover:gap-1.5 transition-all">View all <ArrowRight className="size-4" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recs.map((o) => <OpportunityCard key={o.id} opportunity={o} />)}
        </div>
      </section>

      {/* Roadmaps + Bookmarks */}
      <section className="mt-12 grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Your roadmaps</h3>
            <Link to="/roadmap" className="text-sm text-primary inline-flex items-center gap-1"><Plus className="size-4" />New</Link>
          </div>
          {roadmaps.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-10">
              <Compass className="size-8 mx-auto mb-3 opacity-40" />
              No roadmaps yet. Generate your first AI roadmap.
            </div>
          ) : (
            <ul className="space-y-2">
              {roadmaps.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <Link to="/roadmap" search={{ id: r.id }} className="block rounded-xl p-3 hover:bg-secondary transition-colors">
                    <div className="font-medium text-sm">{r.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{r.goal}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Saved opportunities</h3>
            <Link to="/opportunities" className="text-sm text-primary inline-flex items-center gap-1">Browse</Link>
          </div>
          {bookmarks.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-10">
              <Bookmark className="size-8 mx-auto mb-3 opacity-40" />
              Save scholarships, jobs and courses to revisit later.
            </div>
          ) : (
            <ul className="space-y-2">
              {bookmarks.slice(0, 5).map((b) => (
                <li key={b.id} className="rounded-xl p-3 hover:bg-secondary transition-colors">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{b.opportunity_type}</div>
                  <div className="font-medium text-sm">{b.title}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
