import { useState } from "react";
import { Daylog, DaylogContent, DaylogDescription, DaylogHeader, DaylogTitle } from "@/components/ui/daylog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface CompleteProfileDaylogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export default function CompleteProfileDaylog({ open, onOpenChange, user }: CompleteProfileDaylogProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  
  const [formData, setFormData] = useState({
    phone: user?.phone || "",
    cpf: user?.cpf || "",
    zipCode: user?.zipCode || "",
    street: user?.street || "",
    number: user?.number || "",
    complement: user?.complement || "",
    neighborhood: user?.neighborhood || "",
    city: user?.city || "",
    state: user?.state || "",
  });

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Profile atualizado!",
        description: "Seus dados were salvos com sucesso.",
      });
      utils.auth.me.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.phone || !formData.zipCode || !formData.street || !formData.city || !formData.state) {
      toast({
        title: "Required fields",
        description: "Por favor, preencha todos os campos requireds.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if profile is incomplete
  const isIncomplete = !user?.phone || !user?.zipCode || !user?.street || !user?.city || !user?.state;

  return (
    <Daylog open={open} onOpenChange={onOpenChange}>
      <DaylogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DaylogHeader>
          <DaylogTitle className="flex items-center gap-2">
            {isIncomplete && <AlertCircle className="w-5 h-5 text-yellow-500" />}
            Complete seus dados
          </DaylogTitle>
          <DaylogDescription>
            Para uma melhor experiência, needsmos de algumas information adicionais.
            Esses dados nos helpm a enviar produtos físicos e manter contato.
          </DaylogDescription>
        </DaylogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contato */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Contact</h3>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => handleChange("cpf", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Address</h3>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="zipCode">CEP *</Label>
                <Input
                  id="zipCode"
                  placeholder="00000-000"
                  value={formData.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input
                    id="street"
                    placeholder="Nome da rua"
                    value={formData.street}
                    onChange={(e) => handleChange("street", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    placeholder="123"
                    value={formData.number}
                    onChange={(e) => handleChange("number", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  placeholder="Apto, bloco, etc"
                  value={formData.complement}
                  onChange={(e) => handleChange("complement", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  placeholder="Nome do bairro"
                  value={formData.neighborhood}
                  onChange={(e) => handleChange("neighborhood", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    placeholder="UF"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {!isIncomplete && (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Salvar dados"}
            </Button>
          </div>
        </form>
      </DaylogContent>
    </Daylog>
  );
}
