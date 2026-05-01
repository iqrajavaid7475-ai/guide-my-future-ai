import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional().default("signin") });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in · FuturePath AI" }, { name: "description", content: "Sign in or create an account on FuturePath AI." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: profile?.onboarded ? "/dashboard" : "/onboarding" });
    }
  }, [user, profile, loading, navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Welcome to FuturePath AI!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally { setBusy(false); }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error("Google sign-in failed"); setBusy(false); return; }
    if (result.redirected) return;
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <Link to="/" className="relative inline-flex items-center gap-2 text-sm opacity-90 hover:opacity-100 w-fit">
          <ArrowLeft className="size-4" /> Back home
        </Link>
        <div className="relative">
          <div className="flex items-center gap-2 mb-8">
            <div className="size-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Sparkles className="size-5" />
            </div>
            <span className="font-display text-xl font-semibold">FuturePath.AI</span>
          </div>
          <h2 className="font-display text-4xl xl:text-5xl font-semibold leading-tight">Your future, guided by AI.</h2>
          <p className="mt-4 text-white/80 max-w-md">Personalized roadmaps. Curated opportunities. A mentor that knows your goal.</p>
        </div>
        <div className="relative text-xs text-white/60">© FuturePath AI</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-sm text-muted-foreground mb-6"><ArrowLeft className="size-4" /> Back</Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="text-sm text-muted-foreground mt-2">{isSignup ? "Start building your AI-guided future." : "Sign in to continue your journey."}</p>

          <button onClick={handleGoogle} disabled={busy} className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="size-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.99 6.99 0 015.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 001 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or with email <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {isSignup && (
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            )}
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button type="submit" disabled={busy} className="w-full rounded-full bg-foreground text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            {isSignup ? "Already have an account?" : "New here?"}{" "}
            <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-medium hover:underline">
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
