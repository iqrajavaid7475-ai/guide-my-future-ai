import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Sparkles, GraduationCap, Briefcase, BookOpen, Compass, Bot, Bookmark, Zap, Target, Globe2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroImg from "@/assets/hero-pathways.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FuturePath AI — Your Future, Guided by AI" },
      { name: "description", content: "AI-personalized career roadmaps, scholarships, internships and jobs for students and young professionals." },
      { property: "og:title", content: "FuturePath AI — Your Future, Guided by AI" },
      { property: "og:description", content: "AI-personalized career roadmaps, scholarships, internships and jobs." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cta = () => navigate({ to: user ? "/dashboard" : "/auth", search: user ? undefined : { mode: "signup" } });

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-20 lg:pt-32 lg:pb-32">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                AI-powered guidance · live now
              </div>
              <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight">
                Your future,<br />
                <span className="text-gradient">guided by AI.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                FuturePath AI builds a personalized roadmap to your career. Get matched to scholarships, internships and jobs — and chat with an AI mentor who actually knows your goals.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button onClick={cta} className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3.5 text-sm font-medium hover:opacity-90 transition-all shadow-elevated">
                  {user ? "Go to dashboard" : "Start your path"}
                  <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <Link to="/opportunities" className="inline-flex items-center gap-2 rounded-full bg-surface-elevated border border-border px-6 py-3.5 text-sm font-medium hover:bg-secondary transition-colors">
                  Browse opportunities
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-8 text-xs text-muted-foreground">
                <div><div className="font-display text-2xl text-foreground">10k+</div>opportunities</div>
                <div><div className="font-display text-2xl text-foreground">120+</div>countries</div>
                <div><div className="font-display text-2xl text-foreground">AI</div>personalized</div>
              </div>
            </div>
            <div className="relative animate-float">
              <div className="absolute -inset-8 bg-hero opacity-20 blur-3xl rounded-full" />
              <img src={heroImg} alt="Glowing AI-guided career pathways through clouds toward a bright horizon" width={1600} height={1200} className="relative rounded-3xl shadow-elevated border border-border/60" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">A complete career compass.</h2>
          <p className="mt-4 text-muted-foreground text-lg">Everything you need to turn ambition into a plan, and a plan into momentum.</p>
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Compass, title: "Personalized roadmaps", desc: "AI builds a multi-phase plan tailored to your goal, skills and timeline." },
            { icon: Bot, title: "AI mentor 24/7", desc: "Ask anything — career switches, interview prep, study tactics. Real, contextual advice." },
            { icon: GraduationCap, title: "Scholarships matched", desc: "Discover funding for studies abroad and at home, ranked by your fit." },
            { icon: Briefcase, title: "Internships & jobs", desc: "Curated openings from world-class companies — local and remote." },
            { icon: BookOpen, title: "Course recommendations", desc: "Free and paid programs that close your specific skill gaps." },
            { icon: Bookmark, title: "Save & track", desc: "Bookmark opportunities and revisit them when deadlines approach." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-elevated hover:-translate-y-0.5 transition-all">
              <div className="size-11 rounded-xl bg-secondary flex items-center justify-center mb-5 group-hover:bg-hero group-hover:shadow-glow transition-all">
                <Icon className="size-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 lg:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">From profile to plan in 3 minutes.</h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { n: "01", icon: Target, title: "Tell us your goal", desc: "Education, field, skills, dream role — quick onboarding." },
              { n: "02", icon: Sparkles, title: "AI generates your roadmap", desc: "A multi-phase career plan with milestones and resources." },
              { n: "03", icon: Zap, title: "Act on opportunities", desc: "Get matched to scholarships, jobs and courses that fit you." },
            ].map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="rounded-2xl bg-card border border-border p-7">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl text-muted-foreground/40">{n}</span>
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl mt-6">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 sm:px-8 py-20 lg:py-28">
        <div className="relative overflow-hidden rounded-3xl bg-hero p-10 sm:p-16 text-white shadow-elevated">
          <div className="absolute inset-0 bg-mesh opacity-30" />
          <div className="relative">
            <Globe2 className="size-10 mb-6 opacity-90" />
            <h2 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight max-w-2xl">Ready to chart your future?</h2>
            <p className="mt-4 text-white/85 text-lg max-w-xl">Join thousands of students and young professionals using AI to find their next move.</p>
            <button onClick={cta} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-foreground px-6 py-3.5 text-sm font-medium hover:bg-white/90 transition-colors">
              {user ? "Open dashboard" : "Create your free account"}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-hero" />
            <span>© {new Date().getFullYear()} FuturePath AI</span>
          </div>
          <div className="flex gap-6">
            <Link to="/opportunities" className="hover:text-foreground">Opportunities</Link>
            <Link to="/mentor" className="hover:text-foreground">Mentor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
