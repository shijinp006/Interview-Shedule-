import { useEffect, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Users, UserCog, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { viewerTz, tzCity, formatInTz } from "@/lib/tz";
import { useConfirm } from "@/components/confirm-dialog";

const NAV = [
  { to: "/", label: "Calendar", icon: CalendarDays },
  { to: "/candidates", label: "Candidates", icon: Users },
  { to: "/interviewers", label: "Interviewers", icon: UserCog },
] as const;

function HeaderClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hidden items-center gap-2 rounded-md border px-2.5 py-1 md:flex">
      <span className="bg-signal size-1.5 animate-pulse rounded-full motion-reduce:animate-none" />
      <span className="font-mono text-sm">{formatInTz(now, viewerTz, "HH:mm:ss")}</span>
      <span className="text-muted-foreground font-mono text-xs">{tzCity(viewerTz)}</span>
    </div>
  );
}

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: session } = authClient.useSession();
  const confirm = useConfirm();

  async function onSignOut() {
    const ok = await confirm({
      title: "Sign out?",
      description: "You'll need to sign in again to manage interviews.",
      confirmText: "Sign out",
    });
    if (ok) authClient.signOut();
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card/80 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="bg-primary relative grid size-7 place-items-center rounded-md">
              <CalendarDays className="text-primary-foreground size-4" />
              <span className="bg-signal border-card absolute -right-0.5 -bottom-0.5 size-2 rounded-full border" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Micro-ATS</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <HeaderClock />
            <span className="text-muted-foreground hidden text-sm lg:inline">
              {session?.user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              <LogOut className="size-4" />
              <span className="max-sm:sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
