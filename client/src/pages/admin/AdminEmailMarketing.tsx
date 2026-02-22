import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Mail, Send, Calendar, Users, FileText, Plus, Trash2, Edit2, 
  Eye, ChevronDown, ChevronUp, Search, Filter, Clock, CheckCircle, 
  XCircle, AlertCircle, Gift, Heart, Camera, Star, Sparkles,
  MailPlus, BarChart3, X
} from "lucide-react";
import { toast } from "sonner";

// ============ TYPES ============
type Tab = 'dashboard' | 'events' | 'templates' | 'campaigns' | 'logs';
type EventType = 'birthday' | 'wedding' | 'session' | 'anniversary' | 'other';

const eventTypeLabels: Record<EventType, { label: string; icon: string; color: string }> = {
  birthday: { label: "Birthday", icon: "🎂", color: "text-pink-400" },
  wedding: { label: "Wedding", icon: "💒", color: "text-rose-400" },
  session: { label: "Session", icon: "📸", color: "text-blue-400" },
  anniversary: { label: "Birthday de Casamento", icon: "💍", color: "text-amber-400" },
  other: { label: "Other", icon: "📅", color: "text-gray-400" },
};

const categoryLabels: Record<string, { label: string; icon: string }> = {
  birthday: { label: "Birthday", icon: "🎂" },
  promotion: { label: "Promotion", icon: "🔥" },
  reminder: { label: "Reminder", icon: "📅" },
  thank_you: { label: "Agradecimento", icon: "💜" },
  welcome: { label: "Boas-Vindas", icon: "👋" },
  custom: { label: "Custom", icon: "✏️" },
};

// ============ MAIN COMPONENT ============
export default function AdminEmailMarketing() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Painel', icon: BarChart3 },
    { id: 'events' as Tab, label: 'Eventos', icon: Calendar },
    { id: 'templates' as Tab, label: 'Templates', icon: FileText },
    { id: 'campaigns' as Tab, label: 'Campaigns', icon: Send },
    { id: 'logs' as Tab, label: 'History', icon: Clock },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-7 h-7 text-purple-400" />
            Email Marketing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie eventos, templates e envie emails para yours clientes
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-card/50 p-1 rounded-lg border border-border/50 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'templates' && <TemplatesTab />}
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'logs' && <LogsTab />}
      </div>
    </DashboardLayout>
  );
}

