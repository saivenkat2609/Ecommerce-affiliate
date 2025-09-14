import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, TrendingDown, TrendingUp, Target } from "lucide-react";

const PriceAlerts = () => {
  const alerts = [
    {
      id: 1,
      product: "MacBook Pro 14-inch",
      currentPrice: 1899,
      targetPrice: 1799,
      priceChange: -100,
      changeType: "drop",
      image: "💻",
      alerts: 847
    },
    {
      id: 2,
      product: "iPhone 15 Pro",
      currentPrice: 999,
      targetPrice: 949,
      priceChange: 50,
      changeType: "rise",
      image: "📱",
      alerts: 1254
    },
    {
      id: 3,
      product: "Sony WH-1000XM5",
      currentPrice: 299,
      targetPrice: 249,
      priceChange: -50,
      changeType: "drop",
      image: "🎧",
      alerts: 623
    }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-foreground mb-2">Price Drop Alerts</h3>
          <p className="text-muted-foreground">Get notified when your favorite products go on sale</p>
        </div>

        {/* How it Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Set Target Price</h4>
              <p className="text-sm text-muted-foreground">Choose your ideal price for any product</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Get Notified</h4>
              <p className="text-sm text-muted-foreground">Receive instant alerts when prices drop</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingDown className="h-12 w-12 text-price-drop mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Save Money</h4>
              <p className="text-sm text-muted-foreground">Buy at the perfect time and save big</p>
            </CardContent>
          </Card>
        </div>

        {/* Popular Price Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Popular Price Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{alert.image}</div>
                    <div>
                      <h4 className="font-semibold text-foreground">{alert.product}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{alert.alerts} people watching</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Price Info */}
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">${alert.currentPrice}</span>
                        {alert.changeType === "drop" ? (
                          <TrendingDown className="h-4 w-4 text-price-drop" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-price-rise" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: ${alert.targetPrice}
                      </div>
                    </div>

                    {/* Price Change */}
                    <Badge 
                      variant="outline" 
                      className={alert.changeType === "drop" ? "text-price-drop border-price-drop" : "text-price-rise border-price-rise"}
                    >
                      {alert.changeType === "drop" ? "-" : "+"}${Math.abs(alert.priceChange)}
                    </Badge>

                    {/* Action Button */}
                    <Button variant="outline" size="sm">
                      Set Alert
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                View All Price Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PriceAlerts;