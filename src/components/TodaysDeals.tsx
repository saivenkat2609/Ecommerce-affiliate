import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Star, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";

const TodaysDeals = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 32
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const deals = [
    {
      id: 1,
      title: "Wireless Headphones Pro",
      originalPrice: 299,
      dealPrice: 149,
      discount: 50,
      rating: 4.8,
      reviews: 2847,
      image: "🎧",
      limited: true
    },
    {
      id: 2,
      title: "Smart Watch Series X",
      originalPrice: 449,
      dealPrice: 279,
      discount: 38,
      rating: 4.6,
      reviews: 1653,
      image: "⌚",
      limited: false
    },
    {
      id: 3,
      title: "4K Gaming Monitor",
      originalPrice: 599,
      dealPrice: 399,
      discount: 33,
      rating: 4.9,
      reviews: 892,
      image: "🖥️",
      limited: true
    },
    {
      id: 4,
      title: "Bluetooth Speaker",
      originalPrice: 129,
      dealPrice: 79,
      discount: 39,
      rating: 4.5,
      reviews: 1245,
      image: "🔊",
      limited: false
    }
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h3 className="text-3xl font-bold text-foreground mb-2">Today's Deals</h3>
            <p className="text-muted-foreground">Limited time offers - grab them while they last!</p>
          </div>
          
          {/* Countdown Timer */}
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Clock className="text-deal h-5 w-5" />
            <div className="flex gap-2 text-2xl font-bold text-deal">
              <span className="bg-deal text-deal-foreground px-2 py-1 rounded">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span>:</span>
              <span className="bg-deal text-deal-foreground px-2 py-1 rounded">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span>:</span>
              <span className="bg-deal text-deal-foreground px-2 py-1 rounded">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <Card key={deal.id} className="group hover:shadow-card-hover transition-all duration-300 cursor-pointer">
              <CardContent className="p-4">
                {/* Deal Badge */}
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="destructive" className="bg-deal text-deal-foreground">
                    -{deal.discount}%
                  </Badge>
                  {deal.limited && (
                    <Badge variant="outline" className="text-xs">
                      Limited
                    </Badge>
                  )}
                </div>

                {/* Product Image */}
                <div className="text-6xl mb-4 text-center">{deal.image}</div>

                {/* Product Info */}
                <h4 className="font-semibold text-foreground mb-2 line-clamp-2">{deal.title}</h4>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{deal.rating}</span>
                  <span className="text-xs text-muted-foreground">({deal.reviews})</span>
                </div>

                {/* Pricing */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">${deal.dealPrice}</span>
                    <TrendingDown className="h-4 w-4 text-price-drop" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
                    <span className="text-sm text-price-drop font-medium">Save ${deal.originalPrice - deal.dealPrice}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full group-hover:bg-deal group-hover:text-deal-foreground transition-colors">
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All Today's Deals
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TodaysDeals;