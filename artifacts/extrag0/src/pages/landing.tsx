import React from "react";
import { Link } from "wouter";
import logoBanner from "@assets/file_00000000a6a0720ebf53cbf894c13554_1779452671810.png";
import logoMain from "@assets/1779451173221_1779452671733.png";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function AnimatedOrb({
  color,
  size,
  initialX,
  initialY,
  animateX,
  animateY,
  duration,
}: {
  color: string;
  size: number;
  initialX: string;
  initialY: string;
  animateX: string[];
  animateY: string[];
  duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: initialX,
        top: initialY,
        background: color,
        filter: "blur(100px)",
        opacity: 0.13,
      }}
      animate={{
        x: animateX,
        y: animateY,
        scale: [1, 1.15, 0.95, 1.1, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    />
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatedOrb
          color="#7CFC00"
          size={500}
          initialX="-10%"
          initialY="-5%"
          animateX={["0%", "8%", "-4%", "6%", "0%"]}
          animateY={["0%", "10%", "5%", "-6%", "0%"]}
          duration={14}
        />
        <AnimatedOrb
          color="#00E5FF"
          size={420}
          initialX="60%"
          initialY="30%"
          animateX={["0%", "-10%", "5%", "-6%", "0%"]}
          animateY={["0%", "-8%", "12%", "4%", "0%"]}
          duration={11}
        />
        <AnimatedOrb
          color="#7CFC00"
          size={300}
          initialX="75%"
          initialY="-10%"
          animateX={["0%", "-5%", "8%", "-3%", "0%"]}
          animateY={["0%", "15%", "5%", "-8%", "0%"]}
          duration={13}
        />
      </div>

      {/* Noise overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Header */}
      <header className="sticky top-0 z-20 w-full backdrop-blur-md bg-background/60 border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto w-full">
          <Link href="/">
            <img src={logoMain} alt="extraGO Logo" className="h-7 object-contain cursor-pointer" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow border-none rounded-full px-5 h-9 text-sm font-semibold">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 w-full max-w-xl mx-auto"
          >
            <img
              src={logoBanner}
              alt="extraGO Banner"
              className="w-full h-auto drop-shadow-[0_0_30px_rgba(124,252,0,0.3)] max-w-full"
            />
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
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none"
          >
            <Link href="/register?role=company" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full font-bold text-lg h-14 px-8 shadow-[0_0_20px_rgba(0,229,255,0.4)]"
              >
                Sou Empresa
              </Button>
            </Link>
            <Link href="/register?role=freelancer" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full font-bold text-lg h-14 px-8 border-primary/50 text-primary hover:bg-primary/10"
              >
                Quero Trabalhar
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
