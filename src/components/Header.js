"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, User } from "lucide-react";
import AlertsHeader from "@/components/AlertsHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import StickySectionTabs from "@/components/StickySectionTabs";

export default function Header({ sections, restaurant }) {
  const totalItems = useCartStore((state) => state.totalItems());
  const groupedCount = useCartStore((state) => state.groupedCartCount());
  const totalPrice = useCartStore((state) => state.totalPrice("other")); 
  const [isHeroHidden, setIsHeroHidden] = useState(false);
  const [activeSection, setActiveSection] = useState(sections?.[0]?.id || "");


  useEffect(() => {
    const handleScroll = () => {
      setIsHeroHidden(window.scrollY > 50);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* TOP NAV — STICKY */}
<header className="bg-[var(--color-background)]  sticky top-0 z-50">
  <div className="w-full border-b">
   <div className="max-w-7xl mx-auto flex items-center justify-between md:justify-between justify-center  px-4 py-4 sm:py-3 md:py-2">
      <Link href="/" className="flex items-center gap-3">
        <Image
        //  src={restaurant.logo || "/images/placeholder.jpg"}
        src="/logo.jpg"
          alt={restaurant?.title || ""}
          width={160}
          height={50}
          className="h-[50px] w-auto object-contain rounded-md shadow-sm"
          
        />
      </Link>
      

       {/* <Link href="/" className="flex items-center gap-3">
  <div
    className="h-[50px] w-[160px] object-contain bg-transparent"
    aria-hidden="true"
  />
</Link> */}

      <div className="hidden md:flex items-center gap-4">
        <Button
          variant="default"
          size="sm"
    className="hidden md:inline-flex bg-accent hover:bg-secondary text-white"
>
          Order Now
        </Button>
     <User className="w-5 h-5 text-white" />
        <Link href="/cart" className="relative">
         <ShoppingCart className="w-5 h-5 text-white" />
          {groupedCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {groupedCount}
              
            </span>
            
            
          )}
          
        </Link>
      </div>
    </div>
  </div>
</header>


      {/* ALERTS HEADER — NON-STICKY */}
      <AlertsHeader restaurant={restaurant} isHeroHidden={isHeroHidden} />

      {/* TABS — STICKY BELOW HERO */}

{sections?.length > 0 && <StickySectionTabs sections={sections} />}


    </>
  );
}