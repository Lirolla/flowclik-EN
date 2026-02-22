import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminMessages() {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  // Get all conversations
  const { data: conversations, refetch: refetchConversations } = trpc.clientChat.getAllConversations.useQuery();

  // Get messages for selected conversation
  const { data: messages, refetch: refetchMessages } = trpc.clientChat.getMessages.useQuery(
    { appointmentId: selectedAppointmentId! },
    { enabled: !!selectedAppointmentId }
  );

  // Send message mutation
  const sendMessageMutation = trpc.clientChat.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
      refetchConversations();
      setNewMessage("");
      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada ao cliente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = trpc.clientChat.markAsRead.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });

  const handleSelectConversation = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    // Mark messages as read
    markAsReadMutation.mutate({
      appointmentId,
      role: "admin",
    });
  };

  const handleSendMessage = () => {
    if (!selectedAppointmentId || !newMessage.trim() || !user) return;

    sendMessageMutation.mutate({
      appointmentId: selectedAppointmentId,
      senderId: user.id,
      senderRole: "admin",
      message: newMessage.trim(),
    });
  };

  const selectedConversation = conversations?.find(c => c.appointmentId === selectedAppointmentId);

  const formatTime = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        <h1 className="text-3xl font-bold mb-6">Mensagens</h1>

        <div className="grid grid-cols-12 gap-4 h-[calc(100%-4rem)]">
          {/* Lista de Conversas - Esquerda */}
          <Card className="col-span-4 bg-gray-900 border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-500" />
                Conversas
              </h2>
            </div>

            <ScrollArea className="flex-1">
              {!conversations || conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nonea conversa ainda</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {conversations.map((conv) => (
                    <button
                      key={conv.appointmentId}
                      onClick={() => handleSelectConversation(conv.appointmentId)}
                      className={`w-full p-4 text-left hover:bg-gray-800/50 transition-colors ${
                        selectedAppointmentId === conv.appointmentId ? "bg-gray-800" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{conv.clientName}</p>
                            <p className="text-xs text-gray-400 truncate">{conv.serviceName}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-400">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {conv.lastMessageSender === "admin" && "You: "}
                        {conv.lastMessage || "Sem mensagens"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat - Direita */}
          <Card className="col-span-8 bg-gray-900 border-gray-800 flex flex-col">
            {!selectedAppointmentId ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select uma conversa para começar</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header do Chat */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedConversation?.clientName}</p>
                      <p className="text-sm text-gray-400">{selectedConversation?.serviceName}</p>
                    </div>
                  </div>
                </div>

                {/* Mensagens */}
                <ScrollArea className="flex-1 p-4">
                  {!messages || messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <p>Nonea mensagem ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderRole === "admin" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.senderRole === "admin"
                                ? "bg-red-600 text-white"
                                : "bg-gray-800 text-gray-100"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 opacity-70" />
                              <span className="text-xs opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Input de Mensagem */}
                <div className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-800 border-gray-700"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
