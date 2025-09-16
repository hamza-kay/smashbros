"use client";

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

export default function MobileCartBar() {
  const totalItems = useCartStore((state) => state.totalItems());
  const totalAmount = useCartStore((state) => state.totalPrice("other"));
  const groupedCount = useCartStore((state) => state.groupedCartCount());

  if (totalItems === 0) return null;

  return (
    
<div className="fixed md:hidden bottom-0 left-0 right-0 bg-[var(--color-card-bg)] border-t border-gray-200 px-4 py-3 z-50 flex items-center">
  {/* Quantity */}
  <div className="w-[50px] text-sm font-semibold text-gray-800 text-center">
    {groupedCount}
  </div>

  {/* Button */}
  <div className="flex-1 flex justify-center">
    <Link
      href="/cart"
      className="!bg-[var(--color-accent)] !hover:bg-[#B00020] text-white text-sm font-semibold px-4 py-2 rounded"
    >
      View your Order
    </Link>
  </div>

  {/* Total */}
  <div className="w-[65px] text-sm font-semibold text-gray-800 text-right">
    £{totalAmount.toFixed(2)}
  </div>
</div>

  );
}
