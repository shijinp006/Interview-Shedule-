import { RouterProvider } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "./lib/auth-client";
import { router } from "./router";
import { LoginPage } from "./features/auth/login-page";

export function App() {
  const { data: session, isPending } = authClient.useSession();
  console.log("asd");

  return (
    <>
      {isPending ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : session ? (
        <RouterProvider router={router} />
      ) : (
        <LoginPage />
      )}
      <Toaster richColors position="top-right" />
    </>
  );
}
