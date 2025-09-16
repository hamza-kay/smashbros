"use client";

import { AppIdProvider } from "@/components/AppIdProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Footer from "@/components/Footer";

const queryClient = new QueryClient();

export default function ClientLayout({ children }) {
  return (
    <AppIdProvider>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </QueryClientProvider>
    </AppIdProvider>
  );
}
