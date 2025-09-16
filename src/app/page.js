"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppId } from "@/components/AppIdProvider";
import { fetchRestaurantData, fetchSections } from "@/utils/api";
import Header from "@/components/Header";
import MenuLoader from "@/components/MenuLoader";
import MobileCartBar from "@/components/MobileCartBar";
import LoadingScreen from "@/components/LoadingScreen";
import { useContext } from "react";
import { AppIdContext } from "@/components/AppIdProvider";

export default function HomePage() {
const { appId } = useContext(AppIdContext);

  const {
    data: restaurantData,
    isLoading: isLoadingRestaurant,
  } = useQuery({
    queryKey: ["restaurantData", appId],
    enabled: !!appId,
    queryFn: () => fetchRestaurantData(appId),
  });

  const menuId = restaurantData?.id;

  const {
    data: sections = [],
    isLoading: isLoadingSections,
    isError,
  } = useQuery({
    queryKey: ["sections", menuId, appId],
    enabled: !!menuId && !!appId,
    queryFn: () => fetchSections(menuId, appId),
  });

if (isLoadingRestaurant || isLoadingSections) {
  return <LoadingScreen />;
}

  if (isError) {
    return <div>Error loading sections.</div>;
  }

  return (
<>


  <Header sections={sections} restaurant={restaurantData} />
  <MobileCartBar />
  <main className="max-w-7xl mx-auto py-6">
    <MenuLoader sections={sections} />
  </main>
</>

  );
}
