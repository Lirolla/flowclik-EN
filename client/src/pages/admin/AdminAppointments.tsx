import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { enGB } from "date-fns/locale";
import DashboardLayout from "@/components/DashboardLayout";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import SendPaymentLinkDialog from "@/components/SendPaymentLinkDialog";
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

// Component for photography tab
function GalleryTabContent({ appointmentId }: { appointmentId: number }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: galleryData } = trpc.sessionGallery.getByAppointment.useQuery(
    { appointmentId },
    { enabled: !!appointmentId }
  );

  const createGalleryMutation = trpc.sessionGallery.createForAppointment.useMutation({
    onSuccess: () => {
      toast({
        title: "Gallery created!",
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
    const link = `${window.location.origin}/client-gallery/${appointmentId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Send this link to the client to access the photos.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!galleryData) {
    return (
      <div className="text-center py-8">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">
          No galleries created yet
        </h3>
        <p className="text-muted-foreground mb-6">
          Create a private gallery to upload the session photos
        </p>
        <Button onClick={handleCreateGallery}>
          Create Gallery
        </Button>
      </div>
    );
  }

  const clientLink = `${window.location.origin}/client-gallery/${appointmentId}`;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{galleryData.photosCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Client Favourites
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
          <CardTitle>Photo Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Use the <strong>Galleries</strong> page to upload the session photos
            </p>
            <Button asChild>
              <a href={`/admin/galleries/${galleryData.id}/upload`}>
                Go to Gallery Upload
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Tip: Select the gallery "{galleryData.name}" when uploading
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreateDialogOpen) {
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
  }, [isCreateDialogOpen]);
  const [editFormData, setEditFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    eventLocation: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: appointments, isLoading } = trpc.appointments.getAll.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: services } = trpc.services.getAll.useQuery();
  const { data: collections } = trpc.collections.getAll.useQuery();
  const { data: downloadPermissions } = trpc.downloadControl.getAllPermissions.useQuery();

  const toggleDownloadMutation = trpc.downloadControl.togglePermission.useMutation({
    onSuccess: () => {
      utils.downloadControl.getAllPermissions.invalidate();
      toast({
        title: "Download updated!",
        description: "Download permission changed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating download",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = trpc.appointments.updateStatus.useMutation({
    onSuccess: async (data, variables) => {
      await utils.appointments.getAll.invalidate();
      
      // Fetch updated booking para manter modal aberto com dados news
      const updatedAppointments = await utils.appointments.getAll.fetch();
      const updated = updatedAppointments?.find(a => a.id === variables.id);
      if (updated) {
        setSelectedAppointment(updated);
      }
      
      toast({
        title: "Status updated!",
        description: "The booking status has been changed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating status",
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
      setIsEditDialogOpen(false);
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
        description: "The booking has been removed successfully.",
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
        description: "The manual booking has been created successfully.",
      });
      setIsCreateDialogOpen(false);
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
        title: "Error creating booking",
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
    setIsEditDialogOpen(true);
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
    if (confirm("Are you sure you want to delete this booking?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusConfig = (status: AppointmentStatus) => {
    const configs = {
      pending: { label: '⏳ Pending', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
      confirmed: { label: '✅ Confirmed', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
      session_done: { label: '📸 Session Done', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
      editing: { label: '🎨 Photos in Editing', color: 'bg-purple-500/20 text-purple-700 border-purple-500/30' },
      awaiting_selection: { label: '👀 Awaiting Selection', color: 'bg-orange-500/20 text-orange-700 border-orange-500/30' },
      final_editing: { label: '✏️ Editing Selected', color: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30' },
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
            Bookings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage the complete booking workflow
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
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Calendar className="w-4 h-4" />
            New Booking
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
              {format(currentMonth, "MMMM yyyy", { locale: enGB })}
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
              const isEveryy = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  className={`h-24 border rounded p-1 overflow-y-auto ${
                    isEveryy ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isEveryy ? 'text-primary' : ''}`}>
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
              <CardTitle>All Bookings</CardTitle>
              <div className="flex gap-3">
                {/* Search */}
                <Input
                  placeholder="Search by client..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="w-64"
                />
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as AppointmentStatus | 'all');
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="border rounded px-3 py-2 bg-background"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="session_done">📸 Session Done</option>
                  <option value="editing">🎨 Photos in Editing</option>
                  <option value="awaiting_selection">👀 Awaiting Selection</option>
                  <option value="final_editing">✏️ Editing Selected</option>
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
                No bookings found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Date/Time</th>
                      <th className="text-left py-3 px-4 font-semibold">Client</th>
                      <th className="text-left py-3 px-4 font-semibold">Service</th>
                      <th className="text-left py-3 px-4 font-semibold">Location</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Filtrar agendamentos
                      const filteredAppointments = appointments
                        .filter((apt) => {
                          // Search filter by client name
                          const matchesSearch = searchTerm === '' || 
                            apt.clientName.toLowerCase().includes(searchTerm.toLowerCase());
                          
                          // Status filter
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
                                  {format(new Date(apt.appointmentDate), "dd/MM/yyyy", { locale: enGB })}
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
                  const matchesSearch = searchTerm === '' || 
                    apt.clientName.toLowerCase().includes(searchTerm.toLowerCase());
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
                  {/* Counter */}
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{endIndex} of {totalItems} bookings
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

                      {/* Page numbers */}
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show only 5 pages at a time
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
                    const galleryUrl = `${window.location.origin}/client-gallery/${selectedAppointment.id}`;
                    navigator.clipboard.writeText(galleryUrl);
                    toast({
                      title: "Link copied!",
                      description: "Send this link to the client to view the photos.",
                    });
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Client Link
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
                        <><Unlock className="w-4 h-4 mr-2" /> Download Enabled</>
                      ) : (
                        <><Lock className="w-4 h-4 mr-2" /> Download Blocked</>
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
                <div className="text-sm text-muted-foreground mb-1">Photography Service</div>
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
                  Phone
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
                      People
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
                          Next
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
                      ❌ Decline
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Date</Label>
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
              <Label htmlFor="edit-location">Location</Label>
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
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
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
        </DialogContent>
      </Dialog>

      {/* Create Manual Appointment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Manual Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-client">Client *</Label>
              <select
                id="create-client"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={createFormData.clientId}
                onChange={(e) => {
                  const newClientId = Number(e.target.value);
                  console.log("Client selected:", newClientId);
                  setCreateFormData({ ...createFormData, clientId: newClientId });
                }}
              >
                <option value={0}>Select a client</option>
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
              <p className="text-xs text-muted-foreground font-medium">Customise service and price (overrides the selected service above)</p>
              <div>
                <Label htmlFor="create-custom-service">Service Description</Label>
                <Input
                  id="create-custom-service"
                  placeholder="Ex: Senior Photos, Maternity Shoot..."
                  value={createFormData.customServiceName}
                  onChange={(e) => setCreateFormData({ ...createFormData, customServiceName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="create-custom-price">Price (£)</Label>
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
                <Label htmlFor="create-date">Date *</Label>
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
              <Label htmlFor="create-location">Event Location</Label>
              <Input
                id="create-location"
                value={createFormData.eventLocation}
                onChange={(e) => setCreateFormData({ ...createFormData, eventLocation: e.target.value })}
                placeholder="Event address"
              />
            </div>

            <div>
              <Label htmlFor="create-people">Number of People</Label>
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
                placeholder="Additional details about the booking"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log("Form data:", createFormData);
                  
                  if (!createFormData.clientId || !createFormData.appointmentDate) {
                    toast({
                      title: "Required fields",
                      description: "Please select a client and a date.",
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
                {createManualMutation.isPending ? "Creating..." : "Create Booking"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Link Dialog */}
      <SendPaymentLinkDialog
        appointment={selectedAppointment}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
      />
    </div>
  );
}
