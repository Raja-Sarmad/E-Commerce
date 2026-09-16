"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/utils";

type HeroSlide = {
  id: string;
  image: string;
  bottomTitle: string;
};

const slides: HeroSlide[] = [
  {
    id: "hero-1",
    image: "/images/hero1.webp",
    bottomTitle: "FESTIVE UNSTITCHED",
  },
  {
    id: "hero-2",
    image: "/images/hero2.webp",
    bottomTitle: "FESTIVE PRET",
  },
  {
    id: "hero-3",
    image: "/images/hero3.webp",
    bottomTitle: "NEW COLLECTION",
  },
];

const AUTOPLAY_MS = 7000;

export function Hero() {
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => {
    setActive((index + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, []);

  const scrollToContent = () => {
    const target = document.getElementById("home-content");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const slide = slides[active];

  return (
    <section aria-label="Featured collection" className="relative w-full bg-card">
      <div className="relative min-h-[520px] overflow-hidden sm:min-h-[600px] lg:min-h-[680px]">
        {slides.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === active ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            aria-hidden={index !== active}
          >
            <Image
              src={item.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent"
              aria-hidden
            />
          </div>
        ))}

        <p className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2 text-[11px] font-normal uppercase tracking-[0.42em] text-white sm:bottom-14 sm:text-xs">
          {slide.bottomTitle}
        </p>

        <div className="absolute right-4 bottom-12 z-20 flex items-center gap-2.5 sm:right-6 sm:bottom-14">
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => goTo(index)}
              className={cn(
                "rounded-full transition-all duration-300",
                index === active
                  ? "h-3 w-3 border border-white bg-transparent"
                  : "h-1.5 w-1.5 bg-white/75 hover:bg-white"
              )}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToContent}
        aria-label="Scroll to collections"
        className="absolute bottom-0 left-1/2 z-30 flex h-11 w-11 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-transform hover:scale-105 sm:h-12 sm:w-12"
      >
        <FiChevronDown className="h-5 w-5 text-neutral-400" aria-hidden />
      </button>
    </section>
  );
}
