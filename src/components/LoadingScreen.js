"use client";

import { Loader } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
        <p className="text-sm font-medium text-[var(--color-muted)]"></p>
      </div>
    </div>
  );
}
