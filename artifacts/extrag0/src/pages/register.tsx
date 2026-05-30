import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import authBanner from "@assets/file_00000000c3cc720e818941f8ad5cf15f_1779883604660.png";
import logoMain from "@assets/1779451173221_1779452671733.png";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Users, CheckCircle, Loader2, Eye, EyeOff, Sparkles, ArrowRight, Gift } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["company", "freelancer"]),
  companyName: z.string().optional(),
  referralCode: z.string().optional(),
});

const ROLE_OPTIONS = [
  {
    value: "freelancer" as const,
    icon: <Users size={22} />,
    title: "Sou Freelancer",
    desc: "Garçom, barman, hostess e mais",
    borderClass: "border-primary/55 bg-primary/8",
    iconClass: "bg-primary/15 border-primary/30 text-primary",
    glowClass: "shadow-[0_0_28px_rgba(124,252,0,0.12)]",
    checkColor: "bg-primary",
  },
  {
    value: "company" as const,
    icon: <Briefcase size={22} />,
    title: "Sou Empresa",
    desc: "Contrato para eventos e hospitality",
    borderClass: "border-secondary/55 bg-secondary/8",
    iconClass: "bg-secondary/15 border-secondary/30 text-secondary",
    glowClass: "shadow-[0_0_28px_rgba(0,229,255,0.12)]",
    checkColor: "bg-secondary",
  },
];

const PERKS = [
  "Cadastro 100% gratuito",
  "Comece a ganhar imediatamente",
  "Pagamento via PIX em até 24h",
  "Suporte 7 dias por semana",
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const roleParam = searchParams.get("role");

  const refParam = searchParams.get("ref") ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"company" | "freelancer">(
    (roleParam === "company" || roleParam === "freelancer") ? roleParam : "freelancer"
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: selectedRole,
      companyName: "",
      referralCode: refParam,
    },
  });

  useEffect(() => {
    form.setValue("role", selectedRole);
  }, [selectedRole, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const payload: any = { ...values };
      if (payload.referralCode === "") delete payload.referralCode;
      await registerUser({ data: payload });
      toast.success("Conta criada! Bem-vindo à extraGO.");
      setLocation("/dashboard");
    } catch (error: any) {
      const msg = error?.response?.data?.error || "";
      if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("exists")) {
        toast.error("Este e-mail já está cadastrado.");
        form.setError("email", { message: "E-mail já utilizado" });
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isCompany = selectedRole === "company";

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#050b10]">

      {/* ── Left: Panoramic Banner Panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] relative overflow-hidden flex-shrink-0">
        <img
          src={authBanner}
          alt="extraGO — Faça parte da revolução"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(105deg, rgba(5,11,16,0.7) 0%, rgba(5,11,16,0.3) 50%, rgba(5,11,16,0.15) 100%)"
        }} />
        <div className="absolute inset-x-0 bottom-0 h-32" style={{
          background: "linear-gradient(to bottom, transparent, rgba(5,11,16,0.85))"
        }} />
        <div className="absolute inset-y-0 right-0 w-20" style={{
          background: "linear-gradient(to right, transparent, rgba(5,11,16,0.92))"
        }} />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <Link href="/">
            <img src={logoMain} alt="extraGO" className="h-8 object-contain cursor-pointer hover:opacity-90 transition-opacity drop-shadow-lg" />
          </Link>

          <div className="mt-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-primary/25 text-xs font-bold text-primary mb-5">
              <Sparkles size={10} />
              MARKETPLACE #1 DE HOSPITALIDADE
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
              Faça parte da<br /><span className="text-primary">revolução</span><br />da hospitalidade.
            </h2>
            <div className="space-y-2.5 mb-6">
              {PERKS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-2.5 text-sm text-white/85"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/25 border border-primary/40 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={11} className="text-primary" />
                  </div>
                  {item}
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-white/30">© 2026 extraGO · Plataforma Premium de Hospitalidade</p>
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden overflow-y-auto py-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/5 blur-[90px]" />
          <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full bg-secondary/4 blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="relative z-10 w-full max-w-[520px]"
        >
          {/* Mobile banner */}
          <div className="lg:hidden w-full relative mb-0">
            <img
              src={authBanner}
              alt="extraGO"
              className="w-full object-cover object-center"
              style={{ height: 180 }}
            />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to bottom, rgba(5,11,16,0.1) 0%, rgba(5,11,16,0.55) 65%, rgba(5,11,16,1) 100%)"
            }} />
            <div className="absolute bottom-4 left-5">
              <Link href="/">
                <img src={logoMain} alt="extraGO" className="h-6 object-contain cursor-pointer drop-shadow-lg" />
              </Link>
            </div>
          </div>

          <div className="px-5 sm:px-8 pt-7 lg:pt-0 pb-10">
            <div className="mb-6">
              <h1 className="text-[26px] sm:text-3xl font-bold mb-1.5 leading-tight">Crie sua conta</h1>
              <p className="text-muted-foreground text-sm">Junte-se à revolução extraGO — é grátis.</p>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {ROLE_OPTIONS.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedRole(option.value)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    selectedRole === option.value
                      ? `${option.borderClass} ${option.glowClass}`
                      : "border-white/8 bg-white/3 hover:border-white/14 hover:bg-white/5"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-2.5 transition-all ${
                    selectedRole === option.value ? option.iconClass : "bg-white/5 border-white/10 text-muted-foreground"
                  }`}>
                    {option.icon}
                  </div>
                  <p className="font-bold text-sm mb-0.5">{option.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{option.desc}</p>
                  <AnimatePresence>
                    {selectedRole === option.value && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className={`absolute top-3 right-3 w-5 h-5 rounded-full ${option.checkColor} flex items-center justify-center`}
                      >
                        <CheckCircle size={11} className="text-black" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>

            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/8 shadow-xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-foreground/90">Nome Completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu nome completo"
                            autoComplete="name"
                            {...field}
                            className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <AnimatePresence>
                    {isCompany && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
                        className="overflow-hidden"
                      >
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-foreground/90">Nome da Empresa</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Restaurante / Bar / Evento"
                                  {...field}
                                  className="bg-white/5 border-white/10 focus:border-secondary/50 h-11 rounded-xl"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                            className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl"
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
                        <FormLabel className="text-sm font-semibold text-foreground/90">Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Mínimo 6 caracteres"
                              autoComplete="new-password"
                              {...field}
                              className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl pr-10"
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

                  {/* Referral code field - shown if ref in URL or filled in */}
                  <AnimatePresence>
                    {(refParam || form.watch("referralCode")) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <FormField
                          control={form.control}
                          name="referralCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
                                <Gift size={13} className="text-primary" /> Código de Indicação
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: 7F3D2A"
                                  {...field}
                                  className="bg-primary/5 border-primary/20 focus:border-primary/50 h-11 rounded-xl font-mono tracking-widest uppercase"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    className={`w-full h-12 text-sm font-bold rounded-xl mt-1 border-none transition-all gap-2 ${
                      isCompany
                        ? "bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan"
                        : "bg-primary text-black hover:bg-primary/90 neon-glow"
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 size={16} className="animate-spin" />Criando conta...</>
                    ) : (
                      <>Criar Conta Grátis <ArrowRight size={16} /></>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-5 pt-4 border-t border-white/6 text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
                  Faça login
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
              Ao criar uma conta, você concorda com nossos{" "}
              <span className="text-foreground/45 hover:text-foreground cursor-pointer transition-colors">Termos de Uso</span>{" "}
              e{" "}
              <span className="text-foreground/45 hover:text-foreground cursor-pointer transition-colors">Política de Privacidade</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
