import { useEffect, useState } from "react";
import type { Opportunity } from "@/data/opportunities";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TYPE_STYLES: Record<string, string> = {
  scholarship: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  internship: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  job: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  course: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

export function OpportunityCard({ opportunity, recommended = false }: { opportunity: Opportunity; recommended?: boolean }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("bookmarks").select("id").eq("opportunity_id", opportunity.id).maybeSingle().then(({ data }) => setSaved(!!data));
  }, [user, opportunity.id]);

  const toggle = async () => {
    if (!user) { toast.error("Sign in to save opportunities"); return; }
    setBusy(true);
    if (saved) {
      await supabase.from("bookmarks").delete().eq("opportunity_id", opportunity.id).eq("user_id", user.id);
      setSaved(false);
      toast.success("Removed from saved");
    } else {
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id, opportunity_id: opportunity.id, opportunity_type: opportunity.type,
        title: opportunity.title, organization: opportunity.organization, location: opportunity.location, url: opportunity.url,
      });
      if (error) toast.error(error.message); else { setSaved(true); toast.success("Saved!"); }
    }
    setBusy(false);
  };

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all flex flex-col">
      {recommended && (
        <div className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full bg-hero text-white text-[10px] font-medium px-2 py-1 shadow-glow">
          <Sparkles className="size-3" /> Match
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md ${TYPE_STYLES[opportunity.type]}`}>
          {opportunity.type}
        </span>
        <button onClick={toggle} disabled={busy} className="size-8 rounded-full grid place-items-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          {saved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
        </button>
      </div>
      <h3 className="font-display font-semibold text-lg mt-3 leading-tight">{opportunity.title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{opportunity.organization}</p>
      <p className="text-sm mt-3 text-muted-foreground line-clamp-2 flex-1">{opportunity.description}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {opportunity.location}</span>
        {opportunity.deadline && <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {new Date(opportunity.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>}
        {opportunity.amount && <span className="font-medium text-foreground">{opportunity.amount}</span>}
        {opportunity.duration && <span>{opportunity.duration}</span>}
      </div>
      <a href={opportunity.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-secondary hover:bg-foreground hover:text-background px-4 py-2 text-sm font-medium transition-colors">
        Apply <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}
