import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-hero-gradient text-primary-foreground py-16 px-4">
      <div className="container mx-auto text-center">
        <Badge variant="secondary" className="mb-4 bg-deal text-deal-foreground">
          <Clock className="w-3 h-3 mr-1" />
          Limited Time Offer
        </Badge>
        
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          Super Summer Sale
        </h2>
        
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Up to 70% off on electronics, fashion & more
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" variant="secondary" className="bg-deal text-deal-foreground hover:bg-deal/90">
            Shop Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            View All Deals
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">24h</div>
            <div className="text-sm opacity-80">Fast Delivery</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">30D</div>
            <div className="text-sm opacity-80">Easy Returns</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">24/7</div>
            <div className="text-sm opacity-80">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;