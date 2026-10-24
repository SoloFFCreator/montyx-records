import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { SiteFrame } from "@/components/SiteLayout";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

function Public({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}

function Router() {
  return (
    <Switch>
      <Route
        path="/"
        component={() => (
          <Public>
            <Home />
          </Public>
        )}
      />
      <Route path="/releases" component={() => <Redirect to="/#platforms" />} />
      <Route
        path="/releases/:slug"
        component={() => <Redirect to="/#platforms" />}
      />
      <Route path="/about" component={() => <Redirect to="/#about" />} />
      <Route
        path="/artists/:slug"
        component={() => <Redirect to="/#about" />}
      />
      <Route
        path="/contact"
        component={() => (
          <Public>
            <Contact />
          </Public>
        )}
      />
      <Route
        path="/privacy"
        component={() => (
          <Public>
            <Legal page="privacy" />
          </Public>
        )}
      />
      <Route
        path="/terms"
        component={() => (
          <Public>
            <Legal page="terms" />
          </Public>
        )}
      />
      <Route
        path="/rights"
        component={() => (
          <Public>
            <Legal page="rights" />
          </Public>
        )}
      />
      <Route
        component={() => (
          <Public>
            <NotFound />
          </Public>
        )}
      />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ErrorBoundary>
  );
}
