import { useRoute } from "wouter";
import { ClientLayout } from "@/components/ClientLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
// import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClientChat() {
  const [, params] = useRoute("/client/chat/:id");
  const appointmentId = params?.id ? parseInt(params.id) : 0;
  // const { user } = useAuth(); // Clientes não usam OAuth, usam email+senha do agendamento
  const { toast } = useToast();
  
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch } = trpc.clientChat.getMessages.useQuery(
    { appointmentId },
    { 
      enabled: appointmentId > 0,
      refetchInterval: 3000, // Poll every 3 seconds for new messages
    }
  );

  const sendMessageMutation = trpc.clientChat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetch();
      // Mark messages as read
      markAsReadMutation.mutate({ appointmentId, role: "client" });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = trpc.clientChat.markAsRead.useMutation();

  // Mark messages as read when component mounts
  useEffect(() => {
    if (appointmentId > 0) {
      markAsReadMutation.mutate({ appointmentId, role: "client" });
    }
  }, [appointmentId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      appointmentId,
      senderId: appointmentId, // Use appointmentId como identificador do cliente
      senderRole: "client",
      message: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clientes acessam via appointmentId, não precisam de OAuth
  if (!appointmentId) {
    return (
      <ClientLayout appointmentId={appointmentId}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-400">Agendamento invalid</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout appointmentId={appointmentId}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Chat com o Photographer</h1>

        <Card className="bg-gray-900 border-gray-800 flex flex-col h-[600px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages && messages.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>Nonea mensagem ainda. Comece a conversa!</p>
              </div>
            )}

            {messages?.map((msg) => {
              const isOwnMessage = msg.senderRole === "client";
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      isOwnMessage
                        ? "bg-red-600 text-white"
                        : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs opacity-75">
                        {isOwnMessage ? "You" : "Photographer"}
                      </span>
                      <span className="text-xs opacity-50">
                        {new Date(msg.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    {msg.fileUrl && (
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline mt-2 block"
                      >
                        📎 {msg.fileName || "Arquivo anexado"}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 border-gray-700 text-white"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </p>
          </div>
        </Card>
      </div>
    </ClientLayout>
  );
}
