"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

export default function CompletePage() {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // ✅ empty the cart immediately when this page is hit
    clearCart();

    const t = setTimeout(() => router.push("/"), 5000);
    return () => clearTimeout(t);
  }, [clearCart, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-10 text-center">
      <h1 className="text-accent text-2xl font-bold mb-3">
        ✅ Order Complete
      </h1>
      <p className="text-gray-700">We’ll start preparing it shortly.</p>
      <p className="text-muted text-sm mt-4">Redirecting to home…</p>
  <Button
  onClick={() => router.push("/")}
  className="mt-6 bg-accent text-white hover:bg-secondary px-6"
>
  Back to Home
</Button>

    </main>
  );
}
