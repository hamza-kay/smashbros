"use client";

import Image from "next/image";
import { useState } from "react";

export default function MenuItem({ item, onClick }) {
  const fallbackUrl = "https://cdn.grubify.co.uk/popularpizza/utensil.webp";
  const [imgError, setImgError] = useState(false);
  const showFallback = !item.image_url || imgError;

  return (
    <div
      onClick={onClick}
      className="
        w-full bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 cursor-pointer
        flex flex-row items-center gap-3 p-2 h-28
        md:flex-col md:items-stretch md:gap-0 md:p-0 md:h-[350px]
        md:hover:scale-105
      "
    >
      {/* IMAGE */}
      <div
        className="
          relative shrink-0 bg-[var(--color-card-bg)] overflow-hidden
          w-24 h-24 rounded-md
          md:w-full md:h-[200px] md:rounded-none
        "
      >
        <Image
          src={showFallback ? fallbackUrl : item.image_url}
          alt={item.name || "Menu item"}
          fill
          className={showFallback ? "object-contain p-6 grayscale opacity-50" : "object-cover"}
          sizes="(max-width: 768px) 96px, (min-width: 768px) 100vw"
          onError={() => setImgError(true)}
          priority
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-1 md:px-6 md:pt-6 md:pb-6">
        <h3 className="!font-bold text-gray-800 line-clamp-1 text-base md:text-xl">
          {item.name}
        </h3>

        <p className="text-gray-600 mt-1 md:mt-2 line-clamp-1 text-xs md:text-sm">
          {item.description}
        </p>

        {item.kcal && (
          <p className="mt-1 text-[11px] md:text-xs text-gray-500">
            {item.kcal} kcal
          </p>
        )}

        <p className="font-bold mt-1 md:mt-4 text-[15px] md:text-lg text-accent md:text-accent">
          £{(item.price || Object.values(item.sizes || {})[0] || 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
}