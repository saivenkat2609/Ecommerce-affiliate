import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TodaysDeals from "@/components/TodaysDeals";
import ProductGrid from "@/components/ProductGrid";
import PriceAlerts from "@/components/PriceAlerts";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        {/* <ProductGrid /> */}
        <TodaysDeals />
        <PriceAlerts />
      </main>
    </div>
  );
};

export default Index;
