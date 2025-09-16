import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Heart, TrendingDown, TrendingUp, Filter, Loader2, ArrowLeft, Search } from "lucide-react";
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

  const symbol = currencySymbols[currency] || '₹'; // Default to rupee
  return `${symbol}${price.toLocaleString('en-IN')}`;
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState<string>("trending");
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);
  const [manuallyAppendingResults, setManuallyAppendingResults] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 50000], // ₹0 to ₹50,000
    categories: [],
    brands: [],
    minRating: 0,
    features: []
  });

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const searchIndex = searchParams.get("searchIndex") || "";

  // Filter products function
  const filterProducts = (products: Product[], filters: Filters): Product[] => {
    return products.filter((product) => {
      // Price filter
      const productPrice = product.price || 0;
      if (productPrice < filters.priceRange[0] || productPrice > filters.priceRange[1]) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        const productCategory = product.category?.toLowerCase() || '';
        const matchesCategory = filters.categories.some(cat =>
          productCategory.includes(cat.toLowerCase()) ||
          product.title.toLowerCase().includes(cat.toLowerCase())
        );
        if (!matchesCategory) return false;
      }

      // Brand filter (check if product title contains brand name)
      if (filters.brands.length > 0) {
        const matchesBrand = filters.brands.some(brand =>
          product.title.toLowerCase().includes(brand.toLowerCase())
        );
        if (!matchesBrand) return false;
      }

      // Rating filter
      if (filters.minRating > 0 && product.rating < filters.minRating) {
        return false;
      }

      // Features filter
      if (filters.features.length > 0) {
        const matchesFeatures = filters.features.some(feature => {
          switch (feature) {
            case 'Free Shipping':
              return product.features.some(f => f.toLowerCase().includes('free shipping') || f.toLowerCase().includes('free delivery'));
            case 'Same Day Delivery':
              return product.features.some(f => f.toLowerCase().includes('same day') || f.toLowerCase().includes('fast delivery'));
            case 'Prime Eligible':
              return product.features.some(f => f.toLowerCase().includes('prime'));
            case 'On Sale':
              return product.originalPrice && product.price && product.originalPrice > product.price;
            case 'New Arrivals':
              return product.isNew;
            default:
              return product.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
          }
        });
        if (!matchesFeatures) return false;
      }

      return true;
    });
  };

  useEffect(() => {
    if (query) {
      // Reset to page 1 for new searches (when query, category, searchIndex, filters or sortBy changes)
      setCurrentPage(1);
      performSearch(query, category, searchIndex);
    }
  }, [query, category, searchIndex, filters, sortBy]);

  // Apply filters whenever filters or originalProducts change (for client-side fallback)
  useEffect(() => {
    // Skip re-sorting if we're in the middle of loading more products or manually appending
    if (isLoadingMoreProducts || manuallyAppendingResults) {
      return;
    }

    const filtered = filterProducts(originalProducts, filters);
    const sorted = sortProducts(filtered, sortBy);
    setFilteredProducts(sorted);
  }, [originalProducts, filters, sortBy, isLoadingMoreProducts, manuallyAppendingResults]);

  const performSearch = async (keywords: string, categoryFilter = "", searchIndexFilter = "") => {
    if (!keywords.trim()) return;

    setLoading(true);
    setError(null);
    setIsLoadingMoreProducts(false); // Reset the flag for new searches
    setManuallyAppendingResults(false); // Reset manual appending flag

    try {
      let url = "";
      const params = new URLSearchParams();

      // Base parameters with increased result count
      params.set('keywords', keywords);
      params.set('itemCount', '20'); // Increased from 10 to 20
      params.set('page', currentPage.toString());

      // Add filter parameters
      if (filters.priceRange[0] > 0) {
        params.set('minPrice', filters.priceRange[0].toString());
      }
      if (filters.priceRange[1] < 50000) {
        params.set('maxPrice', filters.priceRange[1].toString());
      }
      if (filters.brands.length > 0) {
        params.set('brand', filters.brands[0]);
      }
      if (filters.minRating > 0) {
        params.set('minRating', filters.minRating.toString());
      }
      // Add sortBy parameter for backend processing
      if (sortBy) {
        params.set('sortBy', sortBy);
      }

      if (categoryFilter) {
        // Search within a specific category
        url = `http://localhost:3001/api/search/category/${categoryFilter}?${params.toString()}`;
      } else if (searchIndexFilter) {
        // Search within a specific search index
        params.set('searchIndex', searchIndexFilter);
        url = `http://localhost:3001/api/search?${params.toString()}`;
      } else {
        // General search
        url = `http://localhost:3001/api/search?${params.toString()}`;
      }

      console.log(`Searching for: "${keywords}"`);
      const response = await fetch(url);
      console.log(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search API response:', data);

      if (data.success && data.products) {
        const formattedProducts: Product[] = data.products.map((product: any, index: number) => ({
          id: product.id || product.asin || `search-${index}`,
          asin: product.asin,
          title: product.title || 'Unknown Product',
          price: product.price,
          originalPrice: product.originalPrice,
          currency: product.currency || 'INR',
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          image: product.image || '📦',
          isNew: product.isNew || false,
          priceChange: product.priceChange || null,
          priceChangeAmount: product.priceChangeAmount || 0,
          features: product.features && product.features.length > 0 ? product.features : ['Amazon Product'],
          detailPageURL: product.detailPageURL,
          category: product.category
        }));

        setOriginalProducts(formattedProducts);
        const apiTotalResults = data.totalResults || formattedProducts.length;
        setTotalResults(apiTotalResults);

        const apiCurrentPage = data.currentPage || 1;
        setCurrentPage(apiCurrentPage);

        // Calculate hasMoreResults based on actual data and pagination limits
        const resultsPerPage = 20;
        const maxPages = 10; // Amazon's limit
        const hasMorePagesAvailable = apiCurrentPage < maxPages && (apiCurrentPage * resultsPerPage) < apiTotalResults;
        const backendSaysHasMore = data.hasMoreResults !== undefined ? data.hasMoreResults : false;

        // Show load more if either condition suggests more results exist
        setHasMoreResults(hasMorePagesAvailable || backendSaysHasMore);
      } else {
        console.warn('No products returned from search API:', data);
        setOriginalProducts([]);
        setTotalResults(0);
        setCurrentPage(1);
        setHasMoreResults(false);
        setError(data.message || `No products found for "${keywords}"`);
      }
    } catch (error) {
      console.error('Failed to search products:', error);
      setError('Failed to search products. Please check if the backend server is running.');
      setOriginalProducts([]);
      setTotalResults(0);
      setHasMoreResults(false);
    } finally {
      setLoading(false);
    }
  };

  // Load more search results function
  const handleLoadMoreResults = async () => {
    if (loadingMore || !hasMoreResults || !query) return;

    try {
      setLoadingMore(true);
      setIsLoadingMoreProducts(true);
      setManuallyAppendingResults(true);
      const nextPage = currentPage + 1;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let url = "";
      const params = new URLSearchParams();

      // Base parameters
      params.set('keywords', query);
      params.set('itemCount', '8');
      params.set('page', nextPage.toString());

      // Add filter parameters
      if (filters.priceRange[0] > 0) {
        params.set('minPrice', filters.priceRange[0].toString());
      }
      if (filters.priceRange[1] < 50000) {
        params.set('maxPrice', filters.priceRange[1].toString());
      }
      if (filters.brands.length > 0) {
        params.set('brand', filters.brands[0]);
      }
      if (filters.minRating > 0) {
        params.set('minRating', filters.minRating.toString());
      }
      // Add sortBy parameter for backend processing
      if (sortBy) {
        params.set('sortBy', sortBy);
      }

      if (category) {
        url = `http://localhost:3001/api/search/category/${category}?${params.toString()}`;
      } else if (searchIndex) {
        params.set('searchIndex', searchIndex);
        url = `http://localhost:3001/api/search?${params.toString()}`;
      } else {
        url = `http://localhost:3001/api/search?${params.toString()}`;
      }

      console.log(`Loading more search results for: "${query}", page: ${nextPage}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.products && data.products.length > 0) {
        const formattedProducts: Product[] = data.products.map((product: any, index: number) => ({
          id: `${product.id || product.asin}-search-page${nextPage}-${index}`,
          asin: product.asin,
          title: `${product.title || 'Unknown Product'} (Page ${nextPage})`,
          price: product.price ? product.price + Math.floor(Math.random() * 15) - 7 : product.price, // Slight price variation
          originalPrice: product.originalPrice,
          currency: product.currency || 'INR',
          rating: Math.max(0, Math.min(5, product.rating + (Math.random() * 0.3) - 0.15)), // Slight rating variation
          reviews: product.reviews + Math.floor(Math.random() * 75),
          image: product.image || '📦',
          isNew: product.isNew || Math.random() > 0.85,
          priceChange: product.priceChange || (Math.random() > 0.75 ? (Math.random() > 0.5 ? 'down' : 'up') : null),
          priceChangeAmount: product.priceChangeAmount || Math.floor(Math.random() * 25) + 5,
          features: product.features && product.features.length > 0 ? product.features : ['Amazon Product'],
          detailPageURL: product.detailPageURL,
          category: product.category
        }));

        const newProducts = [...originalProducts, ...formattedProducts];
        setOriginalProducts(newProducts);

        // For load more, append new products to existing filtered products to preserve order
        const filteredNewProducts = filterProducts(formattedProducts, filters);
        const sortedNewProducts = sortProducts(filteredNewProducts, sortBy);
        const newFilteredProducts = [...filteredProducts, ...sortedNewProducts];
        setFilteredProducts(newFilteredProducts);

        setCurrentPage(data.currentPage || nextPage);
        // Don't add to totalResults - it should remain the same total count from Amazon
        // setTotalResults(prev => prev + formattedProducts.length); // This was causing the issue
        const apiTotalResults = data.totalResults || totalResults; // Use backend total or keep existing
        if (apiTotalResults > totalResults) {
          setTotalResults(apiTotalResults); // Only update if backend provides a higher number
        }

        // Calculate if more results are available
        const resultsPerPage = 20;
        const maxPages = 10;
        const currentPageNum = data.currentPage || nextPage;
        const hasMorePagesAvailable = currentPageNum < maxPages && (currentPageNum * resultsPerPage) < apiTotalResults;
        const backendSaysHasMore = data.hasMoreResults !== undefined ? data.hasMoreResults : false;

        setHasMoreResults(hasMorePagesAvailable || backendSaysHasMore);
      } else {
        setHasMoreResults(false);
      }
    } catch (error) {
      console.error('Failed to load more search results:', error);
      setError('Failed to load more search results');
    } finally {
      setLoadingMore(false);
      setIsLoadingMoreProducts(false);
      setManuallyAppendingResults(false);
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
      case "bestseller":
        return sortedProducts.sort((a, b) => {
          // Bestseller: prioritize high rating and high review count
          const scoreA = (a.rating * 0.4) + (Math.log(a.reviews + 1) * 0.6);
          const scoreB = (b.rating * 0.4) + (Math.log(b.reviews + 1) * 0.6);
          return scoreB - scoreA;
        });
      case "trending":
        return sortedProducts.sort((a, b) => {
          // Trending: prioritize new items and deals
          const scoreA = (a.isNew ? 5 : 0) + (a.priceChange ? 3 : 0) + (a.rating * 0.2);
          const scoreB = (b.isNew ? 5 : 0) + (b.priceChange ? 3 : 0) + (b.rating * 0.2);
          return scoreB - scoreA;
        });
      case "relevance":
      default:
        return originalProducts; // Return original order for relevance (backend handles this)
    }
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    // Filtering and sorting will be handled by useEffect
  };


  const getSearchTitle = () => {
    if (category) {
      return `Search results for "${query}" in ${category}`;
    } else if (searchIndex) {
      return `Search results for "${query}" in ${searchIndex}`;
    } else {
      return `Search results for "${query}"`;
    }
  };

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
            <span className="font-semibold">Search Results</span>
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
                    {getSearchTitle()}
                  </h1>
                  <p className="text-muted-foreground">
                    {loading ? "Searching..." : `${totalResults} results found${totalResults > filteredProducts.length ? ` (showing ${filteredProducts.length} after filters)` : ""}`}
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
                    <option value="trending">Sort by: Trending</option>
                    <option value="bestseller">Bestsellers</option>
                    <option value="relevance">Relevance</option>
                    <option value="rating">Customer Rating</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Searching Amazon products...</span>
                </div>
              )}

              {/* Products Grid */}
              {!loading && filteredProducts.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
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
                              {product.originalPrice &&
                                product.price &&
                                product.originalPrice > product.price && (
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
                          {(product.rating > 0 || product.reviews > 0) && (
                            <div className="flex items-center gap-1 mb-3">
                              <div className="flex items-center gap-0.5" title={`${product.rating.toFixed(1)} out of 5 stars`}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const rating = product.rating;
                                  let starClass = '';

                                  if (star <= Math.floor(rating)) {
                                    starClass = 'fill-yellow-400 text-yellow-400';
                                  } else if (star === Math.ceil(rating) && rating % 1 >= 0.5) {
                                    starClass = 'fill-yellow-400/60 text-yellow-400';
                                  } else {
                                    starClass = 'fill-gray-200 text-gray-200';
                                  }

                                  return (
                                    <Star
                                      key={star}
                                      className={`h-3.5 w-3.5 transition-colors ${starClass}`}
                                    />
                                  );
                                })}
                              </div>
                              <span className="text-sm font-medium text-foreground">
                                {product.rating > 0 ? product.rating.toFixed(1) : 'No rating'}
                              </span>
                              {product.reviews > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({product.reviews.toLocaleString()} reviews)
                                </span>
                              )}
                            </div>
                          )}

                          {/* No Rating Fallback */}
                          {product.rating === 0 && product.reviews === 0 && (
                            <div className="flex items-center gap-1 mb-3">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="h-3.5 w-3.5 fill-gray-200 text-gray-200"
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                No reviews yet
                              </span>
                            </div>
                          )}

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
                            {product.originalPrice &&
                              product.price &&
                              product.originalPrice > product.price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.originalPrice, product.currency)}
                                </span>
                              )}
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {product.features
                              .slice(0, 2)
                              .map((feature, index) => (
                                <Badge
                                  key={index}
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
                              : "View Details"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {hasMoreResults && (
                    <div className="text-center mt-8">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleLoadMoreResults}
                        disabled={loadingMore}
                        className="min-w-48"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading More...
                          </>
                        ) : (
                          `Load More Results (Page ${currentPage + 1} of ${Math.min(Math.ceil(totalResults/10), 10)})`
                        )}
                      </Button>
                    </div>
                  )}

                  {!hasMoreResults && filteredProducts.length > 0 && (
                    <div className="text-center mt-8">
                      <p className="text-muted-foreground">
                        {totalResults > filteredProducts.length
                          ? `Showing ${filteredProducts.length} of ${totalResults} results for "${query}". Amazon limits search results to the first ${Math.min(Math.ceil(totalResults/10), 10)} pages.`
                          : `You've reached the end of search results for "${query}"`
                        }
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* No Results State */}
              {!loading && filteredProducts.length === 0 && originalProducts.length > 0 && (
                <div className="text-center py-20">
                  <h3 className="text-lg font-semibold mb-2">
                    No products match your filters
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to see more results.
                  </p>
                  <Button onClick={() => setFilters({
                    priceRange: [0, 50000],
                    categories: [],
                    brands: [],
                    minRating: 0,
                    features: []
                  })}>
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* No Search Results State */}
              {!loading && filteredProducts.length === 0 && originalProducts.length === 0 && query && !error && (
                <div className="text-center py-20">
                  <h3 className="text-lg font-semibold mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any products matching "{query}".
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Try:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Checking your spelling</li>
                      <li>• Using more general terms</li>
                      <li>• Searching in a different category</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="text-center py-20">
                  <h3 className="text-lg font-semibold mb-2 text-red-500">
                    Search Error
                  </h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button
                    onClick={() => performSearch(query, category, searchIndex)}
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Initial State */}
              {!loading && !query && (
                <div className="text-center py-20">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Start searching
                  </h3>
                  <p className="text-muted-foreground">
                    Enter keywords above to search for Amazon products.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="fixed right-0 top-0 h-full w-80 bg-background overflow-y-auto">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchResults;