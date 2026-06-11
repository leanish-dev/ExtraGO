import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GlobalSearch } from "@/components/global-search";
import UnifiedNavbar from "@/components/layout/InstitutionalNavbar";

/* ── Premium background using the attached artwork ── */
function AppBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/app-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay for readability — graduated top to bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(2,5,9,0.58) 0%, rgba(2,5,9,0.48) 40%, rgba(2,5,9,0.65) 100%)",
        }}
      />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // ⌘K / Ctrl+K → global search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setGlobalSearchOpen(v => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!user) return null;

  const isChatPage = location.startsWith("/app/chat");

  return (
    <div className="dark relative flex flex-col h-[100dvh] overflow-hidden text-foreground">
      <AppBackground />

      <GlobalSearch open={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />

      {/* Single unified navbar (Phase 4) */}
      <UnifiedNavbar onSearchOpen={() => setGlobalSearchOpen(true)} />

      {/* Scrollable content area */}
      <main
        className={`relative z-10 flex-1 min-h-0 ${
          isChatPage ? "flex flex-col overflow-hidden" : "overflow-y-auto"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
