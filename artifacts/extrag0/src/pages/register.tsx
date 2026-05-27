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
import heroBanner from "@assets/file_0000000034c4720eab761e343da632dc_1779868067089.png";
import logoMain from "@assets/1779451173221_1779452671733.png";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Users, CheckCircle, Loader2, Eye, EyeOff, Sparkles } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["company", "freelancer"]),
  companyName: z.string().optional(),
});

const ROLE_OPTIONS = [
  {
    value: "freelancer" as const,
    icon: <Users size={26} />,
    title: "Sou Freelancer",
    desc: "Busco vagas como garçom, barman, hostess e mais",
    color: "primary",
    borderClass: "border-primary/55 bg-primary/8",
    iconClass: "bg-primary/15 border-primary/30 text-primary",
    glowClass: "shadow-[0_0_24px_rgba(124,252,0,0.14)]",
  },
  {
    value: "company" as const,
    icon: <Briefcase size={26} />,
    title: "Sou Empresa",
    desc: "Preciso contratar profissionais para eventos",
    color: "secondary",
    borderClass: "border-secondary/55 bg-secondary/8",
    iconClass: "bg-secondary/15 border-secondary/30 text-secondary",
    glowClass: "shadow-[0_0_24px_rgba(0,229,255,0.14)]",
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
    },
  });

  useEffect(() => {
    form.setValue("role", selectedRole);
  }, [selectedRole, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await registerUser({ data: values });
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
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left brand panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[44%] relative flex-col items-start justify-between p-10 xl:p-14 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/9 via-transparent to-secondary/9" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-primary/8 blur-[85px]" />
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 rounded-full bg-secondary/8 blur-[75px]" />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(0,229,255,0.045) 1px, transparent 1px)",
            backgroundSize: "38px 38px"
          }} />
        </div>

        <div className="relative z-10">
          <Link href="/">
            <img src={logoMain} alt="extraGO" className="h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-bold text-secondary tracking-wider mb-6 w-fit">
            <Sparkles size={9} /> MARKETPLACE #1 DO BRASIL
          </div>
          <p className="text-4xl xl:text-5xl font-bold leading-[1.1] mb-4">
            Faça parte da<br /><span className="neon-text-gradient">revolução</span><br />da hospitalidade.
          </p>
          <p className="text-muted-foreground mb-9 text-base leading-relaxed max-w-sm">
            Crie sua conta em 2 minutos e acesse o maior marketplace de extras do Brasil.
          </p>
          <div className="space-y-3">
            {PERKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={11} className="text-primary" />
                </div>
                <span className="text-foreground/80">{item}</span>
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
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(124,252,0,0.05)_0%,_transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="relative z-10 w-full max-w-[440px]"
        >
          {/* ── Mobile banner (replaces logo) ── */}
          <div className="lg:hidden w-full relative mb-0">
            <img
              src={heroBanner}
              alt="extraGO"
              className="w-full object-cover"
              style={{ maxHeight: 150, objectPosition: "center" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08111a]/25 to-[#08111a]" />
            <div className="absolute bottom-3 left-4">
              <Link href="/">
                <img src={logoMain} alt="extraGO" className="h-6 object-contain cursor-pointer" />
              </Link>
            </div>
          </div>

          <div className="px-5 sm:px-0 pt-6 sm:pt-0 pb-10">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-[28px] font-bold mb-1.5">Crie sua conta</h1>
              <p className="text-muted-foreground text-sm">Junte-se à revolução extraGO — é grátis.</p>
            </div>

            {/* ── Role selector ── */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {ROLE_OPTIONS.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedRole(option.value)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-220 ${
                    selectedRole === option.value
                      ? `${option.borderClass} ${option.glowClass}`
                      : "border-white/8 bg-white/3 hover:border-white/14 hover:bg-white/5"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 transition-all ${
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
                        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <CheckCircle size={11} className="text-black" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>

            {/* ── Form ── */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/8">
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
                            className="bg-white/5 border-white/10 focus:border-primary/60 h-11 rounded-xl"
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
                        transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
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
                                  className="bg-white/5 border-white/10 focus:border-secondary/60 h-11 rounded-xl"
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
                            className="bg-white/5 border-white/10 focus:border-primary/60 h-11 rounded-xl"
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
                              className="bg-white/5 border-white/10 focus:border-primary/60 h-11 rounded-xl pr-10"
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
                    className={`w-full h-12 text-sm font-bold rounded-xl mt-1 border-none transition-all ${
                      isCompany
                        ? "bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan"
                        : "bg-primary text-black hover:bg-primary/90 neon-glow"
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 size={16} className="mr-2 animate-spin" />Criando conta...</>
                    ) : "Criar Conta Grátis"}
                  </Button>
                </form>
              </Form>

              <div className="mt-5 pt-4 border-t border-white/6 text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Faça login
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
              Ao criar uma conta, você concorda com nossos{" "}
              <span className="text-foreground/50 hover:text-foreground cursor-pointer transition-colors">Termos de Uso</span>{" "}
              e{" "}
              <span className="text-foreground/50 hover:text-foreground cursor-pointer transition-colors">Política de Privacidade</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
