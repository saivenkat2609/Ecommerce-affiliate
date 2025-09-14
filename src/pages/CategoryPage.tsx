import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  Heart,
  TrendingDown,
  TrendingUp,
  Filter,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import FilterSidebar from "@/components/FilterSidebar";

interface Product {
  id: string;
  asin?: string;
  title: string;
  price: number | null;
  originalPrice: number | null;
  currency?: string;
  rating: number;
  reviews: number;
  image: string | null;
  isNew: boolean;
  priceChange?: "up" | "down" | null;
  priceChangeAmount?: number;
  features: string[];
  detailPageURL?: string;
  category?: string;
}

interface Filters {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  minRating: number;
  features: string[];
}

// Currency formatter function
const formatPrice = (price: number | null, currency: string = 'INR'): string => {
  if (!price) return 'Price not available';

  const currencySymbols: { [key: string]: string } = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };

  const symbol = currencySymbols[currency] || '₹';
  return `${symbol}${price.toLocaleString('en-IN')}`;
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [showFilters, setShowFilters] = useState(false);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 50000],
    categories: [],
    brands: [],
    minRating: 0,
    features: []
  });
  const categoryNames: { [key: string]: string } = {
    electronics: "Electronics",
    fashion: "Fashion",
    "home-garden": "Home & Garden",
    sports: "Sports",
    books: "Books",
    "todays-deals": "Today's Deals",
  };

  // Category emoji mappings for fallback display
  const categoryEmojis: { [key: string]: string } = {
    electronics: "📱",
    fashion: "👕",
    "home-garden": "🏠",
    sports: "⚽",
    books: "📚",
    "todays-deals": "🔥",
  };

  // Note: Client-side filtering removed - PA-API handles all filtering server-side

  // Use originalProducts directly since filtering is done by PA-API server-side
  const products = originalProducts;

  // Reset to page 1 when filters change
  useEffect(() => {
    console.log('Filters or sortBy changed, resetting to page 1');
    console.log('New filters:', filters);
    console.log('New sortBy:', sortBy);
    setCurrentPage(1);
  }, [
    sortBy,
    // Track individual filter properties to ensure useEffect triggers
    filters.priceRange[0],
    filters.priceRange[1],
    filters.brands.join(','),
    filters.categories.join(','),
    filters.minRating,
    filters.features.join(',')
  ]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!category) return;

      setLoading(true);
      setError(null);
      setHasMoreProducts(true);

      try {
        // Map category to appropriate keywords for PA-API search
        const categoryKeywords: { [key: string]: string } = {
          electronics: "electronics",
          fashion: "fashion clothing",
          "home-garden": "home kitchen garden",
          sports: "sports fitness",
          books: "books",
          "todays-deals": "deals"
        };

        const searchKeywords = categoryKeywords[category] || category;
        console.log(`Fetching products for category: ${category} with keywords: ${searchKeywords}`);
        console.log('Current filters:', filters);
        console.log('Current sortBy:', sortBy);

        // Build query parameters including filters
        const queryParams = new URLSearchParams({
          itemCount: '8',
          keywords: searchKeywords,
          page: currentPage.toString()
        });

        // Add filter parameters if they have meaningful values
        if (filters.priceRange[0] > 0) {
          queryParams.append('minPrice', filters.priceRange[0].toString());
        }
        if (filters.priceRange[1] < 50000) {
          queryParams.append('maxPrice', filters.priceRange[1].toString());
        }
        if (filters.brands.length > 0) {
          filters.brands.forEach(brand => queryParams.append('brand', brand));
        }
        if (filters.minRating > 0) {
          queryParams.append('minRating', filters.minRating.toString());
        }
        if (sortBy !== 'featured') {
          queryParams.append('sortBy', sortBy);
        }

        console.log('Final query params:', queryParams.toString());

        const response = await fetch(
          `http://localhost:3001/api/search/category/${category}?${queryParams.toString()}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError(`Category '${category}' not found`);
          } else {
            setError(`HTTP error! status: ${response.status}`);
          }
          setOriginalProducts([]);
          setHasMoreProducts(false);
          return;
        }

        const data = await response.json();
        console.log("Category API response:", data);

        if (data.success && data.products && data.products.length > 0) {
          const formattedProducts: Product[] = data.products.map(
            (product: any, index: number) => ({
              id: product.id || product.asin || `${category}-${index}`,
              asin: product.asin,
              title: product.title || "Unknown Product",
              price: product.price,
              originalPrice: product.originalPrice,
              currency: product.currency || 'INR',
              rating: product.rating || 0,
              reviews: product.reviews || 0,
              image: product.image || categoryEmojis[category] || "📦",
              isNew: product.isNew || false,
              priceChange: product.priceChange || null,
              priceChangeAmount: product.priceChangeAmount || 0,
              features:
                product.features && product.features.length > 0
                  ? product.features
                  : ["Amazon Product"],
              detailPageURL: product.detailPageURL,
              category: category,
            })
          );

          setOriginalProducts(formattedProducts);
          setCurrentPage(data.currentPage || 1);
          setHasMoreProducts(data.hasMoreResults || false);
        } else {
          console.warn("No products returned from category API:", data);
          setOriginalProducts([]);
          setError(data.message || "No products found in this category");
          setHasMoreProducts(false);
        }
      } catch (error) {
        console.error("Failed to fetch category products:", error);
        setError(
          "Failed to load products from Amazon API. Please check if the backend server is running."
        );
        setOriginalProducts([]);
        setHasMoreProducts(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [
    category,
    currentPage,
    sortBy,
    // Track individual filter properties to ensure useEffect triggers
    filters.priceRange[0],
    filters.priceRange[1],
    filters.brands.join(','),
    filters.categories.join(','),
    filters.minRating,
    filters.features.join(',')
  ]);

  // Load more products function for categories
  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreProducts || !category) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(
        `Loading more products for category: ${category}, page: ${nextPage}`
      );

      // Use the same keywords logic as the initial load
      const categoryKeywords: { [key: string]: string } = {
        electronics: "electronics",
        fashion: "fashion clothing",
        "home-garden": "home kitchen garden",
        sports: "sports fitness",
        books: "books",
        "todays-deals": "deals"
      };

      const searchKeywords = categoryKeywords[category] || category;

      // Build query parameters including filters for load more
      const queryParams = new URLSearchParams({
        itemCount: '8',
        keywords: searchKeywords,
        page: nextPage.toString()
      });

      // Add current filter parameters
      if (filters.priceRange[0] > 0) {
        queryParams.append('minPrice', filters.priceRange[0].toString());
      }
      if (filters.priceRange[1] < 50000) {
        queryParams.append('maxPrice', filters.priceRange[1].toString());
      }
      if (filters.brands.length > 0) {
        filters.brands.forEach(brand => queryParams.append('brand', brand));
      }
      if (filters.minRating > 0) {
        queryParams.append('minRating', filters.minRating.toString());
      }
      if (sortBy !== 'featured') {
        queryParams.append('sortBy', sortBy);
      }

      const response = await fetch(
        `http://localhost:3001/api/search/category/${category}?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.products && data.products.length > 0) {
        const formattedProducts: Product[] = data.products.map(
          (product: any, index: number) => ({
            id: `${
              product.id || product.asin || category
            }-page${nextPage}-${index}`,
            asin: product.asin,
            title: product.title || "Unknown Product",
            price: product.price,
            originalPrice: product.originalPrice,
            currency: product.currency || 'INR',
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            image: product.image || categoryEmojis[category] || "📦",
            isNew: product.isNew || false,
            priceChange: product.priceChange || null,
            priceChangeAmount: product.priceChangeAmount || 0,
            features:
              product.features && product.features.length > 0
                ? product.features
                : ["Amazon Product"],
            detailPageURL: product.detailPageURL,
            category: category,
          })
        );

        const newProducts = [...originalProducts, ...formattedProducts];
        setOriginalProducts(newProducts);

        setCurrentPage(data.currentPage || nextPage);
        setHasMoreProducts(data.hasMoreResults || false);
      } else {
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error("Failed to load more category products:", error);
      setError("Failed to load more products");
    } finally {
      setLoadingMore(false);
    }
  };

  // Note: Sorting handled by PA-API server-side via SortBy parameter

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    // The useEffect will trigger a new API call with updated sort parameter
  };

  const displayName = category
    ? categoryNames[category] || category
    : "Unknown Category";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">{displayName}</span>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block w-80 shrink-0">
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-1">
                    {displayName}
                  </h1>
                  <p className="text-muted-foreground">
                    {loading
                      ? "Loading products..."
                      : `Showing ${
                          products.length
                        } products in ${displayName.toLowerCase()}`}
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
                  <span className="ml-2">
                    Loading {displayName.toLowerCase()} products...
                  </span>
                </div>
              )}

              {/* Products Grid */}
              {!loading && products.length > 0 && (
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
                            {product.image &&
                            product.image.startsWith("http") ? (
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
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium ml-1">
                              {product.rating > 0 ? product.rating.toFixed(1) : 'No rating'}
                            </span>
                            {product.reviews > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({product.reviews.toLocaleString()})
                              </span>
                            )}
                          </div>

                          {/* Price & Price Change */}
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-foreground">
                                {formatPrice(product.price, product.currency)}
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
                                    {formatPrice(product.priceChangeAmount, product.currency)}
                                  </span>
                                </div>
                              )}
                            </div>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.originalPrice, product.currency)}
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
                        You've reached the end of products in this category
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* No Products State */}
              {!loading && products.length === 0 && !error && (
                <div className="text-center py-20">
                  <h3 className="text-lg font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground">
                    We couldn't find any products in this category.
                  </p>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="text-center py-20">
                  <h3 className="text-lg font-semibold mb-2 text-red-500">
                    Error
                  </h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="fixed right-0 top-0 h-full w-80 bg-background overflow-y-auto">
                <FilterSidebar
                  onClose={() => setShowFilters(false)}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;
