import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface CompleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export default function CompleteProfileDialog({ open, onOpenChange, user }: CompleteProfileDialogProps) {
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
        title: "Profile updated!",
        description: "Your details have been saved successfully.",
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
    
    // Basic validation
    if (!formData.phone || !formData.zipCode || !formData.street || !formData.city || !formData.state) {
      toast({
        title: "Required fields",
        description: "Please fill in all required fields.",
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isIncomplete && <AlertCircle className="w-5 h-5 text-yellow-500" />}
            Complete Your Details
          </DialogTitle>
          <DialogDescription>
            For a better experience, we need some additional information.
            This data helps us send physical products and stay in touch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Contact</h3>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+44 7700 900000"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Address</h3>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="zipCode">Postcode *</Label>
                <Input
                  id="zipCode"
                  placeholder="SW1A 1AA"
                  value={formData.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="street">Street *</Label>
                  <Input
                    id="street"
                    placeholder="Street name"
                    value={formData.street}
                    onChange={(e) => handleChange("street", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="number">Number *</Label>
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
                <Label htmlFor="complement">Flat / Unit</Label>
                <Input
                  id="complement"
                  placeholder="Flat, unit, etc."
                  value={formData.complement}
                  onChange={(e) => handleChange("complement", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Area</Label>
                <Input
                  id="neighborhood"
                  placeholder="Area or district"
                  value={formData.neighborhood}
                  onChange={(e) => handleChange("neighborhood", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">County *</Label>
                  <Input
                    id="state"
                    placeholder="County"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {!isIncomplete && (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
