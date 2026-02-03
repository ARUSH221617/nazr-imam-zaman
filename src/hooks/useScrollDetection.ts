"use client";

import { useState, useEffect } from "react";

export function useScrollDetection() {
  const [scrolled, setScrolled] = useState(false);
  const [substantialScroll, setSubstantialScroll] = useState(false);

  // Enhanced scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage =
        documentHeight > 0 ? scrollY / documentHeight : 0;

      // Activate floating counter after scrolling 30% down the page
      setSubstantialScroll(scrollPercentage > 0.3);
      setScrolled(scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Run once on mount to handle initial scroll position
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { scrolled, substantialScroll };
}
