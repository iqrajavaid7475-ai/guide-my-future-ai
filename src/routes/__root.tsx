import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { Sparkles, UserCircle2, Menu, X, LayoutDashboard, Map as MapIcon, Compass, MessageCircle, Bookmark, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useState } from "react";

const MENU = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, hash: "" },
  { to: "/roadmap", label: "AI Roadmap Generator", icon: Sparkles, hash: "" },
  { to: "/opportunities", label: "Opportunities", icon: Compass, hash: "" },
  { to: "/mentor", label: "AI Mentor", icon: MessageCircle, hash: "" },
  { to: "/saved-opportunities", label: "Saved Opportunities", icon: Bookmark, hash: "" },
  { to: "/saved-roadmaps", label: "Saved Roadmaps", icon: MapIcon, hash: "" },
  { to: "/settings", label: "Edit Profile", icon: UserCircle2, hash: "profile" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, hash: "preferences" },
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
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const initial = (profile?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();
  // First-match wins so only one item is highlighted at a time.
  const currentHash = (hash || "").replace(/^#/, "");
  const activeIdx = (() => {
    // Try hash-specific match first.
    const exact = MENU.findIndex((m) => path === m.to && m.hash && m.hash === currentHash);
    if (exact !== -1) return exact;
    // Otherwise first item that matches the pathname.
    return MENU.findIndex((m) => path === m.to);
  })();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <div className="size-8 rounded-xl bg-hero shadow-glow flex items-center justify-center shrink-0">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight truncate">FuturePath<span className="text-primary">.AI</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/opportunities" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground font-medium" }}>
            <Compass className="size-4" /> Opportunities
          </Link>
          <Link to="/roadmap" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground font-medium" }}>
            <MapIcon className="size-4" /> AI Roadmap
          </Link>
          <Link to="/mentor" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground font-medium" }}>
            <MessageCircle className="size-4" /> AI Mentor
          </Link>
          {user && (
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground font-medium" }}>
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
          )}
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
                className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
                aria-label="Menu"
                aria-expanded={open}
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
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
        <>
          <div className="fixed inset-0 top-16 z-30 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-2 sm:right-4 top-[calc(100%+8px)] z-40 w-[min(92vw,320px)] rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
            <div className="p-3 flex flex-col">
              {MENU.map((item, idx) => {
                const Icon = item.icon;
                const active = idx === activeIdx;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    hash={item.hash || undefined}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-secondary hover:text-foreground"}`}
                  >
                    <Icon className={`size-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
              <div className="my-2 h-px bg-border" />
              <button
                onClick={() => { setOpen(false); signOut(); }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/80 hover:bg-secondary hover:text-destructive transition-colors"
              >
                <LogOut className="size-4 text-muted-foreground" />
                Sign out
              </button>
            </div>
          </div>
        </>
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
