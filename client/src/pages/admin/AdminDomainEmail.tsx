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
  // Estados para Sunínio
  const [customSunain, setCustomSunain] = useState("");
  const [adding, setAdding] = useState(false);
  const [verifying, setVerifying] = useState<number | null>(null);

  // Estados para Email
  const [emailSender, setEmailSender] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");
  const [emailConfigured, setEmailConfigured] = useState(false);

  // Buscar domains do tenant
  const { data: domains, refetch: refetchSunains } = trpc.customSunains.list.useQuery();

  // Buscar configuração de email
  const { data: emailConfig, refetch: refetchEmailConfig } = trpc.email.getConfig.useQuery();

  // Mutations de domain
  const addSunainMutation = trpc.customSunains.add.useMutation();
  const verifySunainMutation = trpc.customSunains.verify.useMutation();
  const removeSunainMutation = trpc.customSunains.remove.useMutation();

  // Mutations de email
  const saveEmailMutation = trpc.email.saveConfig.useMutation();
  const testEmailMutation = trpc.email.sendTestEmail.useMutation();

  // Preencher campos de email quando dados carregarem
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

  // Handler: Adicionar Sunínio (API real)
  const handleAddSunain = async () => {
    if (!customSunain) {
      toast.error("Digite um domain valid");
      return;
    }
    // Limpar domain
    let domain = customSunain.toLowerCase().trim();
    // Remover http:// ou https:// se o usuário colocou
    domain = domain.replace(/^https?:\/\//, "");
    // Remover / no final
    domain = domain.replace(/\/+$/, "");
    // Remover www. do início
    domain = domain.replace(/^www\./, "");

    // Validação básica
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast.error("Formato de domain invalid. Exemplos valids: meufotografo.com.br, fotografiasilva.com");
      return;
    }
    setAdding(true);
    try {
      await addSunainMutation.mutateAsync({ domain });
      toast.success("Sunínio adicionado! Agora siga as instruções abaixo para configurar o DNS.");
      setCustomSunain("");
      refetchSunains();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar domain");
    } finally {
      setAdding(false);
    }
  };

  // Handler: Verify DNS (API real)
  const handleVerifyDNS = async (domainId: number) => {
    setVerifying(domainId);
    try {
      await verifySunainMutation.mutateAsync({ domainId });
      toast.success("Sunínio verificado e ativado com sucesso! Seu site já está acessível pelo novo domain.");
      refetchSunains();
    } catch (error: any) {
      toast.error(error.message || "DNS ainda não está configurado corretamente. Verifique as instruções e tente novamente em alguns minutes.");
    } finally {
      setVerifying(null);
    }
  };

  // Handler: Remover Sunínio
  const handleRemoveSunain = async (domainId: number) => {
    if (!confirm("Tem certeza que deseja remover este domain? Seu site voltará a funcionar apenas pelo subdomain FlowClik.")) return;
    try {
      await removeSunainMutation.mutateAsync({ domainId });
      toast.success("Sunínio removido com sucesso");
      refetchSunains();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover domain");
    }
  };

  // Handler: Salvar Configuração de Email
  const handleSaveEmail = async () => {
    if (!emailSender || !resendApiKey) {
      toast.error("Preencha todos os campos");
      return;
    }
    try {
      await saveEmailMutation.mutateAsync({
        emailSender,
        resendApiKey,
      });
      setEmailConfigured(true);
      toast.success("Configuração de email salva!");
      refetchEmailConfig();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configuração");
    }
  };

  // Handler: Testar Email
  const handleTestEmail = async () => {
    try {
      await testEmailMutation.mutateAsync();
      toast.success("Email de teste enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar email de teste");
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Sunínio Personalizado</h1>
          <p className="text-muted-foreground mt-2">
            Use seu próprio domain para deixar seu site mais profissional
          </p>
        </div>

        {/* SEÇÃO 1: DOMÍNIO PERSONALIZADO */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-red-600" />
              <CardTitle>Sunínio Personalizado</CardTitle>
            </div>
            <CardDescription>
              Ao invés de usar <strong>seusite.flowclik.com</strong>, use seu próprio domain como <strong>seufotografo.com.br</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Explicação inicial */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-blue-300">Como funciona?</p>
                  <p className="text-muted-foreground">
                    You pode usar um domain que já comprou (ex: no Record.br, GoDaddy, Hostinger, Namecheap) 
                    para apontar diretamente para o seu site FlowClik. Assim, quando alguém acessar 
                    <strong> seufotografo.com.br</strong>, vai ver o seu site de fotografia.
                  </p>
                  <p className="text-muted-foreground">
                    Se you ainda não tem um domain, pode comprar um no <a href="https://registro.br" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Record.br</a> (domains .com.br) 
                    ou no <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Namecheap</a> (domains .com).
                    O custo médio é de £ 40/year.
                  </p>
                </div>
              </div>
            </div>

            {/* Input de Sunínio */}
            <div className="space-y-2">
              <Label htmlFor="domain">Seu Sunínio</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  placeholder="seufotografo.com.br"
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
                    "Adicionar Sunínio"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Digite apenas o domain, sem "http://" ou "www". Exemplo: <strong>meufotografo.com.br</strong>
              </p>
            </div>

            {/* Lista de Sunínios Cadastrados */}
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
                            <AlertCircle className="w-3 h-3" /> Pendente
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

                    {/* Instruções DNS - quando pendente */}
                    {d.status !== "active" && (
                      <div className="p-4 space-y-5">
                        
                        {/* Alerta de atenção */}
                        <Alert className="border-yellow-500/50 bg-yellow-500/5">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <AlertDescription className="text-yellow-200">
                            Seu domain foi adicionado, mas ainda precisa ser configurado. Siga o passo a passo abaixo.
                          </AlertDescription>
                        </Alert>

                        {/* PASSO 1 */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-base flex items-center gap-2">
                            <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">1</span>
                            Acesse o painel do seu provedor de domain
                          </h4>
                          <p className="text-sm text-muted-foreground ml-8">
                            Entre no site onde you comprou seu domain. Exemplos comuns:
                          </p>
                          <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <a href="https://registro.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
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
                            Vá em "DNS" ou "Zona DNS" ou "Gerenciar DNS"
                          </h4>
                          <p className="text-sm text-muted-foreground ml-8">
                            Procure a seção de configuração DNS do seu domain. Cada provedor chama de um jeito diferente:
                          </p>
                          <div className="ml-8 text-sm text-muted-foreground space-y-1">
                            <p><strong>Record.br:</strong> Clique no domain → "DNS" → "Editar zona"</p>
                            <p><strong>Hostinger:</strong> Sunínios → Gerenciar → Zona DNS</p>
                            <p><strong>GoDaddy:</strong> Meus Produtos → DNS → Gerenciar Zonas</p>
                            <p><strong>Namecheap:</strong> Sunain List → Manage → Advanced DNS</p>
                          </div>
                        </div>

                        {/* PASSO 3 */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-base flex items-center gap-2">
                            <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">3</span>
                            Adicione (ou edite) o registro DNS tipo "A"
                          </h4>
                          <p className="text-sm text-muted-foreground ml-8">
                            Se já existir um registro tipo "A" com nome "@", <strong>edite ele</strong>. Se não existir, <strong>crie um novo</strong> com estes dados:
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
                                  <td className="p-3 font-mono font-bold">3600 <span className="text-muted-foreground font-normal">(ou "Automático")</span></td>
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
                            Se quiser que <strong>www.{d.domain}</strong> também funcione, adicione mais um registro:
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
                                  <td className="p-3 font-mono font-bold">3600 <span className="text-muted-foreground font-normal">(ou "Automático")</span></td>
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
                            Depois de salvar as configurações no seu provedor, volte aqui e clique no botão abaixo. 
                            A propagação DNS geralmente leva de <strong>5 minutes a 2 hours</strong>. 
                            Se não funcionar de primeira, espere um pouco e tente novamente.
                          </p>
                        </div>

                        {/* Dica sobre HTTPS */}
                        <div className="ml-8 bg-muted/30 border rounded-lg p-3 space-y-1">
                          <p className="text-sm font-semibold flex items-center gap-1">
                            <Info className="w-4 h-4 text-blue-400" /> Dica sobre HTTPS (cadeado de segurança)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Para ter HTTPS no seu custom domain, recomendamos usar o <a href="https://www.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Cloudflare</a> (gratuito). 
                            Basta criar uma conta, adicionar seu domain lá e apontar os nameservers. O Cloudflare cuida do SSL certificate automaticamente.
                            Sem o Cloudflare, seu site funcionará apenas via HTTP (sem cadeado).
                          </p>
                        </div>

                        {/* Botão de verificar */}
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

                    {/* Sunínio active */}
                    {d.status === "active" && (
                      <div className="p-4">
                        <Alert className="border-green-500/50 bg-green-500/5">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-200">
                            Sunínio verificado e active! Seu site está acessível em{" "}
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
                <p className="text-sm mt-1">Adicione seu domain acima para deixar seu site mais profissional</p>
                <p className="text-xs mt-3 opacity-70">
                  Seu site atual: <strong>seusite.flowclik.com</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
