import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PilgrimagesPage from "@/pages/pilgrimages-page";
import PilgrimageDetailsPage from "@/pages/pilgrimage-details-page";
import ProfilePage from "@/pages/profile-page";
import OrthodoxCalendarPage from "@/pages/orthodox-calendar-page";
import OrganizerDashboard from "@/pages/organizer/dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/pilgrimages" component={PilgrimagesPage} />
      <Route path="/pilgrimages/:id" component={PilgrimageDetailsPage} />
      <Route path="/orthodox-calendar" component={OrthodoxCalendarPage} />
      <Route path="/profile">
        <ProtectedRoute component={ProfilePage} path="/profile" />
      </Route>
      <Route path="/organizer/dashboard">
        <ProtectedRoute component={OrganizerDashboard} path="/organizer/dashboard" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Router />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
