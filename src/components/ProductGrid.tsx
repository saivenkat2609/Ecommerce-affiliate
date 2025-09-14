import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Heart, TrendingDown, TrendingUp, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import FilterSidebar from "./FilterSidebar";

interface Product {
  id: string;
  asin?: string;
  title: string;
  price: number | null;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string | null;
  isNew: boolean;
  priceChange?: "up" | "down" | null;
  priceChangeAmount?: number;
  features: string[];
  detailPageURL?: string;
}

const ProductGrid = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  const fallbackProducts: Product[] = [
    {
      id: "1",
      title: "Premium Wireless Headphones",
      price: 199,
      originalPrice: 249,
      rating: 4.8,
      reviews: 1247,
      image: "🎧",
      isNew: true,
      priceChange: "down",
      priceChangeAmount: 20,
      features: ["Free Shipping", "Prime"]
    },
    {
      id: "2",
      title: "Smart Fitness Watch",
      price: 299,
      originalPrice: null,
      rating: 4.6,
      reviews: 893,
      image: "⌚",
      isNew: false,
      priceChange: "up",
      priceChangeAmount: 15,
      features: ["Same Day Delivery"]
    },
    {
      id: "3",
      title: "Laptop Stand Adjustable",
      price: 45,
      originalPrice: 69,
      rating: 4.9,
      reviews: 567,
      image: "💻",
      isNew: false,
      priceChange: "down",
      priceChangeAmount: 5,
      features: ["Free Shipping"]
    },
    {
      id: "4",
      title: "Wireless Gaming Mouse",
      price: 79,
      originalPrice: null,
      rating: 4.7,
      reviews: 423,
      image: "🖱️",
      isNew: true,
      priceChange: null,
      features: ["Prime", "New Arrival"]
    },
    {
      id: "5",
      title: "USB-C Hub 7-in-1",
      price: 39,
      originalPrice: 59,
      rating: 4.5,
      reviews: 234,
      image: "🔌",
      isNew: false,
      priceChange: "down",
      priceChangeAmount: 8,
      features: ["Free Shipping"]
    },
    {
      id: "6",
      title: "Bluetooth Speaker Portable",
      price: 89,
      originalPrice: null,
      rating: 4.4,
      reviews: 356,
      image: "🔊",
      isNew: false,
      priceChange: "up",
      priceChangeAmount: 10,
      features: ["Same Day Delivery", "Prime"]
    }
  ];

  useEffect(() => {
    const fetchProducts = async (reset = true) => {
      try {
        if (reset) {
          setLoading(true);
          setCurrentPage(1);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const response = await fetch('http://localhost:3001/api/products/sample');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.products && data.products.length > 0) {
          const formattedProducts: Product[] = data.products.map((product: any) => ({
            id: product.id || product.asin,
            asin: product.asin,
            title: product.title || 'Unknown Product',
            price: product.price,
            originalPrice: product.originalPrice,
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            image: product.image || '📦',
            isNew: false,
            priceChange: null,
            features: ["Amazon Product"],
            detailPageURL: product.detailPageURL
          }));

          if (reset) {
            setProducts(formattedProducts);
            setOriginalProducts(formattedProducts);
          } else {
            // For ProductGrid, we'll simulate additional products by duplicating with new IDs
            const additionalProducts = formattedProducts.map((product, index) => ({
              ...product,
              id: `${product.id}-page${currentPage}-${index}`,
              title: `${product.title} (More Results)`
            }));
            setProducts(prev => [...prev, ...additionalProducts]);
            setOriginalProducts(prev => [...prev, ...additionalProducts]);
          }

          // Simulate having more products available (in real scenario, this would come from API)
          setHasMoreProducts(currentPage < 3); // Allow up to 3 pages for demo
        } else {
          console.warn('No products returned from API, using fallback products');
          const productsToSet = reset ? fallbackProducts : [];
          setProducts(productsToSet);
          setOriginalProducts(productsToSet);
          setHasMoreProducts(false);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Failed to load products from Amazon API');
        if (reset) {
          setProducts(fallbackProducts);
          setOriginalProducts(fallbackProducts);
        }
        setHasMoreProducts(false);
      } finally {
        if (reset) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    };

    fetchProducts(true);
  }, []);

  // Load more products function
  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreProducts) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch('http://localhost:3001/api/products/sample');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.products && data.products.length > 0) {
        const formattedProducts: Product[] = data.products.map((product: any, index: number) => ({
          id: `${product.id || product.asin}-page${nextPage}-${index}`,
          asin: product.asin,
          title: `${product.title || 'Unknown Product'} (Page ${nextPage})`,
          price: product.price,
          originalPrice: product.originalPrice,
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          image: product.image || '📦',
          isNew: Math.random() > 0.7, // Randomly mark some as new
          priceChange: Math.random() > 0.6 ? (Math.random() > 0.5 ? 'down' : 'up') : null,
          priceChangeAmount: Math.floor(Math.random() * 50) + 5,
          features: ["Amazon Product"],
          detailPageURL: product.detailPageURL
        }));

        const newProducts = [...originalProducts, ...formattedProducts];
        setOriginalProducts(newProducts);

        // Apply current sort to new combined products
        const sortedProducts = sortProducts(newProducts, sortBy);
        setProducts(sortedProducts);

        setCurrentPage(nextPage);
        setHasMoreProducts(nextPage < 3); // Limit to 3 pages for demo
      } else {
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error('Failed to load more products:', error);
      setError('Failed to load more products');
    } finally {
      setLoadingMore(false);
    }
  };

  // Sort functionality
  const sortProducts = (products: Product[], sortType: string): Product[] => {
    const sortedProducts = [...products];

    switch (sortType) {
      case "price-low":
        return sortedProducts.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceA - priceB;
        });
      case "price-high":
        return sortedProducts.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceB - priceA;
        });
      case "rating":
        return sortedProducts.sort((a, b) => b.rating - a.rating);
      case "newest":
        return sortedProducts.sort((a, b) => {
          // Sort by isNew first, then by id for consistency
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return b.id.localeCompare(a.id);
        });
      case "featured":
      default:
        return originalProducts; // Return original order for featured
    }
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    const sortedProducts = sortProducts(originalProducts, newSortBy);
    setProducts(sortedProducts);
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-80 shrink-0">
            <FilterSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  Products
                </h3>
                <p className="text-muted-foreground">
                  {loading
                    ? "Loading products..."
                    : `Showing ${products.length} results`}
                  {error && (
                    <span className="text-red-500 ml-2">({error})</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading products...</span>
              </div>
            )}

            {/* Products Grid */}
            {!loading && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="group hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        if (product.detailPageURL) {
                          window.open(product.detailPageURL, "_blank");
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        {/* Badges */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-1">
                            {product.isNew && (
                              <Badge className="bg-primary text-primary-foreground text-xs">
                                New
                              </Badge>
                            )}
                            {product.originalPrice && (
                              <Badge
                                variant="destructive"
                                className="bg-deal text-deal-foreground text-xs"
                              >
                                Sale
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Product Image */}
                        <div className="text-6xl mb-4 text-center h-24 flex items-center justify-center">
                          {product.image && product.image.startsWith("http") ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling!.textContent =
                                  "📦";
                              }}
                            />
                          ) : (
                            <span>{product.image || "📦"}</span>
                          )}
                        </div>

                        {/* Product Info */}
                        <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
                          {product.title}
                        </h4>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {product.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviews})
                          </span>
                        </div>

                        {/* Price & Price Change */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-foreground">
                              {product.price
                                ? `$${product.price}`
                                : "Price not available"}
                            </span>
                            {product.priceChange && (
                              <div className="flex items-center gap-1">
                                {product.priceChange === "down" ? (
                                  <TrendingDown className="h-4 w-4 text-price-drop" />
                                ) : (
                                  <TrendingUp className="h-4 w-4 text-price-rise" />
                                )}
                                <span
                                  className={`text-xs font-medium ${
                                    product.priceChange === "down"
                                      ? "text-price-drop"
                                      : "text-price-rise"
                                  }`}
                                >
                                  ${product.priceChangeAmount}
                                </span>
                              </div>
                            )}
                          </div>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {product.features.map((feature) => (
                            <Badge
                              key={feature}
                              variant="outline"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>

                        {/* Action Button */}
                        <Button
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.detailPageURL) {
                              window.open(product.detailPageURL, "_blank");
                            }
                          }}
                        >
                          {product.detailPageURL
                            ? "View on Amazon"
                            : "Add to Cart"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {hasMoreProducts && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="min-w-48"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading More...
                        </>
                      ) : (
                        `Load More Products (Page ${currentPage + 1})`
                      )}
                    </Button>
                  </div>
                )}

                {!hasMoreProducts && products.length > 0 && (
                  <div className="text-center mt-8">
                    <p className="text-muted-foreground">
                      You've reached the end of our product catalog
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
            <div className="fixed right-0 top-0 h-full w-80 bg-background overflow-y-auto">
              <FilterSidebar onClose={() => setShowFilters(false)} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;