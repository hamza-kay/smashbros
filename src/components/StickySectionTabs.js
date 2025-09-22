"use client";
import { useRef, useState } from "react";

export default function StickySectionTabs({ sections }) {
  const [activeSection, setActiveSection] = useState(sections?.[0]?.id || "");
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  // Only handle mouse drag, never touch!
  const onMouseDown = (e) => {
    // Only allow left mouse button & only desktop
    if (e.button !== 0 || window.innerWidth < 640) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    scrollStartX.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;
    scrollRef.current.scrollLeft = scrollStartX.current - dx;
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "";
    document.body.style.userSelect = "";
  };

  // Clean up event listeners if you want to be extra safe (optional)

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
        <div
          ref={scrollRef}
          className="flex overflow-x-auto hide-scrollbar lg:px-12 px-4 gap-4 lg:justify-center"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            cursor: isDragging.current ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
<div className="shrink-0 lg:w-115 xl:w-40" aria-hidden="true" />
          
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleClick(section.id)}
              className={`px-3 py-2 transition whitespace-nowrap
                font-semibold tracking-normal
                text-sm sm:text-base
                ${activeSection === section.id
                  ? "text-accent"
                   : "text-muted hover:text-accent"
                }`}
            >
              {section.title}
            </button>
            
          ))}
           {/* <div className="shrink-0 w-2 sm:w-4 md:w-8 lg:w-12" aria-hidden="true" /> */}
        </div>
      </nav>
    </div>
  );
}
