import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[extraGO] Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={28} className="text-destructive" />
            </div>
            <h1 className="text-xl font-bold mb-2">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Ocorreu um erro inesperado. Tente recarregar a página.
              {this.state.error?.message && (
                <span className="block mt-2 text-[11px] font-mono text-destructive/70 break-all">
                  {this.state.error.message}
                </span>
              )}
            </p>
            <Button
              onClick={() => { this.setState({ hasError: false, error: undefined }); window.location.reload(); }}
              className="bg-primary text-black hover:bg-primary/90 font-bold border-none rounded-xl neon-glow gap-2"
            >
              <RefreshCw size={14} />
              Recarregar
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