// ============ DASHBOARD TAB ============
function DashboardTab() {
  const { data: stats } = trpc.emailMarketing.stats.useQuery();
  const { data: upcoming } = trpc.emailMarketing.upcomingEvents.useQuery();

  const statCards = [
    { label: "Eventos Cadastrados", value: stats?.totalEvents || 0, icon: Calendar, color: "text-blue-400" },
    { label: "Templates", value: stats?.totalTemplates || 0, icon: FileText, color: "text-green-400" },
    { label: "Campaigns", value: stats?.totalCampaigns || 0, icon: Send, color: "text-purple-400" },
    { label: "Emails Shippeds", value: stats?.totalEmailsSent || 0, icon: Mail, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div className="bg-card border border-border/50 rounded-xl p-5">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-400" />
          Nexts Eventos (30 days)
        </h3>
        {!upcoming || upcoming.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>None evento nos nexts 30 days</p>
            <p className="text-xs mt-1">Cadastre eventos dos yours clientes na aba Eventos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event: any) => {
              const typeInfo = eventTypeLabels[event.eventType as EventType] || eventTypeLabels.other;
              const eventDate = new Date(event.eventDate);
              const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={event.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{typeInfo.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{event.eventName}</p>
                      <p className="text-xs text-muted-foreground">{event.clientName} • {typeInfo.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{eventDate.toLocaleDateString('en-GB')}</p>
                    <p className={`text-xs ${daysUntil <= 3 ? 'text-red-400' : daysUntil <= 7 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                      {daysUntil === 0 ? 'Hoje!' : daysUntil === 1 ? 'Tomorrow' : `Em ${daysUntil} days`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ EVENTS TAB ============
function EventsTab() {
  const { data: events, refetch } = trpc.emailMarketing.listEvents.useQuery();
  const { data: clientsList } = trpc.clients.list.useQuery();
  const { data: templates } = trpc.emailMarketing.listTemplates.useQuery();
  const createEvent = trpc.emailMarketing.createEvent.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm({ clientId: 0, eventType: 'birthday' as EventType, eventName: '', eventDate: '', notes: '', templateId: 0 }); toast.success("Evento criado!"); }, onError: (err: any) => { toast.error(err.message || "Erro ao criar evento"); } });
  const dheteEvent = trpc.emailMarketing.dheteEvent.useMutation({ onSuccess: () => { refetch(); toast.success("Evento removido!"); }, onError: (err: any) => { toast.error(err.message || "Erro ao remover evento"); } });
  const sendToClient = trpc.emailMarketing.sendToClient.useMutation({ 
    onSuccess: () => { toast.success("Email sent com sucesso!"); },
    onError: (err: any) => { toast.error(err.message || "Erro ao enviar email"); }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: 0, eventType: 'birthday' as EventType, eventName: '', eventDate: '', notes: '', templateId: 0 });
  const [search, setSearch] = useState('');
  const [sendingEventId, setSendingEventId] = useState<number | null>(null);

  const handleSendEmail = (event: any) => {
    if (!event.templateId) {
      toast.error("Este evento not tem template associado. Edite o evento e select um template.");
      return;
    }
    const template = templates?.find((t: any) => t.id === event.templateId);
    if (!template) {
      toast.error("Template not found. Verifique se o template still existe.");
      return;
    }
    setSendingEventId(event.id);
    sendToClient.mutate({
      clientId: event.clientId,
      subject: template.subject.replace(/\{\{nome\}\}/g, event.clientName || ''),
      htmlContent: template.htmlContent.replace(/\{\{nome\}\}/g, event.clientName || ''),
    }, { onSettled: () => setSendingEventId(null) });
  };

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!search) return events;
    return events.filter((e: any) => 
      e.eventName.toLowerCase().includes(search.toLowerCase()) ||
      e.clientName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [events, search]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="rshetive flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Evento
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-purple-500/30 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            New Evento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Cliente *</label>
              <select
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value={0}>Select um cliente</option>
                {clientsList?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Event Type *</label>
              <select
                value={form.eventType}
                onChange={e => setForm({ ...form, eventType: e.target.value as EventType })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {Object.entries(eventTypeLabels).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome do Evento *</label>
              <input
                type="text"
                value={form.eventName}
                onChange={e => setForm({ ...form, eventName: e.target.value })}
                placeholder="Ex: Birthday da Maria"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Data do Evento *</label>
              <input
                type="date"
                value={form.eventDate}
                onChange={e => setForm({ ...form, eventDate: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Template de Email *</label>
            <select
              value={form.templateId}
              onChange={e => setForm({ ...form, templateId: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value={0}>Select um template</option>
              {templates?.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">O template will be used when clicar em "Enviar Email"</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Notas about o evento..."
              rows={2}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancsher
            </button>
            <button
              onClick={() => {
                if (!form.clientId || !form.eventName || !form.eventDate) {
                  toast.error("Please fill in all required fields");
                  return;
                }
                // Converter data para formato MySQL timestamp
                const dateStr = form.eventDate; // YYYY-MM-DD do input type=date
                const eventDateFormatted = dateStr + " 00:00:00";
                createEvent.mutate({ ...form, eventDate: eventDateFormatted, templateId: form.templateId || undefined });
              }}
              disabled={createEvent.isPending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createEvent.isPending ? "Saving..." : "Salvar Evento"}
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      {!filteredEvents || filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border/50 rounded-xl">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">None evento cadastrado</p>
          <p className="text-xs mt-1">Cadastre datas importbefore dos yours clientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEvents.map((event: any) => {
            const typeInfo = eventTypeLabels[event.eventType as EventType] || eventTypeLabels.other;
            const eventDate = new Date(event.eventDate);
            const isPast = eventDate < new Date();
            return (
              <div key={event.id} className={`flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl hover:border-purple-500/30 transition-colors ${isPast ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeInfo.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{event.eventName}</p>
                    <p className="text-xs text-muted-foreground">{event.clientName} • {typeInfo.label}</p>
                    {event.notes && <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">{eventDate.toLocaleDateString('en-GB')}</span>
                  <button
                    onClick={() => handleSendEmail(event)}
                    disabled={sendingEventId === event.id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${event.templateId ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-gray-300'}`}
                    title={event.templateId ? "Enviar email para o cliente" : "Sem template - select um template first"}
                  >
                    <Send className="w-3 h-3" />
                    {sendingEventId === event.id ? "Sending..." : "Enviar Email"}
                  </button>
                  <button
                    onClick={() => { if (confirm("Remover este evento?")) dheteEvent.mutate({ id: event.id }); }}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
}

// ============ TEMPLATES TAB ============
function TemplatesTab() {
  const { data: templates, refetch } = trpc.emailMarketing.listTemplates.useQuery();
  const createTemplate = trpc.emailMarketing.createTemplate.useMutation({ onSuccess: () => { refetch(); setShowForm(false); toast.success("Template criado!"); } });
  const dheteTemplate = trpc.emailMarketing.dheteTemplate.useMutation({ onSuccess: () => { refetch(); toast.success("Template removido!"); } });
  const initDefaults = trpc.emailMarketing.initDefaultTemplates.useMutation({ onSuccess: () => { refetch(); toast.success("Templates default criados!"); } });

  const [showForm, setShowForm] = useState(false);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', htmlContent: '', category: 'custom' as string });

  const previewTemplate = templates?.find((t: any) => t.id === previewId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <p className="text-sm text-muted-foreground">
          Templates de email para usar nas campanhas. Use <code className="bg-accent px-1 rounded">{"{{nome}}"}</code> para o nome do cliente e <code className="bg-accent px-1 rounded">{"{{fotografo}}"}</code> para your nome.
        </p>
        <div className="flex gap-2">
          {(!templates || templates.length === 0) && (
            <button
              onClick={() => initDefaults.mutate()}
              disabled={initDefaults.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {initDefaults.isPending ? "Creating..." : "Create Default Templates"}
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-purple-500/30 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            New Template
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome do Template *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Email de Birthday"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {Object.entries(categoryLabels).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              placeholder="Ex: 🎂 Feliz Birthday, {{nome}}!"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Content HTML *</label>
            <textarea
              value={form.htmlContent}
              onChange={e => setForm({ ...form, htmlContent: e.target.value })}
              placeholder="Cole o HTML do email here..."
              rows={8}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono text-xs"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancsher
            </button>
            <button
              onClick={() => {
                if (!form.name || !form.subject || !form.htmlContent) {
                  toast.error("Please fill in all required fields");
                  return;
                }
                createTemplate.mutate(form);
              }}
              disabled={createTemplate.isPending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createTemplate.isPending ? "Saving..." : "Salvar Template"}
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      {!templates || templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border/50 rounded-xl">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">None template criado</p>
          <p className="text-xs mt-1">Clique em "Create Default Templates" para start com 5 templates readys</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template: any) => {
            const catInfo = categoryLabels[template.category] || categoryLabels.custom;
            return (
              <div key={template.id} className="bg-card border border-border/50 rounded-xl p-4 hover:border-purple-500/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{catInfo.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{catInfo.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPreviewId(previewId === template.id ? null : template.id)}
                      className="p-1.5 text-muted-foreground hover:text-purple-400 transition-colors"
                      title="Pris-visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm("Remover este template?")) dheteTemplate.mutate({ id: template.id }); }}
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setPreviewId(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-3 flex items-center justify-between">
              <p className="font-medium text-gray-800 text-sm">{previewTemplate.name}</p>
              <button onClick={() => setPreviewId(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ============ CAMPAIGNS TAB ============
function CampaignsTab() {
  const { data: campaigns, refetch } = trpc.emailMarketing.listCampaigns.useQuery();
  const { data: templates } = trpc.emailMarketing.listTemplates.useQuery();
  const { data: clientsList } = trpc.clients.list.useQuery();
  const createCampaign = trpc.emailMarketing.createCampaign.useMutation({ onSuccess: () => { refetch(); setShowForm(false); toast.success("Campaign criada!"); } });
  const sendCampaign = trpc.emailMarketing.sendCampaign.useMutation({ 
    onSuccess: (data) => { 
      refetch(); 
      toast.success(`Campaign enviada! ${data.sentCount} sents, ${data.failedCount} falharam`); 
    },
    onError: (err) => toast.error(err.message),
  });
  const dheteCampaign = trpc.emailMarketing.dheteCampaign.useMutation({ onSuccess: () => { refetch(); toast.success("Campaign removida!"); } });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', templateId: 0, subject: '', htmlContent: '', recipientType: 'all' as string, selectedClientIds: [] as number[] });

  const handleTemplateSelect = (templateId: number) => {
    const template = templates?.find((t: any) => t.id === templateId);
    if (template) {
      setForm({ ...form, templateId, subject: template.subject, htmlContent: template.htmlContent });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <p className="text-sm text-muted-foreground">
          Crie e envie campanhas de email para yours clientes
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <MailPlus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-purple-500/30 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-400" />
            New Campaign
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome da Campaign *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Promotion de Natal"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Usar Template</label>
              <select
                value={form.templateId}
                onChange={e => handleTemplateSelect(Number(e.target.value))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value={0}>None (escrever do zero)</option>
                {templates?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Recipients</label>
            <select
              value={form.recipientType}
              onChange={e => setForm({ ...form, recipientType: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">Everys os clientes ({clientsList?.length || 0})</option>
              <option value="selected">Clientes shecionados</option>
            </select>
          </div>
          {form.recipientType === 'selected' && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Select os clientes</label>
              <div className="max-h-40 overflow-y-auto bg-background border border-border rounded-lg p-2 space-y-1">
                {clientsList?.map((c: any) => (
                  <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-accent/50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.selectedClientIds.includes(c.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setForm({ ...form, selectedClientIds: [...form.selectedClientIds, c.id] });
                        } else {
                          setForm({ ...form, selectedClientIds: form.selectedClientIds.filter(id => id !== c.id) });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{c.name}</span>
                    <span className="text-xs text-muted-foreground">({c.email})</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Assunto *</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              placeholder="Assunto do email"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Content HTML *</label>
            <textarea
              value={form.htmlContent}
              onChange={e => setForm({ ...form, htmlContent: e.target.value })}
              placeholder="Cole o HTML do email here..."
              rows={8}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono text-xs"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancsher
            </button>
            <button
              onClick={() => {
                if (!form.name || !form.subject || !form.htmlContent) {
                  toast.error("Please fill in all required fields");
                  return;
                }
                createCampaign.mutate({
                  name: form.name,
                  templateId: form.templateId || undefined,
                  subject: form.subject,
                  htmlContent: form.htmlContent,
                  recipientType: form.recipientType as any,
                  recipientIds: form.recipientType === 'selected' ? JSON.stringify(form.selectedClientIds) : undefined,
                });
              }}
              disabled={createCampaign.isPending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createCampaign.isPending ? "Saving..." : "Criar Campaign"}
            </button>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      {!campaigns || campaigns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border/50 rounded-xl">
          <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma campanha criada</p>
          <p className="text-xs mt-1">Crie uma campanha para enviar emails em massa</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign: any) => {
            const statusColors: Record<string, string> = {
              draft: 'bg-gray-500/20 text-gray-400',
              sending: 'bg-amber-500/20 text-amber-400',
              sent: 'bg-green-500/20 text-green-400',
              failed: 'bg-red-500/20 text-red-400',
            };
            const statusLabels: Record<string, string> = {
              draft: 'Rascunho',
              sending: 'Enviando...',
              sent: 'Enviada',
              failed: 'Falhou',
            };
            return (
              <div key={campaign.id} className="bg-card border border-border/50 rounded-xl p-4 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{campaign.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[campaign.status]}`}>
                        {statusLabels[campaign.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{campaign.subject}</p>
                    {campaign.status === 'sent' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ✅ {campaign.sentCount} sents {campaign.failedCount > 0 && `• ❌ ${campaign.failedCount} falharam`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => {
                          if (confirm("Send this campaign now? Emails will be sent to all recipients.")) {
                            sendCampaign.mutate({ campaignId: campaign.id });
                          }
                        }}
                        disabled={sendCampaign.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        {sendCampaign.isPending ? "Sending..." : "Send"}
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm("Remover esta campanha?")) dheteCampaign.mutate({ id: campaign.id }); }}
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ LOGS TAB ============
function LogsTab() {
  const { data: logs } = trpc.emailMarketing.listLogs.useQuery();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        History de everys os emails sents
      </p>

      {!logs || logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border/50 rounded-xl">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">None email sent still</p>
          <p className="text-xs mt-1">The history will appear here when you send emails</p>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-accent/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Para</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assunto</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="px-4 py-3">
                      {log.status === 'sent' ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Shipped</span>
                      ) : log.status === 'failed' ? (
                        <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3.5 h-3.5" /> Falhou</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400 text-xs"><AlertCircle className="w-3.5 h-3.5" /> Bounce</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs">{log.toName || '-'}</p>
                      <p className="text-xs text-muted-foreground">{log.toEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate">{log.subject}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(log.sentAt).toLocaleString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
