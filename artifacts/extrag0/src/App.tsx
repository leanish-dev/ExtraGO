import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Toaster as SonnerToaster } from "sonner";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardRedirect from "@/pages/dashboard-redirect";
import AppLayout from "@/components/app-layout";

import DashboardPage from "@/pages/app/dashboard";
import JobsPage from "@/pages/app/jobs";
import PostJobPage from "@/pages/app/post-job";
import ApplicationsPage from "@/pages/app/applications";
import WalletPage from "@/pages/app/wallet";
import ReferralsPage from "@/pages/app/referrals";
import ProfilePage from "@/pages/app/profile";
import NotificationsPage from "@/pages/app/notifications";

import AdminDashboard from "@/pages/admin/index";
import AdminUsersPage from "@/pages/admin/users";
import AdminJobsPage from "@/pages/admin/jobs";
import AdminWithdrawalsPage from "@/pages/admin/withdrawals";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function Spinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
      setLocation("/dashboard");
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
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardRedirect} layout="none" />} />

      {/* App routes (company + freelancer) */}
      <Route path="/app/dashboard" component={() => <ProtectedRoute component={DashboardPage} allowedRoles={["company", "freelancer"]} />} />
      <Route path="/app/jobs/new" component={() => <ProtectedRoute component={PostJobPage} allowedRoles={["company"]} />} />
      <Route path="/app/jobs" component={() => <ProtectedRoute component={JobsPage} allowedRoles={["company", "freelancer"]} />} />
      <Route path="/app/applications" component={() => <ProtectedRoute component={ApplicationsPage} allowedRoles={["company", "freelancer"]} />} />
      <Route path="/app/wallet" component={() => <ProtectedRoute component={WalletPage} allowedRoles={["company", "freelancer"]} />} />
      <Route path="/app/referrals" component={() => <ProtectedRoute component={ReferralsPage} allowedRoles={["freelancer"]} />} />
      <Route path="/app/profile" component={() => <ProtectedRoute component={ProfilePage} allowedRoles={["company", "freelancer"]} />} />
      <Route path="/app/notifications" component={() => <ProtectedRoute component={NotificationsPage} allowedRoles={["company", "freelancer"]} />} />

      {/* Admin routes */}
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} layout="admin" />} />
      <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsersPage} allowedRoles={["admin"]} layout="admin" />} />
      <Route path="/admin/jobs" component={() => <ProtectedRoute component={AdminJobsPage} allowedRoles={["admin"]} layout="admin" />} />
      <Route path="/admin/withdrawals" component={() => <ProtectedRoute component={AdminWithdrawalsPage} allowedRoles={["admin"]} layout="admin" />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <div className="dark min-h-[100dvh] bg-background text-foreground overflow-x-hidden">
              <Router />
            </div>
          </AuthProvider>
        </WouterRouter>
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
