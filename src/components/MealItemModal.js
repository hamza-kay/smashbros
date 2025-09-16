"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { useCartStore } from "@/store/useCartStore";

export default function MealItemModal({ mealItem, fullMenuItems, onClose }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const modalRef = useRef(null);

  const basePrice = Number(mealItem.price ?? mealItem.SalePrice ?? 0);
  const mealBlock = mealItem.MealUpgrade ?? mealItem.mealUpgrade ?? null;
  const mealDelta = Number(mealBlock?.priceDelta ?? 0);
  const hasMealUpgrade = !!mealBlock && Array.isArray(mealBlock.requirements);

  const [imgError, setImgError] = useState(false);
  const [isMeal, setIsMeal] = useState(false);
  const [errors, setErrors] = useState({});
  const [quantity, setQuantity] = useState(1);

  const activeRequirements = useMemo(() => {
    if (!isMeal || !hasMealUpgrade) return [];
    return mealBlock.requirements || [];
  }, [isMeal, hasMealUpgrade, mealBlock]);

  const flattenedRequirements = useMemo(() => {
    const out = [];
    (activeRequirements || []).forEach((req) => {
      const quantity = req.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        out.push({
          ...req,
          displayName: `${req.name} ${quantity > 1 ? i + 1 : ""}`.trim(),
          key: `${req.name}-${i}`,
        });
      }
    });
    return out;
  }, [activeRequirements]);

  const initialSelections = useMemo(() => {
    const map = {};
    flattenedRequirements.forEach((req) => {
      const matching = fullMenuItems.filter(
        (it) => Array.isArray(req.ids) && req.ids.includes(Number(it.id))
      );
      const autoId = matching.length === 1 ? matching[0].id : null;
      map[req.key] = {
        selectedItemId: autoId,
        selectedVariation: null,
        selectedAddons: [],
        selectedSize: req.size || null,
      };
    });
    return map;
  }, [flattenedRequirements, fullMenuItems]);

  const [selections, setSelections] = useState(initialSelections);

  useEffect(() => {
    setSelections(initialSelections);
    setErrors({});
  }, [initialSelections]);

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
      const current = prev[key]?.selectedAddons || [];
      const next = current.includes(addon)
        ? current.filter((a) => a !== addon)
        : [...current, addon];
      return { ...prev, [key]: { ...prev[key], selectedAddons: next } };
    });
  };

  const customizationsTotal = useMemo(() => {
    let total = 0;
    Object.keys(selections).forEach((key) => {
      const sel = selections[key];
      if (!sel?.selectedItemId) return;

      const it = fullMenuItems.find((x) => x.id === sel.selectedItemId);
      if (!it) return;

      if (sel.selectedVariation && it.variation?.[sel.selectedVariation]) {
        const size = sel.selectedSize;
        const varPrice = it.variation?.[sel.selectedVariation]?.prices?.[size] || 0;
        total += Number(varPrice || 0);
      }

      if (it.addons) {
        const size = sel.selectedSize;
        sel.selectedAddons.forEach((addonName) => {
          const addonData = it.addons[addonName];
          const price =
            typeof addonData === "object" ? (addonData?.[size] || 0) : (addonData || 0);
          total += Number(price || 0);
        });
      }

        if (isMeal) {
      total += Number(it?.mealUpcharge || 0);
    }
    });
    return total;
  }, [selections, fullMenuItems, isMeal]);

  const totalEach = useMemo(() => {
    const delta = isMeal ? mealDelta : 0;
    return (basePrice + delta + customizationsTotal).toFixed(2);
  }, [basePrice, mealDelta, customizationsTotal, isMeal]);

  const handleAddToCart = () => {
    const newErrors = {};
    if (isMeal) {
      Object.keys(selections).forEach((key) => {
        if (!flattenedRequirements.find((r) => r.key === key)) return;
        const { selectedItemId, selectedVariation } = selections[key];
        const selectedItem = fullMenuItems.find((i) => i.id === selectedItemId);
        const hasVariations =
          selectedItem?.variation && Object.keys(selectedItem.variation).length > 0;
        if (!selectedItemId) newErrors[key] = "Please select an item.";
        if (hasVariations && !selectedVariation) newErrors[key] = "Please select a variation.";
      });
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const parentDealId = uuidv4();
    const parentCartLineId = uuidv4();

    addToCart({
      id: mealItem.id,
      name: mealItem.name,
      price: basePrice + (isMeal ? mealDelta : 0),
      quantity,
      totalPrice: parseFloat(totalEach) * quantity,
      parentDealId,
      isMeal: true,
      isDeal: true, 
      cartLineId: parentCartLineId 
      
    });

    if (isMeal) {
      Object.entries(selections).forEach(([key, selection]) => {
        if (!flattenedRequirements.find((r) => r.key === key)) return;
        if (!selection.selectedItemId) return;

        const selectedItem = fullMenuItems.find((i) => i.id === selection.selectedItemId);
        if (!selectedItem) return;

        let customPrice = 0;
        const variationKey = selection.selectedVariation;
        const variationName = selectedItem.variation?.[variationKey]?.name || null;

        if (variationKey && selectedItem.variation?.[variationKey]) {
          const size = selection.selectedSize;
          customPrice += selectedItem.variation?.[variationKey]?.prices?.[size] || 0;
        }

        const size = selection.selectedSize;
        selection.selectedAddons.forEach((addonName) => {
          const addonData = selectedItem.addons?.[addonName];
          const price =
            typeof addonData === "object" ? addonData[size] || 0 : addonData || 0;
          customPrice += price;
        });

        // ⬅️ NEW: fixed upcharge for premium sides in a meal
customPrice += Number(selectedItem.mealUpcharge || 0);

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
    }

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

  // helper inside MealItemModal
const labelWithUpcharge = (it) => {
  const up = Number(it?.mealUpcharge || 0);
  return up > 0 && isMeal
    ? `${it.name} (+£${up.toFixed(2)})`
    : it.name;
};

  if (!mealItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 md:p-4 overflow-auto">
      <div
        ref={modalRef}
        className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] w-full h-full md:h-auto md:max-w-[640px] md:max-h-[90vh] md:rounded-lg rounded-none shadow-xl overflow-hidden flex flex-col"
      >
        <div className="flex-1 overflow-y-auto">
          <div className="relative w-full h-72 md:h-96 overflow-hidden bg-[var(--color-card-bg)]">
            {(!mealItem.image_url || imgError) ? (
              <Image
                src="https://cdn.grubify.co.uk/popularpizza/utensil.webp"
                alt="Fallback"
                fill
                className="object-contain p-6 grayscale opacity-50"
                unoptimized
              />
            ) : (
              <Image
                src={mealItem.image_url}
                alt={mealItem.name}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
                onError={() => setImgError(true)}
                unoptimized
              />
            )}
          </div>

          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">{mealItem.name}</h1>
            <p className="mt-2 text-lg font-semibold text-gray-900">£{totalEach}</p>
            {mealItem.description && (
              <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">
                {mealItem.description}
              </p>
            )}

            {hasMealUpgrade && (
              <div className="mt-6">
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMeal}
                    onChange={(e) => setIsMeal(e.target.checked)}
                    className="accent-accent w-5 h-5 border-gray-300 rounded"
                  />
                  <span>Make it a meal (+£{mealDelta.toFixed(2)})</span>
                </label>
              </div>
            )}

            {flattenedRequirements.map((req) => {
              const matchingItems = fullMenuItems.filter(
                (item) => Array.isArray(req.ids) && req.ids.includes(Number(item.id))
              );
              const selectedItemId = selections[req.key]?.selectedItemId;
              const selectedItem = fullMenuItems.find((i) => i.id === selectedItemId);

              return (
                <div key={req.key} className="mt-8">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {req.displayName}
                  </h4>
                  {matchingItems.length === 1 ? (
                    <p className="text-sm text-gray-700 mb-4"> {labelWithUpcharge(matchingItems[0])}</p>
                  ) : (
                    <div className="mb-4">
                      <select
                        value={selectedItemId || ""}
                        onChange={(e) =>
                          handleItemChange(req.key, "selectedItemId", Number(e.target.value))
                        }
                        className="w-full border rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select {req.name}</option>
                        {matchingItems.map((item) => (
                          <option key={item.id} value={item.id}>
                             {labelWithUpcharge(item)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {errors[req.key] && (
                    <p className="text-sm text-red-600 mt-2">{errors[req.key]}</p>
                  )}
                </div>
              );
            })}

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
              Add to Order £{totalEach}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
