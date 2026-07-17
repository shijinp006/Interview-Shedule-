import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "./components/layout";
import { CalendarPage } from "./features/scheduling/calendar-page";
import { CandidatesPage } from "./features/candidates/candidates-page";
import { InterviewersPage } from "./features/interviewers/interviewers-page";

const rootRoute = createRootRoute({ component: AppLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CalendarPage,
});

const candidatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidates",
  component: CandidatesPage,
});

const interviewersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/interviewers",
  component: InterviewersPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  candidatesRoute,
  interviewersRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
