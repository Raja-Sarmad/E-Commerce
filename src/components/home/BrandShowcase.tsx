import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { brands } from "@/lib/data/content";
import { cn } from "@/lib/utils";

const gradients: Record<string, string> = {
  sonix: "from-violet-500 to-fuchsia-500",
  techone: "from-sky-500 to-blue-600",
  vortex: "from-emerald-500 to-teal-600",
  auraoak: "from-amber-500 to-orange-600",
  lumen: "from-rose-500 to-pink-600",
  northbound: "from-indigo-500 to-purple-600",
  botaniq: "from-lime-500 to-green-600",
  trailpeak: "from-orange-500 to-red-600",
};

export function BrandShowcase() {
  return (
    <section aria-labelledby="brands-heading" className="py-12 sm:py-16">
      <Container>
        <SectionHeader
          badge="Brands"
          title="Trusted brands we carry"
          subtitle="Partnering with brands that share our obsession with quality."
        />
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex w-max animate-marquee gap-10 px-10 py-8 hover:[animation-play-state:paused]">
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                className="flex items-center gap-2.5 opacity-70 transition-opacity hover:opacity-100"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-extrabold text-white",
                    gradients[brand.logo] ?? "from-primary to-primary-strong"
                  )}
                >
                  {brand.name.charAt(0)}
                </span>
                <span className="whitespace-nowrap text-base font-bold tracking-tight text-foreground">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
