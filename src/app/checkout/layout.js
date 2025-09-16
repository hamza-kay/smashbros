import { Suspense } from "react";

export default function CheckoutLayout({ children }) {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading checkout...</div>}>
      {children}
    </Suspense>
  );
}
