"use client";

import CartForm from "@/components/CartForm";
import OrderSummary from "@/components/OrderSummary";

export default function CartPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Checkout Form removed min-h-[800px] */}
        <div className="lg:col-span-2  transition-all">
          <CartForm />
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </main>
  );
}
