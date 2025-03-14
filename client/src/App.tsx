import { Switch, Route, useLocation } from "wouter";
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
import FastingRecipesPage from "@/pages/fasting-recipes-page";
import FastingRecipeDetailsPage from "@/pages/fasting-recipe-details-page";
import DoxaAIPage from "@/pages/doxa-ai-page";
import OrganizerDashboard from "@/pages/organizer/new-dashboard";
import CreatePilgrimageNewPage from "@/pages/organizer/create-pilgrimage-new";
import EditPilgrimagePage from "@/pages/organizer/edit-pilgrimage";
import RegisterOrganizerPage from "@/pages/organizer/register-fix";
import CmsPage from "@/pages/admin/cms-page";
import BuilderPage from "@/pages/admin/builder-page";
import UsersPage from "@/pages/admin/users-page";
import AdminPilgrimagesPage from "@/pages/admin/pilgrimages-page";
import OrganizerStatsPage from "@/pages/admin/organizer-stats-page";
import MonasteriesPageAdmin from "@/pages/admin/monasteries-page";
import FastingRecipesAdminPage from "@/pages/admin/fasting-recipes";
import CustomCssEditor from "@/pages/admin/custom-css-editor";
import DoxaAiDashboard from "@/pages/admin/doxaai-dashboard";
import AdminLoginPage from "@/pages/admin/admin-login";
import EditablePage from "@/pages/EditablePage";
import MonasteriesPage from "@/pages/monasteries/index";
import MonasteryDetailsPage from "@/pages/monasteries/[slug]";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useEffect } from "react";
import CustomCssLoader from "@/components/shared/custom-css-loader";

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
      <Route path="/pilgrimages/:id">
        {(params) => <PilgrimageDetailsPage id={params.id} />}
      </Route>
      <Route path="/monasteries" component={MonasteriesPage} />
      <Route path="/monasteries/:slug">
        {(params) => <MonasteryDetailsPage slug={params.slug} />}
      </Route>
      <Route path="/orthodox-calendar" component={OrthodoxCalendarPage} />
      <Route path="/retete-de-post" component={FastingRecipesPage} />
      <Route path="/retete-de-post/:slug">
        {(params) => <FastingRecipeDetailsPage slug={params.slug} />}
      </Route>
      <Route path="/doxa-ai" component={DoxaAIPage} />
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
        <ProtectedRoute component={CreatePilgrimageNewPage} path="/organizer/create-pilgrimage" />
      </Route>
      <Route path="/organizer/edit-pilgrimage/:id">
        <ProtectedRoute component={EditPilgrimagePage} path="/organizer/edit-pilgrimage/:id" />
      </Route>
      <Route path="/organizer/register" component={RegisterOrganizerPage} />
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
      <Route path="/admin/organizer-stats">
        <ProtectedRoute component={OrganizerStatsPage} path="/admin/organizer-stats" adminOnly={true} />
      </Route>
      <Route path="/admin/builder">
        <ProtectedRoute component={BuilderPage} path="/admin/builder" adminOnly={true} />
      </Route>
      <Route path="/admin/monasteries">
        <ProtectedRoute component={MonasteriesPageAdmin} path="/admin/monasteries" adminOnly={true} />
      </Route>
      <Route path="/admin/fasting-recipes">
        <ProtectedRoute component={FastingRecipesAdminPage} path="/admin/fasting-recipes" adminOnly={true} />
      </Route>
      <Route path="/admin/custom-css">
        <ProtectedRoute component={CustomCssEditor} path="/admin/custom-css" adminOnly={true} />
      </Route>
      <Route path="/admin/doxaai">
        <ProtectedRoute component={DoxaAiDashboard} path="/admin/doxaai" adminOnly={true} />
      </Route>
      {/* Dynamic page route - matches custom pages created in the editor */}
      <Route path="/:slug">
        {(params) => <EditablePage slug={params.slug} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Realizează scroll către începutul paginii la fiecare schimbare de rută
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <CustomCssLoader />
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
