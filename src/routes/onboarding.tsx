import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding · FuturePath AI" }, { name: "description", content: "Tell us about your goals so we can personalize your path." }] }),
  component: Onboarding,
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      // gate handled inside component due to async session
    }
  },
});

const EDU = ["High school", "Undergraduate", "Graduate", "Postgraduate", "Working professional"];
const FIELDS = ["Computer Science", "Engineering", "Design", "Business", "Finance", "AI / Machine Learning", "Data Science", "Product", "Marketing", "Sciences", "Web", "Other"];
const SKILL_OPTIONS = ["Python", "JavaScript", "React", "TypeScript", "SQL", "Figma", "Communication", "Leadership", "Research", "Math", "Writing", "Marketing", "Strategy", "PyTorch", "C++"];

function Onboarding() {
  const { user, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [education, setEducation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && !user) { navigate({ to: "/auth", search: { mode: "signin" } }); return null; }

  const toggleInterest = (s: string) => setInterests((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const addCustomInterest = () => {
    const v = customInterest.trim();
    if (!v) { toast.error("Type an interest first"); return; }
    if (interests.some((i) => i.toLowerCase() === v.toLowerCase())) { toast.error("Already added"); return; }
    setInterests((p) => [...p, v]);
    setCustomInterest("");
  };
  const toggleSkill = (s: string) => setSkills((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      full_name: name || null, country, education_level: education,
      field_of_interest: interests[0] ?? null, interests, skills, career_goal: goal, onboarded: true,
    }).eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Profile saved! Let's build your path.");
    navigate({ to: "/dashboard" });
  };

  const steps = [
    {
      title: "What should we call you?",
      sub: "And where are you based?",
      content: (
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country (e.g. Nigeria, India, USA)" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      ),
      can: () => name.trim().length > 0 && country.trim().length > 0,
    },
    {
      title: "Where are you in your journey?",
      sub: "Pick your current education level.",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {EDU.map((e) => (
            <button key={e} onClick={() => setEducation(e)} className={`rounded-xl border p-4 text-sm text-left transition-all ${education === e ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40"}`}>
              {e}
            </button>
          ))}
        </div>
      ),
      can: () => !!education,
    },
    {
      title: "What field excites you?",
      sub: "We'll match you to opportunities here.",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {FIELDS.map((f) => (
            <button key={f} onClick={() => setField(f)} className={`rounded-xl border p-3 text-sm text-left transition-all ${field === f ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40"}`}>
              {f}
            </button>
          ))}
        </div>
      ),
      can: () => !!field,
    },
    {
      title: "What skills do you have?",
      sub: "Pick a few — you can refine later.",
      content: (
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((s) => (
            <button key={s} onClick={() => toggleSkill(s)} className={`rounded-full border px-4 py-2 text-sm transition-all ${skills.includes(s) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}>
              {s}
            </button>
          ))}
        </div>
      ),
      can: () => skills.length > 0,
    },
    {
      title: "What's your dream goal?",
      sub: "One sentence is perfect.",
      content: (
        <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={4} placeholder="e.g. Become an ML engineer at a top AI lab in 3 years" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      ),
      can: () => goal.trim().length > 5,
    },
  ];

  const cur = steps[step];
  const last = step === steps.length - 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mesh">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="size-9 rounded-xl bg-hero shadow-glow flex items-center justify-center"><Sparkles className="size-4 text-white" /></div>
          <span className="font-display font-semibold text-lg">FuturePath.AI</span>
        </div>
        <div className="rounded-3xl bg-card border border-border p-7 sm:p-10 shadow-elevated">
          <div className="flex gap-1.5 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"}`} />
            ))}
          </div>
          <div className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-1 tracking-tight">{cur.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{cur.sub}</p>
          <div className="mt-7">{cur.content}</div>
          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30">
              <ArrowLeft className="size-4" /> Back
            </button>
            {!last ? (
              <button onClick={() => setStep(step + 1)} disabled={!cur.can()} className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-30 transition-opacity">
                Continue <ArrowRight className="size-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={!cur.can() || busy} className="inline-flex items-center gap-2 rounded-full bg-hero text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-30 transition-opacity shadow-glow">
                {busy ? "Saving…" : "Build my future"} <Sparkles className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
