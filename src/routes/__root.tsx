import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { Sparkles, UserCircle2, Menu, X, LayoutDashboard, Map, Compass, MessageCircle, Bookmark, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useState } from "react";

const MENU = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/roadmap", label: "AI Roadmap Generator", icon: Sparkles },
  { to: "/opportunities", label: "Opportunities", icon: Compass },
  { to: "/mentor", label: "AI Mentor", icon: MessageCircle },
  { to: "/saved-opportunities", label: "Saved Opportunities", icon: Bookmark },
  { to: "/saved-roadmaps", label: "Saved Roadmaps", icon: Map },
  { to: "/settings", label: "Edit Profile", icon: UserCircle2 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Lost on your path</h2>
        <p className="mt-2 text-sm text-muted-foreground">This route doesn't exist on FuturePath AI.</p>
        <Link to="/" className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Return home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FuturePath AI — Your Future, Guided by AI" },
      { name: "description", content: "Discover scholarships, internships, jobs and personalized career roadmaps powered by AI. Your future, guided." },
      { name: "author", content: "FuturePath AI" },
      { property: "og:title", content: "FuturePath AI — Your Future, Guided by AI" },
      { property: "og:description", content: "AI-powered career and education guidance for students and young professionals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function NavBar() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const initial = (profile?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <div className="size-8 rounded-xl bg-hero shadow-glow flex items-center justify-center shrink-0">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight truncate">FuturePath<span className="text-primary">.AI</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/opportunities" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Opportunities</Link>
          <Link to="/mentor" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>AI Mentor</Link>
          {user && <Link to="/dashboard" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Dashboard</Link>}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <Link
                to="/settings"
                aria-label="Profile & Settings"
                title="Profile & Settings"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 py-1 hover:border-primary/50 transition-colors"
              >
                <span className="size-7 rounded-full bg-hero text-white text-xs font-semibold flex items-center justify-center shadow-glow">{initial}</span>
                <span className="hidden sm:inline text-xs font-medium">Profile</span>
              </Link>
              <button
                onClick={() => setOpen((v) => !v)}
                className="md:hidden inline-flex size-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
                aria-label="Menu"
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
              <button onClick={signOut} className="hidden md:inline-flex text-sm px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "signin" }} className="text-sm px-3 sm:px-4 py-2 rounded-full hover:bg-secondary transition-colors">Sign in</Link>
              <Link to="/auth" search={{ mode: "signup" }} className="text-sm px-3 sm:px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity shadow-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
      {user && open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col text-sm">
            <Link to="/dashboard" onClick={() => setOpen(false)} className="py-2.5 text-foreground/80 hover:text-foreground">Dashboard</Link>
            <Link to="/opportunities" onClick={() => setOpen(false)} className="py-2.5 text-foreground/80 hover:text-foreground">Opportunities</Link>
            <Link to="/mentor" onClick={() => setOpen(false)} className="py-2.5 text-foreground/80 hover:text-foreground">AI Mentor</Link>
            <Link to="/settings" onClick={() => setOpen(false)} className="py-2.5 text-foreground/80 hover:text-foreground inline-flex items-center gap-2">
              <UserCircle2 className="size-4" /> Profile & Settings
            </Link>
            <button onClick={() => { setOpen(false); signOut(); }} className="mt-2 self-start text-sm px-4 py-2 rounded-full bg-foreground text-background">Sign out</button>
          </div>
        </div>
      )}
    </header>
  );
}

function RootComponent() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hideNav = path.startsWith("/auth") || path.startsWith("/onboarding");
  return (
    <>
      {!hideNav && <NavBar />}
      <Outlet />
    </>
  );
}
