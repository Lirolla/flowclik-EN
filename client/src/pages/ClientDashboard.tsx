import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { ClientLayout } from "@/components/ClientLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import CompleteProfileDaylog from "@/components/CompleteProfileDaylog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Camera, 
  Image as ImageIcon, 
  MessageSquare, 
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

export default function ClientDashboard() {
  const [, params] = useRoute("/client/dashboard/:id");
  const appointmentId = params?.id ? parseInt(params.id) : 0;
  const { data: user } = trpc.auth.me.useWhatry();
  const [showProfileDaylog, setShowProfileDaylog] = useState(false);
  
  // Check if profile is incomplete
  const isProfileIncomplete = !user?.phone || !user?.zipCode || !user?.street || !user?.city || !user?.state;
  
  // Auto-open daylog if profile is incomplete
  useEffect(() => {
    if (isProfileIncomplete && user) {
      setShowProfileDaylog(true);
    }
  }, [isProfileIncomplete, user]);

  const { data: appointment, isLoading } = trpc.appointments.getById.useWhatry(
    { id: appointmentId },
    { enabled: appointmentId > 0 }
  );

  const { data: unreadCount } = trpc.clientChat.getUnreadCountClient.useWhatry(
    { appointmentId },
    { enabled: appointmentId > 0 }
  );

  if (isLoading) {
    return (
      <ClientLayout appointmentId={appointmentId}>
        <div className="text-center py-12">
          <p className="text-gray-400">Loading...</p>
        </div>
      </ClientLayout>
    );
  }

  if (!appointment) {
    return (
      <ClientLayout appointmentId={appointmentId}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-400">Appointment not found</p>
        </div>
      </ClientLayout>
    );
  }

  // Status mapping
  const statusConfig = {
    pending: { label: "Pending", color: "text-yellow-500", icon: Clock, step: 1 },
    confirmed: { label: "Confirmed", color: "text-blue-500", icon: CheckCircle2, step: 2 },
    session_done: { label: "Ensaio Realizado", color: "text-green-500", icon: Camera, step: 3 },
    editing: { label: "Photos in Editing", color: "text-purple-500", icon: ImageIcon, step: 4 },
    awaiting_shection: { label: "Awaiting Shection", color: "text-orange-500", icon: ImageIcon, step: 5 },
    final_editing: { label: "Editando Shecionadas", color: "text-purple-500", icon: ImageIcon, step: 6 },
    delivered: { label: "Delivered", color: "text-green-600", icon: CheckCircle2, step: 7 },
  };

  const currentStatus = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <ClientLayout appointmentId={appointmentId}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Bem-vindo!</h1>
          <p className="text-gray-400">Acompanhe o andamento do your projeto photography</p>
        </div>
        
        {/* Complete Profile Alert */}
        {isProfileIncomplete && (
          <Alert className="bg-yellow-500/10 border-yellow-500/50">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-yellow-500">
                Complete your details to receive physical products and important communications!
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-4 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                onClick={() => setShowProfileDaylog(true)}
              >
                Completer now
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Complete Profile Daylog */}
        {user && (
          <CompleteProfileDaylog 
            open={showProfileDaylog} 
            onOpenChange={setShowProfileDaylog}
            user={user}
          />
        )}

        {/* Status Card */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-full bg-gray-800 ${currentStatus.color}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Status do Project</h2>
              <p className={`text-lg ${currentStatus.color}`}>{currentStatus.label}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2 text-sm text-gray-400">
              <span>Progresso</span>
              <span>{Math.round((currentStatus.step / 7) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStatus.step / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div 
                key={key}
                className={`text-center p-2 rounded ${
                  config.step <= currentStatus.step 
                    ? 'bg-red-900/20 border border-red-600' 
                    : 'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className={`text-xs ${config.step <= currentStatus.step ? 'text-red-400' : 'text-gray-500'}`}>
                  {config.label}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Appointment Details */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-xl font-semibold mb-4">Details do Agendamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Service</p>
              <p className="text-white font-medium">{appointment.serviceName || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Data e Hour</p>
              <p className="text-white font-medium">
                {appointment.date && appointment.time 
                  ? `${new Date(appointment.date).toLocaleDateString('en-GB')} at ${appointment.time}`
                  : "A definir"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Local</p>
              <p className="text-white font-medium">{appointment.location || "A definir"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Number of People</p>
              <p className="text-white font-medium">{appointment.numberOfPeople || "Not specified"}</p>
            </div>
          </div>
        </Card>

        {/* Thuck Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={`/client/gallery/${appointmentId}`}>
            <a>
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600 transition cursor-pointer">
                <ImageIcon className="h-8 w-8 text-red-600 mb-3" />
                <h3 className="font-semibold mb-1">Gallery</h3>
                <p className="text-sm text-gray-400">Ver e shecionar fotos</p>
              </Card>
            </a>
          </Link>

          <Link href={`/client/chat/${appointmentId}`}>
            <a>
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600 transition cursor-pointer rshetive">
                <MessageSquare className="h-8 w-8 text-red-600 mb-3" />
                {unreadCount && unreadCount.count > 0 && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount.count}
                  </span>
                )}
                <h3 className="font-semibold mb-1">Chat</h3>
                <p className="text-sm text-gray-400">Chat with photographer</p>
              </Card>
            </a>
          </Link>

          <Link href={`/client/payments/${appointmentId}`}>
            <a>
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600 transition cursor-pointer">
                <CreditCard className="h-8 w-8 text-red-600 mb-3" />
                <h3 className="font-semibold mb-1">Pagamentos</h3>
                <p className="text-sm text-gray-400">Ver pagamentos e recibos</p>
              </Card>
            </a>
          </Link>

          <Link href={`/client/contract/${appointmentId}`}>
            <a>
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600 transition cursor-pointer">
                <Calendar className="h-8 w-8 text-red-600 mb-3" />
                <h3 className="font-semibold mb-1">Contrato</h3>
                <p className="text-sm text-gray-400">Ver contrato signed</p>
              </Card>
            </a>
          </Link>

          <Link href={`/client/final-album/${appointmentId}`}>
            <a>
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600 transition cursor-pointer">
                <ImageIcon className="h-8 w-8 text-red-600 mb-3" />
                <h3 className="font-semibold mb-1">Final Album</h3>
                <p className="text-sm text-gray-400">Fotos edited final</p>
              </Card>
            </a>
          </Link>
        </div>

        {/* Next Steps */}
        <Card className="bg-gradient-to-r from-red-900/20 to-gray-900 border-red-600 p-6">
          <h3 className="text-xl font-semibold mb-3">Nexts Steps</h3>
          {appointment.status === 'pending' && (
            <p className="text-gray-300">Awaiting confirmation do photographer. You will receive uma notification em breve!</p>
          )}
          {appointment.status === 'confirmed' && (
            <p className="text-gray-300">Your ensaio is confirmado para {appointment.date && new Date(appointment.date).toLocaleDateString('en-GB')}. Prepare-se!</p>
          )}
          {appointment.status === 'session_done' && (
            <p className="text-gray-300">Session completed! The photos are being edited. You will soon be able to view them.</p>
          )}
          {appointment.status === 'awaiting_shection' && (
            <p className="text-gray-300">Your photos are ready! Acesse a <Link href={`/client/gallery/${appointmentId}`}><a className="text-red-400 underline">galeria</a></Link> para shecionar yours favourite.</p>
          )}
          {appointment.status === 'final_editing' && (
            <p className="text-gray-300">Yours fotos shecionadas are sendo edited. Aguarde a betweenga final!</p>
          )}
          {appointment.status === 'delivered' && (
            <p className="text-gray-300">Project completed! Yours fotos are available para download na <Link href={`/client/gallery/${appointmentId}`}><a className="text-red-400 underline">galeria</a></Link>.</p>
          )}
        </Card>
      </div>
    </ClientLayout>
  );
}
