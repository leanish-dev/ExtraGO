import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050b10]">
      <div className="text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">404</h1>
        <p className="text-lg font-semibold text-white/70 mb-1">Página não encontrada</p>
        <p className="text-sm text-white/40 mb-8">Esta página não existe ou foi removida.</p>
        <Link href="/">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all">
            <ArrowLeft size={15} /> Voltar ao início
          </button>
        </Link>
      </div>
    </div>
  );
}
