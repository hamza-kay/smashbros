"use client";
import { useEffect, useState } from "react";

export default function StickySectionTabs({ sections }) {
  const [activeSection, setActiveSection] = useState(sections?.[0]?.id || "");

  const handleClick = (sectionId) => {
    setActiveSection(sectionId);

    const el = document.getElementById(`section-${sectionId}`);
    if (!el) return;

    if (window.scrollY <= 50) {
      window.scrollTo({ top: 51, behavior: "instant" });
    }

    requestAnimationFrame(() => {
      const header = document.querySelector("header");
      const headerHeight = header?.offsetHeight || 0;
      const tabs = document.querySelector(".tabs-sticky");
      const tabsHeight = tabs?.offsetHeight || 0;
      const totalOffset = headerHeight + tabsHeight + 15;
      const y = el.getBoundingClientRect().top + window.scrollY - totalOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  };

  

  return (
     <div className="sticky max-w-7xl mx-auto sm:px-4 z-40 top-[75px] md:top-[60px] lg:top-[65px]">
  
      <nav className="tabs-sticky max-w-7xl mx-auto bg-[var(--color-card-bg)] border border-[var(--color-card-border)] shadow-sm rounded-lg py-3">
      <div className="flex overflow-x-auto hide-scrollbar px-4 gap-4 lg:justify-center">

          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleClick(section.id)}
  className={`px-3 py-2 transition whitespace-nowrap
    font-semibold tracking-normal
    text-sm sm:text-base
    ${activeSection === section.id
      ? "text-accent"
      : "text-gray-600 hover:text-secondary"
    }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}