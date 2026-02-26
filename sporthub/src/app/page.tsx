import { DiscoveryList } from "@/components/discovery-list";
import { HomeHero } from "@/components/home-hero";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8" data-testid="discovery-page">
      <HomeHero />
      <div className="mt-6">
        <DiscoveryList />
      </div>
    </main>
  );
}
