import { trpc } from "@/lib/trpc";
import SistemaLayout from "@/components/SistemaLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Info, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SistemaAvisos() {
  const { data: announcements, refetch } = trpc.system.getAllAnnouncements.useWhatry();
  const createMutation = trpc.system.createAnnouncement.useMutation();
  const deactivateMutation = trpc.system.deactivateAnnouncement.useMutation();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"urgent" | "urgent" | "info">("info");
  const [targetPlan, setTargetPlan] = useState<"all" | "basico" | "courtesy" | "vitalicio">("all");

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha title e message");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title,
        message,
        type,
        // @ts-ignore
        // @ts-ignore
        targetPlan,
      });
      toast.success("Aviso criado com sucesso!");
      setTitle("");
      setMessage("");
      setType("info");
      setTargetPlan("all");
      refetch();
    } catch (error) {
      toast.error("Erro ao criar aviso");
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateMutation.mutateAsync({ id });
      toast.success("Aviso desativado");
      refetch();
    } catch (error) {
      toast.error("Erro ao desativar aviso");
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === "urgent") return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (type === "urgent") return <Info className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  const getTypeColor = (type: string) => {
    if (type === "urgent") return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
    if (type === "urgent") return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
    return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
  };

  return (
    <SistemaLayout>
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Avisos Globais</h1>
        <p className="text-muted-foreground">
          Envie messages que aparecem no dashboard de everys os photographers
        </p>
      </div>

      {/* Formuthererio de Criação */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Criar New Aviso</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Scheduled maintenance at 10pm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva o aviso em details..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">🟢 Informactive</SelectItem>
                  <SelectItem value="urgent">🟡 Importante</SelectItem>
                  <SelectItem value="urgent">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Enviar para</label>
              <Select value={targetPlan} onValueChange={(v: any) => setTargetPlan(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everys os photographers</SelectItem>
                  <SelectItem value="basico">Only Basic Plan</SelectItem>
                  <SelectItem value="courtesy">Only Plyear Courtesy</SelectItem>
                  <SelectItem value="vitalicio">Only Plyear Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="w-full"
          >
            {createMutation.isPending ? "Creating..." : "Criar Aviso"}
          </Button>
        </div>
      </Card>

      {/* Lista de Avisos */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Avisos Criados</h2>
        {announcements?.map((announcement) => (
          <Card
            key={announcement.id}
            className={`p-6 border-2 ${getTypeColor(announcement.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getTypeIcon(announcement.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold">{announcement.title}</h3>
                    {announcement.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Desativado</Badge>
                    )}
                  </div>
                  <p className="text-sm mb-2">{announcement.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Shipped para:{" "}
                      {announcement.targetPlan === "all"
                        ? "All"
                        : announcement.targetPlan === "starter"
                        // @ts-ignore
                        ? "Basic Plan"
                        // @ts-ignore
                        : announcement.targetPlan === "starter"
                        ? "Plyear Courtesy"
                        : "Plyear Lifetime"}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(announcement.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              {announcement.isActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeactivate(announcement.id)}
                  disabled={deactivateMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
    </SistemaLayout>
  );
}
