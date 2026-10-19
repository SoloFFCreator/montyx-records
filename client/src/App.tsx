import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { SiteFrame } from "@/components/SiteLayout";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Artist from "./pages/Artist";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import ReleaseDetail from "./pages/ReleaseDetail";
import Releases from "./pages/Releases";

function Public({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
function Router() {
  return (
    <Switch>
      <Route path="/admin" component={Admin} />
      <Route
        path="/"
        component={() => (
          <Public>
            <Home />
          </Public>
        )}
      />
      <Route
        path="/releases"
        component={() => (
          <Public>
            <Releases />
          </Public>
        )}
      />
      <Route
        path="/releases/:slug"
        component={() => (
          <Public>
            <ReleaseDetail />
          </Public>
        )}
      />
      <Route
        path="/about"
        component={() => (
          <Public>
            <About />
          </Public>
        )}
      />
      <Route
        path="/artists/:slug"
        component={() => (
          <Public>
            <Artist />
          </Public>
        )}
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
