// src/components/AppIdProvider.js (Server Component)
import { createContext } from "react";

export const AppIdContext = createContext({ appId: null });

export function AppIdProvider({ children }) {
  const appId = process.env.NEXT_PUBLIC_APP_ID_KEY;

  return (
    <AppIdContext.Provider value={{ appId }}>
      {children}
    </AppIdContext.Provider>
  );
}
