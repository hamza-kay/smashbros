"use client";

import { useState, useEffect } from "react";

export function useRestaurantStatus(appId, token) {
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


  useEffect(() => {
    if (!appId || !token) return;

    const fetchRestaurantStatus = async () => {
      try {
        const res = await fetch(`${baseUrl}/order_management/toggle`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-App-Id": appId,
          },
        });
        const result = await res.json();
        setIsRestaurantOpen(result?.data?.accepting_orders === 1);
      } catch (err) {
        console.error("Error checking restaurant status:", err);
      }
    };

    fetchRestaurantStatus(); // Initial fetch

    const interval = setInterval(fetchRestaurantStatus, 10000); // Poll every 10s
    return () => clearInterval(interval); // Cleanup on unmount
  }, [appId, token, baseUrl]);

  return isRestaurantOpen;
}
