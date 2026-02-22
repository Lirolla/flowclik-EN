import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, FileText, Download, Eye, Wand2, Edit, ChevronRight, Sparkles, Mail, MessageCircle, Loader2, CircleCheckBig } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminContracts() {
  return (
    <DashboardLayout>
      <AdminContractsContent />
    </DashboardLayout>
  );
}

function AdminContractsContent() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    isActive: true,
  });

  // Estado para gerar contrato
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [generatedInfo, setGeneratedInfo] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: templates, refetch } = trpc.contracts.getAll.useQuery();
  const { data: appointmentsList } = trpc.appointments.getAll.useQuery();

  const createTemplate = trpc.contracts.create.useMutation({
    onSuccess: () => {
      toast({ title: "Template criado com sucesso!" });
      refetch();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar template", description: error.message, variant: "destructive" });
    },
  });

  const updateTemplate = trpc.contracts.update.useMutation({
    onSuccess: () => {
      toast({ title: "Template atualizado!" });
      refetch();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });

  const deleteTemplate = trpc.contracts.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Template excluído!" });
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });

  const seedDefaults = trpc.contracts.seedDefaults.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: `${data.count} templates prontos adicionados!`, description: "Modelos baseados na legislação brasileira." });
        refetch();
      } else {
        toast({ title: "Aviso", description: data.message, variant: "destructive" });
      }
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const generateFromAppointment = trpc.contracts.generateFromAppointment.useMutation({
    onSuccess: (data: any) => {
      setGeneratedContent(data.content);
      setGeneratedInfo(data);
      setIsPreviewOpen(true);
      setIsGenerateOpen(false);
      toast({ title: "Contrato gerado!", description: `Para ${data.clientName} - ${data.serviceName}` });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao gerar contrato", description: error.message, variant: "destructive" });
    },
  });

  const generatePDF = trpc.contracts.generatePDF.useMutation({
    onSuccess: (data: any) => {
      if (data.pdfData) {
        const link = document.createElement("a");
        link.href = data.pdfData;
        link.download = data.fileName;
        link.click();
        toast({ title: "PDF baixado com sucesso!" });
      }
    },
    onError: (error: any) => {
      toast({ title: "Erro ao gerar PDF", description: error.message, variant: "destructive" });
    },
  });

  const saveContract = trpc.contracts.saveContract.useMutation({
    onSuccess: (data: any) => {
      toast({ title: data.updated ? "Contrato atualizado!" : "Contrato salvo com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar contrato", variant: "destructive" });
    },
  });

  const sendEmail = trpc.contracts.sendContractEmail.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: "Email enviado com sucesso para " + (generatedInfo?.clientEmail || 'o cliente') + "!" });
      } else {
        toast({ title: "Falha ao enviar email. Verifique as configurações.", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Erro ao enviar email", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, ...formData });
    } else {
      createTemplate.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", content: "", isActive: true });
    setEditingTemplate(null);
  };

  const openEditDialog = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      content: template.content,
      isActive: template.isActive === 1,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Filtrar agendamentos ativos (não cancelados)
  const activeAppointments = appointmentsList?.filter(
    (a: any) => a.status !== 'cancelled'
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground mt-1">
            Gere contratos profissionais a partir dos seus agendamentos
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(!templates || templates.length === 0) && (
            <Button
              variant="outline"
              onClick={() => seedDefaults.mutate()}
              disabled={seedDefaults.isPending}
              className="border-accent text-accent hover:bg-accent/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {seedDefaults.isPending ? "Carregando..." : "Carregar Modelos Prontos"}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Editar Template" : "Novo Template"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Template *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Conteúdo do Contrato *</Label>
                  <Textarea
                    id="content"
                    rows={15}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <div className="mt-2 p-3 bg-muted rounded text-xs">
                    <p className="font-semibold mb-2">Variáveis disponíveis (preenchidas automaticamente):</p>
                    <div className="grid grid-cols-2 gap-1">
                      <span><code>{"{cliente}"}</code> - Nome do cliente</span>
                      <span><code>{"{email}"}</code> - E-mail</span>
                      <span><code>{"{telefone}"}</code> - Telefone</span>
                      <span><code>{"{cpf}"}</code> - CPF do cliente</span>
                      <span><code>{"{servico}"}</code> - Tipo de serviço</span>
                      <span><code>{"{data}"}</code> - Data do agendamento</span>
                      <span><code>{"{horario}"}</code> - Horário</span>
                      <span><code>{"{local}"}</code> - Local do evento</span>
                      <span><code>{"{duracao}"}</code> - Duração estimada</span>
                      <span><code>{"{valor}"}</code> - Valor total (R$)</span>
                      <span><code>{"{valor_sinal}"}</code> - Valor do sinal (50%)</span>
                      <span><code>{"{fotografo}"}</code> - Nome do fotógrafo</span>
                      <span><code>{"{fotografo_documento}"}</code> - CPF/CNPJ</span>
                      <span><code>{"{cidade}"}</code> - Cidade</span>
                      <span><code>{"{data_contrato}"}</code> - Data de hoje</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Template ativo</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={createTemplate.isPending || updateTemplate.isPending}>
                    {createTemplate.isPending || updateTemplate.isPending ? "Salvando..." : editingTemplate ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Seção Principal: Gerar Contrato */}
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-accent" />
            Gerar Contrato a partir de Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Selecione um agendamento e um modelo de contrato. Os dados do cliente, serviço, data e valor serão preenchidos automaticamente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selecionar Agendamento */}
            <div>
              <Label>1. Selecione o Agendamento</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
                value={selectedAppointmentId || ""}
                onChange={(e) => setSelectedAppointmentId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Selecione um agendamento...</option>
                {activeAppointments.map((apt: any) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.clientName} - {apt.customServiceName || apt.serviceName || 'Sem serviço'} - {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('pt-BR') : 'Sem data'}
                  </option>
                ))}
              </select>
            </div>

            {/* Selecionar Template */}
            <div>
              <Label>2. Selecione o Modelo de Contrato</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
                value={selectedTemplateId || ""}
                onChange={(e) => setSelectedTemplateId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Selecione um modelo...</option>
                {templates?.filter((t: any) => t.isActive === 1).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info do agendamento selecionado */}
          {selectedAppointmentId && (() => {
            const apt = activeAppointments.find((a: any) => a.id === selectedAppointmentId);
            if (!apt) return null;
            const price = apt.finalPrice || apt.servicePrice || 0;
            return (
              <div className="mt-4 p-3 bg-background rounded-lg border text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div><span className="text-muted-foreground">Cliente:</span> <strong>{apt.clientName}</strong></div>
                  <div><span className="text-muted-foreground">Serviço:</span> <strong>{apt.customServiceName || apt.serviceName || 'N/A'}</strong></div>
                  <div><span className="text-muted-foreground">Data:</span> <strong>{apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('pt-BR') : 'N/A'}</strong></div>
                  <div><span className="text-muted-foreground">Valor:</span> <strong>R$ {(price / 100).toFixed(2).replace('.', ',')}</strong></div>
                </div>
              </div>
            );
          })()}

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => {
                if (!selectedTemplateId || !selectedAppointmentId) {
                  toast({ title: "Selecione um agendamento e um modelo", variant: "destructive" });
                  return;
                }
                generateFromAppointment.mutate({
                  templateId: selectedTemplateId,
                  appointmentId: selectedAppointmentId,
                });
              }}
              disabled={!selectedTemplateId || !selectedAppointmentId || generateFromAppointment.isPending}
              className="flex-1 md:flex-none"
            >
              <Eye className="w-4 h-4 mr-2" />
              {generateFromAppointment.isPending ? "Gerando..." : "Visualizar Contrato"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!selectedTemplateId || !selectedAppointmentId) {
                  toast({ title: "Selecione um agendamento e um modelo", variant: "destructive" });
                  return;
                }
                generatePDF.mutate({
                  templateId: selectedTemplateId,
                  appointmentId: selectedAppointmentId,
                });
              }}
              disabled={!selectedTemplateId || !selectedAppointmentId || generatePDF.isPending}
              className="flex-1 md:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              {generatePDF.isPending ? "Gerando PDF..." : "Baixar PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview do contrato gerado */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {generatedInfo?.templateName || "Contrato"}
            </DialogTitle>
          </DialogHeader>
          {generatedInfo && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
              <span className="bg-muted px-2 py-1 rounded">Cliente: {generatedInfo.clientName}</span>
              <span className="bg-muted px-2 py-1 rounded">Serviço: {generatedInfo.serviceName}</span>
              <span className="bg-muted px-2 py-1 rounded">Data: {generatedInfo.appointmentDate}</span>
              <span className="bg-muted px-2 py-1 rounded">Valor: R$ {generatedInfo.price}</span>
            </div>
          )}
          <div className="bg-white rounded-lg border overflow-hidden">
            {/* Logo do fotógrafo */}
            {generatedInfo?.logoUrl && (
              <div className="flex justify-start p-4 pb-2 border-b border-gray-300">
                <img 
                  src={generatedInfo.logoUrl} 
                  alt={generatedInfo.siteName || 'Logo'} 
                  className="max-h-16 max-w-40 object-contain"
                />
              </div>
            )}
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="w-full bg-white text-black p-8 font-serif text-sm leading-relaxed min-h-[55vh] max-h-[60vh] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              spellCheck={false}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Você pode editar o texto acima antes de copiar, baixar ou enviar.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!selectedTemplateId || !selectedAppointmentId) return;
                saveContract.mutate({
                  appointmentId: selectedAppointmentId,
                  templateId: selectedTemplateId,
                  content: generatedContent,
                  clientName: generatedInfo?.clientName || '',
                  clientEmail: generatedInfo?.clientEmail || '',
                  templateName: generatedInfo?.templateName || '',
                  serviceName: generatedInfo?.serviceName || '',
                  price: generatedInfo?.price || '',
                });
              }}
              disabled={saveContract.isPending}
              className="border-green-600 text-green-600 hover:bg-green-600/10"
            >
              {saveContract.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              {saveContract.isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              onClick={async () => {
                try {
                  const { jsPDF } = await import('jspdf');
                  const doc = new jsPDF();
                  let startY = 20;
                  if (generatedInfo?.logoUrl) {
                    try { doc.addImage(generatedInfo.logoUrl, 'PNG', 20, 10, 50, 25); startY = 42; } catch (e) {}
                  }
                  doc.setFontSize(14);
                  doc.setFont("helvetica", "bold");
                  doc.text(doc.splitTextToSize((generatedInfo?.templateName || 'Contrato').toUpperCase(), 170), 20, startY);
                  doc.setFontSize(10);
                  doc.setFont("helvetica", "normal");
                  const lines = doc.splitTextToSize(generatedContent, 170);
                  let y = startY + 15;
                  for (const line of lines) { if (y > 280) { doc.addPage(); y = 20; } doc.text(line, 20, y); y += 5; }
                  doc.save(`contrato-${generatedInfo?.clientName?.toLowerCase().replace(/\s+/g, '-') || 'cliente'}.pdf`);
                  toast({ title: "PDF gerado com sucesso!" });
                } catch (e) { toast({ title: "Erro ao gerar PDF", variant: "destructive" }); }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!generatedInfo?.clientEmail) {
                  toast({ title: "Cliente sem email cadastrado", variant: "destructive" });
                  return;
                }
                if (!selectedTemplateId || !selectedAppointmentId) return;
                sendEmail.mutate({
                  appointmentId: selectedAppointmentId,
                  templateId: selectedTemplateId,
                  content: generatedContent,
                  clientName: generatedInfo?.clientName || '',
                  clientEmail: generatedInfo?.clientEmail || '',
                  templateName: generatedInfo?.templateName || '',
                  serviceName: generatedInfo?.serviceName || '',
                  price: generatedInfo?.price || '',
                  logoUrl: generatedInfo?.logoUrl || '',
                });
              }}
              disabled={sendEmail.isPending}
            >
              {sendEmail.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              {sendEmail.isPending ? "Enviando..." : "Email"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const phone = generatedInfo?.clientPhone?.replace(/\D/g, '') || '';
                const phoneFormatted = phone.startsWith('55') ? phone : `55${phone}`;
                const message = encodeURIComponent(`*${generatedInfo?.templateName || 'Contrato'}*\n\nOlá ${generatedInfo?.clientName || ''}! Segue seu contrato:\n\n${generatedContent.substring(0, 1000)}...\n\n_Contrato completo será enviado em PDF._`);
                window.open(`https://wa.me/${phoneFormatted}?text=${message}`, '_blank');
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(generatedContent);
                toast({ title: "Copiado!" });
              }}
            >
              Copiar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Modelos de Contrato</h2>
        {!templates || templates.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum modelo cadastrado</h3>
              <p className="text-muted-foreground mb-6">
                Clique em "Carregar Modelos Prontos" para adicionar 4 contratos profissionais baseados na legislação brasileira, ou crie o seu próprio.
              </p>
              <Button
                onClick={() => seedDefaults.mutate()}
                disabled={seedDefaults.isPending}
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {seedDefaults.isPending ? "Carregando..." : "Carregar 4 Modelos Prontos"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template: any) => (
              <Card key={template.id} className={`${template.isActive !== 1 ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent" />
                        {template.name}
                      </CardTitle>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      )}
                    </div>
                    {template.isActive !== 1 && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Inativo</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-3">
                    {template.content.length} caracteres • Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(template)}>
                      <Edit className="w-3 h-3 mr-1" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este template?")) {
                          deleteTemplate.mutate({ id: template.id });
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
