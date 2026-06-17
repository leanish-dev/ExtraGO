import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardRedirect() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      setLocation("/admin");
    } else if (user.role === "freelancer") {
      setLocation("/app/career");
    } else {
      setLocation("/app/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-[#050b10] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
