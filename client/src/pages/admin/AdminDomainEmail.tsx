import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, Mail, CheckCircle2, AlertCircle, ExternalLink, Send, Trash2, RefreshCw, Loader2, Copy, Info, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminSunainEmail() {
  // Estados para Subscription
  const [customSunain, setCustomSunain] = useState("");
  const [adding, setAdding] = useState(false);
  const [verifying, setVerifying] = useState<number | null>(null);

  // Estados para Email
  const [emailSender, setEmailSender] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");
  const [emailConfigured, setEmailConfigured] = useState(false);

  // Buscar domains do tenant
  const { data: domains, refetch: refetchSunains } = trpc.customSunains.list.useWhatry();

  // Buscar configuration de email
  const { data: emailConfig, refetch: refetchEmailConfig } = trpc.email.getConfig.useWhatry();

  // Mutations de domain
  const addSunainMutation = trpc.customSunains.add.useMutation();
  const verifySunainMutation = trpc.customSunains.verify.useMutation();
  const removeSunainMutation = trpc.customSunains.remove.useMutation();

  // Mutations de email
  const saveEmailMutation = trpc.email.saveConfig.useMutation();
  const testEmailMutation = trpc.email.sendTestEmail.useMutation();

  // Preencher campos de email when dados carregarem
  useEffect(() => {
    if (emailConfig) {
      if (emailConfig.emailSender) setEmailSender(emailConfig.emailSender);
      if (emailConfig.resendApiKey) setResendApiKey(emailConfig.resendApiKey);
      if (emailConfig.emailSender) setEmailConfigured(true);
    }
  }, [emailConfig]);

  // Copiar texto para clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  // Handler: Add Subscription (API real)
  const handleAddSunain = async () => {
    if (!customSunain) {
      toast.error("Digite um domain valid");
      return;
    }
    // Limpar domain
    let domain = customSunain.toLowerCase().trim();
    // Remover http:// ou https:// se o user colocou
    domain = domain.replace(/^https?:\/\//, "");
    // Remover / no final
    domain = domain.replace(/\/+$/, "");
    // Remover www. do start
    domain = domain.replace(/^www\./, "");

    // Basic validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast.error("Formato de domain invalid. Examples valids: meufotografo.com.br, photographysilva.com");
      return;
    }
    setAdding(true);
    try {
      await addSunainMutation.mutateAsync({ domain });
      toast.success("Domain added! Now follow the instructions below to configure DNS.");
      setCustomSunain("");
      refetchSunains();
    } catch (error: any) {
      toast.error(error.message || "Erro ao add domain");
    } finally {
      setAdding(false);
    }
  };

  // Handler: Verify DNS (API real)
  const handleVerifyDNS = async (domainId: number) => {
    setVerifying(domainId);
    try {
      await verifySunainMutation.mutateAsync({ domainId });
      toast.success("Subscription verified e ativado com sucesso! Your site already is accessible pelo new domain.");
      refetchSunains();
    } catch (error: any) {
      toast.error(error.message || "DNS is still not configured correctly. Check the instructions and try again in a few minutes.");
    } finally {
      setVerifying(null);
    }
  };

  // Handler: Remover Subscription
  const handleRemoveSunain = async (domainId: number) => {
    if (!confirm("Are you sure you want to remove this domain? Your site will only work via the FlowClik subdomain.")) return;
    try {
      await removeSunainMutation.mutateAsync({ domainId });
      toast.success("Subscription removido com sucesso");
      refetchSunains();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover domain");
    }
  };

  // Handler: Salvar Configuration de Email
  const handleSaveEmail = async () => {
    if (!emailSender || !resendApiKey) {
      toast.error("Preencha everys os campos");
      return;
    }
    try {
      await saveEmailMutation.mutateAsync({
        emailSender,
        resendApiKey,
      });
      setEmailConfigured(true);
      toast.success("Configuration de email salva!");
      refetchEmailConfig();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configuration");
    }
  };

  // Handler: Testar Email
  const handleTestEmail = async () => {
    try {
      await testEmailMutation.mutateAsync();
      toast.success("Email de teste sent! Verifique your caixa de entrada.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar email de teste");
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Subscription Custom</h1>
          <p className="text-muted-foreground mt-2">
            Use your own domain para deixar your site mais profissional
          </p>
        </div>

        {/* SEÇÃO 1: DOMÍNIO PERSONALIZADO */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-red-600" />
              <CardTitle>Subscription Custom</CardTitle>
            </div>
            <CardDescription>
              Ao inviss de usar <strong>yoursite.flowclik.com</strong>, use your own domain as <strong>yourfotografo.com.br</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Explicação initial */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-blue-300">Como works?</p>
                  <p className="text-muted-foreground">
                    You can usar um domain que already comprou (ex: no Record.br, GoDaddy, Hostinger, Namecheap) 
                    para apontar diretamente para o your site FlowClik. Assim, when alguism acessar 
                    <strong> yourfotografo.com.br</strong>, vai ver o your site de photography.
                  </p>
                  <p className="text-muted-foreground">
                    Se you still not tem um domain, can comprar um no <a href="https://record.br" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Record.br</a> (domains .com.br) 
                    ou no <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Namecheap</a> (domains .com).
                    O custo misdio is de £ 40/year.
                  </p>
                </div>
              </div>
            </div>

            {/* Input de Subscription */}
            <div className="space-y-2">
              <Label htmlFor="domain">Your Subscription</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  placeholder="yourfotografo.com.br"
                  value={customSunain}
                  onChange={(e) => setCustomSunain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSunain()}
                />
                <Button
                  variant="destructive"
                  onClick={handleAddSunain}
                  disabled={!customSunain || adding}
                  className="shrink-0"
                >
                  {adding ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adicionando...</>
                  ) : (
                    "Add Subscription"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Digite only o domain, sem "http://" ou "www". Example: <strong>meufotografo.com.br</strong>
              </p>
            </div>

            {/* Lista de Subscriptions Cadastrados */}
            {domains && domains.length > 0 ? (
              <div className="space-y-4">
                {domains.map((d: any) => (
                  <div key={d.id} className="border rounded-lg overflow-hidden">
                    {/* Header do domain */}
                    <div className="flex items-center justify-between p-4 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="font-semibold text-lg">{d.domain}</span>
                        {d.status === "active" ? (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSunain(d.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Instructions DNS - when pending */}
                    {d.status !== "active" && (
                      <div className="p-4 space-y-5">
                        
                        {/* Alerta de attention */}
                        <Alert className="border-yellow-500/50 bg-yellow-500/5">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <AlertDescription className="text-yellow-200">
                            Your domain foi adicionado, mas still needs ser configurado. Siga o passo a passo below.
                          </AlertDescription>
                        </Alert>

                        {/* PASSO 1 */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-base flex items-center gap-2">
                            <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">1</span>
                            Acesse o painel do your provepain de domain
                          </h4>
                          <p className="text-sm text-muted-foreground ml-8">
                            Between no site where you comprou your domain. Examples comuns:
                          </p>
                          <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <a href="https://record.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                              <ExternalLink className="w-3 h-3" /> Record.br (domains .com.br)
                            </a>
                            <a href="https://hpanel.hostinger.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                              <ExternalLink className="w-3 h-3" /> Hostinger
                            </a>
                            <a href="https://www.godaddy.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                              <ExternalLink className="w-3 h-3" /> GoDaddy
                            </a>
                            <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                              <ExternalLink className="w-3 h-3" /> Namecheap
                            </a>
                          </div>
                        </div>

                        {/* PASSO 2 */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-base flex items-center gap-2">
                            <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">2</span>
                            Go to "DNS" or "DNS Zone" or "Manage DNS"
                          </h4>
                          <p className="text-sm text-muted-foreground ml-8">
                            Procure a section de configuration DNS do your domain. Each provepain chama de um jeito diferente:
                          </p>
                          <div className="ml-8 text-sm text-muted-foreground space-y-1">
                            <p><strong>Record.br:</strong> Clique no domain → "DNS" → "Editar zona"</p>
                            <p><strong>Hostinger:</strong> Subscriptions → Manage → Zona DNS</p>
                            <p><strong>GoDaddy:</strong> Meus Produtos → DNS → Manage Zonas</p>
                            <p><strong>Namecheap:</strong> Sunain List → Manage → Advanced DNS</p>
                          </div>
                        </div>

                        {/* PASSO 3 */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-base flex items-center gap-2">
                            <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">3</span>
                            Adicione (ou edite) o record DNS tipo "A"
                          </h4>
                          <p className="text-sm text-muted-foreground ml-8">
                            Se already existir um record tipo "A" com nome "@", <strong>edite he</strong>. Se not existir, <strong>crie um new</strong> com estes dados:
                          </p>
                          
                          <div className="ml-8 bg-background border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left p-3 font-semibold">Campo</th>
                                  <th className="text-left p-3 font-semibold">O que colocar</th>
                                  <th className="p-3"></th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t">
                                  <td className="p-3 text-muted-foreground">Tipo</td>
                                  <td className="p-3 font-mono font-bold">A</td>
                                  <td className="p-3">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("A")} className="h-7 px-2">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </td>
                                </tr>
                                <tr className="border-t">
                                  <td className="p-3 text-muted-foreground">Nome / Host</td>
                                  <td className="p-3 font-mono font-bold">@</td>
                                  <td className="p-3">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("@")} className="h-7 px-2">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </td>
                                </tr>
                                <tr className="border-t">
                                  <td className="p-3 text-muted-foreground">Valor / Aponta para</td>
                                  <td className="p-3 font-mono font-bold text-red-400">72.61.129.119</td>
                                  <td className="p-3">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("72.61.129.119")} className="h-7 px-2">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </td>
                                </tr>
                                <tr className="border-t">
                                  <td className="p-3 text-muted-foreground">TTL</td>
                                  <td className="p-3 font-mono font-bold">3600 <span className="text-muted-foreground font-normal">(ou "Automatic")</span></td>
                                  <td className="p-3">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("3600")} className="h-7 px-2">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* PASSO 4 - Optional WWW */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-base flex items-center gap-2">
                            <span className="bg-gray-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">4</span>
                            <span className="text-muted-foreground">(Optional)</span> Adicione o "www"
                          </h4>
                          <p className="text-sm text-muted-foreground ml-8">
                            Se quiser que <strong>www.{d.domain}</strong> also funcione, adicione mais um record:
                          </p>
                          
                          <div className="ml-8 bg-background border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left p-3 font-semibold">Campo</th>
                                  <th className="text-left p-3 font-semibold">O que colocar</th>
                                  <th className="p-3"></th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t">
                                  <td className="p-3 text-muted-foreground">Tipo</td>
                                  <td className="p-3 font-mono font-bold">CNAME</td>
                                  <td className="p-3">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("CNAME")} className="h-7 px-2">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </td>
                                </tr>
                                <tr className="border-t">
                                  <td className="p-3 text-muted-foreground">Nome / Host</td>
                                  <td className="p-3 font-mono font-bold">www</td>
                                  <td className="p-3">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("www")} className="h-7 px-2">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </td>
                                </tr>
                                <tr className="border-t">
                                  <td className="p-3 text-muted-foreground">Valor / Aponta para</td>
                                  <td className="p-3 font-mono font-bold text-red-400">{d.domain}</td>
                                  <td className="p-3">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(d.domain)} className="h-7 px-2">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </td>
                                </tr>
                                <tr className="border-t">
                                  <td className="p-3 text-muted-foreground">TTL</td>
                                  <td className="p-3 font-mono font-bold">3600 <span className="text-muted-foreground font-normal">(ou "Automatic")</span></td>
                                  <td className="p-3">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("3600")} className="h-7 px-2">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* PASSO 5 */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-base flex items-center gap-2">
                            <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">5</span>
                            Salve e clique em "Verify DNS e Ativar"
                          </h4>
                          <p className="text-sm text-muted-foreground ml-8">
                            After de salvar as settings no your provepain, volte here e clique no button below. 
                            DNS propagation usually takes <strong>5 minutes to 2 hours</strong>. 
                            Se not worksr de first, espere um little e tente again.
                          </p>
                        </div>

                        {/* Dica about HTTPS */}
                        <div className="ml-8 bg-muted/30 border rounded-lg p-3 space-y-1">
                          <p className="text-sm font-semibold flex items-center gap-1">
                            <Info className="w-4 h-4 text-blue-400" /> Dica about HTTPS (cadeado de security)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Para ter HTTPS no your custom domain, recomendamos usar o <a href="https://www.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Cloudflare</a> (gratuito). 
                            Basta criar uma conta, add your domain there e apontar os nameservers. O Cloudflare cuida do SSL certificate automaticamente.
                            Without Cloudflare, your site will only work via HTTP (no padlock).
                          </p>
                        </div>

                        {/* Button de verify */}
                        <Button
                          onClick={() => handleVerifyDNS(d.id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                          size="lg"
                          disabled={verifying === d.id}
                        >
                          {verifying === d.id ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando DNS...</>
                          ) : (
                            <><RefreshCw className="w-4 h-4 mr-2" /> Verify DNS e Ativar</>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Subscription active */}
                    {d.status === "active" && (
                      <div className="p-4">
                        <Alert className="border-green-500/50 bg-green-500/5">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-200">
                            Subscription verified e active! Your site is accessible em{" "}
                            <a href={`http://${d.domain}`} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                              {d.domain} <ExternalLink className="w-3 h-3 inline" />
                            </a>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">None custom domain configurado</p>
                <p className="text-sm mt-1">Adicione your domain above para deixar your site mais profissional</p>
                <p className="text-xs mt-3 opacity-70">
                  Your site current: <strong>yoursite.flowclik.com</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
