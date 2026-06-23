import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plus, X, Sparkles, User } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Settings · FuturePath AI" },
      { name: "description", content: "Edit your interests, skills and goals — your AI recommendations update instantly." },
    ],
  }),
  component: SettingsPage,
});

const FIELDS = ["Computer Science", "Engineering", "Design", "Business", "Finance", "AI / Machine Learning", "Data Science", "Product", "Marketing", "Sciences", "Web"];
const SKILL_OPTIONS = ["Python", "JavaScript", "React", "TypeScript", "SQL", "Figma", "Communication", "Leadership", "Research", "Math", "Writing", "Marketing", "Strategy", "PyTorch", "C++"];

function SettingsPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [education, setEducation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name ?? "");
    setCountry(profile.country ?? "");
    setEducation(profile.education_level ?? "");
    const merged = [
      ...(profile.interests ?? []),
      ...(profile.field_of_interest && !(profile.interests ?? []).includes(profile.field_of_interest) ? [profile.field_of_interest] : []),
    ];
    setInterests(merged);
    setSkills(profile.skills ?? []);
    setGoal(profile.career_goal ?? "");
  }, [profile]);

  const addInterest = (v: string) => {
    const t = v.trim();
    if (!t) return;
    if (interests.some((i) => i.toLowerCase() === t.toLowerCase())) {
      toast.error(`"${t}" is already added`);
      return;
    }
    setInterests((p) => [...p, t]);
  };
  const removeInterest = (v: string) => setInterests((p) => p.filter((x) => x !== v));
  const toggleInterest = (v: string) =>
    interests.includes(v) ? removeInterest(v) : addInterest(v);

  const addSkill = (v: string) => {
    const t = v.trim();
    if (!t) return;
    if (skills.some((s) => s.toLowerCase() === t.toLowerCase())) {
      toast.error(`"${t}" is already added`);
      return;
    }
    setSkills((p) => [...p, t]);
  };
  const removeSkill = (v: string) => setSkills((p) => p.filter((x) => x !== v));
  const toggleSkill = (v: string) => (skills.includes(v) ? removeSkill(v) : addSkill(v));

  const save = async () => {
    if (!user) return;
    if (interests.length === 0) { toast.error("Add at least one interest"); return; }
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      full_name: name.trim() || null,
      country: country.trim() || null,
      education_level: education || null,
      interests,
      field_of_interest: interests[0] ?? null,
      skills,
      career_goal: goal.trim() || null,
    }).eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Profile updated — recommendations refreshed");
  };

  if (loading || !profile) {
    return <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex items-center gap-3 mb-2">
        <div className="size-10 rounded-xl bg-hero shadow-glow flex items-center justify-center">
          <User className="size-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Profile & Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update your interests anytime — your AI matches refresh instantly.</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <Section title="About you">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Full name">
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </Field>
            <Field label="Country">
              <input value={country} onChange={(e) => setCountry(e.target.value)} className="input" />
            </Field>
            <Field label="Education level">
              <select value={education} onChange={(e) => setEducation(e.target.value)} className="input">
                <option value="">Select…</option>
                {["High school", "Undergraduate", "Graduate", "Postgraduate", "Working professional"].map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Your interests" hint="These drive your AI recommendations.">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FIELDS.map((f) => (
              <button key={f} onClick={() => toggleInterest(f)} className={`rounded-xl border p-2.5 text-xs sm:text-sm text-left transition-all ${interests.includes(f) ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-border bg-card/40 p-3">
            <label className="text-xs text-muted-foreground font-medium">Add a custom interest</label>
            <div className="mt-1.5 flex gap-2">
              <input
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(customInterest); setCustomInterest(""); } }}
                placeholder="e.g. Robotics, Sustainability"
                maxLength={40}
                className="input flex-1"
              />
              <button onClick={() => { addInterest(customInterest); setCustomInterest(""); }} className="inline-flex items-center gap-1 rounded-lg bg-foreground text-background px-3 py-2 text-sm font-medium hover:opacity-90">
                <Plus className="size-4" /> Add
              </button>
            </div>
          </div>
          {interests.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-muted-foreground mb-2">Selected ({interests.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {interests.map((i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/30 px-3 py-1 text-xs font-medium">
                    {i}
                    <button onClick={() => removeInterest(i)} className="hover:opacity-70" aria-label={`Remove ${i}`}><X className="size-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>

        <Section title="Your skills">
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((s) => (
              <button key={s} onClick={() => toggleSkill(s)} className={`rounded-full border px-3.5 py-1.5 text-xs sm:text-sm transition-all ${skills.includes(s) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-border bg-card/40 p-3">
            <label className="text-xs text-muted-foreground font-medium">Add a custom skill</label>
            <div className="mt-1.5 flex gap-2">
              <input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(customSkill); setCustomSkill(""); } }}
                placeholder="e.g. Solidity, UX Writing"
                maxLength={40}
                className="input flex-1"
              />
              <button onClick={() => { addSkill(customSkill); setCustomSkill(""); }} className="inline-flex items-center gap-1 rounded-lg bg-foreground text-background px-3 py-2 text-sm font-medium hover:opacity-90">
                <Plus className="size-4" /> Add
              </button>
            </div>
          </div>
          {skills.filter((s) => !SKILL_OPTIONS.includes(s)).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.filter((s) => !SKILL_OPTIONS.includes(s)).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border px-3 py-1 text-xs">
                  {s}
                  <button onClick={() => removeSkill(s)} className="hover:opacity-70" aria-label={`Remove ${s}`}><X className="size-3" /></button>
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title="Career goal">
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} className="input resize-none" placeholder="What's your dream goal?" />
        </Section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-hero text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity shadow-glow">
            {busy ? "Saving…" : <>Save changes <Save className="size-4" /></>}
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 flex items-start gap-3">
          <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Recommendations on your <a href="/opportunities" className="text-foreground underline underline-offset-2">Opportunities</a> and <a href="/dashboard" className="text-foreground underline underline-offset-2">Dashboard</a> update the moment you save.
          </p>
        </div>
      </div>

      <style>{`.input{width:100%;border-radius:0.625rem;border:1px solid hsl(var(--border));background:hsl(var(--card));padding:0.5rem 0.75rem;font-size:0.875rem;outline:none;}.input:focus{box-shadow:0 0 0 2px hsl(var(--ring));}`}</style>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
