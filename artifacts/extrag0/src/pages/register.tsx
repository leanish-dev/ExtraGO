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
import { motion } from "framer-motion";

const formSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["company", "freelancer"]),
  companyName: z.string().optional(),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [location, setLocation] = useLocation();
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
      toast.success("Conta criada com sucesso!");
      setLocation("/dashboard");
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[rgba(124,252,0,0.1)] via-background to-background pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <img src={logoMain} alt="extraGO" className="h-10 mx-auto cursor-pointer mb-6" />
          </Link>
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-muted-foreground mt-2">Junte-se à revolução extraGO.</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <div className="flex bg-black/50 p-1 rounded-full mb-6 border border-white/5">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${selectedRole === 'freelancer' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground hover:text-white'}`}
              onClick={() => setSelectedRole("freelancer")}
            >
              Sou Freelancer
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${selectedRole === 'company' ? 'bg-secondary text-black shadow-md' : 'text-muted-foreground hover:text-white'}`}
              onClick={() => setSelectedRole("company")}
            >
              Sou Empresa
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} className="bg-background/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedRole === "company" && (
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Restaurante XYZ" {...field} className="bg-background/50 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} className="bg-background/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} className="bg-background/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className={`w-full h-12 text-lg font-semibold ${selectedRole === 'company' ? 'bg-secondary hover:bg-secondary/90 text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'bg-primary hover:bg-primary/90 text-black neon-glow'}`} 
                disabled={isLoading}
              >
                {isLoading ? "Criando..." : "Criar Conta"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Faça login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}