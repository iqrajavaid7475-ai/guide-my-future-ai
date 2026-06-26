import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark, ExternalLink, MapPin, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/saved-opportunities")({
  head: () => ({
    meta: [
      { title: "Saved Opportunities · FuturePath AI" },
      { name: "description", content: "All scholarships, internships, jobs and courses you've bookmarked." },
    ],
  }),
  component: SavedOpportunitiesPage,
});

interface BookmarkRow {
  id: string;
  opportunity_id: string;
  opportunity_type: string;
  title: string;
  organization: string | null;
  location: string | null;
  url: string | null;
  created_at: string;
}

const TYPE_STYLES: Record<string, string> = {
  scholarship: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  internship: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  job: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  course: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

function SavedOpportunitiesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<BookmarkRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth", search: { mode: "signin" } }); return; }
    refresh();
  }, [user, loading]);

  const refresh = async () => {
    setFetching(true);
    const { data } = await supabase.from("bookmarks").select("*").order("created_at", { ascending: false });
    setRows((data as BookmarkRow[] | null) ?? []);
    setFetching(false);
  };

  const remove = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Removed from saved");
  };

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-primary font-medium mb-2">
            <Bookmark className="size-3.5" /> Saved
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">Saved Opportunities</h1>
          <p className="text-muted-foreground mt-3 text-lg">Everything you bookmarked, in one place.</p>
        </div>
        <Link to="/opportunities" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90">
          <Sparkles className="size-4" /> Browse more
        </Link>
      </div>

      {fetching ? (
        <div className="mt-16 text-center text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border p-12 text-center bg-mesh">
          <Bookmark className="size-10 mx-auto text-primary mb-4" />
          <h2 className="font-display text-2xl font-semibold">No saved opportunities yet</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">Tap the bookmark icon on any opportunity to save it here.</p>
          <Link to="/opportunities" className="mt-6 inline-flex items-center gap-2 rounded-full bg-hero text-white px-5 py-2.5 text-sm font-medium shadow-glow hover:opacity-90">
            Explore opportunities
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="group rounded-2xl border border-border bg-card p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className={`inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md ${TYPE_STYLES[r.opportunity_type] ?? "bg-secondary"}`}>
                  {r.opportunity_type}
                </span>
                <button onClick={() => remove(r.id)} aria-label="Remove" className="size-8 rounded-full grid place-items-center hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <h3 className="font-display font-semibold text-lg mt-3 leading-tight">{r.title}</h3>
              {r.organization && <p className="text-sm text-muted-foreground mt-1">{r.organization}</p>}
              {r.location && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {r.location}
                </div>
              )}
              <div className="mt-auto pt-4">
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-secondary hover:bg-foreground hover:text-background px-4 py-2 text-sm font-medium transition-colors">
                    Open <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
