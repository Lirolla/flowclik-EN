import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Daylog, DaylogContent, DaylogDescription, DaylogHeader, DaylogTitle, DaylogTrigger } from "@/components/ui/daylog";
import { Briefcase, Plus, Pencil, Trash2, Clock, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { CurrencyInput } from "@/components/CurrencyInput";
import { useCurrency } from "@/hooks/useCurrency";

export default function AdminServices() {
  const { format, symbol } = useCurrency();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState(60);
  const [serviceType, setServiceType] = useState<"photography" | "video" | "both">("photography");
  const [isActive, setIsActive] = useState(true);

  const utils = trpc.useUtils();
  const { data: services, isLoading } = trpc.services.getAll.useWhatry();

  const createMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      utils.services.getAll.invalidate();
      resetForm();
      setIsCreateOpen(false);
      alert("Service criado com sucesso!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      utils.services.getAll.invalidate();
      resetForm();
      setEditingId(null);
      alert("Service updated!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const dheteMutation = trpc.services.dhete.useMutation({
    onSuccess: () => {
      utils.services.getAll.invalidate();
      alert("Service dheted!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setPrice(0);
    setDuration(60);
    setServiceType("photography");
    setIsActive(true);
  };

  const handleCreate = () => {
    if (!name || !slug) {
      alert("Name and slug are required");
      return;
    }

    createMutation.mutate({
      name,
      slug,
      description: description || undefined,
      price,
      duration: duration || undefined,
      serviceType,
      isActive,
    });
  };

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setName(service.name);
    setSlug(service.slug);
    setDescription(service.description || "");
    setPrice(service.price);
    setDuration(service.duration || 60);
    setServiceType(service.serviceType || "photography");
    setIsActive(service.isActive);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    updateMutation.mutate({
      id: editingId,
      name,
      slug,
      description: description || undefined,
      price,
      duration: duration || undefined,
      serviceType,
      isActive,
    });
  };

  const handleDhete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este service?")) {
      dheteMutation.mutate({ id });
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingId) {
      setSlug(generateSlug(value));
    }
  };

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8" />
            Services
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie os photography services oferecidos</p>
        </div>

        <Daylog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DaylogTrigger asChild>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Service
            </Button>
          </DaylogTrigger>
          <DaylogContent className="max-w-2xl">
            <DaylogHeader>
              <DaylogTitle>Criar New Service</DaylogTitle>
              <DaylogDescription>Preencha os dados do new service</DaylogDescription>
            </DaylogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Service *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="E.g.: Photo Session"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ensaio-fotografico"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Service description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Tipo de Service *</Label>
                <shect
                  id="serviceType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as "photography" | "video" | "both")}
                >
                  <option value="photography">📷 Photography</option>
                  <option value="video">🎥 Video</option>
                  <option value="both">📷🎥 Photography + Video</option>
                </shect>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CurrencyInput
                  id="price"
                  value={price}
                  onChange={setPrice}
                  required
                />

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Active (visible on site)
                </Label>
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Criar Service"}
              </Button>
            </div>
          </DaylogContent>
        </Daylog>
      </div>

      {/* Edit Daylog */}
      <Daylog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DaylogContent className="max-w-2xl">
          <DaylogHeader>
            <DaylogTitle>Editar Service</DaylogTitle>
            <DaylogDescription>Currentize os dados do service</DaylogDescription>
          </DaylogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Service *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g.: Photo Session"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug (URL) *</Label>
              <Input
                id="edit-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ensaio-fotografico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Service description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CurrencyInput
                id="edit-price"
                value={price}
                onChange={setPrice}
                required
              />

              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-active" className="cursor-pointer">
                Active (visible on site)
              </Label>
            </div>

            <Button onClick={handleUpdate} className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Currentizar Service"}
            </Button>
          </div>
        </DaylogContent>
      </Daylog>

      {/* Lista de services */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : services && services.length > 0 ? (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="text-xl font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">/servico/{service.slug}</p>
                      </div>
                    </div>

                    {service.description && (
                      <p className="text-muted-foreground mt-2">{service.description}</p>
                    )}

                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4" />
                        <span>{format(service.price)}</span>
                      </div>
                      {service.duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} min</span>
                        </div>
                      )}
                      {service.isActive ? (
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDhete(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">None service eachstrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie your first service para start a oferecer aos clientes
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar First Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}
