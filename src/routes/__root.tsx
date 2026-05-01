import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { Sparkles } from "lucide-react";

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
      { property: "og:description", content: "Discover scholarships, internships, jobs and personalized career roadmaps powered by AI. Your future, guided." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FuturePath AI — Your Future, Guided by AI" },
      { name: "twitter:description", content: "Discover scholarships, internships, jobs and personalized career roadmaps powered by AI. Your future, guided." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/517953c9-4565-4357-a0fd-65533f120129/id-preview-bf6b13d8--d73093d5-64fa-4b85-8eff-21b27cf9c01c.lovable.app-1777635007120.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/517953c9-4565-4357-a0fd-65533f120129/id-preview-bf6b13d8--d73093d5-64fa-4b85-8eff-21b27cf9c01c.lovable.app-1777635007120.png" },
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
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 rounded-xl bg-hero shadow-glow flex items-center justify-center">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">FuturePath<span className="text-primary">.AI</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/opportunities" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Opportunities</Link>
          <Link to="/mentor" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>AI Mentor</Link>
          {user && <Link to="/dashboard" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Dashboard</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="hidden sm:inline-flex text-sm px-4 py-2 rounded-full hover:bg-secondary transition-colors">Dashboard</Link>
              <button onClick={signOut} className="text-sm px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "signin" }} className="text-sm px-4 py-2 rounded-full hover:bg-secondary transition-colors">Sign in</Link>
              <Link to="/auth" search={{ mode: "signup" }} className="text-sm px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity shadow-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
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
