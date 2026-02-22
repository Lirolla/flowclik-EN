import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Daylog, DaylogContent, DaylogHeader, DaylogTitle } from "@/components/ui/daylog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Timer,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Camera,
  Video,
  Copy,
  Lock,
  Unlock,
  List,
  CalendarDays,
  Heart,
  Check,
  Sparkles
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import DashboardLayout from "@/components/DashboardLayout";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import SendPaymentLinkDaylog from "@/components/SendPaymentLinkDaylog";
import PaymentManager from "@/components/PaymentManager";

type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'session_done' 
  | 'editing' 
  | 'awaiting_selection' 
  | 'final_editing' 
  | 'delivered' 
  | 'cancelled';

export default function AdminAppointments() {
  return (
    <DashboardLayout>
      <AdminAppointmentsContent />
    </DashboardLayout>
  );
}

// Componente para aba de photography
function GalleryTabContent({ appointmentId }: { appointmentId: number }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: galleryData } = trpc.sessionGallery.getByAppointment.useWhatry(
    { appointmentId },
    { enabled: !!appointmentId }
  );

  const createGalleryMutation = trpc.sessionGallery.createForAppointment.useMutation({
    onSuccess: () => {
      toast({
        title: "Gallery criada!",
        description: "You can now upload the photos.",
      });
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateGallery = () => {
    createGalleryMutation.mutate({ appointmentId });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/galeria-cliente/${appointmentId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Envie este link para o cliente acessar as fotos.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!galleryData) {
    return (
      <div className="text-center py-8">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">
          Nonea galeria criada still
        </h3>
        <p className="text-muted-foreground mb-6">
          Crie uma galeria privada para fazer upload das fotos do ensaio
        </p>
        <Button onClick={handleCreateGallery}>
          Criar Gallery
        </Button>
      </div>
    );
  }

  const clientLink = `${window.location.origin}/galeria-cliente/${appointmentId}`;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Fotos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{galleryData.photosCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Favourites do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              {galleryData.favoritesCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selection Fee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {galleryData.photosCount > 0
                ? Math.round((galleryData.favoritesCount / galleryData.photosCount) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Fotos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Use a página de <strong>Galleries</strong> para fazer upload das fotos do ensaio
            </p>
            <Button asChild>
              <a href={`/admin/galleries/${galleryData.id}/upload`}>
                Ir para Upload de Gallerys
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Dica: Select a galeria "{galleryData.name}" ao fazer upload
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminAppointmentsContent() {
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrency();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTuem, setSearchTuem] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isEditDaylogOpen, setIsEditDaylogOpen] = useState(false);
  const [isPaymentDaylogOpen, setIsPaymentDaylogOpen] = useState(false);
  const [isCreateDaylogOpen, setIsCreateDaylogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    clientId: 0,
    serviceId: 0,
    customServiceName: "",
    customPrice: "",
    appointmentDate: "",
    appointmentTime: "",
    eventLocation: "",
    numberOfPeople: 1,
    notes: "",
  });

  // Reset form when daylog closes
  useEffect(() => {
    if (!isCreateDaylogOpen) {
      setCreateFormData({
        clientId: 0,
        serviceId: 0,
        customServiceName: "",
        customPrice: "",
        appointmentDate: "",
        appointmentTime: "",
        eventLocation: "",
        numberOfPeople: 1,
        notes: "",
      });
    }
  }, [isCreateDaylogOpen]);
  const [editFormData, setEditFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    eventLocation: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: appointments, isLoading } = trpc.appointments.getAll.useWhatry();
  const { data: clients } = trpc.clients.list.useWhatry();
  const { data: services } = trpc.services.getAll.useWhatry();
  const { data: collections } = trpc.collections.getAll.useWhatry();
  const { data: downloadPermissions } = trpc.downloadControl.getAllPermissions.useWhatry();

  const toggleDownloadMutation = trpc.downloadControl.togglePermission.useMutation({
    onSuccess: () => {
      utils.downloadControl.getAllPermissions.invalidate();
      toast({
        title: "Download atualizado!",
        description: "Download permission changed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar download",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = trpc.appointments.updateStatus.useMutation({
    onSuccess: async (data, variables) => {
      await utils.appointments.getAll.invalidate();
      
      // Buscar agendamento atualizado para manter modal aberto com dados novos
      const updatedAppointments = await utils.appointments.getAll.fetch();
      const updated = updatedAppointments?.find(a => a.id === variables.id);
      if (updated) {
        setSelectedAppointment(updated);
      }
      
      toast({
        title: "Status atualizado!",
        description: "O status do agendamento foi alterado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      utils.appointments.getAll.invalidate();
      toast({
        title: "Appointment updated!",
        description: "Information saved successfully.",
      });
      setIsEditDaylogOpen(false);
      setSelectedAppointment(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      utils.appointments.getAll.invalidate();
      toast({
        title: "Appointment deleted!",
        description: "O agendamento foi removido com sucesso.",
      });
      setSelectedAppointment(null);
    },
    onError: (error) => {
      toast({
        title: "Error deleting",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createManualMutation = trpc.appointments.createManual.useMutation({
    onSuccess: () => {
      utils.appointments.getAll.invalidate();
      toast({
        title: "Appointment created!",
        description: "O agendamento manual foi criado com sucesso.",
      });
      setIsCreateDaylogOpen(false);
      setCreateFormData({
        clientId: 0,
        serviceId: 0,
        customServiceName: "",
        customPrice: "",
        appointmentDate: "",
        appointmentTime: "",
        eventLocation: "",
        numberOfPeople: 1,
        notes: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar agendamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: number, status: AppointmentStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    setEditFormData({
      appointmentDate: format(new Date(appointment.appointmentDate), "yyyy-MM-dd"),
      appointmentTime: appointment.appointmentTime || "",
      eventLocation: appointment.eventLocation || "",
      notes: appointment.notes || "",
    });
    setIsEditDaylogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedAppointment) return;

    const dateTime = new Date(`${editFormData.appointmentDate}T${editFormData.appointmentTime || '10:00'}:00`);

    updateMutation.mutate({
      id: selectedAppointment.id,
      appointmentDate: dateTime,
      appointmentTime: editFormData.appointmentTime,
      eventLocation: editFormData.eventLocation,
      notes: editFormData.notes,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusConfig = (status: AppointmentStatus) => {
    const configs = {
      pending: { label: '⏳ Pending', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
      confirmed: { label: '✅ Confirmado', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
      session_done: { label: '📸 Ensaio Realizado', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
      editing: { label: '🎨 Photos in Editing', color: 'bg-purple-500/20 text-purple-700 border-purple-500/30' },
      awaiting_selection: { label: '👀 Awaiting Selection', color: 'bg-orange-500/20 text-orange-700 border-orange-500/30' },
      final_editing: { label: '✏️ Editando Selecionadas', color: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30' },
      delivered: { label: '📦 Delivered', color: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' },
      cancelled: { label: '❌ Cancelled', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
    };
    return configs[status] || { label: status, color: 'bg-gray-500/20 text-gray-700' };
  };

  const getNextStatus = (currentStatus: AppointmentStatus): AppointmentStatus | null => {
    const workflow: AppointmentStatus[] = [
      'pending',
      'confirmed',
      'session_done',
      'editing',
      'awaiting_selection',
      'final_editing',
      'delivered'
    ];
    const currentIndex = workflow.indexOf(currentStatus);
    return currentIndex >= 0 && currentIndex < workflow.length - 1 ? workflow[currentIndex + 1] : null;
  };

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const appointmentsByDate = (appointments || []).reduce((acc, apt) => {
    const dateKey = format(new Date(apt.appointmentDate), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(apt);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Agendamentos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie o fluxo de trabalho complete dos agendamentos
          </p>
        </div>
        <div className="flex gap-3">
          {/* Toggle View Mode */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              Calendário
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              Lista
            </Button>
          </div>
          <Button onClick={() => setIsCreateDaylogOpen(true)} className="gap-2">
            <Calendar className="w-4 h-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-muted/30 rounded" />
            ))}

            {/* Calendar days */}
            {daysInMonth.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayAppointments = appointmentsByDate[dateKey] || [];
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  className={`h-24 border rounded p-1 overflow-y-auto ${
                    isToday ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.map((apt) => {
                      const statusConfig = getStatusConfig(apt.status);
                      return (
                        <button
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className={`w-full text-left text-xs px-1 py-0.5 rounded border ${statusConfig.color} hover:opacity-80 transition-opacity`}
                        >
                          <div className="flex items-center gap-1">
                            {apt.serviceType === "photography" && <Camera className="w-3 h-3 text-blue-600" />}
                            {apt.serviceType === "video" && <Video className="w-3 h-3 text-red-600" />}
                            {apt.serviceType === "both" && (
                              <>
                                <Camera className="w-3 h-3 text-purple-600" />
                                <Video className="w-3 h-3 text-purple-600" />
                              </>
                            )}
                            <div className="truncate font-medium flex-1">{apt.clientName}</div>
                          </div>
                          {apt.appointmentTime && (
                            <div className="text-xs opacity-75">{apt.appointmentTime}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Todos os Agendamentos</CardTitle>
              <div className="flex gap-3">
                {/* Busca */}
                <Input
                  placeholder="Buscar por cliente..."
                  value={searchTuem}
                  onChange={(e) => {
                    setSearchTuem(e.target.value);
                    setCurrentPage(1); // Resetar para first página
                  }}
                  className="w-64"
                />
                {/* Filtro de Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as AppointmentStatus | 'all');
                    setCurrentPage(1); // Resetar para first página
                  }}
                  className="border rounded px-3 py-2 bg-background"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✅ Confirmado</option>
                  <option value="session_done">📸 Ensaio Realizado</option>
                  <option value="editing">🎨 Photos in Editing</option>
                  <option value="awaiting_selection">👀 Awaiting Selection</option>
                  <option value="final_editing">✏️ Editando Selecionadas</option>
                  <option value="delivered">📦 Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : !appointments || appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                None agendamento encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Data/Hour</th>
                      <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                      <th className="text-left py-3 px-4 font-semibold">Service</th>
                      <th className="text-left py-3 px-4 font-semibold">Local</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Filtrar agendamentos
                      const filteredAppointments = appointments
                        .filter((apt) => {
                          // Filtro de busca por nome do cliente
                          const matchesSearch = searchTuem === '' || 
                            apt.clientName.toLowerCase().includes(searchTuem.toLowerCase());
                          
                          // Filtro de status
                          const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
                          
                          return matchesSearch && matchesStatus;
                        })
                        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

                      // Calcular paginação
                      const totalItems = filteredAppointments.length;
                      const totalPages = Math.ceil(totalItems / itemsPerPage);
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const endIndex = startIndex + itemsPerPage;
                      const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

                      return paginatedAppointments.map((apt) => {
                        const statusConfig = getStatusConfig(apt.status as AppointmentStatus);
                        const nextStatus = getNextStatus(apt.status as AppointmentStatus);
                        const nextStatusConfig = nextStatus ? getStatusConfig(nextStatus) : null;

                        return (
                          <tr 
                            key={apt.id} 
                            onClick={() => setSelectedAppointment(apt)}
                            className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {format(new Date(apt.appointmentDate), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {apt.appointmentTime || '10:00'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{apt.clientName || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span>{apt.customServiceName || apt.serviceName || 'N/A'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{apt.eventLocation || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-1 rounded text-xs border ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginação */}
            {appointments && appointments.length > 0 && (() => {
              const filteredAppointments = appointments
                .filter((apt) => {
                  const matchesSearch = searchTuem === '' || 
                    apt.clientName.toLowerCase().includes(searchTuem.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
                  return matchesSearch && matchesStatus;
                });

              const totalItems = filteredAppointments.length;
              const totalPages = Math.ceil(totalItems / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

              if (totalItems === 0) return null;

              return (
                <div className="mt-4 flex items-center justify-between">
                  {/* Contador */}
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1}-{endIndex} de {totalItems} agendamentos
                  </div>

                  {/* Controles de navegação */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      {/* Números de páginas */}
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show only 5 páginas por vez
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-10"
                              >
                                {page}
                              </Button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return <span key={page} className="px-2">...</span>;
                          }
                          return null;
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Selected Appointment Details with Tabs */}
      {selectedAppointment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>Agendamento</span>
                {selectedAppointment.serviceType === "photography" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    <Camera className="w-3 h-3" />
                    Photography
                  </span>
                )}
                {selectedAppointment.serviceType === "video" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                    <Video className="w-3 h-3" />
                    Video
                  </span>
                )}
                {selectedAppointment.serviceType === "both" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                    <Camera className="w-3 h-3" />
                    <Video className="w-3 h-3" />
                    Photo + Video
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {(() => {
                  // Find collection for this appointment to get album final link
                  const collection = collections?.find(c => c.appointmentId === selectedAppointment.id);
                  if (collection) {
                    return (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.location.href = `/admin/galleries/${collection.id}/album-final`}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Final Album
                      </Button>
                    );
                  }
                  return null;
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const galleryUrl = `${window.location.origin}/galeria-cliente/${selectedAppointment.id}`;
                    navigator.clipboard.writeText(galleryUrl);
                    toast({
                      title: "Link copied!",
                      description: "Envie este link para o cliente visualizar as fotos.",
                    });
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link Cliente
                </Button>
                {(() => {
                  // Find collection for this appointment
                  const collection = collections?.find(c => c.appointmentId === selectedAppointment.id);
                  if (!collection) return null;
                  
                  const permission = downloadPermissions?.find(p => p.collectionId === collection.id);
                  const isAllowed = permission?.allowDownload || false;
                  
                  return (
                    <Button
                      variant={isAllowed ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDownloadMutation.mutate({
                        collectionId: collection.id,
                        allowDownload: !isAllowed,
                      })}
                      className={isAllowed ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {isAllowed ? (
                        <><Unlock className="w-4 h-4 mr-2" /> Download Liberado</>
                      ) : (
                        <><Lock className="w-4 h-4 mr-2" /> Download Bloqueado</>
                      )}
                    </Button>
                  );
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(selectedAppointment)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(selectedAppointment.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="photography">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Photography
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
            {/* Service Name - Destacado */}
            {(selectedAppointment.customServiceName || selectedAppointment.serviceName) && (
              <div className="p-4 bg-accent/10 border-l-4 border-accent rounded">
                <div className="text-sm text-muted-foreground mb-1">Service Photographer</div>
                <div className="text-xl font-bold text-accent">{selectedAppointment.customServiceName || selectedAppointment.serviceName}</div>
                {selectedAppointment.servicePrice && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Base price: {formatCurrency(selectedAppointment.servicePrice)}
                  </div>
                )}
              </div>
            )}

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="w-4 h-4" />
                  Cliente
                </div>
                <div className="font-semibold">{selectedAppointment.clientName}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
                <div className="font-semibold">{selectedAppointment.clientEmail}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Phone className="w-4 h-4" />
                  Telefone
                </div>
                <div className="font-semibold">{selectedAppointment.clientPhone}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  Data
                </div>
                <div className="font-semibold">
                  {format(new Date(selectedAppointment.appointmentDate), "dd/MM/yyyy")}
                  {selectedAppointment.appointmentTime && ` at ${selectedAppointment.appointmentTime}`}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {(selectedAppointment.eventLocation || selectedAppointment.numberOfPeople || selectedAppointment.estimatedDuration) && (
              <div className="grid grid-cols-3 gap-4">
                {selectedAppointment.eventLocation && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4" />
                      Local
                    </div>
                    <div className="text-sm">{selectedAppointment.eventLocation}</div>
                  </div>
                )}
                {selectedAppointment.numberOfPeople && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      Pessoas
                    </div>
                    <div className="text-sm">{selectedAppointment.numberOfPeople}</div>
                  </div>
                )}
                {selectedAppointment.estimatedDuration && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Timer className="w-4 h-4" />
                      Duration
                    </div>
                    <div className="text-sm">{selectedAppointment.estimatedDuration}</div>
                  </div>
                )}
              </div>
            )}

            {selectedAppointment.notes && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Notes</div>
                <div className="p-3 bg-muted rounded text-sm">{selectedAppointment.notes}</div>
              </div>
            )}

            {/* Workflow Timeline */}
            <div>
              <h3 className="font-semibold mb-4">Fluxo de Trabalho</h3>
              <div className="space-y-2">
                {[
                  'pending',
                  'confirmed',
                  'session_done',
                  'editing',
                  'awaiting_selection',
                  'final_editing',
                  'delivered'
                ].map((status) => {
                  const statusConfig = getStatusConfig(status as AppointmentStatus);
                  const isCurrent = selectedAppointment.status === status;
                  const isPast = [
                    'pending',
                    'confirmed',
                    'session_done',
                    'editing',
                    'awaiting_selection',
                    'final_editing',
                    'delivered'
                  ].indexOf(selectedAppointment.status) > [
                    'pending',
                    'confirmed',
                    'session_done',
                    'editing',
                    'awaiting_selection',
                    'final_editing',
                    'delivered'
                  ].indexOf(status);

                  return (
                    <div
                      key={status}
                      className={`flex items-center gap-3 p-3 rounded border ${
                        isCurrent
                          ? statusConfig.color + ' border-2'
                          : isPast
                          ? 'bg-muted/30 border-muted text-muted-foreground'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex-1 font-medium">{statusConfig.label}</div>
                      {isCurrent && getNextStatus(selectedAppointment.status) && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(
                            selectedAppointment.id,
                            getNextStatus(selectedAppointment.status)!
                          )}
                          disabled={updateStatusMutation.isPending}
                        >
                          Avançar
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

                {/* Thuck Actions */}
                {selectedAppointment.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1"
                    >
                      ✅ Aprovar Agendamento
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled')}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1"
                    >
                      ❌ Recusar
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="photography" className="space-y-6">
                <GalleryTabContent appointmentId={selectedAppointment.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Payment Manager - Always visible when appointment is selected */}
      {selectedAppointment && (
        <PaymentManager
          appointmentId={selectedAppointment.id}
          clientEmail={selectedAppointment.clientEmail}
          clientName={selectedAppointment.clientName}
          finalPrice={selectedAppointment.finalPrice || 0}
        />
      )}

      {/* Edit Daylog */}
      <Daylog open={isEditDaylogOpen} onOpenChange={setIsEditDaylogOpen}>
        <DaylogContent>
          <DaylogHeader>
            <DaylogTitle>Editar Agendamento</DaylogTitle>
          </DaylogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Data</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editFormData.appointmentDate}
                  onChange={(e) => setEditFormData({ ...editFormData, appointmentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editFormData.appointmentTime}
                  onChange={(e) => setEditFormData({ ...editFormData, appointmentTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-location">Local</Label>
              <Input
                id="edit-location"
                value={editFormData.eventLocation}
                onChange={(e) => setEditFormData({ ...editFormData, eventLocation: e.target.value })}
                placeholder="Event location"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDaylogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DaylogContent>
      </Daylog>

      {/* Create Manual Appointment Daylog */}
      <Daylog open={isCreateDaylogOpen} onOpenChange={setIsCreateDaylogOpen}>
        <DaylogContent className="max-w-2xl">
          <DaylogHeader>
            <DaylogTitle>Novo Agendamento Manual</DaylogTitle>
          </DaylogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-client">Cliente *</Label>
              <select
                id="create-client"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={createFormData.clientId}
                onChange={(e) => {
                  const newClientId = Number(e.target.value);
                  console.log("Cliente selecionado:", newClientId);
                  setCreateFormData({ ...createFormData, clientId: newClientId });
                }}
              >
                <option value={0}>Select um cliente</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="create-service">Service</Label>
              <select
                id="create-service"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={createFormData.serviceId}
                onChange={(e) => {
                  const svcId = Number(e.target.value);
                  if (svcId) {
                    const svc = services?.find(s => s.id === svcId);
                    setCreateFormData({ 
                      ...createFormData, 
                      serviceId: svcId,
                      customServiceName: svc?.name || "",
                      customPrice: svc?.price ? String(svc.price / 100) : "",
                    });
                  } else {
                    setCreateFormData({ ...createFormData, serviceId: 0 });
                  }
                }}
              >
                <option value={0}>Select a service (optional)</option>
                {services?.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-3 bg-accent/5 border border-dashed border-accent/30 rounded-lg space-y-3">
              <p className="text-xs text-muted-foreground font-medium">Customise service e valor (aboutscreve o service selecionado above)</p>
              <div>
                <Label htmlFor="create-custom-service">Description do Service</Label>
                <Input
                  id="create-custom-service"
                  placeholder="Ex: Fotos Sensual, Ensaio Gestante..."
                  value={createFormData.customServiceName}
                  onChange={(e) => setCreateFormData({ ...createFormData, customServiceName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="create-custom-price">Valor (£)</Label>
                <Input
                  id="create-custom-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 540.00"
                  value={createFormData.customPrice}
                  onChange={(e) => setCreateFormData({ ...createFormData, customPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-date">Data *</Label>
                <Input
                  id="create-date"
                  type="date"
                  value={createFormData.appointmentDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, appointmentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="create-time">Time</Label>
                <Input
                  id="create-time"
                  type="time"
                  value={createFormData.appointmentTime}
                  onChange={(e) => setCreateFormData({ ...createFormData, appointmentTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="create-location">Local do Evento</Label>
              <Input
                id="create-location"
                value={createFormData.eventLocation}
                onChange={(e) => setCreateFormData({ ...createFormData, eventLocation: e.target.value })}
                placeholder="Address do evento"
              />
            </div>

            <div>
              <Label htmlFor="create-people">Número de Pessoas</Label>
              <Input
                id="create-people"
                type="number"
                min={1}
                value={createFormData.numberOfPeople}
                onChange={(e) => setCreateFormData({ ...createFormData, numberOfPeople: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="create-notes">Notes</Label>
              <Textarea
                id="create-notes"
                value={createFormData.notes}
                onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
                rows={3}
                placeholder="Details adicionais about o agendamento"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDaylogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  console.log("Form data:", createFormData);
                  
                  if (!createFormData.clientId || !createFormData.appointmentDate) {
                    toast({
                      title: "Required fields",
                      description: "Select um cliente e uma data.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // Ensure que a data is no formato correto
                  const dateStr = createFormData.appointmentDate;
                  const appointmentDate = dateStr.includes("T") 
                    ? new Date(dateStr)
                    : new Date(dateStr + "T00:00:00");
                  
                  createManualMutation.mutate({
                    clientId: createFormData.clientId,
                    serviceId: createFormData.serviceId || undefined,
                    customServiceName: createFormData.customServiceName || undefined,
                    customPrice: createFormData.customPrice ? Number(createFormData.customPrice) : undefined,
                    appointmentDate,
                    appointmentTime: createFormData.appointmentTime || undefined,
                    eventLocation: createFormData.eventLocation || undefined,
                    numberOfPeople: createFormData.numberOfPeople,
                    notes: createFormData.notes || undefined,
                  });
                }}
                disabled={createManualMutation.isPending}
                className="flex-1"
              >
                {createManualMutation.isPending ? "Creating..." : "Criar Agendamento"}
              </Button>
            </div>
          </div>
        </DaylogContent>
      </Daylog>

      {/* Payment Link Daylog */}
      <SendPaymentLinkDaylog
        appointment={selectedAppointment}
        open={isPaymentDaylogOpen}
        onOpenChange={setIsPaymentDaylogOpen}
      />
    </div>
  );
}
