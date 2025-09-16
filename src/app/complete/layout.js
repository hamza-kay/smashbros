import { Suspense } from "react";

export default function CompleteLayout({ children }) {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading your order...</div>}>
      {children}
    </Suspense>
  );
}
