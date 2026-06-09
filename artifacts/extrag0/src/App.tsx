import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Toaster as SonnerToaster } from "sonner";

import { ErrorBoundary } from "@/components/error-boundary";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardRedirect from "@/pages/dashboard-redirect";
import InvestidoresParceirosPage from "@/pages/investidores-parceiros";
import ModeloDeNegocioPage from "@/pages/modelo-de-negocio";
import BlogPage from "@/pages/blog";
import SegurancaPage from "@/pages/seguranca";
import FAPerformancePage from "@/pages/financial-architecture/performance";
import FAReferralsPage from "@/pages/financial-architecture/referrals";
import FAProfessionalPlansPage from "@/pages/financial-architecture/professional-plans";
import FABusinessPlansPage from "@/pages/financial-architecture/business-plans";
import FARevenueStructurePage from "@/pages/financial-architecture/revenue-structure";
import FAExpansionModelPage from "@/pages/financial-architecture/expansion-model";
import FAStateRepresentativesPage from "@/pages/financial-architecture/state-representatives";
import AppLayout from "@/components/app-layout";

import DashboardPage from "@/pages/app/dashboard";
import JobsPage from "@/pages/app/jobs";
import PostJobPage from "@/pages/app/post-job";
import ApplicationsPage from "@/pages/app/applications";
import WalletPage from "@/pages/app/wallet";
import ReferralsPage from "@/pages/app/referrals";
import ProfilePage from "@/pages/app/profile";
import NotificationsPage from "@/pages/app/notifications";
import FeedPage from "@/pages/app/feed";
import FreelancerProfilePage from "@/pages/app/freelancer-profile";
import CompanyProfilePage from "@/pages/app/company-profile";
import NetworkPage from "@/pages/app/network";
import ChatPage from "@/pages/app/chat";
import JobDetailPage from "@/pages/app/job-detail";

import AdminDashboard from "@/pages/admin/index";
import AdminUsersPage from "@/pages/admin/users";
import AdminJobsPage from "@/pages/admin/jobs";
import AdminWithdrawalsPage from "@/pages/admin/withdrawals";
import AdminAnalyticsPage from "@/pages/admin/analytics";
import AdminOpsPage from "@/pages/admin/ops";
import AdminMapPage from "@/pages/admin/map";
import AdminRepresentativesPage from "@/pages/admin/representatives";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

function Spinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const ALL_USER_ROLES = ["company", "freelancer", "admin"];
const APP_ROLES = ["company", "freelancer"];
const ADMIN_ROLES = ["admin"];

function ProtectedRoute({
  component: Component,
  allowedRoles,
  layout = "app",
}: {
  component: React.ComponentType;
  allowedRoles?: string[];
  layout?: "app" | "admin" | "none";
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/app/dashboard");
      }
    }
  }, [user, isLoading, allowedRoles, setLocation]);

  if (isLoading) return <Spinner />;
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  if (layout === "app" || layout === "admin") {
    return (
      <AppLayout>
        <Component />
      </AppLayout>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={LandingPage} />
      <Route path="/investidores-parceiros" component={InvestidoresParceirosPage} />
      <Route path="/modelo-de-negocio" component={ModeloDeNegocioPage} />
      <Route path="/financial-architecture/performance" component={FAPerformancePage} />
      <Route path="/financial-architecture/referrals" component={FAReferralsPage} />
      <Route path="/financial-architecture/professional-plans" component={FAProfessionalPlansPage} />
      <Route path="/financial-architecture/business-plans" component={FABusinessPlansPage} />
      <Route path="/financial-architecture/revenue-structure" component={FARevenueStructurePage} />
      <Route path="/financial-architecture/expansion-model" component={FAExpansionModelPage} />
      <Route path="/financial-architecture/state-representatives" component={FAStateRepresentativesPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/seguranca" component={SegurancaPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardRedirect} layout="none" />} />

      {/* App routes — admins can also access these for platform monitoring */}
      <Route path="/app/dashboard" component={() => <ProtectedRoute component={DashboardPage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/jobs/new" component={() => <ProtectedRoute component={PostJobPage} allowedRoles={["company"]} />} />
      <Route path="/app/jobs/:id" component={() => <ProtectedRoute component={JobDetailPage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/jobs" component={() => <ProtectedRoute component={JobsPage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/applications" component={() => <ProtectedRoute component={ApplicationsPage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/wallet" component={() => <ProtectedRoute component={WalletPage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/referrals" component={() => <ProtectedRoute component={ReferralsPage} allowedRoles={["freelancer"]} />} />
      <Route path="/app/profile" component={() => <ProtectedRoute component={ProfilePage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/notifications" component={() => <ProtectedRoute component={NotificationsPage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/feed" component={() => <ProtectedRoute component={FeedPage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/freelancers/:id" component={() => <ProtectedRoute component={FreelancerProfilePage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/companies/:id" component={() => <ProtectedRoute component={CompanyProfilePage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/network" component={() => <ProtectedRoute component={NetworkPage} allowedRoles={ALL_USER_ROLES} />} />
      <Route path="/app/chat" component={() => <ProtectedRoute component={ChatPage} allowedRoles={APP_ROLES} />} />

      {/* Admin routes */}
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} allowedRoles={ADMIN_ROLES} layout="admin" />} />
      <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsersPage} allowedRoles={ADMIN_ROLES} layout="admin" />} />
      <Route path="/admin/jobs" component={() => <ProtectedRoute component={AdminJobsPage} allowedRoles={ADMIN_ROLES} layout="admin" />} />
      <Route path="/admin/withdrawals" component={() => <ProtectedRoute component={AdminWithdrawalsPage} allowedRoles={ADMIN_ROLES} layout="admin" />} />
      <Route path="/admin/analytics" component={() => <ProtectedRoute component={AdminAnalyticsPage} allowedRoles={ADMIN_ROLES} layout="admin" />} />
      <Route path="/admin/ops" component={() => <ProtectedRoute component={AdminOpsPage} allowedRoles={ADMIN_ROLES} layout="admin" />} />
      <Route path="/admin/map" component={() => <ProtectedRoute component={AdminMapPage} allowedRoles={ADMIN_ROLES} layout="admin" />} />
      <Route path="/admin/representatives" component={() => <ProtectedRoute component={AdminRepresentativesPage} allowedRoles={ADMIN_ROLES} layout="admin" />} />

      <Route component={NotFound} />
    </Switch>
  );
}

const INSTITUTIONAL_PREFIXES = [
  "/investidores-parceiros",
  "/modelo-de-negocio",
  "/financial-architecture",
  "/blog",
  "/seguranca",
  "/login",
  "/register",
];

function InstitutionalPageEffect() {
  const [location] = useLocation();
  useEffect(() => {
    const isInstitutional =
      location === "/" ||
      INSTITUTIONAL_PREFIXES.some(p => location.startsWith(p));
    if (isInstitutional) {
      document.body.classList.add("institutional-page");
    } else {
      document.body.classList.remove("institutional-page");
    }
    return () => document.body.classList.remove("institutional-page");
  }, [location]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <ScrollToTop />
            <div className="min-h-[100dvh] text-foreground overflow-x-hidden">
              <InstitutionalPageEffect />
              <Router />
            </div>
          </AuthProvider>
        </WouterRouter>
        </ErrorBoundary>
        <Toaster />
        <SonnerToaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#ffffff",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
