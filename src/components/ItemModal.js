"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";


export default function ItemModal({ item, onClose }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const modalRef = useRef(null);
  const [imgError, setImgError] = useState(false);


  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (item?.sizes) {
      const firstSize = Object.keys(item.sizes)[0];
      setSelectedSize(firstSize);
    }
  }, [item]);

  // ESC key listener
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Outside click listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Back button listener (popstate)
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onClose]);

  const toggleAddon = (addonName) => {
    setSelectedAddons((prev) =>
      prev.includes(addonName)
        ? prev.filter((a) => a !== addonName)
        : [...prev, addonName]
    );
  };

  const totalPrice = useMemo(() => {
    let basePrice = item.sizes?.[selectedSize] || item.price || 0;

    if (selectedVariation && item.variation?.[selectedVariation]) {
      const variationPrices = item.variation[selectedVariation].prices;
      basePrice += variationPrices?.[selectedSize] || 0;
    }

    let addonTotal = 0;
    if (item.addons) {
      selectedAddons.forEach((addon) => {
        const addonData = item.addons[addon];
        if (typeof addonData === "object" && selectedSize) {
          addonTotal += addonData[selectedSize] || 0;
        } else {
          addonTotal += addonData;
        }
      });
    }

    return (basePrice + addonTotal).toFixed(2);
  }, [selectedSize, selectedVariation, selectedAddons, item]);

  if (!item) return null;

  const handleAdd = () => {
      // Require variation if item has any
  if (item.variation && Object.keys(item.variation).length > 0 && !selectedVariation) {
    alert("Please select a variation before adding to your order.");
    return;
  }
const numericTotalPrice = parseFloat(totalPrice);
const cartLineId = uuidv4();
const variationName = selectedVariation ? item.variation?.[selectedVariation]?.name || null : null;


addToCart({
  id: item.id,
  name: item.name,
  price: numericTotalPrice,
  quantity,
  selectedAddons,
  selectedSize,
  selectedVariation,
  variationName,
  totalPrice: numericTotalPrice * quantity,
  cartLineId
});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 md:p-4 overflow-auto">
      <div
        ref={modalRef}
        className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] w-full h-full md:max-w-[640px] md:max-h-[90vh] md:rounded-lg rounded-none shadow-xl overflow-hidden flex flex-col"
      >
        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Image */}
  {/* Hero Image with Fallback */}
<div className="relative w-full h-72 md:h-96 overflow-hidden bg-[var(--color-card-bg)]">
  {(!item.image_url || imgError) ? (
    <Image
      src="https://cdn.grubify.co.uk/popularpizza/utensil.webp"
      alt="Fallback image"
      fill
      className="object-contain p-6 grayscale opacity-50"
      unoptimized
      
    />
  ) : (
    <Image
      src={item.image_url}
      alt={item.name}
      fill
      className="object-cover"
      onError={() => setImgError(true)}
      unoptimized
    />
  )}
</div>


          {/* Content */}
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">
              {item.name}
            </h1>

            {item.price && (
              <p className="mt-2 text-lg font-semibold text-gray-900">
                £{Number(item.price).toFixed(2)}
              </p>
            )}

            {item.description && (
              <p className="mt-4 text-sm text-gray-700">
                {item.description}
              </p>
            )}

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

            {/* Sizes */}
            {item.sizes && (
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Choose Size
                </h4>
                <div className="divide-y divide-gray-200 border rounded">
                  {Object.keys(item.sizes).map((size) => (
                    <label
                      key={size}
                      className="flex justify-between items-center text-sm py-3 px-3 cursor-pointer hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="size"
                          value={size}
                          checked={selectedSize === size}
                          onChange={() => setSelectedSize(size)}
                          className="accent-accent w-5 h-5 border-gray-300 rounded"
                        />
                        <span className="text-gray-900">
                          {size}”
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        £{item.sizes?.[size].toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Variations */}
            {item.variation && Object.keys(item.variation).length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Choose Variation
                </h4>
                <div className="divide-y divide-gray-200 border rounded">
                  {Object.keys(item.variation).map((key) => {
                    const variationData = item.variation[key];
                    let price = 0;

                    if (
                      variationData?.prices &&
                      selectedSize &&
                      variationData.prices[selectedSize] !== undefined
                    ) {
                      price = variationData.prices[selectedSize];
                    }

                    return (
                      <label
                        key={key}
                        className="flex justify-between items-center text-sm py-3 px-3 cursor-pointer hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="variation"
                            value={key}
                            checked={selectedVariation === key}
                            onChange={() => setSelectedVariation(key)}
                            className="accent-accent w-5 h-5 border-gray-300 rounded"
                          />
                          <span className="text-gray-900">
                            {variationData.name}
                          </span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {price > 0 ? `+£${price.toFixed(2)}` : "+£0.00"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {item.addons && Object.keys(item.addons).length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Add-ons
                </h4>
                <div className="divide-y divide-gray-200 border rounded">
                  {Object.keys(item.addons).map((addonName) => {
                    const addonData = item.addons[addonName];
                    let price;
                    if (typeof addonData === "object" && selectedSize) {
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
                            checked={selectedAddons.includes(addonName)}
                            onChange={() => toggleAddon(addonName)}
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
        </div>

        {/* Floating Footer */}
        <div className="sticky bottom-0 w-full">
          <div className="flex items-center justify-between bg-[var(--color-card-bg)] backdrop-blur border-t px-4 py-3">
            <button
              onClick={onClose}
              className="text-accent hover:text-secondary text-xl font-bold px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition"
            >
              ×
            </button>
<Button
  onClick={handleAdd}
  disabled={item.variation && Object.keys(item.variation).length > 0 && !selectedVariation}
  className="bg-accent hover:bg-secondary text-white font-semibold flex-grow ml-4 py-3 rounded transition text-base disabled:opacity-50 disabled:cursor-not-allowed"
>
  Add to order £{totalPrice}
</Button>

          </div>
        </div>
      </div>
    </div>
  );
}
