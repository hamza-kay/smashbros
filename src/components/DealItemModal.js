"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";

export default function DealItemModal({
  dealItem,
  fullMenuItems,
  onClose,
}) {
  const addToCart = useCartStore((state) => state.addToCart);
  const modalRef = useRef(null);
  const dealBasePrice = Number(dealItem.price) || 0;
  const requirements = dealItem.requirements || [];
  const [imgError, setImgError] = useState(false);
  const [errors, setErrors] = useState({});



// NEW: flatten requirements
const flattenedRequirements = [];
requirements.forEach((req) => {
  const quantity = req.quantity || 1;
  for (let i = 0; i < quantity; i++) {
    flattenedRequirements.push({
      ...req,
      displayName: `${req.name} ${quantity > 1 ? i + 1 : ""}`.trim(),
      key: `${req.name}-${i}`,
    });
  }
});

// Create initial selections for each flattened item
const initialSelections = {};
flattenedRequirements.forEach((req) => {
  const matchingItems = fullMenuItems.filter((item) =>
    Array.isArray(req.ids) && req.ids.includes(Number(item.id))
  );

  const autoSelectedId = matchingItems.length === 1 ? matchingItems[0].id : null;

initialSelections[req.key] = {
  selectedItemId: autoSelectedId,
  selectedVariation: null,
  selectedAddons: [],
  selectedSize: req.size || null, // ⬅️ store preselected size here
};
});


  const [selections, setSelections] = useState(initialSelections);
  const [quantity, setQuantity] = useState(1);

  const handleItemChange = (key, field, value) => {
    setSelections((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const toggleAddon = (key, addon) => {
    setSelections((prev) => {
      const selectedAddons = prev[key].selectedAddons;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          selectedAddons: selectedAddons.includes(addon)
            ? selectedAddons.filter((a) => a !== addon)
            : [...selectedAddons, addon],
        },
      };
    });
  };

  const customizationsTotal = useMemo(() => {
    let total = 0;

    for (const key of Object.keys(selections)) {
        const {
    selectedItemId,
    selectedVariation,
    selectedAddons,
    selectedSize
  } = selections[key]; // ✅ now selectedSize is defined
      if (!selectedItemId) continue;

      const selectedItem = fullMenuItems.find((i) => i.id === selectedItemId);
      if (!selectedItem) continue;



if (selectedVariation && selectedItem.variation?.[selectedVariation]) {
  const varPrice =
    selectedItem.variation[selectedVariation].prices?.[selectedSize] || 0;
  total += varPrice;
}


      if (selectedItem.addons) {
        const selectedSize = selections[key]?.selectedSize;
        selectedAddons.forEach((addonName) => {
          
          const addonData = selectedItem.addons[addonName];
          let price = 0;
       if (typeof addonData === "object") {
  price = addonData[selectedSize] || 0;
} else {
  price = addonData;
}
          total += price;
        });
      }
    }

    return total;
  }, [selections, fullMenuItems]);

  const totalPrice = (dealBasePrice + customizationsTotal).toFixed(2);

const handleAddToCart = () => {
// ✅ Validate required selections
const newErrors = {};

for (const key of Object.keys(selections)) {
  const { selectedItemId, selectedVariation } = selections[key];
  const selectedItem = fullMenuItems.find((i) => i.id === selectedItemId);
  const hasVariations = selectedItem?.variation && Object.keys(selectedItem.variation).length > 0;

  if (!selectedItemId) {
    newErrors[key] = "Please select an item.";
    continue;
  }

  if (hasVariations && !selectedVariation) {
    newErrors[key] = "Please select a variation.";
    continue;
  }
}

if (Object.keys(newErrors).length > 0) {
  setErrors(newErrors);
  return;
}

setErrors({});


  const parentDealId = uuidv4();
  const parentCartLineId = uuidv4();

  // First, add the main deal item
  addToCart({
    id: dealItem.id,
    name: dealItem.name,
    price: dealBasePrice,
    quantity,
    totalPrice: parseFloat(totalPrice) * quantity,
    parentDealId,
    isDeal: true,
    cartLineId: parentCartLineId 
  });

  // Then add each selected sub-item
  Object.entries(selections).forEach(([key, selection]) => {
    if (!selection.selectedItemId) return;

    const selectedItem = fullMenuItems.find(
      (i) => i.id === selection.selectedItemId
    );
    if (!selectedItem) return;

    let customPrice = 0;

    const variationKey = selection.selectedVariation;
    const variationName = selectedItem.variation?.[variationKey]?.name || null;

    if (
      variationKey &&
      selectedItem.variation?.[variationKey]
    ) {
      const selectedSize = selection.selectedSize;
customPrice += selectedItem.variation?.[variationKey]?.prices?.[selectedSize] || 0;
    }

const selectedSize = selection.selectedSize;

selection.selectedAddons.forEach((addonName) => {
  const addonData = selectedItem.addons?.[addonName];
  let price = 0;
  if (typeof addonData === "object") {
    price = addonData[selectedSize] || 0;
  } else {
    price = addonData || 0;
  }
  customPrice += price;
});


    addToCart({
      id: selectedItem.id,
      name: selectedItem.name,
      price: customPrice,
      quantity: 1,
      selectedVariation: variationKey,
      variationName,
      selectedAddons: selection.selectedAddons,
      parentDealId,
      cartLineId: uuidv4()
    });
  });

  onClose();
};


  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!dealItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 md:p-4 overflow-auto">
      <div
        ref={modalRef}
        className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] w-full h-full md:h-auto md:max-w-[640px] md:max-h-[90vh] md:rounded-lg rounded-none shadow-xl overflow-hidden flex flex-col"

      >
        <div className="flex-1 overflow-y-auto">
      <div className="relative w-full h-72 md:h-96 overflow-hidden bg-gray-100">
  {(!dealItem.image_url || imgError) ? (
    <Image
      src="https://cdn.grubify.co.uk/popularpizza/utensil.webp"
      alt="Fallback image"
      fill
      className="object-contain p-6 grayscale opacity-50"
      unoptimized
     
    />
  ) : (
    <Image
      src={dealItem.image_url}
      alt={dealItem.name}
      fill
      sizes="(max-width: 768px) 100vw, 640px"
      className="object-cover"
      onError={() => setImgError(true)}
      unoptimized
    />
  )}
</div>


          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">
              {dealItem.name}
            </h1>

            {dealItem.price && (
              <p className="mt-2 text-lg font-semibold text-gray-900">
                £{Number(dealItem.price).toFixed(2)}
              </p>
            )}

            {dealItem.description && (
              <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">
                {dealItem.description}
              </p>
            )}

{flattenedRequirements.map((req) => {
const matchingItems = fullMenuItems.filter((item) =>
  Array.isArray(req.ids) && req.ids.includes(Number(item.id))
);


  const selectedItemId = selections[req.key]?.selectedItemId;
  const selectedItem = fullMenuItems.find(
    (i) => i.id === selectedItemId
  );

  return (
    <div key={req.key} className="mt-8">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">
        {req.displayName}
      </h4>

      {/* If only one item, show it preselected */}
      {matchingItems.length === 1 ? (
        <p className="text-sm text-gray-700 mb-4">
          {matchingItems[0].name}
        </p>
      ) : (
        <div className="mb-4">
          <select
            value={selectedItemId || ""}
            onChange={(e) =>
              handleItemChange(
                req.key,
                "selectedItemId",
                Number(e.target.value)
              )
            }
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Select {req.name}</option>
            {matchingItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Variations */}
      {selectedItem &&
        selectedItem.variation &&
        Object.keys(selectedItem.variation).length > 0 && (
          <div className="divide-y divide-gray-200 border rounded">
            {Object.keys(selectedItem.variation).map((varKey) => {
              const varPrice = selectedItem.variation?.[varKey]?.prices?.[req.size] || 0;
              return (
                <label
                  key={varKey}
                  className="flex justify-between items-center text-sm py-3 px-3 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`variation-${req.key}`}
                      value={varKey}
                      checked={
                        selections[req.key]?.selectedVariation === varKey
                      }
                      onChange={() =>
                        handleItemChange(
                          req.key,
                          "selectedVariation",
                          varKey
                        )
                      }
                      className="accent-accent w-5 h-5 border-gray-300 rounded"
                    />
                    <span className="text-gray-900">
                      {selectedItem.variation[varKey].name}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {varPrice > 0
                      ? `+£${varPrice.toFixed(2)}`
                      : "+£0.00"}
                  </span>
                </label>
              );
            })}
            
          </div>
          
        )}
                {errors[req.key] && (
  <p className="text-sm text-red-600 mt-2">{errors[req.key]}</p>
)}

      {/* Addons */}
      {selectedItem &&
        selectedItem.addons &&
        Object.keys(selectedItem.addons).length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Add-ons
            </h4>
          
            <div className="divide-y divide-gray-200 border rounded">
              {Object.keys(selectedItem.addons).map((addonName) => {
                  const selectedSize = selections[req.key]?.selectedSize;
                const addonData = selectedItem.addons[addonName];
                let price = 0;
      if (typeof addonData === "object") {
  price = addonData[selectedSize] || 0;
} else {
  price = addonData;
}

                return (
                  <label
                    key={addonName}
                    className="flex justify-between items-center text-sm py-3 px-3 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selections[req.key]?.selectedAddons?.includes(
                          addonName
                        )}
                        onChange={() =>
                          toggleAddon(req.key, addonName)
                        }
                        className="accent-accent w-5 h-5 border-gray-300 rounded"
                      />
                      <span className="text-gray-900">
                        {addonName}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      +£{Number(price || 0).toFixed(2)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

    </div>
  );
})}


            {/* Quantity Controls */}
            <div className="mt-6 flex justify-start">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </Button>
                <span className="text-base font-semibold w-6 text-center text-gray-900">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 w-full">
          <div className="flex items-center justify-between bg-[var(--color-card-bg)] backdrop-blur border-t px-4 py-3">
            <button
              onClick={onClose}
              className="text-accent hover:text-secondary text-xl font-bold px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition"
            >
              ×
            </button>
            <Button
              onClick={handleAddToCart}
              className="bg-accent hover:bg-secondary text-white font-semibold flex-grow ml-4 py-3 rounded transition text-base"
            >
              Add to Order £{totalPrice}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
