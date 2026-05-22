import React from "react";
import { Link } from "wouter";
import logoBanner from "@assets/file_00000000a6a0720ebf53cbf894c13554_1779452671810.png";
import logoMain from "@assets/1779451173221_1779452671733.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[rgba(124,252,0,0.15)] via-background to-background pointer-events-none" />
      
      <header className="relative z-10 flex items-center justify-between p-6 max-w-7xl w-full mx-auto">
        <Link href="/">
          <img src={logoMain} alt="extraGO Logo" className="h-8 object-contain cursor-pointer" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Entrar
          </Link>
          <Link href="/register" className="text-sm font-medium">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow border-none rounded-full px-6">
              Criar Conta
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 py-20 text-center max-w-5xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 w-full max-w-2xl mx-auto"
        >
          <img src={logoBanner} alt="extraGO Banner" className="w-full h-auto drop-shadow-[0_0_30px_rgba(124,252,0,0.3)]" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
        >
          A revolução dos <span className="neon-text-gradient">extras</span> na hospitalidade
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
        >
          Conectamos restaurantes, bares e eventos aos melhores profissionais freelancers do Brasil, em tempo real. Rápido, seguro e premium.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
        >
          <Link href="/register?role=company" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full font-bold text-lg h-14 px-8 shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              Sou Empresa
            </Button>
          </Link>
          <Link href="/register?role=freelancer" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full rounded-full font-bold text-lg h-14 px-8 border-primary/50 text-primary hover:bg-primary/10">
              Quero Trabalhar
            </Button>
          </Link>
        </motion.div>
      </main>
      
      {/* Decorative noise */}
      <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}