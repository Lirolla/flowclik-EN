import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { PhoneInput } from '@/components/PhoneInput';

export default function AdminClients() {
  const utils = trpc.useUtils();
  const { data: clients = [], isLoading } = trpc.clients.list.useQuery();
  const { data: siteConfig } = trpc.siteConfig.get.useQuery();
  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      setShowCreateDialog(false);
      setFormData({});
      alert('Cliente criado com sucesso!');
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });
  
  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      alert('Cliente excluído com sucesso!');
    },
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      setShowEditDialog(false);
      setEditingClient(null);
      setFormData({});
      alert('Cliente atualizado com sucesso!');
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, ...formData });
    } else {
      // Adiciona país da configuração global ao criar cliente
      createMutation.mutate({
        ...formData,
        country: 'Brasil'
      });
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      zipCode: client.zipCode || '',
      cpf: client.cpf || '',
    });
    setShowEditDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Gerenciar Clientes</h1>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">+ Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl">Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label>Telefone</Label>
                  <PhoneInput
                    value={formData.phone || ''}
                    onChange={(value) => {
                      setFormData({ 
                        ...formData, 
                        phone: value || ''
                      });
                    }}
                    placeholder="Telefone com código do país"
                  />
                </div>

                {/* País fixo baseado na configuração global */}
                <div>
                  <Label>País</Label>
                  <Input
                    value="Brasil"
                    disabled
                    className="bg-gray-900 border-gray-700 text-gray-400"
                  />
                </div>

                {/* CPF (Brasil) */}
                <div>
                  <Label>CPF</Label>
                  <Input
                    value={formData.cpf || ''}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, complemento"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label>Cidade</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label>Estado</Label>
                  <Input
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP, RJ, MG..."
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label>CEP</Label>
                  <Input
                    value={formData.postalCode || ''}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="00000-000"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Cadastrar Cliente
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setEditingClient(null);
            setFormData({});
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl">Editar Cliente</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label>Telefone</Label>
                  <PhoneInput
                    value={formData.phone || ''}
                    onChange={(value) => {
                      setFormData({ 
                        ...formData, 
                        phone: value || ''
                      });
                    }}
                    placeholder="Telefone com código do país"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, bairro"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label>Cidade</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label>Estado</Label>
                  <Input
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP, RJ, MG..."
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="col-span-2">
                  <Label>CEP</Label>
                  <Input
                    value={formData.zipCode || ''}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="00000-000"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                {/* CPF (Brasil) */}
                <div className="col-span-2">
                  <Label>CPF</Label>
                  <Input
                    value={formData.cpf || ''}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
                  Salvar Alterações
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-900">
              <tr>
                <th className="px-6 py-4 text-left text-white font-semibold">Nome</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Telefone</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Cidade/Estado</th>
                <th className="px-6 py-4 text-left text-white font-semibold">País</th>
                <th className="px-6 py-4 text-center text-white font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <p className="text-xl mb-4">Nenhum cliente cadastrado</p>
                      <Button onClick={() => setShowCreateDialog(true)} className="bg-red-600 hover:bg-red-700">
                        Adicionar Primeiro Cliente
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-800 transition">
                    <td className="px-6 py-4 text-white">{client.name}</td>
                    <td className="px-6 py-4 text-gray-300">{client.email}</td>
                    <td className="px-6 py-4 text-gray-300">{client.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {client.city && client.state ? `${client.city}/${client.state}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">Brasil</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                          asChild
                        >
                          <Link href={`/admin/client/${encodeURIComponent(client.email || '')}`}>
                            <a>Histórico</a>
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white border-0"
                          onClick={() => handleEdit(client)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-600 hover:bg-red-700 text-white border-0"
                          onClick={() => handleDelete(client.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </DashboardLayout>
  );
}
