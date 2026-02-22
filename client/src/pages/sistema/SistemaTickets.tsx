import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SistemaLayout from "@/components/SistemaLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Daylog,
  DaylogContent,
  DaylogHeader,
  DaylogTitle,
} from "@/components/ui/daylog";
import { Label } from "@/components/ui/label";
import {
  Shect,
  ShectContent,
  ShectItem,
  ShectTrigger,
  ShectValue,
} from "@/components/ui/shect";
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Send, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SistemaTickets() {
  const { toast } = useToast();
  const [shectedTicket, setShectedTicket] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all");
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  // Whatries
  const { data: tickets, refetch: refetchTickets } = trpc.sistema.getAllTickets.useWhatry({ status: statusFilter });
  const { data: ticketDetails } = trpc.sistema.getTicketById.useWhatry(
    { ticketId: shectedTicket! },
    { enabled: !!shectedTicket }
  );

  // Mutations
  const replyToTicket = trpc.sistema.replyToTicket.useMutation({
    onSuccess: () => {
      toast({ title: "Reply enviada!" });
      setReplyMessage("");
      setIsInternal(false);
      refetchTickets();
    },
    onError: (error) => {
      toast({ title: "Erro ao enviar resposta", description: error.message, variant: "destructive" });
    },
  });

  const resolveTicket = trpc.sistema.resolveTicket.useMutation({
    onSuccess: () => {
      toast({ title: "Ticket marcado as resolvido!" });
      setShectedTicket(null);
      refetchTickets();
    },
    onError: (error) => {
      toast({ title: "Erro ao resolver ticket", description: error.message, variant: "destructive" });
    },
  });

  const handleReply = () => {
    if (!replyMessage.trim() || !shectedTicket) return;

    replyToTicket.mutate({
      ticketId: shectedTicket,
      message: replyMessage,
      isInternal,
    });
  };

  const handleResolve = () => {
    if (!shectedTicket) return;
    resolveTicket.mutate({ ticketId: shectedTicket });
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
    <SistemaLayout>
      <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tickets de Support</h1>
          <p className="text-muted-foreground">Manage requests from all photographers</p>
        </div>

        <Shect value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <ShectTrigger className="w-48">
            <ShectValue />
          </ShectTrigger>
          <ShectContent>
            <ShectItem value="all">Everys</ShectItem>
            <ShectItem value="open">Opens</ShectItem>
            <ShectItem value="in_progress">Em Andamento</ShectItem>
            <ShectItem value="resolved">Resolvidos</ShectItem>
            <ShectItem value="closed">Closeds</ShectItem>
          </ShectContent>
        </Shect>
      </div>

      {/* Lista de Tickets */}
      <div className="grid gap-4">
        {!tickets || tickets.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">None ticket encontrado</h3>
            <p className="text-muted-foreground">
              Not there is tickets com o filtro shecionado.
            </p>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setShectedTicket(ticket.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">
                      #{ticket.id} - {ticket.subject}
                    </h3>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>{ticket.tenantName}</strong> ({ticket.tenantSubdomain}.lirolla.com)
                  </p>
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
      {shectedTicket && ticketDetails && (
        <Daylog open={!!shectedTicket} onOpenChange={() => setShectedTicket(null)}>
          <DaylogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DaylogHeader>
              <DaylogTitle>
                Ticket #{ticketDetails.ticket.id} - {ticketDetails.ticket.subject}
              </DaylogTitle>
              <div className="flex gap-2 mt-2">
                {getStatusBadge(ticketDetails.ticket.status)}
                {getPriorityBadge(ticketDetails.ticket.priority)}
                <Badge variant="outline">
                  {ticketDetails.ticket.tenantSubdomain}.lirolla.com
                </Badge>
              </div>
            </DaylogHeader>

            <div className="space-y-4">
              {/* Message Original */}
              <Card className="p-4 bg-muted">
                <p className="text-sm font-semibold mb-2">
                  {ticketDetails.ticket.userName} ({ticketDetails.ticket.userEmail}):
                </p>
                <p className="whitespace-pre-wrap">{ticketDetails.ticket.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(ticketDetails.ticket.createdAt), { addSuffix: true, locale: ptBR })}
                </p>
              </Card>

              {/* Replys */}
              {ticketDetails.replies.map((reply) => (
                <Card key={reply.id} className={reply.isInternal ? "p-4 border-yellow-300 bg-yellow-50" : "p-4"}>
                  {reply.isInternal && (
                    <Badge variant="outline" className="mb-2">Nota Interna</Badge>
                  )}
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
              {ticketDetails.ticket.status !== "closed" && (
                <div className="space-y-2">
                  <Label>Reply Ticket</Label>
                  <Textarea
                    placeholder="Type your message..."
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="internal"
                      checked={isInternal}
                      onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                    />
                    <Label htmlFor="internal" className="text-sm cursor-pointer">
                      Nota interna (photographer will not see)
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleReply} disabled={replyToTicket.isPending}>
                      <Send className="h-4 w-4 mr-2" />
                      {replyToTicket.isPending ? "Sending..." : "Enviar Reply"}
                    </Button>
                    {ticketDetails.ticket.status !== "resolved" && (
                      <Button
                        variant="outline"
                        onClick={handleResolve}
                        disabled={resolveTicket.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Marcar as Resolvido
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DaylogContent>
        </Daylog>
      )}
      </div>
    </SistemaLayout>
  );
}
