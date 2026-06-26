import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Map, Sparkles, Trash2, ArrowRight, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/saved-roadmaps")({
  head: () => ({
    meta: [
      { title: "Saved Roadmaps · FuturePath AI" },
      { name: "description", content: "All AI-generated career roadmaps you've saved." },
    ],
  }),
  component: SavedRoadmapsPage,
});

interface RoadmapRow {
  id: string;
  title: string;
  goal: string;
  content: { summary?: string; duration_months?: number; phases?: unknown[] };
  created_at: string;
}

function SavedRoadmapsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<RoadmapRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth", search: { mode: "signin" } }); return; }
    refresh();
  }, [user, loading]);

  const refresh = async () => {
    setFetching(true);
    const { data } = await supabase.from("roadmaps").select("*").order("created_at", { ascending: false });
    setRows((data as unknown as RoadmapRow[]) ?? []);
    setFetching(false);
  };

  const remove = async (id: string) => {
    await supabase.from("roadmaps").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Roadmap deleted");
  };

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-primary font-medium mb-2">
            <Map className="size-3.5" /> Saved
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">Saved Roadmaps</h1>
          <p className="text-muted-foreground mt-3 text-lg">Your AI-generated career plans, ready to revisit.</p>
        </div>
        <Link to="/roadmap" className="inline-flex items-center gap-2 rounded-full bg-hero text-white px-5 py-2.5 text-sm font-medium shadow-glow hover:opacity-90">
          <Sparkles className="size-4" /> Generate new
        </Link>
      </div>

      {fetching ? (
        <div className="mt-16 text-center text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border p-12 text-center bg-mesh">
          <Map className="size-10 mx-auto text-primary mb-4" />
          <h2 className="font-display text-2xl font-semibold">No roadmaps yet</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">Generate your first AI roadmap and it will show up here.</p>
          <Link to="/roadmap" className="mt-6 inline-flex items-center gap-2 rounded-full bg-hero text-white px-5 py-2.5 text-sm font-medium shadow-glow hover:opacity-90">
            <Sparkles className="size-4" /> Generate roadmap
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="group rounded-2xl border border-border bg-card p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-primary/10 text-primary">
                  <Map className="size-3" /> Roadmap
                </div>
                <button onClick={() => remove(r.id)} aria-label="Delete" className="size-8 rounded-full grid place-items-center hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <h3 className="font-display font-semibold text-lg mt-3 leading-tight line-clamp-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.goal}</p>
              {r.content?.summary && <p className="text-sm mt-3 text-muted-foreground line-clamp-3 flex-1">{r.content.summary}</p>}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {r.content?.duration_months && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary"><Trophy className="size-3" /> {r.content.duration_months} mo</span>
                )}
                {Array.isArray(r.content?.phases) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary">{r.content.phases.length} phases</span>
                )}
                <span className="ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <Link to="/roadmap" search={{ id: r.id }} className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-secondary hover:bg-foreground hover:text-background px-4 py-2 text-sm font-medium transition-colors">
                Open <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
