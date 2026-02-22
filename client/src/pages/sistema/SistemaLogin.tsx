import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, Lock, Mail } from "lucide-react";

// Credenciais do Admin Master (hardcoded para segurança máxima)
const ADMIN_MASTER_EMAIL = "contato@flowclik.com";
const ADMIN_MASTER_PASSWORD = "Pagotto24";
const SISTEMA_TOKEN_KEY = "flowclik_sistema_token";

export function checkSistemaAuth(): boolean {
  const token = localStorage.getItem(SISTEMA_TOKEN_KEY);
  return token === "admin_master_authenticated";
}

export function sistemaLogout() {
  localStorage.removeItem(SISTEMA_TOKEN_KEY);
  window.location.href = "/sistema/login";
}

export default function SistemaLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular delay para parecer autenticação real
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email === ADMIN_MASTER_EMAIL && password === ADMIN_MASTER_PASSWORD) {
      localStorage.setItem(SISTEMA_TOKEN_KEY, "admin_master_authenticated");
      toast.success("Login realizado com sucesso!");
      // Usar window.location para forçar reload e atualizar o cliente tRPC
      window.location.href = "/sistema";
    } else {
      toast.error("Credenciais inválidas");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/80 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-purple-600/20 rounded-full">
              <Camera className="w-12 h-12 text-purple-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            FlowClik Sistema
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Acesso restrito ao administrador master
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@flowclik.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="mt-6 pt-4 border-t border-gray-800">
            <p className="text-xs text-center text-gray-500">
              Este painel é exclusivo para administradores do FlowClik SaaS.
              <br />
              Acesso não autorizado é proibido.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
