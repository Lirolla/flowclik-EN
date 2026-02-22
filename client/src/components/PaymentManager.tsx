import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Banknote, Building2, CheckCircle2, Clock, AlertCircle, Link2, QrCode } from "lucide-react";
import SendPaymentLinkDialog from "@/components/SendPaymentLinkDialog";
import { useCurrency } from "@/hooks/useCurrency";

interface PaymentManagerProps {
  appointmentId: number;
  clientEmail: string;
  clientName: string;
  finalPrice?: number;
}

export default function PaymentManager({ 
  appointmentId, 
  clientEmail, 
  clientName,
  finalPrice = 0 
}: PaymentManagerProps) {
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrency();
  const utils = trpc.useUtils();
  
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isAddExtraOpen, setIsAddExtraOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | "payment_link">("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [extraDescription, setExtraDescription] = useState("");
  const [extraPrice, setExtraPrice] = useState("");

  // Get available payment methods
  const { data: availableMethods } = trpc.paymentMethods.getAvailableMethods.useQuery();
  
  // Get payment summary
  const { data: paymentSummary } = trpc.paymentMethods.getPaymentSummary.useQuery({ 
    appointmentId 
  });

  // Get extras
  const { data: extras = [] } = trpc.appointments.getExtras.useQuery({ appointmentId });

  // Add extra mutation
  const addExtraMutation = trpc.appointments.addExtra.useMutation({
    onSuccess: () => {
      utils.appointments.getExtras.invalidate({ appointmentId });
      utils.paymentMethods.getPaymentSummary.invalidate({ appointmentId });
      utils.appointments.getAll.invalidate();
      setIsAddExtraOpen(false);
      setExtraDescription("");
      setExtraPrice("");
      toast({
        title: "Extra service added!",
        description: "The extra service has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete extra mutation
  const deleteExtraMutation = trpc.appointments.deleteExtra.useMutation({
    onSuccess: () => {
      utils.appointments.getExtras.invalidate({ appointmentId });
      utils.paymentMethods.getPaymentSummary.invalidate({ appointmentId });
      utils.appointments.getAll.invalidate();
      toast({
        title: "Extra service removed!",
        description: "The extra service has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update payment method mutation
  const updatePaymentMethodMutation = trpc.paymentMethods.updatePaymentMethod.useMutation({
    onSuccess: () => {
      utils.paymentMethods.getPaymentSummary.invalidate({ appointmentId });
      utils.appointments.getAll.invalidate();
      toast({
        title: "Payment method updated!",
        description: "The payment method has been changed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Record manual payment mutation
  const recordPaymentMutation = trpc.paymentMethods.recordManualPayment.useMutation({
    onSuccess: (data) => {
      utils.paymentMethods.getPaymentSummary.invalidate({ appointmentId });
      utils.appointments.getAll.invalidate();
      setIsRecordPaymentOpen(false);
      setPaymentAmount("");
      setPaymentNotes("");
      toast({
        title: data.paymentStatus === "paid" ? "Payment complete!" : "Partial payment recorded!",
        description: `${formatCurrency(data.newPaidAmount)} of ${formatCurrency(totalPrice)} paid.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRecordPayment = () => {
    const amountValue = parseFloat(paymentAmount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    recordPaymentMutation.mutate({
      appointmentId,
      amount: amountValue,
      paymentMethod,
      notes: paymentNotes || undefined,
    });
  };

  // Calculate totals from extras
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0);
  const totalPrice = finalPrice + extrasTotal;
  const paidAmount = paymentSummary?.paidAmount || 0;
  const remainingAmount = totalPrice - paidAmount;
  const paymentStatus = paymentSummary?.paymentStatus || "pending";
  const currentMethod = paymentSummary?.paymentMethod;

  // Payment status badge
  const getStatusBadge = () => {
    switch (paymentStatus) {
      case "paid":
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Paid
          </div>
        );
      case "partial":
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Partial
          </div>
        );
      case "awaiting_payment":
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Awaiting
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending
          </div>
        );
    }
  };

  // Quick amount buttons for 50% and 100%
  const setQuickAmount = (percentage: number) => {
    const amount = (totalPrice * percentage) / 100;
    setPaymentAmount(amount.toFixed(2));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment</span>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Button Add Extra Service */}
          <div className="flex justify-end">
            <Button
              onClick={() => setIsAddExtraOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              Add Extra Service
            </Button>
          </div>

          {/* Extras List */}
          {extras.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Extra Services:</Label>
              {extras.map((extra) => (
                <div key={extra.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{extra.description}</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(extra.price)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteExtraMutation.mutate({ id: extra.id })}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Payment Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-2xl font-bold">{formatCurrency(totalPrice)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Paid</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Remaining</div>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(remainingAmount)}</div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <Label>Payment Method</Label>
            <Select
              value={currentMethod || "cash"}
              onValueChange={(value) => {
                updatePaymentMethodMutation.mutate({
                  appointmentId,
                  paymentMethod: value as "cash" | "bank_transfer" | "payment_link",
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {availableMethods?.cash && (
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Cash
                    </div>
                  </SelectItem>
                )}
                {availableMethods?.bankTransfer && (
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                )}
                <SelectItem value="payment_link">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Payment Link
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Payment method instructions */}
            {currentMethod === "cash" && availableMethods?.cashInstructions && (
              <p className="text-sm text-muted-foreground mt-2">
                {availableMethods.cashInstructions}
              </p>
            )}
            {currentMethod === "bank_transfer" && availableMethods?.bankDetails && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <p className="font-medium mb-1">Bank details:</p>
                <pre className="whitespace-pre-wrap text-xs">{availableMethods.bankDetails}</pre>
              </div>
            )}
            {currentMethod === "payment_link" && (
              <p className="text-sm text-muted-foreground mt-2">
                Paste the payment link generated in your gateway (Stripe, PayPal, etc.) and send it to the client.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {currentMethod === "payment_link" ? (
              <Button
                onClick={() => setIsPaymentDialogOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={paymentStatus === "paid"}
              >
                <Link2 className="w-4 h-4 mr-2" />
                Send Payment Link
              </Button>
            ) : (
              <Button
                onClick={() => setIsRecordPaymentOpen(true)}
                className="w-full"
                disabled={paymentStatus === "paid"}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Record Manual Payment
              </Button>
            )}
          </div>

          {/* Payment History */}
          {paymentSummary?.transactions && paymentSummary.transactions.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Payment History</h4>
              <div className="space-y-2">
                {paymentSummary.transactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div className="flex items-center gap-3">
                      {transaction.paymentMethod === "cash" && <Banknote className="w-4 h-4" />}
                      {transaction.paymentMethod === "bank_transfer" && <Building2 className="w-4 h-4" />}
                      {transaction.paymentMethod === "stripe" && <CreditCard className="w-4 h-4" />}
                      {transaction.paymentMethod === "pix" && <QrCode className="w-4 h-4" />}
                      {transaction.paymentMethod === "payment_link" && <Link2 className="w-4 h-4" />}
                      <div>
                        <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString('en-GB')}
                          {transaction.notes && ` - ${transaction.notes}`}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.status === "completed" ? "text-green-600" : "text-orange-600"
                    }`}>
                      {transaction.status === "completed" ? "Confirmed" : "Pending"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Payment Link Dialog */}
      <SendPaymentLinkDialog
        appointment={{ id: appointmentId, clientEmail, clientName, finalPrice: totalPrice }}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
      />

      {/* Record Manual Payment Dialog */}
      <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Manual Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <Input value={clientName} disabled />
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as "cash" | "bank_transfer" | "pix")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMethods?.cash && (
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Cash
                      </div>
                    </SelectItem>
                  )}
                  {availableMethods?.bankTransfer && (
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment-amount">Amount (£)</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(50)}
                >
                  50% ({formatCurrency(Math.round(totalPrice * 0.5))})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(100)}
                >
                  100% ({formatCurrency(totalPrice)})
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="payment-notes">Notes (optional)</Label>
              <Textarea
                id="payment-notes"
                placeholder="E.g.: 50% deposit, Final payment, etc."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRecordPaymentOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRecordPayment}
                disabled={recordPaymentMutation.isPending}
                className="flex-1"
              >
                {recordPaymentMutation.isPending ? "Saving..." : "Record Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Extra Service Dialog */}
      <Dialog open={isAddExtraOpen} onOpenChange={setIsAddExtraOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Extra Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="extra-description">Description</Label>
              <Input
                id="extra-description"
                placeholder="E.g.: 30 extra photos, Physical album, 30x40cm print"
                value={extraDescription}
                onChange={(e) => setExtraDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="extra-price">Price (£)</Label>
              <Input
                id="extra-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={extraPrice}
                onChange={(e) => setExtraPrice(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter the amount in pounds (e.g.: 300 = £300.00)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddExtraOpen(false);
                  setExtraDescription("");
                  setExtraPrice("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const priceValue = parseFloat(extraPrice);
                  if (!extraDescription || !extraPrice || isNaN(priceValue) || priceValue <= 0) {
                    toast({
                      title: "Error",
                      description: "Please fill in all fields correctly.",
                      variant: "destructive",
                    });
                    return;
                  }
                  // Save in pounds - consistent with the rest of the system
                  addExtraMutation.mutate({
                    appointmentId,
                    description: extraDescription,
                    price: priceValue,
                  });
                }}
                disabled={addExtraMutation.isPending}
                className="flex-1"
              >
                {addExtraMutation.isPending ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
