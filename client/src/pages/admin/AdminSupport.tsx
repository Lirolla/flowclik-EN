import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminSupport() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  // Form states
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [replyMessage, setReplyMessage] = useState("");

  // Whatries
  const { data: tickets, refetch: refetchTickets } = trpc.supportTickets.getMyTickets.useQuery();
  const { data: ticketDetails } = trpc.supportTickets.getTicketById.useQuery(
    { ticketId: selectedTicket! },
    { enabled: !!selectedTicket }
  );

  // Mutations
  const createTicket = trpc.supportTickets.create.useMutation({
    onSuccess: () => {
      toast({ title: "Ticket criado com sucesso!" });
      setIsCreateOpen(false);
      setSubject("");
      setMessage("");
      setPriority("normal");
      refetchTickets();
    },
    onError: (error) => {
      toast({ title: "Erro ao criar ticket", description: error.message, variant: "destructive" });
    },
  });

  const addReply = trpc.supportTickets.addReply.useMutation({
    onSuccess: () => {
      toast({ title: "Reply enviada!" });
      setReplyMessage("");
      refetchTickets();
    },
    onError: (error) => {
      toast({ title: "Erro ao enviar resposta", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateTicket = () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    createTicket.mutate({ subject, message, priority });
  };

  const handleAddReply = () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    addReply.mutate({
      ticketId: selectedTicket,
      message: replyMessage,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      open: { variant: "destructive", icon: AlertCircle },
      in_progress: { variant: "default", icon: Clock },
      resolved: { variant: "secondary", icon: CheckCircle2 },
      closed: { variant: "outline", icon: CheckCircle2 },
    };

    const config = variants[status] || variants.open;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status === "open" && "Open"}
        {status === "in_progress" && "Em Andamento"}
        {status === "resolved" && "Resolvido"}
        {status === "closed" && "Closed"}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[priority] || colors.normal}>
        {priority === "low" && "Low"}
        {priority === "normal" && "Normal"}
        {priority === "high" && "High"}
        {priority === "urgent" && "Urgent"}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-muted-foreground">
              Precisa de help? Abra um ticket e our equipe will te respwherer.
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar New Ticket</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Assunto</Label>
                  <Input
                    placeholder="Briefly describe the issue..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Prioridade</Label>
                  <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Descreva o problema em details..."
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTicket} disabled={createTicket.isPending}>
                    {createTicket.isPending ? "Creating..." : "Create Ticket"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Tickets */}
        <div className="grid gap-4">
          {!tickets || tickets.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">None ticket still</h3>
              <p className="text-muted-foreground mb-4">
                Wedndo you precisar de help, crie um ticket e our equipe will respwherer.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar First Ticket
              </Button>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="p-6 cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedTicket(ticket.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">#{ticket.id} - {ticket.subject}</h3>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Criado {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: ptBR })}
                      {ticket.lastReplyAt && (
                        <> · Last resposta {formatDistanceToNow(new Date(ticket.lastReplyAt), { addSuffix: true, locale: ptBR })}</>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Details do Ticket */}
        {selectedTicket && ticketDetails && (
          <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Ticket #{ticketDetails.ticket.id} - {ticketDetails.ticket.subject}
                </DialogTitle>
                <div className="flex gap-2 mt-2">
                  {getStatusBadge(ticketDetails.ticket.status)}
                  {getPriorityBadge(ticketDetails.ticket.priority)}
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Message Original */}
                <Card className="p-4 bg-muted">
                  <p className="text-sm font-semibold mb-2">You:</p>
                  <p className="whitespace-pre-wrap">{ticketDetails.ticket.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(ticketDetails.ticket.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </Card>

                {/* Replys */}
                {ticketDetails.replies.map((reply) => (
                  <Card key={reply.id} className="p-4">
                    <p className="text-sm font-semibold mb-2">
                      {reply.userName || reply.userEmail}:
                    </p>
                    <p className="whitespace-pre-wrap">{reply.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </Card>
                ))}

                {/* Add Reply */}
                {ticketDetails.ticket.status !== "closed" && ticketDetails.ticket.status !== "resolved" && (
                  <div className="space-y-2">
                    <Label>Add Reply</Label>
                    <Textarea
                      placeholder="Type your message..."
                      rows={4}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <Button onClick={handleAddReply} disabled={addReply.isPending}>
                      {addReply.isPending ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
