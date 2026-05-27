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
import heroBanner from "@assets/file_0000000034c4720eab761e343da632dc_1779868067089.png";
import logoMain from "@assets/1779451173221_1779452671733.png";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Users, CheckCircle, Loader2, Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

const BRAND_POINTS = [
  { icon: <Zap size={15} />, text: "Match instantâneo com vagas" },
  { icon: <Shield size={15} />, text: "Pagamento 100% garantido" },
  { icon: <Users size={15} />, text: "+12.000 profissionais ativos" },
  { icon: <CheckCircle size={15} />, text: "Perfis verificados" },
];

type View = "login" | "forgot" | "forgot-success";

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
      const msg = error?.response?.data?.error || error?.message || "Credenciais inválidas";
      toast.error(msg.includes("Invalid") ? "E-mail ou senha incorretos." : "Erro ao entrar. Tente novamente.");
      form.setError("password", { message: "" });
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = async (values: z.infer<typeof forgotSchema>) => {
    setForgotLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setForgotLoading(false);
    setView("forgot-success");
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left brand panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[46%] relative flex-col items-start justify-between p-10 xl:p-14 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/7" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/8 blur-[90px]" />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-secondary/7 blur-[75px]" />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(124,252,0,0.05) 1px, transparent 1px)",
            backgroundSize: "38px 38px"
          }} />
        </div>

        <div className="relative z-10">
          <Link href="/">
            <img src={logoMain} alt="extraGO" className="h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary tracking-wider mb-6 w-fit">
            <span className="live-dot" />
            PLATAFORMA ATIVA
          </div>
          <p className="text-4xl xl:text-5xl font-bold leading-[1.1] mb-4">
            Seu próximo<br />job está<br /><span className="neon-text-gradient">aqui.</span>
          </p>
          <p className="text-muted-foreground mb-9 text-base leading-relaxed max-w-sm">
            Entre na plataforma e acesse o maior marketplace de extras na hospitalidade do Brasil.
          </p>
          <div className="space-y-3">
            {BRAND_POINTS.map((pt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  {pt.icon}
                </div>
                <span className="text-foreground/80">{pt.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          © 2026 extraGO · Plataforma Premium de Hospitalidade
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-0 sm:p-8 relative overflow-hidden overflow-y-auto">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,229,255,0.05)_0%,_transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="relative z-10 w-full max-w-[420px]"
        >
          {/* ── Mobile banner (replaces logo) ── */}
          <div className="lg:hidden w-full relative mb-0">
            <img
              src={heroBanner}
              alt="extraGO"
              className="w-full object-cover"
              style={{ maxHeight: 160, objectPosition: "center" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08111a]/20 to-[#08111a]" />
            <div className="absolute bottom-3 left-4">
              <Link href="/">
                <img src={logoMain} alt="extraGO" className="h-6 object-contain cursor-pointer" />
              </Link>
            </div>
          </div>

          <div className="px-5 sm:px-0 pt-6 sm:pt-0">
            <AnimatePresence mode="wait">
              {/* ── LOGIN VIEW ── */}
              {view === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                >
                  <div className="mb-7">
                    <h1 className="text-2xl sm:text-[28px] font-bold mb-1.5">Acesse sua conta</h1>
                    <p className="text-muted-foreground text-sm">Bem-vindo de volta ao cockpit.</p>
                  </div>

                  <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/8">
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
                                  className="bg-white/5 border-white/10 focus:border-primary/60 h-11 rounded-xl transition-all"
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
                                  className="text-xs text-primary/75 hover:text-primary font-medium transition-colors"
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
                                    className="bg-white/5 border-white/10 focus:border-primary/60 h-11 rounded-xl pr-10 transition-all"
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
                          className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none h-12 text-sm font-bold rounded-xl mt-2 transition-all"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <><Loader2 size={16} className="mr-2 animate-spin" />Entrando...</>
                          ) : "Entrar na conta"}
                        </Button>
                      </form>
                    </Form>

                    <div className="mt-5 pt-5 border-t border-white/6 text-center text-sm text-muted-foreground">
                      Não tem uma conta?{" "}
                      <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                        Cadastre-se grátis
                      </Link>
                    </div>
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
                  transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                >
                  <button
                    onClick={() => setView("login")}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
                  >
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    Voltar ao login
                  </button>

                  <div className="mb-7">
                    <div className="w-12 h-12 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center text-primary mb-5">
                      <Mail size={22} />
                    </div>
                    <h1 className="text-2xl font-bold mb-1.5">Recuperar senha</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Informe seu e-mail e enviaremos um link para redefinir sua senha.
                    </p>
                  </div>

                  <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/8">
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
                                  className="bg-white/5 border-white/10 focus:border-primary/60 h-11 rounded-xl"
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
                            <><Loader2 size={16} className="mr-2 animate-spin" />Enviando...</>
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
                  transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                >
                  <div className="glass-card p-8 sm:p-10 rounded-2xl border border-primary/20 text-center">
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
                      Se o e-mail informado estiver cadastrado, você receberá um link para redefinir sua senha em breve.
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
