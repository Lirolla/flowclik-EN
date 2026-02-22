import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { useCurrency } from "@/hooks/useCurrency";

export function CartButton() {
  const { totalItems, totalPrice } = useCart();
  const { format } = useCurrency();
  const [, setLocation] = useLocation();

  if (totalItems === 0) return null;

  return (
    <Button
      onClick={() => setLocation("/cart")}
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
      size="lg"
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      {totalItems} {totalItems === 1 ? "photo" : "photos"}
      <span className="ml-2 font-bold">
        {format(totalPrice)}
      </span>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Button>
  );
}
