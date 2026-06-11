import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Eye, EyeOff, ArrowLeft, Mail, ArrowRight, CheckCircle,
  Shield, Zap, Users, LogIn,
} from "lucide-react";
import InstitutionalNavbar from "@/components/layout/InstitutionalNavbar";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

type View = "login" | "forgot" | "forgot-success";

const TRUST_BADGES = [
  { icon: <Zap size={13} />, text: "Match instantâneo" },
  { icon: <Shield size={13} />, text: "100% seguro" },
  { icon: <Users size={13} />, text: "+12.000 ativos" },
  { icon: <CheckCircle size={13} />, text: "Verificado" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<View>("login");
  const [forgotLoading, setForgotLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotForm = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      await login({ data: values });
      toast.success("Bem-vindo de volta!");
      setLocation("/dashboard");
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || "";
      toast.error(
        msg.includes("Invalid") || msg.includes("invalid")
          ? "E-mail ou senha incorretos."
          : "Erro ao entrar. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = async () => {
    setForgotLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setForgotLoading(false);
    setView("forgot-success");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#050b10" }}>

      {/* ── Landing-style background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/landing-page-bg-darkblue.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.35 }}
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(5,11,16,0.72) 0%, rgba(5,11,16,0.88) 60%, rgba(5,11,16,0.97) 100%)"
        }} />
      </div>

      {/* ── Ambient glows (matching landing) ── */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(124,252,0,0.06) 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)", filter: "blur(80px)" }} />

      {/* ── Institutional navbar ── */}
      <div className="relative z-50">
        <InstitutionalNavbar />
      </div>

      {/* ── Page content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="w-full max-w-[460px]"
        >

          <AnimatePresence mode="wait">
            {/* ── LOGIN VIEW ── */}
            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
              >
                {/* Header */}
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/12 border border-primary/22 text-primary mb-5 mx-auto">
                    <LogIn size={24} />
                  </div>
                  <h1 className="text-3xl font-bold leading-tight mb-2">Bem-vindo de volta</h1>
                  <p className="text-muted-foreground text-sm">Acesse sua conta extraGO</p>
                </div>

                <div className="glass-card p-7 rounded-2xl border border-white/8 shadow-xl backdrop-blur-sm">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-foreground/90">E-mail</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="seu@email.com"
                                type="email"
                                autoComplete="email"
                                {...field}
                                className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl transition-all"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-sm font-semibold text-foreground/90">Senha</FormLabel>
                              <button
                                type="button"
                                onClick={() => setView("forgot")}
                                className="text-xs text-primary/70 hover:text-primary font-semibold transition-colors"
                              >
                                Esqueceu a senha?
                              </button>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  autoComplete="current-password"
                                  {...field}
                                  className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl pr-10 transition-all"
                                />
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() => setShowPassword(v => !v)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none h-12 text-sm font-bold rounded-xl mt-1 transition-all gap-2"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <><Loader2 size={16} className="animate-spin" />Entrando...</>
                        ) : (
                          <>Entrar na conta <ArrowRight size={16} /></>
                        )}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-5 pt-5 border-t border-white/6 text-center text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <Link href="/register" className="text-primary hover:text-primary/80 font-bold transition-colors">
                      Cadastre-se grátis
                    </Link>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRUST_BADGES.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/6 bg-white/3 text-xs font-semibold text-white/65 backdrop-blur-sm"
                    >
                      <span className="text-primary flex-shrink-0">{b.icon}</span>
                      {b.text}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD VIEW ── */}
            {view === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => setView("login")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-7 transition-colors group"
                >
                  <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                  Voltar ao login
                </button>

                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/12 border border-primary/22 text-primary mb-5 mx-auto">
                    <Mail size={24} />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Recuperar senha</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                    Informe seu e-mail e enviaremos um link para redefinir sua senha.
                  </p>
                </div>

                <div className="glass-card p-7 rounded-2xl border border-white/8">
                  <Form {...forgotForm}>
                    <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
                      <FormField
                        control={forgotForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-foreground/90">E-mail da conta</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="seu@email.com"
                                type="email"
                                {...field}
                                className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none h-12 text-sm font-bold rounded-xl"
                        disabled={forgotLoading}
                      >
                        {forgotLoading ? (
                          <><Loader2 size={16} className="animate-spin mr-2" />Enviando...</>
                        ) : "Enviar link de recuperação"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </motion.div>
            )}

            {/* ── FORGOT SUCCESS VIEW ── */}
            {view === "forgot-success" && (
              <motion.div
                key="forgot-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="glass-card p-10 rounded-2xl border border-primary/20 text-center backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 18 }}
                    className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-6"
                  >
                    <CheckCircle size={30} />
                  </motion.div>
                  <h2 className="text-xl font-bold mb-2">E-mail enviado!</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-7">
                    Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha em breve.
                  </p>
                  <Button
                    onClick={() => setView("login")}
                    className="w-full bg-white/8 hover:bg-white/12 border border-white/12 text-foreground rounded-xl h-11 font-semibold"
                  >
                    Voltar ao login
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Bottom brand strip ── */}
      <div className="relative z-10 text-center py-4">
        <p className="text-[11px] text-white/22">© 2026 extraGO · Plataforma Premium de Hospitalidade</p>
      </div>
    </div>
  );
}
