import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ReelsSection } from "@/components/home/ReelsSection";
import { CatalogSection } from "@/components/home/CatalogSection";

export const metadata: Metadata = {
  title: "Premium Shopping, Delivered",
};

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <ReelsSection />
      <CatalogSection />
    </div>
  );
}
