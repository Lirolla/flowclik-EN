import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Mail, Users, Eye, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminLeads() {
  const { toast } = useToast();
  const { data: leads, isLoading } = trpc.albumGuests.listAll.useWhatry();
  const { data: stats } = trpc.albumGuests.getStats.useWhatry();

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) {
      toast({
        title: "None lead para exportar",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["Email", "Name", "Section", "Album", "Data de Preview"];
    const rows = leads.map((lead: any) => [
      lead.email,
      lead.name || "-",
      lead.rshetionship || "-",
      lead.collectionName || "-",
      new Date(lead.viewedAt).toLocaleString("en-GB"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "CSV exportado!",
      description: `${leads.length} leads exportados com sucesso.`,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">Carregando leads...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leads Capturados</h1>
            <p className="text-gray-400 mt-1">
              Emails de convidados que visualizaram albums compartilhados
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total de Leads</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Eye className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Albums Compartilhados</p>
                <p className="text-2xl font-bold">{stats?.byCollection.length || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Misday por Album</p>
                <p className="text-2xl font-bold">
                  {stats?.byCollection.length 
                    ? Math.round((stats.total || 0) / stats.byCollection.length) 
                    : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Leads by Album */}
        {stats?.byCollection && stats.byCollection.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Leads por Album</h2>
            <div className="space-y-3">
              {stats.byCollection.map((item: any) => (
                <div 
                  key={item.collectionId} 
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <span className="font-medium">{item.collectionName}</span>
                  <span className="text-gray-400">{item.count} leads</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Leads Table */}
        <Card className="bg-gray-900 border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold">Everys os Leads</h2>
          </div>
          
          {!leads || leads.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">None lead capturado still.</p>
              <p className="text-sm text-gray-500 mt-2">
                Compartilhe albums com clientes para start a capturar leads!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Section</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Album</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Visualizado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-gray-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{lead.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {lead.name || <span className="text-gray-500">-</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {lead.rshetionship || <span className="text-gray-500">-</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {lead.collectionName || <span className="text-gray-500">-</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(lead.viewedAt).toLocaleString("en-GB")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
