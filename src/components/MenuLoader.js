"use client";

import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { AppIdContext } from "@/components/AppIdProvider";

import { fetchRestaurantData, fetchSectionItems } from "@/utils/api";
import MenuItem from "@/components/MenuItem";
import ItemModal from "@/components/ItemModal";
import DealItemModal from "@/components/DealItemModal";
import MealItemModal from "@/components/MealItemModal";

import { useState } from "react";

export default function MenuLoader({ sections }) {
  const { appId } = useContext(AppIdContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDealItem, setIsDealItem] = useState(false);
  const [isMealItem, setIsMealItem] = useState(false);

  const {
    data: restaurantData,
    isLoading: isLoadingRestaurant,
    isError: isErrorRestaurant,
  } = useQuery({
    queryKey: ["restaurantData", appId],
    enabled: !!appId,
    queryFn: () => fetchRestaurantData(appId),
  });

  const {
    data: allSectionItems = [],
    isLoading: isLoadingSectionItems,
    isError: isErrorSectionItems,
  } = useQuery({
    queryKey: ["allSectionItems", sections, appId],
    queryFn: () =>
      Promise.all(
        sections.map((section) =>
          fetchSectionItems(section.id, appId).then((items) => ({
            sectionId: section.id,
            sectionTitle: section.title,
            items,
          }))
        )
      ),
    enabled: sections.length > 0 && !!appId,
  });

if (isLoadingRestaurant || isLoadingSectionItems) {
    return (
     <main className="max-w-7xl mx-auto px-4 pt-0 pb-6">

       <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-64 bg-gray-100 animate-pulse rounded"
            />
          ))}
        </div>
      </main>
    );
  }

  if (
    isErrorRestaurant ||
    isErrorSectionItems
  ) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-accent mb-4">
          Error loading menu.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </main>
    );
  }

return (
 <main className="max-w-7xl mx-auto px-4 pt-0 pb-6">
    {allSectionItems.map((section) => (
      <div
        key={section.sectionId}
        className="mb-6"
      >
<h2
  id={`section-${section.sectionId}`}
  data-section-id={section.sectionId}
 className="text-2xl !font-bold tracking-tight text-accent mb-8"
>
  {section.sectionTitle}
</h2>



        {section.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map((item) => (
              <div
                key={item.id}
onClick={() => {
  const isDeal =
    item.isDeal === true ||
    (Array.isArray(item.requirements) && item.requirements.length > 0);

    // meal if explicit flag OR MealUpgrade block present
                    const isMeal =
                      item.isMeal === true ||
                      !!item.MealUpgrade ||
                      !!item.mealUpgrade;

  console.log("Clicked item:", item);
  console.log("→ isDeal:", isDeal);
   console.log("→ isMeal:", isMeal);

  setIsDealItem(isDeal);
  setIsMealItem(isMeal);
  setSelectedItem(item);
}}



                className="cursor-pointer"
              >
                <MenuItem item={item} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No items found in this section.
          </p>
        )}
      </div>
    ))}

{selectedItem && (
  isDealItem ? (
    <DealItemModal
      dealItem={selectedItem}
      fullMenuItems={
        allSectionItems.flatMap(section => section.items)
      }
      onClose={() => setSelectedItem(null)}
    />
  )  : isMealItem ? (
          <MealItemModal
            mealItem={selectedItem}
            fullMenuItems={
        allSectionItems.flatMap(section => section.items)
      }
            onClose={() => setSelectedItem(null)}
          />
        ) : (
    <ItemModal
      item={selectedItem}
      onClose={() => setSelectedItem(null)}
    />
  )
)}

  </main>
);


}