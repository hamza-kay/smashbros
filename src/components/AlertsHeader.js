"use client";

import { useContext } from "react";
import { AppIdContext } from "@/components/AppIdProvider";
import { FaInstagram, FaTiktok, FaPhone } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

function isRestaurantCurrentlyOpen(restaurant) {
  if (!restaurant) return false;
  if (restaurant.accepting_orders !== 1) return false;

  const hours = restaurant.opening_hours;
  if (!Array.isArray(hours)) return false;

  const now = new Date();
  const day = now.getDay();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const toMins = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const today = hours.filter((h) => h.DayOfWeek === day);
  const yesterday = (day + 6) % 7;
  const yesterdaysOvernights = hours
    .filter((h) => h.DayOfWeek === yesterday)
    .filter((h) => toMins(h.CloseTime) <= toMins(h.OpenTime));

  const isWithin = (open, close) => {
    const o = toMins(open), c = toMins(close);
    return c > o ? nowMins >= o && nowMins < c : nowMins >= o || nowMins < c;
  };

  return [...today, ...yesterdaysOvernights].some((h) =>
    isWithin(h.OpenTime, h.CloseTime)
  );
}

function getTodayHours(opening_hours) {
  const today = new Date().getDay(); // Sunday = 0
  return opening_hours?.find((entry) => entry.DayOfWeek === today);
}

export default function AlertsHeader({ restaurant }) {
 
  

  if (!restaurant) return null;

  const isRestaurantOpen = isRestaurantCurrentlyOpen(restaurant);
  const todayHours = getTodayHours(restaurant.opening_hours);
  // console.log(restaurant)

return (
<div className="w-full  py-8">
  <div className="max-w-7xl mx-auto px-4">

    <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] shadow-lg rounded-lg overflow-hidden md:flex">



      {/* Left Image */}
      <div className="md:flex-shrink-0 w-full md:w-64 h-64 relative">
        <Image
          src={restaurant.image || "/images/placeholder.jpg"}
          alt={restaurant.title}
          fill
          className="object-cover"
          priority
        />
      </div>

   

      {/* Right Content */}
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-accent font-semibold">
          {restaurant.title}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isRestaurantOpen
                ? "bg-green-100 text-green-800"
                : "bg-accent/10 text-accent"
            }`}
          >
            {isRestaurantOpen ? "OPEN" : "CLOSED"}
          </span>
          <span className="text-gray-500 text-sm">
            {isRestaurantOpen
              ? `Until ${todayHours?.CloseTime?.slice(0, 5)}`
              : `Opens at ${todayHours?.OpenTime?.slice(0, 5)}`}
          </span>
        </div>

        <p className="mt-4 text-gray-600 text-sm font-medium">
          {restaurant.address}
        </p>

        <div className="mt-4 space-y-3 text-sm text-gray-600">
          {restaurant.phone && (
            <div className="flex items-center gap-3">
              <FaPhone className="w-4 h-4" />
              <span>{restaurant.phone}</span>
            </div>
          )}

{restaurant.socials?.instagram && (
  <Link
    href={`https://instagram.com/${restaurant.socials.instagram}`}
    target="_blank"
    rel="noopener noreferrer"
 className="flex items-center gap-3 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition"
    
  >
    <FaInstagram className="w-4 h-4" />
    <span>{restaurant.socials.instagram}</span>
  </Link>
)}

{restaurant.socials?.tiktok && (
  <Link
    href={`https://www.tiktok.com/@${restaurant.socials.tiktok}`}
    target="_blank"
    rel="noopener noreferrer"
className="flex items-center gap-3 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition"
    
  >
    <FaTiktok className="w-4 h-4" />
    <span>{restaurant.socials.tiktok}</span>
  </Link>
)}

        </div>
      </div>
    </div>
  </div>
  </div>
);

}
