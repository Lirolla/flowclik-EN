import { useState } from "react";
import { Link } from "wouter";
import { Camera, ArrowLeft, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

export default function EachstroSaaS() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    subdomain: "",
  });
  const [subdomainCheck, setSubdomainCheck] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [error, setError] = useState("");

  const createTenantMutation = trpc.saasSystem.createTenant.useMutation();
  const utils = trpc.useUtils();

  const checkSubdomain = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainCheck("idle");
      return;
    }

    setSubdomainCheck("checking");
    
    try {
      const reserved = ["www", "api", "admin", "app", "mail", "blog", "lirolla", "flowclick"];
      if (reserved.includes(subdomain.toLowerCase())) {
        setSubdomainCheck("taken");
        return;
      }

      const result = await utils.client.saasSystem.checkSubdomain.query({ subdomain });
      setSubdomainCheck(result.available ? "available" : "taken");
    } catch (err) {
      console.error('Erro ao verify subdomain:', err);
      setSubdomainCheck("idle");
    }
  };

  const handleSubdomainChange = (value: string) => {
    // Only lowercase letters, numbers and hyphens
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData({ ...formData, subdomain: clean });
    checkSubdomain(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações
    if (!formData.name || !formData.email || !formData.password || !formData.subdomain) {
      setError("Preencha everys os campos");
      return;
    }

    if (formData.password.length < 6) {
      setError("Senha must ter pelo menos 6 characters");
      return;
    }

    if (subdomainCheck !== "available") {
      setError("Escolha um subdomain available");
      return;
    }

    try {
      const result = await createTenantMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        subdomain: formData.subdomain,
        password: formData.password,
      });

      // Sucesso! Redirecionar para o new site
      window.location.href = result.url + '/admin';
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <a className="inline-flex items-center gap-2 mb-6 text-zinc-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </a>
          </Link>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="w-10 h-10 text-purple-500" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              FlowClik
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Crie your conta</h1>
          <p className="text-zinc-400">
            7 free days · Canche when quiser
          </p>
        </div>

        {/* Form */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome complete</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Senha */}
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Subdomain */}
            <div>
              <Label htmlFor="subdomain">Choose your subdomain</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  id="subdomain"
                  type="text"
                  placeholder="joao"
                  value={formData.subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  className="flex-1"
                />
                <span className="text-zinc-500 text-sm whitespace-nowrap">.flowclik.com</span>
                
                {subdomainCheck === "checking" && (
                  <Loader2 className="w-5 h-5 text-zinc-500 animate-spin flex-shrink-0" />
                )}
                {subdomainCheck === "available" && (
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                {subdomainCheck === "taken" && (
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </div>
              {subdomainCheck === "available" && (
                <p className="text-xs text-green-500 mt-1">
                  ✓ {formData.subdomain}.flowclik.com is available!
                </p>
              )}
              {subdomainCheck === "taken" && (
                <p className="text-xs text-red-500 mt-1">
                  ✗ Este subdomain already is em uso
                </p>
              )}
              <p className="text-xs text-zinc-500 mt-1">
                Only letras, numbers and hyphen
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={createTenantMutation.isPending || subdomainCheck !== "available"}
            >
              {createTenantMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta Free"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Already tem uma conta?{" "}
            <Link href="/login">
              <a className="text-purple-400 hover:text-purple-300">Sign in</a>
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 space-y-3">
          {[
            "Site profissional ready em minutes",
            "7 days free to test tudo",
            "Canche when quiser, sem burocracia",
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
              <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
