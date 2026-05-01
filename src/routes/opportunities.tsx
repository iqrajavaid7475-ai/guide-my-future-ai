import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { OPPORTUNITIES, recommendOpportunities, type OpportunityType } from "@/data/opportunities";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities · FuturePath AI" },
      { name: "description", content: "Browse curated scholarships, internships, jobs and courses matched to your profile." },
    ],
  }),
  component: OpportunitiesPage,
});

const FILTERS: { key: OpportunityType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "scholarship", label: "Scholarships" },
  { key: "internship", label: "Internships" },
  { key: "job", label: "Jobs" },
  { key: "course", label: "Courses" },
];

function OpportunitiesPage() {
  const { profile } = useAuth();
  const [filter, setFilter] = useState<OpportunityType | "all">("all");
  const [q, setQ] = useState("");

  const recommended = useMemo(() => profile ? recommendOpportunities(profile, 3) : [], [profile]);
  const recIds = new Set(recommended.map((r) => r.id));

  const filtered = useMemo(() => {
    let list = [...OPPORTUNITIES];
    if (filter !== "all") list = list.filter((o) => o.type === filter);
    const ql = q.trim().toLowerCase();
    if (ql) list = list.filter((o) =>
      o.title.toLowerCase().includes(ql) ||
      o.organization.toLowerCase().includes(ql) ||
      o.fields.some((f) => f.toLowerCase().includes(ql)) ||
      o.skills.some((s) => s.toLowerCase().includes(ql))
    );
    return list;
  }, [filter, q]);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 lg:py-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">Opportunities</h1>
        <p className="text-muted-foreground mt-3 text-lg">Curated scholarships, internships, jobs and courses — ranked by your fit.</p>
      </div>

      {profile && recommended.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Top matches for you</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((o) => <OpportunityCard key={o.id} opportunity={o} recommended />)}
          </div>
        </section>
      )}

      <div className="mt-12 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${filter === f.key ? "bg-foreground text-background" : "bg-card border border-border hover:bg-secondary"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.filter((o) => !recIds.has(o.id) || filter !== "all").map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">No opportunities match your filters yet.</div>
        )}
      </div>
    </div>
  );
}
