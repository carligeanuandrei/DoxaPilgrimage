import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VerifyAccountPage from "@/pages/verify-account-page";
import PilgrimagesPage from "@/pages/pilgrimages-page";
import PilgrimageDetailsPage from "@/pages/pilgrimage-details-page";
import ProfilePage from "@/pages/profile-page";
import EditProfilePage from "@/pages/edit-profile-page";
import OrthodoxCalendarPage from "@/pages/orthodox-calendar-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import TermsPage from "@/pages/terms-page";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import CookiesPage from "@/pages/cookies-page";
import OrganizerDashboard from "@/pages/organizer/dashboard";
import CreatePilgrimagePage from "@/pages/organizer/create-pilgrimage";
import CmsPage from "@/pages/admin/cms-page";
import UsersPage from "@/pages/admin/users-page";
import AdminPilgrimagesPage from "@/pages/admin/pilgrimages-page";
import AdminLoginPage from "@/pages/admin/admin-login";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/termeni-si-conditii" component={TermsPage} />
      <Route path="/politica-de-confidentialitate" component={PrivacyPolicyPage} />
      <Route path="/cookies" component={CookiesPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/pilgrimages" component={PilgrimagesPage} />
      <Route path="/pilgrimages/:id" component={PilgrimageDetailsPage} />
      <Route path="/orthodox-calendar" component={OrthodoxCalendarPage} />
      <Route path="/profile">
        <ProtectedRoute component={ProfilePage} path="/profile" />
      </Route>
      <Route path="/edit-profile">
        <ProtectedRoute component={EditProfilePage} path="/edit-profile" />
      </Route>
      <Route path="/organizer/dashboard">
        <ProtectedRoute component={OrganizerDashboard} path="/organizer/dashboard" />
      </Route>
      <Route path="/organizer/create-pilgrimage">
        <ProtectedRoute component={CreatePilgrimagePage} path="/organizer/create-pilgrimage" />
      </Route>
      {/* Admin routes */}
      <Route path="/admin/cms">
        <ProtectedRoute component={CmsPage} path="/admin/cms" adminOnly={true} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={UsersPage} path="/admin/users" adminOnly={true} />
      </Route>
      <Route path="/admin/pilgrimages">
        <ProtectedRoute component={AdminPilgrimagesPage} path="/admin/pilgrimages" adminOnly={true} />
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
