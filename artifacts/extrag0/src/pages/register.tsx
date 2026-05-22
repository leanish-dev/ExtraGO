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
import logoMain from "@assets/1779451173221_1779452671733.png";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Users, CheckCircle, Loader2 } from "lucide-react";

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
    icon: <Users size={28} />,
    title: "Sou Freelancer",
    desc: "Busco vagas como garçom, barman, hostess e mais",
    color: "primary",
    borderClass: "border-primary/50 bg-primary/8",
    iconClass: "bg-primary/15 border-primary/30 text-primary",
    glowClass: "shadow-[0_0_20px_rgba(124,252,0,0.15)]",
  },
  {
    value: "company" as const,
    icon: <Briefcase size={28} />,
    title: "Sou Empresa",
    desc: "Preciso contratar profissionais para eventos",
    color: "secondary",
    borderClass: "border-secondary/50 bg-secondary/8",
    iconClass: "bg-secondary/15 border-secondary/30 text-secondary",
    glowClass: "shadow-[0_0_20px_rgba(0,229,255,0.15)]",
  },
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const roleParam = searchParams.get("role");

  const [isLoading, setIsLoading] = useState(false);
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
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] relative flex-col items-start justify-between p-10 xl:p-14 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-primary/10 blur-[80px]" />
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 rounded-full bg-secondary/10 blur-[70px]" />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(0,229,255,0.05) 1px, transparent 1px)",
            backgroundSize: "36px 36px"
          }} />
        </div>

        <div className="relative z-10">
          <Link href="/">
            <img src={logoMain} alt="extraGO" className="h-8 object-contain cursor-pointer" />
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <p className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Faça parte da<br /><span className="neon-text-gradient">revolução</span> da<br />hospitalidade.
          </p>
          <p className="text-muted-foreground mb-8 text-base leading-relaxed max-w-sm">
            Crie sua conta em 2 minutos e acesse o maior marketplace de extras do Brasil.
          </p>
          <div className="space-y-3">
            {[
              "Cadastro 100% gratuito",
              "Comece a ganhar imediatamente",
              "Pagamento via PIX em até 24h",
              "Suporte dedicado 7 dias por semana",
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-3 text-sm"
              >
                <CheckCircle size={15} className="text-primary flex-shrink-0" />
                <span className="text-foreground/80">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          © 2026 extraGO · Plataforma Premium de Hospitalidade
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8 relative overflow-hidden overflow-y-auto">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(124,252,0,0.06)_0%,_transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="relative z-10 w-full max-w-[420px] py-8"
        >
          <div className="lg:hidden text-center mb-6">
            <Link href="/">
              <img src={logoMain} alt="extraGO" className="h-9 mx-auto cursor-pointer mb-4" />
            </Link>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Crie sua conta</h1>
            <p className="text-muted-foreground text-sm">Junte-se à revolução extraGO.</p>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedRole(option.value)}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  selectedRole === option.value
                    ? `${option.borderClass} ${option.glowClass}`
                    : "border-white/8 bg-white/3 hover:border-white/15"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${
                  selectedRole === option.value ? option.iconClass : "bg-white/5 border-white/10 text-muted-foreground"
                }`}>
                  {option.icon}
                </div>
                <p className="font-bold text-sm mb-1">{option.title}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{option.desc}</p>
                {selectedRole === option.value && (
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle size={10} className="text-black" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="glass-card p-6 sm:p-7 rounded-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} className="bg-white/5 border-white/10 focus:border-primary/60 h-11 rounded-xl" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <AnimatePresence>
                  {selectedRole === "company" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Nome da Empresa</FormLabel>
                            <FormControl>
                              <Input placeholder="Restaurante XYZ" {...field} className="bg-white/5 border-white/10 focus:border-secondary/60 h-11 rounded-xl" />
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
                      <FormLabel className="text-sm font-medium">E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} className="bg-white/5 border-white/10 focus:border-primary/60 h-11 rounded-xl" />
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
                      <FormLabel className="text-sm font-medium">Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mín. 6 caracteres" {...field} className="bg-white/5 border-white/10 focus:border-primary/60 h-11 rounded-xl" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className={`w-full h-12 text-sm font-bold rounded-xl mt-1 border-none ${
                    selectedRole === "company"
                      ? "bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan"
                      : "bg-primary text-black hover:bg-primary/90 neon-glow"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : "Criar Conta Grátis"}
                </Button>
              </form>
            </Form>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Faça login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
