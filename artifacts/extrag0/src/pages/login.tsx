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
import logoMain from "@assets/1779451173221_1779452671733.png";
import { motion } from "framer-motion";
import { Zap, Shield, Users, CheckCircle, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const BRAND_POINTS = [
  { icon: <Zap size={16} />, text: "Match instantâneo com vagas" },
  { icon: <Shield size={16} />, text: "Pagamento 100% garantido" },
  { icon: <Users size={16} />, text: "+12.000 profissionais ativos" },
  { icon: <CheckCircle size={16} />, text: "Perfis verificados" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await login({ data: values });
      toast.success("Bem-vindo de volta!");
      setLocation("/dashboard");
    } catch (error) {
      toast.error("Credenciais inválidas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] relative flex-col items-start justify-between p-10 xl:p-14 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-secondary/8" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/08 blur-[70px]" />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(124,252,0,0.06) 1px, transparent 1px)",
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
            Seu próximo<br />job está<br /><span className="neon-text-gradient">aqui.</span>
          </p>
          <p className="text-muted-foreground mb-8 text-base leading-relaxed max-w-sm">
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

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,229,255,0.06)_0%,_transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="relative z-10 w-full max-w-[400px]"
        >
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <img src={logoMain} alt="extraGO" className="h-9 mx-auto cursor-pointer mb-5" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Acesse sua conta</h1>
            <p className="text-muted-foreground text-sm">Bem-vindo de volta ao cockpit.</p>
          </div>

          <div className="glass-card p-7 sm:p-8 rounded-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">E-mail</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="seu@email.com"
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
                      <FormLabel className="text-sm font-medium">Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
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
                  className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none h-12 text-sm font-bold rounded-xl mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : "Entrar"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Cadastre-se grátis
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
