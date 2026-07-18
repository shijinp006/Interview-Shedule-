import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatInTz, tzCity, viewerTz } from "@/lib/tz";

const WORLD = [
  { label: "You", tz: viewerTz },
  { label: "New York", tz: "America/New_York" },
  { label: "London", tz: "Europe/London" },
  { label: "Bengaluru", tz: "Asia/Kolkata" },
];

function WorldClocks() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
      {WORLD.map(({ label, tz }) => (
        <div key={label} className="flex items-baseline justify-between gap-3">
          <dt className="font-mono text-[11px] tracking-widest text-white/50 uppercase">
            {label === "You" ? `You · ${tzCity(tz)}` : label}
          </dt>
          <dd className="font-mono text-sm text-white/90">{formatInTz(now, tz, "HH:mm")}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LoginPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("recruiter@micro-ats.test");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name });

      console.log(res, "res");


      if (res.error) toast.error(res.error.message ?? "Authentication failed");

      console.log(res.error, "error");


    } catch {


      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — the blueprint console thesis */}
      <div
        className="bg-primary text-primary-foreground relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative grid size-7 place-items-center rounded-md bg-white/10">
            <CalendarDays className="size-4" />
            <span className="bg-signal absolute -right-0.5 -bottom-0.5 size-2 rounded-full" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Micro-ATS</span>
        </div>

        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-[1.1] font-semibold text-balance">
            Schedule with certainty.
          </h1>
          <p className="mt-4 text-white/70">
            Assign candidates to interviewers across timezones. The backend refuses to
            double-book anyone — every time is stored in UTC and shown in yours.
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <WorldClocks />
        </div>
      </div>

      {/* Sign-in */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="bg-primary grid size-7 place-items-center rounded-md">
              <CalendarDays className="text-primary-foreground size-4" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Micro-ATS</span>
          </div>

          <h2 className="font-display text-2xl font-semibold">
            {mode === "sign-in" ? "Sign in" : "Create your account"}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {mode === "sign-in"
              ? "Recruiter access to the scheduling desk."
              : "Register a recruiter account."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "sign-up" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "sign-in" ? "Sign in" : "Sign up"}
            </Button>
          </form>

          <button
            type="button"
            className="text-muted-foreground hover:text-foreground mt-4 w-full text-center text-sm"
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          >
            {mode === "sign-in"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
