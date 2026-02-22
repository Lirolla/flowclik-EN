import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Send, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminMessages() {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Buscar conversas do fotógrafo (agendamentos com mensagens)
  const { data: conversations, isLoading: loadingConversations, refetch: refetchConversations } = 
    trpc.clientChat.getAllConversations.useQuery();

  // Buscar todos os agendamentos para criar nova conversa
  const { data: allAppointments } = trpc.appointments.getAll.useQuery();

  // Buscar mensagens da conversa selecionada
  const { data: messages, isLoading: loadingMessages, refetch: refetchMessages } = 
    trpc.clientChat.getMessages.useQuery(
      { appointmentId: selectedAppointmentId! },
      { 
        enabled: !!selectedAppointmentId,
        refetchInterval: 3000, // Poll every 3 seconds for new messages
      }
    );

  // Mutation para enviar mensagem
  const sendMessageMutation = trpc.clientChat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      refetchConversations();
      // Mark messages as read
      markAsReadMutation.mutate({ appointmentId: selectedAppointmentId!, role: "admin" });
      toast.success("Mensagem enviada!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const markAsReadMutation = trpc.clientChat.markAsRead.useMutation();

  // Mark messages as read when selecting a conversation
  useEffect(() => {
    if (selectedAppointmentId) {
      markAsReadMutation.mutate({ appointmentId: selectedAppointmentId, role: "admin" });
    }
  }, [selectedAppointmentId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedAppointmentId) return;

    sendMessageMutation.mutate({
      appointmentId: selectedAppointmentId,
      senderId: 1, // Admin/Photographer ID (pode ser ctx.user.id no backend)
      senderRole: "admin",
      message: messageText.trim(),
    });
  };

  const selectedConversation = conversations?.find((c) => c.appointmentId === selectedAppointmentId);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Mensagens</h1>
          <p className="text-muted-foreground">Converse com seus clientes</p>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* LADO ESQUERDO: Lista de Conversas */}
          <Card className="col-span-4 flex flex-col">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <h2 className="font-semibold">Conversas</h2>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setIsNewConversationModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nova
                </Button>
              </div>

              {/* Lista de conversas */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {loadingConversations ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
                ) : conversations && conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <button
                      key={conv.appointmentId}
                      onClick={() => setSelectedAppointmentId(conv.appointmentId)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedAppointmentId === conv.appointmentId
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{conv.clientName}</div>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{conv.clientEmail}</div>
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {conv.lastMessage || "Sem mensagens"}
                      </div>
                      {conv.lastMessageTime && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(conv.lastMessageTime).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhuma conversa ainda</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      As conversas aparecerão quando os clientes enviarem mensagens
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* LADO DIREITO: Área de Chat */}
          <Card className="col-span-8 flex flex-col">
            <CardContent className="p-4 flex flex-col h-full">
              {selectedAppointmentId ? (
                <>
                  {/* Header do chat */}
                  <div className="pb-4 border-b mb-4">
                    <h3 className="font-semibold">{selectedConversation?.clientName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation?.clientEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Serviço: {selectedConversation?.serviceName}
                    </p>
                  </div>

                  {/* Mensagens */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {loadingMessages ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Carregando mensagens...
                      </p>
                    ) : messages && messages.length > 0 ? (
                      <>
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.senderRole === "admin" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                msg.senderRole === "admin"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.createdAt).toLocaleString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma mensagem ainda. Envie a primeira!
                      </p>
                    )}
                  </div>

                  {/* Input de mensagem */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Selecione uma conversa para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal: Nova Conversa */}
      <Dialog open={isNewConversationModalOpen} onOpenChange={setIsNewConversationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Nova Conversa</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allAppointments && allAppointments.length > 0 ? (
              allAppointments.map((appointment: any) => (
                <button
                  key={appointment.id}
                  onClick={() => {
                    setSelectedAppointmentId(appointment.id);
                    setIsNewConversationModalOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="font-medium">{appointment.clientName}</div>
                  <div className="text-sm text-muted-foreground">{appointment.clientEmail}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Agendamento: {new Date(appointment.appointmentDate).toLocaleDateString("pt-BR")}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum agendamento cadastrado
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
